import type { CircuitJson } from "circuit-json"
import type { JscadOperation } from "jscad-planner"
import type { CadStickerRecord } from "../../lib/converters/sticker"

/** Camera position and target are points in exported glTF world: +Y up, mm. */
export const enclosureStickerCamera = {
  width: 840,
  height: 780,
  camPos: [62, 118, -88] as const,
  lookAt: [0, -12, 0] as const,
  fov: 30,
  up: "y+" as const,
  ambient: 0.8,
  backgroundColor: "#ffffff",
}

async function asset(filename: string) {
  return Bun.file(new URL(`../assets/${filename}`, import.meta.url)).bytes()
}

async function modelUrl(filename: string) {
  const bytes = Bun.gunzipSync(await asset(filename))
  return `data:model/gltf-binary;base64,${Buffer.from(bytes).toString("base64")}`
}

// Enclosure dimensions, mm. The lid wraps the 42.3 mm square controller board.
const OUTLINE = 45.5
const CORNER_CHAMFER = 5
const LID_HEIGHT = 12
const WALL = 1.5
const TOP_PLATE = 1.6
const SCREW_PITCH = 31
// Linear 0-1 RGB.
const LID_COLOR: [number, number, number] = [0.03, 0.04, 0.065]
const SCREW_COLOR: [number, number, number] = [0.3, 0.33, 0.38]

/** A square of the given size centered on the origin with chamfered corners. */
const chamferedSquare = (size: number, chamfer: number): JscadOperation => {
  const h = size / 2
  const c = h - chamfer
  return {
    type: "polygon",
    points: [
      [c, -h],
      [h, -c],
      [h, c],
      [c, h],
      [-c, h],
      [-h, c],
      [-h, -c],
      [-c, -h],
    ],
  }
}

const box = (
  size: [number, number, number],
  center: [number, number, number],
): JscadOperation => ({
  type: "translate",
  vector: center,
  shape: { type: "cuboid", size },
})

const screwPositions = [-1, 1].flatMap((x) =>
  [-1, 1].map((y) => [(x * SCREW_PITCH) / 2, (y * SCREW_PITCH) / 2] as const),
)

/** Lid-local XYZ, Z up, mm: the open underside sits at Z=0 on the motor's back
 * face and the top surface is at Z=LID_HEIGHT.
 */
const lidPlan: JscadOperation = {
  type: "colorize",
  color: LID_COLOR,
  shape: {
    type: "subtract",
    shapes: [
      {
        type: "extrudeLinear",
        options: { height: LID_HEIGHT },
        shape: chamferedSquare(OUTLINE, CORNER_CHAMFER),
      },
      // Cavity for the controller board.
      {
        type: "translate",
        vector: [0, 0, -1],
        shape: {
          type: "extrudeLinear",
          options: { height: LID_HEIGHT - TOP_PLATE + 1 },
          shape: chamferedSquare(OUTLINE - 2 * WALL, CORNER_CHAMFER),
        },
      },
      // Two USB-C openings in the -Y wall and the JST opening in the +X wall.
      box([10.4, 6, 5], [-6, -OUTLINE / 2, 5.3]),
      box([10.4, 6, 5], [7, -OUTLINE / 2, 5.3]),
      box([6, 11.5, 8.5], [OUTLINE / 2, 4.65, 5.3]),
      // Counterbores for the four screw heads.
      ...screwPositions.map(
        ([x, y]): JscadOperation => ({
          type: "cylinder",
          radius: 3.1,
          height: 2,
          center: [x, y, LID_HEIGHT],
          resolution: 32,
        }),
      ),
    ],
  },
}

/** Screw heads recessed in the lid's counterbores, each with a hex socket. */
const screwPlan: JscadOperation = {
  type: "colorize",
  color: SCREW_COLOR,
  shape: {
    type: "union",
    shapes: screwPositions.map(
      ([x, y]): JscadOperation => ({
        type: "subtract",
        shapes: [
          {
            type: "cylinder",
            radius: 2.75,
            height: 1.4,
            center: [x, y, LID_HEIGHT - 0.7],
            resolution: 32,
          },
          {
            type: "cylinder",
            radius: 1.45,
            height: 1.2,
            center: [x, y, LID_HEIGHT],
            resolution: 6,
          },
        ],
      }),
    ),
  },
}

const cadDefaults = {
  model_origin_position: { x: 0, y: 0, z: 0 },
  anchor_alignment: "center",
  model_object_fit: "contain_within_bounds",
} as const

/** A USB stepper driver enclosure on the back of a NEMA17 motor, with a product
 * sticker on the lid. Circuit XYZ, right-handed, +Z up, mm; Z=0 is the motor's
 * back face, which the enclosure sits on. The motor's shaft points along -Z.
 *
 * `cad_sticker` is the proposed Circuit JSON record. It is what core would
 * emit for:
 *
 *   <assembly.printedpart name="LID" jscad={<Lid />}>
 *     <assembly.sticker
 *       name="LABEL"
 *       imageUrl="./nema17-enclosure-sticker.svg"
 *       surfaceRef="topSurface"
 *       width="36mm"
 *       height="17mm"
 *     />
 *   </assembly.printedpart>
 */
export async function createNema17EnclosureWithSticker(
  stickerOverrides: Partial<CadStickerRecord> = {},
): Promise<CircuitJson> {
  const [boardUrl, motorUrl, artwork] = await Promise.all([
    modelUrl("rp2040-motor-controller.glb.gz"),
    modelUrl("nema17-jstph6.glb.gz"),
    asset("nema17-enclosure-sticker.svg"),
  ])
  const sticker: CadStickerRecord = {
    type: "cad_sticker",
    cad_sticker_id: "label-sticker",
    source_component_id: "label-source",
    applied_to_source_component_id: "lid-source",
    center: { x: 0, y: 0, z: LID_HEIGHT },
    normal_direction: { x: 0, y: 0, z: 1 },
    x_axis_direction: { x: 1, y: 0, z: 0 },
    width: 36,
    height: 17,
    thickness: 0.15,
    image_asset: {
      project_relative_path: "tests/assets/nema17-enclosure-sticker.svg",
      url: `data:image/svg+xml;base64,${Buffer.from(artwork).toString("base64")}`,
      mimetype: "image/svg+xml",
    },
    background_color: "#f4f4f2",
    ...stickerOverrides,
  }
  return [
    {
      type: "source_component",
      source_component_id: "motor-source",
      ftype: "simple_chip",
      name: "MOTOR",
    },
    {
      type: "cad_component",
      cad_component_id: "motor-cad",
      source_component_id: "motor-source",
      model_glb_url: motorUrl,
      // Motor-local +Z is the shaft and +X its JST. Y180 points the shaft along
      // circuit -Z and the JST along circuit -X.
      position: { x: 0, y: 0, z: -41 },
      rotation: { x: 0, y: 180, z: 0 },
      ...cadDefaults,
    },
    {
      type: "source_component",
      source_component_id: "controller-source",
      ftype: "simple_chip",
      name: "CONTROLLER",
    },
    {
      type: "cad_component",
      cad_component_id: "controller-cad",
      source_component_id: "controller-source",
      model_glb_url: boardUrl,
      model_board_normal_direction: "y+",
      // Z180 turns the USB-C connectors toward circuit -Y.
      position: { x: 0, y: 0, z: 3 },
      rotation: { x: 0, y: 0, z: 180 },
      ...cadDefaults,
    },
    {
      type: "source_component",
      source_component_id: "lid-source",
      ftype: "printedpart",
      name: "LID",
    },
    {
      type: "cad_component",
      cad_component_id: "lid-cad",
      source_component_id: "lid-source",
      model_jscad: lidPlan,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      ...cadDefaults,
    },
    {
      type: "source_component",
      source_component_id: "screws-source",
      ftype: "simple_chip",
      name: "SCREWS",
    },
    {
      type: "cad_component",
      cad_component_id: "screws-cad",
      source_component_id: "screws-source",
      model_jscad: screwPlan,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      ...cadDefaults,
    },
    {
      type: "source_component",
      source_component_id: "label-source",
      ftype: "simple_chip",
      name: "LABEL",
    },
    sticker,
  ] as CircuitJson
}
