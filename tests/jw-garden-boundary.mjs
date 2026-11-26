// Check the two physical ends of the department-store motor and the adjacent
// hotel's outdoor garden. Run with --gpu for Metal or leave it off for SwiftShader.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve();
const base = 'http://127.0.0.1:'+server.address().port+'/';
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror',error=>errors.push(error.message));
  for (const [floor,pose,end] of [
    ['6F',[-26.4900374,26.68,85.929472,20.933732],31],
    ['7F',[-32.9704294,30.52,79.5677533,-159],26.2],
  ]) {
    await page.goto(base+'?q=low&traffic=0&ride='+floor+'#/shinsegae/'+floor+'?p='+pose.join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    await page.locator('#start').click();
    const load = await page.evaluate(()=>performance.timeOrigin);
    await page.waitForFunction(y=>Math.abs(__world.player.y-y)<.09,end,{timeout:50000});
    await page.waitForTimeout(1200);
    assert.deepEqual(await page.evaluate(()=>[__world.area,performance.timeOrigin]),['in:shinsegae',load]);
  }
  await page.goto(base+'?q=low&traffic=0#/jwmarriott/7F');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
  const samples=await page.evaluate(()=>{
    const {phys}=__world;
    return [[-20.5,12],[-20.5,31],[4,3.5],[6,14]].map(([u,v])=>{
      const x=-23.6925+u*.933337+v*.359001, z=99.5825-u*.359001+v*.933337;
      const zone=phys.zoneAt(x,31.2,z);
      return [zone?.place,zone?.name,phys.support(x,z,31.2).y];
    });
  });
  for(const [i,name] of ['정원 산책로','리플렉팅 풀','모보 바 테라스','모보 바'].entries()){
    assert.equal(samples[i][0],'jwmarriott');
    assert.equal(samples[i][1],name);
    assert.ok(samples[i][2]>=30.49 && samples[i][2]<=31.1);
  }
  assert.deepEqual(errors,[]);
  console.log('Both department-store rides retained their scene. Four hotel garden and pavilion samples retained their address and physical support.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
