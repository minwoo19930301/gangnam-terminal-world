// Real map navigation across separately loaded interiors. Run with --gpu on macOS.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server = await serve(0);
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel: 'chromium', args: ['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu']}
  : {args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 1060, height: 670}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const waitArea = id => page.waitForFunction(id => window.__world?.ready && window.__world.area === id,
    id, {timeout: 90000});
  const timeOrigin = () => page.evaluate(() => performance.timeOrigin);
  async function selectGotomall() {
    await page.keyboard.press('m');
    await page.locator('#map-search').fill('고투몰 EAST ZONE (남측 통로)');
    await page.locator('#map-results button').first().click();
  }

  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/shinsegae/6F');
  await waitArea('in:shinsegae');
  await page.getByRole('button',{name:'들어가기'}).click();
  await page.waitForFunction(() => location.hash.includes('?p='));
  const original = await timeOrigin();

  // Both button presses must occur before the scheduled reload. Back should
  // cancel it and dismiss its loading screen while keeping the original scene.
  await selectGotomall();
  const entries = await page.evaluate(() => {
    const button = document.querySelector('.gt-teleport'), before = history.length;
    button.click(); button.click();
    const added = history.length - before;
    history.back();
    return added;
  });
  assert.equal(entries, 1, 'one history entry for a repeated destination');
  await page.waitForFunction(() => location.hash.startsWith('#/shinsegae/6F')
    && document.getElementById('loading').classList.contains('hidden'));
  await page.waitForTimeout(250);
  assert.equal(await timeOrigin(), original, 'Back canceled the pending document reload');
  assert.equal(await page.locator('#map-full').isVisible(), false, 'duplicate press kept the map closed');

  await selectGotomall();
  await page.getByRole('button',{name:'여기로 이동'}).click();
  await waitArea('in:gotomall+station');
  assert.match(await page.locator('#zone').innerText(), /EAST ZONE/);
  await page.evaluate(() => history.back());
  await waitArea('in:shinsegae');
  assert.match(await page.locator('#zone').innerText(), /6F/);
  await page.evaluate(() => history.forward());
  await waitArea('in:gotomall+station');
  assert.match(await page.locator('#zone').innerText(), /EAST ZONE/);
  assert.deepEqual(errors, []);
  console.log('Passed repeat navigation, canceled reload, and Back/Forward across both areas.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
