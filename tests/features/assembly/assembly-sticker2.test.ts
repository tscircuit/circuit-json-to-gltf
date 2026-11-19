import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../../lib"
import type { Point3 } from "../../../lib/types"
import { createNema17EnclosureWithSticker } from "../../fixtures/nema17-enclosure-sticker"

/** Where each corner of the artwork lands, as circuit-world points in mm
 * (+Z up), keyed by its glTF texture coordinate: "0,0" is the image's top-left.
 * Scene3D is +Y up, so circuit Y is read from scene Z and circuit Z from scene Y.
 */
async function artworkCorners(
  sticker: Parameters<typeof createNema17EnclosureWithSticker>[0],
) {
  const scene = await convertCircuitJsonTo3D(
    await createNema17EnclosureWithSticker(sticker),
    { renderBoardTextures: false },
  )
  const box = scene.boxes.find((candidate) => candidate.label === "LABEL")!
  expect(box.texture?.top).toStartWith("data:image/png;base64,")
  const corners: Record<string, Point3> = {}
  for (const triangle of box.mesh!.triangles) {
    if (!triangle.uvs) continue
    triangle.uvs.forEach((uv, index) => {
      const vertex = triangle.vertices[index]!
      corners[`${uv.u},${uv.v}`] = {
        x: vertex.x + box.center.x,
        y: vertex.z + box.center.z,
        z: vertex.y + box.center.y,
      }
    })
  }
  return corners
}

const expectPoint = (actual: Point3 | undefined, expected: Point3) => {
  expect(actual!.x).toBeCloseTo(expected.x, 6)
  expect(actual!.y).toBeCloseTo(expected.y, 6)
  expect(actual!.z).toBeCloseTo(expected.z, 6)
}

test("sticker artwork lands on its frame: left to right along x_axis_direction, top toward normal_direction × x_axis_direction", async () => {
  // Off-center on the lid's top, with the default frame.
  const top = await artworkCorners({
    center: { x: 3, y: -2, z: 12 },
    width: 20,
    height: 8,
    thickness: 0.2,
  })
  expectPoint(top["0,0"], { x: -7, y: 2, z: 12.2 })
  expectPoint(top["1,0"], { x: 13, y: 2, z: 12.2 })
  expectPoint(top["0,1"], { x: -7, y: -6, z: 12.2 })
  expectPoint(top["1,1"], { x: 13, y: -6, z: 12.2 })

  // Turned a quarter turn counterclockwise on that surface.
  const turned = await artworkCorners({
    center: { x: 3, y: -2, z: 12 },
    x_axis_direction: { x: 0, y: 1, z: 0 },
    width: 20,
    height: 8,
    thickness: 0.2,
  })
  expectPoint(turned["0,0"], { x: -1, y: -12, z: 12.2 })
  expectPoint(turned["1,0"], { x: -1, y: 8, z: 12.2 })
  expectPoint(turned["0,1"], { x: 7, y: -12, z: 12.2 })

  // On the -Y wall, upright: reads along +X with its top toward +Z.
  const wall = await artworkCorners({
    center: { x: 3, y: -22.75, z: 6 },
    normal_direction: { x: 0, y: -1, z: 0 },
    x_axis_direction: { x: 1, y: 0, z: 0 },
    width: 20,
    height: 8,
    thickness: 0.2,
  })
  expectPoint(wall["0,0"], { x: -7, y: -22.95, z: 10 })
  expectPoint(wall["1,0"], { x: 13, y: -22.95, z: 10 })
  expectPoint(wall["0,1"], { x: -7, y: -22.95, z: 2 })
})
