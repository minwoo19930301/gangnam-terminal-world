// The finished eight treads, the walking surface and eye-level views of Famille Gate 1.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const folder=process.argv[2];
if(folder)await fs.mkdir(folder,{recursive:true});
const angle=Math.atan2(.3639,.9315), sn=Math.sin(angle), cs=Math.cos(angle);
const point=(s,t)=>({x:-135.7+sn*s+cs*t, z:9.9+cs*s-sn*t});
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1050,height:660}}), errors=[];
page.on('pageerror',error=>errors.push(error.message));

function cast({origin,direction,length}) {
  const w=window.__world, T=w.K.THREE;
  const ray=new T.Raycaster(new T.Vector3(...origin),new T.Vector3(...direction),.01,length);
  const hits=ray.intersectObjects(w.scene.children,true);
  const hit=hits.find(({object})=>{
    for(let n=object;n;n=n.parent)if(!n.visible)return false;
    return true;
  });
  return hit && {y:hit.point.y,distance:hit.distance,name:hit.object.name};
}

async function walk(start,end,t) {
  const yaw=angle+(end>start?Math.PI:0);
  await page.evaluate(yaw=>{window.__world.player.yaw=yaw;window.__world.player.pitch=-.12;},yaw);
  const goal=point(end,t);
  await page.keyboard.down('w');
  try {
    const row=await page.evaluate(({goal,sn,cs})=>new Promise((resolve,reject)=>{
      const w=window.__world,p=w.player,start=performance.now();
      const first={x:p.x,z:p.z},eye=p.eye, heights=[], frames=[];
      let prev;
      function sample(now) {
        if(now-start>12000){reject(new Error('continuous keyboard walk stopped'));return;}
        if(prev!==undefined)frames.push(now-prev);
        prev=now;
        const s=(p.x+135.7)*sn+(p.z-9.9)*cs;
        heights.push({s,y:p.y,cameraY:w.camera.position.y,offset:w.camera.position.y-p.y-eye});
        if(Math.hypot(p.x-goal.x,p.z-goal.z)>.15){requestAnimationFrame(sample);return;}
        frames.sort((a,b)=>a-b);
        resolve({distance:Math.hypot(p.x-first.x,p.z-first.z),heights,peak:frames.at(-1),p95:frames[Math.ceil(frames.length*.95)-1]});
      }
      requestAnimationFrame(sample);
    }),{goal,sn,cs});
    return row;
  } finally {await page.keyboard.up('w');}
}

async function pose(s,t,y,yaw,pitch) {
  await page.evaluate(p=>Object.assign(window.__world.player,p),{...point(s,t),y,yaw,pitch,vy:0});
  await page.waitForTimeout(220);
}
const round=v=>+v.toFixed(3);
try {
  const start=point(175.5,22);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/famille/1F?p='+[start.x,0,start.z,angle*180/Math.PI].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});
  await page.locator('#start').click();
  await page.evaluate(()=>{window.__world.setTimeMode('day');document.body.classList.add('shot');});
  await page.addStyleTag({content:'#toast,#prompt{display:none!important}'});
  await page.waitForTimeout(600);
  const floors=[];
  for(const t of [21,22,23])for(const s of Array.from({length:8},(_,i)=>169.58+i*.36)) {
    const {x,z}=point(s,t);
    const hit=await page.evaluate(cast,{origin:[x,1.68,z],direction:[0,-1,0],length:1.8});
    floors.push([s,t,hit&&round(hit.y)]);
    assert.ok(hit && Math.abs(hit.y-(1.36-.17*Math.round((s-169.58)/.36)))<.015,'visible tread elevation at '+s+'/'+t);
  }
  const rows=[];
  for(const t of [21,22,23,24.5]) {
    await pose(175.5,t,0,angle,-.12);
    for(const [a,b] of [[175.5,162.7],[162.7,175.5]]) {
      const row=await walk(a,b,t), raised=t<24, inside=row.heights.filter(h=>h.s>169.4&&h.s<172.28);
      const highest=Math.max(...row.heights.map(h=>h.y));
      const headOffset=Math.max(...row.heights.map(h=>Math.abs(h.offset)));
      const largestJump=Math.max(...row.heights.map((h,i)=>i?Math.abs(h.cameraY-row.heights[i-1].cameraY):0));
      assert.ok(row.distance>12.3 && row.distance<13.3);
      assert.ok(inside.length>8);
      assert.ok(Math.abs(highest-(raised?1.36:0))<.025,'top landing');
      assert.ok(headOffset<.025,'camera tracks the actual player');
      for(let i=1;i<row.heights.length;i++){
        const previous=row.heights[i-1],current=row.heights[i];
        assert.ok(Math.abs(current.cameraY-previous.cameraY)<.48*Math.abs(current.s-previous.s)+.035,'eye moves continuously along the grade');
      }
      rows.push({t,direction:a>b?'up':'down',metres:round(row.distance),highest:round(highest),cameraDelta:round(largestJump),p95:round(row.p95),maximum:round(row.peak)});
    }
  }
  const views=[];
  for(const [label,s,t,y,sign] of [['ascent',173.8,22,0,-1],['descent',167.7,22,1.36,1]]) {
    for(const mode of ['day','night']) {
      await pose(s,t,y,sign<0?angle:angle+Math.PI,-.18);
      await page.evaluate(m=>window.__world.setTimeMode(m),mode);
      await page.waitForTimeout(230);
      const cameraY=await page.evaluate(()=>window.__world.camera.position.y);
      for(const offset of [-.62,0,.62]) {
        const {x,z}=point(s,t+offset);
        const hit=await page.evaluate(cast,{origin:[x,cameraY,z],direction:[sn*sign,0,cs*sign],length:5});
        assert.equal(hit,undefined,'eye-level stair sightline at '+t+' / '+offset+' '+label+' '+mode+': '+JSON.stringify(hit));
      }
      views.push([label,mode,round(cameraY)]);
      if(folder)await page.screenshot({path:path.join(folder,label+'-'+mode+'.jpg'),type:'jpeg',quality:84});
    }
  }
  assert.deepEqual(errors,[]);
  assert.deepEqual(await page.evaluate(()=>window.__world.errors),[]);
  console.log(JSON.stringify({floors,walks:rows,views},null,2));
} finally {await browser.close();await new Promise(done=>server.close(done));}
