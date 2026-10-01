import { expect, test } from "@playwright/test"
import { execFileSync } from "node:child_process"
import { geometryCircuit } from "../tests/fixtures/geometry-circuit"

test("geometry bundles for a DOM-free browser worker without fetching renderers, textures or STEP WASM", async ({
  page,
}) => {
  await page.goto("/")
  const source = execFileSync(
    "bun",
    ["build", "./lib/geometry/index.ts", "--target=browser", "--minify"],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  )
  expect(source).not.toContain("renderBoardTextures")
  expect(source).not.toContain("GLTFBuilder")
  const result = await page.evaluate(
    async ({ source, circuitJson }) => {
      const moduleUrl = URL.createObjectURL(
        new Blob([source], { type: "text/javascript" }),
      )
      const workerUrl = URL.createObjectURL(
        new Blob(
          [
            `
        globalThis.fetch = async () => { throw new Error("Unexpected import-time fetch") };
        onmessage = async ({data}) => {
          try {
            const {prepareBoardGeometry} = await import(${JSON.stringify(moduleUrl)});
            const result = await prepareBoardGeometry(data);
            postMessage({bounds:result.board.bounds, count:result.components[0].mesh.triangles.length, hasDocument:typeof document !== "undefined"});
          } catch(error) { postMessage({error:String(error)}) }
        };
      `,
          ],
          { type: "text/javascript" },
        ),
      )
      const worker = new Worker(workerUrl, { type: "module" })
      try {
        return await new Promise((resolve, reject) => {
          worker.onmessage = ({ data }) => resolve(data)
          worker.onerror = (event) => reject(new Error(event.message))
          worker.postMessage({ circuitJson, pcbBoardId: "board" })
        })
      } finally {
        worker.terminate()
        URL.revokeObjectURL(moduleUrl)
        URL.revokeObjectURL(workerUrl)
      }
    },
    {
      source,
      circuitJson: geometryCircuit({
        model_obj_url: undefined,
        model_jscad: { type: "cuboid", size: [2, 3, 4] },
      }),
    },
  )
  expect(result).toEqual({
    bounds: { min: { x: -10, y: -8, z: -0.8 }, max: { x: 10, y: 8, z: 0.8 } },
    count: 12,
    hasDocument: false,
  })
})
