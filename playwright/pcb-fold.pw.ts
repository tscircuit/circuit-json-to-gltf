import { expect, test } from "@playwright/test"

test("three-disc capsule switches between flat and folded GLBs", async ({
  page,
}) => {
  const fixtureId = encodeURIComponent(
    JSON.stringify({
      path: "CircuitToGltfDemo.fixture.tsx",
      name: "Three-disc capsule flex",
    }),
  )
  await page.goto(`/renderer.html?fixtureId=${fixtureId}&locked=true`)
  await expect(page.getByRole("link", { name: "Download GLB" })).toBeVisible()
  const originalJson = await page.getByRole("textbox").inputValue()
  for (const pose of ["folded", "flat", "folded"]) {
    await page.getByRole("combobox", { name: "PCB pose" }).selectOption(pose)
    const previous = await page
      .getByRole("link", { name: "Download GLB" })
      .getAttribute("href")
    await page.getByRole("button", { name: "Convert to GLTF" }).click()
    await expect(
      page.getByRole("link", { name: "Download GLB" }),
    ).not.toHaveAttribute("href", previous!)
    await expect
      .poll(() => page.locator("model-viewer").evaluate((el: any) => el.loaded))
      .toBe(true)
    await expect
      .poll(async () => {
        const dimensions = await page
          .locator("model-viewer")
          .evaluate((el: any) => el.getDimensions())
        return pose === "folded"
          ? dimensions.x < 24 && dimensions.y > 12
          : dimensions.x > 55 && dimensions.y < 3
      })
      .toBe(true)
    await expect(page.getByRole("alert")).toHaveCount(0)
    await expect(page.getByRole("textbox")).toHaveValue(originalJson)
  }
})
