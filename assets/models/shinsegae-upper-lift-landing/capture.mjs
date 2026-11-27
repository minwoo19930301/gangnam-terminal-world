// Capture the production lift calls from the dedicated department-store page.
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

if(!process.argv[2])throw Error('Expected an output JSON filename');
const server=await serve(),browser=await chromium.launch({channel:'chromium',headless:true});
try{
  const page=await browser.newPage();
  await page.route('**/capture-page',route=>route.fulfill({contentType:'text/html',body:
    '<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>'}));
  await page.goto('http://127.0.0.1:'+server.address().port+'/capture-page');
  const packet=await page.evaluate(async()=>{
    const T=await import('three'),{createKit}=await import('/js/kit.js'),{createPhysics}=await import('/js/physics.js');
    const {installRelief}=await import('/js/banpo_relief.js'),{captureGroups}=await import('/assets/models/geometry-capture/batches.js');
    const {build,meta}=await import('/js/places/shinsegae.js');
    const osm=await (await fetch('/data/osm.json')).json();
    installRelief(T,false);
    function kit(keep){
      const k=createKit(T,new T.Scene(),{osm,phys:createPhysics(),keep,maxTex:1024});
      k._.setCurrent(meta.id,meta);k.onNight=()=>{};return k;
    }
    const main=kit(()=>false),floors={},images={};
    main.recordMainLiftReturns=(floor,[x,z],y,returns,top,finish)=>{
      const groups=new Map(),frame=new T.Matrix4().makeTranslation(x,y,z).toArray();
      returns.forEach(([a,b],i)=>{
        const k=kit();k.wall(...a,...b,y,top,finish);groups.set(floor+' · 복원 벽 '+(i+1),k);
      });
      floors[floor]={groups,frame,wallCount:returns.length};
    };
    const original=main.elevator;
    main.elevator=o=>{
      const car=/^신세계 고객 엘리베이터 \(본관 화장실 옆 ([12])호기\)$/.exec(o.name);
      const floor=o.floors.length===1?floors[o.floors[0].label]:null;
      if(car&&floor){
        const k=kit();
        k.elevator(o);
        floor.groups.set(o.floors[0].label+' · '+car[1]+'호기',k);
      }
      return original(o);
    };
    build(main);
    const result={};
    for(const id of Object.keys(floors).sort((a,b)=>parseInt(a)-parseInt(b))){
      const {groups,frame,wallCount}=floors[id];
      if(!wallCount||groups.size!==wallCount+2)throw Error(id+' requires two cars and the registered return walls');
      result[id]={frame,wallCount,pieces:captureGroups(groups,images)};
    }
    return {floors:result,images};
  });
  await writeFile(process.argv[2],JSON.stringify(packet));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
