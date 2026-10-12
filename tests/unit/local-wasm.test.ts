import { expect, test } from "bun:test"
import { fileURLToPath } from "node:url"

test("supplied WASM renders board textures and parses STEP in a fresh realm", async () => {
  const child = Bun.spawn(
    [
      process.execPath,
      "test",
      fileURLToPath(new URL("../fixtures/local-wasm.ts", import.meta.url)),
    ],
    { stdout: "pipe", stderr: "pipe" },
  )
  const [status, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ])
  if (status !== 0) throw new Error(`${stdout}\n${stderr}`)
  expect(status).toBe(0)
})
