const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])

const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let value = n
  for (let bit = 0; bit < 8; bit++) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  CRC_TABLE[n] = value >>> 0
}

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const uint32Bytes = (value: number) =>
  Uint8Array.from([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ])

const concatBytes = (...parts: Uint8Array[]) => {
  const output = new Uint8Array(
    parts.reduce((length, part) => length + part.length, 0),
  )
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output
}

const createChunk = (type: string, data: Uint8Array) => {
  const typeBytes = new TextEncoder().encode(type)
  const payload = concatBytes(typeBytes, data)
  return concatBytes(
    uint32Bytes(data.length),
    payload,
    uint32Bytes(crc32(payload)),
  )
}

export async function rgbaToPngDataUrl({
  width,
  height,
  pixels,
}: {
  width: number
  height: number
  pixels: Uint8Array
}): Promise<string> {
  if (pixels.length !== width * height * 4) {
    throw new Error(
      `Expected ${width * height * 4} RGBA bytes, received ${pixels.length}`,
    )
  }

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Unable to create a 2D canvas context")
    context.putImageData(
      new ImageData(new Uint8ClampedArray(pixels), width, height),
      0,
      0,
    )
    return canvas.toDataURL("image/png")
  }

  const scanlines = new Uint8Array(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    const scanlineOffset = y * (width * 4 + 1)
    scanlines[scanlineOffset] = 0
    scanlines.set(
      pixels.subarray(y * width * 4, (y + 1) * width * 4),
      scanlineOffset + 1,
    )
  }

  const { deflateSync } = await import("node:zlib")
  const compressed = Uint8Array.from(deflateSync(scanlines, { level: 9 }))
  const ihdr = concatBytes(
    uint32Bytes(width),
    uint32Bytes(height),
    Uint8Array.from([8, 6, 0, 0, 0]),
  )
  const png = concatBytes(
    PNG_SIGNATURE,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", new Uint8Array()),
  )

  return `data:image/png;base64,${Buffer.from(png).toString("base64")}`
}
