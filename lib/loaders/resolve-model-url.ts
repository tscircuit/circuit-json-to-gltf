import type { PlatformConfig } from "@tscircuit/props"

const URL_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//
const WINDOWS_ABSOLUTE_PATH_REGEX = /^[A-Za-z]:[\\/]/

const isNodeRuntime =
  typeof process !== "undefined" && Boolean(process.versions?.node)

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`
}

function normalizeWindowsPath(path: string): string {
  return path.replace(/\\/g, "/")
}

function toFileUrlFromAbsolutePath(path: string): string {
  if (WINDOWS_ABSOLUTE_PATH_REGEX.test(path)) {
    const normalized = normalizeWindowsPath(path)
    return `file:///${normalized}`
  }

  return `file://${path}`
}

export interface NodeModulesPackageInfo {
  packageName: string
  filePath: string
}

/**
 * Extract package name and file path from a node_modules path.
 *
 * For @tsci scoped packages, converts npm format to registry format:
 *   "@tsci/author.package" -> "@author/package"
 */
export function extractPackageInfoFromNodeModulesPath(
  requestPath: string,
): NodeModulesPackageInfo | null {
  let path = requestPath.replace(/^\/?(\.\/)?/, "")

  if (!path.startsWith("node_modules/")) {
    return null
  }

  path = path.slice("node_modules/".length)

  let packageName: string
  let filePath: string

  if (path.startsWith("@")) {
    const parts = path.split("/")
    if (parts.length < 3) {
      return null
    }

    const scope = parts[0]!
    const scopedName = parts[1]!
    filePath = parts.slice(2).join("/")

    if (scope === "@tsci" && scopedName.includes(".")) {
      const dotIndex = scopedName.indexOf(".")
      const author = scopedName.slice(0, dotIndex)
      const pkg = scopedName.slice(dotIndex + 1)
      packageName = `@${author}/${pkg}`
    } else {
      packageName = `${scope}/${scopedName}`
    }
  } else {
    const parts = path.split("/")
    if (parts.length < 2) {
      return null
    }

    packageName = parts[0]!
    filePath = parts.slice(1).join("/")
  }

  if (!packageName || !filePath) {
    return null
  }

  return { packageName, filePath }
}

function normalizeNodeModulesRequestPath(path: string): string {
  return path.replace(/^(\.\/)?/, "").replace(/^\//, "")
}

function absolutizeFromPlatformBase(
  maybeUrl: string,
  projectBaseUrl?: string,
): string {
  if (URL_SCHEME_REGEX.test(maybeUrl)) {
    return maybeUrl
  }

  if (maybeUrl.startsWith("/") && projectBaseUrl) {
    return new URL(maybeUrl, ensureTrailingSlash(projectBaseUrl)).toString()
  }

  if (maybeUrl.startsWith("/") || WINDOWS_ABSOLUTE_PATH_REGEX.test(maybeUrl)) {
    return toFileUrlFromAbsolutePath(maybeUrl)
  }

  return maybeUrl
}

/**
 * Resolves model URLs for both browser and Node runtimes.
 *
 * In Node, relative URLs like "./node_modules/..." are not valid for fetch(),
 * so we resolve them via platform config first, then to file:// as fallback.
 */
export async function resolveModelUrl(
  url: string,
  platformConfig?: PlatformConfig,
): Promise<string> {
  if (URL_SCHEME_REGEX.test(url)) {
    return url
  }

  const nodeModulesInfo = extractPackageInfoFromNodeModulesPath(url)

  if (platformConfig?.resolveProjectStaticFileImportUrl) {
    const resolvedByPlatform =
      await platformConfig.resolveProjectStaticFileImportUrl(
        nodeModulesInfo ? normalizeNodeModulesRequestPath(url) : url,
      )
    return absolutizeFromPlatformBase(
      resolvedByPlatform,
      platformConfig.projectBaseUrl,
    )
  }

  if (nodeModulesInfo && platformConfig?.projectBaseUrl) {
    return new URL(
      normalizeNodeModulesRequestPath(url),
      ensureTrailingSlash(platformConfig.projectBaseUrl),
    ).toString()
  }

  if (url.startsWith("/") || WINDOWS_ABSOLUTE_PATH_REGEX.test(url)) {
    return toFileUrlFromAbsolutePath(url)
  }

  if (platformConfig?.projectBaseUrl) {
    const baseUrl = ensureTrailingSlash(platformConfig.projectBaseUrl)
    const relative = url.replace(/^\.\//, "")
    return new URL(relative, baseUrl).toString()
  }

  if (isNodeRuntime) {
    const cwd = normalizeWindowsPath(process.cwd())
    const cwdAsBase = ensureTrailingSlash(cwd)
    return new URL(url, `file://${cwdAsBase}`).toString()
  }

  return url
}
