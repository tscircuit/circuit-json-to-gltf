import {
  NodeIO,
  type Document,
  type JSONDocument,
  type Node,
  type Scene,
} from "@gltf-transform/core"
import { mergeDocuments, unpartition } from "@gltf-transform/functions"
import type { ExternalGLTFInstance, Point3 } from "../types"

const DEFAULT_ROTATION: [number, number, number, number] = [0, 0, 0, 1]

export async function combineBaseGLTFWithExternalModels(
  baseResult: ArrayBuffer | object,
  format: "gltf" | "glb",
  externals: ExternalGLTFInstance[],
): Promise<ArrayBuffer | object> {
  if (externals.length === 0) {
    return baseResult
  }

  const io = new NodeIO()
  const document = await loadBaseDocument(io, baseResult, format)

  let baseScene = document.getRoot().getDefaultScene()
  if (!baseScene) {
    baseScene = document.createScene("Scene")
    document.getRoot().setDefaultScene(baseScene)
  }

  for (const [index, external] of externals.entries()) {
    const externalDocument = await loadExternalDocument(io, external)
    const map = mergeDocuments(document, externalDocument)

    const externalScene =
      externalDocument.getRoot().getDefaultScene() ??
      externalDocument.getRoot().listScenes()[0]
    if (!externalScene) {
      continue
    }

    const wrapperName = external.name ?? `ExternalGLTF_${index + 1}`
    const wrapperNode = document
      .createNode(wrapperName)
      .setTranslation(pointToArray(external.translation))

    if (external.rotation) {
      wrapperNode.setRotation(eulerToQuaternion(external.rotation))
    }

    if (external.scale) {
      wrapperNode.setScale(pointToArray(external.scale))
    }

    baseScene.addChild(wrapperNode)

    const mappedScene = map.get(externalScene) as Scene | undefined

    for (const child of externalScene.listChildren()) {
      const mappedNode = map.get(child) as Node | undefined
      if (!mappedNode) continue
      wrapperNode.addChild(mappedNode)
    }

    if (mappedScene) {
      mappedScene.dispose()
    }
  }

  const root = document.getRoot()
  if (!root.getDefaultScene()) {
    const scene = document.createScene("Scene")
    root.setDefaultScene(scene)
  }

  if (format === "glb") {
    await document.transform(unpartition())
    const binary = await io.writeBinary(document)
    return binary.buffer.slice(
      binary.byteOffset,
      binary.byteOffset + binary.byteLength,
    )
  }

  const jsonDoc = await io.writeJSON(document)
  return embedResourcesAsDataURIs(jsonDoc)
}

async function loadBaseDocument(
  io: NodeIO,
  baseResult: ArrayBuffer | object,
  format: "gltf" | "glb",
): Promise<Document> {
  if (format === "glb") {
    if (!(baseResult instanceof ArrayBuffer)) {
      throw new Error("Expected ArrayBuffer for GLB base result")
    }
    return io.readBinary(new Uint8Array(baseResult))
  }

  return io.readJSON({ json: baseResult as any, resources: {} })
}

async function loadExternalDocument(
  io: NodeIO,
  external: ExternalGLTFInstance,
): Promise<Document> {
  if (external.format === "glb") {
    const data = await fetchUriAsUint8Array(external.url)
    return io.readBinary(data)
  }

  if (isDataUri(external.url)) {
    const jsonText = decodeText(decodeDataUri(external.url))
    const json = JSON.parse(jsonText)
    return io.readJSON({ json, resources: {} })
  }

  const response = await fetch(external.url)
  if (!response.ok) {
    throw new Error(`Failed to fetch GLTF model from ${external.url}`)
  }
  const jsonText = await response.text()
  const json = JSON.parse(jsonText)
  const resources = await loadExternalResources(json, external.url)
  return io.readJSON({ json, resources })
}

async function loadExternalResources(
  json: any,
  baseUrl: string,
): Promise<Record<string, Uint8Array>> {
  const resources: Record<string, Uint8Array> = {}

  const buffers = Array.isArray(json.buffers) ? json.buffers : []
  const images = Array.isArray(json.images) ? json.images : []

  const base = new URL(baseUrl)

  await Promise.all(
    buffers.map(async (buffer: { uri?: string }) => {
      if (!buffer.uri || isDataUri(buffer.uri)) return
      const resolved = new URL(buffer.uri, base).toString()
      resources[buffer.uri] = await fetchUriAsUint8Array(resolved)
    }),
  )

  await Promise.all(
    images.map(async (image: { uri?: string }) => {
      if (!image.uri || isDataUri(image.uri)) return
      const resolved = new URL(image.uri, base).toString()
      resources[image.uri] = await fetchUriAsUint8Array(resolved)
    }),
  )

  return resources
}

function embedResourcesAsDataURIs(jsonDoc: JSONDocument): object {
  const { json, resources } = jsonDoc

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      if (!buffer.uri) continue
      const data = resources[buffer.uri]
      if (!data) continue
      buffer.uri = buildDataUri("application/octet-stream", data)
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      if (!image.uri) continue
      const data = resources[image.uri]
      if (!data) continue
      image.uri = buildDataUri(guessImageMimeType(image.uri), data)
    }
  }

  return json
}

function pointToArray(point: Point3): [number, number, number] {
  return [point.x ?? 0, point.y ?? 0, point.z ?? 0]
}

function eulerToQuaternion(rotation: Point3): [number, number, number, number] {
  const rx = rotation.x ?? 0
  const ry = rotation.y ?? 0
  const rz = rotation.z ?? 0

  const cx = Math.cos(rx / 2)
  const sx = Math.sin(rx / 2)
  const cy = Math.cos(ry / 2)
  const sy = Math.sin(ry / 2)
  const cz = Math.cos(rz / 2)
  const sz = Math.sin(rz / 2)

  const qx: [number, number, number, number] = [sx, 0, 0, cx]
  const qy: [number, number, number, number] = [0, sy, 0, cy]
  const qz: [number, number, number, number] = [0, 0, sz, cz]

  const qyx = multiplyQuaternions(qx, qy)
  const combined = multiplyQuaternions(qz, qyx)
  return normalizeQuaternion(combined)
}

function multiplyQuaternions(
  a: [number, number, number, number],
  b: [number, number, number, number],
): [number, number, number, number] {
  const [ax, ay, az, aw] = a
  const [bx, by, bz, bw] = b

  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ]
}

function normalizeQuaternion(
  quaternion: [number, number, number, number],
): [number, number, number, number] {
  const [x, y, z, w] = quaternion
  const length = Math.sqrt(x * x + y * y + z * z + w * w)
  if (length === 0) {
    return DEFAULT_ROTATION
  }
  return [x / length, y / length, z / length, w / length]
}

function guessImageMimeType(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "png":
      return "image/png"
    case "webp":
      return "image/webp"
    case "ktx":
    case "ktx2":
      return "image/ktx2"
    default:
      return "application/octet-stream"
  }
}

async function fetchUriAsUint8Array(uri: string): Promise<Uint8Array> {
  if (isDataUri(uri)) {
    return decodeDataUri(uri)
  }

  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error(`Failed to fetch resource ${uri}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

function isDataUri(uri: string): boolean {
  return /^data:/i.test(uri)
}

function decodeDataUri(uri: string): Uint8Array {
  const commaIndex = uri.indexOf(",")
  if (commaIndex === -1) {
    throw new Error("Invalid data URI")
  }
  const metadata = uri.slice(0, commaIndex)
  const data = uri.slice(commaIndex + 1)

  if (metadata.includes(";base64")) {
    return fromBase64(data)
  }

  const decoded = decodeURIComponent(data)
  return new TextEncoder().encode(decoded)
}

function decodeText(data: Uint8Array): string {
  return new TextDecoder().decode(data)
}

function buildDataUri(mimeType: string, data: Uint8Array): string {
  return `data:${mimeType};base64,${toBase64(data)}`
}

function toBase64(data: Uint8Array): string {
  if (typeof globalThis.btoa === "function") {
    let binary = ""
    for (const byte of data) {
      binary += String.fromCharCode(byte)
    }
    return globalThis.btoa(binary)
  }

  const BufferCtor = (globalThis as any).Buffer as
    | {
        from(
          data: Uint8Array,
          encoding?: string,
        ): { toString(encoding: string): string }
      }
    | undefined

  if (BufferCtor) {
    return BufferCtor.from(data).toString("base64")
  }

  throw new Error("No base64 encoder available in this environment")
}

function fromBase64(data: string): Uint8Array {
  if (typeof globalThis.atob === "function") {
    const binary = globalThis.atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  const BufferCtor = (globalThis as any).Buffer as
    | {
        from(
          data: string,
          encoding: string,
        ): { buffer: ArrayBuffer; byteOffset: number; byteLength: number }
      }
    | undefined

  if (BufferCtor) {
    const buffer = BufferCtor.from(data, "base64")
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  throw new Error("No base64 decoder available in this environment")
}
