import { expect, test } from "bun:test"
import { cuboid } from "@jscad/modeling/src/primitives"
import { batchedUnion } from "../../lib/utils/batched-union"
import { BufferBuilder } from "../../lib/gltf/buffer-builder"
import {
  convertMeshToGLTFOrientation,
  createBoxMesh,
  createBoxMeshByFaces,
  transformMesh,
} from "../../lib/gltf/geometry"
import { withCircuitJsonErrors } from "../../lib/utils/circuit-json-errors"

test("batchedUnion clamps non-positive or batchSize=1 inputs to avoid infinite loops", () => {
  const g1 = cuboid({ size: [2, 2, 2], center: [0, 0, 0] })
  const g2 = cuboid({ size: [2, 2, 2], center: [1, 0, 0] })
  const g3 = cuboid({ size: [2, 2, 2], center: [2, 0, 0] })

  const unifiedOne = batchedUnion([g1, g2, g3], 1)
  expect(unifiedOne.polygons.length).toBeGreaterThan(0)

  const unifiedZero = batchedUnion([g1, g2, g3], 0)
  expect(unifiedZero.polygons.length).toBeGreaterThan(0)

  const unifiedNaN = batchedUnion([g1, g2], Number.NaN)
  expect(unifiedNaN.polygons.length).toBeGreaterThan(0)
})

test("BufferBuilder handles non-positive initialSize and non-positive or non-finite alignment safely", () => {
  const builder = new BufferBuilder(0)
  builder.addUint16(0x1234)
  builder.align(0)
  builder.align(1)
  builder.align(Number.NaN)
  expect(builder.getCurrentOffset()).toBe(4)

  const bytes = new Uint8Array(builder.getBuffer())
  expect(bytes.length).toBe(4)
  expect(bytes[2]).toBe(0)
  expect(bytes[3]).toBe(0)
})

test("createBoxMesh, transformMesh, and convertMeshToGLTFOrientation sanitize non-finite inputs and avoid -0", () => {
  const box = createBoxMesh({ x: -4, y: Number.NaN, z: 2 })
  expect(box.positions.every((v) => Number.isFinite(v))).toBe(true)

  const faces = createBoxMeshByFaces({ x: 2, y: -1, z: Number.NaN })
  expect(faces.top.positions.every((v) => Number.isFinite(v))).toBe(true)

  const validBox = createBoxMesh({ x: 2, y: 4, z: 6 })
  const oriented = convertMeshToGLTFOrientation(validBox)
  expect(oriented.normals.every((n) => Number.isFinite(n))).toBe(true)

  const rotated = transformMesh(
    validBox,
    { x: Number.NaN, y: 1, z: 2 },
    { x: 0.4, y: Number.NaN, z: 0.7 },
  )
  expect(rotated.positions.every((v) => Number.isFinite(v))).toBe(true)
  for (let i = 0; i < rotated.normals.length; i += 3) {
    const len = Math.hypot(
      rotated.normals[i]!,
      rotated.normals[i + 1]!,
      rotated.normals[i + 2]!,
    )
    expect(len).toBeCloseTo(1, 6)
  }
})

test("withCircuitJsonErrors skips nullish or whitespace-only error records and deduplicates messages", () => {
  const scene = { boxes: [] }
  const result = withCircuitJsonErrors(scene, [
    null as any,
    {
      type: "pcb_placement_error",
      error_type: "pcb_placement_error",
      message: "   ",
    } as any,
    {
      type: "pcb_placement_error",
      error_type: "pcb_placement_error",
      message: "Trace overlap on top layer",
    } as any,
    {
      type: "pcb_placement_error",
      error_type: "pcb_placement_error",
      message: "Trace overlap on top layer",
    } as any,
  ])
  expect(result.errorMessages).toEqual(["Trace overlap on top layer"])
})
