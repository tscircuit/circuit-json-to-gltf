import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D, loadJscadPlan } from "../../lib"

const openTopBoxPlan = {
  type: "subtract",
  shapes: [
    { type: "cuboid", size: [14, 10, 6] },
    {
      type: "translate",
      vector: [0, 0, 2],
      shape: { type: "cuboid", size: [10, 6, 6] },
    },
  ],
}

test("loads serializable JSCAD plans into scene meshes", async () => {
  const mesh = loadJscadPlan(openTopBoxPlan)

  expect(mesh.triangles.length).toBeGreaterThan(0)
  expect(mesh.boundingBox.min.x).toBeCloseTo(-7)
  expect(mesh.boundingBox.max.x).toBeCloseTo(7)
  expect(mesh.boundingBox.min.y).toBeCloseTo(-3)
  expect(mesh.boundingBox.max.y).toBeCloseTo(3)
  expect(mesh.boundingBox.min.z).toBeCloseTo(-5)
  expect(mesh.boundingBox.max.z).toBeCloseTo(5)

  const scene = await convertCircuitJsonTo3D(
    [
      {
        type: "source_component",
        source_component_id: "source_enclosure",
        name: "Enclosure",
        ftype: "simple_chip",
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb_enclosure",
        source_component_id: "source_enclosure",
        center: { x: 0, y: 0 },
        width: 14,
        height: 10,
        layer: "top",
      },
      {
        type: "cad_component",
        cad_component_id: "cad_enclosure",
        source_component_id: "source_enclosure",
        pcb_component_id: "pcb_enclosure",
        position: { x: 1, y: 2, z: 3 },
        rotation: { x: 0, y: 0, z: 0 },
        model_jscad: openTopBoxPlan,
      },
    ] as any,
    { renderBoardTextures: false, showBoundingBoxes: false },
  )

  expect(scene.boxes).toHaveLength(1)
  expect(scene.boxes[0]?.mesh?.triangles.length).toBeGreaterThan(0)
  expect(scene.boxes[0]?.center).toEqual({ x: 1, y: 3, z: 2 })
  expect(scene.boxes[0]?.size).toEqual({ x: 14, y: 6, z: 10 })
})
