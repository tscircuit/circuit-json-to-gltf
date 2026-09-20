import { expect, test } from "bun:test"
import {
  convertMeshToGLTFOrientation,
  createBoxMeshByFaces,
} from "../../lib/gltf/geometry"

test("box top and bottom stay on canonical Z and exported glTF Y", () => {
  const faces = createBoxMeshByFaces({ x: 2, y: 4, z: 6 })
  for (const [name, sign] of [
    ["top", 1],
    ["bottom", -1],
  ] as const) {
    const mesh = faces[name]
    const exported = convertMeshToGLTFOrientation(mesh)
    for (let i = 0; i < mesh.positions.length; i += 3) {
      expect(mesh.positions[i + 2]).toBe(sign * 3)
      expect(mesh.normals.slice(i, i + 3)).toEqual([0, 0, sign])
      expect(exported.positions[i + 1]).toBe(sign * 3)
      expect(exported.normals.slice(i, i + 3)).toEqual([-0, sign, 0])
      expect(mesh.texcoords[(i / 3) * 2]).toBe((mesh.positions[i]! + 1) / 2)
      expect(mesh.texcoords[(i / 3) * 2 + 1]).toBe(
        1 - (mesh.positions[i + 1]! + 2) / 4,
      )
    }
    // G=(-X,Z,Y) has determinant +1, so outward winding must not reverse.
    expect(exported.indices).toEqual(mesh.indices)
    const [ia, ib, ic] = exported.indices.slice(0, 3).map((index) => index * 3)
    const a = exported.positions.slice(ia!, ia! + 3)
    const b = exported.positions.slice(ib!, ib! + 3)
    const c = exported.positions.slice(ic!, ic! + 3)
    const crossY =
      (b[2]! - a[2]!) * (c[0]! - a[0]!) - (b[0]! - a[0]!) * (c[2]! - a[2]!)
    expect(crossY * sign).toBeGreaterThan(0)
  }
})
