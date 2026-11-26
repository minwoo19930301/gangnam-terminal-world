// BLENDER=/path/to/blender node tests/cinema-native-shell.mjs
// Export scratch Blender edits into two browser tabs; never change the source library or guide.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {plan} from '../assets/models/cinema-rotary/layout.js';

const dir=fileURLToPath(new URL('../assets/models/cinema-public-shell/',import.meta.url));
const source=new URL('../assets/models/megabox-central/layout.js',import.meta.url);
const temporary=await mkdtemp(join(tmpdir(),'cinema-public-shell-'));
const server=await serve(),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
function exportLayout(path,move) {
  const args=['-b',join(dir,'public-shell.blend'),'--python-exit-code','1'];
  if(move)args.push('--python-expr',move);
  execFileSync(process.env.BLENDER||'blender',[...args,'-P',join(dir,'edit.py'),'--','export',path],{stdio:'pipe'});
}
async function check(row) {
  const target=[plan(840,row),plan(1032,row)], output=join(temporary,row+'.js');
  // Simulate the artist translating the selected north edge horizontally.
  exportLayout(output,`import bpy
mesh=bpy.data.objects["East cross-aisle floor"].data
for vertex,(x,z) in zip(mesh.vertices,${JSON.stringify(target)}):
    vertex.co.x,vertex.co.y=x,-z`);
  const module=await readFile(output,'utf8');
  const page=await browser.newPage({viewport:{width:760,height:480}});
  try{
    await page.route('**/megabox-central/layout.js',route=>route.fulfill({contentType:'text/javascript',body:module}));
    const [x,z]=plan(883,790);
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/shinsegae/B1?p='+[x,-6,z,0].join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    return await page.evaluate(async()=>{
      const {plan,publicFloorOpening}=await import('/assets/models/cinema-rotary/layout.js');
      const {transverseFloor,transverseEastEdge,cinemaPreview}=await import('/assets/models/megabox-central/layout.js');
      const {phys,errors}=window.__world;
      function probe(u,v) {
        const [x,z]=plan(u,v),pos={x,z};
        phys.resolve(pos,.32,-6,-4.25,.5);
        const floor=phys.support(x,z,-5.9,s=>s.poly?.length===4&&s.poly.every((p,i)=>
          p.every((value,j)=>Math.abs(value-transverseFloor[i][j])<.000001)));
        return {zone:phys.zoneAt(x,-5.9,z)?.name,floor:floor.y,ceiling:phys.ceilingAbove(x,z,-5.8,-.01),
          push:Math.hypot(pos.x-x,pos.z-z),visibleOnNeighbour:cinemaPreview(x,-3,z)};
      }
      // Use the actual shared-edge clipping utility on a line just inside the
      // market-facing end. Both ends of the resulting opening lie on the aisle.
      const cross=publicFloorOpening(...plan(1031,755),...plan(1031,815),[transverseFloor]);
      return {cross,edge:transverseEastEdge,added:probe(878,774),wineFront:probe(940,774),
        oldWall:probe(880,776),newWall:probe(880,771),wineRear:probe(940,763),
        wine:probe(940,766),tea:probe(980,766),coffee:probe(874,804),salt:probe(943,804),errors};
    });
  }finally{await page.close();}
}
try{
  const baseline=join(temporary,'canonical.js');
  exportLayout(baseline);
  assert.equal(await readFile(baseline,'utf8'),await readFile(source,'utf8'),'Native floor must round trip to the actual guide');
  const old=await check(777),changed=await check(772);
  assert.equal(old.added.floor,-Infinity);
  assert.equal(changed.added.floor,-6);
  assert.equal(changed.added.ceiling,-1.545);
  assert.ok(old.added.ceiling>changed.added.ceiling+.1);
  assert.equal(changed.added.visibleOnNeighbour,true);
  assert.equal(old.wineFront.zone,'와인하우스');
  assert.equal(changed.wineFront.zone,'신세계 식품관 카페 통로');
  assert.ok(old.oldWall.push>.3&&changed.newWall.push>.3);
  assert.ok(changed.oldWall.push<.001&&old.newWall.push<.001);
  assert.ok(changed.cross.w-old.cross.w>.7);
  assert.deepEqual(changed.edge[1],old.edge[1]);
  for(const key of ['wineRear','wine','tea','coffee','salt'])assert.deepEqual(changed[key],old[key],key);
  assert.deepEqual([...old.errors,...changed.errors],[]);
  console.log('Native edit moved the aisle, ceiling, collision, shopfront and shared opening; four adjoining shop limits held.');
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true});
}
