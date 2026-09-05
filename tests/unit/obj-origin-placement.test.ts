import { expect, test } from "bun:test"
import type { CadComponent, CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import type { GLTF } from "../../lib/gltf/gltf-types"

const models: {
  name: string
  file: string
  origin?: CadComponent["model_origin_position"]
  alignment: CadComponent["model_origin_alignment"]
  marker: [number, number, number]
}[] = [
  {
    name: "centered contact patch",
    file: "centered-contact.obj",
    alignment: "center_of_component_on_board_surface",
    marker: [2, 3, 1],
  },
  {
    name: "offset contact patch with authored origin",
    file: "offset-contact.obj",
    alignment: "center_of_component_on_board_surface",
    marker: [7, 10, 4],
  },
  {
    name: "explicit origin on all three axes",
    file: "offset-contact.obj",
    origin: { x: 5, y: 7, z: 3 },
    alignment: "center_of_component_on_board_surface",
    marker: [2, 3, 1],
  },
  {
    name: "bounding-box center alignment",
    file: "offset-contact.obj",
    alignment: "center",
    marker: [1, 1.5, 0.5],
  },
]

for (const model of models) {
  const [x, y, z] = model.marker
  // Expected marker displacements in Circuit XY after each quarter turn.
  const rotations = [
    [0, x, y],
    [90, -y, x],
    [180, -x, -y],
    [270, y, -x],
  ] as const

  for (const layer of ["top", "bottom"] as const) {
    test.each(rotations)(
      `OBJ ${model.name}, ${layer}, %d degrees: exported marker reaches its anchor offset`,
      async (angle, rotatedX, rotatedY) => {
        const circuitJson: CircuitJson = [
          {
            type: "source_component",
            source_component_id: "source1",
            name: "J1",
            ftype: "simple_chip",
          },
          {
            type: "pcb_component",
            pcb_component_id: "pcb1",
            source_component_id: "source1",
            center: { x: 11, y: 13 },
            width: 8,
            height: 10,
            rotation: angle,
            obstructs_within_bounds: true,
            layer,
          },
          {
            type: "cad_component",
            cad_component_id: "cad1",
            pcb_component_id: "pcb1",
            source_component_id: "source1",
            position: { x: 11, y: 13, z: layer === "top" ? 1 : -1 },
            rotation: { x: layer === "top" ? 0 : 180, y: 0, z: angle },
            layer,
            model_obj_url: new URL(`../assets/${model.file}`, import.meta.url)
              .href,
            model_origin_position: model.origin,
            model_origin_alignment: model.alignment,
            anchor_alignment: "center_of_component_on_board_surface",
            model_object_fit: "contain_within_bounds",
          },
        ]

        const gltf = (await convertCircuitJsonToGltf(circuitJson)) as GLTF
        const node = gltf.nodes!.find((node) => node.name === "J1")!
        const primitive = gltf.meshes![node.mesh!]!.primitives[0]!
        const accessor = gltf.accessors![primitive.attributes.POSITION]!
        const view = gltf.bufferViews![accessor.bufferView!]!
        const buffer = Buffer.from(
          gltf.buffers![view.buffer]!.uri!.split(",")[1]!,
          "base64",
        )
        const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0)

        // Read the actual exported marker point (mm, +Y up), including node
        // translation. Export maps Circuit X to -X and Circuit Y to +Z.
        // The bottom placement rotates around X, reversing Y and Z together.
        const side = layer === "top" ? 1 : -1
        const expected = [
          -(11 + rotatedX),
          side * (1 + z),
          13 + side * rotatedY,
        ]
        for (let axis = 0; axis < 3; axis++) {
          const world =
            buffer.readFloatLE(offset + axis * 4) + node.translation![axis]!
          expect(world).toBeCloseTo(expected[axis]!, 5)
        }
      },
    )
  }
}
