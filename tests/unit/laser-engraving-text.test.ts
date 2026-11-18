import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  convertCircuitJsonTo3D,
  type Box3D,
  type CadLaserEngravingTextRecord,
} from "../../lib"
import { convertCircuitJsonTo3D as convertBrowserScene } from "../../lib/browser"
import { createLaserEngravingTextBox } from "../../lib/converters/laser-engraving-text"

// Circuit world is right-handed, +Z up, mm. Scene3D is +Y up, so a circuit
// point (x, y, z) is the scene point (x, z, y).
const engraving: CadLaserEngravingTextRecord = {
  type: "cad_laser_engraving_text",
  cad_laser_engraving_text_id: "engraving_1",
  source_component_id: "source_1",
  text: "L",
  font_size: 10,
  anchor_position: { x: 10, y: 5, z: 8 },
  anchor_alignment: "bottom_left",
  normal_direction: { x: 0, y: 0, z: 1 },
  x_axis_direction: { x: 1, y: 0, z: 0 },
}

/** World-space scene vertices, bounds, and area-weighted centroid of a mark. */
const measure = (box: Box3D) => {
  const triangles = box.mesh!.triangles.map((triangle) =>
    triangle.vertices.map((v) => ({
      x: v.x + box.center.x,
      y: v.y + box.center.y,
      z: v.z + box.center.z,
    })),
  )
  const points = triangles.flat()
  const range = (axis: "x" | "y" | "z") => [
    Math.min(...points.map((p) => p[axis])),
    Math.max(...points.map((p) => p[axis])),
  ]
  let area = 0
  const centroid = { x: 0, y: 0, z: 0 }
  for (const [a, b, c] of triangles) {
    const u = { x: b!.x - a!.x, y: b!.y - a!.y, z: b!.z - a!.z }
    const v = { x: c!.x - a!.x, y: c!.y - a!.y, z: c!.z - a!.z }
    const triangleArea =
      Math.hypot(
        u.y * v.z - u.z * v.y,
        u.z * v.x - u.x * v.z,
        u.x * v.y - u.y * v.x,
      ) / 2
    area += triangleArea
    for (const axis of ["x", "y", "z"] as const)
      centroid[axis] += (triangleArea * (a![axis] + b![axis] + c![axis])) / 3
  }
  for (const axis of ["x", "y", "z"] as const) centroid[axis] /= area
  return { x: range("x"), y: range("y"), z: range("z"), centroid, area }
}

test("engraved text on a top surface starts at its anchor and is not mirrored", async () => {
  const circuit = [engraving] as unknown as CircuitJson
  for (const convert of [convertCircuitJsonTo3D, convertBrowserScene]) {
    const scene = await convert(circuit)
    expect(scene.boxes).toHaveLength(1)
    const box = scene.boxes[0]!
    const mark = measure(box)

    // bottom_left: the strokes begin at the anchor and extend toward circuit
    // +X and +Y (scene +X and +Z), about a cap height tall.
    expect(mark.x[0]).toBeCloseTo(10, 5)
    expect(mark.z[0]).toBeCloseTo(5, 5)
    expect(mark.x[1]).toBeGreaterThan(13)
    expect(mark.x[1]).toBeLessThan(17)
    expect(mark.z[1]).toBeGreaterThan(11)
    expect(mark.z[1]).toBeLessThan(14)
    // Flat, just above the surface at circuit Z=8.
    expect(mark.y[0]).toBeCloseTo(mark.y[1]!, 9)
    expect(mark.y[0]).toBeGreaterThan(8)
    expect(mark.y[0]).toBeLessThan(8.1)

    // An "L" has its stem on the left and its foot at the bottom, so its ink
    // sits left of and below the middle of its bounds. A mirror in either
    // direction moves the centroid to the other side.
    expect(mark.centroid.x).toBeLessThan((mark.x[0]! + mark.x[1]!) / 2 - 0.5)
    expect(mark.centroid.z).toBeLessThan((mark.z[0]! + mark.z[1]!) / 2 - 0.5)

    // Outward winding: every triangle faces up, agreeing with its normal.
    for (const triangle of box.mesh!.triangles) {
      const [a, b, c] = triangle.vertices
      const crossY = (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z)
      expect(crossY).toBeGreaterThan(0)
      expect(triangle.normal.y).toBeCloseTo(1)
    }
  }
})

test("engraved text follows the record's frame on walls and when rotated", () => {
  // Wall facing circuit -Y, reading toward +X: up is normal_direction cross
  // x_axis_direction = +Z.
  const wall = measure(
    createLaserEngravingTextBox({
      ...engraving,
      anchor_position: { x: 10, y: -20, z: 3 },
      normal_direction: { x: 0, y: -1, z: 0 },
    })!,
  )
  expect(wall.x[0]).toBeCloseTo(10, 5)
  expect(wall.y[0]).toBeCloseTo(3, 5) // scene Y is circuit Z
  expect(wall.y[1]).toBeGreaterThan(9)
  expect(wall.z[0]).toBeCloseTo(wall.z[1]!, 9)
  expect(wall.z[0]).toBeLessThan(-20) // lifted off the wall, toward -Y
  expect(wall.z[0]).toBeGreaterThan(-20.1)
  expect(wall.centroid.x).toBeLessThan((wall.x[0]! + wall.x[1]!) / 2 - 0.5)
  expect(wall.centroid.y).toBeLessThan((wall.y[0]! + wall.y[1]!) / 2 - 0.5)

  // Top surface, turned 90 degrees clockwise seen from above: reads toward
  // circuit -Y, so its up is circuit +X.
  const turned = measure(
    createLaserEngravingTextBox({
      ...engraving,
      x_axis_direction: { x: 0, y: -1, z: 0 },
    })!,
  )
  expect(turned.z[1]).toBeCloseTo(5, 5) // begins at the anchor's circuit Y...
  expect(turned.z[0]).toBeLessThan(2) // ...and runs toward -Y
  expect(turned.x[0]).toBeCloseTo(10, 5)
  expect(turned.x[1]).toBeGreaterThan(16) // cap height now along +X
  // Stem toward the reading start (+Y side), foot toward the text's bottom (-X).
  expect(turned.centroid.z).toBeGreaterThan(
    (turned.z[0]! + turned.z[1]!) / 2 + 0.5,
  )
  expect(turned.centroid.x).toBeLessThan(
    (turned.x[0]! + turned.x[1]!) / 2 - 0.5,
  )
})

test("anchor alignment places the engraved strokes' bounds around the anchor", () => {
  const at = (
    anchor_alignment: CadLaserEngravingTextRecord["anchor_alignment"],
  ) =>
    measure(
      createLaserEngravingTextBox({
        ...engraving,
        text: "REV B",
        anchor_alignment,
      })!,
    )
  const center = at("center")
  expect((center.x[0]! + center.x[1]!) / 2).toBeCloseTo(10, 5)
  expect((center.z[0]! + center.z[1]!) / 2).toBeCloseTo(5, 5)
  const topRight = at("top_right")
  expect(topRight.x[1]).toBeCloseTo(10, 5)
  expect(topRight.z[1]).toBeCloseTo(5, 5)
  const bottomCenter = at("bottom_center")
  expect((bottomCenter.x[0]! + bottomCenter.x[1]!) / 2).toBeCloseTo(10, 5)
  expect(bottomCenter.z[0]).toBeCloseTo(5, 5)
  // Alignment moves the mark; it does not change its size. Five monospaced
  // characters at font size 10 are about 30 mm of ink wide.
  expect(center.x[1]! - center.x[0]!).toBeCloseTo(
    topRight.x[1]! - topRight.x[0]!,
    6,
  )
  expect(center.x[1]! - center.x[0]!).toBeGreaterThan(28)
  expect(center.x[1]! - center.x[0]!).toBeLessThan(36)
})

test("the mark uses a stated color, or one that contrasts with its part", async () => {
  const withPart = (partColor: string | undefined, fields = {}) =>
    [
      {
        type: "cad_component",
        cad_component_id: "cad_1",
        source_component_id: "source_1",
        position: { x: 0, y: 0, z: 0 },
        ...(partColor ? { color: partColor } : {}),
        model_jscad: { type: "cuboid", size: [40, 40, 8], center: [0, 0, 4] },
      },
      { ...engraving, cad_component_id: "cad_1", ...fields },
    ] as unknown as CircuitJson
  const markColor = async (circuit: CircuitJson) =>
    (await convertCircuitJsonTo3D(circuit)).boxes.find((box) =>
      box.label?.includes("engraving"),
    )!.color

  const luminance = (hex: string) =>
    [1, 3, 5].reduce(
      (sum, i, channel) =>
        sum +
        [0.2126, 0.7152, 0.0722][channel]! * parseInt(hex.slice(i, i + 2), 16),
      0,
    ) / 255

  expect(await markColor(withPart("#101820", { color: "#e8c15a" }))).toBe(
    "#e8c15a",
  )
  // Dark part: a clearly paler mark. Pale part: a clearly darker one.
  const onDark = (await markColor(withPart("#101820"))) as string
  expect(luminance(onDark) - luminance("#101820")).toBeGreaterThan(0.4)
  const onPale = (await markColor(withPart("#f0e8d8"))) as string
  expect(luminance("#f0e8d8") - luminance(onPale)).toBeGreaterThan(0.4)
  // No part color to contrast with: a dark neutral.
  expect(await markColor(withPart(undefined))).toBe("#2b2b2b")
})

test("text with nothing to engrave adds no geometry", async () => {
  expect(createLaserEngravingTextBox({ ...engraving, text: "  " })).toBe(
    undefined,
  )
  const scene = await convertCircuitJsonTo3D([
    { ...engraving, text: " " },
  ] as unknown as CircuitJson)
  expect(scene.boxes).toHaveLength(0)
})
