import {
  Format,
  type Document,
  type Node,
  type Scene,
} from "@gltf-transform/core"
import {
  cloneDocument,
  mergeDocuments,
  unpartition,
} from "@gltf-transform/functions"
import { quat } from "gl-matrix"

import type {
  Scene3D,
  GLTFExportOptions,
  ExternalModelInstance,
  ModelTransform,
} from "../types"
import { GLTFBuilder } from "../gltf/gltf-builder"
import { getSharedNodeIO } from "../loaders/gltf"

export async function convertSceneToGLTF(
  scene: Scene3D,
  options: GLTFExportOptions = {},
): Promise<ArrayBuffer | object> {
  const builder = new GLTFBuilder()
  await builder.buildFromScene3D(scene)

  const baseJSON = builder.export(false)
  const io = await getSharedNodeIO()
  const document = await io.readJSON({ json: baseJSON as any, resources: {} })

  await mergeExternalModels(document, scene.externalModels ?? [])
  if (document.getRoot().listBuffers().length > 1) {
    await document.transform(unpartition())
  }

  if (options.binary) {
    const binary = await io.writeBinary(document)
    return toArrayBuffer(binary)
  }

  const { json, resources } = await io.writeJSON(document, {
    format: Format.GLTF,
    basename: "scene",
  })

  embedResources(json, resources)
  return json
}

async function mergeExternalModels(
  targetDocument: Document,
  externalModels: ExternalModelInstance[],
): Promise<void> {
  if (!externalModels.length) return

  const root = targetDocument.getRoot()
  let targetScene = root.getDefaultScene() ?? root.listScenes()[0]

  if (!targetScene) {
    targetScene = targetDocument.createScene("Scene")
    root.setDefaultScene(targetScene)
  }

  for (let index = 0; index < externalModels.length; index++) {
    const instance = externalModels[index]!
    try {
      const sourceDoc = cloneDocument(instance.asset.document)
      ensureSceneExists(sourceDoc)

      const sourceScenes = sourceDoc.getRoot().listScenes()
      if (sourceScenes.length === 0) continue

      const mapping = mergeDocuments(targetDocument, sourceDoc)

      const mergedScenes = sourceScenes
        .map((scene) => mapping.get(scene) as Scene | undefined)
        .filter((scene): scene is Scene => Boolean(scene))

      if (!mergedScenes.length) continue

      const wrapper = targetDocument.createNode(
        instance.name ?? `external-model-${index}`,
      )

      applyTransform(wrapper, instance.transform)

      for (const mergedScene of mergedScenes) {
        for (const child of mergedScene.listChildren()) {
          wrapper.addChild(child)
        }
        mergedScene.dispose()
      }

      targetScene.addChild(wrapper)
    } catch (error) {
      console.warn("Failed to merge external GLTF model:", error)
    }
  }

  if (!root.getDefaultScene()) {
    root.setDefaultScene(targetScene)
  }
}

function ensureSceneExists(document: Document): void {
  const root = document.getRoot()
  if (root.listScenes().length > 0) {
    return
  }

  const scene = document.createScene("Scene")
  const unparentedNodes = root
    .listNodes()
    .filter((node) => !node.listParents || node.listParents().length === 0)
  for (const node of unparentedNodes) {
    scene.addChild(node)
  }
  root.setDefaultScene(scene)
}

function applyTransform(node: Node, transform: ModelTransform): void {
  node.setTranslation([
    transform.translation.x,
    transform.translation.y,
    transform.translation.z,
  ])

  if (transform.rotation) {
    const rotationQuat = quat.create()
    quat.fromEuler(
      rotationQuat,
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z,
    )
    node.setRotation([
      rotationQuat[0]!,
      rotationQuat[1]!,
      rotationQuat[2]!,
      rotationQuat[3]!,
    ])
  }

  if (transform.scale) {
    node.setScale([transform.scale.x, transform.scale.y, transform.scale.z])
  }
}

function embedResources(
  json: Record<string, any>,
  resources: Record<string, ArrayBuffer | Uint8Array> | undefined,
): void {
  if (!resources || Object.keys(resources).length === 0) {
    return
  }

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      if (!buffer.uri) continue
      const resource = resources[buffer.uri]
      if (!resource) continue
      buffer.uri = toDataUri(buffer.uri, asArrayBuffer(resource))
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      if (!image.uri) continue
      const resource = resources[image.uri]
      if (!resource) continue
      image.uri = toDataUri(image.uri, asArrayBuffer(resource))
    }
  }
}

function toDataUri(filename: string, data: ArrayBuffer): string {
  const mimeType = inferMimeType(filename)
  return `data:${mimeType};base64,${arrayBufferToBase64(data)}`
}

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
}

function inferMimeType(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg"
  }
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".avif")) return "image/avif"
  return "application/octet-stream"
}

function asArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data
  }
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}
