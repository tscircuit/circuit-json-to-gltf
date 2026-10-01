declare module "occt-import-js" {
  export interface OcctResult {
    success: boolean
    meshes: {
      attributes: {
        position: { array: number[] }
        normal?: { array: number[] }
      }
      index: { array: number[] }
      color?: [number, number, number]
      brep_faces?: {
        first: number
        last: number
        color: [number, number, number] | null
      }[]
    }[]
  }
  export interface OcctModule {
    ReadStepFile(data: Uint8Array, options: { linearUnit: string }): OcctResult
  }
  export default function initialize(options?: {
    locateFile?: (path: string) => string
  }): Promise<OcctModule>
}
