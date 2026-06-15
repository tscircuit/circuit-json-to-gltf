import { expect, test } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
/**
 * This test attempts to reproduce the scale of repro8 (~884 holes).
 * We create a grid of DIP8 chips to generate many plated holes.
 *
 * Target: ~880 holes = 110 DIP8 chips (8 holes each)
 * Grid: 11x10 = 110 chips
 *
 */
test("repro8-scale: board with ~880 plated holes", async () => {
  const circuit = new Circuit()
  // Create a grid of through-hole components
  // 11x10 grid = 110 chips × 8 holes = 880 plated holes (similar to Ray's Android board repro)
  const chips: any[] = []
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 11; col++) {
      chips.push(
        <chip
          key={`U${row * 11 + col + 1}`}
          name={`U${row * 11 + col + 1}`}
          footprint="dip8"
          pcbX={col * 12 - 60}
          pcbY={row * 12 - 54}
        />,
      )
    }
  }
  circuit.add(
    <board width="150mm" height="140mm">
      {chips}
    </board>,
  )
  const circuitJson = await circuit.getCircuitJson()
  // Count plated holes to verify test setup
  const platedHoleCount = circuitJson.filter(
    (item) => item.type === "pcb_plated_hole",
  ).length
  console.log(`Circuit has ${platedHoleCount} plated holes`)
  // Convert circuit to GLTF (GLB format for rendering)
  const startTime = Date.now()
  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 256,
    showBoundingBoxes: false,
  })
  const elapsed = Date.now() - startTime
  console.log(`Conversion took ${elapsed}ms`)
  // Ensure we got a valid GLB buffer
  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)
  // Render the GLB to PNG with camera position derived from circuit dimensions
  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
}, 100000)
