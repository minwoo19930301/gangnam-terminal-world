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
      const state = await page.evaluate(() => {
        const world = window.__world;
        if (!world?.ready) return null;
        return {load:performance.timeOrigin, area:world.area, y:world.player.y,
          x:world.player.x, z:world.player.z, zone:document.getElementById('zone').innerText};
      }).catch(error => {
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

try {
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?q=low&traffic=0#/gotomall/B1?p=-70,-6,-100,180');
  await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
  await page.getByRole('button',{name:'들어가기'}).click();
  const food = await walk('w',-28,1);
  assert.match(food.zone,/B1/);
  assert.ok(Math.abs(food.x+70)<1 && food.z > -29, 'inside the food floor');
  assert.deepEqual(areas,['in:gotomall+station','in:shinsegae']);
  areas.length=0;
  const station = await walk('s',-100,-1);
  assert.match(station.zone,/3호선.*B1/);
  assert.deepEqual(areas,['in:shinsegae','in:gotomall+station']);
  assert.deepEqual(errors,[]);
  console.log('Line 3 concourse and Shinsegae B1 food floor reached in both directions, one page transition per trip.');
} finally {
  await browser.close();
  server.close();
}
