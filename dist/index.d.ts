import { PcbStiffener, CircuitJson, PcbBoard } from 'circuit-json';
import { mat4 } from 'gl-matrix';

/** Circuit JSON bend geometry, board-local +Z up, millimeters. */
interface PcbBendRecord {
    type: "pcb_bend";
    pcb_bend_id: string;
    pcb_board_id: string;
    name?: string;
    pcb_group_id?: string;
    subcircuit_id?: string;
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    bend_angle: number;
    bend_radius: number;
    bend_side: "left" | "right";
}

type PcbStiffenerRecord = PcbStiffener;

/** Accept unreleased flex records alongside existing Circuit JSON elements. */
type CircuitJsonWithPcbFlex = (CircuitJson[number] | PcbBendRecord | PcbStiffenerRecord | (Omit<PcbBoard, "material"> & {
    material: "flex";
}))[];
interface AuthHeaders extends Record<string, string> {
    Authorization: string;
}
interface ConversionOptions {
    /** Override the render fold state. Undefined follows CAD is_on_folded_board in Circuit JSON. */
    foldPcbs?: boolean;
    format?: "gltf" | "glb";
    boardTextureResolution?: number;
    showPcbNotes?: boolean;
    /** Include full Circuit JSON error messages for screen overlay renderers. Defaults to false. */
    showErrors?: boolean;
    boardDrillQuality?: "high" | "fast";
    drawFauxBoard?: boolean;
    includeModels?: boolean;
    modelCache?: Map<string, STLMesh | OBJMesh>;
    backgroundColor?: string;
    boardSideColor?: Color;
    copperColor?: string;
    silkscreenColor?: string;
    solderMaskWithCopperColor?: string;
    drillColor?: string;
    showBoundingBoxes?: boolean;
    coordinateTransform?: CoordinateTransformConfig;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}
interface CoordinateTransformConfig {
    flipX?: number;
    flipY?: number;
    flipZ?: number;
    axisMapping?: {
        x?: "x" | "y" | "z" | "-x" | "-y" | "-z";
        y?: "x" | "y" | "z" | "-x" | "-y" | "-z";
        z?: "x" | "y" | "z" | "-x" | "-y" | "-z";
    };
    rotation?: {
        x?: number;
        y?: number;
        z?: number;
    };
}
interface Point3 {
    x: number;
    y: number;
    z: number;
}
interface Size3 {
    x: number;
    y: number;
    z: number;
}
interface Triangle {
    /** Original PCB surface identity, retained after folding. */
    pcbFace?: "top" | "bottom" | "side";
    /** Flat PCB texture coordinates, retained/interpolated during tessellation. */
    uvs?: [
        {
            u: number;
            v: number;
        },
        {
            u: number;
            v: number;
        },
        {
            u: number;
            v: number;
        }
    ];
    vertices: [Point3, Point3, Point3];
    normal: Point3;
    color?: Color;
    materialIndex?: number;
}
interface BoundingBox {
    min: Point3;
    max: Point3;
}
interface STLMesh {
    triangles: Triangle[];
    boundingBox: BoundingBox;
}
interface OBJMesh extends STLMesh {
    materials?: Map<string, OBJMaterial>;
    materialIndexMap?: Map<string, number>;
}
interface OBJMaterial {
    name: string;
    color?: Color;
    ambient?: Color;
    specular?: Color;
    shininess?: number;
    dissolve?: number;
}
type Color = string | [number, number, number, number];
interface Box3D {
    center: Point3;
    size: Size3;
    rotation?: Point3;
    color?: Color;
    sideColor?: Color;
    texture?: {
        top?: string;
        bottom?: string;
        front?: string;
        back?: string;
        left?: string;
        right?: string;
    };
    mesh?: STLMesh | OBJMesh;
    meshUrl?: string;
    meshType?: "stl" | "obj" | "glb" | "step";
    label?: string;
    labelColor?: Color;
    isTranslucent?: boolean;
    showHiddenEdges?: boolean;
}
interface Scene3D {
    boxes: Box3D[];
    camera?: Camera3D;
    lights?: Light3D[];
    /** Full Circuit JSON error messages, independent of geometry and camera. */
    errorMessages?: string[];
}
interface Camera3D {
    position: Point3;
    target: Point3;
    up?: Point3;
    fov?: number;
    near?: number;
    far?: number;
}
interface Light3D {
    type: "ambient" | "directional" | "point";
    color?: Color;
    intensity?: number;
    position?: Point3;
    direction?: Point3;
}
interface GLTFExportOptions {
    binary?: boolean;
    trs?: boolean;
    onlyVisible?: boolean;
    truncateDrawRange?: boolean;
    embedImages?: boolean;
    animations?: any[];
    forceIndices?: boolean;
    includeCustomExtensions?: boolean;
}
interface CircuitTo3DOptions {
    /** Override folding for supported PCB bend regions. Undefined follows CAD is_on_folded_board. */
    foldPcbs?: boolean;
    pcbColor?: Color;
    boardSideColor?: Color;
    componentColor?: Color;
    copperColor?: Color;
    silkscreenColor?: string;
    solderMaskWithCopperColor?: string;
    drillColor?: string;
    boardThickness?: number;
    boardDrillQuality?: "high" | "fast";
    drawFauxBoard?: boolean;
    defaultComponentHeight?: number;
    renderBoardTextures?: boolean;
    textureResolution?: number;
    showPcbNotes?: boolean;
    /** Include full Circuit JSON error messages for screen overlay renderers. Defaults to false. */
    showErrors?: boolean;
    coordinateTransform?: CoordinateTransformConfig;
    showBoundingBoxes?: boolean;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}
interface BoardRenderOptions {
    layer: "top" | "bottom";
    resolution?: number;
    backgroundColor?: string;
    copperColor?: string;
    silkscreenColor?: string;
    solderMaskWithCopperColor?: string;
    padColor?: string;
    drillColor?: string;
    showPcbNotes?: boolean;
}

interface PoppyglErrorOverlayOptions {
    /** Final image dimensions in pixels, before PoppyGL supersampling. */
    width: number;
    height: number;
    supersampling?: number;
    /** Font height in final image pixels. Default: 16. */
    debugFontSize?: number;
}
interface PoppyglErrorOverlay {
    debugPoints: Array<{
        label: string;
        /** Layout anchor in the exported glTF world frame: +Y up, millimeters.
         * This is a point, so camera translation applies. It is not an error's
         * physical position on the circuit. */
        position: {
            x: number;
            y: number;
            z: number;
        };
    }>;
    debugFontSize: number;
}
/** Adapt Circuit JSON error metadata to stock PoppyGL's existing debug labels.
 *
 * Supply the camera built from the same draw calls and render options used by
 * PoppyGL. Each label's screen layout anchor is unprojected through the inverse
 * of camera.proj * camera.view (the paired reference is PoppyGL's
 * drawDebugPoints/projectWorldToScreen). The resulting point is in the final
 * glTF world frame, +Y up and millimeters; it does not locate a circuit error.
 * Recompute these options whenever the camera or image dimensions change.
 *
 * Width, height and the requested font size are final image pixels. Stock
 * PoppyGL draws debug labels before downsampling, so the returned font size
 * and pixel anchors account for its supersampling factor. No geometry, camera
 * matrices or metadata are modified. Returns undefined when no errors exist.
 */
declare function getPoppyglErrorOverlayOptions(gltf: unknown, camera: {
    view: mat4;
    proj: mat4;
}, options: PoppyglErrorOverlayOptions): PoppyglErrorOverlay | undefined;

declare function renderBoardLayer(circuitJson: CircuitJson, options: BoardRenderOptions): Promise<string>;
declare function renderBoardTextures(circuitJson: CircuitJson, { resolution, backgroundColor, copperColor, silkscreenColor, solderMaskWithCopperColor, drillColor, showPcbNotes, }: Omit<BoardRenderOptions, "layer">): Promise<{
    top: string;
    bottom: string;
}>;

declare function convertCircuitJsonTo3D(inputCircuitJson: CircuitJsonWithPcbFlex, options?: CircuitTo3DOptions): Promise<Scene3D>;

declare function convertSceneToGLTF(scene: Scene3D, options?: GLTFExportOptions): Promise<ArrayBuffer | object>;

declare function loadGLB({ url, transform, projectBaseUrl, authHeaders, }: {
    url: string;
    transform?: CoordinateTransformConfig;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}): Promise<STLMesh | OBJMesh>;
declare function clearGLBCache(): void;

declare const loadJscadPlan: (plan: unknown) => STLMesh;

declare function loadOBJ({ url, transform, projectBaseUrl, authHeaders, }: {
    url: string;
    transform?: CoordinateTransformConfig;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}): Promise<OBJMesh>;
declare function clearOBJCache(): void;

declare function loadSTL({ url, transform, projectBaseUrl, authHeaders, }: {
    url: string;
    transform?: CoordinateTransformConfig;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}): Promise<STLMesh>;
declare function clearSTLCache(): void;

declare const CAMERA_PRESET_DIRECTIONS: {
    readonly isometric: readonly [-0.7, 1.2, -0.8];
    readonly top_down: readonly [0, 1, 0.001];
    readonly bottom_up: readonly [0, -1, 0.001];
    readonly left_side: readonly [-1, 0, 0];
    readonly right_side: readonly [1, 0, 0];
    readonly front: readonly [0, 0, 1];
    readonly back: readonly [0, 0, -1];
};
type CameraPreset = keyof typeof CAMERA_PRESET_DIRECTIONS;
interface CameraFitOptions {
    /**
     * Named preset view. Useful for stable top/bottom/side snapshots.
     *
     * `top_down`/`bottom_up` use a tiny hidden tilt because the downstream
     * renderer currently assumes a fixed up-vector and collapses on a perfectly
     * vertical view.
     */
    preset?: CameraPreset;
    /**
     * Approximate an orthographic view using a very narrow perspective FOV.
     *
     * This is a compatibility hack for renderers that only expose perspective
     * cameras. It is not a true orthographic projection.
     */
    ortho?: boolean;
    /**
     * Target-to-camera direction vector used for solved camera position.
     */
    direction?: readonly [number, number, number];
    /**
     * Vertical field of view in degrees.
     */
    fov?: number;
    /**
     * Aspect ratio (width / height) used for horizontal fit calculations.
     */
    aspectRatio?: number;
    /**
     * Focal length in millimeters. If provided with sensorHeight,
     * it is used instead of fov.
     */
    focalLength?: number;
    /**
     * Sensor height in millimeters for focalLength->fov conversion.
     */
    sensorHeight?: number;
}
declare function getBestCameraPosition(circuitJson: CircuitJson, opts?: CameraFitOptions): {
    camPos: readonly [number, number, number];
    lookAt: readonly [number, number, number];
    fov: number;
};

declare function applyCoordinateTransform(point: Point3, config: CoordinateTransformConfig): Point3;
declare function transformTriangles(triangles: Triangle[], config: CoordinateTransformConfig): Triangle[];
declare const COORDINATE_TRANSFORMS: {
    readonly CIRCUIT_Z_UP_TO_SCENE_Y_UP: CoordinateTransformConfig;
    readonly Z_UP_TO_Y_UP: CoordinateTransformConfig;
    readonly Z_OUT_OF_TOP: CoordinateTransformConfig;
    readonly STEP_INVERTED: CoordinateTransformConfig;
    readonly USB_PORT_FIX: CoordinateTransformConfig;
    readonly Z_UP_TO_Y_UP_USB_FIX: CoordinateTransformConfig;
    readonly IDENTITY: CoordinateTransformConfig;
    readonly TEST_ROTATE_X_90: CoordinateTransformConfig;
    readonly TEST_ROTATE_X_270: CoordinateTransformConfig;
    readonly TEST_ROTATE_Y_90: CoordinateTransformConfig;
    readonly TEST_ROTATE_Y_270: CoordinateTransformConfig;
    readonly TEST_ROTATE_Z_90: CoordinateTransformConfig;
    readonly TEST_ROTATE_Z_270: CoordinateTransformConfig;
    readonly TEST_FLIP_X: CoordinateTransformConfig;
    readonly TEST_FLIP_Z: CoordinateTransformConfig;
    readonly FOOTPRINTER_MODEL_TRANSFORM: CoordinateTransformConfig;
    readonly OBJ_Z_UP_TO_Y_UP: CoordinateTransformConfig;
};

declare function convertCircuitJsonToGltf(circuitJson: CircuitJsonWithPcbFlex, options?: ConversionOptions): Promise<ArrayBuffer | object>;

interface Point {
    x: number;
    y: number;
}
type LayerRef = string | number;
interface BRepShape {
    polygons: Point[][];
    is_negative?: boolean;
}

export { type BRepShape, type BoardRenderOptions, type BoundingBox, type Box3D, CAMERA_PRESET_DIRECTIONS, COORDINATE_TRANSFORMS, type Camera3D, type CameraFitOptions, type CameraPreset, type CircuitJsonWithPcbFlex, type CircuitTo3DOptions, type Color, type ConversionOptions, type CoordinateTransformConfig, type GLTFExportOptions, type LayerRef, type Light3D, type OBJMaterial, type OBJMesh, type PcbBendRecord, type PcbStiffenerRecord, type Point, type Point3, type PoppyglErrorOverlay, type PoppyglErrorOverlayOptions, type STLMesh, type Scene3D, type Size3, type Triangle, applyCoordinateTransform, clearGLBCache, clearOBJCache, clearSTLCache, convertCircuitJsonTo3D, convertCircuitJsonToGltf, convertSceneToGLTF, getBestCameraPosition, getPoppyglErrorOverlayOptions, loadGLB, loadJscadPlan, loadOBJ, loadSTL, renderBoardLayer, renderBoardTextures, transformTriangles };
