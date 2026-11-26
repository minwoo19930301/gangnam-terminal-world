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
    // Check the visible canvas labels. A matching search result alone does not
    // tell a visitor where the entrance is on the minimap or floor plan.
    if (from === 'shinsegae/B1') await page.addInitScript(() => {
      window.mapText = {};
      window.miniPaint = 0;
      const proto = CanvasRenderingContext2D.prototype;
      const clear = proto.clearRect, draw = proto.fillText;
      proto.clearRect = function (...args) {
        if (this.canvas.id === 'minimap') window.miniPaint++;
        if (['minimap','map-canvas'].includes(this.canvas.id)) window.mapText[this.canvas.id] = [];
        return clear.apply(this,args);
      };
      proto.fillText = function (text,...args) {
        window.mapText[this.canvas.id]?.push(text);
        return draw.call(this,text,...args);
      };
    });
    const errors = [], modules = [];
    page.on('pageerror',e => errors.push(e.message));
    page.on('request',r => { if (r.url().endsWith('/js/places/shinsegae.js')) modules.push(r.url()); });
    await page.goto(base + '/#/' + from);
    await page.waitForFunction(() => window.__world?.ready,null,{timeout:120000});
    await page.locator('#start').click();
    if (from === 'shinsegae/B1') {
      await page.waitForFunction(name => window.mapText.minimap?.includes(name),entry.name);
      const beforeZoom = await page.evaluate(() => window.miniPaint);
      await page.keyboard.press('Equal');
      await page.waitForFunction(([count,name]) => window.miniPaint > count &&
        window.mapText.minimap?.includes(name),[beforeZoom,entry.name]);
    }
    await page.keyboard.press('m');
    await page.locator('#map-search').fill(query);
    const entrances = page.locator('.gt-result').filter({has:page.getByText(entry.name,{exact:true})});
    await entrances.first().waitFor();
    assert.equal(await entrances.count(),1,'one named entrance in local and remote indices');
    assert.equal(await page.locator('.gt-result b').first().innerText(),entry.name);
    await entrances.click();
    assert.match(await page.locator('.gt-selection').innerText(),/B1/);
    if (from === 'shinsegae/B1') await page.waitForFunction(name =>
      [name,'신세계 마켓'].every(label => window.mapText['map-canvas']?.includes(label)),entry.name);
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
