import { expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import {
  getBestCameraPosition,
  type CameraPreset,
} from "../../lib/utils/camera-position"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson, PcbSmtPad } from "circuit-json"

const SOURCE_COMPONENT_ID = "source_component_15"
const PCB_COMPONENT_ID = "pcb_component_15"
const CAD_COMPONENT_ID = "cad_component_5"

function addSmtPadBounds(bounds: { x: number[]; y: number[] }, pad: PcbSmtPad) {
  if (pad.shape === "polygon") {
    for (const point of pad.points) {
      bounds.x.push(point.x)
      bounds.y.push(point.y)
    }
    return
  }

  if (pad.shape === "circle") {
    bounds.x.push(pad.x - pad.radius, pad.x + pad.radius)
    bounds.y.push(pad.y - pad.radius, pad.y + pad.radius)
    return
  }

  const halfWidth = pad.width / 2
  const halfHeight = pad.height / 2

  if (pad.shape === "rotated_rect" || pad.shape === "rotated_pill") {
    const rotationRadians = (pad.ccw_rotation * Math.PI) / 180
    const cos = Math.abs(Math.cos(rotationRadians))
    const sin = Math.abs(Math.sin(rotationRadians))
    const xExtent = halfWidth * cos + halfHeight * sin
    const yExtent = halfWidth * sin + halfHeight * cos

    bounds.x.push(pad.x - xExtent, pad.x + xExtent)
    bounds.y.push(pad.y - yExtent, pad.y + yExtent)
    return
  }

  bounds.x.push(pad.x - halfWidth, pad.x + halfWidth)
  bounds.y.push(pad.y - halfHeight, pad.y + halfHeight)
}

function createIsolatedAtmegaCircuit(
  fullCircuitJson: CircuitJson,
): CircuitJson {
  const relevantRecords = fullCircuitJson.filter((record) => {
    if (
      record.type === "source_project_metadata" ||
      (record.type === "source_component" &&
        record.source_component_id === SOURCE_COMPONENT_ID) ||
      (record.type === "source_port" &&
        record.source_component_id === SOURCE_COMPONENT_ID) ||
      (record.type === "pcb_component" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "pcb_port" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "pcb_smtpad" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "pcb_solder_paste" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "pcb_silkscreen_path" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "pcb_courtyard_outline" &&
        record.pcb_component_id === PCB_COMPONENT_ID) ||
      (record.type === "cad_component" &&
        record.cad_component_id === CAD_COMPONENT_ID)
    ) {
      return true
    }

    return false
  })

  const xBounds: number[] = []
  const yBounds: number[] = []

  for (const record of relevantRecords) {
    if (record.type === "pcb_smtpad") {
      addSmtPadBounds({ x: xBounds, y: yBounds }, record)
    }

    if (record.type === "pcb_silkscreen_path") {
      for (const point of record.route) {
        xBounds.push(point.x)
        yBounds.push(point.y)
      }
    }

    if (record.type === "pcb_courtyard_outline") {
      for (const point of record.outline) {
        xBounds.push(point.x)
        yBounds.push(point.y)
      }
    }
  }

  const minX = Math.min(...xBounds)
  const maxX = Math.max(...xBounds)
  const minY = Math.min(...yBounds)
  const maxY = Math.max(...yBounds)
  const margin = 0.8

  return [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_atmega_repro",
      source_board_id: "source_board_atmega_repro",
      center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
      thickness: 1.4,
      num_layers: 2,
      width: maxX - minX + margin * 2,
      height: maxY - minY + margin * 2,
      outline: [
        { x: minX - margin, y: minY - margin },
        { x: maxX + margin, y: minY - margin },
        { x: maxX + margin, y: maxY + margin },
        { x: minX - margin, y: maxY + margin },
      ],
      material: "fr4",
    },
    ...relevantRecords,
  ] as CircuitJson
}

let snapshotContextPromise:
  | Promise<{
      circuitJson: CircuitJson
      glbResult: ArrayBuffer
    }>
  | undefined

async function getSnapshotContext() {
  if (!snapshotContextPromise) {
    snapshotContextPromise = (async () => {
      const fixturePath = path.join(
        __dirname,
        "../fixtures/arduino-uno.circuit.json",
      )
      const circuitData = fs.readFileSync(fixturePath, "utf-8")
      const fullCircuitJson: CircuitJson = JSON.parse(circuitData)
      const circuitJson = createIsolatedAtmegaCircuit(fullCircuitJson)

      const glbResult = await convertCircuitJsonToGltf(circuitJson, {
        format: "glb",
        boardTextureResolution: 1024,
        includeModels: true,
        showBoundingBoxes: false,
      })

      expect(glbResult).toBeInstanceOf(ArrayBuffer)
      expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

      return {
        circuitJson,
        glbResult: glbResult as ArrayBuffer,
      }
    })()
  }

  return snapshotContextPromise
}

export async function expectAtmegaPresetSnapshot(
  testPath: string,
  preset: CameraPreset,
  ortho = true,
) {
  const { circuitJson, glbResult } = await getSnapshotContext()

  const cameraOptions = getBestCameraPosition(circuitJson, {
    preset,
    ortho,
    aspectRatio: 1,
  })

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult, {
      ...cameraOptions,
      width: 512,
      height: 512,
      backgroundColor: [1, 1, 1],
      ambient: 0.55,
      cull: false,
    }),
  ).toMatchPngSnapshot(testPath)
}
