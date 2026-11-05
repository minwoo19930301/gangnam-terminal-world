// Map-only integration and visual checks. No production files are changed.
// node tests/mapshot.mjs [--out shots/map] [--places _demo]
// _demo is the only complete place module in the initial repository checkout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? fallback : args[index + 1];
};
const out = arg('out', 'shots/map');
fs.mkdirSync(out, { recursive: true });
const server = await serve(0);
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
const warnings = [];
try {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => errors.push(error.stack || error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning') warnings.push(message.text());
  });
  const params = new URLSearchParams({ shot: '1', city: '1', traffic: '0', places: arg('places', '_demo'), pos: '6,0,-125', yaw: '200', fly: '1' });
  await page.goto(`${base}/index.html?${params}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__world?.ready || window.__world?.errors.some(error => error.startsWith('boot')), null, { timeout: 240000 });
  const bootErrors = await page.evaluate(() => window.__world.errors);
  assert.deepEqual(bootErrors, [], 'The selected world fixture must boot without errors');
  await page.evaluate(async () => { await document.fonts.ready; document.body.classList.remove('shot'); });
  const settle = () => page.waitForTimeout(700);
  const capture = async name => {
    await settle();
    const file = path.join(out, `${name}.png`);
    await page.screenshot({ path: file });
    console.log('shot', file);
  };
  const setPosition = async (x, y, z, yaw = 0) => {
    await page.evaluate(({ x, y, z, yaw }) => {
      const player = window.__world.player;
      Object.assign(player, { x, y, z, yaw, vy: 0, fly: true });
    }, { x, y, z, yaw });
    await settle();
  };
  const setOpen = async desired => {
    await page.evaluate(desired => { if (window.__world.map.isOpen() !== desired) window.__world.map.toggle(); }, desired);
    await settle();
  };
  const position = () => page.evaluate(() => {
    const { x, y, z } = window.__world.player;
    return { x, y, z };
  });
  const assertSupported = async () => {
    const support = await page.evaluate(() => {
      const { player, phys } = window.__world;
      const floor = phys.support(player.x, player.z, player.y + 0.05);
      return { finite: Number.isFinite(floor.y), delta: Math.abs(floor.y - player.y), hasSurface: Boolean(floor.s) };
    });
    assert(support.finite && support.hasSurface && support.delta < 0.1, `Teleport must land on a walkable floor: ${JSON.stringify(support)}`);
  };

  await capture('minimap');
  const mini = await page.locator('#minimap').boundingBox();
  assert.equal(Math.round(mini.width), 200);
  await setOpen(true); // Explicitly exercises window.__world.map.toggle().
  await capture('full');
  const full = page.locator('#map-full');
  const canvas = page.locator('#map-canvas');
  await full.getByRole('button', { name: '확대', exact: true }).click({ clickCount: 2, delay: 120 });
  await capture('zoomed');

  // Drag/inertia must change the viewport, without teleporting the player.
  const beforePan = await canvas.evaluate(node => node.toDataURL());
  const beforePosition = await position();
  const bounds = await canvas.boundingBox();
  const px = bounds.x + bounds.width * 0.72;
  const py = bounds.y + bounds.height * 0.55;
  await page.mouse.move(px, py);
  await page.mouse.down();
  await page.mouse.move(px + 105, py + 70, { steps: 8 });
  await page.mouse.up();
  await settle();
  assert.notEqual(await canvas.evaluate(node => node.toDataURL()), beforePan, 'Dragging should move the map');
  assert.deepEqual(await position(), beforePosition, 'Dragging should not teleport');

  // Korean POI search selects a destination first; movement is a separate action.
  await page.locator('#map-search').fill('메가박스');
  const result = page.locator('#map-results button').first();
  await result.waitFor();
  await result.click();
  await settle();
  assert.deepEqual(await position(), beforePosition, 'Selecting a search result should not teleport');
  await full.getByRole('button', { name: '여기로 이동', exact: true }).click();
  await settle();
  await assertSupported();

  // Existing main.js owns M. The map owns Escape, including from the search field.
  await setOpen(false);
  await page.locator('body').click({ position: { x: 500, y: 450 } });
  await page.keyboard.press('m');
  assert.equal(await page.evaluate(() => window.__world.map.isOpen()), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => window.__world.map.isOpen()), false);
  await setOpen(true);
  await page.locator('#map-search').fill('');
  await page.locator('#map-search').press('m');
  assert.equal(await page.evaluate(() => window.__world.map.isOpen()), true, 'Typing M in search must not toggle the map');
  await page.locator('#map-search').press('Escape');
  assert.equal(await page.evaluate(() => window.__world.map.isOpen()), false);

  // Real demo geometry supplies a multi-floor building and real walkable surfaces.
  await setPosition(405, 5, 155);
  await capture('minimap-floor');
  await setOpen(true);
  await full.getByRole('button', { name: '층별', exact: true }).click();
  await full.getByRole('button', { name: '현재 위치', exact: true }).click();
  await settle();
  const floorSelector = page.locator('#map-floor-select');
  const floorOptions = await floorSelector.locator('option').evaluateAll(nodes => nodes.map(node => ({ text: node.textContent, value: node.value })));
  const thirdFloor = floorOptions.find(option => option.text.includes('3F'));
  assert(thirdFloor, `Demo building should expose 3F: ${JSON.stringify(floorOptions)}`);
  await floorSelector.selectOption(thirdFloor.value);
  await capture('floor');

  // Exact requested underground position, including graceful absent-floor data.
  await setOpen(false);
  await setPosition(0, -6, -120);
  await capture('minimap-underground');
  await setOpen(true);
  await full.getByRole('button', { name: '지하 B1', exact: true }).click();
  await capture('underground');

  // Surface double-click uses physics support, which may be a roof at that point.
  await full.getByRole('button', { name: '지상', exact: true }).click();
  await canvas.dblclick({ position: { x: bounds.width * 0.7, y: bounds.height * 0.62 }, delay: 100 });
  await settle();
  await assertSupported();

  await setPosition(6, 0, -125, 200 * Math.PI / 180);
  await setOpen(true);
  await full.getByRole('button', { name: '현재 위치', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await capture('mobile');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Mobile map must not overflow horizontally');
  await setOpen(false);
  await capture('mobile-minimap');
  assert.equal(Math.round((await page.locator('#minimap').boundingBox()).width), 120);

  // Isolate canvas map cost from software-rendered WebGL scene frame time.
  await page.setViewportSize({ width: 1440, height: 900 });
  await setOpen(true);
  const performanceResult = await page.evaluate(() => {
    const { map, player } = window.__world;
    const oldX = player.x;
    const samples = [];
    for (let i = 0; i < 120; i++) {
      player.x += 0.1;
      const start = performance.now();
      map.update(1 / 60);
      samples.push(performance.now() - start);
    }
    player.x = oldX;
    samples.sort((a, b) => a - b);
    return { meanMs: samples.reduce((a, b) => a + b, 0) / samples.length, p95Ms: samples[Math.floor(samples.length * 0.95)] };
  });
  console.log('Map update only (not total WebGL fps):', JSON.stringify(performanceResult));
  assert(performanceResult.p95Ms < 20, 'Map update should fit a 50 fps budget');
  if (warnings.length) console.log('browser warnings:', [...new Set(warnings)].join('\n'));
  assert.deepEqual(errors, [], 'No browser console errors or uncaught exceptions');
  console.log('OK map: pan, zoom, Korean search, teleport support, keyboard, floors, mobile, console and update budget');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
