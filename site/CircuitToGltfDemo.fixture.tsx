import { createThreeDiscFlex } from "../examples/three-disc-flex"
import CircuitToGltfDemo from "./page"

export default {
  "Default Circuit": <CircuitToGltfDemo />,
  "Three-disc capsule flex": (
    <CircuitToGltfDemo
      initialCircuitJson={createThreeDiscFlex()}
      initialFormat="glb"
      initialFoldPcbs
    />
  ),
}
