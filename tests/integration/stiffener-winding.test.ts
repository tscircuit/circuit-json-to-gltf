import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { GLTF } from "../../lib/gltf/gltf-types"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"

// Read the actual GLB accessors: loading a GLB as an STL mesh can recompute
// normals and hide a disagreement between exported winding and normals.
function readGlb(glb: ArrayBuffer) {
  const view = new DataView(glb)
  const jsonLength = view.getUint32(12, true)
  const gltf: GLTF = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const binaryOffset = 20 + jsonLength + 8
  const accessor = (index: number) => {
    const a = gltf.accessors![index]!
    const b = gltf.bufferViews![a.bufferView!]!
    const offset = binaryOffset + (b.byteOffset ?? 0) + (a.byteOffset ?? 0)
    const count = a.count * (a.type === "VEC3" ? 3 : 1)
    return a.componentType === 5126
      ? new Float32Array(glb, offset, count)
      : a.componentType === 5125
        ? new Uint32Array(glb, offset, count)
        : new Uint16Array(glb, offset, count)
  }
  return { gltf, accessor }
}

for (const shape of ["rect", "polygon"] as const)
  for (const layer of ["top", "bottom"] as const)
    for (const foldPcbs of [false, true])
      for (const x of [-12, 12])
        for (const rotation of [0, 37, 90, 180, 270])
          test(`stiffener GLB faces point outward: ${shape}, ${layer}, fold=${foldPcbs}, x=${x}, rotation=${rotation}`, async () => {
            const circuit: CircuitJsonWithPcbFlex = [
              {
                type: "pcb_board",
                pcb_board_id: "board",
                center: { x: 0, y: 0 },
                width: 40,
                height: 20,
                thickness: 0.12,
                num_layers: 2,
                material: "flex",
              },
              {
                type: "pcb_bend",
                pcb_bend_id: "bend",
                pcb_board_id: "board",
                start: { x: 0, y: -10 },
                end: { x: 0, y: 10 },
                bend_angle: 90,
                bend_radius: 2,
                bend_side: "right",
              },
              {
                type: "pcb_stiffener",
                pcb_stiffener_id: "stiffener",
                pcb_board_id: "board",
                ...(shape === "rect"
                  ? {
                      shape,
                      center: { x, y: 0 },
                      width: 10,
                      height: 16,
                      rotation,
                    }
                  : {
                      shape,
                      outline: [
                        [-5, -8],
                        [5, -8],
                        [5, 4],
                        [1, 4],
                        [1, 8],
                        [-5, 8],
                      ].map(([px, py]) => {
                        const angle = (rotation * Math.PI) / 180
                        return {
                          x: x + px! * Math.cos(angle) - py! * Math.sin(angle),
                          y: px! * Math.sin(angle) + py! * Math.cos(angle),
                        }
                      }),
                    }),
                layer,
                material: "fr4",
                thickness: 0.4,
              },
            ]
            const scene = await convertCircuitJsonTo3D(circuit, {
              foldPcbs,
              renderBoardTextures: false,
            })
            const { gltf, accessor } = readGlb(
              (await convertSceneToGLTF(scene, {
                binary: true,
              })) as ArrayBuffer,
            )
            const node = gltf.nodes!.find((n) => n.name === "stiffener")!
            const primitive = gltf.meshes![node.mesh!]!.primitives[0]!
            expect(gltf.materials![primitive.material!]!.doubleSided).not.toBe(
              true,
            )
            const positions = accessor(primitive.attributes.POSITION)
            const normals = accessor(primitive.attributes.NORMAL!)
            const indices = accessor(primitive.indices!)
            let volume = 0
            for (let i = 0; i < indices.length; i += 3) {
              const a = indices[i]! * 3
              const b = indices[i + 1]! * 3
              const c = indices[i + 2]! * 3
              const ab = [0, 1, 2].map(
                (j) => positions[b + j]! - positions[a + j]!,
              )
              const ac = [0, 1, 2].map(
                (j) => positions[c + j]! - positions[a + j]!,
              )
              const cross = [
                ab[1]! * ac[2]! - ab[2]! * ac[1]!,
                ab[2]! * ac[0]! - ab[0]! * ac[2]!,
                ab[0]! * ac[1]! - ab[1]! * ac[0]!,
              ]
              const dot = cross.reduce(
                (sum, n, j) => sum + n * normals[a + j]!,
                0,
              )
              expect(dot).toBeGreaterThan(0)
              volume +=
                cross.reduce((sum, n, j) => sum + n * positions[a + j]!, 0) / 6
            }
            // Outward-facing solids have positive volume: the polygon has a 4 x 4 mm notch.
            expect(volume).toBeCloseTo(shape === "rect" ? 64 : 57.6, 3)
          })
