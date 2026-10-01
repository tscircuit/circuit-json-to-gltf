import type { AssetFetch, AuthHeaders } from "../types"

export const DEFAULT_FETCH_TIMEOUT_MS = 30_000

export async function fetchWithTimeout(
  url: string,
  {
    authHeaders,
    fetch: fetchAsset,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  }: {
    authHeaders?: AuthHeaders
    fetch?: AssetFetch
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
    return await (fetchAsset ?? globalThis.fetch)(url, {
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
