import { expect, type MatcherResult } from "bun:test"
import * as fs from "node:fs"
import * as path from "node:path"
import looksSame from "looks-same"

/**
 * Matcher for PNG snapshot testing with cross-platform tolerance.
 *
 * Usage:
 *   expect(pngBuffer).toMatchPngSnapshot(import.meta.path, "optionalName");
 */
async function toMatchPngSnapshot(
  // biome-ignore lint/suspicious/noExplicitAny: bun doesn't expose
  this: any,
  receivedMaybePromise: Buffer | Uint8Array | Promise<Buffer | Uint8Array>,
  testPathOriginal: string,
  pngName?: string,
): Promise<MatcherResult> {
  const received = await receivedMaybePromise
  const testPath = testPathOriginal
    .replace(/\.test\.tsx?$/, "")
    .replace(/\.test\.ts$/, "")
  const snapshotDir = path.join(path.dirname(testPath), "__snapshots__")
  const snapshotName = pngName
    ? `${pngName}.snap.png`
    : `${path.basename(testPath)}.snap.png`
  const filePath = path.join(snapshotDir, snapshotName)

  if (!fs.existsSync(snapshotDir)) {
    fs.mkdirSync(snapshotDir, { recursive: true })
  }

  const updateSnapshot =
    process.argv.includes("--update-snapshots") ||
    process.argv.includes("-u") ||
    Boolean(process.env["BUN_UPDATE_SNAPSHOTS"])
  const forceUpdate = Boolean(process.env["FORCE_BUN_UPDATE_SNAPSHOTS"])

  const fileExists = fs.existsSync(filePath)

  if (!fileExists) {
    console.log("Writing PNG snapshot to", filePath)
    fs.writeFileSync(filePath, received)
    return {
      message: () => `PNG snapshot created at ${filePath}`,
      pass: true,
    }
  }

  const existingSnapshot = fs.readFileSync(filePath)

  const result = await looksSame(
    Buffer.from(received),
    Buffer.from(existingSnapshot),
    {
      strict: false,
      tolerance: 5,
      antialiasingTolerance: 4,
      ignoreAntialiasing: true,
      shouldCluster: true,
      clustersSize: 10,
      createDiffImage: true,
    },
  )
  if (updateSnapshot) {
    if (!forceUpdate && result.equal) {
      return {
        message: () => "PNG snapshot matches",
        pass: true,
      }
    }
    console.log("Updating PNG snapshot at", filePath)
    fs.writeFileSync(filePath, received)
    return {
      message: () => `PNG snapshot updated at ${filePath}`,
      pass: true,
    }
  }

  if (result.equal) {
    return {
      message: () => "PNG snapshot matches",
      pass: true,
    }
  }

  let diffArea = 0
  for (const cluster of result.diffClusters) {
    diffArea += (cluster.right - cluster.left) * (cluster.bottom - cluster.top)
  }

  // Calculate diff percentage for cross-platform tolerance
  const diffFraction = diffArea / result.totalPixels

  // Allow up to 5% pixel difference for cross-platform rendering variations
  const ACCEPTABLE_DIFF_FRACTION = 0.05

  if (diffFraction <= ACCEPTABLE_DIFF_FRACTION) {
    console.log(
      `✓ PNG snapshot matches (${diffFraction.toFixed(3)}% difference, within ${ACCEPTABLE_DIFF_FRACTION}% threshold)`,
    )
    return {
      message: () =>
        `PNG snapshot matches (${diffFraction.toFixed(3)}% difference)`,
      pass: true,
    }
  }

  const diffPath = filePath.replace(/\.snap\.png$/, ".diff.png")
  result.diffImage.save(diffPath)

  return {
    message: () =>
      `PNG snapshot differs by ${diffFraction.toFixed(3)}% (threshold: ${ACCEPTABLE_DIFF_FRACTION}%). Diff saved at ${diffPath}. Use BUN_UPDATE_SNAPSHOTS=1 to update the snapshot.`,
    pass: false,
  }
}

// Register the matcher globally for Bun's expect
expect.extend({
  toMatchPngSnapshot: toMatchPngSnapshot as any,
})

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchPngSnapshot(
      testPath: string,
      pngName?: string,
    ): Promise<MatcherResult>
  }
}
