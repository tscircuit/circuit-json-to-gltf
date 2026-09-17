import * as jscad from "@jscad/modeling"
import fromVectorRotation from "@jscad/modeling/src/maths/mat4/fromVectorRotation"
import type { RenderResult } from "jscad-electronics/vanilla"

type Vec3 = [number, number, number]
export type HandAxis = "x" | "y" | "z"

export const rightHandCases = [
  { axis: "x", name: "right-hand-x90", index: "+Y", middle: "+Z" },
  { axis: "y", name: "right-hand-y90", index: "+Z", middle: "+X" },
  { axis: "z", name: "right-hand-z90", index: "+X", middle: "+Y" },
] as const

export const handColors = {
  skin: "#e4ad80",
  crease: "#b87850",
  thumb: "#edac16",
  index: "#168dc4",
  middle: "#b847ad",
}

/**
 * Native generator frame: right-handed XYZ, mm (the same as ordinary SOIC
 * geometry). Palm faces +Y, wrist runs -X, thumb is on the +Z side.
 * Index points +X; middle bends out of the palm toward +Y; thumb points +Z.
 * These are distal centerline endpoints, not positions inferred from a render.
 */
export const handFingerSegments = {
  thumb: { start: [-2.4, 0, 2.4], end: [-2.4, 0, 4.5] },
  index: { start: [2.4, 0, 1], end: [4.8, 0, 1] },
  middle: { start: [0.55, 1.6, -0.25], end: [0.55, 4, -0.25] },
} satisfies Record<string, { start: Vec3; end: Vec3 }>

/** Proper cyclic reorientation, never a reflection or occurrence rotation. */
export function orientHandPoint([x, y, z]: Vec3, axis: HandAxis): Vec3 {
  if (axis === "x") return [z, x, y]
  if (axis === "y") return [y, z, x]
  return [x, y, z]
}

export function makeRightHandModel(
  axis: HandAxis,
  modeling: typeof jscad = jscad,
): RenderResult {
  const { primitives, transforms, maths, booleans } = modeling
  const geometries: RenderResult["geometries"] = []
  const add = (
    geom: ReturnType<typeof primitives.sphere>,
    color = handColors.skin,
  ) => {
    // Construct one hand; the cyclic basis columns carry it to each axis.
    const x = orientHandPoint([1, 0, 0], axis)
    const y = orientHandPoint([0, 1, 0], axis)
    const z = orientHandPoint([0, 0, 1], axis)
    geometries.push({
      geom: transforms.transform([...x, 0, ...y, 0, ...z, 0, 0, 0, 0, 1], geom),
      color,
    })
  }
  const capsule = (start: Vec3, end: Vec3, radius: number, color?: string) => {
    const delta = maths.vec3.subtract(maths.vec3.create(), end, start)
    const center = maths.vec3.scale(
      maths.vec3.create(),
      maths.vec3.add(maths.vec3.create(), start, end),
      0.5,
    )
    const cylinder = transforms.translate(
      center,
      transforms.transform(
        fromVectorRotation(maths.mat4.create(), [0, 0, 1], delta),
        primitives.cylinder({
          radius,
          height: maths.vec3.length(delta),
          segments: 20,
        }),
      ),
    )
    add(
      booleans.union(
        cylinder,
        primitives.sphere({ center: start, radius, segments: 20 }),
        primitives.sphere({ center: end, radius, segments: 20 }),
      ),
      color,
    )
  }
  add(
    primitives.roundedCuboid({
      center: [-2, 0, -0.5],
      size: [4.2, 1.25, 4.3],
      roundRadius: 0.55,
      segments: 24,
    }),
  )
  add(
    primitives.roundedCuboid({
      center: [-4.9, 0, -0.6],
      size: [2.6, 1.1, 2.5],
      roundRadius: 0.48,
      segments: 24,
    }),
  )
  // Thumb web and three extended fingers, with colored distal phalanges.
  capsule([-2.5, 0, 1], [-2.4, 0, 2.4], 0.65)
  capsule([0, 0, 1], [2.4, 0, 1], 0.49)
  capsule([0, 0, -0.25], [0.55, 0.65, -0.25], 0.52)
  capsule([0.55, 0.65, -0.25], [0.55, 1.6, -0.25], 0.49)
  for (const finger of ["thumb", "index", "middle"] as const) {
    const { start, end } = handFingerSegments[finger]
    capsule(start, end, finger === "thumb" ? 0.55 : 0.45, handColors[finger])
  }
  // Ring and pinky each have a knuckle and two bends back into the palm.
  for (const { points, radius } of [
    {
      points: [
        [0, 0, -1.4],
        [0.95, 0.35, -1.4],
        [0.95, 1.35, -1.4],
        [-0.4, 1.55, -1.4],
        [-1.15, 0.85, -1.4],
      ],
      radius: 0.43,
    },
    {
      points: [
        [-0.45, 0, -2.45],
        [0.35, 0.3, -2.45],
        [0.35, 1.2, -2.45],
        [-0.65, 1.4, -2.45],
        [-1.3, 0.8, -2.45],
      ],
      radius: 0.36,
    },
  ] satisfies { points: Vec3[]; radius: number }[]) {
    for (let i = 1; i < points.length; i++) {
      capsule(points[i - 1]!, points[i]!, radius)
    }
    // Small nails on the curled fingertips make the two folded digits legible.
    add(
      primitives.ellipsoid({
        center: points.at(-1)!,
        radius: [0.26, radius + 0.035, 0.25],
        segments: 16,
      }),
      "#f8d9be",
    )
  }
  // Two palm creases, on the palm surface rather than through the solid.
  capsule([-2.7, 0.635, -1.9], [-1.4, 0.635, -0.4], 0.045, handColors.crease)
  capsule([-1.4, 0.635, -0.4], [-1.1, 0.635, 0.9], 0.045, handColors.crease)
  return { geometries }
}
