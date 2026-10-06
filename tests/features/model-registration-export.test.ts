import { expect, test } from "bun:test"
import type { CadCable, CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import type { GLTF } from "../../lib/gltf/gltf-types"
import { loadCable } from "../../lib/loaders/cable"
import { loadFootprinterModel } from "../../lib/loaders/footprinter"
import { parseGLB } from "../../lib/loaders/glb"

test("registered mechanical models, legacy footprints and cables export together", async () => {
  const mechanicalModel = "nema17_nowires_plainbackface"
  const electronicModel = "soic8"
  const cable: CadCable = {
    type: "cad_cable",
    cad_cable_id: "cad_cable_registration",
    name: "CABLE",
    from_source_component_id: "source_motor",
    to_source_component_id: "source_chip",
    cableprinter_string: "jst_sh_pins4",
    path: [
      { x: -30, y: 12, z: 3 },
      { x: -10, y: 12, z: 3 },
      { x: 10, y: 12, z: 3 },
    ],
  }
  const circuit: CircuitJson = [
    ...(
      [
        ["motor", "MOTOR", mechanicalModel],
        ["chip", "CHIP", electronicModel],
      ] as const
    ).flatMap(([id, name, footprinterString]) => [
      {
        type: "source_component" as const,
        source_component_id: `source_${id}`,
        ftype: "simple_chip" as const,
        name,
      },
      {
        type: "cad_component" as const,
        cad_component_id: `cad_${id}`,
        source_component_id: `source_${id}`,
        anchor_alignment: "center" as const,
        model_object_fit: "contain_within_bounds" as const,
        model_origin_position: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        footprinter_string: footprinterString,
      },
    ]),
    cable,
  ]

  const motor = await loadFootprinterModel(mechanicalModel)
  const chip = await loadFootprinterModel(electronicModel)
  expect(motor?.triangles.length).toBeGreaterThan(100)
  expect(chip?.triangles.length).toBeGreaterThan(100)
  const cableBoxes = loadCable(cable)
  expect(cableBoxes.filter((box) => box.label?.includes("wire-"))).toHaveLength(
    4,
  )

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
    drawFauxBoard: false,
  })
  expect(scene.boxes.map((box) => box.label)).toEqual([
    "MOTOR",
    "CHIP",
    ...cableBoxes.map((box) => box.label),
  ])
  const motorBounds = scene.boxes[0]!.mesh!.boundingBox
  // As in assembly-nema.test.tsx, probe generated millimeter geometry in the
  // scene's +Y-up frame: body behind the mounting face, shaft in front of it.
  expect(motorBounds.max.x - motorBounds.min.x).toBeCloseTo(42.3, 3)
  expect(motorBounds.min.y).toBeCloseTo(-38, 5)
  expect(motorBounds.max.y).toBeCloseTo(24, 5)
  for (const box of scene.boxes) {
    expect(box.mesh?.triangles.length).toBeGreaterThan(0)
    expect(
      box.mesh!.triangles.every((triangle) =>
        triangle.vertices.every((point) =>
          [point.x, point.y, point.z].every(Number.isFinite),
        ),
      ),
    ).toBe(true)
  }

  const gltf = (await convertCircuitJsonToGltf(circuit, {
    format: "gltf",
  })) as GLTF
  expect(gltf.asset.version).toBe("2.0")
  expect(gltf.nodes?.map((node) => node.name)).toEqual(
    scene.boxes.map((box) => box.label),
  )
  for (const node of gltf.nodes!) {
    const primitives = gltf.meshes![node.mesh!]!.primitives
    expect(primitives.length).toBeGreaterThan(0)
    for (const primitive of primitives) {
      expect(
        gltf.accessors![primitive.attributes.POSITION]!.count,
      ).toBeGreaterThan(0)
      expect(gltf.accessors![primitive.indices!]!.count).toBeGreaterThan(0)
    }
  }

  const glb = (await convertCircuitJsonToGltf(circuit, {
    format: "glb",
  })) as ArrayBuffer
  const header = new DataView(glb)
  expect(header.getUint32(0, true)).toBe(0x46546c67)
  expect(header.getUint32(4, true)).toBe(2)
  expect(header.getUint32(8, true)).toBe(glb.byteLength)
  const reloaded = parseGLB(glb)
  expect(reloaded.triangles.length).toBe(
    scene.boxes.reduce((count, box) => count + box.mesh!.triangles.length, 0),
  )
})
