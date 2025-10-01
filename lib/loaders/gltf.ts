import { promises as fs } from "node:fs"
import { isAbsolute, join } from "node:path"

import { NodeIO, type Document } from "@gltf-transform/core"
import {
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
} from "@gltf-transform/extensions"
import { MeshoptDecoder } from "meshoptimizer"
import draco3d from "draco3dgltf"

import type { LoadedGLTFAsset } from "../types"

const gltfCache = new Map<string, LoadedGLTFAsset>()

let ioPromise: Promise<NodeIO> | null = null
let dracoDecoderPromise: Promise<unknown> | null = null

async function getNodeIO(): Promise<NodeIO> {
  if (!ioPromise) {
    ioPromise = initializeNodeIO()
  }
  return ioPromise
}

async function initializeNodeIO(): Promise<NodeIO> {
  await MeshoptDecoder.ready
  const decoderModule = await getDracoDecoder()

  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRDracoMeshCompression])
    .registerDependencies({
      "meshopt.decoder": MeshoptDecoder,
      "draco3d.decoder": decoderModule,
    })

  return io
}

async function getDracoDecoder(): Promise<unknown> {
  if (!dracoDecoderPromise) {
    dracoDecoderPromise = draco3d.createDecoderModule()
  }
  return dracoDecoderPromise
}

function normalizeUrl(url: string): string {
  if (/^data:/i.test(url)) {
    return url
  }

  if (/^https?:/i.test(url) || /^file:/i.test(url)) {
    return url
  }

  if (isAbsolute(url)) {
    return `file://${url}`
  }

  return `file://${join(process.cwd(), url)}`
}

async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  if (url.startsWith("data:")) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `Failed to load GLTF data URL: ${response.status} ${response.statusText}`,
      )
    }
    return await response.arrayBuffer()
  }

  if (url.startsWith("file://")) {
    const filePath = url.slice("file://".length)
    const data = await fs.readFile(filePath)
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLTF asset: ${response.status} ${response.statusText}`,
    )
  }
  return await response.arrayBuffer()
}

export async function loadGLTF(url: string): Promise<LoadedGLTFAsset> {
  const normalized = normalizeUrl(url)
  if (gltfCache.has(normalized)) {
    return gltfCache.get(normalized)!
  }

  const io = await getNodeIO()
  const buffer = await fetchArrayBuffer(normalized)
  const bytes = new Uint8Array(buffer)

  const document = await (isBinaryGLB(bytes)
    ? io.readBinary(bytes)
    : loadJSONDocument(io, bytes, normalized))

  const asset: LoadedGLTFAsset = {
    url: normalized,
    document,
  }

  gltfCache.set(normalized, asset)
  return asset
}

export function clearGLTFCache(targetUrl?: string): void {
  if (!targetUrl) {
    gltfCache.clear()
    return
  }

  const normalized = normalizeUrl(targetUrl)
  gltfCache.delete(normalized)
}

export async function getSharedNodeIO(): Promise<NodeIO> {
  return getNodeIO()
}

function isBinaryGLB(bytes: Uint8Array): boolean {
  if (bytes.byteLength < 4) return false
  return (
    bytes[0] === 0x67 &&
    bytes[1] === 0x6c &&
    bytes[2] === 0x54 &&
    bytes[3] === 0x46
  )
}

async function loadJSONDocument(
  io: NodeIO,
  bytes: Uint8Array,
  sourceUrl: string,
): Promise<Document> {
  const text = new TextDecoder("utf-8").decode(bytes)
  const json = JSON.parse(text)
  const resources = await loadJsonResources(json, sourceUrl)
  return io.readJSON({ json, resources })
}

async function loadJsonResources(
  json: Record<string, any>,
  sourceUrl: string,
): Promise<Record<string, ArrayBuffer | Uint8Array>> {
  const resources: Record<string, ArrayBuffer | Uint8Array> = {}
  const baseUrl = getBaseUrl(sourceUrl)
  const pending: Promise<void>[] = []
  const seen = new Set<string>()

  const queueFetch = (uri: unknown) => {
    if (typeof uri !== "string") return
    if (!uri || uri.startsWith("data:")) return
    if (seen.has(uri)) return

    const resolved = resolveResourceUrl(uri, baseUrl)
    if (!resolved) {
      throw new Error(`Unable to resolve GLTF resource URI: ${uri}`)
    }

    seen.add(uri)
    pending.push(
      fetchArrayBuffer(resolved).then((data) => {
        resources[uri] = data
      }),
    )
  }

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      queueFetch(buffer?.uri)
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      queueFetch(image?.uri)
    }
  }

  await Promise.all(pending)
  return resources
}

function getBaseUrl(sourceUrl: string): string | null {
  if (!sourceUrl || sourceUrl.startsWith("data:")) {
    return null
  }

  const lastSlash = sourceUrl.lastIndexOf("/")
  if (lastSlash === -1) {
    return null
  }

  return sourceUrl.slice(0, lastSlash + 1)
}

function resolveResourceUrl(
  uri: string,
  baseUrl: string | null,
): string | null {
  if (/^(data:|https?:|file:)/i.test(uri)) {
    return uri
  }

  if (!baseUrl) {
    return null
  }

  try {
    return new URL(uri, baseUrl).href
  } catch {
    return null
  }
}
