import { expect, test } from "bun:test"
import { prepareBoardGeometry, type AssetFetch } from "../../lib/geometry"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { asymmetricObj, geometryCircuit } from "../fixtures/geometry-circuit"

test("scoped platform fetch serves geometry and export without crossing access-context caches", async () => {
  const circuitJson = geometryCircuit({
    model_obj_url: "memory://project/model.obj",
  })
  const requests: string[] = []
  const firstFetch: AssetFetch = async (url, init) => {
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    requests.push(`first:${url}`)
    return new Response(asymmetricObj)
  }
  const secondFetch: AssetFetch = async (url) => {
    requests.push(`second:${url}`)
    return new Response(asymmetricObj.replace("v 5 2 3", "v 9 2 3"))
  }
  const first = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
    assetContext: { fetch: firstFetch },
  })
  const second = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
    assetContext: { fetch: secondFetch },
  })
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
    fetch: firstFetch,
  })
  expect(requests).toEqual([
    "first:memory://project/model.obj",
    "second:memory://project/model.obj",
    "first:memory://project/model.obj",
  ])
  expect(first.components[0]).not.toEqual(second.components[0])
  const body = first.components[0]
  if (body?.status !== "available") throw new Error("Missing geometry")
  expect(scene.boxes[1]?.mesh).toEqual(body.mesh)
  expect(JSON.stringify(first)).not.toContain("firstFetch")
})
