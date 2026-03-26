import { test } from "bun:test"
import { expectAtmegaPresetSnapshot } from "./atmega328p-snapshot-helpers"

test("front-atmega328p", async () => {
  await expectAtmegaPresetSnapshot(import.meta.path, "front")
}, 30_000)
