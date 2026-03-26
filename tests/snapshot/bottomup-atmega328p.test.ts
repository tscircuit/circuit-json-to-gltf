import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("bottomup-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "bottom_up")
}, 30_000)
