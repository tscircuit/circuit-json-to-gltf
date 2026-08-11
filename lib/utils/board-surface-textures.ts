import { rgbaToPngDataUrl } from "./rgba-to-png"

const PLAIN_SOLDERMASK_HEIGHT = 0.22
const MASKED_COPPER_HEIGHT = 0.7
const EXPOSED_COPPER_HEIGHT = 0.86

export const REALISTIC_BOARD_SURFACE_MATERIAL = {
  // The viewer layers a 0.12 bump map under a 0.08 normal map. glTF has no
  // portable bump-map slot, so combine those strengths in the normal map.
  normalScale: 0.2,
  roughness: 0.7,
  roughnessBias: 0.015,
  roughnessVariance: 0.025,
  clearcoat: 0.08,
  clearcoatRoughness: 0.55,
  detailStrength: 0.035,
}

export const PAD_COPPER_TEXTURE_MATERIAL = {
  roughness: 0.42,
  metalness: 0.5,
  roughnessVariance: 0.035,
  detailStrength: 0.028,
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const invertSurfaceHeight = (height: number) => 1 - height

const hashNoise = (x: number, y: number, salt: number) => {
  let hash = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ salt
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295
}

const smoothstep = (value: number) => value * value * (3 - 2 * value)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const valueNoise = (x: number, y: number, scale: number, salt: number) => {
  const sx = x / scale
  const sy = y / scale
  const x0 = Math.floor(sx)
  const y0 = Math.floor(sy)
  const tx = smoothstep(sx - x0)
  const ty = smoothstep(sy - y0)
  const top = lerp(hashNoise(x0, y0, salt), hashNoise(x0 + 1, y0, salt), tx)
  const bottom = lerp(
    hashNoise(x0, y0 + 1, salt),
    hashNoise(x0 + 1, y0 + 1, salt),
    tx,
  )
  return lerp(top, bottom, ty)
}

const createCopperDetail = (x: number, y: number, salt: number) => {
  const etch = (valueNoise(x, y, 7, salt + 31) - 0.5) * 0.55
  const brush = Math.sin(x * 0.12 + valueNoise(x, y, 44, salt + 37) * 2) * 0.22
  return (etch + brush) * PAD_COPPER_TEXTURE_MATERIAL.detailStrength
}

const createMaskedTraceDetail = (x: number, y: number, salt: number) => {
  const etch = (hashNoise(x, y, salt + 53) - 0.5) * 0.42
  const routingGrain =
    Math.sin(x * 0.26 + y * 0.06) * 0.2 + Math.sin(y * 0.31 - x * 0.04) * 0.12
  return (etch + routingGrain) * 0.045
}

export interface BoardSurfaceTextureSet {
  normal: string
  metallicRoughness: string
}

/**
 * Builds portable glTF surface maps from a synthetic RGB classification map:
 * red = exposed copper, green = copper below mask, blue = legend, black = mask.
 */
export async function createBoardSurfaceTextures({
  width,
  height,
  classificationPixels,
}: {
  width: number
  height: number
  classificationPixels: Uint8Array
}): Promise<BoardSurfaceTextureSet> {
  if (classificationPixels.length !== width * height * 4) {
    throw new Error("Board classification raster has invalid dimensions")
  }

  const heights = new Float32Array(width * height)
  const roughnessValues = new Float32Array(width * height)
  const metalnessValues = new Float32Array(width * height)
  const salt = width + height

  for (let pixelIndex = 0; pixelIndex < width * height; pixelIndex++) {
    const offset = pixelIndex * 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)
    const exposedCopperWeight = (classificationPixels[offset] ?? 0) / 255
    const maskedCopperWeight = (classificationPixels[offset + 1] ?? 0) / 255
    const legendWeight = (classificationPixels[offset + 2] ?? 0) / 255
    const classifiedWeight = clamp01(
      exposedCopperWeight + maskedCopperWeight + legendWeight,
    )
    const plainMaskWeight = 1 - classifiedWeight

    const surfaceHeight =
      (plainMaskWeight + legendWeight) * PLAIN_SOLDERMASK_HEIGHT +
      maskedCopperWeight * MASKED_COPPER_HEIGHT +
      exposedCopperWeight * EXPOSED_COPPER_HEIGHT
    const fineGrain =
      exposedCopperWeight * createCopperDetail(x, y, salt) +
      maskedCopperWeight * createMaskedTraceDetail(x, y, salt)
    heights[pixelIndex] = clamp01(
      invertSurfaceHeight(surfaceHeight) + fineGrain,
    )

    const copperRoughness = clamp01(
      PAD_COPPER_TEXTURE_MATERIAL.roughness +
        createCopperDetail(x, y, salt) * 0.7 +
        (valueNoise(x, y, 36, salt + 17) - 0.5) *
          PAD_COPPER_TEXTURE_MATERIAL.roughnessVariance,
    )
    const maskedCopperRoughness = clamp01(
      0.54 +
        createMaskedTraceDetail(x, y, salt) +
        REALISTIC_BOARD_SURFACE_MATERIAL.roughnessBias,
    )
    roughnessValues[pixelIndex] = clamp01(
      plainMaskWeight * REALISTIC_BOARD_SURFACE_MATERIAL.roughness +
        legendWeight * 0.76 +
        maskedCopperWeight * maskedCopperRoughness +
        exposedCopperWeight * copperRoughness,
    )
    metalnessValues[pixelIndex] = clamp01(
      plainMaskWeight * 0.015 +
        maskedCopperWeight * 0.025 +
        exposedCopperWeight * PAD_COPPER_TEXTURE_MATERIAL.metalness,
    )
  }

  const normalPixels = new Uint8Array(width * height * 4)
  const metallicRoughnessPixels = new Uint8Array(width * height * 4)
  const getHeight = (x: number, y: number) =>
    heights[
      Math.max(0, Math.min(height - 1, y)) * width +
        Math.max(0, Math.min(width - 1, x))
    ] ?? 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIndex = y * width + x
      const offset = pixelIndex * 4
      const dx = (getHeight(x + 1, y) - getHeight(x - 1, y)) * 4
      const dy = (getHeight(x, y + 1) - getHeight(x, y - 1)) * 4
      const inverseLength = 1 / Math.hypot(dx, dy, 1)

      normalPixels[offset] = (-dx * inverseLength * 0.5 + 0.5) * 255
      normalPixels[offset + 1] = (-dy * inverseLength * 0.5 + 0.5) * 255
      normalPixels[offset + 2] = (inverseLength * 0.5 + 0.5) * 255
      normalPixels[offset + 3] = 255

      // glTF packs perceptual roughness into G and metalness into B.
      metallicRoughnessPixels[offset] = 255
      metallicRoughnessPixels[offset + 1] =
        (roughnessValues[pixelIndex] ?? 0.7) * 255
      metallicRoughnessPixels[offset + 2] =
        (metalnessValues[pixelIndex] ?? 0) * 255
      metallicRoughnessPixels[offset + 3] = 255
    }
  }

  const [normal, metallicRoughness] = await Promise.all([
    rgbaToPngDataUrl({ width, height, pixels: normalPixels }),
    rgbaToPngDataUrl({
      width,
      height,
      pixels: metallicRoughnessPixels,
    }),
  ])

  return { normal, metallicRoughness }
}
