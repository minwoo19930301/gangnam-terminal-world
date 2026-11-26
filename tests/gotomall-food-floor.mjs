// Walk from the Line 3 concourse through GoToMall into the food floor and back.
// node tests/gotomall-food-floor.mjs [--gpu]
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page = await browser.newPage({viewport:{width:800,height:500}});
const errors = [], areas = [];
page.on('pageerror', error => errors.push(error.message));

async function walk(key, goal, direction) {
  let lastPage;
  try {
    for (const start = Date.now(); Date.now()-start < 120000;) {
      const state = await page.evaluate(([goal, direction]) => {
        const world = window.__world;
        if (!world?.ready) return null;
        // Keep the ordinary walk aligned to the corridor after the deli turn
        // and after the neighbouring page restores its heading.
        world.player.yaw = Math.atan2(world.player.x + 70, world.player.z - goal) + (direction < 0 ? Math.PI : 0);
        return {load:performance.timeOrigin, area:world.area, y:world.player.y,
          x:world.player.x, z:world.player.z, zone:document.getElementById('zone').innerText};
      }, [goal, direction]).catch(error => {
        if (!error.message.includes('Execution context was destroyed')) throw error;
      });
      if (state) {
        if (state.load !== lastPage) {
          areas.push(state.area);
          await page.keyboard.up(key);
          await page.keyboard.down(key);
          lastPage = state.load;
        }
        assert.ok(Math.abs(state.y + 6) < .15, 'left the B1 floor');
        if (direction * (state.z-goal) >= 0) return state;
      }
      await page.waitForTimeout(50);
    }
    throw Error('Did not reach the food-floor route endpoint');
  } finally {
    await page.keyboard.up(key);
  }
}

// These turns stay on a single page. Steer with the camera, then walk with
// ordinary keyboard input so counters, walls and support remain active.
async function followAisle(points) {
  try {
    await page.keyboard.down('w');
    for (const point of points) {
      await page.waitForFunction(([x,z]) => {
        const player = window.__world.player;
        player.yaw = Math.atan2(player.x-x, player.z-z);
        return Math.hypot(player.x-x, player.z-z) < .38;
      }, point, {polling:'raf',timeout:20000});
    }
  } finally {
    await page.keyboard.up('w');
  }
}

try {
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?q=low&traffic=0#/gotomall/B1?p=-96,-6,-96,265');
  await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
  await page.getByRole('button',{name:'들어가기'}).click();
  const stationAisle = [[-96,-96],[-84.75,-90.5],[-84.25,-90],[-81.25,-89.5],[-70,-89]];
  await followAisle(stationAisle.slice(1));
  const food = await walk('w',-28,1);
  assert.match(food.zone,/B1/);
  assert.ok(Math.abs(food.x+70)<1 && food.z > -29, 'inside the food floor');
  assert.deepEqual(areas,['in:gotomall+station','in:shinsegae']);
  const deliAisle = [[-70,-28],[-63.25,-27],[-63.25,-25],[-63.25,-21.25],[-59.75,-6.25]];
  await followAisle(deliAisle.slice(1,3));
  // At this join the unlabelled strip previously rewrote the shared address
  // to #/underground despite the player standing on the B1 deli floor.
  assert.match(await page.locator('#zone').innerText(), /서측 델리.*B1/);
  assert.match(new URL(page.url()).hash, /^#\/shinsegae\/B1/);
  await followAisle(deliAisle.slice(3));
  assert.match(await page.locator('#zone').innerText(), /델리.*B1|팝업.*B1/);
  await followAisle([...deliAisle].reverse().slice(1));
  areas.length=0;
  const station = await walk('s',-89,-1);
  assert.match(station.zone,/B1/);
  await followAisle([...stationAisle].reverse().slice(1));
  assert.match(await page.locator('#zone').innerText(), /3호선 홀 북측 통로.*B1/);
  assert.deepEqual(areas,['in:shinsegae','in:gotomall+station']);
  assert.deepEqual(errors,[]);
  console.log('Line 3 concourse and Shinsegae B1 food floor reached in both directions, one page transition per trip.');
} finally {
  await browser.close();
  server.close();
}
