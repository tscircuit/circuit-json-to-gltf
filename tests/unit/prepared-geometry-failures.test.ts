import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("unknown models are unavailable and asset errors cannot masquerade as measured geometry", async () => {
  const unknown = await prepareBoardGeometry({
    circuitJson: geometryCircuit({ model_obj_url: undefined }),
    pcbBoardId: "board",
  })
  expect(unknown.components[0]?.status).toBe("unavailable")
  expect(unknown.components[0]).not.toHaveProperty("mesh")
  const server = Bun.serve({
    port: 0,
    fetch: () => new Response("denied", { status: 403 }),
  })
  try {
    await expect(
      prepareBoardGeometry({
        circuitJson: geometryCircuit({
          model_obj_url: `${server.url}missing.obj`,
        }),
        pcbBoardId: "board",
      }),
    ).rejects.toThrow("Failed to prepare obj geometry for CAD cad")
  } finally {
    server.stop(true)
  }
})
