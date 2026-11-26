// Walk with the normal player across both public links in both directions.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const meta = JSON.parse(await readFile(new URL('../js/places/_meta.json', import.meta.url), 'utf8'));
const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? { channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist'] }
  : { args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
try {
  const errors = [];
  async function cross(address, source, door, target) {
    const page = await browser.newPage({viewport:{width:970,height:600}});
    page.on('pageerror', e => errors.push(e.message));
    const ready = id => page.waitForFunction(id => window.__world?.ready && window.__world.area===id,
      id, {timeout:90000});
    const {x,z,y,nx,nz} = door;
    const yaw = Math.atan2(-nx,-nz)*180/Math.PI;
    const position = [x-1.65*nx,y,z-1.65*nz,yaw].join(',');
    await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?q=low&traffic=0#/'+address+'?p='+position);
    await ready(source);
    const enter = page.getByRole('button',{name:'들어가기'});
    if (await enter.isVisible()) await enter.click();
    await page.evaluate(() => window.__world.setTimeMode('sunset'));
    // After a new scene's initial guard interval, only the W key crosses the door.
    await page.waitForTimeout(2700);
    await page.keyboard.down('w');
    try { await ready(target); } finally { await page.keyboard.up('w'); }
    assert.equal(await page.evaluate(() => window.__world.daylight.state.mode),'sunset');
    assert.deepEqual(await page.evaluate(() => window.__world.errors),[]);
    await page.close();
    console.log((door.id || 'park entrance')+' · '+source+' → '+target);
  }
  for (const id of ['J_G2_SQUARE','J_ONEBAILEY_G2']) {
    const door = owner => meta[owner].junctions.find(j => j.id===id);
    await cross('gotomall/B1','in:gotomall+station',door('gotomall'),'in:onebailey');
    await cross('onebailey/B1','in:onebailey',door('onebailey'),'in:gotomall+station');
  }
  const park = meta.onebailey.entrances.find(e => Math.abs(e.x+567.9)<1 && Math.abs(e.z+603.7)<1);
  assert.ok(park,'One Bailey park-facing public portal');
  await cross('onebailey/1F','in:onebailey',park,'out:banpo');
  await cross('hangang/1F','out:banpo',{...park,nx:-park.nx,nz:-park.nz},'in:onebailey');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); await new Promise(r=>server.close(r)); }
