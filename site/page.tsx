import React, { useEffect, useRef, useState } from "react"
import "@google/model-viewer"
import usbCFlashlightCircuit from "./assets/usb-c-flashlight.json"
import { convertCircuitJsonToGltf } from "../lib"

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

  namespace React {
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
}

export default function CircuitToGltfDemo() {
  const [gltfUrl, setGltfUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [circuitJson, setCircuitJson] = useState(
    JSON.stringify(usbCFlashlightCircuit, null, 2),
  )
  const [format, setFormat] = useState<"gltf" | "glb">("gltf")

  const convertToGltf = async () => {
    setLoading(true)
    setError("")

    try {
      const circuit = JSON.parse(circuitJson)

      // Now we can use texture rendering with WASM!
      const result = await convertCircuitJsonToGltf(circuit, {
        format,
        boardTextureResolution: 1024, // Lower resolution for performance
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
