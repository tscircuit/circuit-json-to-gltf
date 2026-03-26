import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("rightside-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "right_side")
}, 30_000)
