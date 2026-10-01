import { expect, test } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { geometryCircuit } from "../tests/fixtures/geometry-circuit"

test("STEP loads lazily in a browser worker with an explicit WASM asset URL", async ({
  page,
}) => {
  await page.goto("/")
  await page.route("**/geometry-test.wasm", (route) =>
    route.fulfill({
      path: "./node_modules/occt-import-js/dist/occt-import-js.wasm",
      contentType: "application/wasm",
    }),
  )
  const source = execFileSync(
    "bun",
    ["build", "./lib/geometry/index.ts", "--target=browser", "--minify"],
    {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    },
  )
  const circuitJson = geometryCircuit({
    model_obj_url: undefined,
    model_step_url: `data:application/step;base64,${readFileSync("./tests/assets/TO-92_Inline.step").toString("base64")}`,
  })
  const result = await page.evaluate(
    async ({ source, circuitJson }) => {
      const moduleUrl = URL.createObjectURL(
        new Blob([source], { type: "text/javascript" }),
      )
      const workerUrl = URL.createObjectURL(
        new Blob(
          [
            `
      onmessage = async ({data}) => {
        try {
          const fetchAsset = globalThis.fetch;
          globalThis.fetch = () => { throw new Error("Unexpected import-time fetch") };
          const {prepareBoardGeometry} = await import(${JSON.stringify(moduleUrl)});
          globalThis.fetch = fetchAsset;
          const result = await prepareBoardGeometry(data);
          postMessage({status:result.components[0].status,count:result.components[0].mesh.triangles.length});
        } catch(error) { postMessage({error:String(error)}) }
      };
    `,
          ],
          { type: "text/javascript" },
        ),
      )
      const worker = new Worker(workerUrl, { type: "module" })
      try {
        return await new Promise<{
          status?: string
          count?: number
          error?: string
        }>((resolve, reject) => {
          worker.onmessage = ({ data }) => resolve(data)
          worker.onerror = (event) => reject(new Error(event.message))
          worker.postMessage({
            circuitJson,
            pcbBoardId: "board",
            assetContext: {
              stepWasmUrl: new URL("/geometry-test.wasm", location.href).href,
            },
          })
        })
      } finally {
        worker.terminate()
        URL.revokeObjectURL(moduleUrl)
        URL.revokeObjectURL(workerUrl)
      }
    },
    { source, circuitJson },
  )
  expect(result.error).toBeUndefined()
  expect(result.status).toBe("available")
  expect(result.count).toBeGreaterThan(0)
})
