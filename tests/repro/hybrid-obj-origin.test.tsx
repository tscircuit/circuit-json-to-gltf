import { beforeAll, expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { Circuit } from "tscircuit"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { transformMesh } from "../../lib/gltf/geometry"
import type { OBJMesh } from "../../lib/types"
import { renderGlbToPng } from "../renderGlbToPng"

// A deliberately simplified hybrid connector, not an imported historical board.
// Model coordinates: mm, +Z up, board mating plane Z=0, XY center (0,0).
// Both models have identical XY bounds, housing and surface-mount contacts.
// Only the tips of the two legs at Y=-3 extend an extra 1 mm below the PCB.
async function makeCircuit(
  extended: boolean,
  explicitOrigin = false,
  rotation = 0,
  layer: "top" | "bottom" = "top",
) {
  const circuit = new Circuit()
  circuit.add(
    <board width="14mm" height="14mm" thickness="1.6mm">
      <chip
        name="J1"
        pcbX={0}
        pcbY={0}
        pcbRotation={rotation}
        layer={layer}
        cadModel={{
          objUrl: `${import.meta.dir}/../assets/hybrid-${extended ? "extended" : "equal"}-legs.obj`,
          ...(explicitOrigin
            ? { modelOriginPosition: { x: 0, y: 0, z: 0 } }
            : {}),
        }}
        footprint={
          <footprint>
            <smtpad
              portHints={["1"]}
              pcbX={-1.5}
              pcbY={3}
              width={1}
              height={1}
              shape="rect"
            />
            <smtpad
              portHints={["2"]}
              pcbX={1.5}
              pcbY={3}
              width={1}
              height={1}
              shape="rect"
            />
            <platedhole
              pcbX={-3}
              pcbY={-3}
              holeDiameter={0.8}
              outerDiameter={1.2}
              shape="circle"
            />
            <platedhole
              pcbX={-3}
              pcbY={3}
              holeDiameter={0.8}
              outerDiameter={1.2}
              shape="circle"
            />
            <platedhole
              pcbX={3}
              pcbY={-3}
              holeDiameter={0.8}
              outerDiameter={1.2}
              shape="circle"
            />
            <platedhole
              pcbX={3}
              pcbY={3}
              holeDiameter={0.8}
              outerDiameter={1.2}
              shape="circle"
            />
          </footprint>
        }
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  return circuit.getCircuitJson()
}

async function getSignalContact(
  extended: boolean,
  explicitOrigin = false,
  rotation = 0,
  layer: "top" | "bottom" = "top",
) {
  const json = await makeCircuit(extended, explicitOrigin, rotation, layer)
  const cad = json.find((e) => e.type === "cad_component")!
  expect(cad.model_origin_alignment).toBe(
    "center_of_component_on_board_surface",
  )
  expect(cad.model_origin_position).toEqual(
    explicitOrigin ? { x: 0, y: 0, z: 0 } : undefined,
  )
  const scene = await convertCircuitJsonTo3D(json, {
    renderBoardTextures: false,
  })
  const box = scene.boxes.find((b) => b.label === "J1")!
  const mesh = box.mesh as OBJMesh
  expect(mesh).toBeDefined()
  const material = mesh.materialIndexMap!.get("signal_right")!
  const points = mesh.triangles
    .filter((t) => t.materialIndex === material)
    .flatMap((t) => t.vertices)
  expect(points.length).toBeGreaterThan(0)
  // Scene3D uses +Y up: the pad-facing surface is the minimum Y of this
  // specific SMD contact, not the minimum Y of the whole connector.
  const contactY = Math.min(...points.map((p) => p.y))
  const surfacePoints = points.filter((p) => Math.abs(p.y - contactY) < 1e-6)
  // Use the actual export rotation from GLTFBuilder.addOBJMeshWithMaterials (the
  // transformMesh call before convertMeshToGLTFOrientation). Scene3D points
  // are +Y up, mm; translation applies to these positions. Undo the Y/Z swap
  // only when comparing with the independently rendered Circuit JSON pads.
  const world = transformMesh(
    {
      positions: surfacePoints.flatMap((p) => [p.x, p.y, p.z]),
      normals: [],
      texcoords: [],
      indices: [],
    },
    box.center,
    box.rotation,
  ).positions
  const midpoint = (axis: number) => {
    const values = world.filter((_, index) => index % 3 === axis)
    return (Math.min(...values) + Math.max(...values)) / 2
  }
  const contact = { x: midpoint(0), y: midpoint(2), z: midpoint(1) }
  const pad = json.find(
    (e): e is PcbSmtPad =>
      e.type === "pcb_smtpad" && Boolean(e.port_hints?.includes("2")),
  )!
  expect(pad).toBeDefined()
  expect(pad.shape).toBe("rect")
  return { contact, pad }
}

// REPRO_STRICT=1 exposes the failing assertions. Otherwise Bun records them
// as known failures, and reports an unexpected pass when the bug is fixed.
const regressionTest = process.env.REPRO_STRICT === "1" ? test : test.failing
test("the OBJ fixtures differ only in below-board leg-tip depth", async () => {
  const original = (
    await Bun.file(`${import.meta.dir}/../assets/hybrid-equal-legs.obj`).text()
  ).split("\n")
  const extended = (
    await Bun.file(
      `${import.meta.dir}/../assets/hybrid-extended-legs.obj`,
    ).text()
  ).split("\n")
  expect(extended.length).toBe(original.length)
  const vertices = original
    .filter((line) => line.startsWith("v "))
    .map((line) => line.split(" ").slice(1).map(Number))
  for (const axis of [0, 1]) {
    const values = vertices.map((v) => v[axis]!)
    expect((Math.min(...values) + Math.max(...values)) / 2).toBe(0)
  }
  let changedVertices = 0
  for (let index = 0; index < original.length; index++) {
    if (original[index] === extended[index]) continue
    const [kind, x, y, z] = original[index]!.split(" ")
    const [nextKind, nextX, nextY, nextZ] = extended[index]!.split(" ")
    expect([kind, nextKind]).toEqual(["v", "v"])
    expect([nextX, nextY]).toEqual([x, y])
    expect(Number(y)).toBeLessThan(0)
    expect([Number(z), Number(nextZ)]).toEqual([-1, -2])
    changedVertices++
  }
  expect(changedVertices).toBe(8)
})

for (const layer of ["top", "bottom"] as const) {
  for (const rotation of [0, 90, 180, 270]) {
    let equal: Awaited<ReturnType<typeof getSignalContact>>
    let extended: typeof equal
    let explicit: typeof equal
    beforeAll(async () => {
      // Model loading and fixture validation are outside test.failing so an
      // unrelated setup error cannot count as reproduction of the defect.
      equal = await getSignalContact(false, false, rotation, layer)
      extended = await getSignalContact(true, false, rotation, layer)
      explicit = await getSignalContact(true, true, rotation, layer)
    })
    const assertOnPad = ({ contact, pad }: typeof equal) => {
      if (pad.shape !== "rect")
        throw new Error("Expected rectangular signal pad")
      expect(contact.x).toBeCloseTo(pad.x, 6)
      expect(contact.y).toBeCloseTo(pad.y, 6)
      expect(contact.z).toBeCloseTo(layer === "top" ? 0.8 : -0.8, 6)
    }
    test(`${layer} ${rotation}deg: equal-depth legs stay on the pad`, () =>
      assertOnPad(equal))
    test(`${layer} ${rotation}deg: explicit origin stays on the pad`, () =>
      assertOnPad(explicit))
    regressionTest(
      `${layer} ${rotation}deg: deeper legs must not shift the SMD contact`,
      () => assertOnPad(extended),
    )
  }
}

test("hybrid connector origin comparison snapshots", async () => {
  for (const [name, extended, explicit] of [
    ["equal-legs", false, false],
    ["extended-legs-inferred", true, false],
    ["extended-legs-explicit", true, true],
  ] as const) {
    const json = await makeCircuit(extended, explicit)
    const glb = await convertCircuitJsonToGltf(json, { format: "glb" })
    expect(
      await renderGlbToPng(glb as ArrayBuffer, json, undefined, {
        direction: [-0.7, 1.2, 0.8],
      }),
    ).toMatchPngSnapshot(import.meta.path, name)
  }
}, 30000)
