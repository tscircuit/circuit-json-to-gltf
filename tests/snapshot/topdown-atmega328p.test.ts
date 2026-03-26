import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("topdown-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "top_down")
}, 30_000)
