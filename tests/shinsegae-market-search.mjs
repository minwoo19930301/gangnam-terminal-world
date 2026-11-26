import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const directory = JSON.parse(await readFile(new URL('../js/places/_meta.json',import.meta.url)));
const entry = directory.shinsegae.mapDestinations.find(s => s.name === '신세계 마켓 입구');
assert.equal(entry.floor,'B1');
const server = await serve(0);
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  for (const [from,query] of [['newcore/3F','신세계마켓'],['station/B1','신세계 마켓'],['shinsegae/B1','신세계마켓']]) {
    const page = await browser.newPage({viewport:{width:960,height:620}});
    const errors = [], modules = [];
    page.on('pageerror',e => errors.push(e.message));
    page.on('request',r => { if (r.url().endsWith('/js/places/shinsegae.js')) modules.push(r.url()); });
    await page.goto(base + '/#/' + from);
    await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
    await page.locator('#start').click();
    await page.keyboard.press('m');
    await page.locator('#map-search').fill(query);
    const entrances = page.locator('.gt-result').filter({has:page.getByText(entry.name,{exact:true})});
    await entrances.first().waitFor();
    assert.equal(await entrances.count(),1,'one named entrance in local and remote indices');
    assert.equal(await page.locator('.gt-result b').first().innerText(),entry.name);
    await entrances.click();
    assert.match(await page.locator('.gt-selection').innerText(),/B1/);
    if (from.startsWith('newcore')) assert.equal(modules.length,0,'search alone loads no department store geometry');
    await page.locator('.gt-teleport').click();
    await page.waitForFunction(({x,z}) => {
      const w = window.__world;
      return w?.ready && w.area === 'in:shinsegae' && Math.hypot(w.player.x-x,w.player.z-z)<.4;
    },entry,{timeout:120000});
    const pose = await page.evaluate(() => {
      const {player:p,phys,errors} = __world;
      const zone = phys.zoneAt(p.x,p.y+.1,p.z);
      return {place:zone?.place,floor:zone?.floor,y:p.y,yaw:p.yaw,errors};
    });
    assert.equal(pose.place,'shinsegae');
    assert.equal(pose.floor,'B1');
    assert.ok(Math.abs(pose.y-entry.y)<.2 && Math.cos(pose.yaw-entry.yaw)>.999);
    assert.deepEqual([...errors,...pose.errors],[]);
    console.log(from,'→',entry.name,pose.floor);
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
