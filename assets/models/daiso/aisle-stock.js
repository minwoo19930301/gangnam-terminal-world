// A shelf-length strip retains the colours, labels and gaps of the full individual packages.
const colors=['#f5f5f0','#f06aa0','#d8272d','#2a7fd4','#48ac9d','#f2c200','#b9dfed'];
const bins=140,binWidth=12,key='daiso-boxes-and-jars';
const prepared=new WeakSet();
function stockTexture(K){
  if(prepared.has(K))return;
  const sample=K.T.custom(key,bins*binWidth,48,(g,w,h)=>{
    g.fillStyle='#fff';g.fillRect(0,41,w,7);
    for(let i=0;i<bins;i++){
      const x=i*binWidth,kind=i%5;
      if(kind===0){
        g.fillStyle='#f1ecdf';g.fillRect(x+1,8,10,30);
        g.fillStyle='#b59b72';g.fillRect(x+1,5,10,4);
      }else if(kind===1){
        g.fillStyle='#bfa37c';g.fillRect(x+1,10,10,28);
        g.fillStyle='#e1c89e';for(const y of [17,24,31])g.fillRect(x+1,y,10,1);
      }else{
        g.fillStyle=colors[Math.floor(i/4)%7];g.fillRect(x+1,8-(i%3)*3,10,30+(i%3)*3);
      }
      g.fillStyle='#f4f3ed';g.fillRect(x+3,19,6,10);
    }
  });
  // alphaTest keeps transparent inter-package gaps without a second blend/depth pass.
  K.material(key,new K.THREE.MeshLambertMaterial({map:sample.tex,vertexColors:true,alphaTest:.35}));
  prepared.add(K);
}
const whiteUV=[[.5,.065],[.5,.065],[.5,.065],[.5,.065]];
export function drawAisleFaces(K,{W,A,B},u,v,len,idx,y,stock,displayEnd){
  stockTexture(K);
  const count=Math.floor(len/.23),first=v-len/2+.035,stop=first+count*.23;
  const point=(u,v,h)=>{const [x,z]=W(u,v);return[x,h,z]};
  function solid(color,points,normal){K.quad({tex:key,color},points,normal,whiteUV);}
  function plank(u,v,h,width,depth,height,color){
    const a=u-width/2,b=u+width/2,c=v-depth/2,d=v+depth/2;
    const lo=[point(a,c,h),point(b,c,h),point(b,d,h),point(a,d,h)],hi=lo.map(([x,y,z])=>[x,y+height,z]);
    solid(color,hi,[0,1,0]);solid(color,lo,[0,-1,0]);
    for(const [i,j,axis,sign] of [[0,1,B,-1],[1,2,A,1],[2,3,B,1],[3,0,A,-1]])
      solid(color,[lo[i],lo[j],hi[j],hi[i]],[sign*axis[0],0,sign*axis[1]]);
  }
  for(let tier=0;tier<5;tier++){
    const ty=y+.16+tier*.36;
    plank(u,v,ty,1.1,len,.04,0xf2f2f2);
    const phase=(116*(idx+tier))%bins;
    for(const side of [-1,1]){
      plank(u+side*.54,v,ty+.045,.02,len,.06,0xf5c9d8);
      const [x0,z0]=W(u+side*.515,first),[x1,z1]=W(u+side*.515,stop);
      const bottom=ty+.043,top=ty+.325;
      K.quad(key,[[x0,bottom,z0],[x1,bottom,z1],[x1,top,z1],[x0,top,z0]],
        [side*A[0],0,side*A[1]],[[phase/bins,8/48],[(phase+count)/bins,8/48],[(phase+count)/bins,1],[phase/bins,1]]);
      for(let n=0;n<count;n++){
        const vv=first+(n+.5)*.23,kind=(idx+tier+n)%5;
        const col=kind===0?0xb59b72:kind===1?0xbfa37c:stock[(idx+tier+Math.floor(n/4))%stock.length];
        const topY=ty+(kind===0?.285:kind===1?.25:.25+(n%3)*.025);
        const half=kind===0?.094:.20,internal=u+side*.30;
        solid(col,[point(internal-half,vv-.093,topY),point(internal+half,vv-.093,topY),
          point(internal+half,vv+.093,topY),point(internal-half,vv+.093,topY)],[0,1,0]);
      }
    }
  }
  for(const end of [-1,1]){
    if(end===displayEnd)continue;
    const vv=v+end*(len/2+.04),normal=[end*B[0],0,end*B[1]];
    for(let t=0;t<4;t++){
      const h=y+.3+t*.36;
      plank(u,vv,h-.08,1.03,.055,.055,0xe7cd54);
      for(let i=0;i<4;i++){
        const center=u-.38+i*.25;
        plank(center,vv,h,.18,.065,.23,stock[(i+t+idx)%stock.length]);
        const faceV=vv+end*.048;
        solid(0xf5f1e7,[point(center-.065,faceV,h+.03),point(center+.065,faceV,h+.03),
          point(center+.065,faceV,h+.14),point(center-.065,faceV,h+.14)],normal);
      }
    }
  }
}
