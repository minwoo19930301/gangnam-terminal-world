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
function exportLayout(path,move,action='export') {
  const args=['--factory-startup','-b',join(dir,'public-shell.blend'),'--python-exit-code','1'];
  if(move)args.push('--python-expr',move);
  execFileSync(process.env.BLENDER||'blender',[...args,'-P',join(dir,'edit.py'),'--',action,path],{stdio:'pipe'});
}
async function check(row) {
  const target=[840,903,1032].map(x=>plan(x,row)), output=join(temporary,row+'.js');
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
        const floor=phys.support(x,z,-5.9,s=>s.poly?.length===transverseFloor.length&&s.poly.every((p,i)=>
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
async function westCorner(displacement){
  const path=join(temporary,'west-'+displacement+'.js');
  const move=`import bpy
floor=bpy.data.objects["원형 광장 옆 통로 · floor"]
group=floor.vertex_groups["Event wall corner"]
joint,=[v for v in floor.data.vertices if any(g.group==group.index for g in v.groups)]
joint.co.x+=${displacement}`;
  exportLayout(path,move,'export-west');
  const module=await readFile(path,'utf8');
  if(!displacement)assert.equal(module,await readFile(new URL('../assets/models/cinema-rotary/layout.js',import.meta.url),'utf8'));
  const page=await browser.newPage({viewport:{width:760,height:480}});
  try{
    await page.route('**/cinema-rotary/layout.js',r=>r.fulfill({contentType:'text/javascript',body:module}));
    await page.goto('http://127.0.0.1:'+server.address().port+'/#/shinsegae/B1?p=-138.1212,-6,17.1753,103.441');
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    return await page.evaluate(async()=>{
      const {plan,westApron}=await import('/assets/models/cinema-rotary/layout.js');
      const {phys}=__world;
      const [a,b]=[plan(593,1057),plan(434,1057)];
      // Sample the strip swept by a 40 cm westward edit of the event-wall end.
      const x=.75*(a[0]-.2)+.25*b[0], z=.75*a[1]+.25*b[1];
      const wallX=.75*a[0]+.25*b[0],atOldWall={x:wallX,z};
      phys.resolve(atOldWall,.12,-6,-4.25,.5);
      const support=phys.support(x,z,-5.8,s=>s.poly===westApron);
      return {floor:support.s?support.y:null,ceiling:phys.ceilingAbove(x,z,-5.8,-.01),
        oldWallPush:Math.hypot(atOldWall.x-wallX,atOldWall.z-z),errors:__world.errors};
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
  const [oldX,oldZ]=plan(1031,777),[newX,newZ]=plan(1031,772);
  assert.ok(Math.abs(changed.cross.w-old.cross.w-Math.hypot(newX-oldX,newZ-oldZ))<.015);
  assert.deepEqual(changed.edge[1],old.edge[1]);
  for(const key of ['wineRear','wine','tea','coffee','salt'])assert.deepEqual(changed[key],old[key],key);
  assert.deepEqual([...old.errors,...changed.errors],[]);
  const fixed=await westCorner(0),extended=await westCorner(-.4);
  assert.equal(fixed.floor,null);
  assert.equal(extended.floor,-6);
  assert.equal(extended.ceiling,-1.545);
  assert.ok(fixed.oldWallPush>.10 && extended.oldWallPush<.001);
  assert.deepEqual([...fixed.errors,...extended.errors],[]);
  console.log('Native east aisle and west event-wall edits reached the walking floors, ceilings and collision walls.');
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true});
}
