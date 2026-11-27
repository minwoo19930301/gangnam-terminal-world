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
    const groups=new Map(),images={},pieces=[];
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
    for(const [name,kit] of groups){
      for(const mesh of kit._.finalize()){
        const g=mesh.geometry,{position,uv,color}=g.attributes;
        const vertices=[],uvs=[],colors=[];
        const image=mesh.material.map?.image;
        let texture=null;
        let u0=0,v0=0,us=1,vs=1;
        if(image?.getContext){
          let canvas=image;
          if(name==='진입 표지'){
            const u=[],v=[];
            for(let i=0;i<uv.count;i++){u.push(uv.getX(i));v.push(uv.getY(i));}
            u0=Math.min(...u);v0=Math.min(...v);us=Math.max(...u)-u0;vs=Math.max(...v)-v0;
            canvas=document.createElement('canvas');
            canvas.width=Math.round(image.width*us);canvas.height=Math.round(image.height*vs);
            canvas.getContext('2d').drawImage(image,u0*image.width,(1-v0-vs)*image.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
          }
          const data=canvas.toDataURL('image/png');
          texture=Object.keys(images).find(key=>images[key]===data)??'surface-'+Object.keys(images).length;
          images[texture]=data;
        }
        for(let i=0;i<position.count;i++){
          vertices.push([position.getX(i),-position.getZ(i),position.getY(i)]);
          uvs.push([(uv.getX(i)-u0)/us,(uv.getY(i)-v0)/vs]);
          colors.push(color?[color.getX(i),color.getY(i),color.getZ(i)]:[1,1,1]);
        }
        pieces.push({name,texture,vertices,uvs,colors,indices:Array.from(g.index.array)});
      }
    }
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
