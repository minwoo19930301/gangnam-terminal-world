import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

function coloredGeometry(triangles){
  const position=[],colors=[],rgb=new T.Color();
  for(const [a,b,c,tone] of triangles){
    position.push(...a,...b,...c);rgb.setHex(tone);
    for(let i=0;i<3;i++)colors.push(rgb.r,rgb.g,rgb.b);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(position,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(position.length/3*2),2));
  g.computeVertexNormals();return g;
}
export function visor(navy){
  const tris=[],band=0xe6e5df,brim=navy?0x171e33:0xe5e4de;
  function quad(a,b,c,d,tone){tris.push([a,b,c,tone],[a,c,d,tone]);}
  function ring(a,top){const f=(1+Math.cos(a))/2;return [.085*Math.sin(a),.04+.006*(1-f)+(top?.024+.041*f:0),-.091*Math.cos(a)];}
  for(let i=0;i<24;i++){
    const a=-3.02+6.04*i/24,b=-3.02+6.04*(i+1)/24;
    quad(ring(a,0),ring(a,1),ring(b,1),ring(b,0),band);
  }
  function bill(t,v){const side=Math.sin(t*Math.PI*.48),sweep=Math.cos(t*Math.PI*.48);
    return [(.080+.023*v)*side,.044-.017*v+.012*t*t-.009*t*t*v+.003*Math.cos(t*Math.PI*.90),-.015-(.075+.076*v)*sweep];}
  for(let i=0;i<18;i++){
    const a=-1+2*i/18,b=-1+2*(i+1)/18;
    quad(bill(a,0),bill(b,0),bill(b,1),bill(a,1),brim);
  }
  if(navy)for(let i=0;i<3;i++){
    const x=.020-i*.0175,h=.013+.010*i;
    quad([x,.065,-.092],[x+.014,.065,-.092],[x+.006,.065+h,-.092],[x-.008,.065+h,-.092],[0xbca9c0,0xb1c4b8,0xc1aca1][i]);
  }else for(let k=0;k<3;k++){
    const t=.04+k*.18,upper=(s,v)=>{const p=bill(s,v);p[1]+=.0008;return p;};
    quad(upper(t-.035,.24),upper(t+.035,.24),upper(t+.064,.84),upper(t-.005,.84),0xd0cfca);
  }
  return coloredGeometry(tris);
}

export function distantKnit(base,key){
  const tris=[],z=-.0526,pale=key==='ice'?0xa57885:0xdad7cb;
  function line(x,y,X,Y,width,tone){
    const len=Math.hypot(X-x,Y-y),dx=-(Y-y)*width/(2*len),dy=(X-x)*width/(2*len);
    const a=[x+dx,y+dy,z],b=[X+dx,Y+dy,z],c=[X-dx,Y-dy,z],d=[x-dx,y-dy,z];tris.push([a,b,c,tone],[a,c,d,tone]);
  }
  if(key==='puffer'){
    for(const y of [.284,.37,.464,.54])line(-.193,y,.193,y+.002,.007,0x191b1a);
    line(0,.031,0,.611,.006,0x484947);
  }else{
    for(let j=0;j<2;j++)for(let i=0;i<3;i++){
      const x=-.13+i*.13,y=.217+j*.187,w=.064,h=.090;
      line(x-w,y,x,y+h,.0062,pale);line(x,y+h,x+w,y,.0062,pale);
      line(x+w,y,x,y-h,.0062,pale);line(x,y-h,x-w,y,.0062,pale);
      tris.push([[x-.022,y+.008,z],[x,y-.012,z],[x+.022,y+.008,z],0xe0dcd1],
        [[x-.007,y,z],[x,y+.019,z],[x+.007,y,z],0xe0dcd1]);
    }
  }
  for(const x of [-.282,.282])for(const y of [.028,.050,.073])line(x-.029,y,x+.029,y,.006,pale);
  const details=coloredGeometry(tris),merged=mergeGeometries([base,details]);
  base.dispose();details.dispose();return merged;
}
