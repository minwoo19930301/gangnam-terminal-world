// Capture the rendered game primitives, including the same sign atlas and terrain offsets.
import {writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {garagePlacement} from './placement.mjs';
import {serve} from '../../../tests/serve.mjs';

const output=process.argv[2];
if(!output)throw Error('Usage: node capture.mjs /tmp/ramp.json');
const server=await serve();
const browser=await chromium.launch({channel:'chromium',headless:true});
try{
  const page=await browser.newPage();
  await page.route('**/capture-page',route=>route.fulfill({contentType:'text/html',
    body:'<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>'}));
  await page.goto('http://127.0.0.1:'+server.address().port+'/capture-page');
  const packet=await page.evaluate(async(verify)=>{
    const THREE=await import('three');
    const {createKit}=await import('/js/kit.js'),{createPhysics}=await import('/js/physics.js');
    const {installRelief}=await import('/js/banpo_relief.js');
    const {gardenStation,hotelCourtDatum}=await import('/js/places/_gardenGrade.js');
    const {buildFamilleGarageEntry}=await import('/js/places/_familleGarageEntry.js');
    installRelief(THREE,true);
    const groups=new Map(),images={};
    let surface=null;
    function emit(name,method,args){
      if(!groups.has(name))groups.set(name,createKit(THREE,new THREE.Scene(),{osm:{},phys:createPhysics(),maxTex:1024}));
      const kit=groups.get(name);
      kit.withTerrainSurface(surface,()=>kit[method](...args));
    }
    buildFamilleGarageEntry({
      withTerrainSurface(next,draw){
        // The separate outer court and hotel plaque belong to the neighbouring gardens.
        if(surface===null&&next===hotelCourtDatum)return;
        const prior=surface;
        surface=next;
        try{draw();}finally{surface=prior;}
      },
      zone(){},phys:{addCeiling(){}},
      slab(...args){emit('주행면','slab',args);},
      wall(...args){emit('측벽','wall',args);},
      sign(...args){emit('진입 표지','sign',args);},
      box(o){
        const name=o.mat?.tex==='emit'?'천장 등기구':o.d===.35&&o.h===.13?'중앙분리대':'포털과 기둥';
        emit(name,'box',[o]);
      },
      hpoly(mat,points,...rest){
        let name=rest[1]===false?'천장':'노면 띠';
        if(mat===0xe7e5dc){
          const along=gardenStation(...points[1])-gardenStation(...points[0]);
          name=along>0?'하행 화살표':'상행 화살표';
        }
        emit(name,'hpoly',[mat,points,...rest]);
      },
    });
    const {captureGroups}=await import('/assets/models/geometry-capture/batches.js');
    const pieces=captureGroups(groups,images);
    if(verify){
      // Construct the untouched game function a second time, including its adjoining garden.
      // Every exported oriented triangle must exist in this independent full render.
      const full=createKit(THREE,new THREE.Scene(),{osm:{},phys:createPhysics(),maxTex:1024});
      buildFamilleGarageEntry(full);
      const faces=new Map();
      const key=vertices=>vertices.map(v=>v.join(',')).join('/');
      for(const mesh of full._.finalize()){
        const g=mesh.geometry,p=g.attributes.position;
        for(let i=0;i<g.index.count;i+=3){
          const f=[0,1,2].map(offset=>{
            const j=g.index.getX(i+offset);
            return [p.getX(j),-p.getZ(j),p.getY(j)];
          });
          const id=key(f);faces.set(id,(faces.get(id)??0)+1);
        }
      }
      for(const part of pieces){
        for(let i=0;i<part.indices.length;i+=3){
          const id=key(part.indices.slice(i,i+3).map(v=>part.vertices[v]));
          if(!faces.get(id))throw Error('Missing live game triangle: '+part.name);
          faces.set(id,faces.get(id)-1);
        }
      }
    }
    return {pieces,images};
  },process.argv.includes('--verify'));
  await writeFile(output,JSON.stringify({...packet,frame:garagePlacement.matrix}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
