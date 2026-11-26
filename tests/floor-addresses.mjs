// Open each coordinate-free floor address through the normal game entry point.
// node tests/floor-addresses.mjs [--gpu] [place ...]
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const meta = JSON.parse(await readFile(new URL('../js/places/_meta.json', import.meta.url)));
const places = process.argv.slice(2).filter(a => !a.startsWith('--'));
const addresses = [];
for (const [id, place] of Object.entries(meta)) {
  if (places.length && !places.includes(id)) continue;
  for (const floor of place.floors) addresses.push({id, floor, owner:id});
  for (const [floor, owner] of Object.entries(place.floorAliases || {})) addresses.push({id, floor, owner});
}
assert.ok(addresses.length, 'Expected at least one known place');
const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const count = addresses.length;
async function visitAddresses() {
  for (let address; (address = addresses.shift());) {
    const {id, floor, owner} = address;
    const url = `http://127.0.0.1:${server.address().port}/#/${id}/${encodeURIComponent(floor)}`;
    const page = await browser.newPage({viewport:{width:640,height:380}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(url);
      await page.waitForFunction(() => window.__world?.ready, null, {timeout:90000});
      const actual = await page.evaluate(async () => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const {player, phys, renderer, K, errors} = window.__world;
        const {x,y,z} = player, zone = phys.zoneAt(x,y+.1,z);
        return {owner:zone?.place, floor:zone?.floor || '1F', draws:renderer.info.render.calls,
          grounded:Math.abs(phys.support(x,z,y+.5).y-y)<.55, errors:[...errors,...K._.detailErrors]};
      });
      assert.deepEqual([actual.owner, actual.floor], [owner, floor], url);
      assert.ok(actual.grounded && actual.draws > 0, url);
      assert.deepEqual([...errors, ...actual.errors], [], url);
    } finally { await page.close(); }
  }
}
try {
  await Promise.all([visitAddresses(), visitAddresses()]);
  console.log(`Passed ${count} floor and legacy addresses in the normal game.`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
