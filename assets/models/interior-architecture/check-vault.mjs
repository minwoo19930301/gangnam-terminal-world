// Raise the editable vault in memory and verify the resulting ceiling in the game.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {createPhysics} from '../../../js/physics.js';

const check=createPhysics();
const outline=[[0,0],[8,0],[0,8]];
check.addCeiling(outline,8,{heights:[8,12,8]});
assert.equal(check.ceilingAbove(4,1,7,14),10);
assert.equal(check.ceilingBlocksView(1,10,1,6,10,1),true);
assert.equal(check.ceilingBlocksView(1,6,1,6,6,1),false);

const here=path.dirname(fileURLToPath(import.meta.url)),dir=await mkdtemp(path.join(tmpdir(),'famille-vault-'));
const script=`import bpy, runpy, sys
from pathlib import Path
here=Path(bpy.data.filepath).parent
write=runpy.run_path(str(here/'export.py'))['write_vault_contacts']
collection=bpy.data.collections['gallery-rib']
folder=Path(sys.argv[-1])
write(collection,folder/'original.js')
for panel in collection.all_objects:
    if panel.get('gallery_soffit'):
        panel.location.z += .65
bpy.context.view_layer.update()
write(collection,folder/'higher.js')`;
let browser,server;
try{
  execFileSync(process.env.BLENDER||'blender',['--factory-startup','-b',here+'/interiors.blend','-t','2','--python-exit-code','1','--python-expr',script,'--',dir],{stdio:'pipe'});
  assert.equal(await readFile(dir+'/original.js','utf8'),await readFile(here+'/vault-contact.js','utf8'));
  browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
  server=await serve();
  const samples=[];
  for(const file of ['original','higher']){
    const page=await browser.newPage({viewport:{width:880,height:540}});
    const source=await readFile(dir+'/'+file+'.js','utf8');
    await page.route('**/vault-contact.js',route=>route.fulfill({body:source,contentType:'text/javascript'}));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&fixedres=1#/famille/1F');
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    samples.push(await page.evaluate(()=>{
      const {phys}=__world,h=Math.hypot(62,24),c=62/h,s=24/h;
      return [[25,.9],[42,5.93],[60,9.5],[70.1,3.6]].map(([u,v])=>{
        const x=29-c*u+s*v,z=144+s*u+c*v;
        return phys.ceilingAbove(x,z,9.1,13);
      });
    }));
    await page.close();
  }
  for(let i=0;i<samples[0].length;i++){
    assert.ok(samples[0][i]>8&&samples[0][i]<11.01);
    assert.ok(Math.abs(samples[1][i]-samples[0][i]-.65)<.0001,JSON.stringify(samples));
  }
  console.log('Gallery plaster, glazing and the short final bay follow a 0.65 m Blender edit.',samples);
}finally{
  await browser?.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  await rm(dir,{recursive:true,force:true});
}
