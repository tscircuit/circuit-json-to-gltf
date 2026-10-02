import { expect, test } from "bun:test"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  type Scene3D,
} from "../../lib"
import { convertCircuitJsonTo3D as browserConvert } from "../../lib/browser"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { addCadMarker, createTwoArmFlex } from "../fixtures/two-arm-flex"

/** Compare emitted Scene3D points and normals (+Y up, mm), rather than copying
 * fold matrices. This catches a second fold of already folded CAD meshes.
 */
function expectSameGeometry(actual: Scene3D, expected: Scene3D) {
  expect(actual.boxes.map((box) => box.label)).toEqual(
    expected.boxes.map((box) => box.label),
  )
  for (const [index, box] of expected.boxes.entries()) {
    const other = actual.boxes[index]!
    for (const axis of ["x", "y", "z"] as const)
      expect(other.center[axis]).toBeCloseTo(box.center[axis], 7)
    expect(other.mesh?.triangles.length).toBe(box.mesh?.triangles.length)
    for (const [triangleIndex, triangle] of box.mesh!.triangles.entries()) {
      const otherTriangle = other.mesh!.triangles[triangleIndex]!
      for (const axis of ["x", "y", "z"] as const) {
        expect(otherTriangle.normal[axis]).toBeCloseTo(triangle.normal[axis], 6)
        for (let vertex = 0; vertex < 3; vertex++)
          expect(otherTriangle.vertices[vertex]![axis]).toBeCloseTo(
            triangle.vertices[vertex]![axis],
            6,
          )
      }
    }
  }
}

test("independent and nested perpendicular bends export the same pose regardless of order, CAD fold state or board translation", async () => {
  for (const rightArmBendSide of ["right", "left"] as const)
    for (const boardCenter of [
      { x: 0, y: 0 },
      { x: 100, y: -70 },
    ]) {
      const input = createTwoArmFlex({ boardCenter, rightArmBendSide })
      addCadMarker(input, "R0", {
        x: boardCenter.x - 10,
        y: boardCenter.y - 5,
      })
      // Stiffener coordinates are board-local XY (+Z up), including on a
      // translated board. These rigid references ride with each arm's CAD.
      for (const [name, center] of [
        ["upper", { x: 0, y: 25 }],
        ["right", { x: 35, y: 0 }],
      ] as const)
        input.push({
          type: "pcb_stiffener",
          pcb_stiffener_id: name,
          pcb_board_id: "flex_board",
          shape: "rect",
          center,
          width: 1.5,
          height: 0.75,
          layer: "bottom",
          material: "polyimide",
          thickness: 0.2,
        })
      const reversedBends = input.filter((e) => e.type === "pcb_bend").reverse()
      let bendIndex = 0
      const reordered = input.map((e) =>
        e.type === "pcb_bend" ? reversedBends[bendIndex++]! : e,
      )
      const preFolded = transformCircuitJsonCadComponents(input, {
        foldPcbs: true,
      })
      const before = JSON.stringify({ input, reordered, preFolded })
      const options = { renderBoardTextures: false }
      const flat = await convertCircuitJsonTo3D(input, {
        ...options,
        foldPcbs: false,
      })
      const folded = await convertCircuitJsonTo3D(input, {
        ...options,
        foldPcbs: true,
      })
      const independent = rightArmBendSide === "right"
      const centers = Object.fromEntries(
        folded.boxes.map((box) => [box.label, box.center]),
      )
      // A 90-degree radius-1 strip develops over pi/2 mm. Its distal mount,
      // 5 mm past the line, rises 5 + 1 - pi/4 mm. The 0.33-mm CAD offset
      // becomes a horizontal offset when that arm is vertical.
      const armHeight = 6 - Math.PI / 4
      const upperY = 21 - Math.PI / 4 - 0.33
      for (const [label, expected] of [
        [
          "R1",
          independent
            ? { x: 0, y: armHeight, z: upperY }
            : { x: 35, y: 31 - Math.PI / 4, z: upperY },
        ],
        [
          "R2",
          independent
            ? { x: 31 - Math.PI / 4 - 0.33, y: armHeight, z: 0 }
            : { x: 35, y: 0.33, z: 0 },
        ],
        [
          "R0",
          independent
            ? { x: -10, y: 0.33, z: -5 }
            : { x: 29 + Math.PI / 4 + 0.33, y: 41 - Math.PI / 4, z: -5 },
        ],
      ] as const) {
        expect(centers[label]!.x).toBeCloseTo(boardCenter.x + expected.x, 7)
        expect(centers[label]!.y).toBeCloseTo(expected.y, 7)
        expect(centers[label]!.z).toBeCloseTo(boardCenter.y + expected.z, 7)
      }
      // The independent base corner stays flat. In the nested screenshot
      // arrangement, the parent carries that same corner onto the vertical body.
      const corner = independent
        ? { x: -20, y: 0.06, z: -10 }
        : { x: 29 + Math.PI / 4 + 0.06, y: 51 - Math.PI / 4, z: -10 }
      expect(
        folded.boxes[0]!.mesh!.triangles.some((triangle) =>
          triangle.vertices.some((p) =>
            (Object.keys(corner) as (keyof typeof corner)[]).every(
              (axis) => Math.abs(p[axis] - corner[axis]) < 1e-6,
            ),
          ),
        ),
      ).toBe(true)
      const upperBacking = folded.boxes.find((box) => box.label === "upper")!
      const top = folded.boxes[0]!.mesh!.triangles.filter(
        (triangle) => triangle.pcbFace === "top",
      )
      // Top texture identity survives rotation around both bend axes. The
      // original board-local UVs still address developed material, not the
      // newly vertical face's projected dimensions.
      expect(top.some((triangle) => Math.abs(triangle.normal.x) > 0.99)).toBe(
        true,
      )
      expect(top.some((triangle) => Math.abs(triangle.normal.z) > 0.99)).toBe(
        true,
      )
      for (const triangle of top) expect(triangle.uvs).toHaveLength(3)
      expect(upperBacking.mesh!.boundingBox.max.y).toBeGreaterThan(
        independent ? 5 : 30,
      )
      const rightBacking = folded.boxes.find((box) => box.label === "right")!
      if (independent)
        expect(rightBacking.mesh!.boundingBox.max.y).toBeGreaterThan(5)
      else
        expect(rightBacking).toEqual(
          flat.boxes.find((box) => box.label === "right")!,
        )

      expectSameGeometry(
        await convertCircuitJsonTo3D(reordered, { ...options, foldPcbs: true }),
        folded,
      )
      for (const [foldPcbs, expected] of [
        [false, flat],
        [true, folded],
      ] as const)
        expectSameGeometry(
          await convertCircuitJsonTo3D(preFolded, { ...options, foldPcbs }),
          expected,
        )
      expectSameGeometry(
        await convertCircuitJsonTo3D(preFolded, options),
        folded,
      )
      expectSameGeometry(
        await browserConvert(input, { foldPcbs: true }),
        folded,
      )
      const glb = await convertCircuitJsonToGltf(preFolded, {
        format: "glb",
        boardTextureResolution: 0,
      })
      const exported = parseGLB(
        glb as ArrayBuffer,
        COORDINATE_TRANSFORMS.IDENTITY,
      )
      expect(exported.boundingBox.max.y).toBeGreaterThan(independent ? 10 : 50)
      expect(exported.boundingBox.min.x).toBeLessThan(-boardCenter.x - 29)
      expect(JSON.stringify({ input, reordered, preFolded })).toBe(before)
    }
})
