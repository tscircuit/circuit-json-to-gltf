declare module "draco3dgltf" {
  interface DracoModule {
    createDecoderModule: () => Promise<unknown>
    createEncoderModule: () => Promise<unknown>
  }

  const draco3d: DracoModule
  export default draco3d
}
