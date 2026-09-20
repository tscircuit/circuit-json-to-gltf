import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

const cases = [
  [
    [0, 0, 0],
    [1, 2, 3],
  ],
  [
    [37, 0, 0],
    [1, -0.20817404936155937, 3.5995365764459755],
  ],
  [
    [0, 30, 0],
    [2.366025403784439, 2, 2.098076211353316],
  ],
  [
    [0, 0, 47],
    [-0.7807090431758423, 2.0953504217441674, 3],
  ],
  [
    [23, 31, 47],
    [0.8759159615573968, 0.766903405514455, 3.5559289074585436],
  ],
  [
    [-23, -31, -47],
    [0.29325742519868137, 2.0187204171937045, 3.1366810420843105],
  ],
] as const

test.each(cases)(
  "CAD XYZ %j places the OBJ and GLB marker with right-handed intrinsic rotations",
  async (degrees, expected) => {
    // Off-axis marker expectations were calculated independently using Three's
    // intrinsic XYZ Euler, not the intermediate scene transform under test.
    const obj = "v 1 2 3\nv 2 2 3\nv 1 3 4\nf 1 2 3\n"
    const { glb } = createGLTFAsset({
      graph: { scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
    })
    for (const model of [
      {
        model_obj_url: `data:text/plain;base64,${Buffer.from(obj).toString("base64")}`,
      },
      {
        model_glb_url: `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`,
      },
    ]) {
      const cad: CadComponent = {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        position: { x: 7, y: -11, z: 5 },
        rotation: { x: degrees[0], y: degrees[1], z: degrees[2] },
        model_origin_position: { x: 0, y: 0, z: 0 },
        model_object_fit: "contain_within_bounds",
        anchor_alignment: "center",
        ...model,
      }
      const output = await convertCircuitJsonToGltf([cad], {
        format: "glb",
        boardTextureResolution: 0,
      })
      if (!(output instanceof ArrayBuffer)) throw new Error("Expected GLB")
      const marker = parseGLB(output, COORDINATE_TRANSFORMS.IDENTITY)
        .triangles[0]!.vertices[0]
      expect(marker.x).toBeCloseTo(-(7 + expected[0]), 5)
      expect(marker.y).toBeCloseTo(5 + expected[2], 5)
      expect(marker.z).toBeCloseTo(-11 + expected[1], 5)
    }
  },
)
