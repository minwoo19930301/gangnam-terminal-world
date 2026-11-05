// Map-only integration and visual checks. No production files are changed.
// node tests/mapshot.mjs [--out shots/map] [--places _demo]
// Native browser fallback: node tests/mapshot.mjs --standalone --selftest
// Open emitted file with ?shot=1&places=_demo&city=1&traffic=0&pos=6,0,-125&fly=1
// Add &mobile=1 for a real 390 x 844 iframe viewport.
// Synthetic underground: --standalone --fixture-b1 --html /private/tmp/gangnam-map-b1.html
// _demo is the only complete place module in the initial repository checkout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index < 0 ? fallback : args[index + 1];
};
const out = arg('out', 'shots/map');
if (args.includes('--standalone')) {
  emitStandalone(arg('html', '/private/tmp/gangnam-map-world.html'));
  process.exit(0);
}
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
  const mini = await page.locator('.gt-mini').boundingBox();
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
  await page.locator('#map-search').fill('식당가');
  await page.locator('#map-results button').filter({ hasText: '3F' }).first().click();
  await settle();
  await full.getByRole('button', { name: '여기로 이동', exact: true }).click();
  await settle();
  await assertSupported();
  assert.equal((await position()).y, 10, 'A third-floor search destination must land on 3F, not the roof');

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
  const cdp = await page.context().newCDPSession(page);
  const beforePinch = await canvas.evaluate(node => node.toDataURL());
  const beforePinchPosition = await position();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 145, y: 420, id: 1 }, { x: 245, y: 420, id: 2 }] });
  for (let step = 1; step <= 8; step++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 145 - step * 5, y: 420, id: 1 }, { x: 245 + step * 5, y: 420, id: 2 }] });
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await settle();
  assert.notEqual(await canvas.evaluate(node => node.toDataURL()), beforePinch, 'Two-finger pinch should zoom the map');
  assert.deepEqual(await position(), beforePinchPosition, 'Touch gestures must not move the player');
  await capture('mobile-pinched');
  await full.getByRole('button', { name: '장소 목록 열기', exact: true }).click();
  assert.equal(await page.locator('#map-sidebar').isVisible(), true, 'Mobile place panel should expand');
  await capture('mobile-panel');
  await full.getByRole('button', { name: '장소 목록 닫기', exact: true }).click();
  await setOpen(false);
  await capture('mobile-minimap');
  assert.equal(Math.round((await page.locator('.gt-mini').boundingBox()).width), 120);

  // Isolate canvas map cost from software-rendered WebGL scene frame time.
  await page.setViewportSize({ width: 1440, height: 900 });
  await setOpen(true);
  await page.mouse.move(950, 450);
  await page.mouse.down();
  const performanceResult = await page.evaluate(() => {
    const { map } = window.__world;
    const canvas = document.getElementById('map-canvas');
    const samples = [];
    for (let i = 0; i < 120; i++) {
      // The real mouse down above establishes capture for pointerId=1. Each
      // move invalidates the vector base; player-only motion would test a cache.
      canvas.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 951 + i, clientY: 450 + i * 0.3 }));
      const start = performance.now();
      map.update(1 / 60);
      samples.push(performance.now() - start);
    }
    samples.sort((a, b) => a - b);
    return { meanMs: samples.reduce((a, b) => a + b, 0) / samples.length, p95Ms: samples[Math.floor(samples.length * 0.95)] };
  });
  await page.mouse.up();
  console.log('Map forced-pan vector redraw (not total WebGL fps):', JSON.stringify(performanceResult));
  assert(performanceResult.p95Ms < 20, 'Map update should fit a 50 fps budget');

  // The initial checkout has no production underground modules. Exercise the
  // exact same map module separately with real physics and explicit test zones.
  const fixture = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  fixture.on('pageerror', error => errors.push(`fixture: ${error.message}`));
  fixture.on('console', message => { if (message.type() === 'error') errors.push(`fixture: ${message.text()}`); });
  await fixture.route('**/map-fixture.html', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="css/style.css"><body><div id="app"></div></body></html>' }));
  await fixture.goto(`${base}/map-fixture.html`);
  await fixture.evaluate(async () => {
    const [{ createMap }, { createPhysics, createPlayer, pointInPoly }, osm] = await Promise.all([import('./js/map.js'), import('./js/physics.js'), fetch('./data/osm.json').then(response => response.json())]);
    const phys = createPhysics();
    const concourse = [[-210, -150], [170, -150], [170, -90], [-210, -90]];
    const shop = [[-190, -145], [-75, -145], [-75, -105], [-190, -105]];
    const zones = [
      { name: '지하층 테스트 공간', sub: '지하 연결 통로', floor: 'B1', place: 'test-b1', poly: concourse, y0: -6, y1: -1 },
      { name: '테스트 매장', sub: '층별 도형 검증', floor: 'B1', place: 'test-b1', poly: shop, y0: -6, y1: -1 },
      { name: '지하층 테스트 공간', sub: '더 깊은 층', floor: 'B2', place: 'test-b1', poly: concourse, y0: -11, y1: -6 }
    ];
    for (const zone of zones) phys.addZone(zone);
    phys.addSurface(concourse, -6); phys.addSurface(concourse, -11); phys.addCeiling(concourse, -1);
    const player = createPlayer(phys); player.teleport(0, -6, -120, 0);
    const spawns = [{ name: '지하층 테스트 출발점', group: '지도 검증용 공간', place: 'test-b1', x: 0, y: -6, z: -120, yaw: 0 }];
    const K = { _: { zonesList: zones, spawns, elevators: [], claims: new Set() }, LEVELS: { B1: -6, B2: -11 }, pointInPoly };
    const map = createMap({ K, osm, player, phys, spawns, places: [{ id: 'test-b1', name: '지도 검증용 공간' }], container: document.getElementById('app'), zoneAt: () => phys.zoneAt(player.x, player.y + 0.1, player.z) });
    window.__fixture = { map, player, phys };
    let last = performance.now();
    function frame(now) { map.update((now - last) / 1000); last = now; requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  });
  await fixture.waitForTimeout(700);
  assert.equal(await fixture.locator('#map-mini-floor').textContent(), 'B1');
  await fixture.screenshot({ path: path.join(out, 'underground-fixture-minimap.png') });
  await fixture.evaluate(() => window.__fixture.map.toggle());
  await fixture.waitForTimeout(700);
  assert.equal(await fixture.getByRole('button', { name: '지하 B1', exact: true }).getAttribute('aria-pressed'), 'true');
  await fixture.screenshot({ path: path.join(out, 'underground-fixture.png') });
  await fixture.locator('#map-search').fill('테스트 매장');
  await fixture.locator('#map-results button').first().click();
  await fixture.waitForTimeout(700);
  await fixture.getByRole('button', { name: '여기로 이동', exact: true }).click();
  assert.equal(await fixture.evaluate(() => window.__fixture.player.y), -6, 'B1 search must land below ground on real support');
  console.log('shot', path.join(out, 'underground-fixture.png'), '(synthetic B1 zones; real OSM and physics)');
  await fixture.close();
  if (warnings.length) console.log('browser warnings:', [...new Set(warnings)].join('\n'));
  assert.deepEqual(errors, [], 'No browser console errors or uncaught exceptions');
  console.log('OK map: pan, zoom, Korean search, teleport support, keyboard, floors, mobile, console and update budget');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}

// Native-browser fallback for restricted environments that cannot bind a local
// server or launch Playwright. Only the generated HTML contains rewritten imports;
// all world and map logic is copied verbatim from the current repository sources.
function emitStandalone(destination) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const names = ['js/physics.js', 'js/textures.js', 'js/kit.js', 'js/city.js', 'js/map.js', 'js/main.js'];
  for (const name of fs.readdirSync(path.join(root, 'js/places'))) if (name.endsWith('.js')) names.push(`js/places/${name}`);
  const sources = Object.fromEntries(names.map(name => [name, read(name)]));
  sources.three = read('node_modules/three/build/three.module.js');
  sources['js/main.js'] = sources['js/main.js']
    .replace("await (await fetch('data/osm.json')).json()", 'window.__standaloneOsm')
    .replace('await import(`./places/${id}.js`)', 'await window.__standaloneImportPlace(id)');
  sources['js/map.js'] = sources['js/map.js'].replace("new URL('../css/map.css', import.meta.url).href", 'window.__standaloneMapCss');
  const encoded = value => JSON.stringify(value).replace(/</g, '\\u003c');
  const loader = `
const sources = ${encoded(sources)};
window.__standaloneOsm = ${encoded(JSON.parse(read('data/osm.json')))};
window.__standaloneMapCss = URL.createObjectURL(new Blob([${encoded(read('css/map.css'))}], { type: 'text/css' }));
const urls = {};
function moduleURL(name) {
  if (urls[name]) return urls[name];
  if (!sources[name]) throw new Error('Missing fixture module: ' + name);
  const source = sources[name].replace(/(from\\s+)(['"])(\\.{1,2}\\/[^'"]+|three)\\2/g, (all, prefix, quote, specifier) => {
    const dependency = specifier === 'three' ? 'three' : new URL(specifier, 'https://fixture.invalid/' + name).pathname.slice(1);
    return prefix + quote + moduleURL(dependency) + quote;
  });
  return urls[name] = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
}
window.__standaloneImportPlace = id => import(moduleURL('js/places/' + id + '.js'));
window.__standaloneErrors = [];
addEventListener('error', event => window.__standaloneErrors.push(event.message));
addEventListener('unhandledrejection', event => window.__standaloneErrors.push(String(event.reason)));
const originalConsoleError = console.error.bind(console);
console.error = (...values) => { window.__standaloneErrors.push(values.map(value => value?.message || String(value)).join(' ')); originalConsoleError(...values); };
await import(moduleURL('js/main.js'));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
for (let i = 0; i < 480 && !window.__world?.ready && !window.__world?.errors.some(error => error.startsWith('boot')); i++) await pause(250);
document.body.classList.remove('shot');
if (!window.__world?.ready) throw new Error('World did not become ready');
const world = window.__world;
world.player.fly = true;
world.map.toggle();
window.__mapCapture = mode => {
  if (world.map.isOpen()) world.map.toggle();
  const p = world.player;
  Object.assign(p, mode === 'floor' ? { x: 405, y: 5, z: 155, yaw: 0 } : mode === 'underground' ? { x: 0, y: -6, z: -120, yaw: 0 } : { x: 6, y: 0, z: -125, yaw: 200 * Math.PI / 180 });
  p.fly = true; p.vy = 0;
  if (mode !== 'mini') world.map.toggle();
};
addEventListener('keydown', event => {
  if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.code === 'Digit1') window.__mapCapture('surface');
  if (event.code === 'Digit2') window.__mapCapture('underground');
  if (event.code === 'Digit3') window.__mapCapture('floor');
  if (event.code === 'Digit4') window.__mapCapture('mini');
  if (event.code === 'Digit0') document.getElementById('fixture-report')?.remove();
}, true);
if (${args.includes('--selftest')}) {
  const passed = [], failed = [];
  const check = (condition, name) => (condition ? passed : failed).push(name);
  const find = label => [...document.querySelectorAll('#map-full button')].find(button => button.getAttribute('aria-label') === label);
  const search = value => { const input = document.getElementById('map-search'); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
  await pause(800);
  check(world.errors.length === 0, 'world boot');
  check(world.map.isOpen(), 'toggle opens');
  find('확대').click(); await pause(150);
  check(document.getElementById('map-scale-text').textContent.length > 0, 'scale after zoom');
  const before = { x: world.player.x, y: world.player.y, z: world.player.z };
  search('메가박스'); document.querySelector('#map-results button')?.click(); await pause(600);
  check(world.player.x === before.x && world.player.z === before.z, 'search only selects');
  find('여기로 이동').click(); await pause(100);
  const support = world.phys.support(world.player.x, world.player.z, world.player.y + 0.05);
  check(Number.isFinite(support.y) && Math.abs(support.y - world.player.y) < 0.1, 'POI supported teleport');
  window.__mapCapture('floor'); await pause(200);
  const select = document.getElementById('map-floor-select');
  check([...select.options].some(option => option.value === '3F'), 'three floor options');
  search('식당가'); document.querySelector('#map-results button')?.click(); await pause(400); find('여기로 이동').click();
  check(world.player.y === 10, '3F teleport retains height');
  window.__mapCapture('surface'); await pause(150);
  const canvas = document.getElementById('map-canvas');
  const capture = canvas.setPointerCapture;
  canvas.setPointerCapture = () => {}; // Synthetic pointer events have no OS capture.
  const box = canvas.getBoundingClientRect(), startX = box.left + box.width * 0.6, startY = box.top + box.height * 0.5;
  canvas.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 91, pointerType: 'mouse', button: 0, clientX: startX, clientY: startY }));
  const timings = [];
  for (let i = 0; i < 100; i++) {
    canvas.dispatchEvent(new PointerEvent('pointermove', { pointerId: 91, pointerType: 'mouse', buttons: 1, clientX: startX + i, clientY: startY + i / 2 }));
    const t = performance.now(); world.map.update(1 / 60); timings.push(performance.now() - t);
  }
  canvas.dispatchEvent(new PointerEvent('pointerup', { pointerId: 91, pointerType: 'mouse', button: 0, clientX: startX + 100, clientY: startY + 50 }));
  timings.sort((a, b) => a - b); const p95 = timings[95], mean = timings.reduce((a, b) => a + b, 0) / timings.length;
  check(p95 < 20, 'forced redraw p95 <20ms');
  const pointer = (type, id, x, y, pointerType = 'touch') => canvas.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType, button: 0, buttons: type === 'pointerup' ? 0 : 1, clientX: x, clientY: y }));
  const pinchPlayer = { x: world.player.x, y: world.player.y, z: world.player.z };
  const beforePinch = canvas.toDataURL();
  pointer('pointerdown', 92, startX - 45, startY); pointer('pointerdown', 93, startX + 45, startY);
  pointer('pointermove', 92, startX - 85, startY); pointer('pointermove', 93, startX + 85, startY); world.map.update(1 / 60);
  pointer('pointerup', 92, startX - 85, startY); pointer('pointerup', 93, startX + 85, startY);
  check(beforePinch !== canvas.toDataURL(), 'two-pointer pinch redraws');
  check(world.player.x === pinchPlayer.x && world.player.y === pinchPlayer.y && world.player.z === pinchPlayer.z, 'pinch leaves player unchanged');
  // Observe Canvas2D's world matrix to verify wheel anchoring without exposing
  // private map state or duplicating the map's coordinate conversion logic.
  const context = canvas.getContext('2d'), originalTransform = context.setTransform;
  let matrix;
  context.setTransform = function (...values) { if (values.length === 6 && (values[4] || values[5])) matrix = values; return originalTransform.apply(this, values); };
  pointer('pointerdown', 94, startX, startY, 'mouse'); pointer('pointermove', 94, startX, startY, 'mouse'); world.map.update(0); pointer('pointerup', 94, startX, startY, 'mouse');
  const beforeWheel = matrix, dpr = canvas.width / box.width, anchorX = box.width * 0.36, anchorY = box.height * 0.64;
  const worldAnchorX = (anchorX * dpr - beforeWheel[4]) / beforeWheel[0], worldAnchorZ = (anchorY * dpr - beforeWheel[5]) / beforeWheel[3];
  canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: -90, clientX: box.left + anchorX, clientY: box.top + anchorY })); world.map.update(1 / 60);
  check(matrix[0] > beforeWheel[0], 'wheel zooms in');
  check(Math.abs((anchorX * dpr - matrix[4]) / matrix[0] - worldAnchorX) < 0.01 && Math.abs((anchorY * dpr - matrix[5]) / matrix[3] - worldAnchorZ) < 0.01, 'wheel preserves cursor anchor');
  context.setTransform = originalTransform; canvas.setPointerCapture = capture;
  const input = document.getElementById('map-search'); input.focus();
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'KeyM', key: 'm' }));
  check(world.map.isOpen(), 'typing M stays open');
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Escape', key: 'Escape' }));
  check(!world.map.isOpen(), 'Escape closes from search');
  world.map.update(0.05);
  const miniCanvas = document.getElementById('minimap'), beforeMiniZoom = miniCanvas.toDataURL();
  document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Equal', key: '=' })); world.map.update(0.05);
  check(miniCanvas.toDataURL() !== beforeMiniZoom, 'minimap equals zooms in');
  document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'Minus', key: '-' })); world.map.update(0.05);
  check(miniCanvas.toDataURL() === beforeMiniZoom, 'minimap minus restores zoom');
  const miniSize = document.querySelector('.gt-mini').getBoundingClientRect();
  check(Math.round(miniSize.width) === (innerWidth <= 640 ? 120 : 200), 'responsive minimap dimensions');
  document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, code: 'KeyM', key: 'm' }));
  document.body.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'KeyM', key: 'm' }));
  check(world.map.isOpen(), 'M opens from closed');
  if (innerWidth <= 640) {
    const sidebar = document.getElementById('map-sidebar');
    check(getComputedStyle(sidebar).display === 'none', 'mobile panel initially collapsed');
    find('장소 목록 열기').click(); check(getComputedStyle(sidebar).display !== 'none', 'mobile panel expands');
    find('장소 목록 닫기').click(); check(getComputedStyle(sidebar).display === 'none', 'mobile panel collapses');
    check(document.documentElement.scrollWidth <= innerWidth && Math.round(canvas.getBoundingClientRect().width) === innerWidth, 'mobile viewport has no overflow');
  }
  window.__mapCapture('surface'); search(''); find('선택 해제')?.click(); await pause(300);
  check(window.__standaloneErrors.length === 0, 'console clean');
  window.__mapTestReport = { passed, failed, consoleErrors: window.__standaloneErrors, meanMs: mean, p95Ms: p95 };
  document.title = 'MAP ' + (failed.length ? 'FAIL' : 'PASS') + ' ' + passed.length + ' checks, p95 ' + p95.toFixed(2) + 'ms';
  const report = document.createElement('pre'); report.id = 'fixture-report'; report.style.cssText = 'position:fixed;z-index:1000;right:12px;bottom:8px;max-width:460px;padding:10px;background:#fff;color:#164f3e;border:1px solid #b7d5c6;border-radius:8px;font:11px monospace;white-space:pre-wrap;pointer-events:none';
  report.textContent = document.title + '\\n' + (failed.length ? 'FAILED: ' + failed.join(', ') : 'Boot, search, floors, pinch, wheel anchor, keys, resize OK') + '\\nConsole errors: ' + window.__standaloneErrors.length + '\\n1 지상 · 2 지하 · 3 층별 · 4 미니맵 · 0 보고서 숨기기';
  document.body.appendChild(report);
}
`;
  const b1Loader = `
const [{ createMap }, { createPhysics, createPlayer, pointInPoly }] = await Promise.all([import(moduleURL('js/map.js')), import(moduleURL('js/physics.js'))]);
const phys = createPhysics();
const concourse = [[-210, -150], [170, -150], [170, -90], [-210, -90]];
const shop = [[-190, -145], [-75, -145], [-75, -105], [-190, -105]];
const zones = [
  { name: '지하층 테스트 공간', sub: '지하 연결 통로', floor: 'B1', place: 'test-b1', poly: concourse, y0: -6, y1: -1 },
  { name: '테스트 매장', sub: '층별 도형 검증', floor: 'B1', place: 'test-b1', poly: shop, y0: -6, y1: -1 },
  { name: '지하층 테스트 공간', sub: '더 깊은 층', floor: 'B2', place: 'test-b1', poly: concourse, y0: -11, y1: -6 }
];
for (const zone of zones) phys.addZone(zone);
phys.addSurface(concourse, -6); phys.addSurface(concourse, -11); phys.addCeiling(concourse, -1);
const player = createPlayer(phys); player.teleport(0, -6, -120, 0);
const spawns = [{ name: '지하층 테스트 출발점', group: '지도 검증용 공간', place: 'test-b1', x: 0, y: -6, z: -120, yaw: 0 }];
const elevators = [{ name: '테스트 엘리베이터', place: 'test-b1', x: 100, z: -120, floors: [{ label: 'B1', y: -6 }, { label: 'B2', y: -11 }] }];
const K = { _: { zonesList: zones, spawns, elevators, claims: new Set() }, LEVELS: { B1: -6, B2: -11 }, pointInPoly };
document.getElementById('app').replaceChildren();
const map = createMap({ K, osm: window.__standaloneOsm, player, phys, spawns, places: [{ id: 'test-b1', name: '지도 검증용 공간' }], container: document.getElementById('app'), zoneAt: () => phys.zoneAt(player.x, player.y + 0.1, player.z) });
window.__world = { ready: true, map, player, phys, K, errors: [] };
let last = performance.now(); function frame(now) { map.update((now - last) / 1000); last = now; requestAnimationFrame(frame); } requestAnimationFrame(frame);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const find = label => [...document.querySelectorAll('#map-full button')].find(button => button.getAttribute('aria-label') === label);
const query = value => { const input = document.getElementById('map-search'); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
await pause(300); map.toggle();
const passed = [], failed = [], check = (condition, name) => (condition ? passed : failed).push(name);
check(document.getElementById('map-mini-floor').textContent === 'B1', 'minimap B1 height');
check(find('지하 B1').getAttribute('aria-pressed') === 'true', 'automatic underground layer');
query('테스트 매장'); document.querySelector('#map-results button').click(); await pause(500); find('여기로 이동').click();
check(player.y === -6, 'B1 supported teleport');
map.toggle(); query('더 깊은 층'); document.querySelector('#map-results button').click(); await pause(500); find('여기로 이동').click();
check(player.y === -11, 'B2 supported teleport'); await pause(80);
check(document.getElementById('map-mini-floor').textContent === 'B2', 'minimap B2 height');
player.teleport(0, -6, -120, 0); map.toggle(); query(''); find('선택 해제')?.click(); await pause(200);
check(window.__standaloneErrors.length === 0, 'console clean');
window.__mapTestReport = { passed, failed, consoleErrors: window.__standaloneErrors };
document.title = 'MAP B1 FIXTURE ' + (failed.length ? 'FAIL' : 'PASS') + ' ' + passed.length + ' checks';
const report = document.createElement('pre'); report.id = 'fixture-report'; report.style.cssText = 'position:fixed;z-index:1000;right:12px;bottom:8px;padding:10px;background:#fff;color:#164f3e;border:1px solid #b7d5c6;border-radius:8px;font:11px monospace;white-space:pre-wrap;pointer-events:none';
report.textContent = document.title + '\\n검증용 지하층 도형 · 실제 OSM / 물리 엔진\\n1 B1 · 2 B2 · 3 미니맵 · 0 보고서 숨기기'; document.body.appendChild(report);
addEventListener('keydown', event => {
  if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.code === 'Digit0') report.remove();
  if (event.code === 'Digit3') { if (map.isOpen()) map.toggle(); return; }
  if (event.code !== 'Digit1' && event.code !== 'Digit2') return;
  if (map.isOpen()) map.toggle();
  const b2 = event.code === 'Digit2'; player.teleport(0, b2 ? -11 : -6, -120, 0); map.toggle();
  if (b2) { query('더 깊은 층'); document.querySelector('#map-results button').click(); }
}, true);
`;
  const activeLoader = args.includes('--fixture-b1') ? loader.slice(0, loader.indexOf("await import(moduleURL('js/main.js'));")) + b1Loader : loader;
  const responsiveLoader = `
if (new URLSearchParams(location.search).has('mobile')) {
  const frameURL = new URL(location.href); frameURL.searchParams.delete('mobile');
  document.body.replaceChildren(); document.body.style.cssText = 'margin:0;display:grid;place-items:center;background:#dce4e2;min-height:100vh';
  const frame = document.createElement('iframe'); frame.src = frameURL.href; frame.title = '390 × 844 모바일 지도'; frame.width = '390'; frame.height = '844'; frame.style.cssText = 'box-sizing:content-box;border:1px solid #bdccc7;box-shadow:0 10px 60px #25433724;background:#fff'; document.body.appendChild(frame);
  document.title = '모바일 지도 · 390 × 844';
} else { ${activeLoader} }
`;
  let html = read('index.html')
    .replace('<link rel="stylesheet" href="css/style.css">', `<style>${read('css/style.css')}</style>`)
    .replace(/<script type="importmap">[\s\S]*?<\/script>/, '')
    .replace('<script type="module" src="js/main.js"></script>', () => `<script type="module">${responsiveLoader.replace(/<\/script/gi, '<\\/script')}</script>`);
  fs.writeFileSync(destination, html);
  console.log('Standalone native-browser fixture:', destination);
  console.log('Open with ?shot=1&places=_demo&city=1&traffic=0&pos=6,0,-125&fly=1');
}
