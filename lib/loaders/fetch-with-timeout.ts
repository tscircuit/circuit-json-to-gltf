import type { AuthHeaders } from "../types"

export const DEFAULT_FETCH_TIMEOUT_MS = 30_000

export async function fetchWithTimeout(
  url: string,
  {
    authHeaders,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  }: {
    authHeaders?: AuthHeaders
    timeoutMs?: number
  } = {},
): Promise<Response> {
  const controller = new AbortController()
  let timedOut = false

  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    // Node's fetch does not support file URLs. Load these on demand, keeping
    // the URL intact so GLTF buffers can still resolve relative to the model.
    if (
      url.startsWith("file:") &&
      typeof process !== "undefined" &&
      process.versions?.node
    ) {
      const { readFile } = await import("node:fs/promises")
      const bytes = await readFile(new URL(url), { signal: controller.signal })
      return new Response(new Uint8Array(bytes))
    }
    return await fetch(url, {
      headers: authHeaders,
      signal: controller.signal,
    })
  } catch (error) {
    if (timedOut) {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
