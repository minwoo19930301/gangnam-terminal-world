// Verify public restaurant walking, geometry, on-demand textures, reflection parallax and the court wall cut.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import sharp from 'sharp';
import {serve} from '../../../tests/serve.mjs';
import {upperPoint as P,FA,FB} from '../../../js/places/_familleUpperPlan.js';
import {compareDeckFrame} from '../../../tests/deck-frame-pair.mjs';
import {parts,bay} from './layout.js';
const floor=5,point=(x,d)=>P(bay.mid+x,bay.front-d);
const local=(x,z)=>[-(x-29)*FA+(z-144)*FB-bay.mid,bay.front-((x-29)*FB+(z-144)*FA)];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),files=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{
    if(r.url().includes('/char-dining/')&&/\.(glb|webp)$/.test(r.url()))files.push(r.url().split('/').pop());
  });
  const [xx,zz]=point(19.15,-1.99);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/2F?p='+[xx,floor,zz,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0){
    const [a,b]=point(x,d),[c,e]=point(tx,td);
    await page.evaluate(([x,z,r,p])=>{__world.player.teleport(x,5,z,r);__world.player.pitch=p;},[a,b,Math.atan2(a-c,b-e),pitch]);
    await page.waitForTimeout(380);
  }
  async function look(x,d,pitch=0){await page.evaluate(([x,z,p])=>{const v=__world.player;v.yaw=Math.atan2(v.x-x,v.z-z);v.pitch=p;},[...point(x,d),pitch]);}
  async function here(){const [x,z,y,n]=await page.evaluate(()=>{const w=__world,p=w.player;return[p.x,p.z,p.y,w.phys.zoneAt(p.x,p.y+.12,p.z)?.name];});return [...local(x,z),y,n];}
  async function walk(x,d){
    await look(x,d);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>{const p=__world.player;if(Math.hypot(p.x-x,p.z-z)<.125)return true;p.yaw=Math.atan2(p.x-x,p.z-z);return false;},point(x,d),{timeout:5600});}
    catch(error){throw Error('Could not walk to '+[x,d]+' from current position '+await here(),{cause:error});}
    finally{await page.keyboard.up('w');}
    const pos=await here();assert.ok(Math.abs(floor-pos[2])<.033,'continuous 2F floor '+pos);return pos;
  }

  async function high(key,min){
    try{await page.waitForFunction(([name,min])=>{let ok=false;__world.scene.traverse(o=>{if(o.name===name){
      const n=o.children[0]?.geometry?.index?.count??0;if(n>=min*3)ok=true;
    }});return ok;},[parts[key][0],min],{timeout:4500});}
    catch(e){throw Error('No detailed '+key+' at '+await here(),{cause:e});}
  }
  async function contact(x,d,time){
    await look(x,d);await page.keyboard.down('w');await page.waitForTimeout(time);await page.keyboard.up('w');return await here();
  }
  await pose(.02,6.85,0,3.10);await pose(-7.09,3.32,-2.65,3.15);await pose(-2.64,-2.07,-2.66,-5.94);
  assert.deepEqual(files,[],'no downloads from the opaque walls or facing away');
  await pose(-3.28,-2.46,-2.66,.13,.28);await high('sign',750);
  assert.ok(!files.some(v=>/mala|rice|eggplant|reflections/.test(v)),'meals and mirror at the public approach');
  await pose(-2.66,-1.28,-2.66,1.67);await walk(-2.65,.47);const entrance=await here();assert.equal(entrance[3],'차알 파미에스테이션점');
  await look(-.86,.57,-.05);await high('host',1400);await walk(-2.64,2.23);
  await look(-4.41,2.45,-.55);await high('eggplant',5700);await look(-6.02,3.18,.10);await high('art',2000);await high('seat',4200);await high('granite',12);
  const stone=await page.evaluate(n=>{let map;__world.scene.traverse(o=>{if(o.name===n){const t=o.children[0]?.material?.map;if(t)map=[t.image.width,t.image.height];}});return map;},parts.granite[0]);assert.deepEqual(stone,[384,224]);
  await look(-4.47,2.67,-.37);await high('setting',1900);await look(-3.94,2.81,.62);await high('lamp',1950);
  await walk(-.23,2.25);await look(1.17,2.35,-.55);await high('mala',9000);await high('rice',9900);
  // The former retaining face cut across this sightline. The near intersection must be the granite tabletop.
  const closest=await page.evaluate(([a,b,c,d])=>{const w=__world,T=w.K.THREE,r=new T.Raycaster(),origin=new T.Vector3(a,6.63,b),target=new T.Vector3(c,5.773,d);r.set(origin,target.sub(origin).normalize());r.far=2.3;const objects=[];w.scene.traverseVisible(o=>{if(o.isMesh)objects.push(o);});return r.intersectObjects(objects,false)[0]?.object.parent.name;},[...point(-.22,2.37),...point(1.42,2.54)]);
  assert.equal(closest,parts.granite[0],'the previously crossing court wall must leave the tabletop fully visible');
  await walk(-.36,1.58);await walk(.53,1.52);await walk(.65,1.19);await walk(2.63,1.19);await walk(2.69,2.26);
  const aisle=await here();await look(1.74,2.53,-.54);await high('rice',9900);await look(-.16,5.73,.09);await high('room',5000);
  await page.waitForFunction(n=>{let ready=false;__world.scene.traverse(o=>{if(o.name===n&&o.material?.uniforms?.ready?.value===1)ready=true;});return ready;},parts.mirrors[0]);
  async function mirrorSample(x,d){
    const hx=-.40,hd=5.738,hh=2.01;await pose(x,d,hx,hd,.11);await page.waitForTimeout(190);
    const uv=await page.evaluate(([x,z,h])=>{const v=__world.camera.position.clone().set(x,5+h,z).project(__world.camera);return [v.x,v.y];},[...point(hx,hd),hh]);
    return await sharp(await page.screenshot()).extract({left:Math.round((uv[0]+1)*500)-12,top:Math.round((1-uv[1])*320)-12,width:24,height:24}).removeAlpha().raw().toBuffer();
  }
  const s1=await mirrorSample(-2.08,3.58),s2=await mirrorSample(-1.53,3.52);const mirrorChange=s1.reduce((sum,n,i)=>sum+Math.abs(n-s2[i]),0)/s1.length;
  assert.ok(mirrorChange>4,'parallax in the middle mirror '+mirrorChange);
  await pose(2.69,2.26,2.63,1.19);await walk(2.63,1.19);await walk(.65,1.19);await walk(.53,1.52);await walk(-.36,1.58);await walk(-2.64,1.58);await walk(-2.65,-1.24);const hall=await here();
  assert.equal(hall[3],'파미에스테이션 동관');
  const pairs=[],walls=[];
  for(const [label,x,d,tx,td,pitch] of [['hall',-2.63,-1.31,-2.64,.51,.17],['dining',-.22,2.37,1.42,2.54,-.31],['dish',.85,1.47,1.17,2.35,-.89],['ceiling',-.01,1.07,-.22,2.77,.61],['mirror',-2.42,4.38,-.16,5.73,.12],['facade',-3.40,-3.65,-1.12,3.10,0]]){
    await pose(x,d,tx,td,pitch);
    const row=await page.evaluate(compareDeckFrame);assert.equal(row.different,0,label+' occlusion changed RGB');pairs.push([label,row.before,row.after]);
    const wall=await page.evaluate(compareDeckFrame,'walls');assert.equal(wall.different,0,label+' wall occlusion changed RGB');walls.push([label,wall.before,wall.after]);
  }
  assert.ok(pairs.some(([,a,b])=>a[1]>b[1]));
  assert.deepEqual(walls[0][1],walls[0][2],'open public gallery keeps its whole view');
  assert.deepEqual(walls.at(-1)[1],walls.at(-1)[2],'exterior facade keeps its whole view');
  assert.ok(walls.find(([name])=>name==='mirror')[1][1]>walls.find(([name])=>name==='mirror')[2][1]);
  assert.deepEqual(errors,[]);assert.equal(new Set(files).size,files.length);
  for(const key of Object.keys(parts))assert.ok(files.includes(key==='mirrors'?'reflections.webp':key+'.glb'),key);
  assert.ok(files.includes('room-light.webp'));console.log(JSON.stringify({entrance,aisle,hall,stone,mirrorChange,files,pairs,walls}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
