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

interface CircuitToGltfDemoProps {
  initialCircuitJson?: unknown
  initialFormat?: "gltf" | "glb"
  initialFoldPcbs?: boolean
}

export default function CircuitToGltfDemo({
  initialCircuitJson,
  initialFormat = "gltf",
  initialFoldPcbs = false,
}: CircuitToGltfDemoProps = {}) {
  const [gltfUrl, setGltfUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [circuitJson, setCircuitJson] = useState(() =>
    JSON.stringify(initialCircuitJson ?? usbCFlashlightCircuit, null, 2),
  )
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragDepth = useRef(0)

  const selectFile = (files: FileList) => {
    if (loading) return
    const file = files.item(0)
    if (files.length !== 1 || !file?.name.toLowerCase().endsWith(".json")) {
      setError("Choose a single .json file containing Circuit JSON.")
      return
    }
    setUploadedFile(file)
    setGltfUrl("")
    setError("")
  }

  const [foldPcbs, setFoldPcbs] = useState(initialFoldPcbs)
  const [format, setFormat] = useState<"gltf" | "glb">(initialFormat)

  const convertToGltf = async () => {
    setLoading(true)
    setError("")

    try {
      const circuit = JSON.parse(
        uploadedFile ? await uploadedFile.text() : circuitJson,
      )
      if (!Array.isArray(circuit)) {
        throw new Error("Circuit JSON must be an array of circuit elements.")
      }

      // Now we can use texture rendering with WASM!
      const result = await convertCircuitJsonToGltf(circuit, {
        format,
        foldPcbs,
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
    <div
      onDragEnter={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        dragDepth.current += 1
        setIsDragging(true)
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        event.dataTransfer.dropEffect = loading ? "none" : "copy"
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0) setIsDragging(false)
      }}
      onDrop={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return
        event.preventDefault()
        dragDepth.current = 0
        setIsDragging(false)
        selectFile(event.dataTransfer.files)
      }}
      style={{
        padding: "20px",
        fontFamily: "monospace",
        backgroundColor: isDragging ? "#eaf4ff" : undefined,
      }}
    >
      <h1>Circuit JSON to GLTF Converter</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={{ flex: 1 }}>
          <h2>Circuit JSON Input</h2>
          <div
            style={{
              padding: "16px",
              marginBottom: "10px",
              border: "2px dashed #aaa",
              borderRadius: "4px",
            }}
          >
            <label>
              Drop a Circuit JSON file anywhere on this page or choose a file:
              <input
                type="file"
                accept=".json,application/json"
                disabled={loading}
                onChange={(event) => {
                  if (event.target.files?.length) selectFile(event.target.files)
                  event.target.value = ""
                }}
                style={{ display: "block", marginTop: "10px" }}
              />
            </label>
          </div>
          {uploadedFile ? (
            <div
              role="status"
              aria-label="Selected circuit file"
              style={{ overflowWrap: "anywhere" }}
            >
              <p>
                Selected: {uploadedFile.name} (
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <p>
                File contents are kept out of the text editor. Click Convert to
                GLTF to load the model.
              </p>
              <button
                disabled={loading}
                onClick={() => {
                  setUploadedFile(null)
                  setGltfUrl("")
                  setError("")
                }}
              >
                Use text input
              </button>
            </div>
          ) : (
            <textarea
              aria-label="Circuit JSON"
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
          )}

          <div style={{ marginTop: "10px" }}>
            <label>
              Format:
              <select
                aria-label="Export format"
                value={format}
                onChange={(e) => setFormat(e.target.value as "gltf" | "glb")}
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="gltf">GLTF (JSON)</option>
                <option value="glb">GLB (Binary)</option>
              </select>
            </label>

            <label style={{ marginLeft: "20px" }}>
              PCB pose:
              <select
                aria-label="PCB pose"
                value={foldPcbs ? "folded" : "flat"}
                onChange={(event) =>
                  setFoldPcbs(event.target.value === "folded")
                }
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="flat">Flat</option>
                <option value="folded">Folded</option>
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
              role="alert"
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
          Drop or choose a Circuit JSON file, or edit the JSON on the left, and
          click "Convert to GLTF" to see the 3D model. Use your mouse to rotate
          and zoom the view.
        </p>
      </div>
    </div>
  )
}
