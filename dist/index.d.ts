import { CircuitJson } from 'circuit-json';

interface AuthHeaders extends Record<string, string> {
    Authorization: string;
}
interface ConversionOptions {
    format?: "gltf" | "glb";
    boardTextureResolution?: number;
    showPcbNotes?: boolean;
    boardDrillQuality?: "high" | "fast";
    drawFauxBoard?: boolean;
    includeModels?: boolean;
    modelCache?: Map<string, STLMesh | OBJMesh>;
    backgroundColor?: string;
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
}
interface Scene3D {
    boxes: Box3D[];
    camera?: Camera3D;
    lights?: Light3D[];
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
    pcbColor?: Color;
    componentColor?: Color;
    copperColor?: Color;
    boardThickness?: number;
    boardDrillQuality?: "high" | "fast";
    drawFauxBoard?: boolean;
    defaultComponentHeight?: number;
    renderBoardTextures?: boolean;
    textureResolution?: number;
    showPcbNotes?: boolean;
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
    padColor?: string;
    drillColor?: string;
    showPcbNotes?: boolean;
}

declare function renderBoardLayer(circuitJson: CircuitJson, options: BoardRenderOptions): Promise<string>;
declare function renderBoardTextures(circuitJson: CircuitJson, { resolution, showPcbNotes }: {
    resolution?: number | undefined;
    showPcbNotes?: boolean | undefined;
}): Promise<{
    top: string;
    bottom: string;
}>;

declare function convertCircuitJsonTo3D(circuitJson: CircuitJson, options?: CircuitTo3DOptions): Promise<Scene3D>;

declare function convertSceneToGLTF(scene: Scene3D, options?: GLTFExportOptions): Promise<ArrayBuffer | object>;

declare function loadGLB({ url, transform, projectBaseUrl, authHeaders, }: {
    url: string;
    transform?: CoordinateTransformConfig;
    projectBaseUrl?: string;
    authHeaders?: AuthHeaders;
}): Promise<STLMesh | OBJMesh>;
declare function clearGLBCache(): void;

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

declare function convertCircuitJsonToGltf(circuitJson: CircuitJson, options?: ConversionOptions): Promise<ArrayBuffer | object>;

interface Point {
    x: number;
    y: number;
}
type LayerRef = string | number;
interface BRepShape {
    polygons: Point[][];
    is_negative?: boolean;
}

export { type BRepShape, type BoardRenderOptions, type BoundingBox, type Box3D, CAMERA_PRESET_DIRECTIONS, COORDINATE_TRANSFORMS, type Camera3D, type CameraFitOptions, type CameraPreset, type CircuitTo3DOptions, type Color, type ConversionOptions, type CoordinateTransformConfig, type GLTFExportOptions, type LayerRef, type Light3D, type OBJMaterial, type OBJMesh, type Point, type Point3, type STLMesh, type Scene3D, type Size3, type Triangle, applyCoordinateTransform, clearGLBCache, clearOBJCache, clearSTLCache, convertCircuitJsonTo3D, convertCircuitJsonToGltf, convertSceneToGLTF, getBestCameraPosition, loadGLB, loadOBJ, loadSTL, renderBoardLayer, renderBoardTextures, transformTriangles };
