// Search the ordinary map from another indoor scene and verify each B1 customer entrance.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {serve} from './serve.mjs';

const directory = JSON.parse(await readFile(new URL('../js/places/_meta.json',import.meta.url)));
const cases = [
  ['centralcity','sweet-park','스위트 파크 입구','스위트파크','Sweet Park',/스위트 파크/],
];
const server = await serve();
const browser = await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  for (const [place,id,name,korean,english,hud] of cases) {
    const arrival = directory[place].mapDestinations.find(entry => entry.name === name);
    assert.equal(arrival.floor,'B1');
    const page = await browser.newPage({viewport:{width:960,height:620}});
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/newcore/3F');
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    await page.locator('#start').click();
    await page.keyboard.press('m');
    const input = page.locator('#map-search');
    for (const query of [english,korean]) {
      await input.fill(query);
      assert.equal(await page.locator('.gt-result b').first().innerText(),name);
    }
    await page.locator('.gt-result').first().click();
    assert.match(await page.locator('.gt-selection').innerText(),/B1/);
    await page.locator('.gt-teleport').click();
    await page.waitForFunction(({place,arrival})=>{
      const w=window.__world;
      if(!w?.ready || w.area === 'in:newcore') return false;
      const p=w.player,zone=w.phys.zoneAt(p.x,p.y+.1,p.z);
      return zone?.place===place && zone.floor==='B1' && Math.hypot(p.x-arrival.x,p.z-arrival.z)<.4;
    },{place,arrival},{timeout:120000});
    await page.waitForFunction(()=>window.__world?.timing.signFonts);
    assert.match(await page.locator('#zone').innerText(),hud);
    const state = await page.evaluate(()=>{
      const {player:p,phys}=__world,q={x:p.x,z:p.z};
      phys.resolve(q,p.r,p.y,p.y+p.height,p.step);
      return {y:p.y,yaw:p.yaw,push:Math.hypot(q.x-p.x,q.z-p.z)};
    });
    assert.ok(Math.abs(state.y+6)<.1 && state.push<.04 && Math.cos(state.yaw-arrival.yaw)>.999);
    assert.deepEqual(errors,[]);
    console.log(korean,await page.locator('#zone').innerText());
    const deepLink = 'http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/'+place+'/B1?destination='+id;
    await page.goto(deepLink);
    await page.reload();
    await page.waitForFunction(({x,z}) => {
      const w=window.__world;
      return w?.ready && Math.hypot(w.player.x-x,w.player.z-z)<.4;
    },arrival,{timeout:120000});
    assert.match(await page.locator('#zone').innerText(),hud);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
