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

/**
 * The bug: `loadJscadPlan` moved the plan into the scene frame with
 * `rotateX(-PI/2)`, which sends Circuit +Y to scene -Z. Every other path into
 * the same scene -- the OBJ loader (`OBJ_Z_UP_TO_Y_UP`), the board mesh, and
 * `cad_component.position` -- sends Circuit +Y to scene +Z. So a `model_jscad`
 * component came out rotated 180 degrees about X relative to everything it was
 * meant to sit next to, and relative to its own position offset.
 *
 * A plan translated +4 in Circuit Y must therefore span +3..+5 in scene Z, not
 * -5..-3.
 */
test("a JSCAD plan translated along Circuit +Y lands at +Z in the scene frame", () => {
  const positiveYPlan = {
    type: "translate",
    vector: [0, 4, 0],
    shape: { type: "cuboid", size: [2, 2, 2] },
  }

  const mesh = loadJscadPlan(positiveYPlan)

  expect(mesh.boundingBox.min.z).toBeCloseTo(3)
  expect(mesh.boundingBox.max.z).toBeCloseTo(5)
})

/**
 * The same defect stated as the invariant it breaks: moving geometry by an
 * offset inside the plan must be indistinguishable from moving the node by the
 * same offset via `cad_component.position`. Geometry and node offsets are
 * applied in different places, so they only agree if the loader and the node
 * placement share one frame.
 *
 * Before the fix the Y case failed -- +4 in the plan read back as -4 in the
 * scene -- while X and Z agreed, which is exactly the 180-degree X rotation
 * above. The X and Z cases are kept as the guard for the other half of the
 * mapping: X must stay un-negated here because
 * `GLTFBuilder.convertMeshToGLTFOrientation` applies the single canonical
 * X-mirror to every mesh at export, and negating it here too would mirror JSCAD
 * geometry alone.
 */
test.each([
  ["x", [4, 0, 0]],
  ["y", [0, 4, 0]],
  ["z", [0, 0, 4]],
] as const)(
  "a JSCAD mesh offset along Circuit %s matches an equivalent cad_component.position",
  async (_axis, offset) => {
    const cube = { type: "cuboid", size: [2, 2, 2] }
    const offsetPlan = { type: "translate", vector: offset, shape: cube }

    // Mesh path: geometry carries the offset, node sits at the origin.
    const meshCenterOfOffsetPlan = (() => {
      const { boundingBox } = loadJscadPlan(offsetPlan)
      return {
        x: (boundingBox.min.x + boundingBox.max.x) / 2,
        y: (boundingBox.min.y + boundingBox.max.y) / 2,
        z: (boundingBox.min.z + boundingBox.max.z) / 2,
      }
    })()

    // Node path: geometry sits at the origin, `position` carries the offset.
    const scene = await convertCircuitJsonTo3D(
      [
        {
          type: "source_component",
          source_component_id: "source_1",
          name: "Offset",
          ftype: "simple_chip",
        },
        {
          type: "pcb_component",
          pcb_component_id: "pcb_1",
          source_component_id: "source_1",
          center: { x: 0, y: 0 },
          width: 2,
          height: 2,
          layer: "top",
        },
        {
          type: "cad_component",
          cad_component_id: "cad_1",
          source_component_id: "source_1",
          pcb_component_id: "pcb_1",
          position: { x: offset[0], y: offset[1], z: offset[2] },
          rotation: { x: 0, y: 0, z: 0 },
          model_jscad: cube,
        },
      ] as any,
      { renderBoardTextures: false, showBoundingBoxes: false },
    )
    const nodeCenter = scene.boxes[0]!.center

    expect(meshCenterOfOffsetPlan.x).toBeCloseTo(nodeCenter.x)
    expect(meshCenterOfOffsetPlan.y).toBeCloseTo(nodeCenter.y)
    expect(meshCenterOfOffsetPlan.z).toBeCloseTo(nodeCenter.z)
  },
)

/**
 * The mesh's bounds must describe the triangles it ships, so they are measured
 * from those triangles rather than from the source Geom3 -- which is still Z-up
 * when the triangles have already been remapped. A cylinder is the shape that
 * keeps the two apart if this is ever reverted to moving the source box: it
 * does not fill its own bounding box, so a transform that rotates the box
 * inflates the empty corners instead of following the shape.
 */
test.each([
  ["a cylinder", { type: "cylinder", radius: 5, height: 4, segments: 64 }],
  [
    "an off-centre cuboid",
    {
      type: "translate",
      vector: [1, 3, 2],
      shape: { type: "cuboid", size: [14, 6, 10] },
    },
  ],
] as const)(
  "reports the bounds of the triangles it ships for %s",
  (_, plan) => {
    const mesh = loadJscadPlan(plan)

    const vertices = mesh.triangles.flatMap((triangle) => triangle.vertices)
    for (const axis of ["x", "y", "z"] as const) {
      const values = vertices.map((vertex) => vertex[axis])
      expect(mesh.boundingBox.min[axis]).toBeCloseTo(Math.min(...values))
      expect(mesh.boundingBox.max[axis]).toBeCloseTo(Math.max(...values))
    }
  },
)

/**
 * A plan that produces no geometry reports a zero box, not the Infinities an
 * unguarded min/max scan would leave behind -- those serialize to null and
 * every other loader reports zero here.
 */
test("reports a zero bounding box for a plan that produces no geometry", () => {
  const cube = { type: "cuboid", size: [2, 2, 2] }

  const mesh = loadJscadPlan({ type: "subtract", shapes: [cube, cube] })

  expect(mesh.triangles).toHaveLength(0)
  expect(mesh.boundingBox).toEqual({
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  })
})
