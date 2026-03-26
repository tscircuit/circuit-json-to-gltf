import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("back-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "back")
}, 30_000)
