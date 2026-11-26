// Run from the project root. --soak measures ten continuous minutes on the shop floor.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const camera=JSON.parse(await readFile(new URL('camera.json',import.meta.url),'utf8'));
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const base='http://127.0.0.1:'+server.address().port;
try{
  const page=await browser.newPage({viewport:{width:820,height:510}});
  const errors=[];
  let requests=0;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(new URL(request.url()).pathname.endsWith('/ssg-hastens/gallery.glb'))requests++;});

  async function enter(floor,y,{x=camera.x,z=camera.z,yaw=camera.yaw,pitch=camera.pitch}={}){
    requests=0;
    await page.goto(base+'/?q=low&traffic=0&pos='+[x,y,z].join(',')+'&yaw='+yaw+'&pitch='+pitch+'#/shinsegae/'+floor);
    await page.waitForFunction(()=>window.__world?.ready);
    await page.mouse.click(400,230);
    await page.waitForTimeout(650);
  }
  for(const [floor,level,yaw] of [['8F',35.8,camera.yaw],['10F',45.4,camera.yaw],['9F',40.6,camera.yaw+180]]){
    await enter(floor,level,{yaw});
    assert.equal(requests,0,floor+' facing '+yaw);
  }
  await enter('9F',40.6);
  await page.waitForFunction(name=>__world.scene.children.filter(o=>o.name===name&&
    o.children[0].geometry.attributes.position.count>1000).length===2,camera.meshName);
  assert.equal(requests,1,'shared high-detail mesh');

  if(process.argv.includes('--soak')){
    // Move sideways, then retrace the same step, while sampling the whole interval.
    const steps=(async()=>{
      for(let i=0;i<40;i++){
        await page.waitForTimeout(14650);
        const key=i%2?'d':'a';
        await page.keyboard.down(key);
        await page.waitForTimeout(350);
        await page.keyboard.up(key);
      }
    })();
    const result=await page.evaluate(()=>new Promise(resolve=>{
      const bins=new Uint32Array(10001),start=performance.now();
      let previous,count=0,maxMs=0;
      function frame(t){
        if(previous!==undefined){
          const dt=t-previous;
          bins[Math.min(10000,Math.round(dt*10))]++;
          count++;maxMs=Math.max(maxMs,dt);
        }
        previous=t;
        if(t-start<600000){requestAnimationFrame(frame);return;}
        let total=0,p95,p99;
        for(let i=0;i<bins.length;i++){
          total+=bins[i];
          if(p95===undefined&&total>=count*.95)p95=i/10;
          if(total>=count*.99){p99=i/10;break;}
        }
        resolve({seconds:(t-start)/1000,frames:count,p95,p99,maxMs});
      }
      requestAnimationFrame(frame);
    }));
    await steps;
    assert.equal(requests,1,'shared detail after walking');
    console.log(result);
  }

  const nx=.35491462,nz=.93489872,yaw=Math.atan2(nx,nz)*180/Math.PI;
  for(const [label,mx,mz] of [['bed',-85.62597,-17.23184],['gap',-88.07421,-16.30241]]){
    const x=mx+nx*3.4,z=mz+nz*3.4;
    await enter('9F',40.6,{x,z,yaw,pitch:-14});
    const distance=()=>page.evaluate(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z),[x,z]);
    await page.keyboard.down('w');
    try{
      await page.waitForFunction(([x,z,target])=>Math.hypot(__world.player.x-x,__world.player.z-z)>target,
        [x,z,label==='bed'?1.95:4.8],{timeout:6000});
      await page.waitForTimeout(350);
      const walked=await distance();
      if(label==='bed')assert.ok(walked<2.25,'stopped at upholstery');
      assert.ok(Math.abs(await page.evaluate(()=>__world.player.y)-40.6)<.05);
      console.log(label,walked.toFixed(2)+' m');
    }finally{await page.keyboard.up('w');}
  }
  assert.deepEqual(errors,[]);
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
