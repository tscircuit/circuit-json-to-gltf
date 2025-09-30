import { Buffer } from "node:buffer"
import { mat4 } from "gl-matrix"
import type { mat4 as Mat4ArrayType } from "gl-matrix"
import type {
  mat4 as GLMat4,
  NodeIO as NodeIOClass,
  Document,
  Scene,
  Transform,
} from "@gltf-transform/core"

import type {
  Scene3D,
  GLTFExportOptions,
  ExternalModelInstance,
  LoadedGLTFAsset,
  CoordinateTransformConfig,
} from "../types"
import { GLTFBuilder } from "../gltf/gltf-builder"
import { applyCoordinateTransform } from "../utils/coordinate-transform"

interface MeshoptDecoderType {
  ready: Promise<void>
}

interface DracoDecoderFactory {
  createDecoderModule?: () => Promise<unknown>
}

type NodeIOConstructor = new () => NodeIOClass
type MergeDocumentsFn = (
  target: Document,
  source: Document,
) => Map<unknown, unknown>
type UnpartitionFn = () => Transform

interface GltfToolkit {
  NodeIO: NodeIOConstructor
  mergeDocuments: MergeDocumentsFn
  unpartition: UnpartitionFn
  EXTMeshoptCompression: unknown
  KHRDracoMeshCompression: unknown
  meshoptDecoder?: MeshoptDecoderType
  dracoDecoder?: unknown
}

let toolkitPromise: Promise<GltfToolkit> | null = null

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

  const glbBuffer = builder.export(true) as ArrayBuffer
  const baseDocument = await io.readBinary(new Uint8Array(glbBuffer))
  const root = baseDocument.getRoot()

  let targetScene = root.getDefaultScene()
  if (!targetScene) {
    const existingScenes = root.listScenes()
    targetScene = existingScenes[0] ?? baseDocument.createScene("Scene")
    root.setDefaultScene(targetScene)
  }

  for (const model of scene.externalModels) {
    try {
      await mergeExternalModel(baseDocument, targetScene, io, toolkit, model)
    } catch (error) {
      console.warn(`Failed to merge external model (${model.url}):`, error)
    }
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
  if (!toolkitPromise) {
    toolkitPromise = (async () => {
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
          meshoptDecoder = meshopt.MeshoptDecoder as MeshoptDecoderType
        }
      } catch (error) {
        console.warn("Meshopt decoder unavailable:", error)
      }

      let dracoDecoder: unknown
      try {
        const dracoModule = await import("draco3dgltf")
        const factory: DracoDecoderFactory =
          (dracoModule as any).default ?? dracoModule
        if (factory.createDecoderModule) {
          dracoDecoder = await factory.createDecoderModule()
        }
      } catch (error) {
        console.warn("Draco decoder unavailable:", error)
      }

      return {
        NodeIO: core.NodeIO as NodeIOConstructor,
        mergeDocuments: functions.mergeDocuments as MergeDocumentsFn,
        unpartition: functions.unpartition as UnpartitionFn,
        EXTMeshoptCompression: extensions.EXTMeshoptCompression,
        KHRDracoMeshCompression: extensions.KHRDracoMeshCompression,
        meshoptDecoder,
        dracoDecoder,
      }
    })()
  }

  return toolkitPromise
}

function createNodeIO(toolkit: GltfToolkit): NodeIOClass {
  const io = new toolkit.NodeIO()
  const extensions: any[] = []

  if (toolkit.meshoptDecoder) {
    extensions.push(toolkit.EXTMeshoptCompression)
  }
  if (toolkit.dracoDecoder) {
    extensions.push(toolkit.KHRDracoMeshCompression)
  }
  if (extensions.length > 0) {
    io.registerExtensions(extensions)
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
  baseDocument: Document,
  targetScene: Scene,
  io: NodeIOClass,
  toolkit: GltfToolkit,
  model: ExternalModelInstance,
): Promise<void> {
  const sourceDocument = await documentFromAsset(io, model.asset)
  const sourceRoot = sourceDocument.getRoot()
  const sourceScene = sourceRoot.getDefaultScene() ?? sourceRoot.listScenes()[0]
  if (!sourceScene) return

  const map = toolkit.mergeDocuments(baseDocument, sourceDocument)
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
  io: NodeIOClass,
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

function coordinateTransformToMatrix(
  config?: CoordinateTransformConfig,
): Mat4ArrayType {
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
  const translation = mat4.create()
  mat4.fromTranslation(translation, [
    model.center.x,
    model.center.y,
    model.center.z,
  ])

  const rotation = model.rotation ?? { x: 0, y: 0, z: 0 }
  const rotX = mat4.fromXRotation(mat4.create(), rotation.x ?? 0)
  const rotY = mat4.fromYRotation(mat4.create(), rotation.y ?? 0)
  const rotZ = mat4.fromZRotation(mat4.create(), rotation.z ?? 0)

  const scaleValues = model.scale ?? { x: 1, y: 1, z: 1 }
  const scale = mat4.fromScaling(mat4.create(), [
    scaleValues.x ?? 1,
    scaleValues.y ?? 1,
    scaleValues.z ?? 1,
  ])

  const coordinate = coordinateTransformToMatrix(model.coordinateTransform)

  const matrix = mat4.create()
  mat4.multiply(matrix, scale, coordinate)
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
