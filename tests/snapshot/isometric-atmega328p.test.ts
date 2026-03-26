import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("isometric-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "isometric", false)
}, 30_000)
