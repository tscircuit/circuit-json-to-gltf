import type { CircuitJson } from "circuit-json"

export const motorControllerCamera = {
  width: 620,
  height: 480,
  camPos: [40, 50, -100] as const,
  lookAt: [10, 0, 0] as const,
  fov: 45,
  up: "y+" as const,
  ambient: 0.8,
  backgroundColor: "#f2f3f5",
}

async function modelUrl(filename: string) {
  const bytes = await Bun.file(
    new URL(`../assets/${filename}`, import.meta.url),
  ).bytes()
  return `data:model/gltf-binary;base64,${Buffer.from(Bun.gunzipSync(bytes)).toString("base64")}`
}

/** Circuit XYZ, right-handed +Z up, mm. PCB 6 mm behind the motor rear face.
 * Motor-local +Z is the shaft; Y90 then X90 points it along circuit +X.
 */
export async function createNema17ControllerRotationRepro(): Promise<CircuitJson> {
  const [boardUrl, motorUrl] = await Promise.all([
    modelUrl("rp2040-motor-controller.glb.gz"),
    modelUrl("nema17-jstph6.glb.gz"),
  ])
  return [
    {
      type: "source_component",
      source_component_id: "controller-source",
      ftype: "simple_chip",
      name: "RP2040 motor controller",
    },
    {
      type: "cad_component",
      cad_component_id: "controller-cad",
      source_component_id: "controller-source",
      model_glb_url: boardUrl,
      model_board_normal_direction: "y+",
      model_origin_position: { x: 0, y: 0, z: 0 },
      position: { x: -44.8, y: 0, z: 0 },
      rotation: { x: 0, y: -90, z: 0 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
    },
    {
      type: "source_component",
      source_component_id: "motor-source",
      ftype: "simple_chip",
      name: "NEMA17",
    },
    {
      type: "cad_component",
      cad_component_id: "motor-cad",
      source_component_id: "motor-source",
      model_glb_url: motorUrl,
      model_origin_position: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 90, y: 90, z: 180 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
    },
  ]
}
