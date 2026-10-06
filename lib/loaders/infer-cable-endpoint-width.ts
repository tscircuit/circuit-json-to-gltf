import type { CadCable, CircuitJson } from "circuit-json"
import { mat4, vec3 } from "gl-matrix"

/** Return the pin-row direction in circuit world (+Z up, mm).
 * PCB ports already include footprint rotation and layer mirroring. Using
 * their emitted positions also supports custom footprints without new fields.
 */
export function inferCableEndpointWidth(
  cable: CadCable,
  circuitJson: CircuitJson,
  endpoint: "from" | "to",
): [number, number, number] | undefined {
  const id =
    endpoint === "from"
      ? cable.from_source_component_id
      : cable.to_source_component_id
  const path = cable.path
  if (path.length < 2) return undefined
  const tip = endpoint === "from" ? path[0]! : path.at(-1)!
  const next = endpoint === "from" ? path[1]! : path.at(-2)!
  const outward = vec3.normalize(vec3.create(), [
    next.x - tip.x,
    next.y - tip.y,
    next.z - tip.z,
  ])
  const project = (direction: vec3) => {
    vec3.scaleAndAdd(
      direction,
      direction,
      outward,
      -vec3.dot(direction, outward),
    )
    return direction
  }
  const sourcePorts = circuitJson.filter(
    (e) => e.type === "source_port" && e.source_component_id === id,
  )
  const pinNumber = (port: (typeof sourcePorts)[number]) => {
    if (port.type !== "source_port") return Infinity
    return (
      port.pin_number ??
      Number(
        port.port_hints?.find((hint) => /^pin\d+$/.test(hint))?.slice(3) ??
          Infinity,
      )
    )
  }
  sourcePorts.sort((a, b) => pinNumber(a) - pinNumber(b))
  const pins = sourcePorts.flatMap((source) => {
    if (source.type !== "source_port") return []
    const port = circuitJson.find(
      (e) =>
        e.type === "pcb_port" && e.source_port_id === source.source_port_id,
    )
    return port?.type === "pcb_port" ? [port] : []
  })
  // The longest projected pin pair identifies the connector's width even
  // when a side-entry connector has multiple rows. Ascending pin numbering
  // determines its sign, preserving contact order through cable twists.
  let width = vec3.create()
  for (let i = 0; i < pins.length; i++) {
    for (let j = i + 1; j < pins.length; j++) {
      const candidate = project(
        vec3.fromValues(pins[j]!.x - pins[i]!.x, pins[j]!.y - pins[i]!.y, 0),
      )
      if (vec3.length(candidate) > vec3.length(width)) width = candidate
    }
  }
  if (vec3.length(width) < 1e-6) {
    const source = circuitJson.find(
      (e) => e.type === "source_component" && e.source_component_id === id,
    )
    const cad = circuitJson.find(
      (e) => e.type === "cad_component" && e.source_component_id === id,
    )
    if (
      source?.type !== "source_component" ||
      source.ftype !== "motor" ||
      cad?.type !== "cad_component"
    )
      return undefined
    // NEMA model's pin row is shaft (+Z) cross wireside (+X). Recover
    // wireside from the path and apply the same intrinsic XYZ (Rx*Ry*Rz)
    // CAD rotation as the model loader, including mounting transforms.
    const rotation = mat4.create()
    mat4.rotateX(rotation, rotation, ((cad.rotation?.x ?? 0) * Math.PI) / 180)
    mat4.rotateY(rotation, rotation, ((cad.rotation?.y ?? 0) * Math.PI) / 180)
    mat4.rotateZ(rotation, rotation, ((cad.rotation?.z ?? 0) * Math.PI) / 180)
    const shaft = vec3.transformMat4(vec3.create(), [0, 0, 1], rotation)
    vec3.cross(width, shaft, outward)
  }
  if (vec3.length(width) < 1e-6) return undefined
  vec3.normalize(width, width)
  return [width[0], width[1], width[2]]
}
