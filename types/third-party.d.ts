declare module "draco3dgltf" {
  const value: {
    default?: {
      createDecoderModule?: () => Promise<unknown>
    }
    createDecoderModule?: () => Promise<unknown>
  }
  export default value
}

declare module "meshoptimizer/meshopt_decoder.module" {
  export interface MeshoptDecoderType {
    ready: Promise<void>
  }

  export const MeshoptDecoder: MeshoptDecoderType
}
