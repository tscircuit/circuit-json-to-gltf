import { Buffer } from "node:buffer"
import { mat4 } from "gl-matrix"

import type {
  Scene3D,
  GLTFExportOptions,
  ExternalModelInstance,
  LoadedGLTFAsset,
  CoordinateTransformConfig,
} from "../types"
import { GLTFBuilder } from "../gltf/gltf-builder"
import { applyCoordinateTransform } from "../utils/coordinate-transform"

type NodeIOType = import("@gltf-transform/core").NodeIO
type DocumentType = import("@gltf-transform/core").Document
type SceneType = import("@gltf-transform/core").Scene
type Mat4Array = import("@gltf-transform/core").mat4
type GLMat4 = import("gl-matrix").mat4

type MeshoptDecoderType =
  typeof import("meshoptimizer/meshopt_decoder.module").MeshoptDecoder

type GltfToolkit = {
  NodeIO: typeof import("@gltf-transform/core").NodeIO
  mergeDocuments: typeof import("@gltf-transform/functions").mergeDocuments
  unpartition: typeof import("@gltf-transform/functions").unpartition
  EXTMeshoptCompression: typeof import("@gltf-transform/extensions").EXTMeshoptCompression
  KHRDracoMeshCompression: typeof import("@gltf-transform/extensions").KHRDracoMeshCompression
  meshoptDecoder?: MeshoptDecoderType
  dracoDecoder?: any
}

let gltfToolkitPromise: Promise<GltfToolkit> | null = null

export async function convertSceneToGLTF(
  scene: Scene3D,
  options: GLTFExportOptions = {},
): Promise<ArrayBuffer | object> {
  const builder = new GLTFBuilder()
  await builder.buildFromScene3D(scene)

  if (!scene.externalModels || scene.externalModels.length === 0) {
    return builder.export(options.binary)
  }

  const toolkit = await loadGltfToolkit()
  const io = createNodeIO(toolkit)

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
    await mergeExternalModel(
      baseDocument,
      targetScene,
      io,
      toolkit,
      model,
    ).catch((error) => {
      console.warn(`Failed to merge external model (${model.url}):`, error)
    })
  }

  await baseDocument.transform(toolkit.unpartition())

  if (options.binary) {
    const binary = await io.writeBinary(baseDocument)
    return uint8ArrayToArrayBuffer(binary)
  }

  const { json, resources } = await io.writeJSON(baseDocument)
  embedResources(json, resources)
  return json
}

async function loadGltfToolkit(): Promise<GltfToolkit> {
  if (gltfToolkitPromise) return gltfToolkitPromise

  gltfToolkitPromise = (async () => {
    const [core, functions, extensions] = await Promise.all([
      import("@gltf-transform/core"),
      import("@gltf-transform/functions"),
      import("@gltf-transform/extensions"),
    ])

    let meshoptDecoder: MeshoptDecoderType | undefined
    try {
      const meshopt = await import("meshoptimizer")
      if (meshopt.MeshoptDecoder) {
        await meshopt.MeshoptDecoder.ready
        meshoptDecoder = meshopt.MeshoptDecoder
      }
    } catch (error) {
      console.warn("Meshopt decoder unavailable:", error)
    }

    let dracoDecoder: any
    try {
      const draco3d = await import("draco3dgltf")
      const factory = (draco3d as any).default ?? draco3d
      if (factory?.createDecoderModule) {
        dracoDecoder = await factory.createDecoderModule()
      }
    } catch (error) {
      console.warn("Draco decoder unavailable:", error)
    }

    return {
      NodeIO: core.NodeIO,
      mergeDocuments: functions.mergeDocuments,
      unpartition: functions.unpartition,
      EXTMeshoptCompression: extensions.EXTMeshoptCompression,
      KHRDracoMeshCompression: extensions.KHRDracoMeshCompression,
      meshoptDecoder,
      dracoDecoder,
    }
  })()

  return gltfToolkitPromise
}

function createNodeIO(toolkit: GltfToolkit): NodeIOType {
  const io = new toolkit.NodeIO()
  const extensions = []
  if (toolkit.meshoptDecoder) {
    extensions.push(toolkit.EXTMeshoptCompression)
  }
  if (toolkit.dracoDecoder) {
    extensions.push(toolkit.KHRDracoMeshCompression)
  }
  if (extensions.length > 0) {
    io.registerExtensions(extensions as any)
  }
  if (toolkit.meshoptDecoder) {
    io.registerDependencies({ "meshopt.decoder": toolkit.meshoptDecoder })
  }
  if (toolkit.dracoDecoder) {
    io.registerDependencies({ "draco3d.decoder": toolkit.dracoDecoder })
  }
  return io
}

async function mergeExternalModel(
  baseDocument: DocumentType,
  targetScene: SceneType,
  io: NodeIOType,
  toolkit: GltfToolkit,
  model: ExternalModelInstance,
): Promise<void> {
  const docB = await documentFromAsset(io, model.asset)
  const sourceRoot = docB.getRoot()
  const sourceScene = sourceRoot.getDefaultScene() ?? sourceRoot.listScenes()[0]
  if (!sourceScene) return

  const map = toolkit.mergeDocuments(baseDocument, docB)
  const mergedScene = map.get(sourceScene) as SceneType | undefined
  if (!mergedScene) return

  const wrapper = baseDocument
    .createNode(model.label ? String(model.label) : `${model.id}_merged`)
    .setMatrix(createInstanceMatrix(model))

  for (const child of mergedScene.listChildren()) {
    wrapper.addChild(child)
  }

  targetScene.addChild(wrapper)
  mergedScene.dispose()
}

async function documentFromAsset(
  io: NodeIOType,
  asset: LoadedGLTFAsset,
): Promise<DocumentType> {
  if (asset.kind === "glb") {
    return io.readBinary(new Uint8Array(asset.arrayBuffer))
  }

  const resources: Record<string, Uint8Array> = {}
  for (const [key, value] of Object.entries(asset.resources ?? {})) {
    resources[key] = toUint8Array(value)
  }

  return io.readJSON({ json: asset.json, resources })
}

function coordinateTransformToMatrix(
  config?: CoordinateTransformConfig,
): GLMat4 {
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

function createInstanceMatrix(model: ExternalModelInstance): Mat4Array {
  const translationMatrix = mat4.create()
  mat4.fromTranslation(translationMatrix, [
    model.center.x,
    model.center.y,
    model.center.z,
  ])

  const rotation = model.rotation ?? { x: 0, y: 0, z: 0 }
  const rotY = mat4.create()
  mat4.fromYRotation(rotY, rotation.y ?? 0)
  const rotX = mat4.create()
  mat4.fromXRotation(rotX, rotation.x ?? 0)
  const rotZ = mat4.create()
  mat4.fromZRotation(rotZ, rotation.z ?? 0)

  const scaleValues = model.scale ?? { x: 1, y: 1, z: 1 }
  const scaleMatrix = mat4.create()
  mat4.fromScaling(scaleMatrix, [
    scaleValues.x ?? 1,
    scaleValues.y ?? 1,
    scaleValues.z ?? 1,
  ])

  const coordMatrix = coordinateTransformToMatrix(model.coordinateTransform)

  const combined = mat4.create()
  mat4.multiply(combined, scaleMatrix, coordMatrix)
  mat4.multiply(combined, rotY, combined)
  mat4.multiply(combined, rotX, combined)
  mat4.multiply(combined, rotZ, combined)

  const finalMatrix = mat4.create()
  mat4.multiply(finalMatrix, translationMatrix, combined)

  return toGLTFMat4(finalMatrix)
}

function embedResources(
  json: any,
  resources: Record<string, ArrayBuffer | ArrayBufferView>,
): void {
  if (!resources) return

  if (Array.isArray(json.buffers)) {
    for (const buffer of json.buffers) {
      if (!buffer || typeof buffer !== "object" || !buffer.uri) continue
      const originalUri = buffer.uri
      if (!originalUri) continue
      const resource = resources[originalUri]
      if (!resource) continue
      buffer.uri = `data:application/octet-stream;base64,${arrayBufferToBase64(resource)}`
    }
  }

  if (Array.isArray(json.images)) {
    for (const image of json.images) {
      if (!image || typeof image !== "object" || !image.uri) continue
      const originalUri = image.uri
      const resource = resources[originalUri]
      if (!resource) continue
      const mimeType = image.mimeType || guessImageMimeType(originalUri)
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

function toUint8Array(
  data: ArrayBuffer | ArrayBufferView | Uint8Array,
): Uint8Array {
  if (data instanceof Uint8Array) {
    return data
  }

  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView
    return new Uint8Array(
      view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength),
    )
  }

  return new Uint8Array(data as ArrayBuffer)
}

function arrayBufferToBase64(
  data: ArrayBuffer | ArrayBufferView | Uint8Array,
): string {
  return Buffer.from(toUint8Array(data)).toString("base64")
}

function uint8ArrayToArrayBuffer(uint8: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(uint8.byteLength)
  copy.set(uint8)
  return copy.buffer
}

function toGLTFMat4(matrix: GLMat4): Mat4Array {
  return [
    matrix[0]!,
    matrix[1]!,
    matrix[2]!,
    matrix[3]!,
    matrix[4]!,
    matrix[5]!,
    matrix[6]!,
    matrix[7]!,
    matrix[8]!,
    matrix[9]!,
    matrix[10]!,
    matrix[11]!,
    matrix[12]!,
    matrix[13]!,
    matrix[14]!,
    matrix[15]!,
  ] as Mat4Array
}
