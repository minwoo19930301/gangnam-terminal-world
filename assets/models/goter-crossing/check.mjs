import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {origin,toWorld,parts,prefix} from './layout.js';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
function pose(x,d,tx,td,pitch=0,ground=.15){
  const [px,pz]=toWorld(x,d),[a,b]=toWorld(tx,td);
  return [px,ground,pz,Math.atan2(px-a,pz-b)*180/Math.PI,pitch];
}
async function open(p,area='streets',mode='day'){
  const page=await browser.newPage({viewport:{width:1000,height:640}});
  const seen=[],errors=[];
  page.on('request',r=>{if(/\/goter-crossing\/[^?]+\.glb$/.test(r.url()))seen.push(r.url().split('/').at(-1));});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/WebGLProgram|VALIDATE_STATUS|SHADER/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(m=>sessionStorage.setItem('sky-mode',m),mode);
  await page.goto(base+'/?fixedres=1&pos='+p.slice(0,3).join(',')+'&yaw='+p[3]+'&pitch='+p[4]+'#/'+area);
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:100000});
  await page.waitForTimeout(550);return {page,seen,errors};
}
async function aim(page,p){await page.evaluate(p=>{__world.player.teleport(...p.slice(0,3),p[3]*Math.PI/180);__world.player.pitch=p[4]*Math.PI/180;},p);await page.waitForTimeout(400);}
async function loaded(page,key){await page.waitForFunction(name=>__world.scene.children.some(r=>r.name===name&&r.children[0]?.matrixAutoUpdate===false&&r.children[0].geometry.attributes.position.count>80),prefix+parts[key][0],{timeout:14000});}
async function frames(page){
  return page.evaluate(async()=>{
    const ms=[];let last;
    for(let i=0;i<130;i++){const t=await new Promise(requestAnimationFrame);if(i>6)ms.push(t-last);last=t;}
    ms.sort((a,b)=>a-b);return {p95:+ms[Math.floor(ms.length*.95)].toFixed(1),p99:+ms[Math.floor(ms.length*.99)].toFixed(1),maximum:+ms.at(-1).toFixed(1)};
  });
}
try{
  for(const [name,p,a] of [['behind camera',pose(5.8,-5.4,8,-13),'streets'],['distant',pose(100,0,0,0),'streets'],['underground',[-326,-3.8,-11,55,0],'gotomall/B1']]){
    const q=await open(p,a);assert.deepEqual(q.seen,[],name);assert.deepEqual(q.errors,[]);await q.page.close();
  }
  const {page,seen,errors}=await open(pose(-4.0,-6,0,0,13));
  await page.mouse.click(500,320);
  await loaded(page,'mast');await loaded(page,'walker');await loaded(page,'sinbanpo');
  for(const p of [pose(-2.9,-3.25,0,0,20),pose(-1.25,-1.71,0,0,40),pose(-1.0,1.30,0,.14,-17),pose(1.7,1.40,.7,.44,-47),pose(-11,-10,-4,0,23)])await aim(page,p);
  for(const k of ['tactile','pixels','sound','lens','booms','bollard','four','jamwon','stone'])assert.ok(seen.includes(k+'.glb'),k+' '+JSON.stringify(seen));
  const start=pose(6.91,1.84,-1.2,1.84);await aim(page,start);
  const before=await page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
  const timing=frames(page);await page.keyboard.down('w');
  try{await page.waitForFunction(([x,y,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)>6.6,before,{timeout:6500});}finally{await page.keyboard.up('w');}
  const after=await page.evaluate(()=>[__world.player.x,__world.player.y,__world.player.z]);
  assert.ok(after[1]>-.10&&after[1]<.38,JSON.stringify({before,after}));
  for(const mode of ['sunset','night','sunrise','day'])await page.evaluate(mode=>__world.setTimeMode(mode),mode);
  await aim(page,pose(-3,-4,0,0,25));
  assert.equal(new Set(seen).size,seen.length);
  assert.ok(seen.includes('dot.glb'));
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({requested:seen,coldViews:3,walkMetres:Math.hypot(after[0]-before[0],after[2]-before[2]),localGround:[before[1],after[1]],frames:await timing}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
