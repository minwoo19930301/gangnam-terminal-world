// Follow the public queue from the Famille gallery, read the menu and approach the handoff.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
const r=Math.atan2(.3639,.9315),a=Math.sin(r),b=Math.cos(r),mid=180.5085836909871,front=-65.79014975041596;
const P=(x,d)=>[-135.7+a*(mid-x)+b*(front+d),9.9+b*(mid-x)-a*(front+d)];
const local=(x,z)=>[mid-(x+135.7)*a-(z-9.9)*b,(x+135.7)*b-(z-9.9)*a-front];
const names={shell:'검은 액자와 원형 펜던트',stock:'목제 유리장 속 겹친 와플콘',bar:'돌상판과 황동 난간 주문대',
  wells:'스테인리스 뚜껑과 맛 이름표',menu:'황동 고정 메뉴와 스무 맛',brand:'청록 상호와 두 색 콘 심벌',
  back:'에스프레소 머신과 뒤 작업대',packs:'포장 컵·보냉 상자와 계산대',lights:'유백 구형 펜던트의 빛',serve:'두 맛 컵과 와플콘·젤라또라떼'};
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const p=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  p.on('request',q=>{if(q.url().includes('/models/gelati/')&&(q.url().endsWith('.glb')||q.url().endsWith('/stock-layout.js')))requests.push(q.url().split('/').pop());});
  const [x,z]=P(1,-33);
  await p.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/1F?p='+[x,0,z,0].join(','));
  await p.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await p.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0,h=0){
    const [xx,zz]=P(x,d),[u,v]=P(tx,td),yaw=Math.atan2(xx-u,zz-v);
    await p.evaluate(([x,z,yaw,pitch,h])=>{__world.player.teleport(x,h,z,yaw);__world.player.pitch=pitch;},[xx,zz,yaw,pitch,h]);await p.waitForTimeout(390);
  }
  async function look(x,d,pitch=0){await p.evaluate(([x,z,pitch])=>{const a=__world.player;a.yaw=Math.atan2(a.x-x,a.z-z);a.pitch=pitch;},[...P(x,d),pitch]);}
  async function where(){const [x,z,y,name]=await p.evaluate(()=>{const {x,y,z}=__world.player;return[x,z,y,__world.phys.zoneAt(x,y+.1,z)?.name];});return [...local(x,z),y,name];}
  async function walk(x,d){const from=await where();await look(x,d);await p.keyboard.down('w');
    try{await p.waitForFunction(([u,v])=>Math.hypot(__world.player.x-u,__world.player.z-v)<.135,P(x,d),{timeout:6500});}
    catch(e){throw new Error('Walk '+from+' to '+[x,d]+' ended at '+await where(),{cause:e});}
    finally{await p.keyboard.up('w');}
    assert.ok(Math.abs((await where())[2])<.08,'level queue floor');
  }
  async function high(key,min){await p.waitForFunction(([n,min])=>
    (__world.K.scene.getObjectByName('젤라띠 · '+n)?.children[0]?.geometry.index?.count??0)>3*min,[names[key],min],{timeout:6000});}
  await pose(1,-33,0,-37);assert.deepEqual(requests,[],'remote cold');
  await pose(0,6.35,0,2.0);assert.deepEqual(requests,[],'behind the tile wall');
  await pose(4.92,2.32,.5,2.32);assert.deepEqual(requests,[],'adjacent shop partition');
  await pose(0,-2.8,0,-6.8);assert.deepEqual(requests,[],'looking down the gallery away from the opening');
  await pose(.3,-14,.8,1,.05);await high('brand',500);
  assert.ok(!requests.includes('serve.glb')&&!requests.includes('wells.glb')&&!requests.includes('stock-layout.js'),'brand lettering and shell only at this distance');
  await pose(-.60,-4.78,-.60,2);await walk(-.60,-2.2);await walk(-.60,.55);
  const inside=await where();assert.equal(inside[3],'젤라띠젤라띠');
  await look(-.65,1.75,-.34);await high('wells',2000);await high('bar',500);
  await look(-1.43,1.77,.44);await high('menu',1000);await high('lights',1000);
  await look(.85,4.68,.12);await high('stock',4000);await look(1.72,4.07,-.05);await high('back',700);
  await walk(1.83,.59);await look(1.84,1.273,-.60);await high('serve',1500);
  await look(2.22,1.85,-.23);await high('packs',500);await high('shell',1000);
  await look(1.83,2.17);await p.keyboard.down('w');await p.waitForTimeout(520);await p.keyboard.up('w');
  const contact=await where();assert.ok(contact[1]>.68&&contact[1]<.75,'the public handrail '+contact);
  await walk(.1,.55);await walk(-2.37,.54);await look(-2.39,1.94,-.36);
  await walk(-2.00,-2.2);assert.ok((await where())[3]!=='젤라띠젤라띠');
  await pose(0,6.35,0,2.0);
  const hidden=await p.evaluate(()=>__world.K._.details.filter(d=>d.name.startsWith('젤라띠 ')&&!d.name.includes('검은 액자')).map(d=>d.hidden));
  assert.equal(hidden.length,9);assert.ok(hidden.every(Boolean),'behind the rear after caching');
  await pose(1.84,.64,1.84,1.28,-.55);await high('serve',1500);
  await p.evaluate(()=>__world.setTimeMode('night'));
  await pose(.15,-3.3,1.63,1,.09);await high('brand',500);await high('lights',1000);
  const lit=await p.evaluate(names=>[names.brand,names.lights].every(name=>
    __world.K.scene.getObjectByName('젤라띠 · '+name)?.children[0].material.isMeshBasicMaterial),names);
  assert.ok(lit,'the sign and pendant glass retain their light at night');
  assert.deepEqual(requests.toSorted(),[...Object.keys(names).map(n=>n+'.glb'),'stock-layout.js'].sort());
  assert.deepEqual([...errors,...await p.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({farCold:0,opaqueCold:0,behindCameraCold:0,warmRearHidden:hidden.length,downloads:requests,inside,rail:contact}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
