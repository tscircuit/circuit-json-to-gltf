import { expect, test } from "bun:test"
import {
  initializeStepImporterWasm,
  initializeSvgToPngWasm,
  renderBoardLayer,
} from "../../lib/index"
import { loadSTEP } from "../../lib/loaders/step"
import { svgToPng } from "../../lib/utils/svg-to-png-browser"

const withoutNetwork = async (run: () => Promise<void>) => {
  const previousFetch = globalThis.fetch
  const requests: unknown[] = []
  globalThis.fetch = Object.assign(
    async (...request: Parameters<typeof fetch>) => {
      requests.push(request)
      throw new Error("External requests are disabled")
    },
    { preconnect: () => {} },
  )
  try {
    await run()
    expect(requests).toEqual([])
  } finally {
    globalThis.fetch = previousFetch
  }
}

test("supplied Resvg bytes render real PNGs and browser board textures", async () => {
  await withoutNetwork(async () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="red"/></svg>'
    await expect(initializeSvgToPngWasm(new Uint8Array([0]))).rejects.toThrow()
    await expect(svgToPng(svg)).rejects.toThrow()
    const wasm = await Bun.file(
      new URL(
        "../../node_modules/@resvg/resvg-wasm/index_bg.wasm",
        import.meta.url,
      ),
    ).arrayBuffer()
    await initializeSvgToPngWasm(wasm)
    const png = await svgToPng(svg)
    expect(Array.from(png.subarray(0, 8))).toEqual([
      137, 80, 78, 71, 13, 10, 26, 10,
    ])
    expect(
      new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(16),
    ).toBe(16)

    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
    const previousDocument = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    )
    Object.defineProperty(globalThis, "window", {
      value: {},
      configurable: true,
    })
    Object.defineProperty(globalThis, "document", {
      value: {},
      configurable: true,
    })
    try {
      const dataUrl = await renderBoardLayer(
        [
          {
            type: "pcb_board",
            pcb_board_id: "board1",
            center: { x: 0, y: 0 },
            width: 10,
            height: 10,
            thickness: 1.6,
            num_layers: 2,
          },
        ] as any,
        { layer: "top", resolution: 32 },
      )
      expect(dataUrl).toStartWith("data:image/png;base64,")
      const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]!), (c) =>
        c.charCodeAt(0),
      )
      expect(new DataView(bytes.buffer).getUint32(16)).toBe(32)
    } finally {
      if (previousWindow)
        Object.defineProperty(globalThis, "window", previousWindow)
      else Reflect.deleteProperty(globalThis, "window")
      if (previousDocument)
        Object.defineProperty(globalThis, "document", previousDocument)
      else Reflect.deleteProperty(globalThis, "document")
    }
    await expect(initializeSvgToPngWasm(wasm)).rejects.toThrow(
      "already been initialized",
    )
  })
})

test("supplied OCCT bytes parse a real cached STEP file", async () => {
  await withoutNetwork(async () => {
    const step = await Bun.file(
      new URL("../assets/Contact.step", import.meta.url),
    ).arrayBuffer()
    const fetch: typeof globalThis.fetch = Object.assign(
      async () => new Response(step),
      { preconnect: () => {} },
    )
    const options = { url: "https://assets.example.test/part.step", fetch }
    await expect(
      initializeStepImporterWasm(new Uint8Array([0])),
    ).rejects.toThrow()
    await expect(loadSTEP(options)).rejects.toThrow()
    const wasm = await Bun.file(
      new URL(
        "../../node_modules/occt-import-js/dist/occt-import-js.wasm",
        import.meta.url,
      ),
    ).arrayBuffer()
    await initializeStepImporterWasm(wasm)
    const mesh = await loadSTEP(options)
    expect(mesh.triangles.length).toBeGreaterThan(0)
    expect(mesh.boundingBox.max.x).toBeGreaterThan(mesh.boundingBox.min.x)
    await expect(initializeStepImporterWasm(wasm)).rejects.toThrow(
      "already been initialized",
    )
  })
})
