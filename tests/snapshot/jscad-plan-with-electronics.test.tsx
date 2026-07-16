import { expect, test } from "bun:test"
import type { CadComponent, CircuitJson, PcbBoard } from "circuit-json"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

const createOpenTopEnclosurePlan = ({
  width,
  height,
  depth,
  wallThickness,
}: {
  width: number
  height: number
  depth: number
  wallThickness: number
}) => ({
  type: "subtract",
  shapes: [
    {
      type: "translate",
      vector: [0, 0, depth / 2],
      shape: { type: "cuboid", size: [width, height, depth] },
    },
    {
      type: "translate",
      vector: [0, 0, wallThickness + depth / 2],
      shape: {
        type: "cuboid",
        size: [width - wallThickness * 2, height - wallThickness * 2, depth],
      },
    },
  ],
})

test("renders a JSCAD enclosure with representative electronic packages", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="44mm" height="22mm">
      <chip name="U1" footprint="soic8" pcbX={-14} pcbY={0} />
      <chip name="U2" footprint="qfp32" pcbX={0} pcbY={0} />
      <chip name="U3" footprint="dip8" pcbX={14} pcbY={0} />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()
  const pcbBoard = circuitJson.find(
    (element): element is PcbBoard => element.type === "pcb_board",
  )
  if (
    !pcbBoard ||
    pcbBoard.width === undefined ||
    pcbBoard.height === undefined
  ) {
    throw new Error("Expected the test circuit to render a sized board")
  }

  const enclosureWidth = pcbBoard.width + 4
  const enclosureHeight = pcbBoard.height + 4
  const wallThickness = 2
  const enclosureSourceComponentId = "source_component_enclosure"
  const enclosurePcbComponentId = "pcb_component_enclosure"

  circuitJson.push(
    {
      type: "source_component",
      source_component_id: enclosureSourceComponentId,
      name: "ENCLOSURE",
      ftype: "simple_chip",
    },
    {
      type: "pcb_component",
      pcb_component_id: enclosurePcbComponentId,
      source_component_id: enclosureSourceComponentId,
      center: pcbBoard.center,
      width: enclosureWidth,
      height: enclosureHeight,
      rotation: 0,
      layer: "top",
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_component_enclosure",
      source_component_id: enclosureSourceComponentId,
      pcb_component_id: enclosurePcbComponentId,
      position: {
        x: pcbBoard.center.x,
        y: pcbBoard.center.y,
        z: -(pcbBoard.thickness ?? 1.6) / 2 - wallThickness,
      },
      rotation: { x: 0, y: 0, z: 0 },
      model_jscad: createOpenTopEnclosurePlan({
        width: enclosureWidth,
        height: enclosureHeight,
        depth: 8,
        wallThickness,
      }),
      show_as_translucent_model: true,
    } as CadComponent,
  )

  const jscadElectronicPackages = circuitJson
    .filter(
      (element): element is CadComponent =>
        element.type === "cad_component" && Boolean(element.footprinter_string),
    )
    .map((component) => component.footprinter_string)
    .sort()

  expect(jscadElectronicPackages).toEqual(["dip8", "qfp32", "soic8"])

  const glb = await convertCircuitJsonToGltf(circuitJson as CircuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(
    renderGlbToPng(glb as ArrayBuffer, circuitJson as CircuitJson, {
      backgroundColor: [1, 1, 1],
    }),
  ).toMatchPngSnapshot(import.meta.path, "jscad-plan-with-electronics")
})
