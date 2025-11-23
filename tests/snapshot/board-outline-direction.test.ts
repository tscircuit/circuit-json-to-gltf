import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"

test("board-outline-direction-snapshot", async () => {
  // Test for issue #84: Board outline direction was inverted in 3D view
  // Board has asymmetric outline with semicircular cutout at top
  // and mounting holes at bottom to verify correct orientation
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 40,
      height: 30,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4" as const,
      // Asymmetric outline: semicircular cutout at top
      outline: (() => {
        const points = []
        points.push({ x: -20, y: -15 })
        points.push({ x: -20, y: 15 })
        points.push({ x: -8, y: 15 })
        // Semicircular cutout at top (radius = 8mm)
        for (let i = 0; i <= 8; i++) {
          const angle = Math.PI * (i / 8)
          points.push({
            x: -8 * Math.cos(angle),
            y: 15 - 8 * Math.sin(angle),
          })
        }
        points.push({ x: 8, y: 15 })
        points.push({ x: 20, y: 15 })
        points.push({ x: 20, y: -15 })
        return points
      })(),
    },
    // Mounting holes at bottom (opposite from cutout)
    {
      type: "pcb_hole",
      pcb_hole_id: "hole1",
      x: -10,
      y: -10,
      hole_diameter: 3,
      hole_shape: "circle" as const,
    },
    {
      type: "pcb_hole",
      pcb_hole_id: "hole2",
      x: 10,
      y: -10,
      hole_diameter: 3,
      hole_shape: "circle" as const,
    },
  ]

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
