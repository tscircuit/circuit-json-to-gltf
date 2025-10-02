import type { CoordinateTransformConfig, STLMesh } from "../types"
import { parseGLB } from "./glb"

async function fetchAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  return response.arrayBuffer()
}

function dataUriToArrayBuffer(uri: string): ArrayBuffer {
  const a = uri.split(",")
  const byteString = atob(a[1]!)
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return ab
}

export async function fetchGltfAndConvertToGlb(
  url: string,
): Promise<ArrayBuffer> {
  const gltfResponse = await fetch(url)
  if (!gltfResponse.ok) {
    throw new Error(`Failed to fetch glTF file: ${gltfResponse.statusText}`)
  }
  const gltf = await gltfResponse.json()

  const bufferPromises: Promise<ArrayBuffer>[] = []
  if (gltf.buffers) {
    for (const buffer of gltf.buffers) {
      if (buffer.uri) {
        if (buffer.uri.startsWith("data:")) {
          bufferPromises.push(Promise.resolve(dataUriToArrayBuffer(buffer.uri)))
        } else {
          const bufferUrl = new URL(buffer.uri, url).toString()
          bufferPromises.push(fetchAsArrayBuffer(bufferUrl))
        }
      }
    }
  }

  const buffers = await Promise.all(bufferPromises)

  let binaryBuffer = new ArrayBuffer(0)
  if (buffers.length > 0 && buffers[0]) {
    binaryBuffer = buffers[0]
  }

  // Update JSON to point to the new binary chunk
  if (gltf.buffers && gltf.buffers.length > 0) {
    delete gltf.buffers[0].uri
    gltf.buffers[0].byteLength = binaryBuffer.byteLength
  }

  const jsonString = JSON.stringify(gltf)
  const jsonBuffer = new TextEncoder().encode(jsonString)

  // Align buffers to 4-byte boundaries
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4
  const binaryPadding = (4 - (binaryBuffer.byteLength % 4)) % 4

  const totalLength =
    12 + // header
    (8 + jsonBuffer.length + jsonPadding) + // json chunk
    (binaryBuffer.byteLength > 0
      ? 8 + binaryBuffer.byteLength + binaryPadding
      : 0) // binary chunk

  const glbBuffer = new ArrayBuffer(totalLength)
  const dataView = new DataView(glbBuffer)
  let offset = 0

  // Header
  dataView.setUint32(offset, 0x46546c67, true) // 'glTF'
  offset += 4
  dataView.setUint32(offset, 2, true) // version 2
  offset += 4
  dataView.setUint32(offset, totalLength, true)
  offset += 4

  // JSON chunk
  dataView.setUint32(offset, jsonBuffer.length + jsonPadding, true)
  offset += 4
  dataView.setUint32(offset, 0x4e4f534a, true) // 'JSON'
  offset += 4
  new Uint8Array(glbBuffer, offset).set(jsonBuffer)
  offset += jsonBuffer.length
  for (let i = 0; i < jsonPadding; i++) {
    dataView.setUint8(offset++, 0x20) // space
  }

  // Binary chunk
  if (binaryBuffer.byteLength > 0) {
    dataView.setUint32(offset, binaryBuffer.byteLength + binaryPadding, true)
    offset += 4
    dataView.setUint32(offset, 0x004e4942, true) // 'BIN'
    offset += 4
    new Uint8Array(glbBuffer, offset).set(new Uint8Array(binaryBuffer))
    offset += binaryBuffer.byteLength
    for (let i = 0; i < binaryPadding; i++) {
      dataView.setUint8(offset++, 0x00) // null
    }
  }

  return glbBuffer
}

export async function loadGLTF(
  url: string,
  transform?: CoordinateTransformConfig,
): Promise<STLMesh> {
  const glb_buffer = await fetchGltfAndConvertToGlb(url)
  return parseGLB(glb_buffer, transform)
}
