// Walk into both public storefronts and verify actual geometry, visibility and the mirror’s seated ray projection.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {compareDeckFrame} from '../../../tests/deck-frame-pair.mjs';
import {footprint} from '../gotomall-yogurtworld/layout.js';
import {parts} from './layout.js';
import sharp from 'sharp';
const floor=-6,len=Math.hypot(1,.3745),du=[1/len,-.3745/len],dv=[-du[1],du[0]],{front,mid}=footprint;
const point=(x,d)=>[(front-d)*du[0]+(mid+x)*dv[0],-126.3+(front-d)*du[1]+(mid+x)*dv[1]];
const local=(x,z)=>[x*dv[0]+(z+126.3)*dv[1]-mid,front-x*du[0]-(z+126.3)*du[1]];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),files=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{
    if(r.url().includes('/gotomall-west-corner/')&&/\.(glb|webp)$/.test(r.url()))files.push(r.url().split('/').pop());
  });
  const [xx,zz]=point(12,-27);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+[xx,floor,zz,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0){
    const [a,b]=point(x,d),[c,e]=point(tx,td);
    await page.evaluate(([x,z,r,p])=>{__world.player.teleport(x,-6,z,r);__world.player.pitch=p;},[a,b,Math.atan2(a-c,b-e),pitch]);
    await page.waitForTimeout(380);
  }
  async function look(x,d,pitch=0){await page.evaluate(([x,z,p])=>{const v=__world.player;v.yaw=Math.atan2(v.x-x,v.z-z);v.pitch=p;},[...point(x,d),pitch]);}
  async function here(){const [x,z,y,n]=await page.evaluate(()=>{const w=__world,p=w.player;return[p.x,p.z,p.y,w.phys.zoneAt(p.x,p.y+.12,p.z)?.name];});return [...local(x,z),y,n];}
  async function walk(x,d){
    await look(x,d);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>{const p=__world.player;if(Math.hypot(p.x-x,p.z-z)<.125)return true;p.yaw=Math.atan2(p.x-x,p.z-z);return false;},point(x,d),{timeout:5600});}
    catch(error){throw Error('Could not walk to '+[x,d]+' from current position '+await here(),{cause:error});}
    finally{await page.keyboard.up('w');}
    const pos=await here();assert.ok(Math.abs(floor-pos[2])<.033,'continuous B1 floor '+pos);return pos;
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
  // All nearby stores are opaque from the cafe's principal room or from their rear.
  await pose(.12,2.1,-4.1,2.1);await pose(6.9,3.72,6.95,2.40);await pose(-4.2,-3.1,-4.2,-8);
  assert.deepEqual(files,[]);
  await pose(-4.15,-13,-4.23,.01,.065);await high('banSign',1400);
  assert.ok(!files.some(k=>/coats|shades|bins|trays|samples|booth|mirror/.test(k)),'distant camera loads only the two frontages it can see');
  await pose(-4.23,-1.65,-4.18,2.12);
  await walk(-4.24,.58);const ban=await here();assert.equal(ban[3],'반에반 고투몰점');
  await look(-2.93,-.02,-.24);await high('coats',3500);await look(-5.50,.83,.05);await high('shades',1400);
  await look(-5.43,.09,-.43);await high('trays',1900);
  await walk(-4.24,1.80);await look(-3.35,1.91,-.48);await high('bins',1600);await high('banShell',1400);
  await walk(-4.25,3.32);const banBack=await contact(-4.24,4.65,560);assert.ok(banBack[1]>3.63&&banBack[1]<3.88,'rear stock wall '+banBack);
  await walk(-4.25,1.49);await walk(-4.25,-1.34);
  // Continue from G-011 to G-013 through the mall. The centre of the studio entrance stays clear.
  await walk(3.66,-1.34);await walk(6.17,-1.34);
  await look(7.94,-.065,.12);await high('photoSign',1500);await look(6.38,2.72,-.04);await high('photoRoom',1600);
  await walk(6.17,.49);const hama=await here();assert.equal(hama[3],'셀프사진');
  await look(6.85,2.87,-.11);await high('mirror',400);
  await page.waitForFunction(()=>{let loaded=false;__world.scene.traverse(o=>{if(o.name.includes('매장 내부가 비치는')&&o.material?.uniforms?.ready?.value===1)loaded=true;});return loaded;});
  async function mirrorPixels(x,d){
    await pose(x,d,6.87,2.89,-.18);await page.waitForTimeout(200);
    const [width,height]=[1000,640];
    const uv=await page.evaluate(([x,z])=>{const v=__world.camera.position.clone().set(x,-6+1.14,z).project(__world.camera);return[v.x,v.y];},point(6.87,2.89));
    return await sharp(await page.screenshot()).extract({left:Math.round((uv[0]+1)*width/2)-9,top:Math.round((1-uv[1])*height/2)-20,width:18,height:40}).removeAlpha().raw().toBuffer();
  }
  const first=await mirrorPixels(6.39,1.744),second=await mirrorPixels(6.94,1.54);
  const mirrorDelta=first.reduce((s,c,i)=>s+Math.abs(c-second[i]),0)/first.length;
  assert.ok(mirrorDelta>5,'mirror view changes with a lateral step '+mirrorDelta);
  await walk(6.46,.53);await walk(7.24,.55);
  await look(8.26,1.04,-.16);await high('samples',90);await walk(7.24,1.54);
  await look(8.10,1.94,-.17);await high('booth',2000);
  await walk(8.10,1.45);const cameraContact=await contact(8.10,2.40,610);
  assert.ok(cameraContact[1]>1.50&&cameraContact[1]<1.64,'solid photo machine '+cameraContact);
  await walk(7.23,1.47);await walk(7.24,.59);await walk(6.17,.49);await walk(6.17,-1.12);const hall=await here();assert.match(hall[3],/서편/);
  await pose(.10,2.2,-4.23,2.10);await page.waitForTimeout(300);
  const opaque=await page.evaluate(names=>__world.K._.details.filter(group=>names.includes(group.name)&&!group.hidden).map(group=>group.name),
    Object.entries(parts).filter(([key])=>!['banShell','photoRoom'].includes(key)).map(([,v])=>v[0]));
  assert.deepEqual(opaque,[]);assert.deepEqual(errors,[]);assert.equal(new Set(files).size,files.length);
  for(const key of Object.keys(parts))if(key!=='mirrorGlass')assert.ok(files.includes(key+'.glb'),key);
  assert.ok(files.includes('mirror-room.webp'));
  const views=[
    ['반에반',[
      ['hall',-4.24,-1.35,-4.24,2.1],['rear',-4.24,2.9,-4.24,4.9],
      ['side',-4.24,2.1,-1.35,2.1],['opening',-4.24,2.1,-4.24,-3]]],
    ['셀프사진',[
      ['hall',6.17,-1.35,6.17,2.1],['mirror',6.17,1.30,6.87,2.95],
      ['side',6.17,1.30,4.88,1.30],['opening',6.17,1.30,6.17,-2.3]]],
  ];
  for(const light of ['day','night']){
    await page.evaluate(light=>__world.setTimeMode(light),light);
    for(const [shop,angles] of views){
      for(const [label,x,d,tx,td] of angles){
        await pose(x,d,tx,td);
        const pair=await page.evaluate(compareDeckFrame,'walls');
        assert.equal(pair.different,0,shop+' '+light+' '+label+' changed visible pixels');
        if(label==='hall')assert.deepEqual(pair.before,pair.after,shop+' hall should stay open');
        if(label==='side')assert.ok(pair.after[1]<pair.before[1],shop+' side wall should hide remote geometry');
        console.log(JSON.stringify({shop,light,label,before:pair.before,after:pair.after,different:pair.different}));
      }
    }
  }
  console.log(JSON.stringify({cold:0,ban,banBack,hama,cameraContact,hall,mirrorDelta,files}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
