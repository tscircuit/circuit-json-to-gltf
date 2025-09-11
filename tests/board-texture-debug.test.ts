import { test, expect } from "bun:test"
import { readFileSync } from "fs"
import { join } from "path"
import {
  renderBoardTextures,
  renderBoardLayer,
} from "../lib/converters/board-renderer"
import { convertCircuitJsonTo3D } from "../lib/converters/circuit-to-3d"
import type { CircuitJson } from "circuit-json"

// Load test circuit data
const circuitPath = join(
  import.meta.dir,
  "../site/assets/usb-c-flashlight.json",
)
const circuitData = JSON.parse(
  readFileSync(circuitPath, "utf-8"),
) as CircuitJson

test("board texture generation pipeline", async () => {
  console.log("Testing board texture generation...")

  // Test 1: Check if we can render board textures
  console.log("Step 1: Testing renderBoardTextures...")
  try {
    const textures = await renderBoardTextures(circuitData, 256)
    console.log("✅ renderBoardTextures completed")
    console.log("Top texture length:", textures.top.length)
    console.log("Bottom texture length:", textures.bottom.length)
    console.log("Top texture preview:", textures.top.slice(0, 100))

    expect(textures.top).toMatch(/^data:image\/png;base64,/)
    expect(textures.bottom).toMatch(/^data:image\/png;base64,/)
    expect(textures.top.length).toBeGreaterThan(100)
    expect(textures.bottom.length).toBeGreaterThan(100)
  } catch (error) {
    console.error("❌ renderBoardTextures failed:", error)
    throw error
  }

  // Test 2: Test individual layer rendering
  console.log("\nStep 2: Testing individual layer rendering...")
  try {
    const topLayer = await renderBoardLayer(circuitData, {
      layer: "top",
      resolution: 256,
    })
    console.log("✅ Top layer rendered, length:", topLayer.length)

    const bottomLayer = await renderBoardLayer(circuitData, {
      layer: "bottom",
      resolution: 256,
    })
    console.log("✅ Bottom layer rendered, length:", bottomLayer.length)

    expect(topLayer).toMatch(/^data:image\/png;base64,/)
    expect(bottomLayer).toMatch(/^data:image\/png;base64,/)
  } catch (error) {
    console.error("❌ Individual layer rendering failed:", error)
    throw error
  }

  // Test 3: Test full 3D conversion with textures
  console.log("\nStep 3: Testing full 3D conversion with textures...")
  try {
    const scene = await convertCircuitJsonTo3D(circuitData, {
      renderBoardTextures: true,
      textureResolution: 256,
    })

    console.log("✅ 3D conversion completed")
    console.log("Number of boxes:", scene.boxes.length)

    // Find the PCB board box (should be first)
    const boardBox = scene.boxes[0]!
    console.log("Board box center:", boardBox.center)
    console.log("Board box size:", boardBox.size)
    console.log("Board box has texture:", !!boardBox.texture)

    if (boardBox.texture) {
      console.log("Texture top length:", boardBox.texture.top?.length || "none")
      console.log(
        "Texture bottom length:",
        boardBox.texture.bottom?.length || "none",
      )
    } else {
      console.error("❌ Board box has no texture!")
    }

    expect(scene.boxes.length).toBeGreaterThan(0)
    expect(boardBox.texture).toBeDefined()
    expect(boardBox.texture?.top).toMatch(/^data:image\/png;base64,/)
    expect(boardBox.texture?.bottom).toMatch(/^data:image\/png;base64,/)
  } catch (error) {
    console.error("❌ 3D conversion failed:", error)
    throw error
  }
})

test("WASM initialization", async () => {
  console.log("Testing WASM initialization...")

  try {
    // Import the WASM utility directly
    const { svgToPngDataUrl } = await import("../lib/utils/svg-to-png-browser")

    // Test with a simple SVG
    const testSvg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" fill="red"/>
      </svg>
    `

    console.log("Converting test SVG to PNG...")
    const pngDataUrl = await svgToPngDataUrl(testSvg, { width: 100 })

    console.log("✅ WASM conversion successful")
    console.log("PNG data URL length:", pngDataUrl.length)
    console.log("PNG data URL preview:", pngDataUrl.slice(0, 50))

    expect(pngDataUrl).toMatch(/^data:image\/png;base64,/)
    expect(pngDataUrl.length).toBeGreaterThan(100)
  } catch (error) {
    console.error("❌ WASM initialization failed:", error)
    throw error
  }
})

test("circuit data analysis", () => {
  console.log("Analyzing circuit data...")

  // Count different types of elements
  const elementCounts = circuitData.reduce(
    (acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  console.log("Circuit elements:", elementCounts)

  // Check for essential PCB elements
  expect(elementCounts.pcb_board).toBeGreaterThan(0)
  expect(elementCounts.pcb_component).toBeGreaterThan(0)

  if (elementCounts.pcb_trace) {
    console.log(`✅ Found ${elementCounts.pcb_trace} PCB traces`)
  } else {
    console.log("⚠️  No PCB traces found")
  }

  if (elementCounts.pcb_via) {
    console.log(`✅ Found ${elementCounts.pcb_via} PCB vias`)
  } else {
    console.log("⚠️  No PCB vias found")
  }
})
