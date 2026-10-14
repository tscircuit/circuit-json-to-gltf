import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGLTFToPNGFromGLB } from "poppygl"

export const cubeEncodings = ["packed", "interleaved", "quantized"] as const
export type CubeEncoding = (typeof cubeEncodings)[number]

/** Generate the issue #255 cube in glTF node-local space: +Y up, mm. */
export function makeAccessorCube(encoding: CubeEncoding): ArrayBuffer {
  const points: number[][] = []
  for (const x of [0, 1])
    for (const y of [0, 1]) for (const z of [0, 1]) points.push([x, y, z])
  const faces = [
    [0, 1, 3, 2],
    [4, 6, 7, 5],
    [0, 4, 5, 1],
    [2, 3, 7, 6],
    [0, 2, 6, 4],
    [1, 5, 7, 3],
  ]
  const indices = faces.flatMap(([a, b, c, d]) => [a, b, c, a, c, d])
  const stride =
    encoding === "interleaved" ? 24 : encoding === "quantized" ? 8 : 12
  const vertexBytes = stride * points.length
  const binary = new ArrayBuffer(vertexBytes + indices.length * 2)
  const view = new DataView(binary)
  points.forEach((point, i) => {
    point.forEach((value, c) => {
      if (encoding === "quantized")
        view.setInt16(i * stride + c * 2, value * 32767, true)
      else view.setFloat32(i * stride + c * 4, value, true)
    })
    // The second attribute remains in the buffer even when normals are computed.
    if (encoding === "interleaved") view.setFloat32(i * stride + 20, 1, true)
  })
  indices.forEach((index, i) =>
    view.setUint16(vertexBytes + i * 2, index!, true),
  )
  const json = new TextEncoder().encode(
    JSON.stringify({
      asset: { version: "2.0" },
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [
        {
          primitives: [
            { attributes: { POSITION: 0 }, indices: 1, material: 0 },
          ],
        },
      ],
      materials: [
        {
          pbrMetallicRoughness: {
            baseColorFactor: [1, 0.35, 0.05, 1],
            metallicFactor: 0,
            roughnessFactor: 0.8,
          },
        },
      ],
      buffers: [{ byteLength: binary.byteLength }],
      bufferViews: [
        {
          buffer: 0,
          byteLength: vertexBytes,
          ...(encoding !== "packed" ? { byteStride: stride } : {}),
        },
        { buffer: 0, byteOffset: vertexBytes, byteLength: indices.length * 2 },
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: encoding === "quantized" ? 5122 : 5126,
          ...(encoding === "quantized" ? { normalized: true } : {}),
          count: 8,
          type: "VEC3",
          min: [0, 0, 0],
          max: encoding === "quantized" ? [32767, 32767, 32767] : [1, 1, 1],
        },
        {
          bufferView: 1,
          componentType: 5123,
          count: indices.length,
          type: "SCALAR",
        },
      ],
      ...(encoding === "quantized"
        ? {
            extensionsUsed: ["KHR_mesh_quantization"],
            extensionsRequired: ["KHR_mesh_quantization"],
          }
        : {}),
    }),
  )
  const jsonLength = Math.ceil(json.length / 4) * 4
  const buffer = new ArrayBuffer(28 + jsonLength + binary.byteLength)
  const output = new DataView(buffer)
  for (const [offset, value] of [
    [0, 0x46546c67],
    [4, 2],
    [8, buffer.byteLength],
    [12, jsonLength],
    [16, 0x4e4f534a],
    [20 + jsonLength, binary.byteLength],
    [24 + jsonLength, 0x004e4942],
  ])
    output.setUint32(offset!, value!, true)
  new Uint8Array(buffer, 20, jsonLength).fill(32)
  new Uint8Array(buffer, 20, json.length).set(json)
  new Uint8Array(buffer, 28 + jsonLength).set(new Uint8Array(binary))
  return buffer
}

export async function exportAccessorCube(encoding: CubeEncoding) {
  const model = Buffer.from(makeAccessorCube(encoding)).toString("base64")
  const circuit: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "b",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "source_component",
      source_component_id: "s",
      name: "U1",
      ftype: "simple_chip",
    },
    {
      type: "pcb_component",
      pcb_component_id: "p",
      source_component_id: "s",
      center: { x: 0, y: 0 },
      layer: "top",
      obstructs_within_bounds: true,
      rotation: 0,
      width: 1,
      height: 1,
    },
    {
      type: "cad_component",
      cad_component_id: "c",
      anchor_alignment: "center",
      model_origin_position: { x: 0, y: 0, z: 0 },
      model_object_fit: "contain_within_bounds",
      pcb_component_id: "p",
      source_component_id: "s",
      position: { x: 0, y: 0, z: 0.8 },
      rotation: { x: 0, y: 0, z: 0 },
      model_glb_url: `data:model/gltf-binary;base64,${model}`,
    },
  ]
  const glb = await convertCircuitJsonToGltf(circuit, { format: "glb" })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")
  return glb
}

/** Fixed camera in exported glTF world: +Y up, mm; never auto-fit broken geometry. */
export const accessorCubeCamera = {
  width: 420,
  height: 300,
  camPos: [8, 8, 10] as [number, number, number],
  lookAt: [0, 0.8, 0] as [number, number, number],
  up: "y+" as const,
  fov: 40,
  grid: false,
  backgroundColor: "#f2f3f5",
  ambient: 0.45,
}

export async function renderAccessorCube(encoding: CubeEncoding) {
  return renderGLTFToPNGFromGLB(
    await exportAccessorCube(encoding),
    accessorCubeCamera,
  )
}
