import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const positions={
  '22020':[-70.27,-95.53,3.50741545286927],
  '22019':[6.55,-132.2,.358488329147246],
};
const files=['display.glb','frame.glb','glass.glb','posters.glb'];
function pose(id,u,v,a,b){
  const [x,z,rot]=positions[id],c=Math.cos(rot),s=Math.sin(rot);
  const p=(u,v)=>[x+c*u+s*v,z-s*u+c*v];
  const [px,pz]=p(u,v),[tx,tz]=p(a,b);
  return [px,.15,pz,Math.atan2(px-tx,pz-tz)];
}
async function aim(page,p,pitch){
  await page.evaluate(([p,t])=>{__world.player.teleport(...p);__world.player.pitch=t*Math.PI/180;},[p,pitch]);
}
async function open(p){
  const page=await browser.newPage({viewport:{width:1000,height:640}});
  const seen=[],errors=[];
  page.on('request',r=>{if(/\/sinbanpo-bus-shelters\/[^?]+\.(glb|webp)$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/SHADER|VALIDATE_STATUS|WebGLProgram/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(()=>{sessionStorage.setItem('sky-mode','day');});
  await page.goto(base+'/?pos='+p.slice(0,3).join(',')+'&yaw='+p[3]*180/Math.PI+'#/streets');
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});return {page,seen,errors};
}
async function pool(page){
  return page.evaluate(()=>{
    const glow=__world.scene.getObjectByName('보도에 비친 차양등');
    return {visible:glow.visible,intensity:glow.material.opacity,width:glow.material.map?.image?.width??0,
      triangles:glow.geometry.index.count/3};
  });
}
async function walk(page,distance){
  const start=await page.evaluate(()=>[__world.player.x,__world.player.z]);
  await page.keyboard.down('w');
  try{await page.waitForFunction(([x,z,m])=>Math.hypot(__world.player.x-x,__world.player.z-z)>=m,[...start,distance],{timeout:9500});}
  finally{await page.keyboard.up('w');}
  return page.evaluate(([x,z])=>({distance:+Math.hypot(__world.player.x-x,__world.player.z-z).toFixed(2),y:__world.player.y}),start);
}
try{
  // Turn away while standing in front of the last bay. The other stop is outside the close-up range.
  const turned=await open(pose('22020',8.3,7.5,8.3,20));
  await turned.page.waitForTimeout(600);
  assert.deepEqual(turned.seen.filter(f=>files.includes(f)),[]);
  assert.deepEqual(turned.errors,[]);await turned.page.close();

  const {page,seen,errors}=await open(pose('22020',1,2.5,0,-.7));
  assert.equal(await page.evaluate(()=>__world.area),'out:core');
  const originalLoad=await page.evaluate(()=>performance.timeOrigin);
  await page.mouse.click(500,320);
  await page.waitForFunction(()=>__world.scene.getObjectByName('중앙차로 승차대 · 승객용 전광판과 안내 케이스').children[0].geometry.attributes.position.count>100);
  for(const file of files)assert.ok(seen.includes(file),file);
  assert.equal(seen.includes('paving-light.webp'),false);
  assert.equal((await pool(page)).visible,false);
  await page.waitForFunction(()=>__world.scene.children.some(r=>r.name==='중앙차로 승차대 · 검은 강재 차양과 승객 벤치'&&r.children[0].geometry.index.count>3000));
  const furniture=await page.evaluate(()=>{
    const roots=__world.scene.children.filter(r=>r.name==='중앙차로 승차대 · 검은 강재 차양과 승객 벤치');
    return {bays:roots.length,hot:roots.filter(r=>r.children[0].geometry.index.count>3000).length};
  });
  assert.equal(furniture.bays,6);assert.ok(furniture.hot>0&&furniture.hot<6,JSON.stringify(furniture));
  const light=[];
  for(const mode of ['sunset','night','sunrise','day']){
    await page.evaluate(mode=>__world.setTimeMode(mode),mode);
    if(mode==='night')await page.waitForFunction(()=>__world.scene.getObjectByName('보도에 비친 차양등').material.map?.image?.width===896);
    light.push({mode,...await pool(page)});
  }
  assert.ok(light[0].intensity>0&&light[0].intensity<1);
  assert.equal(light[1].intensity,1);assert.equal(light[1].width,896);
  assert.ok(light[2].intensity>0&&light[2].intensity<1);assert.equal(light[3].visible,false);
  await aim(page,pose('22020',-6,.65,12,.65),-2);
  const timing=page.evaluate(async()=>{
    const ms=[],draw=[],tri=[];let last;
    for(let i=0;i<190;i++){const t=await new Promise(requestAnimationFrame);
      if(i>8){ms.push(t-last);draw.push(__world.renderer.info.render.calls);tri.push(__world.renderer.info.render.triangles);}
      last=t;
    }
    ms.sort((a,b)=>a-b);return {p95:+ms[Math.floor(ms.length*.95)].toFixed(1),max:+ms.at(-1).toFixed(1),
      peakDraws:Math.max(...draw),peakTriangles:Math.max(...tri)};
  });
  const walked=await walk(page,11.0);
  assert.ok(Math.abs(walked.y-.15)<.11,JSON.stringify(walked));
  await aim(page,pose('22019',0,2.65,0,-1),4);
  await page.waitForFunction(()=>Boolean(__world.scene.getObjectByName('정류소 22019 · 서울 시각')?.material.map.image));
  await page.waitForTimeout(450);
  await aim(page,pose('22020',0,2.65,0,-1),4);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>performance.timeOrigin),originalLoad);
  assert.equal(seen.includes('paving-roadside-off.webp'),false);
  await aim(page,pose('22020',4.5,-1.28,2.66,-.981),-3);
  for(const [time,off] of [['02:59',false],['03:00',true],['03:59',true],['04:00',false]]){
    await page.clock.setFixedTime(new Date('2026-11-27T'+time+':00+09:00'));
    await page.evaluate(()=>__world.setTimeMode('live'));
    await page.waitForFunction(([time,off])=>{
      const w=__world,active=w.scene.children.filter(r=>r.name.endsWith('포스터 22-020'))
        .some(r=>r.children[0].material.customProgramCacheKey()==='scheduled-print-near');
      return w.daylight.state.clock===time&&active===off;
    },[time,off]);
    if(off)await page.waitForFunction(()=>__world.scene.children
      .filter(r=>r.name.endsWith('보도 빛 22-020')).some(r=>r.children[0].material.map.image?.src?.endsWith('paving-roadside-off.webp')));
  }
  assert.equal(seen.filter(f=>f==='paving-roadside-off.webp').length,1);
  const repeats=seen.filter((f,i)=>seen.indexOf(f)!==i);
  assert.deepEqual(repeats,[]);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({furniture,light,walked,frames:await timing,requests:seen}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
