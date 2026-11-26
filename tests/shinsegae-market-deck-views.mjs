// Open the normal public addresses, including the adjoining Sweet Park preview.
// Pair renders in the same tick so traffic and the escalator tread movement match.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {compareDeckFrame} from './deck-frame-pair.mjs';

const cases = [
  {name:'마켓 동측 로비', route:'shinsegae/B1', active:true},
  {name:'마켓 과일 매대', route:'shinsegae/B1?p=-63.58,-6,26.96,110.784,25', active:true},
  {name:'1층으로 열린 에스컬레이터', route:'shinsegae/B1?p=-62.12988,-6,9.75047,5,43', active:true},
  {name:'식품관 카페 통로', route:'shinsegae/B1?p=-88.2646,-6,45.6867,104.9049,0', active:false},
  {name:'메가박스', route:'shinsegae/B1?destination=megabox', active:false},
  {name:'스위트 파크', route:'centralcity/B1?destination=sweet-park', active:false},
  {name:'1층 백화점', route:'shinsegae/1F', active:false},
  {name:'주차된 차량이 보이는 B2', route:'shinsegae/B2', active:false},
];
const server = await serve();
const browser = await chromium.launch({channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  for (const {name,route,active} of cases) {
    const page = await browser.newPage({viewport:{width:960,height:600}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:' + server.address().port + '/?fixedres=1#/' + route);
      await page.waitForFunction(() => window.__world?.ready, null, {timeout:120000});
      await page.locator('#start').click();
      const heading = await page.evaluate(() => [__world.player.yaw, __world.player.pitch]);
      let savedTriangles = 0;
      for (const [turn,mode] of [[0,'day'],[90,'night'],[180,'day'],[270,'night']]) {
        await page.evaluate(([yaw,pitch,mode]) => {
          __world.player.yaw = yaw;
          __world.player.pitch = pitch;
          __world.setTimeMode(mode);
        }, [heading[0] + turn*Math.PI/180, heading[1], mode]);
        await page.waitForTimeout(850);
        const pair = await page.evaluate(compareDeckFrame);
        assert.equal(pair.different, 0, name + ' at ' + turn + '° changed visible pixels');
        assert.equal(pair.active, active, name + ' slab activation');
        savedTriangles = Math.max(savedTriangles, pair.before[1] - pair.after[1]);
        console.log(JSON.stringify({name,turn,mode,...pair}));
      }
      if (active) assert.ok(savedTriangles>0, name + ' saved no triangles from any direction');
      assert.deepEqual(await page.evaluate(() => [...__world.errors,...__world.K._.detailErrors]), []);
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
