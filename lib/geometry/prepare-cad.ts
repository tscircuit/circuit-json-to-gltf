import type { CadComponent, CircuitJson } from "circuit-json"
import { loadGLB } from "../loaders/glb"
import { loadGLTF } from "../loaders/gltf"
import { loadOBJ } from "../loaders/obj"
import { loadSTL } from "../loaders/stl"
import type { Box3D, CircuitTo3DOptions } from "../types"
import {
  fitMeshToCadBounds,
  getMeshOrigin,
  getMeshWithBoardNormalTransform,
} from "../utils/cad-mesh-placement"
import { getDefaultModelTransform } from "../utils/get-default-model-transform"
import {
  getBoundingBoxSize,
  scaleMesh,
  translateMesh,
} from "../utils/mesh-scale"

/** Shared loader-local preparation. Scene placement remains unbaked, in Y-up mm.
 * The scene adapter retains legacy Euler fields internally; the public geometry
 * boundary exposes only the matrix derived from this same placement.
 */
export async function prepareCad(
  cad: CadComponent,
  circuitJson: CircuitJson,
  options: CircuitTo3DOptions & { stepWasmUrl?: string },
  effectiveBoardThickness: number,
  onLegacyLoadError?: (error: unknown, source: string) => void,
): Promise<{
  box: Box3D
  source: string
  hasModelSource: boolean
  hasFootprinterModel: boolean
}> {
  const {
    model_stl_url,
    model_obj_url,
    model_glb_url,
    model_gltf_url,
    model_jscad,
    model_step_url,
  } = cad
  const hasFootprinterModel = Boolean(
    cad.footprinter_string &&
      !model_stl_url &&
      !model_obj_url &&
      !model_glb_url &&
      !model_gltf_url &&
      !model_jscad &&
      !model_step_url,
  )
  const hasModelSource = Boolean(
    model_stl_url ||
      model_obj_url ||
      model_glb_url ||
      model_gltf_url ||
      model_jscad ||
      model_step_url ||
      hasFootprinterModel,
  )
  const pcbComponent = circuitJson.find(
    (item) =>
      item.type === "pcb_component" &&
      item.pcb_component_id === cad.pcb_component_id,
  )
  const pcb = pcbComponent?.type === "pcb_component" ? pcbComponent : undefined
  const sourceComponent = circuitJson.find(
    (item) =>
      item.type === "source_component" &&
      item.source_component_id === cad.source_component_id,
  )
  const isBottomLayer = (cad.layer ?? pcb?.layer) === "bottom"
  const modelScaleFactor = cad.model_unit_to_mm_scale_factor ?? 1
  const size = cad.size
    ? {
        x: cad.size.x * modelScaleFactor,
        y: cad.size.z * modelScaleFactor,
        z: cad.size.y * modelScaleFactor,
      }
    : {
        x: pcb?.width ?? 2,
        y: options.defaultComponentHeight ?? 2,
        z: pcb?.height ?? 2,
      }
  const center = cad.position
    ? { x: cad.position.x, y: cad.position.z, z: cad.position.y }
    : {
        x: pcb?.center.x ?? 0,
        y:
          (isBottomLayer ? -1 : 1) * (effectiveBoardThickness / 2 + size.y / 2),
        z: pcb?.center.y ?? 0,
      }
  const source = model_stl_url
    ? "stl"
    : model_obj_url
      ? "obj"
      : model_glb_url
        ? "glb"
        : model_gltf_url
          ? "gltf"
          : model_step_url
            ? "step"
            : model_jscad
              ? "jscad"
              : hasFootprinterModel
                ? "footprinter"
                : "unknown"
  const box: Box3D = {
    center,
    size,
    isTranslucent: cad.show_as_translucent_model,
    showHiddenEdges: (cad as CadComponent & { show_hidden_edges?: boolean })
      .show_hidden_edges,
    label:
      sourceComponent?.type === "source_component"
        ? sourceComponent.name
        : undefined,
  }
  box.meshUrl =
    model_stl_url ||
    model_obj_url ||
    model_glb_url ||
    model_gltf_url ||
    model_step_url
  if (box.meshUrl)
    box.meshType =
      source === "gltf"
        ? "gltf"
        : source === "stl" ||
            source === "obj" ||
            source === "glb" ||
            source === "step"
          ? source
          : undefined
  const rotation = cad.rotation
    ? { x: cad.rotation.x, y: cad.rotation.z, z: cad.rotation.y }
    : isBottomLayer
      ? model_glb_url || model_gltf_url || hasFootprinterModel
        ? { x: 0, y: 0, z: 180 }
        : { x: 180, y: 0, z: 0 }
      : undefined
  if (rotation)
    box.rotation = {
      x: (rotation.x * Math.PI) / 180,
      y: (rotation.y * Math.PI) / 180,
      z: (rotation.z * Math.PI) / 180,
    }
  const defaultTransform = getDefaultModelTransform(cad, {
    coordinateTransform: options.coordinateTransform,
    usingGlbCoordinates: Boolean(model_glb_url || model_gltf_url),
    usingObjFormat: Boolean(model_obj_url),
    usingStepFormat: Boolean(model_step_url),
    hasFootprinterModel,
  })
  const loadOptions = {
    transform: defaultTransform,
    projectBaseUrl: options.projectBaseUrl,
    authHeaders: options.authHeaders,
    fetch: options.fetch,
  }
  try {
    if (model_stl_url)
      box.mesh = await loadSTL({ ...loadOptions, url: model_stl_url })
    else if (model_obj_url)
      box.mesh = await loadOBJ({ ...loadOptions, url: model_obj_url })
    else if (model_glb_url)
      box.mesh = await loadGLB({ ...loadOptions, url: model_glb_url })
    else if (model_gltf_url)
      box.mesh = await loadGLTF({ ...loadOptions, url: model_gltf_url })
    else if (model_step_url) {
      const { loadSTEP } = await import("../loaders/step")
      box.mesh = await loadSTEP({
        ...loadOptions,
        url: model_step_url,
        stepWasmUrl: options.stepWasmUrl,
      })
    } else if (model_jscad) {
      const { loadJscadPlan } = await import("../loaders/jscad-plan")
      box.mesh = loadJscadPlan(model_jscad)
      box.color = options.componentColor ?? "rgba(128,128,128,0.5)"
    } else if (hasFootprinterModel && cad.footprinter_string) {
      const { loadFootprinterModel } = await import("../loaders/footprinter")
      box.mesh = await loadFootprinterModel(
        cad.footprinter_string,
        defaultTransform,
      )
    }
  } catch (error) {
    // Only the scene adapter opts into its existing visual-placeholder policy.
    if (
      !onLegacyLoadError ||
      !["glb", "step", "footprinter"].includes(source)
    ) {
      throw new Error(
        `Failed to prepare ${source} geometry for CAD ${cad.cad_component_id}`,
        { cause: error },
      )
    }
    onLegacyLoadError(error, source)
  }
  if (box.mesh && modelScaleFactor !== 1)
    box.mesh = scaleMesh(box.mesh, modelScaleFactor)
  if (box.mesh) {
    box.mesh = getMeshWithBoardNormalTransform(
      box.mesh,
      cad.model_board_normal_direction,
    )
    const meshOrigin = getMeshOrigin(cad, box.mesh, {
      loaderTransform: defaultTransform,
      modelBoardNormalDirection: cad.model_board_normal_direction,
    })
    if (meshOrigin)
      box.mesh = translateMesh(box.mesh, {
        x: -meshOrigin.x,
        y: -meshOrigin.y,
        z: -meshOrigin.z,
      })
    if (cad.size)
      box.mesh = fitMeshToCadBounds(
        box.mesh,
        size,
        cad.model_object_fit ?? "contain_within_bounds",
      )
    box.size = getBoundingBoxSize(box.mesh.boundingBox)
  }
  return { box, source, hasModelSource, hasFootprinterModel }
}
