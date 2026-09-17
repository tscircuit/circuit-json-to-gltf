import { expect, test } from "bun:test"
import { join } from "node:path"
import { rightHandCases } from "../fixtures/right-hand-model"

test.each([...rightHandCases])(
  "exported positive $axis rotation follows the right hand",
  async ({ axis }) => {
    const child = Bun.spawn(
      [
        process.execPath,
        "--preload",
        join(import.meta.dir, "../fixtures/right-hand-preload.ts"),
        join(import.meta.dir, "../fixtures/assert-right-hand-placement.ts"),
        axis,
      ],
      { stdout: "pipe", stderr: "pipe" },
    )
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ])
    if (exitCode !== 0)
      throw new Error(`Right-hand placement disagrees:\n${stdout}\n${stderr}`)
    expect(exitCode).toBe(0)
  },
  120_000,
)
