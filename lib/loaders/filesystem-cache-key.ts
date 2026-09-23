import type { FilesystemInterface } from "../types"

const filesystemIds = new WeakMap<FilesystemInterface, number>()
let nextFilesystemId = 1

export function getFilesystemCacheKey(fs?: FilesystemInterface): string {
  if (!fs) return "default"
  let id = filesystemIds.get(fs)
  if (!id) {
    id = nextFilesystemId++
    filesystemIds.set(fs, id)
  }
  return String(id)
}
