import { describe, expect, test } from "bun:test"
import {
  extractPackageInfoFromNodeModulesPath,
  resolveModelUrl,
} from "../../lib/loaders/resolve-model-url"
import type { STLMesh } from "../../lib/types"
import { fitMeshToCadBounds } from "../../lib/utils/cad-mesh-placement"
import { createPanelMesh } from "../../lib/utils/pcb-panel-geometry"

describe("fitMeshToCadBounds, createPanelMesh, and resolveModelUrl", () => {
  test("fitMeshToCadBounds scales up planar meshes without clamping to 1 on zero-extent axes", () => {
    const planarMesh: STLMesh = {
      triangles: [
        {
          vertices: [
            { x: 0, y: 0, z: 0 },
            { x: 2, y: 0, z: 0 },
            { x: 0, y: 0, z: 4 },
          ],
          normal: { x: 0, y: 1, z: 0 },
        },
      ],
      boundingBox: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 2, y: 0, z: 4 },
      },
    }

    const fitted = fitMeshToCadBounds(
      planarMesh,
      { x: 6, y: 10, z: 8 },
      "contain_within_bounds",
    )

    // x scale is 6/2 = 3, z scale is 8/4 = 2; y has 0 extent so uniformScale should be min(3, 2) = 2
    expect(fitted.boundingBox.max.x).toBeCloseTo(4, 6)
    expect(fitted.boundingBox.max.z).toBeCloseTo(8, 6)
  })

  test("createPanelMesh returns an empty mesh when panel has zero dimensions and no outline", () => {
    const mesh = createPanelMesh(
      {
        type: "pcb_panel",
        pcb_panel_id: "pcb_panel_empty",
        width: 0,
        height: 0,
        center: { x: 0, y: 0 },
      } as any,
      { thickness: 1.6 },
    )

    expect(mesh.triangles).toEqual([])
    expect(mesh.boundingBox).toEqual({
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    })
  })

  test("extractPackageInfoFromNodeModulesPath and resolveModelUrl handle Windows backslash paths", async () => {
    expect(
      extractPackageInfoFromNodeModulesPath(
        ".\\node_modules\\@tsci\\seveibar.usb-c\\model.step",
      ),
    ).toEqual({
      packageName: "@seveibar/usb-c",
      filePath: "model.step",
    })

    const resolved = await resolveModelUrl(".\\assets\\chip.obj")
    expect(resolved.startsWith("file:///")).toBe(true)
    expect(resolved.endsWith("/assets/chip.obj")).toBe(true)
  })
})
