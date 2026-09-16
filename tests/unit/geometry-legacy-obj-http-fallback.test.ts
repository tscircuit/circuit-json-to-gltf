import { expect, spyOn, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { prepareBoardGeometry, type AssetFetch } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("OBJ HTTP errors retain the logged scene placeholder but reject geometry without broadening STL or network fallback", async () => {
  const circuitJson = geometryCircuit({
    model_obj_url: "memory://missing/model.obj",
  })
  const fetch: AssetFetch = async () =>
    new Response("not found", { status: 404 })
  const errorLog = spyOn(console, "error").mockImplementation(() => {})
  try {
    const scene = await convertCircuitJsonTo3D(circuitJson, {
      renderBoardTextures: false,
      fetch,
    })
    expect(scene.boxes).toHaveLength(2)
    expect(scene.boxes[1]?.mesh).toBeUndefined()
    expect(errorLog).toHaveBeenCalledTimes(1)
    await expect(
      prepareBoardGeometry({
        circuitJson,
        pcbBoardId: "board",
        assetContext: { fetch },
      }),
    ).rejects.toThrow("Failed to prepare obj geometry")
    await expect(
      convertCircuitJsonTo3D(
        geometryCircuit({
          model_obj_url: undefined,
          model_stl_url: "memory://missing/model.stl",
        }),
        { renderBoardTextures: false, fetch },
      ),
    ).rejects.toThrow("Failed to prepare stl geometry")
    await expect(
      convertCircuitJsonTo3D(circuitJson, {
        renderBoardTextures: false,
        fetch: async () => {
          throw new Error("transport failure")
        },
      }),
    ).rejects.toThrow("Failed to prepare obj geometry")
    expect(errorLog).toHaveBeenCalledTimes(1)
  } finally {
    errorLog.mockRestore()
  }
})
