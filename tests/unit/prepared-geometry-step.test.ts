import { expect, test } from "bun:test"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("STEP is initialized only when selected and runs in Node and Bun", async () => {
  const bytes = await Bun.file("./tests/assets/TO-92_Inline.step").arrayBuffer()
  const circuitJson = geometryCircuit({
    model_obj_url: undefined,
    model_step_url: `data:application/step;base64,${Buffer.from(bytes).toString("base64")}`,
  })
  for (const runtime of ["node", "bun"]) {
    const result = Bun.spawnSync([
      runtime,
      "--input-type=module",
      "-e",
      `
      const {prepareBoardGeometry} = await import("circuit-json-to-gltf/geometry");
      const result = await prepareBoardGeometry({circuitJson:${JSON.stringify(circuitJson)},pcbBoardId:"board"});
      console.log(JSON.stringify({status:result.components[0].status,triangles:result.components[0].mesh.triangles.length}));
    `,
    ])
    expect(result.exitCode).toBe(0)
    const prepared = JSON.parse(result.stdout.toString())
    expect(prepared.status).toBe("available")
    expect(prepared.triangles).toBeGreaterThan(0)
  }
}, 30_000)
