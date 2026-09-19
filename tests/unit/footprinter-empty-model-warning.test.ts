import { expect, test } from "bun:test"
import {
  clearFootprinterCache,
  loadFootprinterModel,
} from "../../lib/loaders/footprinter"

const captureWarnings = async (run: () => Promise<unknown>) => {
  const warnings: string[] = []
  const original = console.warn
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map(String).join(" "))
  }
  try {
    await run()
  } finally {
    console.warn = original
  }
  return warnings
}

/**
 * A footprint jscad-electronics has no body for returns an empty model rather
 * than throwing, and `circuit-to-3d` drops such a component from the scene
 * entirely. Silent on both sides, the part is simply absent from the render
 * with nothing to search for -- which is how a board lost 26 of its 36 passives
 * without a single line of output.
 */
test("an empty generated model says so", async () => {
  clearFootprinterCache()

  const warnings = await captureWarnings(() =>
    loadFootprinterModel("res_p0.8656mm_pw0.5657mm_ph0.54mm"),
  )

  expect(warnings).toHaveLength(1)
  expect(warnings[0]).toContain("res_p0.8656mm_pw0.5657mm_ph0.54mm")
  expect(warnings[0]).toContain("3D scene")
})

/**
 * A board typically repeats a passive footprint dozens of times. One line per
 * footprint is a diagnostic; one per component is noise that gets filtered out.
 */
test("a repeated footprint warns once, not once per component", async () => {
  clearFootprinterCache()

  const warnings = await captureWarnings(async () => {
    await Promise.all(
      Array.from({ length: 5 }, () =>
        loadFootprinterModel("res_p0.8656mm_pw0.5657mm_ph0.54mm"),
      ),
    )
  })

  expect(warnings).toHaveLength(1)
})

test("a footprint that does render stays quiet", async () => {
  clearFootprinterCache()

  const warnings = await captureWarnings(() => loadFootprinterModel("0402"))

  expect(warnings).toEqual([])
})
