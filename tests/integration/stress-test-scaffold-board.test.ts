import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { GLTFBuilder } from "../../lib/gltf/gltf-builder"
import scaffoldBoardFixture from "../fixtures/scaffold-board-lrg-lrg.json"

test("convert scaffold board fixture to GLB output (Stress test)", async () => {
  const totalStartMs = performance.now()
  const sceneStartMs = performance.now()
  const scene3d = await convertCircuitJsonTo3D(scaffoldBoardFixture as any, {
    renderBoardTextures: true,
    textureResolution: 512,
    boardDrillQuality: "fast",
    showBoundingBoxes: false,
  })
  const sceneMs = performance.now() - sceneStartMs

  const builder = new GLTFBuilder()
  const meshCreationStartMs = performance.now()
  await builder.buildFromScene3D(scene3d)
  const meshCreationMs = performance.now() - meshCreationStartMs

  const result = builder.export(true)

  const totalMs = performance.now() - totalStartMs

  const phases = [
    { name: "sceneCreation", ms: sceneMs },
    { name: "meshCreation", ms: meshCreationMs },
  ]
  const slowestPhase = phases.reduce((slowest, current) =>
    current.ms > slowest.ms ? current : slowest,
  )

  console.table({
    total: `${totalMs.toFixed(2)}ms`,
    sceneCreation: `${sceneMs.toFixed(2)}ms`,
    meshCreation: `${meshCreationMs.toFixed(2)}ms`,
    slowestPhase: `${slowestPhase.name}(${slowestPhase.ms.toFixed(2)}ms)`,
  })

  expect(result).toBeInstanceOf(ArrayBuffer)
  expect((result as ArrayBuffer).byteLength).toBeGreaterThan(0)
}, 30_000)
