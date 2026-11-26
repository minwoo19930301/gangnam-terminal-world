// Use the normal pages and the public House lift. Verify both trips without
// an outdoor scene reload or a direct ground-floor portal between the buildings.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']}
  : {args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
const errors = [];
const houseAngle = Math.atan2(.358, .934);
const sn = Math.sin(houseAngle), cs = Math.cos(houseAngle);
const house = (s, t) => [4 + sn * s + cs * t, 137 + cs * s - sn * t];
const hotel = (u, v) => [-23.6925 + u * .933337 + v * .359001, 99.5825 - u * .359001 + v * .933337];

// From the Famille brick hall, walk up the stone stairs to the House 1F lift.
const shops = [[21.34,152.33], house(16.3,9.81), house(5.9,9.81), house(4,10.5),
  house(-10.6,10.5), house(-10.6,13.7), house(-13,13.7)];
// The L stop opens on the opposite side. Follow its existing grade to the hotel boutiques.
const gallery = [house(-13,10.4), house(-16,10.4), house(-28,10.4), house(-34.3,10.4),
  house(-39.2,10.4), house(-39.2,8.2), hotel(18,5.55)];
const shopsArea = 'in:famille+centralcity', hotelArea = 'in:jwmarriott';

// Observe the game once per rendered frame. A slow renderer can move the
// capsule .63 m in one frame, wider than a .48 m waypoint. An intermediate
// waypoint may be crossed between frames, but the final stop must be sampled.
async function readPlayer(page, target, intermediate) {
  return page.evaluate(([x, z, intermediate]) => {
    const world = window.__world;
    if (!world?.ready) return null;
    const {area, errors, player} = world;
    let watch = window.__hotelWalk;
    if (!watch || watch.x !== x || watch.z !== z) {
      watch = window.__hotelWalk = {x, z, reached: false};
      let previous;
      function observe() {
        if (window.__hotelWalk !== watch) return;
        const {x: px, y, z: pz} = player;
        watch.reached = Math.hypot(px - x, pz - z) < .24;
        if (!watch.reached && intermediate && previous && area === world.area &&
            Math.abs(y - previous.y) < .25) {
          const dx = px - previous.x, dz = pz - previous.z, length2 = dx * dx + dz * dz;
          if (length2 > 0 && length2 <= .65 ** 2) {
            const t = ((x - previous.x) * dx + (z - previous.z) * dz) / length2;
            watch.reached = t > 0 && t < 1 &&
              Math.hypot(previous.x + t * dx - x, previous.z + t * dz - z) < .24;
          }
        }
        if (watch.reached) return;
        previous = {x: px, y, z: pz};
        player.yaw = Math.atan2(px - x, pz - z);
        requestAnimationFrame(observe);
      }
      observe();
    }
    return {area, errors, x: player.x, z: player.z, reached: watch.reached, load: performance.timeOrigin};
  }, [...target, intermediate]).catch(error => {
    // Crossing the registered House↔hotel threshold loads the neighbour's page
    // and starts a fresh observer with no previous position.
    if (error.message.includes('Execution context was destroyed')) return null;
    throw error;
  });
}
async function walk(page, points, visits) {
  for (const target of points) {
    let lastLoad, best = Infinity, lastProgress = Date.now();
    try {
      while (Date.now() - lastProgress < 45000) {
        const state = await readPlayer(page, target, target !== points.at(-1));
        if (state) {
          assert.ok([shopsArea, hotelArea].includes(state.area), `left the building at ${target}: ${state.area}`);
          assert.deepEqual(state.errors, []);
          if (visits.at(-1) !== state.area) visits.push(state.area);
          const distance = Math.hypot(state.x - target[0], state.z - target[1]);
          if (state.reached) break;
          if (distance < best - .05) { best = distance; lastProgress = Date.now(); }
          if (state.load !== lastLoad) {
            await page.keyboard.up('w');
            await page.keyboard.down('w');
            lastLoad = state.load;
          }
        }
        await page.waitForTimeout(30);
      }
      assert.ok(Date.now() - lastProgress < 45000, `could not walk to ${target}`);
    } finally {
      await page.keyboard.up('w');
    }
  }
}
async function useHouseLift(page, label) {
  await page.keyboard.press('e');
  assert.equal(await page.locator('#elev .elev-title').textContent(), '하우스 오브 신세계 엘리베이터');
  const floor = page.locator('.elev-list button').filter({has: page.locator('b', {hasText: new RegExp(`^${label}$`)})});
  await floor.click();
}
async function checkTrip(forward) {
  const page = await browser.newPage({viewport: {width: 800, height: 500}});
  page.on('pageerror', error => errors.push(error.message));
  const visits = [];
  try {
    const start = forward ? shops[0] : gallery.at(-1);
    const firstPlace = forward ? 'famille' : 'jwmarriott';
    const url = new URL(`http://127.0.0.1:${server.address().port}/index.html?q=low&traffic=0`);
    url.hash = `/${firstPlace}/1F?p=${[start[0],forward ? 0 : 7,start[1],0].join(',')}`;
    await page.goto(url.href);
    await page.waitForFunction(() => window.__world?.ready, null, {timeout: 120000});
    await page.getByRole('button', {name: '들어가기'}).click();
    if (forward) {
      await walk(page, shops.slice(1), visits);
      await useHouseLift(page, 'L');
      await walk(page, gallery, visits);
    } else {
      await walk(page, [...gallery].reverse().slice(1).concat([house(-13,12.1)]), visits);
      await useHouseLift(page, '1F');
      await walk(page, [...shops].reverse(), visits);
    }
    const name = forward ? '호텔 부티크 통로 · 1F' : '파미에스테이션 · 1F';
    await page.waitForFunction(name => document.getElementById('zone').innerText === name, name);
    assert.deepEqual(visits, forward ? [shopsArea,hotelArea] : [hotelArea,shopsArea]);
  } finally {
    await page.close();
  }
}

try {
  await checkTrip(true);
  await checkTrip(false);
  assert.deepEqual(errors, []);
  console.log('Walked both directions between Famille and the hotel through the House lift.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
