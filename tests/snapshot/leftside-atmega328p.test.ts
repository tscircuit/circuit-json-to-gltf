import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("leftside-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "left_side")
}, 30_000)
