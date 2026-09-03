import type { AuthHeaders, FilesystemInterface } from "../types"

export const DEFAULT_FETCH_TIMEOUT_MS = 30_000

export async function fetchWithTimeout(
  url: string,
  {
    authHeaders,
    fs,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
  }: {
    authHeaders?: AuthHeaders
    fs?: FilesystemInterface
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
    if (url.startsWith("file:")) {
      if (!fs) {
        throw new Error(
          `Cannot load local file ${url}: provide a FilesystemInterface as options.fs`,
        )
      }
      const contents = await fs.readFile(new URL(url))
      const source =
        contents instanceof Uint8Array ? contents : new Uint8Array(contents)
      const bytes = new Uint8Array(source.byteLength)
      bytes.set(source)
      return new Response(bytes)
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
