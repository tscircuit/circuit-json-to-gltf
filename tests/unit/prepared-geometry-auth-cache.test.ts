import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { asymmetricObj, geometryCircuit } from "../fixtures/geometry-circuit"

test("cached asset geometry does not cross authentication contexts", async () => {
  let requests = 0
  const server = Bun.serve({
    port: 0,
    fetch(request) {
      requests++
      return new Response(
        request.headers.get("Authorization") === "second"
          ? asymmetricObj.replace("v 5 2 3", "v 9 2 3")
          : asymmetricObj,
      )
    },
  })
  try {
    const circuitJson = geometryCircuit({
      model_obj_url: `${server.url}model.obj`,
    })
    const first = await prepareBoardGeometry({
      circuitJson,
      pcbBoardId: "board",
      assetContext: { authHeaders: { Authorization: "first" } },
    })
    const second = await prepareBoardGeometry({
      circuitJson,
      pcbBoardId: "board",
      assetContext: { authHeaders: { Authorization: "second" } },
    })
    expect(requests).toBe(2)
    expect(first.components[0]).not.toEqual(second.components[0])
    expect(JSON.stringify(second)).not.toContain("Authorization")
  } finally {
    server.stop(true)
  }
})
