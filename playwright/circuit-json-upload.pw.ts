import { expect, test } from "@playwright/test"

const board = [
  {
    type: "pcb_board",
    pcb_board_id: "uploaded-board",
    center: { x: 0, y: 0 },
    width: 12,
    height: 8,
    thickness: 1.6,
  },
]

test.beforeEach(async ({ page }) => {
  const fixtureId = encodeURIComponent(
    JSON.stringify({
      path: "CircuitToGltfDemo.fixture.tsx",
      name: "Default Circuit",
    }),
  )
  await page.goto(`/renderer.html?fixtureId=${fixtureId}&locked=true`)
  await expect(
    page.getByRole("button", { name: "Convert to GLTF" }),
  ).toBeEnabled()
})

test("drops a large JSON file without rendering its contents and converts both formats", async ({
  page,
}) => {
  // Large valid input with a distinctive marker that must never enter the editor.
  const json = JSON.stringify([
    { ...board[0], uploadMarker: "x".repeat(5 * 1024 * 1024) },
  ])
  const transfer = await page.evaluateHandle((contents) => {
    const data = new DataTransfer()
    data.items.add(
      new File([contents], "large-circuit.json", { type: "application/json" }),
    )
    return data
  }, json)
  await page
    .getByRole("heading", { name: "3D Preview" })
    .dispatchEvent("drop", { dataTransfer: transfer })
  await transfer.dispose()
  await expect(
    page.getByRole("status", { name: "Selected circuit file" }),
  ).toContainText("large-circuit.json")
  await expect(page.getByRole("textbox")).toHaveCount(0)
  await expect(page.getByRole("link", { name: /Download/ })).toHaveCount(0)

  for (const format of ["gltf", "glb"]) {
    await page.getByRole("combobox").selectOption(format)
    await page.getByRole("button", { name: "Convert to GLTF" }).click()
    await expect(
      page.getByRole("button", { name: "Convert to GLTF" }),
    ).toBeEnabled()
    const download = page.getByRole("link", {
      name: `Download ${format.toUpperCase()}`,
    })
    await expect(download).toBeVisible()
    const href = await download.getAttribute("href")
    const header = await page.evaluate(async (url) => {
      const buffer = await (await fetch(url!)).arrayBuffer()
      const text = new TextDecoder().decode(buffer)
      return text.startsWith("glTF")
        ? text.slice(0, 4)
        : JSON.parse(text).asset.version
    }, href)
    expect(header).toBe(format === "glb" ? "glTF" : "2.0")
    await expect(page.getByRole("alert")).toHaveCount(0)
    await expect(page.getByRole("textbox")).toHaveCount(0)
  }
  await page.getByRole("button", { name: "Use text input" }).click()
  await expect(page.getByRole("textbox")).not.toHaveValue(/uploadMarker/)
  await page.getByRole("textbox").fill(JSON.stringify(board))
  await page.getByRole("button", { name: "Convert to GLTF" }).click()
  await expect(page.getByRole("link", { name: "Download GLB" })).toBeVisible()
})

test("file picker supports replacement and recovery from invalid input", async ({
  page,
}) => {
  const input = page.locator('input[type="file"]')
  for (const contents of ["not json", "{}"]) {
    await input.setInputFiles({
      name: "circuit.json",
      mimeType: "application/json",
      buffer: Buffer.from(contents),
    })
    await page.getByRole("button", { name: "Convert to GLTF" }).click()
    await expect(page.getByRole("alert")).toBeVisible()
  }
  await input.setInputFiles({
    name: "circuit.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(board)),
  })
  await page.getByRole("button", { name: "Convert to GLTF" }).click()
  await expect(page.getByRole("link", { name: "Download GLTF" })).toBeVisible()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expect(page.getByRole("textbox")).toHaveCount(0)

  await input.setInputFiles({
    name: "wrong.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("wrong"),
  })
  await expect(page.getByRole("alert")).toContainText(
    "Choose a single .json file",
  )
  await expect(
    page.getByRole("status", { name: "Selected circuit file" }),
  ).toContainText("circuit.json")
})
