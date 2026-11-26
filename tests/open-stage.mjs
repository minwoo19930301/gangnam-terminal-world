// Normal indoor gameplay includes both physical shells and a distant hotel model.
// Walking checks alone cannot detect a visual-only facade across the opening.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const gpu = process.argv.includes('--gpu');
const launchOptions = gpu
  ? { channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] }
  : { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] };
const server = await serve(0);
const browser = await chromium.launch(launchOptions);
const errors = [];

// Coordinates and orientation of the Open Stage gallery in centralcity.js.
const angle = Math.atan2(.358, .934);
const along = Math.sin(angle), across = Math.cos(angle);
function plazaPoint(s, t) {
  return { x: -46 + (s + 19) * along + t * across, z: 43.1 + (s + 19) * across - t * along };
}

async function checkView(page, direction) {
  const blocked = await page.evaluate(([dx, dz]) => {
    const { scene, camera, K } = window.__world;
    const ray = new K.THREE.Raycaster(camera.position, new K.THREE.Vector3(dx, 0, dz), .1, 7);
    return ray.intersectObjects(scene.children, true).some(({object}) => {
      for (let node = object; node; node = node.parent) if (!node.visible) return false;
      return true;
    });
  }, [-across * direction, along * direction]);
  assert.equal(blocked, false, 'visible geometry covers the plaza threshold');
}

async function walk(page, key, end, zone) {
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(({x, z}) => {
      const player = window.__world.player;
      return Math.hypot(player.x - x, player.z - z) < .35;
    }, end, {timeout: 16000, polling: 'raf'});
  } finally {
    await page.keyboard.up(key);
  }
  await page.waitForFunction(name => document.getElementById('zone').innerText === name, zone);
  const state = await page.evaluate(() => {
    const {area, player, errors} = window.__world;
    return {area, floor: player.y, errors};
  });
  assert.equal(state.area, 'in:famille+centralcity');
  assert.ok(Math.abs(state.floor) < .2, 'the level crossing should support the player');
  assert.deepEqual(state.errors, []);
}

async function checkAisle(s) {
  const page = await browser.newPage({viewport: {width: 900, height: 580}});
  page.on('pageerror', error => errors.push(error.message));
  try {
    const start = plazaPoint(s, -28.5), hall = plazaPoint(s, -37);
    const yaw = Math.atan2(across, -along) * 180 / Math.PI;
    const url = new URL(`http://127.0.0.1:${server.address().port}/index.html?q=low&traffic=0`);
    url.hash = '/centralcity/1F?p=' + [start.x, 0, start.z, yaw].join(',');
    await page.goto(url.href);
    await page.waitForFunction(() => window.__world?.ready, null, {timeout: 90000});
    await page.getByRole('button', {name: '들어가기'}).click();
    await checkView(page, 1);
    await walk(page, 'w', hall, '호남선 대합실 · 1F');
    await checkView(page, -1);
    await walk(page, 's', start, '오픈 스테이지 · 1F');
  } finally {
    await page.close();
  }
}

try {
  // Test the original narrow opening and the florist-facing side of the plaza.
  for (const s of [11, 27.8]) await checkAisle(s);
  assert.deepEqual(errors, []);
  console.log('Open Stage and Honam hall: both aisles visible and walkable in both directions.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
