// Compare the cream backing and the dark stall frontage in one ordinary B1 view.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:800,height:480}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(/WebGLProgram|VALIDATE_STATUS/.test(m.text()))errors.push(m.text());});
  await page.goto('http://127.0.0.1:'+server.address().port+
    '/?q=low&fixedres=1&traffic=0&pos=-56.48075,-6,-9.74031&yaw=290.78&pitch=0#/shinsegae/B1');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.waitForFunction(()=>{
    const {player:p,phys}=__world;
    return phys.zoneAt(p.x,p.y+.1,p.z)?.name==='베키아에누보 가스트로';
  });
  const samples={};
  for(const phase of ['day','night']){
    await page.selectOption('#sky-mode',phase,{force:true});
    await page.waitForTimeout(950);
    samples[phase]=await page.evaluate(()=>{
      const {renderer,scene,camera}=__world;
      renderer.render(scene,camera);
      const canvas=document.createElement('canvas');canvas.width=800;canvas.height=480;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(renderer.domElement,0,0,800,480);
      const median=(x,y,w,h)=>{
        const bytes=ctx.getImageData(x,y,w,h).data,light=[];
        for(let i=0;i<bytes.length;i+=4)light.push(.2126*bytes[i]+.7152*bytes[i+1]+.0722*bytes[i+2]);
        light.sort((a,b)=>a-b);return light[light.length>>1];
      };
      return {wall:median(318,210,35,35),caseBase:median(500,365,120,55)};
    });
  }
  assert.ok(samples.day.wall>140,'expected cream wall');
  assert.ok(samples.night.wall>samples.day.wall*.52,'night illumination missing at the deli backing');
  assert.ok(samples.night.caseBase<42&&samples.day.caseBase<42,'dark display base changed');
  assert.deepEqual(errors,[]);
  console.log(samples);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
