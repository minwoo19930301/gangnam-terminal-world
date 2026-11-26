// Public map results for the terminal hall, House lift aprons and the restaurant passage.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const cases=[
  ['호남선 대합실','표사는 곳 · 승차홈 · 스위트 파크 연결','1F',0,12],
  ['하우스 오브 신세계','와인셀러 · 레스토랑','1F',-1,10],
  ['하우스 오브 신세계','아트 앤 라이프 · 카페','1M',-1,10],
  ['하우스 오브 신세계 입구','센트럴시티 중앙홀 · 윤해운대갈비','1F',1,3],
  ['하우스 오브 신세계 입구','센트럴시티 중앙홀 · 윤해운대갈비','1F',3,10],
];
const server=await serve();
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:720,height:438}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0#/centralcity/1F');
  await page.waitForFunction(()=>window.__world?.ready);
  await page.locator('#start').click();
  for(const [name,sub,floor,index,minimumSightline] of cases){
    await page.keyboard.press('m');
    await page.locator('#map-search').fill(sub);
    const rows=page.locator('.gt-result').filter({has:page.getByText(name,{exact:true})})
      .filter({has:page.getByText(floor+' · '+sub,{exact:true})});
    await rows.nth(index).click();
    await page.locator('.gt-teleport').click();
    await page.waitForFunction(({name,floor})=>{
      const w=window.__world,p=w.player,zone=w.phys.zoneAt(p.x,p.y+.1,p.z);
      return !w.map.isOpen()&&zone?.name===name&&zone.floor===floor;
    },{name,floor});
    await page.waitForFunction(()=>Math.abs(__world.camera.rotation.y-__world.player.yaw)<.001);
    const state=await page.evaluate(async()=>{
      const {camera,scene,player}=__world,T=await import('three'),r=new T.Raycaster();
      r.setFromCamera({x:0,y:0},camera);
      const hit=r.intersectObjects(scene.children,true).find(h=>{
        for(let o=h.object;o;o=o.parent)if(!o.visible)return false;
        return true;
      });
      return {x:player.x,z:player.z,y:player.y,yaw:player.yaw,sightline:hit?.distance??0};
    });
    assert.ok(state.sightline>minimumSightline,name+' '+floor+' faces an obstruction '+JSON.stringify(state));
    await page.keyboard.down('w');
    try{
      await page.waitForFunction(({x,y,z})=>{
        const p=__world.player;
        return Math.abs(p.y-y)<.25&&Math.hypot(p.x-x,p.z-z)>1;
      },state,{timeout:2500});
    }finally{await page.keyboard.up('w');}
    console.log(name,floor,state.y.toFixed(2),state.sightline.toFixed(2));
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
