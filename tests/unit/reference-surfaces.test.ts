import { expect, test } from "bun:test"
import type { CadReferenceSurface, CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { convertCircuitJsonTo3D as convertBrowserScene } from "../../lib/browser"

const surface: CadReferenceSurface = {
  type: "cad_reference_surface",
  cad_reference_surface_id: "surface_1",
  source_component_id: "source_1",
  name: "mount",
  shape: "rect",
  center: { x: 7, y: -3, z: 19 },
  normal: { x: 0, y: 0.6, z: 0.8 },
  x_axis: { x: 1, y: 0, z: 0 },
  width: 8,
  height: 6,
}
const circuit: CircuitJson = [
  {
    type: "source_component",
    source_component_id: "source_1",
    ftype: "subassembly",
    name: "SHADE",
  },
  surface,
]

test("reference surfaces are opt-in world-space frames with labels, normals, and translucent double-sided planes", async () => {
  expect((await convertCircuitJsonTo3D(circuit)).boxes).toHaveLength(0)
  for (const convert of [convertCircuitJsonTo3D, convertBrowserScene]) {
    const scene = await convert(circuit, { showReferenceSurfaces: true })
    expect(scene.boxes).toHaveLength(1)
    const box = scene.boxes[0]
    expect(box.label).toBe("SHADE.mount")
    const plane = box.mesh!.triangles.slice(0, 2)
    const points = plane[0].vertices.map((vertex) => ({
      x: vertex.x + box.center.x,
      y: vertex.y + box.center.y,
      z: vertex.z + box.center.z,
    }))
    // Actual corners in Scene3D: circuit (x,y,z) -> (x,z,y).
    expect(points[0].x).toBeCloseTo(3)
    expect(points[0].y).toBeCloseTo(20.8)
    expect(points[0].z).toBeCloseTo(-5.4)
    expect(points[2].x).toBeCloseTo(11)
    expect(points[2].y).toBeCloseTo(17.2)
    expect(points[2].z).toBeCloseTo(-0.6)
    expect(plane[0].normal).toEqual({ x: 0, y: 0.8, z: 0.6 })
    const arrow = box
      .mesh!.triangles.filter((t) => t.material?.color?.[0] === 1)
      .flatMap((t) => t.vertices)
    expect(Math.max(...arrow.map((p) => p.y + box.center.y))).toBeGreaterThan(
      21.1,
    )
    expect(box.mesh!.triangles.length).toBeGreaterThan(100) // Label strokes are exported geometry.
  }
  const glb = (await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    showReferenceSurfaces: true,
  })) as ArrayBuffer
  const jsonLength = new DataView(glb).getUint32(12, true)
  const document = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const planeMaterial = document.materials.find(
    (m: any) => m.pbrMetallicRoughness.baseColorFactor[3] === 0.2,
  )
  expect(planeMaterial.alphaMode).toBe("BLEND")
  expect(planeMaterial.doubleSided).toBe(true)
  expect(document.nodes.some((n: any) => n.name === "SHADE.mount")).toBe(true)
})

test("unbounded reference frames use a 10mm diagnostic rectangle", async () => {
  const scene = await convertCircuitJsonTo3D(
    [{ ...surface, width: undefined, height: undefined }],
    { showReferenceSurfaces: true },
  )
  const box = scene.boxes[0]
  const vertices = box.mesh!.triangles.slice(0, 2).flatMap((t) => t.vertices)
  expect(
    Math.max(...vertices.map((p) => p.x)) -
      Math.min(...vertices.map((p) => p.x)),
  ).toBeCloseTo(10)
})
