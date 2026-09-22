import { expect, test } from "bun:test"
import { renderGLTFToPNGFromGLB } from "poppygl"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
  type Box3D,
} from "../../lib"
import { createThreeDiscFlex, DISC_PITCH } from "../../examples/three-disc-flex"
import {
  createPcbFold,
  foldBoardMesh,
  type PcbBendRecord,
} from "../../lib/utils/pcb-fold"
import { foldRigidBox } from "../../lib/utils/fold-rigid-box"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 4)

test("capsule export stacks three discs and CAD models without mutating Circuit JSON", async () => {
  const circuit = createThreeDiscFlex(),
    before = JSON.stringify(circuit)
  const flat = await convertCircuitJsonTo3D(circuit, {
    foldPcbs: false,
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(circuit, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  const implicit = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  expect(implicit).toEqual(flat)
  for (let i = 0; i < 3; i++) {
    const model = folded.boxes.find((b) => b.label === `U${i + 1}`)!
    close(model.center.x, i === 1 ? -1 : 1)
    close(model.center.y, i * 6 + (i === 1 ? -0.575 : 0.575))
    close(model.center.z, 1)
    // Disc surfaces remain flat at exactly 0, 6, 12 mm at their centers.
    const board = folded.boxes[0]!
    const centerVertices = board
      .mesh!.triangles.flatMap((t) => t.vertices)
      .filter((p) => Math.abs(p.x + board.center.x) < 5 && Math.abs(p.z) < 5)
    expect(
      centerVertices.some((p) => Math.abs(p.y - i * 6 - 0.075) < 1e-6),
    ).toBe(true)
    const backing = folded.boxes.find((b) => b.label === `pcb_stiffener_${i}`)!
    const world = backing.mesh!.triangles.flatMap((t) =>
      t.vertices.map((p) => ({
        x: p.x + backing.center.x,
        y: p.y + backing.center.y,
      })),
    )
    close(
      (Math.min(...world.map((p) => p.x)) +
        Math.max(...world.map((p) => p.x))) /
        2,
      0,
    )
    close(
      (Math.min(...world.map((p) => p.y)) +
        Math.max(...world.map((p) => p.y))) /
        2,
      i * 6 + (i === 1 ? 0.225 : -0.225),
    )
  }
  expect(folded.camera!.target.x).toBeLessThan(5)
  expect(folded.camera!.target.y).toBeGreaterThan(5)
  expect(JSON.stringify(circuit)).toBe(before)
  const glb = (await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    foldPcbs: true,
    boardTextureResolution: 512,
  })) as ArrayBuffer
  const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
  expect(mesh.boundingBox.max.y).toBeGreaterThan(12)
  expect(mesh.boundingBox.max.x - mesh.boundingBox.min.x).toBeLessThan(24)
  const png = await renderGLTFToPNGFromGLB(glb, {
    width: 800,
    height: 720,
    backgroundColor: "#f2f3f5",
    ambient: 0.45,
    camPos: [20, 20, 25],
    lookAt: [0, 6, 0],
  })
  await expect(png).toMatchPngSnapshot(
    import.meta.path,
    "three-disc-flex-folded",
  )
})

test("folded board keeps texture surface identity and flat UVs", async () => {
  const scene = await convertCircuitJsonTo3D(createThreeDiscFlex(), {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  const triangles = scene.boxes[0]!.mesh!.triangles
  expect(triangles.some((t) => t.pcbFace === "top" && t.normal.y < -0.99)).toBe(
    true,
  )
  expect(
    triangles.some((t) => t.pcbFace === "top" && Math.abs(t.normal.y) < 0.2),
  ).toBe(true)
  for (const t of triangles) {
    expect(t.uvs).toHaveLength(3)
    for (const uv of t.uvs!) {
      expect(uv.u).toBeGreaterThanOrEqual(-1e-6)
      expect(uv.u).toBeLessThanOrEqual(1 + 1e-6)
      expect(uv.v).toBeGreaterThanOrEqual(-1e-6)
      expect(uv.v).toBeLessThanOrEqual(1 + 1e-6)
    }
  }
  // Same UV means the same developed-material vertex even after curvature.
  const byUv = new Map<string, { x: number; y: number; z: number }>()
  for (const t of triangles.filter((t) => t.pcbFace === "top"))
    for (let i = 0; i < 3; i++) {
      const uv = t.uvs![i]!,
        p = t.vertices[i]!,
        key = `${uv.u.toFixed(7)},${uv.v.toFixed(7)}`
      const previous = byUv.get(key)
      if (previous) {
        close(p.x, previous.x)
        close(p.y, previous.y)
        close(p.z, previous.z)
      } else byUv.set(key, p)
    }
})

test("exported off-axis model geometry follows folds after all existing rotations on both layers", async () => {
  const bend: PcbBendRecord = {
    type: "pcb_bend",
    pcb_bend_id: "b",
    pcb_board_id: "board",
    start: { x: 0, y: -20 },
    end: { x: 0, y: 20 },
    bend_angle: 90,
    bend_radius: 1,
    bend_side: "right",
  }
  const fold = createPcbFold([bend], 0.15)
  for (const bottom of [false, true])
    for (const angle of [0, 37, 90, 180, 270]) {
      const box: Box3D = {
        center: { x: 8, y: bottom ? -1 : 1, z: 2 },
        size: { x: 2, y: 1, z: 3 },
        rotation: { x: bottom ? Math.PI : 0, y: (angle * Math.PI) / 180, z: 0 },
        mesh: {
          triangles: [
            {
              vertices: [
                { x: -0.8, y: 0.2, z: 0.3 },
                { x: 0.9, y: 0.2, z: 0.4 },
                { x: 0.1, y: 0.2, z: 1.2 },
              ],
              normal: { x: 0, y: 1, z: 0 },
              color: [1, 0, 0, 1],
            },
          ],
          boundingBox: {
            min: { x: -0.8, y: 0.2, z: 0.3 },
            max: { x: 0.9, y: 0.2, z: 1.2 },
          },
        },
      }
      const original = JSON.stringify(box)
      const transformed = foldRigidBox(
        box,
        fold,
        { x: 0, y: 0 },
        { x: 8, y: 2 },
      )
      const flat = parseGLB(
        (await convertSceneToGLTF(
          { boxes: [box] },
          { binary: true },
        )) as ArrayBuffer,
        COORDINATE_TRANSFORMS.IDENTITY,
      )
      const folded = parseGLB(
        (await convertSceneToGLTF(
          { boxes: [transformed] },
          { binary: true },
        )) as ArrayBuffer,
        COORDINATE_TRANSFORMS.IDENTITY,
      )
      const a = flat.triangles[0]!,
        b = folded.triangles[0]!
      for (let i = 0; i < 3; i++) {
        // Measured glTF coordinates: X mirrored once, +Y up. Beyond a 1 mm
        // quarter-circle the moving face lies at x=1-pi/4 and rises with flat X.
        close(b.vertices[i]!.x, Math.PI / 4 - 1 + a.vertices[i]!.y)
        close(b.vertices[i]!.y, -a.vertices[i]!.x - Math.PI / 4 + 1)
        close(b.vertices[i]!.z, a.vertices[i]!.z)
      }
      close(b.normal.x, a.normal.y)
      close(b.normal.y, -a.normal.x)
      close(b.normal.z, a.normal.z)
      expect(JSON.stringify(box)).toBe(original)
    }
})

test("partial bend centerlines and rigid components across bend zones are rejected", async () => {
  const circuit = createThreeDiscFlex()
  const partial = circuit.map((e) =>
    e.type === "pcb_bend"
      ? { ...e, start: { ...e.start, y: -0.1 }, end: { ...e.end, y: 0.1 } }
      : e,
  )
  await expect(
    convertCircuitJsonTo3D(partial, {
      foldPcbs: true,
      renderBoardTextures: false,
    }),
  ).rejects.toThrow("full board cross-section")
  const first = circuit.find((e): e is PcbBendRecord => e.type === "pcb_bend")!
  const bad = circuit.map((e) =>
    e.type === "cad_component"
      ? { ...e, position: { x: DISC_PITCH + first.start.x, y: 0, z: 0.5 } }
      : e,
  )
  await expect(
    convertCircuitJsonTo3D(bad, {
      foldPcbs: true,
      renderBoardTextures: false,
    }),
  ).rejects.toThrow("intersects PCB bend zone")
  const wrong = circuit.map((e) =>
    e.type === "pcb_bend" ? { ...e, pcb_board_id: "wrong" } : e,
  )
  await expect(
    convertCircuitJsonTo3D(wrong, {
      foldPcbs: true,
      renderBoardTextures: false,
    }),
  ).rejects.toThrow("matching board")
})

test("standalone CAD geometry stays fixed while board-bound components fold", async () => {
  const circuit = createThreeDiscFlex()
  circuit.push({
    type: "cad_component",
    cad_component_id: "capsule",
    source_component_id: "source_capsule",
    position: { x: 0, y: 0, z: 6 },
    model_jscad: { type: "cuboid", size: [15, 15, 18] },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  })
  const flat = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(circuit, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  const getStandalone = (scene: typeof flat) =>
    scene.boxes.find((b) => b.size.x === 15 && b.size.y === 18)!
  expect(getStandalone(folded)).toEqual(getStandalone(flat))
})
