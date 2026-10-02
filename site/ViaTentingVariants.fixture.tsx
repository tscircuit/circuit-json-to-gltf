import { Circuit } from "@tscircuit/core"
import { ViaTentingVariants } from "../examples/via-tenting-variants"
import CircuitToGltfDemo from "./page"

const circuit = new Circuit()
circuit.add(<ViaTentingVariants />)

export default (
  <CircuitToGltfDemo
    initialCircuitJson={circuit.getCircuitJson()}
    initialFormat="glb"
  />
)
