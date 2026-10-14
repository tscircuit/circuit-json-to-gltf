import { expect, test } from "bun:test"
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import tscircuitFont from "@tscircuit/alphabet/base64font"
import { renderGLTFToPNGFromGLB } from "poppygl"
import {
  accessorCubeCamera,
  cubeEncodings,
  exportAccessorCube,
} from "../fixtures/glb-accessor-cubes"

// Left column is frozen from 89013a1; right column always uses the current loader.
// Identical input cubes, PCB placement and camera expose both bugs without auto-fit.
test("repro15: interleaved and quantized GLB cubes reproduce issue #255", async () => {
  GlobalFonts.register(Buffer.from(tscircuitFont, "base64"), "AccessorRepro")
  const width = accessorCubeCamera.width
  const rowHeight = accessorCubeCamera.height + 45
  const canvas = createCanvas(width * 2, 95 + cubeEncodings.length * rowHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "#162a43"
  context.font = "24px AccessorRepro"
  context.fillText("GLB accessor decoding: 1 mm cube on a 10 mm PCB", 16, 32)
  context.font = "16px AccessorRepro"
  context.fillText(
    "Same geometry, placement and fixed camera; only the encoding changes.",
    16,
    60,
  )

  const exportedDimensions: number[][] = []
  for (const [row, encoding] of cubeEncodings.entries()) {
    const glb = await exportAccessorCube(encoding)
    const after = await renderGLTFToPNGFromGLB(glb, accessorCubeCamera)
    const before = await Bun.file(
      new URL(
        `../assets/glb-accessors-before/${encoding}.png`,
        import.meta.url,
      ),
    ).bytes()
    const y = 95 + row * rowHeight
    for (const [column, png] of [before, after].entries()) {
      const x = column * width
      context.fillStyle = column === 0 ? "#bb331c" : "#067647"
      context.font = "16px AccessorRepro"
      const label =
        encoding === "packed"
          ? "Packed FLOAT (control)"
          : encoding === "interleaved"
            ? "Interleaved FLOAT / stride 24"
            : "Normalized SHORT / stride 8"
      context.fillText(
        `${column === 0 ? "Before" : "Current"}: ${label}`,
        x + 12,
        y + 27,
      )
      context.drawImage(await loadImage(png), x, y + 45)
    }

    // Check the actual component mesh in the exported GLB, in scene Y-up/mm.
    // Pixel tolerance alone could miss a small, collapsed cube in the overview.
    const view = new DataView(glb)
    const json = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(glb, 20, view.getUint32(12, true)),
      ),
    )
    const primitive = json.meshes.at(-1).primitives[0]
    const position = json.accessors[primitive.attributes.POSITION]
    exportedDimensions.push(
      position.max.map((max: number, axis: number) => max - position.min[axis]),
    )
  }

  // Compare the image first so restoring the old decoder also produces a visual diff.
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
  // Pin the reported broken extents here; the stacked fix changes each to 1 mm.
  const brokenDimensions = [
    [1, 1, 1],
    [0, 1, 1],
    [32767, 32767, 32767],
  ]
  for (const [row, dimensions] of exportedDimensions.entries()) {
    expect(dimensions).toHaveLength(3)
    for (const [axis, dimension] of dimensions.entries()) {
      expect(dimension).toBeCloseTo(brokenDimensions[row]![axis]!, 5)
    }
  }
}, 60_000)
