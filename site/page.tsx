import React, { useEffect, useRef, useState } from "react"
import "@google/model-viewer"

// Declare model-viewer as a JSX element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          alt?: string
          "auto-rotate"?: boolean
          "camera-controls"?: boolean
          "shadow-intensity"?: string
          "environment-image"?: string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}

// Example circuit JSON
const exampleCircuit = [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 0, y: 0 },
    width: 100,
    height: 80,
    thickness: 1.6,
  },
  {
    type: "pcb_component",
    pcb_component_id: "comp1",
    source_component_id: "src1",
    center: { x: -30, y: -20 },
    width: 15,
    height: 10,
    layer: "top",
  },
  {
    type: "pcb_component",
    pcb_component_id: "comp2",
    source_component_id: "src2",
    center: { x: 20, y: 10 },
    width: 20,
    height: 20,
    layer: "top",
  },
  {
    type: "pcb_component",
    pcb_component_id: "comp3",
    source_component_id: "src3",
    center: { x: -10, y: 20 },
    width: 25,
    height: 15,
    layer: "top",
  },
  {
    type: "source_component",
    source_component_id: "src1",
    name: "R1",
    display_value: "10kΩ",
  },
  {
    type: "source_component",
    source_component_id: "src2",
    name: "U1",
    display_value: "ESP32",
  },
  {
    type: "source_component",
    source_component_id: "src3",
    name: "C1",
    display_value: "100µF",
  },
]

export default function CircuitToGltfDemo() {
  const [gltfUrl, setGltfUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [circuitJson, setCircuitJson] = useState(
    JSON.stringify(exampleCircuit, null, 2)
  )
  const [format, setFormat] = useState<"gltf" | "glb">("glb")

  const convertToGltf = async () => {
    setLoading(true)
    setError("")
    
    try {
      const circuit = JSON.parse(circuitJson)
      
      // Import the converter
      const { convertCircuitJsonToGltf } = await import("../lib")
      
      // Now we can use texture rendering with WASM!
      const result = await convertCircuitJsonToGltf(circuit, {
        format,
        boardTextureResolution: 512, // Lower resolution for performance
      })
      
      // Create blob URL for model-viewer
      let blob: Blob
      if (format === "glb") {
        blob = new Blob([result as ArrayBuffer], {
          type: "model/gltf-binary",
        })
      } else {
        blob = new Blob([JSON.stringify(result)], {
          type: "model/gltf+json",
        })
      }
      
      const url = URL.createObjectURL(blob)
      setGltfUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setLoading(false)
    }
  }

  // Convert on mount
  useEffect(() => {
    convertToGltf()
  }, [])

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (gltfUrl) {
        URL.revokeObjectURL(gltfUrl)
      }
    }
  }, [gltfUrl])

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Circuit JSON to GLTF Converter</h1>
      
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h2>Circuit JSON Input</h2>
          <textarea
            value={circuitJson}
            onChange={(e) => setCircuitJson(e.target.value)}
            style={{
              width: "100%",
              height: "400px",
              fontFamily: "monospace",
              fontSize: "12px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          
          <div style={{ marginTop: "10px" }}>
            <label>
              Format:
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "gltf" | "glb")}
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="gltf">GLTF (JSON)</option>
                <option value="glb">GLB (Binary)</option>
              </select>
            </label>
            
            <button
              onClick={convertToGltf}
              disabled={loading}
              style={{
                marginLeft: "20px",
                padding: "8px 16px",
                backgroundColor: loading ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Converting..." : "Convert to GLTF"}
            </button>
          </div>
          
          {error && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
              }}
            >
              Error: {error}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <h2>3D Preview</h2>
          <div
            style={{
              width: "100%",
              height: "500px",
              backgroundColor: "#f0f0f0",
              borderRadius: "4px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {gltfUrl ? (
              <model-viewer
                src={gltfUrl}
                alt="Circuit 3D Model"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#666",
                }}
              >
                {loading ? "Converting..." : "No model loaded"}
              </div>
            )}
          </div>
          
          {gltfUrl && (
            <div style={{ marginTop: "10px" }}>
              <a
                href={gltfUrl}
                download={`circuit.${format}`}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                Download {format.toUpperCase()}
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: "40px" }}>
        <h2>About</h2>
        <p>
          This demo converts Circuit JSON to GLTF 2.0 format. The converter
          supports:
        </p>
        <ul>
          <li>PCB board rendering with textures (using WASM)</li>
          <li>Component placement and sizing</li>
          <li>Both GLTF (JSON) and GLB (binary) output formats</li>
          <li>STL/OBJ model loading for components (if URLs provided)</li>
        </ul>
        <p>
          Edit the Circuit JSON on the left and click "Convert to GLTF" to see
          the 3D model. Use your mouse to rotate and zoom the view.
        </p>
      </div>
    </div>
  )
}