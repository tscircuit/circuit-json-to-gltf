import { expect, test } from "bun:test"
import {
  footprinterRotationCases,
  renderFootprinterRotation,
} from "../fixtures/footprinter-xyz"

test.each(footprinterRotationCases)(
  "SOIC8 native-origin rotation: $name",
  async ({ name, rotation }) => {
    await expect(renderFootprinterRotation(rotation)).toMatchPngSnapshot(
      import.meta.path,
      `footprinter-xyz-${name}`,
    )
  },
)
