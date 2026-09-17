import { expect, test } from "bun:test"
import { join } from "node:path"
import { rightHandCases } from "../fixtures/right-hand-model"

test.each([...rightHandCases])(
  "exported +90 $axis rotation has positive signed right-grip displacement",
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
      throw new Error(
        `Right-grip displacement disagrees:\n${stdout}\n${stderr}`,
      )
    expect(exitCode).toBe(0)
  },
  120_000,
)
