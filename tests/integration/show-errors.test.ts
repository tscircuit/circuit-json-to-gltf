import { expect, test } from "bun:test"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
} from "../../lib"
import { convertCircuitJsonTo3D as browserConvert } from "../../lib/browser"
import { convertCircuitJsonTo3D as browserIndexConvert } from "../../lib/browser-index"
import type { CircuitJsonWithPcbFlex, Scene3D } from "../../lib/types"
import { parseGLB } from "../../lib/loaders/glb"
import { withCircuitJsonErrorOverlay } from "../../lib/utils/circuit-json-error-overlay"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"

test("showErrors exports visible full messages without changing circuit geometry or input", async () => {
  const input = createCircuitJsonErrors()
  const before = JSON.stringify(input)
  const options = { renderBoardTextures: false }
  const defaultScene = await convertCircuitJsonTo3D(input, options)
  const hiddenScene = await convertCircuitJsonTo3D(input, {
    ...options,
    showErrors: false,
  })
  const visibleScene = await convertCircuitJsonTo3D(input, {
    ...options,
    showErrors: true,
  })
  expect(hiddenScene).toEqual(defaultScene)
  expect(visibleScene.boxes.slice(0, defaultScene.boxes.length)).toEqual(
    defaultScene.boxes,
  )
  const messages = input.flatMap((element) =>
    "message" in element ? [element.message] : [],
  )
  for (const message of messages) {
    const text = visibleScene.boxes.find((box) => box.label === message)!
    expect(text.mesh!.triangles.length).toBeGreaterThan(100)
    expect(
      text.mesh!.boundingBox.max.z - text.mesh!.boundingBox.min.z,
    ).toBeGreaterThan(1)
  }
  const glb = await convertCircuitJsonToGltf(input, {
    format: "glb",
    showErrors: true,
  })
  const emitted = parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY)
  // The actual exported annotation is beside the translated board, not near
  // the origin or over the copper. Its X extent follows the board's X mirror.
  expect(emitted.boundingBox.min.x).toBeCloseTo(-120)
  expect(emitted.boundingBox.max.x).toBeCloseTo(-80)
  expect(emitted.boundingBox.min.z).toBeLessThan(-90)
  expect(emitted.boundingBox.max.z).toBeCloseTo(-60)
  expect(visibleScene.camera!.target.x).toBeCloseTo(100)
  expect(JSON.stringify(input)).toBe(before)
})

test("showErrors with no errors leaves the scene unchanged", async () => {
  const input = createCircuitJsonErrors().filter(
    (element) => !("error_type" in element),
  )
  expect(
    await convertCircuitJsonTo3D(input, {
      renderBoardTextures: false,
      showErrors: true,
    }),
  ).toEqual(await convertCircuitJsonTo3D(input, { renderBoardTextures: false }))
})

test("both browser entry points include geometry for errors without PCB coordinates", async () => {
  for (const convert of [browserConvert, browserIndexConvert]) {
    const scene = await convert(createCircuitJsonErrors(), { showErrors: true })
    expect(
      scene.boxes.some(
        (box) =>
          box.label?.startsWith("U1 is missing") &&
          box.mesh!.triangles.length > 100,
      ),
    ).toBe(true)
  }
})

test("error cards remain outside the emitted bounds of rotated long boxes", async () => {
  const scene: Scene3D = {
    boxes: [
      {
        center: { x: 23, y: 2, z: -17 },
        size: { x: 100, y: 2, z: 2 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        color: "#224466",
      },
    ],
  }
  const withErrors = withCircuitJsonErrorOverlay(
    scene,
    createCircuitJsonErrors(),
  )
  const card = withErrors.boxes.find(
    (box) => box.label === "Circuit JSON errors",
  )!
  // A 90-degree rotation puts the 100 mm length along Z, reaching Z=-67.
  // Reading the unrotated size would incorrectly position the card near -18.
  expect(card.center.z + card.size.z / 2).toBeLessThan(-67)
  const glb = await convertSceneToGLTF(scene, { binary: true })
  expect(
    parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY).boundingBox.min
      .z,
  ).toBeCloseTo(-67)
})

test("unlocated errors render even when the scene has no board or components", async () => {
  const input = createCircuitJsonErrors().filter(
    (element) => element.type === "source_missing_property_error",
  )
  const scene = await convertCircuitJsonTo3D(input, {
    showErrors: true,
    renderBoardTextures: false,
  })
  expect(scene.boxes).toHaveLength(3)
  expect(scene.boxes.every((box) => box.mesh!.triangles.length > 0)).toBe(true)
  const glb = await convertCircuitJsonToGltf(input, {
    format: "glb",
    showErrors: true,
  })
  expect(
    parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY).triangles
      .length,
  ).toBeGreaterThan(100)
})

test("long multiline messages retain original text and readable geometry", async () => {
  const input: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_placement_error",
      pcb_placement_error_id: "long_error",
      error_type: "pcb_placement_error",
      message: `First line: ${"a".repeat(110)}\nFinal line: resistor value is 10 Ω?`,
    },
  ]
  const scene = await convertCircuitJsonTo3D(input, {
    showErrors: true,
    renderBoardTextures: false,
  })
  expect(scene.boxes[2]!.label).toBe((input[0] as { message: string }).message)
  const text = scene.boxes[2]!
  const card = scene.boxes[0]!
  expect(text.center.z + text.mesh!.boundingBox.min.z).toBeGreaterThan(
    card.center.z - card.size.z / 2,
  )
  expect(text.mesh!.triangles.length).toBeGreaterThan(500)
})

test("exported text and punctuation winding agree with their lighting normals", async () => {
  const scene = withCircuitJsonErrorOverlay({ boxes: [] }, [
    {
      type: "pcb_placement_error",
      pcb_placement_error_id: "punctuation_error",
      error_type: "pcb_placement_error",
      message: "Asymmetric R1; clearance: 0.2 mm?",
    },
  ])
  const gltf = (await convertSceneToGLTF(scene)) as any
  const buffer = Buffer.from(gltf.buffers[0].uri.split(",")[1], "base64")
  const read = (accessorIndex: number): number[] => {
    const accessor = gltf.accessors[accessorIndex]
    const view = gltf.bufferViews[accessor.bufferView]
    const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
    const count = accessor.count * (accessor.type === "VEC3" ? 3 : 1)
    const values = new DataView(
      buffer.buffer,
      buffer.byteOffset + offset,
      view.byteLength,
    )
    return Array.from({ length: count }, (_, index) =>
      accessor.componentType === 5126
        ? values.getFloat32(index * 4, true)
        : accessor.componentType === 5125
          ? values.getUint32(index * 4, true)
          : values.getUint16(index * 2, true),
    )
  }
  for (const mesh of gltf.meshes) {
    const primitive = mesh.primitives[0]
    const positions = read(primitive.attributes.POSITION)
    const normals = read(primitive.attributes.NORMAL)
    const indices = read(primitive.indices)
    for (let index = 0; index < indices.length; index += 3) {
      const a = indices[index]! * 3
      const b = indices[index + 1]! * 3
      const c = indices[index + 2]! * 3
      const ab = [
        positions[b]! - positions[a]!,
        positions[b + 1]! - positions[a + 1]!,
        positions[b + 2]! - positions[a + 2]!,
      ]
      const ac = [
        positions[c]! - positions[a]!,
        positions[c + 1]! - positions[a + 1]!,
        positions[c + 2]! - positions[a + 2]!,
      ]
      const cross = [
        ab[1]! * ac[2]! - ab[2]! * ac[1]!,
        ab[2]! * ac[0]! - ab[0]! * ac[2]!,
        ab[0]! * ac[1]! - ab[1]! * ac[0]!,
      ]
      const dot =
        cross[0]! * normals[a]! +
        cross[1]! * normals[a + 1]! +
        cross[2]! * normals[a + 2]!
      expect(dot).toBeGreaterThan(0)
    }
  }
})
