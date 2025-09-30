import { Buffer } from "node:buffer"
import { readFile } from "node:fs/promises"
import { dirname, extname, resolve as resolvePath, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import type { LoadedGLTFAsset } from "../types"

const gltfCache = new Map<string, LoadedGLTFAsset>()

interface FetchResult {
  data: ArrayBuffer
  contentType?: string
}

function bufferToArrayBuffer(buffer: Buffer | Uint8Array): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) {
    return buffer
  }
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  )
}

function isDataUri(uri: string): boolean {
  return uri.startsWith("data:")
}

function decodeDataUri(uri: string): ArrayBuffer {
  const [, dataPart] = uri.split(",", 2)
  if (!dataPart) return new ArrayBuffer(0)
  const binary = Buffer.from(dataPart, "base64")
  return bufferToArrayBuffer(binary)
}

function isFileUrl(url: string): boolean {
  return url.startsWith("file://")
}

function hasProtocol(url: string): boolean {
  return /^[a-zA-Z]+:/i.test(url)
}

async function fetchAsArrayBuffer(url: string): Promise<FetchResult> {
  if (isDataUri(url)) {
    return { data: decodeDataUri(url) }
  }

  if (isFileUrl(url)) {
    const filePath = fileURLToPath(new URL(url))
    const buffer = await readFile(filePath)
    return { data: bufferToArrayBuffer(buffer) }
  }

  if (!hasProtocol(url)) {
    const buffer = await readFile(url)
    return { data: bufferToArrayBuffer(buffer) }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch GLTF resource: ${response.status} ${response.statusText}`)
  }

  const data = await response.arrayBuffer()
  const contentType = response.headers.get("content-type") ?? undefined
  return { data, contentType }
}

async function loadGltfJson(
  url: string,
  data: ArrayBuffer,
  contentType?: string,
): Promise<LoadedGLTFAsset> {
  const decoder = new TextDecoder()
  const json = JSON.parse(decoder.decode(data))
  const resources: Record<string, ArrayBuffer> = {}

  const baseUrl = resolveBaseUrl(url)

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      if (!buffer?.uri || isDataUri(buffer.uri)) continue
      const resourceUrl = resolveResourceUrl(baseUrl, buffer.uri)
      const result = await fetchAsArrayBuffer(resourceUrl)
      resources[buffer.uri] = result.data
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      if (!image?.uri || isDataUri(image.uri)) continue
      const resourceUrl = resolveResourceUrl(baseUrl, image.uri)
      const result = await fetchAsArrayBuffer(resourceUrl)
      resources[image.uri] = result.data
    }
  }

  return {
    kind: "gltf",
    json,
    resources,
    mimeType: contentType,
  }
}

function resolveBaseUrl(url: string): string {
  if (isFileUrl(url)) {
    const file = fileURLToPath(new URL(url))
    const dir = dirname(file)
    const normalizedDir = dir.endsWith(sep) ? dir : `${dir}${sep}`
    return pathToFileURL(normalizedDir).href
  }

  try {
    const parsed = new URL(url)
    return new URL("./", parsed).href
  } catch {
    const absolute = resolvePath(url)
    const dir = dirname(absolute)
    const normalizedDir = dir.endsWith(sep) ? dir : `${dir}${sep}`
    return pathToFileURL(normalizedDir).href
  }
}

function resolveResourceUrl(baseUrl: string, resourcePath: string): string {
  if (hasProtocol(resourcePath) || isDataUri(resourcePath)) {
    return resourcePath
  }

  try {
    return new URL(resourcePath, baseUrl).href
  } catch {
    if (isFileUrl(baseUrl)) {
      const basePath = fileURLToPath(new URL(baseUrl))
      const combined = resolvePath(basePath, resourcePath)
      return pathToFileURL(combined).href
    }
    return `${baseUrl}${resourcePath}`
  }
}

export async function loadGLTF(url: string): Promise<LoadedGLTFAsset> {
  if (gltfCache.has(url)) {
    return gltfCache.get(url)!
  }

  const { data, contentType } = await fetchAsArrayBuffer(url)

  const extension = extname(stripQuery(url)).toLowerCase()
  let asset: LoadedGLTFAsset

  if (extension === ".gltf" || contentType === "model/gltf+json") {
    asset = await loadGltfJson(url, data, contentType)
  } else if (extension === ".glb" || contentType === "model/gltf-binary") {
    asset = {
      kind: "glb",
      arrayBuffer: data,
      mimeType: contentType,
    }
  } else {
    // Attempt to detect by first bytes
    const header = new TextDecoder().decode(data.slice(0, 4))
    if (header === "glTF") {
      asset = {
        kind: "glb",
        arrayBuffer: data,
        mimeType: contentType,
      }
    } else {
      asset = await loadGltfJson(url, data, contentType)
    }
  }

  gltfCache.set(url, asset)
  return asset
}

export function clearGLTFCache(): void {
  gltfCache.clear()
}

function stripQuery(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ""
    parsed.search = ""
    return parsed.pathname
  } catch {
    return url.split(/[?#]/)[0] ?? url
  }
}
