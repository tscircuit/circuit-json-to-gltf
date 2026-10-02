import { expect, test } from "bun:test"
import { mat4, vec4 } from "gl-matrix"
import {
  buildCamera,
  createSceneFromGLTF,
  encodePNG,
  loadGLTFWithResourcesFromURL,
  renderSceneFromGLTF,
} from "poppygl"
import {
  convertCircuitJsonTo3D,
  convertSceneToGLTF,
  getPoppyglErrorOverlayOptions,
} from "../../lib"
import { getPoppyglErrorOverlayOptions as browserAdapter } from "../../lib/browser"
import { getPoppyglErrorOverlayOptions as browserIndexAdapter } from "../../lib/browser-index"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"

async function loadScene(input = createCircuitJsonErrors()) {
  const scene = await convertCircuitJsonTo3D(input, {
    showErrors: true,
    renderBoardTextures: false,
  })
  const glb = (await convertSceneToGLTF(scene, { binary: true })) as ArrayBuffer
  const { gltf, resources } = await loadGLTFWithResourcesFromURL(
    `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`,
  )
  return { gltf, scene: createSceneFromGLTF(gltf, resources) }
}

test("stock Poppy labels stay at screen anchors across camera orbits and supersampling", async () => {
  const { gltf, scene } = await loadScene()
  // The selected scene owns error metadata; errors on an unselected scene
  // must not replace or add to it.
  gltf.scenes.unshift({
    extras: { tscircuit: { errorMessages: ["Wrong scene"] } },
  })
  gltf.scene = 1
  const before = JSON.stringify(gltf)
  const width = 820
  const height = 718
  const positions: unknown[] = []
  for (const camPos of [
    [-50, 42, -118],
    [-160, 85, -15],
  ] as const) {
    for (const supersampling of [1, 2, 3]) {
      const camera = buildCamera(
        scene.drawCalls,
        width * supersampling,
        height * supersampling,
        35,
        camPos,
        [-100, 0, -70],
        "y+",
      )
      const cameraBefore = JSON.stringify(camera)
      const overlay = getPoppyglErrorOverlayOptions(gltf, camera, {
        width,
        height,
        supersampling,
        debugFontSize: 20,
      })!
      expect(overlay.debugFontSize).toBe(20 * supersampling)
      expect(overlay.debugPoints[0]!.label).toBe("Circuit JSON errors (2)")
      expect(
        overlay.debugPoints.some((point) =>
          point.label.includes("Wrong scene"),
        ),
      ).toBe(false)
      const viewProjection = mat4.multiply(
        mat4.create(),
        camera.proj,
        camera.view,
      )
      for (const [row, point] of overlay.debugPoints.entries()) {
        const clip = vec4.fromValues(
          point.position.x,
          point.position.y,
          point.position.z,
          1,
        )
        vec4.transformMat4(clip, clip, viewProjection)
        expect(clip[3]).toBeGreaterThan(0)
        const pixelX =
          ((clip[0] / clip[3]) * 0.5 + 0.5) * (width * supersampling - 1)
        const pixelY =
          (1 - ((clip[1] / clip[3]) * 0.5 + 0.5)) * (height * supersampling - 1)
        expect(pixelX / supersampling).toBeCloseTo(16, 2)
        expect(pixelY / supersampling).toBeCloseTo(38 + row * 28, 2)
        expect(clip[2] / clip[3]).toBeCloseTo(0, 4)
      }
      positions.push(overlay.debugPoints[0]!.position)
      expect(JSON.stringify(camera)).toBe(cameraBefore)
    }
  }
  expect(positions[0]).not.toEqual(positions[3])
  expect(JSON.stringify(gltf)).toBe(before)
})

test("adapter wraps long tokens, exposes unsupported glyphs and fits narrow overflow labels", () => {
  const messages = [
    `${"long".repeat(100)}\nResistance: 10 Ω?`,
    ...Array(30).fill("Other error"),
  ]
  const gltf = {
    scenes: [{ extras: { tscircuit: { errorMessages: messages } } }],
  }
  const camera = { view: mat4.create(), proj: mat4.create() }
  const before = JSON.stringify(gltf)
  const narrow = getPoppyglErrorOverlayOptions(gltf, camera, {
    width: 120,
    height: 100,
    debugFontSize: 20,
  })!
  expect(narrow.debugPoints.length).toBeLessThanOrEqual(2)
  expect(narrow.debugPoints.map((point) => point.label).join(" ")).toMatch(
    /\d+ more lines/,
  )
  expect(narrow.debugPoints.every((point) => point.label.length <= 10)).toBe(
    true,
  )
  const full = getPoppyglErrorOverlayOptions(
    { scenes: [{ extras: { tscircuit: { errorMessages: [messages[0]] } } }] },
    camera,
    { width: 820, height: 1200 },
  )!
  const labels = full.debugPoints.map((point) => point.label).join(" ")
  expect(labels).toContain("[U+03A9]")
  expect(labels).toContain("Resistance - 10 [U+03A9].")
  expect(labels).not.toContain("[U+003F]")
  expect(labels).not.toContain("more lines")
  expect(JSON.stringify(gltf)).toBe(before)
})

test("native and browser adapters preserve missing/malformed metadata and reject unusable cameras", () => {
  const camera = { view: mat4.create(), proj: mat4.create() }
  for (const adapter of [
    getPoppyglErrorOverlayOptions,
    browserAdapter,
    browserIndexAdapter,
  ]) {
    for (const gltf of [
      undefined,
      {},
      { scenes: [] },
      { scenes: [{ extras: { tscircuit: { errorMessages: [42] } } }] },
    ]) {
      expect(adapter(gltf, camera, { width: 400, height: 300 })).toBeUndefined()
    }
    const gltf = {
      scenes: [{ extras: { tscircuit: { errorMessages: ["An error"] } } }],
    }
    expect(
      adapter(gltf, camera, { width: 400, height: 300 })!.debugPoints,
    ).toHaveLength(2)
    expect(() =>
      adapter(
        gltf,
        { ...camera, proj: new Float32Array(16) },
        { width: 400, height: 300 },
      ),
    ).toThrow("Cannot unproject")
    expect(() => adapter(gltf, camera, { width: 0, height: 300 })).toThrow(
      RangeError,
    )
  }
})

test("released PoppyGL displays source-only error labels without geometry", async () => {
  const { gltf, scene } = await loadScene(
    createCircuitJsonErrors().filter(
      (element) => element.type === "source_missing_property_error",
    ),
  )
  expect(scene.drawCalls).toHaveLength(0)
  const options = {
    width: 820,
    height: 300,
    fov: 35,
    camPos: [0, 20, 30] as const,
    lookAt: [0, 0, 0] as const,
  }
  const camera = buildCamera(
    scene.drawCalls,
    options.width,
    options.height,
    options.fov,
    options.camPos,
    options.lookAt,
  )
  const overlay = getPoppyglErrorOverlayOptions(gltf, camera, options)!
  const shown = await encodePNG(
    renderSceneFromGLTF(scene, { ...options, ...overlay }).bitmap,
  )
  const hidden = await encodePNG(renderSceneFromGLTF(scene, options).bitmap)
  expect(Buffer.from(shown).equals(Buffer.from(hidden))).toBe(false)
  expect(
    overlay.debugPoints.some((point) => point.label.includes("U1 is missing")),
  ).toBe(true)
})
