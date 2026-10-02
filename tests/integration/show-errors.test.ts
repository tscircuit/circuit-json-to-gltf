import { expect, test } from "bun:test"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
} from "../../lib"
import { convertCircuitJsonTo3D as browserConvert } from "../../lib/browser"
import { convertCircuitJsonToGltf as browserExport } from "../../lib/browser"
import { convertCircuitJsonTo3D as browserIndexConvert } from "../../lib/browser-index"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"
import { createCrossingFlex } from "../fixtures/invalid-flex"

function parseGlb(glb: ArrayBuffer) {
  const jsonLength = new DataView(glb).getUint32(12, true)
  const json = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const binaryOffset = 20 + jsonLength
  const binaryLength = new DataView(glb).getUint32(binaryOffset, true)
  return { json, binary: new Uint8Array(glb, binaryOffset + 8, binaryLength) }
}

test("showErrors carries all full messages without changing scene geometry, camera or input", async () => {
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
  const messages = input.flatMap((element) =>
    "error_type" in element && "message" in element ? [element.message] : [],
  )
  expect(hiddenScene).toEqual(defaultScene)
  expect(visibleScene).toEqual({ ...defaultScene, errorMessages: messages })
  expect(messages).toHaveLength(2)
  expect(messages[1]).toContain("no PCB coordinates")
  expect(JSON.stringify(input)).toBe(before)
})

test("showErrors with no errors leaves the entire scene unchanged", async () => {
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

test("both browser entry points carry unlocated errors without adding meshes or changing cameras", async () => {
  for (const convert of [browserConvert, browserIndexConvert]) {
    const input = createCircuitJsonErrors()
    const hidden = await convert(input)
    const visible = await convert(input, { showErrors: true })
    expect(visible.boxes).toEqual(hidden.boxes)
    expect(visible.camera).toEqual(hidden.camera)
    expect(visible.errorMessages).toHaveLength(2)
    expect(visible.errorMessages![1]).toContain("U1 is missing")
  }
})

test("glTF and GLB store screen overlay metadata while preserving all geometry and binary buffers", async () => {
  const input = createCircuitJsonErrors()
  const before = JSON.stringify(input)
  const hidden = (await convertCircuitJsonToGltf(input, {
    boardTextureResolution: 128,
  })) as any
  const visible = (await convertCircuitJsonToGltf(input, {
    showErrors: true,
    boardTextureResolution: 128,
  })) as any
  const messages = visible.scenes[visible.scene].extras.tscircuit.errorMessages
  expect(messages).toEqual(
    input.flatMap((element) => ("message" in element ? [element.message] : [])),
  )
  // The metadata is the entire difference. It adds no nodes, meshes, materials,
  // accessors or buffer data, and does not affect the exported board's bounds.
  expect({
    ...visible,
    scenes: visible.scenes.map(({ extras, ...scene }: any) => scene),
  }).toEqual(hidden)
  const hiddenGlb = parseGlb(
    (await convertCircuitJsonToGltf(input, {
      format: "glb",
      boardTextureResolution: 128,
    })) as ArrayBuffer,
  )
  const visibleGlb = parseGlb(
    (await convertCircuitJsonToGltf(input, {
      format: "glb",
      showErrors: true,
      boardTextureResolution: 128,
    })) as ArrayBuffer,
  )
  expect(
    visibleGlb.json.scenes[visibleGlb.json.scene].extras.tscircuit
      .errorMessages,
  ).toEqual(messages)
  expect(visibleGlb.binary).toEqual(hiddenGlb.binary)
  expect({
    ...visibleGlb.json,
    scenes: visibleGlb.json.scenes.map(({ extras, ...scene }: any) => scene),
  }).toEqual(hiddenGlb.json)
  expect(JSON.stringify(input)).toBe(before)
})

test("unlocated source errors survive export even before board or component geometry exists", async () => {
  const input = createCircuitJsonErrors().filter(
    (element) => element.type === "source_missing_property_error",
  )
  const scene = await convertCircuitJsonTo3D(input, {
    showErrors: true,
    renderBoardTextures: false,
  })
  expect(scene.boxes).toEqual([])
  expect(scene.errorMessages).toHaveLength(1)
  const { json, binary } = parseGlb(
    (await convertCircuitJsonToGltf(input, {
      format: "glb",
      showErrors: true,
    })) as ArrayBuffer,
  )
  expect(json.nodes).toEqual([])
  expect(json.meshes).toEqual([])
  expect(binary.byteLength).toBe(0)
  expect(json.scenes[json.scene].extras.tscircuit.errorMessages).toEqual(
    scene.errorMessages,
  )
})

test("the browser entry supports pre-geometry errors when showErrors is enabled", async () => {
  const input = createCircuitJsonErrors().filter(
    (element) => element.type === "source_missing_property_error",
  )
  const before = JSON.stringify(input)
  // Preserve the browser entry's existing missing-board behavior unless the
  // caller requests error metadata for its pre-geometry diagnostic scene.
  await expect(browserConvert(input)).rejects.toThrow("No pcb_board found")
  await expect(browserConvert(input, { showErrors: false })).rejects.toThrow(
    "No pcb_board found",
  )
  const scene = await browserConvert(input, { showErrors: true })
  expect(scene.boxes).toEqual([])
  expect(scene.errorMessages).toHaveLength(1)
  const { json, binary } = parseGlb(
    (await browserExport(input, {
      format: "glb",
      showErrors: true,
    })) as ArrayBuffer,
  )
  expect(json.scenes[json.scene].extras.tscircuit.errorMessages).toEqual(
    scene.errorMessages,
  )
  expect(binary.byteLength).toBe(0)
  expect(JSON.stringify(input)).toBe(before)
})

test("long multiline Unicode error messages remain intact in exported metadata", async () => {
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
  const messages = [...scene.errorMessages!]
  const gltf = (await convertSceneToGLTF(scene)) as any
  scene.errorMessages!.push("Later change to source scene")
  expect(gltf.scenes[gltf.scene].extras.tscircuit.errorMessages).toEqual(
    messages,
  )
  expect(gltf.scenes[gltf.scene].extras).toEqual({
    tscircuit: { errorMessages: messages },
  })
})

test("exporter fold warnings do not become Circuit JSON error records", async () => {
  const input = createCrossingFlex()
  const options = { foldPcbs: true, renderBoardTextures: false }
  const hidden = await convertCircuitJsonTo3D(input, options)
  const visible = await convertCircuitJsonTo3D(input, {
    ...options,
    showErrors: true,
  })
  expect(visible).toEqual(hidden)
  expect(visible.errorMessages).toBeUndefined()
})
