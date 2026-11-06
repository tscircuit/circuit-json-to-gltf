import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import { union } from "@jscad/modeling/src/operations/booleans"

/**
 * Batched union operation that processes geometries in chunks
 * to avoid stack overflow and improve performance.
 *
 * Instead of calling union(a, b, c, d, ...) with hundreds of geometries,
 * this function processes them in batches, reducing memory pressure
 * and avoiding deep recursion in the CSG library.
 *
 * @param geoms - Array of geometries to union together
 * @param batchSize - Number of geometries to process per batch (default: 50)
 * @returns A single unified geometry
 */
export const batchedUnion = (geoms: Geom3[], batchSize = 50): Geom3 => {
  if (geoms.length === 0) {
    throw new Error("Cannot union empty array")
  }
  if (geoms.length === 1) {
    return geoms[0]!
  }

  const effectiveBatchSize = Number.isFinite(batchSize)
    ? Math.max(2, Math.floor(batchSize))
    : 50

  // Process in batches to avoid deep recursion
  let results = [...geoms]
  while (results.length > 1) {
    const newResults: Geom3[] = []
    for (let i = 0; i < results.length; i += effectiveBatchSize) {
      const batch = results.slice(i, i + effectiveBatchSize)
      if (batch.length === 1) {
        newResults.push(batch[0]!)
      } else {
        newResults.push(union(...batch))
      }
    }
    results = newResults
  }
  return results[0]!
}
