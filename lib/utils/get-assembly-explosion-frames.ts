import type { AssemblyExplosionFrame, CircuitJsonWithPcbFlex } from "../types"
import { evaluateAssemblyExplosion } from "./evaluate-assembly-explosion"

/** Named assembled and end-of-stage poses for storyboard snapshots or playback.
 * Positions and guide points remain in circuit-world XYZ, mm, right-handed +Z up.
 * Rendering uses the normal exporter frame conversion. Input is never mutated.
 */
export function getAssemblyExplosionFrames(
  assembled: CircuitJsonWithPcbFlex,
): AssemblyExplosionFrame[] {
  const full = evaluateAssemblyExplosion(assembled)
  const initial = full.stages.length
    ? evaluateAssemblyExplosion(assembled, {
        throughStageRef: full.stages[0],
        stageProgress: 0,
      })
    : full
  return [
    { name: "Assembled", circuitJson: initial.circuitJson, lines: [] },
    ...full.stages.map((name) => {
      const explosion = { throughStageRef: name, stageProgress: 1 }
      const view = evaluateAssemblyExplosion(assembled, explosion)
      return {
        name,
        explosion,
        circuitJson: view.circuitJson,
        lines: view.lines,
      }
    }),
  ]
}
