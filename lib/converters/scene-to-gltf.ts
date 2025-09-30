import { Buffer } from "node:buffer"
import { mat4 } from "gl-matrix"
import type { mat4 as GLMat4 } from "@gltf-transform/core"
import { NodeIO, Document, Scene } from "@gltf-transform/core"
import { mergeDocuments, unpartition } from "@gltf-transform/functions"
import {
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
} from "@gltf-transform/extensions"
import {
  MeshoptDecoder,
  type MeshoptDecoderType,
} from "meshoptimizer/meshopt_decoder.module"
import draco3dModule from "draco3dgltf"

import type {
  Scene3D,
  GLTFExportOptions,
  ExternalModelInstance,
  LoadedGLTFAsset,
  CoordinateTransformConfig,
} from "../types"
import { GLTFBuilder } from "../gltf/gltf-builder"
import { applyCoordinateTransform } from "../utils/coordinate-transform"

export async function convertSceneToGLTF(
  scene: Scene3D,
  options: GLTFExportOptions = {},
): Promise<ArrayBuffer | object> {
  const builder = new GLTFBuilder()
  await builder.buildFromScene3D(scene)

  if (!scene.externalModels || scene.externalModels.length === 0) {
    return builder.export(options.binary)
  }

  const io = await createConfiguredNodeIO()
  const baseGLB = builder.export(true) as ArrayBuffer
  const baseDocument = await io.readBinary(new Uint8Array(baseGLB))
  const root = baseDocument.getRoot()

  let targetScene = root.getDefaultScene()
  if (!targetScene) {
    const existingScenes = root.listScenes()
    targetScene = existingScenes[0] ?? baseDocument.createScene("Scene")
    root.setDefaultScene(targetScene)
  }

  for (const model of scene.externalModels) {
    try {
      await mergeExternalModel(baseDocument, targetScene, io, model)
    } catch (error) {
      console.warn(`Failed to merge external model (${model.url}):`, error)
    }
  }

  await baseDocument.transform(unpartition())

  if (options.binary) {
    const binary = await io.writeBinary(baseDocument)
    return uint8ArrayToArrayBuffer(binary)
  }

  const { json, resources } = await io.writeJSON(baseDocument)
  embedResources(json, resources)
  return json
}

async function createConfiguredNodeIO(): Promise<NodeIO> {
  const io = new NodeIO()
  const extensions: unknown[] = []

  try {
    if (MeshoptDecoder?.ready) {
      await MeshoptDecoder.ready
      extensions.push(EXTMeshoptCompression)
      io.registerDependencies({ "meshopt.decoder": MeshoptDecoder })
    }
  } catch (error) {
    console.warn("Meshopt decoder unavailable:", error)
  }

  try {
    const factory = (draco3dModule as any).default ?? draco3dModule
    if (factory?.createDecoderModule) {
      const decoder = await factory.createDecoderModule()
      extensions.push(KHRDracoMeshCompression)
      io.registerDependencies({ "draco3d.decoder": decoder })
    }
  } catch (error) {
    console.warn("Draco decoder unavailable:", error)
  }

  if (extensions.length > 0) {
    io.registerExtensions(extensions as any)
  }

  return io
}

async function mergeExternalModel(
  baseDocument: Document,
  targetScene: Scene,
  io: NodeIO,
  model: ExternalModelInstance,
): Promise<void> {
  const sourceDocument = await documentFromAsset(io, model.asset)
  const sourceRoot = sourceDocument.getRoot()
  const sourceScene = sourceRoot.getDefaultScene() ?? sourceRoot.listScenes()[0]
  if (!sourceScene) return

  const map = mergeDocuments(baseDocument, sourceDocument)
  const mergedScene = map.get(sourceScene) as Scene | undefined
  if (!mergedScene) return

  const wrapper = baseDocument
    .createNode(model.label ? String(model.label) : model.id)
    .setMatrix(createInstanceMatrix(model))

  for (const child of mergedScene.listChildren()) {
    wrapper.addChild(child)
  }

  targetScene.addChild(wrapper)
  mergedScene.dispose()
}

async function documentFromAsset(
  io: NodeIO,
  asset: LoadedGLTFAsset,
): Promise<Document> {
  if (asset.kind === "glb") {
    return io.readBinary(new Uint8Array(asset.arrayBuffer))
  }

  const resources: Record<string, Uint8Array> = {}
  for (const [key, value] of Object.entries(asset.resources)) {
    resources[key] = new Uint8Array(value)
  }

  return io.readJSON({ json: asset.json, resources })
}

type Mat4Array = ReturnType<typeof mat4.create>

function coordinateTransformToMatrix(
  config?: CoordinateTransformConfig,
): Mat4Array {
  const matrix = mat4.create()
  mat4.identity(matrix)

  if (!config || Object.keys(config).length === 0) {
    return matrix
  }

  const basisX = applyCoordinateTransform({ x: 1, y: 0, z: 0 }, config)
  const basisY = applyCoordinateTransform({ x: 0, y: 1, z: 0 }, config)
  const basisZ = applyCoordinateTransform({ x: 0, y: 0, z: 1 }, config)

  matrix[0] = basisX.x
  matrix[1] = basisX.y
  matrix[2] = basisX.z
  matrix[4] = basisY.x
  matrix[5] = basisY.y
  matrix[6] = basisY.z
  matrix[8] = basisZ.x
  matrix[9] = basisZ.y
  matrix[10] = basisZ.z

  return matrix
}

function createInstanceMatrix(model: ExternalModelInstance): GLMat4 {
  const translation = mat4.fromTranslation(mat4.create(), [
    model.center.x,
    model.center.y,
    model.center.z,
  ])

  const rotation = model.rotation ?? { x: 0, y: 0, z: 0 }
  const rotX = mat4.fromXRotation(mat4.create(), rotation.x ?? 0)
  const rotY = mat4.fromYRotation(mat4.create(), rotation.y ?? 0)
  const rotZ = mat4.fromZRotation(mat4.create(), rotation.z ?? 0)

  const scaleValues = model.scale ?? { x: 1, y: 1, z: 1 }
  const scaling = mat4.fromScaling(mat4.create(), [
    scaleValues.x ?? 1,
    scaleValues.y ?? 1,
    scaleValues.z ?? 1,
  ])

  const coordinate = coordinateTransformToMatrix(model.coordinateTransform)

  const matrix = mat4.create()
  mat4.multiply(matrix, scaling, coordinate)
  mat4.multiply(matrix, rotY, matrix)
  mat4.multiply(matrix, rotX, matrix)
  mat4.multiply(matrix, rotZ, matrix)
  mat4.multiply(matrix, translation, matrix)

  return Array.from(matrix) as GLMat4
}

function embedResources(
  json: any,
  resources: Record<string, ArrayBuffer | ArrayBufferView>,
): void {
  if (!resources) return

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      if (!buffer || typeof buffer !== "object" || !buffer.uri) continue
      const resource = resources[buffer.uri]
      if (!resource) continue
      buffer.uri = `data:application/octet-stream;base64,${arrayBufferToBase64(resource)}`
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      if (!image || typeof image !== "object" || !image.uri) continue
      const resource = resources[image.uri]
      if (!resource) continue
      const mimeType = image.mimeType || guessImageMimeType(image.uri)
      image.mimeType = mimeType
      image.uri = `data:${mimeType};base64,${arrayBufferToBase64(resource)}`
    }
  }
}

function guessImageMimeType(uri: string): string {
  const lower = uri.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  return "application/octet-stream"
}

function uint8ArrayToArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(uint8.byteLength)
  copy.set(uint8)
  return copy.buffer
}

function arrayBufferToBase64(data: ArrayBuffer | ArrayBufferView): string {
  let view: Uint8Array
  if (data instanceof Uint8Array) {
    view = data
  } else if (ArrayBuffer.isView(data)) {
    view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
  } else {
    view = new Uint8Array(data)
  }
  return Buffer.from(view).toString("base64")
}
