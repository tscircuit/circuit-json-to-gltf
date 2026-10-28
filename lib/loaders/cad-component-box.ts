import type { CadComponent, PcbComponent } from "circuit-json"
import type { Box3D, CircuitTo3DOptions, Point3 } from "../types"
import {
  fitMeshToCadBounds,
  getMeshOrigin,
  getMeshWithBoardNormalTransform,
} from "../utils/cad-mesh-placement"
import { COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"
import { getDefaultModelTransform } from "../utils/get-default-model-transform"
import {
  getBoundingBoxSize,
  scaleMesh,
  translateMesh,
} from "../utils/mesh-scale"
import { loadFootprinterModel } from "./footprinter"
import { loadGLB } from "./glb"
import { loadGLTF } from "./gltf"
import { loadJscadPlan } from "./jscad-plan"
import { loadOBJ } from "./obj"
import { loadSTEP } from "./step"
import { loadSTL } from "./stl"

export type CadComponentBoxOptions = Pick<
  CircuitTo3DOptions,
  | "coordinateTransform"
  | "projectBaseUrl"
  | "authHeaders"
  | "componentColor"
  | "defaultComponentHeight"
  | "boardThickness"
  | "showBoundingBoxes"
> & {
  pcbComponent?: PcbComponent
  componentName?: string
  defaultCadRotation?: Point3
}

function convertRotationFromCadRotation(rot: {
  x: number
  y: number
  z: number
}): { x: number; y: number; z: number } {
  return {
    x: (rot.x * Math.PI) / 180,
    y: (rot.y * Math.PI) / 180,
    z: (rot.z * Math.PI) / 180,
  }
}

function convertCadSizeToSceneSize(size: { x: number; y: number; z: number }): {
  x: number
  y: number
  z: number
} {
  return {
    x: size.x,
    y: size.z,
    z: size.y,
  }
}

/** Shared model loading, scale, origin and mounting rules for rendering and
 * geometry consumers. Mesh points and node pose are Scene3D +Y-up millimetres;
 * rotation is the renderer's scene-axis Euler rotation in radians.
 * The supplied CAD pose is authoritative; this does not fold or unfold it. */
export async function loadCadComponentBox(
  cad: CadComponent,
  options: CadComponentBoxOptions = {},
): Promise<Box3D | undefined> {
  const {
    pcbComponent,
    componentName,
    defaultCadRotation,
    componentColor = "rgba(128,128,128,0.5)",
    defaultComponentHeight = 2,
    boardThickness = 1.6,
    showBoundingBoxes = false,
    coordinateTransform,
    projectBaseUrl,
    authHeaders,
  } = options
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

  if (!hasModelSource) return undefined

  // Check if component is on bottom layer
  const isBottomLayer = (cad.layer ?? pcbComponent?.layer) === "bottom"

  const modelScaleFactor = cad.model_unit_to_mm_scale_factor ?? 1

  // Determine size
  const size = cad.size
    ? convertCadSizeToSceneSize({
        x: cad.size.x * modelScaleFactor,
        y: cad.size.y * modelScaleFactor,
        z: cad.size.z * modelScaleFactor,
      })
    : {
        x: pcbComponent?.width ?? 2,
        y: defaultComponentHeight,
        z: pcbComponent?.height ?? 2,
      }

  // Determine position
  const center = cad.position
    ? {
        x: cad.position.x,
        y: cad.position.z,
        z: cad.position.y,
      }
    : {
        x: pcbComponent?.center.x ?? 0,
        y: isBottomLayer
          ? -(boardThickness / 2 + size.y / 2)
          : boardThickness / 2 + size.y / 2,
        z: pcbComponent?.center.y ?? 0,
      }

  const meshType = model_stl_url
    ? "stl"
    : model_obj_url
      ? "obj"
      : model_gltf_url
        ? "gltf"
        : model_glb_url
          ? "glb"
          : model_step_url
            ? "step"
            : hasFootprinterModel
              ? "glb"
              : undefined
  const box: Box3D = {
    center,
    size,
    isTranslucent: cad.show_as_translucent_model,
    showHiddenEdges: (cad as CadComponent & { show_hidden_edges?: boolean })
      .show_hidden_edges,
    label: componentName,
    componentMetadata: {
      cad_component_id: cad.cad_component_id,
      source_component_id: cad.source_component_id,
      pcb_component_id: cad.pcb_component_id,
      componentName,
    },
  }

  if (
    model_stl_url ||
    model_obj_url ||
    model_glb_url ||
    model_gltf_url ||
    model_step_url
  ) {
    box.meshUrl =
      model_stl_url ||
      model_obj_url ||
      model_glb_url ||
      model_gltf_url ||
      model_step_url
    box.meshType = meshType
  }

  // Matches flex-utils' getCadFoldContext.defaultRotation in Circuit JSON
  // (+Z up, intrinsic XYZ degrees). Resolving this flat layer convention
  // does not require constructing an unsupported board fold.
  const cadRotation = cad.rotation ?? defaultCadRotation
  // Add rotation if specified
  if (cadRotation) {
    // For GLB/GLTF models, we need to remap rotation axes because the coordinate
    // system has Y and Z swapped. Circuit JSON uses Z-up, but the transformed
    // model uses Y-up.
    box.rotation = convertRotationFromCadRotation({
      x: cadRotation.x,
      y: cadRotation.z, // Circuit Z rotation becomes model Y rotation
      z: cadRotation.y, // Circuit Y rotation becomes model Z rotation
    })
  } else if (isBottomLayer) {
    // If no rotation specified but component is on bottom, flip it
    if (model_glb_url || model_gltf_url || hasFootprinterModel) {
      box.rotation = convertRotationFromCadRotation({
        x: 0,
        y: 0,
        z: 180, // Flip via Z rotation for GLB models (matches circuit JSON convention)
      })
    } else {
      box.rotation = convertRotationFromCadRotation({
        x: 180,
        y: 0,
        z: 0,
      })
    }
  }

  // Try to load the mesh with default coordinate transform if none specified
  // Note: GLB loader handles its own default Y/Z swap, so we pass through coordinateTransform
  // Different model formats use different coordinate conventions:
  // - OBJ models typically have Z-up with origin at the bottom
  // - STL models vary widely
  // - GLB/GLTF have their own conventions
  const usingGlbCoordinates = Boolean(model_glb_url || model_gltf_url)
  const usingObjFormat = Boolean(model_obj_url)
  const usingStepFormat = Boolean(model_step_url)

  const defaultTransform = getDefaultModelTransform(cad, {
    coordinateTransform,
    usingGlbCoordinates,
    usingObjFormat,
    usingStepFormat,
    hasFootprinterModel,
  })

  if (model_stl_url) {
    box.mesh = await loadSTL({
      url: model_stl_url,
      transform: defaultTransform,
      projectBaseUrl,
      authHeaders,
    })
  } else if (model_obj_url) {
    box.mesh = await loadOBJ({
      url: model_obj_url,
      transform: defaultTransform,
      projectBaseUrl,
      authHeaders,
    })
  } else if (model_glb_url) {
    try {
      box.mesh = await loadGLB({
        url: model_glb_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders,
      })
    } catch (err) {
      console.error(`Failed to load GLB from ${model_glb_url}:`, err)
    }
  } else if (model_gltf_url) {
    box.mesh = await loadGLTF({
      url: model_gltf_url,
      transform: defaultTransform,
      projectBaseUrl,
      authHeaders,
    })
  } else if (model_step_url) {
    try {
      box.mesh = await loadSTEP({
        url: model_step_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders,
      })
    } catch (err) {
      console.error(`Failed to load STEP from ${model_step_url}:`, err)
    }
  } else if (model_jscad) {
    box.mesh = loadJscadPlan(model_jscad)
    box.color = componentColor
  } else if (hasFootprinterModel && cad.footprinter_string) {
    box.mesh = await loadFootprinterModel(
      cad.footprinter_string,
      defaultTransform,
    )
  }

  if (box.mesh && modelScaleFactor !== 1) {
    box.mesh = scaleMesh(box.mesh, modelScaleFactor)
  }

  if (box.mesh) {
    box.mesh = getMeshWithBoardNormalTransform(
      box.mesh,
      cad.model_board_normal_direction,
    )

    const meshOrigin = getMeshOrigin(cad, box.mesh, {
      loaderTransform:
        meshType === undefined
          ? COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP
          : defaultTransform,
      modelBoardNormalDirection: cad.model_board_normal_direction,
    })
    if (meshOrigin) {
      box.mesh = translateMesh(box.mesh, {
        x: -meshOrigin.x,
        y: -meshOrigin.y,
        z: -meshOrigin.z,
      })
    }

    if (cad.size) {
      box.mesh = fitMeshToCadBounds(
        box.mesh,
        size,
        cad.model_object_fit ?? "contain_within_bounds",
      )
    }

    box.size = getBoundingBoxSize(box.mesh.boundingBox)
  }

  // Skip empty generated footprint models unless debug boxes are requested.
  if (!box.mesh) {
    if (hasFootprinterModel && !showBoundingBoxes) return undefined
    box.color = componentColor
  }

  if (cad.color !== undefined) {
    box.color = cad.color
    box.materialColorOverride = cad.color
  }

  return box
}
