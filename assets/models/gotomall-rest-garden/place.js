import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let shapes;
function furniture(T){
  if(shapes)return shapes;
  function curvedSeat(){
    const xyz=[],colors=[],indices=[];
    function sweep(rings,a0,a1,steps,tone){
      const start=xyz.length/3,n=rings.length,c=new T.Color(tone);
      for(let j=0;j<=steps;j++){
        const a=a0+(a1-a0)*j/steps;
        for(const [w,d,y] of rings){
          xyz.push(w*Math.cos(a),y,d*Math.sin(a));colors.push(c.r,c.g,c.b);
        }
      }
      for(let j=0;j<steps;j++)for(let k=0;k<n;k++){
        const p=start+j*n+k,q=start+j*n+(k+1)%n;
        indices.push(p,q,p+n,q,q+n,p+n);
      }
      if(a1-a0<Math.PI*2-.01)for(let k=1;k<n-1;k++){
        const end=start+steps*n;
        indices.push(start,start+k+1,start+k,end,end+k,end+k+1);
      }
    }
    sweep([[3.38,1.02,.64],[3.38,1.02,.87],[3.55,1.20,.87],[3.55,1.20,.08]],0,Math.PI*2,32,0xe5ded0);
    sweep([[3.53,1.18,.15],[4.15,1.82,.15],[4.15,1.82,.43],[4.10,1.77,.453],[3.53,1.18,.453]],
      Math.PI,Math.PI*2,22,0xe6dfd3);
    sweep([[3.52,1.18,.025],[3.98,1.65,.025],[4.00,1.67,.16],[3.52,1.18,.16]],Math.PI,Math.PI*2,19,0x938676);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
    g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
    return g;
  }
  const leaves=[];
  function foliage(x,y,d,w,h,depth,tone,angle=0){
    const g=new T.IcosahedronGeometry(1,0);
    g.scale(w,h,depth);g.rotateY(angle);g.translate(x,y,d);
    g.deleteAttribute('uv');
    const c=new T.Color(tone),val=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<val.length;i+=3)c.toArray(val,i);
    g.setAttribute('color',new T.BufferAttribute(val,3));leaves.push(g);
  }
  for(const [i,x] of [-2.46,-1.60,-.74,.10,.85,1.62,2.40].entries()){
    foliage(x,1.15,.1,.64,.405,.53,i%2?0x536d40:0x3f5d3c,i*.44);
    foliage(x-.15,1.03,-.22,.43,.25,.34,i%2?0x648046:0x527047,i*.78);
  }
  for(const [i,x] of [-2.54,-1.36,.2,1.70,2.65].entries())
    foliage(x,.86,-.17,.43,.26,.35,0xa5a591,i*.62);
  const planting=mergeGeometries(leaves);
  leaves.forEach(g=>g.dispose());
  const pram=[
    [0,.21,-.03,.40,.12,.43,0x394750],[0,.44,-.075,.40,.059,.33,0x57616a],
    [0,.50,.14,.38,.35,.065,0x505b63,.44],[0,.89,.10,.42,.088,.38,0x34464e],
    [0,.97,.39,.43,.045,.048,0x444742],[0,.31,-.31,.32,.045,.10,0x454747],
  ];
  for(const x of [-.266,.266]){
    pram.push([x,.025,.29,.065,.24,.24,0x383a39],[x,.025,-.31,.059,.159,.16,0x393b3a],
      [x,.18,-.013,.038,.57,.038,0x969c98,.51],[x,.17,.12,.037,.59,.037,0x969c98,-.52]);
  }
  shapes={seat:curvedSeat(),planting,stroller:boxSilhouette(T,pram),
    paint:new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})};
  return shapes;
}

export function placeGardenFixture(K,kind,P,angle,y){
  const f=furniture(K.THREE);
  const [label,u,v,enter,exit,eye]={
    seat:['흰 곡면 화단 벤치',16.1,10.15,11,14,1.05],
    planting:['수경 화단의 바위와 늘어진 잎',16.1,10.15,10,13,1.15],
    stroller:['휴게광장 접이식 유아차',7.8,5.1,7,9,.82]
  }[kind];
  const [x,z]=P(u,v);
  return placeSingleDetail(K,{name:'고투몰 · '+label,file:'../gotomall-rest-garden/'+kind+'.glb',at:[x,y,z],angle,
    fallback:f[kind],material:f.paint,fallbackMaterial:f.paint,range:enter,exitRange:exit,floorTolerance:2.45,eyeHeight:eye});
}
