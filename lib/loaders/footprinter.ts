import * as jscadModeling from "@jscad/modeling"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import { convertJscadModelToGltf } from "jscad-to-gltf"
import type { CoordinateTransformConfig, OBJMesh, STLMesh } from "../types"
import { parseGLB } from "./glb"

const footprinterCache = new Map<
  string,
  Promise<STLMesh | OBJMesh | undefined>
>()

async function generateFootprinterMesh(
  footprinterString: string,
  transform?: CoordinateTransformConfig,
  strictGeometry = false,
): Promise<STLMesh | OBJMesh | undefined> {
  const renderedModel = getJscadModelForFootprint(
    footprinterString,
    jscadModeling,
  )

  if (!renderedModel?.geometries?.length) {
    return undefined
  }

  const glbResult = await convertJscadModelToGltf(renderedModel, {
    format: "glb",
  })

  if (!(glbResult.data instanceof ArrayBuffer)) {
    throw new Error("Expected GLB data to be an ArrayBuffer")
  }

  return parseGLB(glbResult.data, transform, strictGeometry)
}

export function loadFootprinterModel(
  footprinterString: string,
  transform?: CoordinateTransformConfig,
  strictGeometry = false,
): Promise<STLMesh | OBJMesh | undefined> {
  const cacheKey = `${footprinterString}:${JSON.stringify(transform ?? {})}:${strictGeometry}`
  if (!footprinterCache.has(cacheKey)) {
    footprinterCache.set(
      cacheKey,
      generateFootprinterMesh(
        footprinterString,
        transform,
        strictGeometry,
      ).catch((error) => {
        footprinterCache.delete(cacheKey)
        throw error
      }),
    )
  }

  return footprinterCache.get(cacheKey)!
}
