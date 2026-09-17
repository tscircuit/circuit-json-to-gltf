import { expect, test } from "bun:test"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { rightHandCases } from "../fixtures/right-hand-model"

test.each([...rightHandCases])(
  "right-hand grip native footprinter rotation: $name",
  async ({ name, axis }) => {
    const directory = await mkdtemp(join(tmpdir(), "footprinter-hand-"))
    const output = join(directory, `${name}.png`)
    try {
      // Bun module mocks cannot be reliably undone for unrelated imports.
      // Only the subprocess loads this narrowly-scoped generator replacement.
      const child = Bun.spawn(
        [
          process.execPath,
          "--preload",
          join(import.meta.dir, "../fixtures/right-hand-preload.ts"),
          join(import.meta.dir, "../fixtures/render-right-hand.ts"),
          axis,
          output,
        ],
        { stdout: "pipe", stderr: "pipe" },
      )
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
        child.exited,
      ])
      if (exitCode !== 0)
        throw new Error(`Hand export failed:\n${stdout}\n${stderr}`)
      await expect(await readFile(output)).toMatchPngSnapshot(
        import.meta.path,
        name,
      )
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  },
  120_000,
)
