import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../../lib"
import { createNema17EnclosureWithSticker } from "../../fixtures/nema17-enclosure-sticker"

const WIDTH = 20
const HEIGHT = 8
const CENTER = { x: 3, y: -2, z: 12 }

/** The printed face of a 20 × 8 mm sticker with the default frame, as
 * triangles in sticker-local mm: X along x_axis_direction, Y toward the
 * artwork's top, origin at the sticker's center. Scene3D is +Y up, so circuit
 * Y is read from scene Z.
 */
async function printedFace(corner_radius: number | undefined) {
  const scene = await convertCircuitJsonTo3D(
    await createNema17EnclosureWithSticker({
      center: CENTER,
      width: WIDTH,
      height: HEIGHT,
      thickness: 0.2,
      corner_radius,
    }),
    { renderBoardTextures: false },
  )
  const box = scene.boxes.find((candidate) => candidate.label === "LABEL")!
  for (const triangle of box.mesh!.triangles)
    for (const axis of ["x", "y", "z"] as const)
      expect(Number.isFinite(triangle.normal[axis])).toBe(true)
  return box
    .mesh!.triangles.filter((triangle) => triangle.uvs)
    .map((triangle) =>
      triangle.vertices.map((vertex, index) => ({
        x: vertex.x + box.center.x - CENTER.x,
        y: vertex.z + box.center.z - CENTER.y,
        uv: triangle.uvs![index]!,
      })),
    )
}

const area = (face: Awaited<ReturnType<typeof printedFace>>) =>
  face.reduce((sum, [a, b, c]) => {
    const twice = (b!.x - a!.x) * (c!.y - a!.y) - (c!.x - a!.x) * (b!.y - a!.y)
    expect(Math.abs(twice)).toBeGreaterThan(1e-9)
    return sum + Math.abs(twice) / 2
  }, 0)

test("corner_radius rounds the sticker's outline and cuts the artwork to it", async () => {
  const [w, h, r] = [WIDTH / 2, HEIGHT / 2, 1.5]
  const face = await printedFace(r)
  const vertices = face.flat()

  // The outline still touches all four sides.
  expect(Math.min(...vertices.map((v) => v.x))).toBeCloseTo(-w, 9)
  expect(Math.max(...vertices.map((v) => v.x))).toBeCloseTo(w, 9)
  expect(Math.min(...vertices.map((v) => v.y))).toBeCloseTo(-h, 9)
  expect(Math.max(...vertices.map((v) => v.y))).toBeCloseTo(h, 9)

  for (const vertex of vertices) {
    // Inside a corner's square, a vertex stays within that corner's arc.
    const [dx, dy] = [
      Math.abs(vertex.x) - (w - r),
      Math.abs(vertex.y) - (h - r),
    ]
    if (dx > 0 && dy > 0)
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(r + 1e-9)
    // The artwork is not rescaled: texture coordinates follow position, with
    // (0, 0) at the image's top-left.
    expect(vertex.uv.u).toBeCloseTo((vertex.x + w) / WIDTH, 9)
    expect(vertex.uv.v).toBeCloseTo((h - vertex.y) / HEIGHT, 9)
  }
  // Each sharp corner is gone; the closest the outline comes is the arc's
  // midpoint.
  for (const [cx, cy] of [
    [-w, -h],
    [w, -h],
    [w, h],
    [-w, h],
  ] as const) {
    const nearest = Math.min(
      ...vertices.map((v) => Math.hypot(v.x - cx, v.y - cy)),
    )
    expect(nearest).toBeCloseTo(r * (Math.SQRT2 - 1), 9)
  }
  // Arcs are drawn as short chords, so the area falls just short of exact.
  const roundedArea = WIDTH * HEIGHT - (4 - Math.PI) * r * r
  expect(area(face)).toBeLessThan(roundedArea)
  expect(area(face)).toBeGreaterThan(roundedArea * 0.995)

  // Without a radius, or with zero, the corners stay square.
  for (const square of [undefined, 0])
    expect(area(await printedFace(square))).toBeCloseTo(WIDTH * HEIGHT, 9)

  // Half the shorter side makes stadium ends, and a larger radius is clamped
  // to that. Neither leaves a degenerate triangle.
  const stadiumArea = WIDTH * HEIGHT - (4 - Math.PI) * h * h
  for (const radius of [h, 100]) {
    const stadium = await printedFace(radius)
    expect(area(stadium)).toBeLessThan(stadiumArea)
    expect(area(stadium)).toBeGreaterThan(stadiumArea * 0.995)
  }
})
