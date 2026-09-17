import * as jscad from "@jscad/modeling"
import fromVectorRotation from "@jscad/modeling/src/maths/mat4/fromVectorRotation"
import type { RenderResult } from "jscad-electronics/vanilla"

type Vec3 = [number, number, number]
export type HandAxis = "x" | "y" | "z"

export const rightHandCases = [
  { axis: "x", name: "right-hand-x90" },
  { axis: "y", name: "right-hand-y90" },
  { axis: "z", name: "right-hand-z90" },
] as const

export const handColors = {
  skin: "#dfa77e",
  palm: "#dba079",
  wrist: "#d39c77",
  thumb: "#eabd95",
  cap: "#f5cfb0",
  marker: "#147da5",
  arrow: "#394957",
}

/**
 * Native right-handed XYZ, mm. Thumb points +Z on the rotation axis.
 * The wrist extends along -X, perpendicular to the thumb. Short fingers
 * leave the palm along +X, bend toward +Y, then return along -X.
 */
export const handThumbSegment = {
  start: [0, 0, 2.4],
  end: [0, 0, 4.5],
} satisfies { start: Vec3; end: Vec3 }
export const handPalm = {
  center: [-1.3, -0.9, -0.55],
  size: [2.8, 1.1, 4.4],
} satisfies { center: Vec3; size: Vec3 }
export const handMarkerCenter: Vec3 = [-4.1, -0.9, -0.55]

export const gripFingerPaths = [
  { name: "index", reach: 1.2, z: 1.15, thickness: 0.47 },
  { name: "middle", reach: 1.4, z: 0, thickness: 0.49 },
  { name: "ring", reach: 1.3, z: -1.15, thickness: 0.44 },
  { name: "pinky", reach: 1, z: -2.15, thickness: 0.36 },
].map((finger) => ({
  ...finger,
  points: [
    [0, -0.9, finger.z],
    [finger.reach, -0.9, finger.z],
    [finger.reach, 0.75, finger.z],
    [0.25, 0.75, finger.z],
  ] satisfies Vec3[],
}))

export const gripArrowPath = Array.from({ length: 25 }, (_, i): Vec3 => {
  const angle = ((-35 + (180 * i) / 24) * Math.PI) / 180
  return [3.25 * Math.cos(angle), 3.25 * Math.sin(angle), 0.6]
})

/** Proper cyclic reorientation, never a reflection or occurrence rotation. */
export function orientHandPoint([x, y, z]: Vec3, axis: HandAxis): Vec3 {
  if (axis === "x") return [z, x, y]
  if (axis === "y") return [y, z, x]
  return [x, y, z]
}

function orientGeometry(
  geom: ReturnType<typeof jscad.primitives.sphere>,
  axis: HandAxis,
) {
  const x = orientHandPoint([1, 0, 0], axis)
  const y = orientHandPoint([0, 1, 0], axis)
  const z = orientHandPoint([0, 0, 1], axis)
  return jscad.transforms.transform(
    [...x, 0, ...y, 0, ...z, 0, 0, 0, 0, 1],
    geom,
  )
}

function gripCapsule(start: Vec3, end: Vec3, radius: number) {
  const { maths, primitives, transforms, booleans } = jscad
  const delta = maths.vec3.subtract(maths.vec3.create(), end, start)
  const center = maths.vec3.scale(
    maths.vec3.create(),
    maths.vec3.add(maths.vec3.create(), start, end),
    0.5,
  )
  return booleans.union(
    transforms.translate(
      center,
      transforms.transform(
        fromVectorRotation(maths.mat4.create(), [0, 0, 1], delta),
        primitives.cylinder({
          radius,
          height: maths.vec3.length(delta),
          segments: 20,
        }),
      ),
    ),
    primitives.sphere({ center: start, radius, segments: 20 }),
    primitives.sphere({ center: end, radius, segments: 20 }),
  )
}

export function makeRightHandModel(axis: HandAxis): RenderResult {
  const { primitives } = jscad
  const geometries: RenderResult["geometries"] = []
  const add = (
    geom: ReturnType<typeof primitives.sphere>,
    color = handColors.skin,
  ) => geometries.push({ geom: orientGeometry(geom, axis), color })
  add(
    primitives.roundedCuboid({
      ...handPalm,
      roundRadius: 0.5,
      segments: 24,
    }),
    handColors.palm,
  )
  add(
    primitives.roundedCuboid({
      center: handMarkerCenter,
      size: [3, 1.3, 2.4],
      roundRadius: 0.5,
      segments: 24,
    }),
    handColors.wrist,
  )
  add(
    primitives.roundedCuboid({
      center: handMarkerCenter,
      size: [0.42, 1.45, 2.55],
      roundRadius: 0.18,
      segments: 24,
    }),
    handColors.marker,
  )
  add(gripCapsule([0, -1, 1.1], [0, 0, 1.9], 0.65))
  add(gripCapsule([0, 0, 1.9], handThumbSegment.start, 0.57))
  add(
    gripCapsule(handThumbSegment.start, handThumbSegment.end, 0.55),
    handColors.thumb,
  )
  add(
    primitives.ellipsoid({
      center: [0, 0.535, 4],
      radius: [0.27, 0.08, 0.36],
      segments: 20,
    }),
    handColors.cap,
  )
  for (const [fingerIndex, finger] of gripFingerPaths.entries()) {
    for (let i = 1; i < finger.points.length; i++) {
      add(
        gripCapsule(finger.points[i - 1]!, finger.points[i]!, finger.thickness),
      )
    }
    // Neutral knuckle caps with 1/2/3/4 small pips identify the four curled
    // fingers without reintroducing the three-colored-vector mnemonic.
    add(
      primitives.ellipsoid({
        center: [finger.reach, 0.75 + finger.thickness - 0.03, finger.z],
        radius: [0.36, 0.09, 0.24],
        segments: 20,
      }),
      handColors.cap,
    )
    for (let pip = 0; pip <= fingerIndex; pip++) {
      add(
        primitives.sphere({
          center: [
            finger.reach + (pip - fingerIndex / 2) * 0.15,
            0.75 + finger.thickness + 0.065,
            finger.z,
          ],
          radius: 0.045,
          segments: 12,
        }),
        "#8d5c3e",
      )
    }
  }
  return { geometries }
}

/** Stationary positive-curl reference, not part of the CAD occurrence. */
export function makeGripReferenceArrow(axis: HandAxis): RenderResult {
  const { primitives, transforms, maths, booleans } = jscad
  const points = gripArrowPath
  const pieces = points
    .slice(1)
    .map((point, i) => gripCapsule(points[i]!, point, 0.07))
  const tip = points.at(-1)!
  const tangent: Vec3 = [-tip[1], tip[0], 0]
  const unit = maths.vec3.normalize(maths.vec3.create(), tangent)
  const center = maths.vec3.add(
    maths.vec3.create(),
    tip,
    maths.vec3.scale(maths.vec3.create(), unit, 0.33),
  )
  pieces.push(
    transforms.translate(
      center,
      transforms.transform(
        fromVectorRotation(maths.mat4.create(), [0, 0, 1], tangent),
        primitives.cylinderElliptic({
          height: 0.8,
          startRadius: [0.3, 0.3],
          endRadius: [0, 0],
          segments: 20,
        }),
      ),
    ),
  )
  return {
    geometries: [
      {
        geom: orientGeometry(booleans.union(...pieces), axis),
        color: handColors.arrow,
      },
    ],
  }
}
