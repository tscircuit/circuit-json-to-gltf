import type { ReactElement } from "react"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getBoundingBoxCenter } from "../../lib/utils/mesh-scale"
import { svgToPng } from "../../lib/utils/svg-to-png"
import { renderGlbToPng } from "../renderGlbToPng"
import { measureGripRotation } from "./grip-measurement"
import {
  getKeyedModelTriangles,
  isKeyTriangle,
  KEYED_CAD_MODEL_URL,
} from "./keyed-cad-model"

/** Real TSX authoring and OBJ loading; no mocks or Circuit JSON edits. */
export async function renderCadmodelRotationOffset(
  axis: "x" | "y" | "z",
  model: (degrees: number) => ReactElement,
) {
  const exportPose = async (degrees: number) => {
    const circuit = new Circuit()
    circuit.add(
      <board width={16} height={12} thickness={1.6} routingDisabled>
        <chip
          name="U1"
          footprint="0402"
          pcbX={0}
          pcbY={0}
          pcbRotation={0}
          cadModel={model(degrees)}
        />
      </board>,
    )
    await circuit.renderUntilSettled()
    const circuitJson = await circuit.getCircuitJson()
    const cad = circuitJson.find((element) => element.type === "cad_component")
    const pcb = circuitJson.find((element) => element.type === "pcb_component")
    if (
      !cad ||
      !pcb ||
      cad.model_obj_url !== KEYED_CAD_MODEL_URL ||
      cad.footprinter_string
    ) {
      throw new Error("Expected the authored cadmodel to use the real OBJ path")
    }
    const glb = await convertCircuitJsonToGltf(circuitJson, {
      format: "glb",
      boardTextureResolution: 512,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")
    const key = getKeyedModelTriangles(glb).filter(isKeyTriangle)
    if (key.length !== 12) throw new Error("Expected the complete red OBJ key")
    const center = getBoundingBoxCenter(boundsOfTriangles(key))
    // Undo only the final world mapping (-x,z,y) and the CAD anchor translation.
    const marker = {
      x: -center.x - cad.position.x,
      y: center.z - cad.position.y,
      z: center.y - cad.position.z,
    }
    const image = Buffer.from(
      await renderGlbToPng(glb, circuitJson, {
        width: 780,
        height: 760,
        camPos: [-24, 21, 28],
        lookAt: [0, 3, 0],
        up: "y+",
        fov: 34,
        backgroundColor: "#ffffff",
        grid: false,
        debugFontSize: 24,
        debugLabelColor: [0.08, 0.1, 0.14],
        debugPointColor: [0.08, 0.1, 0.14],
        debugPoints: [
          { label: "+X", position: { x: -8, y: 0.8, z: 0 } },
          { label: "+Y", position: { x: 0, y: 0.8, z: 6 } },
          { label: "+Z", position: { x: 0, y: 11, z: 0 } },
        ],
      }),
    ).toString("base64")
    return { cad, pcb, marker, image }
  }

  const initial = await exportPose(0)
  const rotated = await exportPose(90)
  const measuredDegrees = measureGripRotation(
    axis,
    initial.marker,
    rotated.marker,
  )
  const signedTurn = `${measuredDegrees >= 0 ? "+" : ""}${measuredDegrees.toFixed(1)}`
  const emittedRotation = rotated.cad.rotation
  if (!emittedRotation) throw new Error("TSX did not emit a CAD rotation")
  const rotation = [
    emittedRotation.x,
    emittedRotation.y,
    emittedRotation.z,
  ].join(", ")
  const pointLabel = (point: typeof initial.marker) =>
    [point.x, point.y, point.z].map((value) => value.toFixed(2)).join(", ")
  const expected = {
    x: { x: 1.5, y: -2, z: 1 },
    y: { x: 2, y: 1, z: -1.5 },
    z: { x: -1, y: 1.5, z: 2 },
  }[axis]
  const png = await svgToPng(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="1100">
      <rect width="1560" height="1100" fill="white"/>
      <image x="0" y="180" width="780" height="760" href="data:image/png;base64,${initial.image}"/>
      <image x="780" y="180" width="780" height="760" href="data:image/png;base64,${rotated.image}"/>
      <path d="M780 150 V930" stroke="#dbe1e7"/>
      <g font-family="sans-serif" fill="#17212e">
        <text x="24" y="40" font-size="30">TSX CADMODEL: rotationOffset about +${axis.toUpperCase()}</text>
        <text x="24" y="78" font-size="23">Real TSX to Circuit JSON to OBJ loader to exported GLB. No mocks or JSON edits.</text>
        <text x="24" y="112" font-size="20">PCB rotation stays zero. Only the CAD model receives the rotationOffset.</text>
        <text x="24" y="154" font-size="23">INITIAL offset (x, y, z) = (0, 0, 0) deg</text>
        <text x="804" y="154" font-size="23">OFFSET (x, y, z) = (${rotation}) deg</text>
        <text x="24" y="184" font-size="19">Blue body and red off-axis key from the OBJ fixture</text>
        <text x="804" y="184" font-size="19">Actual exported result, not a corrected illustration</text>
        <text x="804" y="222" font-size="23">MEASURED: ${signedTurn} deg / EXPECTED: +90 deg</text>
        <text x="24" y="960" font-size="20">Fixed XY board, Z-up, mm. Model raised 6 mm above the surface to show tilt clearly.</text>
        <text x="24" y="996" font-size="20">Red key relative to CAD anchor: initial (${pointLabel(initial.marker)}); exported (${pointLabel(rotated.marker)}).</text>
        <text x="24" y="1028" font-size="20">Right-hand +90 deg would place that key at (${pointLabel(expected)}).</text>
        <text x="24" y="1060" font-size="20">Signed turn is measured from final GLB key centers. Positive follows the right-hand rule.</text>
        <text x="24" y="1088" font-size="16">Known OBJ-path behavior: X/Y reversed, Z correct. The footprinter-only correction does not change this path.</text>
      </g>
    </svg>`,
  )
  return { initial, rotated, measuredDegrees, png }
}
