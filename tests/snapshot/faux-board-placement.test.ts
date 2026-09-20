import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getKeyedModelTriangles } from "../fixtures/keyed-cad-model"
import {
  fauxBoardPlacementCamera,
  fauxBoardPlacementCircuit,
} from "../fixtures/faux-board-placement"
import { renderGlbToPng } from "../renderGlbToPng"

test("a generated board stays beneath its component at nonzero PCB Y", async () => {
  const glb = await convertCircuitJsonToGltf(fauxBoardPlacementCircuit, {
    format: "glb",
    drawFauxBoard: true,
    boardTextureResolution: 512,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")

  // Final glTF is Y-up. The board spans 10x10 mm around (-3,0,-7),
  // with its top at Y=0.8; the component's native bottom must meet that top.
  const bounds = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).boundingBox
  expect(bounds.min.x).toBeCloseTo(-8, 5)
  expect(bounds.max.x).toBeCloseTo(2, 5)
  expect(bounds.min.y).toBeCloseTo(-0.8, 5)
  expect(bounds.min.z).toBeCloseTo(-12, 5)
  expect(bounds.max.z).toBeCloseTo(-2, 5)
  const component = boundsOfTriangles(getKeyedModelTriangles(glb))
  expect(component.min.y).toBeCloseTo(0.8, 5)
  expect(component.max.y).toBeCloseTo(3.8, 5)

  await expect(
    renderGlbToPng(glb, fauxBoardPlacementCircuit, fauxBoardPlacementCamera),
  ).toMatchPngSnapshot(import.meta.path)
})
