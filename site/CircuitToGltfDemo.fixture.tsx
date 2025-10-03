import CircuitToGltfDemo from "./page"
import bottomLayerCircuit from "./assets/bottom-layer-demo.json"

export default {
  "Default Circuit": <CircuitToGltfDemo />,
  "Bottom Layer Components": (
    <CircuitToGltfDemo
      initialCircuit={bottomLayerCircuit}
      title="Bottom Layer Components"
    />
  ),
}
