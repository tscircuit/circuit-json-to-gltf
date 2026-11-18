import type { CircuitJson, PcbBoard } from "circuit-json"
import type { MaterialOptions } from "jscad-planner"
import type { PcbBendRecord, PcbStiffenerRecord } from "./utils/pcb-fold"

/** The 3D geometry of text laser engraved onto one surface of a part. Mirrors
 * the proposed circuit-json cad_laser_engraving_text record until it is
 * released. Right-handed circuit world, mm: +X right, +Y top, +Z above.
 * anchor_position is an absolute point; normal (outward) and x_axis (reading
 * direction) are perpendicular unit directions; the text's up is normal cross
 * x_axis. What is engraved and how deep is in the linked
 * source_manufacturing_laser_engraving_text, which rendering does not need.
 */
export interface CadLaserEngravingTextRecord {
  type: "cad_laser_engraving_text"
  cad_laser_engraving_text_id: string
  source_manufacturing_laser_engraving_text_id?: string
  source_component_id: string
  cad_component_id?: string
  cad_reference_surface_id?: string
  text: string
  font?: "tscircuit2024"
  /** Text height in mm. */
  font_size: number
  anchor_position: Point3
  anchor_alignment?:
    | "top_left"
    | "top_center"
    | "top_right"
    | "center_left"
    | "center"
    | "center_right"
    | "bottom_left"
    | "bottom_center"
    | "bottom_right"
  normal: Point3
  x_axis: Point3
  /** Color the engraved area is drawn in. */
  color?: string
  subcircuit_id?: string
}

/** Until circuit-json releases the record, it is not in the CircuitJson union,
 * so documents carrying one are recognized by this guard. */
export const isCadLaserEngravingText = (record: {
  type: string
}): record is CadLaserEngravingTextRecord =>
  record.type === "cad_laser_engraving_text"

/** Accept unreleased flex records alongside existing Circuit JSON elements. */
export type CircuitJsonWithPcbFlex = (
  | CircuitJson[number]
  | PcbBendRecord
  | PcbStiffenerRecord
  | (Omit<PcbBoard, "material"> & { material: "flex" })
)[]

export interface AuthHeaders extends Record<string, string> {
  Authorization: string
}

/** A pose within the serialized explosion program. Earlier stages stay applied. */
export interface AssemblyExplosionOptions {
  /** Inclusive qualified stage name. Omit to finish all stages. */
  throughStageRef?: string
  /** Fraction of the selected stage's sequential moves, from 0 to 1. */
  stageProgress?: number
}

/** Circuit-world points in mm: right-handed +X right, +Y top, +Z above. */
export interface AssemblyExplosionLine {
  stageRef: string
  targetRef: string
  points: Point3[]
}

export interface AssemblyExplosionFrame {
  name: string
  /** Options for rendering the original assembled document at this pose. */
  explosion?: AssemblyExplosionOptions
  /** Evaluated pose without instructions, safe to save and reopen. */
  circuitJson: CircuitJsonWithPcbFlex
  lines: AssemblyExplosionLine[]
}

export interface ConversionOptions {
  /** Render a serialized explosion pose. Omit to keep the assembly assembled. */
  explosion?: AssemblyExplosionOptions
  /** Override the render fold state. Undefined follows CAD is_on_folded_board in Circuit JSON. */
  foldPcbs?: boolean
  format?: "gltf" | "glb"
  boardTextureResolution?: number
  showPcbNotes?: boolean
  /** Include full Circuit JSON error messages for screen overlay renderers. Defaults to false. */
  showErrors?: boolean
  boardDrillQuality?: "high" | "fast"
  drawFauxBoard?: boolean
  includeModels?: boolean
  modelCache?: Map<string, STLMesh | OBJMesh>
  backgroundColor?: string
  boardSideColor?: Color
  copperColor?: string
  silkscreenColor?: string
  solderMaskWithCopperColor?: string
  drillColor?: string
  /** Show named CAD reference surfaces as diagnostic frames. Defaults to false. */
  showReferenceSurfaces?: boolean
  showBoundingBoxes?: boolean
  coordinateTransform?: CoordinateTransformConfig
  projectBaseUrl?: string
  authHeaders?: AuthHeaders
}

export interface CoordinateTransformConfig {
  // Flip axes: -1 to flip, 1 to keep original
  flipX?: number
  flipY?: number
  flipZ?: number
  // Axis remapping: which original axis becomes which final axis
  // e.g., { x: "y", y: "z", z: "x" } swaps all axes
  axisMapping?: {
    x?: "x" | "y" | "z" | "-x" | "-y" | "-z"
    y?: "x" | "y" | "z" | "-x" | "-y" | "-z"
    z?: "x" | "y" | "z" | "-x" | "-y" | "-z"
  }
  // Additional rotation in degrees around each axis (applied after axis mapping)
  rotation?: {
    x?: number
    y?: number
    z?: number
  }
}

export interface Point3 {
  x: number
  y: number
  z: number
}

export interface Size3 {
  x: number
  y: number
  z: number
}

/** Geometry uses outward counterclockwise winding, with normals agreeing with
 * the vertex order. Scene3D triangles use +Y up and mm; source geometry may use
 * another frame until its loader converts it. Reflections reverse vertex order
 * and attached UVs once; rotations leave winding unchanged. */
export interface Triangle {
  /** Authored JSCAD appearance; color tuples use linear 0–1 RGB. */
  material?: MaterialOptions
  /** Original PCB surface identity, retained after folding. */
  pcbFace?: "top" | "bottom" | "side"
  /** Flat PCB texture coordinates, retained/interpolated during tessellation. */
  uvs?: [
    { u: number; v: number },
    { u: number; v: number },
    { u: number; v: number },
  ]
  vertices: [Point3, Point3, Point3]
  normal: Point3
  color?: Color
  materialIndex?: number
}

export interface BoundingBox {
  min: Point3
  max: Point3
}

/** Loader and Scene3D meshes use +Y-up mm and outward-wound triangles.
 * Exporters preserve their order; the final glTF X reflection owns its reversal. */
export interface STLMesh {
  triangles: Triangle[]
  boundingBox: BoundingBox
}

export interface OBJMesh extends STLMesh {
  materials?: Map<string, OBJMaterial>
  materialIndexMap?: Map<string, number>
}

export interface OBJMaterial {
  name: string
  color?: Color
  ambient?: Color
  specular?: Color
  shininess?: number
  dissolve?: number
}

export type Color = string | [number, number, number, number]

export interface Box3D {
  /** Lightweight identity exported as glTF node extras.tscircuit (no geometry). */
  componentMetadata?: {
    cad_component_id?: string
    source_component_id?: string
    pcb_component_id?: string
    componentName?: string
  }
  center: Point3
  size: Size3
  rotation?: Point3
  color?: Color
  sideColor?: Color
  /** Explicit CAD color override, distinct from the fallback mesh color. */
  materialColorOverride?: string
  texture?: {
    top?: string
    bottom?: string
    front?: string
    back?: string
    left?: string
    right?: string
  }
  mesh?: STLMesh | OBJMesh
  meshUrl?: string
  meshType?: "stl" | "obj" | "gltf" | "glb" | "step"
  label?: string
  labelColor?: Color
  isTranslucent?: boolean
  showHiddenEdges?: boolean
}

/** Guide points in Scene3D world coordinates: +Y up, mm, before glTF X reflection. */
export interface SceneExplosionLine {
  stageRef: string
  targetRef: string
  points: Point3[]
}

export interface Scene3D {
  explosionLines?: SceneExplosionLine[]
  boxes: Box3D[]
  camera?: Camera3D
  lights?: Light3D[]
  /** Full Circuit JSON error messages, independent of geometry and camera. */
  errorMessages?: string[]
}

export interface Camera3D {
  position: Point3
  target: Point3
  up?: Point3
  fov?: number
  near?: number
  far?: number
}

export interface Light3D {
  type: "ambient" | "directional" | "point"
  color?: Color
  intensity?: number
  position?: Point3
  direction?: Point3
}

export interface GLTFExportOptions {
  binary?: boolean
  trs?: boolean
  onlyVisible?: boolean
  truncateDrawRange?: boolean
  embedImages?: boolean
  animations?: any[]
  forceIndices?: boolean
  includeCustomExtensions?: boolean
}

export interface CircuitTo3DOptions {
  /** Evaluate CAD explosion instructions before conversion to scene coordinates. */
  explosion?: AssemblyExplosionOptions
  /** Override folding for supported PCB bend regions. Undefined follows CAD is_on_folded_board. */
  foldPcbs?: boolean
  pcbColor?: Color
  boardSideColor?: Color
  componentColor?: Color
  copperColor?: Color
  silkscreenColor?: string
  solderMaskWithCopperColor?: string
  drillColor?: string
  boardThickness?: number
  boardDrillQuality?: "high" | "fast"
  drawFauxBoard?: boolean
  defaultComponentHeight?: number
  renderBoardTextures?: boolean
  textureResolution?: number
  showPcbNotes?: boolean
  /** Include full Circuit JSON error messages for screen overlay renderers. Defaults to false. */
  showErrors?: boolean
  coordinateTransform?: CoordinateTransformConfig
  /** Show named CAD reference surfaces as diagnostic frames. Defaults to false. */
  showReferenceSurfaces?: boolean
  showBoundingBoxes?: boolean
  projectBaseUrl?: string
  authHeaders?: AuthHeaders
}

export interface BoardRenderOptions {
  layer: "top" | "bottom"
  resolution?: number
  backgroundColor?: string
  copperColor?: string
  silkscreenColor?: string
  solderMaskWithCopperColor?: string
  padColor?: string
  drillColor?: string
  showPcbNotes?: boolean
}
