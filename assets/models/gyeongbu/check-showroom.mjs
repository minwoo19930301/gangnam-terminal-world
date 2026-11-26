// Register a visit, look across floors, walk through the actual opening and check the rendered LOD.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const xy=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const angle=(du,dv)=>Math.atan2(-(.9348*du+.3552*dv),-(-.3552*du+.9348*dv));

export async function checkShowroom(spec){
  const {floor,height,root,front,farPose,inside,zone}=spec;
  const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
  const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1});
  const base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/';
  const full=[],distant=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{
    if(r.url().endsWith('/'+spec.asset+'/'+spec.file+'.glb'))full.push(r.status());
    if(r.url().endsWith('/'+spec.asset+'/proxy.js'))distant.push(r.status());
  });
  async function entry(floor,u,v,y,du,dv){
    const [x,z]=xy(u,v);
    await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,angle(du,dv)*180/Math.PI].join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:130000});
    await page.evaluate(()=>{document.getElementById('start').click();__world.setTimeMode('day');});
    await page.waitForTimeout(425);
  }
  async function pose(u,v,du,dv){
    const [x,z]=xy(u,v);
    await page.evaluate(p=>Object.assign(__world.player,p),{x,z,y:height,vy:0,yaw:angle(du,dv),pitch:0});
    await page.waitForTimeout(275);
  }
  async function surface(near){
    await page.waitForFunction(([root,near])=>{
      const item=__world.scene.getObjectByName(root)?.children[0];
      return item&&!!item.material.normalMap===near&&(near||item.geometry.index.count>300);
    },[root,near],{timeout:12500});
    return page.evaluate(root=>{
      const group=__world.scene.getObjectByName(root),item=group.children[0],material=item.material;
      return {draws:group.children.length,triangles:item.geometry.index.count/3,
        maps:[material.map,material.normalMap,material.roughnessMap,material.emissiveMap].map(tex=>tex?.image.width??0)};
    },root);
  }
  async function walk(u,v){
    const target=xy(u,v);
    await page.evaluate(([x,z])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);},target);
    await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.17,target,{timeout:12000});}
    finally{await page.keyboard.up('w');}
    return page.evaluate(()=>{const w=__world,p=w.player;return {x:p.x,y:p.y,z:p.z,zone:w.phys.zoneAt(p.x,p.y+.12,p.z)?.name};});
  }
  try{
    const [u,v,du,dv]=front;
    await entry(spec.otherFloor[0],u,v,spec.otherFloor[1],du,dv);assert.deepEqual(full,[]);assert.deepEqual(distant,[]);
    await entry(floor,u,v,height,-du,-dv);assert.deepEqual(full,[]);assert.deepEqual(distant,[]);
    const [su,sv,sdu,sdv]=spec.hiddenSide;
    await entry(floor,su,sv,height,sdu,sdv);assert.deepEqual(full,[]);assert.deepEqual(distant,[]);
    await pose(...farPose);const far=await surface(false);assert.deepEqual(full,[]);
    assert.ok(far.triangles>=spec.farTriangles[0]&&far.triangles<=spec.farTriangles[1],JSON.stringify(far));
    await pose(...front);const near=await surface(true);
    assert.equal(near.draws,1);assert.equal(far.draws,1);
    assert.ok(near.triangles>=spec.nearTriangles[0]&&near.triangles<=spec.nearTriangles[1],JSON.stringify(near));
    assert.deepEqual(near.maps,[1024,512,256,256]);
    const entered=await walk(...inside);assert.equal(entered.zone,zone);assert.equal(entered.y,height);
    const exited=await walk(u,v);assert.notEqual(exited.zone,zone);assert.equal(exited.y,height);
    const [a,b,c,d]=spec.aisle;
    await pose(a,b,c-a,d-b);const aisle=await walk(c,d);assert.equal(aisle.y,height);
    const physical=await page.evaluate(({height,contacts,lanes})=>{
      function contact(u,v){
        const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348,p={x,z};
        __world.phys.resolve(p,.32,height,height+1.75,.50);return Math.hypot(p.x-x,p.z-z);
      }
      const blocked=contacts.map(([u,v])=>contact(u,v)),obstructed=[];
      for(const [u,v,uu,vv] of lanes){
        const steps=Math.ceil(Math.hypot(uu-u,vv-v)/.17);
        for(let j=0;j<=steps;j++){
          const x=u+(uu-u)*j/steps,y=v+(vv-v)*j/steps;
          if(contact(x,y)>.025)obstructed.push([+x.toFixed(2),+y.toFixed(2)]);
        }
      }
      return {blocked,obstructed};
    },{height,contacts:spec.contacts,lanes:spec.lanes});
    assert.deepEqual(physical.obstructed,[]);assert.ok(physical.blocked.every(n=>n>.075),JSON.stringify(physical));
    await pose(...front);const modes=[];
    for(const mode of ['day','sunset','night','sunrise','live']){
      modes.push(await page.evaluate(async mode=>{__world.setTimeMode(mode);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return __world.daylight.state.mode;},mode));
    }
    assert.deepEqual(modes,['day','sunset','night','sunrise','live']);
    await pose(...farPose);await surface(false);await pose(...front);await surface(true);
    assert.deepEqual(full,[200]);assert.deepEqual(distant,[200]);assert.deepEqual(errors,[]);
    console.log(JSON.stringify({far,near,entered,exited,aisle,physical,modes,full,distant,errors},null,2));
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
