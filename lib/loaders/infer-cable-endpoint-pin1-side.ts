import type { CadCable, CircuitJson } from "circuit-json"
import { mat4, vec3 } from "gl-matrix"

/** Return the direction from connector center toward pin 1 in circuit world (+Z up, mm).
 * PCB ports already include footprint rotation and layer mirroring. Using
 * their emitted positions also supports custom footprints without new fields.
 */
export function inferCableEndpointPin1Side(
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
  const pins = sourcePorts.flatMap((source) => {
    if (source.type !== "source_port") return []
    const port = circuitJson.find(
      (e) =>
        e.type === "pcb_port" && e.source_port_id === source.source_port_id,
    )
    return port?.type === "pcb_port" ? [{ port, pin: pinNumber(source) }] : []
  })
  // A width axis alone cannot distinguish reversed contact order. Derive
  // the signed side from pin 1 itself, independent of JSON record order.
  const pin1 = pins.find(({ pin }) => pin === 1)?.port
  let pin1Side = vec3.create()
  if (pin1 && pins.length > 1) {
    const center = pins.reduce(
      (sum, { port }) => ({
        x: sum.x + port.x / pins.length,
        y: sum.y + port.y / pins.length,
      }),
      { x: 0, y: 0 },
    )
    pin1Side = project(vec3.fromValues(pin1.x - center.x, pin1.y - center.y, 0))
  }
  if (vec3.length(pin1Side) < 1e-6) {
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
    // NEMA pin 1 is wireside (+X) cross shaft (+Z), local -Y. Recover
    // wireside from the path and apply the same intrinsic XYZ (Rx*Ry*Rz)
    // CAD rotation as the model loader, including mounting transforms.
    const rotation = mat4.create()
    mat4.rotateX(rotation, rotation, ((cad.rotation?.x ?? 0) * Math.PI) / 180)
    mat4.rotateY(rotation, rotation, ((cad.rotation?.y ?? 0) * Math.PI) / 180)
    mat4.rotateZ(rotation, rotation, ((cad.rotation?.z ?? 0) * Math.PI) / 180)
    const shaft = vec3.transformMat4(vec3.create(), [0, 0, 1], rotation)
    vec3.cross(pin1Side, outward, shaft)
  }
  if (vec3.length(pin1Side) < 1e-6) return undefined
  vec3.normalize(pin1Side, pin1Side)
  return [pin1Side[0], pin1Side[1], pin1Side[2]]
}
