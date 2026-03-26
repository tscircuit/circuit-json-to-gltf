import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson } from "circuit-json"

const SOURCE_COMPONENT_ID = "source_component_15"
const PCB_COMPONENT_ID = "pcb_component_15"
const CAD_COMPONENT_ID = "cad_component_5"

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
      xBounds.push(record.x - record.width / 2, record.x + record.width / 2)
      yBounds.push(record.y - record.height / 2, record.y + record.height / 2)
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

const SNAPSHOT_CONFIGS = [
  { preset: "isometric", name: "isometric-atmega328p", ortho: false },
  { preset: "top_down", name: "topdown-atmega328p", ortho: true },
  { preset: "bottom_up", name: "bottomup-atmega328p", ortho: true },
  { preset: "left_side", name: "leftside-atmega328p", ortho: true },
  { preset: "right_side", name: "rightside-atmega328p", ortho: true },
  { preset: "front", name: "front-atmega328p", ortho: true },
  { preset: "back", name: "back-atmega328p", ortho: true },
] as const

test("camera-presets-atmega328p", async () => {
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

  for (const config of SNAPSHOT_CONFIGS) {
    const cameraOptions = getBestCameraPosition(circuitJson, {
      preset: config.preset,
      ortho: config.ortho,
      aspectRatio: 1,
    })

    expect(
      renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, {
        ...cameraOptions,
        width: 2048,
        height: 2048,
        supersampling: 2,
        backgroundColor: [1, 1, 1],
        ambient: 0.55,
        cull: "none",
      }),
    ).toMatchPngSnapshot(import.meta.path, config.name)
  }
}, 90_000)
