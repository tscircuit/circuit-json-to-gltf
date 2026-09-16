import { expect, test } from "bun:test"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("built geometry subpath runs in Node ESM and Bun without DOM or import-time asset access", () => {
  const build = Bun.spawnSync(["bun", "run", "build"])
  expect(build.exitCode).toBe(0)
  for (const runtime of ["node", "bun"]) {
    const script = `
      globalThis.fetch = () => { throw new Error("Unexpected import-time fetch") };
      const {prepareBoardGeometry, resolveGeometryBoardId} = await import("circuit-json-to-gltf/geometry");
      if (typeof resolveGeometryBoardId !== "function") throw new Error("Missing public board ownership export");
      const result = await prepareBoardGeometry({circuitJson:${JSON.stringify(geometryCircuit({ model_obj_url: undefined, model_jscad: { type: "cuboid", size: [2, 3, 4] } }))},pcbBoardId:"board"});
      const owner = resolveGeometryBoardId([{type:"pcb_board",pcb_board_id:"board",subcircuit_id:"board-sub"}],{subcircuit_id:"board-sub"});
      console.log(JSON.stringify({status:result.board.status,triangles:result.components[0].mesh.triangles.length,owner}));
    `
    const result = Bun.spawnSync([runtime, "--input-type=module", "-e", script])
    expect(result.exitCode).toBe(0)
    expect(JSON.parse(result.stdout.toString())).toEqual({
      status: "available",
      triangles: 12,
      owner: "board",
    })
  }
})
