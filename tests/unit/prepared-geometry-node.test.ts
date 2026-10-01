import { expect, test } from "bun:test"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("built geometry subpath runs in Node ESM and Bun without eager STEP initialization", async () => {
  const build = Bun.spawnSync(["bun", "run", "build"])
  expect(build.exitCode).toBe(0)
  for (const runtime of ["node", "bun"]) {
    const script = `
      globalThis.fetch = () => { throw new Error("Unexpected import-time fetch") };
      const {prepareBoardGeometry, resolveGeometryBoardId} = await import("circuit-json-to-gltf/geometry");
      if (typeof resolveGeometryBoardId !== "function") throw new Error("Missing public board ownership export");
      const {createRequire} = await import("node:module");
      const packageJson = createRequire(import.meta.url)("circuit-json-to-gltf/package.json");
      if (packageJson.name !== "circuit-json-to-gltf") throw new Error("Package metadata subpath unavailable");
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

  const bytes = await Bun.file("./tests/assets/TO-92_Inline.step").arrayBuffer()
  const stepCircuit = geometryCircuit({
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
        const result = await prepareBoardGeometry({circuitJson:${JSON.stringify(stepCircuit)},pcbBoardId:"board"});
        console.log(JSON.stringify({status:result.components[0].status,triangles:result.components[0].mesh.triangles.length}));
      `,
    ])
    expect(result.exitCode).toBe(0)
    const prepared = JSON.parse(result.stdout.toString())
    expect(prepared.status).toBe("available")
    expect(prepared.triangles).toBeGreaterThan(0)
  }
}, 30_000)
