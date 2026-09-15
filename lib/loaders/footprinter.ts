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
): Promise<STLMesh | OBJMesh | undefined> {
  const renderedModel = getJscadModelForFootprint(
    footprinterString,
    jscadModeling,
  )

  if (!renderedModel?.geometries?.length) {
    // Not an error upstream -- jscad-electronics returns an empty model for any
    // footprint it has no body for -- but the caller drops such a component
    // from the scene entirely, so without this the part simply is not on the
    // board and nothing says why. Parametric chip footprints (`res_p0.86mm_...`)
    // hit this for every passive on a board at once.
    //
    // Warned once per footprint: the cache below holds the promise, so a board
    // with forty identical resistors reports one line, not forty.
    console.warn(
      `No 3D model for footprint "${footprinterString}" (jscad-electronics returned no geometry) - the component will not appear in the 3D scene.`,
    )
    return undefined
  }

  const glbResult = await convertJscadModelToGltf(renderedModel, {
    format: "glb",
  })

  if (!(glbResult.data instanceof ArrayBuffer)) {
    throw new Error("Expected GLB data to be an ArrayBuffer")
  }

  return parseGLB(glbResult.data, transform)
}

export function loadFootprinterModel(
  footprinterString: string,
  transform?: CoordinateTransformConfig,
): Promise<STLMesh | OBJMesh | undefined> {
  const cacheKey = `${footprinterString}:${JSON.stringify(transform ?? {})}`
  if (!footprinterCache.has(cacheKey)) {
    footprinterCache.set(
      cacheKey,
      generateFootprinterMesh(footprinterString, transform).catch((error) => {
        footprinterCache.delete(cacheKey)
        console.warn(
          `Failed to generate footprinter model for ${footprinterString}:`,
          error,
        )
        return undefined
      }),
    )
  }

  return footprinterCache.get(cacheKey)!
}

/**
 * Drop memoized footprint meshes. Mirrors `clearOBJCache`; the cache also
 * memoizes the "no model" answer, and with it the one warning that answer
 * emits, so tests that assert on the warning have to be able to reset it.
 */
export function clearFootprinterCache() {
  footprinterCache.clear()
}
