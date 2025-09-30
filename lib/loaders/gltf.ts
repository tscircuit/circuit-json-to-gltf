import { Buffer } from "node:buffer"
import { readFile } from "node:fs/promises"
import { dirname, extname, resolve as resolvePath, sep } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import type { LoadedGLTFAsset } from "../types"

const cache = new Map<string, LoadedGLTFAsset>()

interface FetchResult {
  data: ArrayBuffer
  contentType?: string
}

function toArrayBuffer(buffer: Buffer | Uint8Array): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) return buffer
  const view = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const copy = new Uint8Array(view.byteLength)
  copy.set(view)
  return copy.buffer
}

function isDataUri(uri: string): boolean {
  return uri.startsWith("data:")
}

function decodeDataUri(uri: string): ArrayBuffer {
  const commaIndex = uri.indexOf(",")
  if (commaIndex === -1) return new ArrayBuffer(0)
  const data = uri.slice(commaIndex + 1)
  return toArrayBuffer(Buffer.from(data, "base64"))
}

function hasProtocol(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)
}

function isFileUrl(url: string): boolean {
  return url.startsWith("file://")
}

async function fetchAsArrayBuffer(url: string): Promise<FetchResult> {
  if (isDataUri(url)) {
    return { data: decodeDataUri(url) }
  }

  if (isFileUrl(url)) {
    const filePath = fileURLToPath(url)
    const file = await readFile(filePath)
    return { data: toArrayBuffer(file) }
  }

  if (!hasProtocol(url)) {
    const file = await readFile(url)
    return { data: toArrayBuffer(file) }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLTF resource: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.arrayBuffer()
  return {
    data,
    contentType: response.headers.get("content-type") ?? undefined,
  }
}

function resolveBaseUrl(url: string): string {
  if (isFileUrl(url)) {
    const filePath = fileURLToPath(url)
    const dir = dirname(filePath)
    const normalized = dir.endsWith(sep) ? dir : `${dir}${sep}`
    return pathToFileURL(normalized).href
  }

  try {
    const parsed = new URL(url)
    return new URL("./", parsed).href
  } catch {
    const absolute = resolvePath(url)
    const dir = dirname(absolute)
    const normalized = dir.endsWith(sep) ? dir : `${dir}${sep}`
    return pathToFileURL(normalized).href
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
      const basePath = fileURLToPath(baseUrl)
      const resolved = resolvePath(basePath, resourcePath)
      return pathToFileURL(resolved).href
    }
    return `${baseUrl}${resourcePath}`
  }
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

export async function loadGLTF(url: string): Promise<LoadedGLTFAsset> {
  if (cache.has(url)) {
    return cache.get(url) as LoadedGLTFAsset
  }

  const { data, contentType } = await fetchAsArrayBuffer(url)
  const extension = extname(stripQuery(url)).toLowerCase()

  let asset: LoadedGLTFAsset
  if (extension === ".gltf" || contentType === "model/gltf+json") {
    asset = await loadGltfJson(url, data, contentType)
  } else if (extension === ".glb" || contentType === "model/gltf-binary") {
    asset = { kind: "glb", arrayBuffer: data, mimeType: contentType }
  } else {
    const header = new TextDecoder().decode(data.slice(0, 4))
    if (header === "glTF") {
      asset = { kind: "glb", arrayBuffer: data, mimeType: contentType }
    } else {
      asset = await loadGltfJson(url, data, contentType)
    }
  }

  cache.set(url, asset)
  return asset
}

export function clearGLTFCache(): void {
  cache.clear()
}
