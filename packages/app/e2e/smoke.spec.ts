import { expect, test } from '@playwright/test';

// The regression floor: load → edit → preview + URL react → export works.
test('shape a palette end to end', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();

  const wheel = page.locator('.surface-editor--wheel');
  await expect(wheel).toBeVisible();
  const box = (await wheel.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = box.width / 2 - 18;

  // Bake a line so point positions are known, then drag its start point.
  await page.locator('.shape-row').first().getByRole('button', { name: 'Line', exact: true }).click();

  const barPixels = () =>
    page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('.palette-bar__canvas')!;
      return canvas.getContext('2d')!.getImageData(0, 0, 60, 10).data.join(',');
    });
  const before = await barPixels();

  const p0 = [cx - 0.7 * r, cy + 0.45 * r];
  await page.mouse.move(p0[0]!, p0[1]!);
  await page.mouse.down();
  await page.mouse.move(p0[0]! + 60, p0[1]! - 80, { steps: 8 });
  await page.mouse.up();

  // Preview bar repainted; plain editing never touches the URL.
  await expect.poll(barPixels).not.toBe(before);
  await page.waitForTimeout(400);
  expect(page.url()).not.toContain('#p=');

  // Undo restores and keeps working.
  await page.keyboard.press('ControlOrMeta+z');
  const undone = await page.evaluate(() => window.__cc!.getState().past.length);
  expect(undone).toBe(1); // line-bake entry remains

  // Copy hex export.
  await page.getByRole('tab', { name: 'Export' }).click();
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toMatch(/^#[0-9a-f]{6}\n/);

  // Share writes the URL and the link round-trips into a fresh page.
  await page.getByRole('button', { name: 'Share' }).click();
  const url = page.url();
  expect(url).toContain('#p=');
  const page2 = await page.context().newPage();
  await page2.goto(url);
  const pts = await page2.evaluate(() => window.__cc!.getState().doc.wheel.points.length);
  expect(pts).toBe(2);
  await page2.close();
});
