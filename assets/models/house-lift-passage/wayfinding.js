import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {makeCanvas,FONT} from '../../../js/textures.js';

// The sheet has two independently readable faces. The lowest row is reserved
// for the bronze body and brighter bevels so the whole fixture is one draw.
const H=384,W=768;
const finish={bronze:[18,369],edge:[42,369],stem:[66,369]};

export function paintHouseLiftSign(canvas){
  const g=canvas.getContext('2d');
  g.fillStyle='#514537';g.fillRect(0,0,W,H);
  for(const [i,title,sub] of [[0,'하우스 전용 승강기','HOUSE OF SHINSEGAE   ·   1F / 1M'],
                               [1,'호텔 로비 · 부티크','JW MARRIOTT HOTEL SEOUL']]){
    const top=i*174;
    g.fillStyle='#473c31';g.fillRect(3,top+3,762,168);
    g.strokeStyle='#b8a281';g.lineWidth=3;g.strokeRect(11,top+11,746,152);
    g.fillStyle='#f5e8cd';g.font='600 58px '+FONT;g.textBaseline='middle';
    g.fillText(title,44,top+73);
    g.fillStyle='#e5d3b4';g.font='500 23px '+FONT;g.fillText(sub,47,top+128);
    g.strokeStyle='#e4d1ac';g.lineWidth=5;g.lineJoin='round';g.beginPath();
    if(i===0){
      g.strokeRect(661,top+69,56,58);
      g.beginPath();g.moveTo(675,top+56);g.lineTo(675,top+31);g.moveTo(666,top+41);g.lineTo(675,top+31);g.lineTo(684,top+41);
      g.moveTo(704,top+31);g.lineTo(704,top+56);g.lineTo(695,top+46);g.moveTo(704,top+56);g.lineTo(713,top+46);
      g.moveTo(689,top+73);g.lineTo(689,top+124);
    }else{
      g.moveTo(689,top+119);g.lineTo(689,top+56);g.moveTo(669,top+77);g.lineTo(689,top+56);g.lineTo(709,top+77);
    }
    g.stroke();
  }
  for(const [name,color] of Object.entries({bronze:'#6b5743',edge:'#ae9471',stem:'#675d50'})){
    const [x,y]=finish[name];g.fillStyle=color;g.fillRect(x-9,y-9,18,18);
  }
}

export function houseSignParts(T){
  const parts=[];
  function box(name,x,y,z,w,h,d,color,faces=false){
    const g=new T.BoxGeometry(w,h,d);
    const uv=g.getAttribute('uv');
    for(const group of g.groups){
      const index=group.materialIndex;
      const vertices=new Set();
      for(let i=0;i<group.count;i++)vertices.add(g.index.getX(group.start+i));
      for(const vertex of vertices){
        const u=uv.getX(vertex),v=uv.getY(vertex);
        if(faces&&index>=4){
          const row=index===5?0:1;
          uv.setXY(vertex,(3+u*762)/W,1-(row*174+3+(1-v)*168)/H);
        }else{const [px,py]=finish[color];uv.setXY(vertex,px/W,1-py/H);}
      }
    }
    g.translate(x,y,z);parts.push({name,geometry:g});
  }
  box('양면 안내판',0,2.59,0,1.57,.35,.067,'bronze',true);
  for(const y of [2.413,2.767])box('황동 가장자리',0,y,0,1.58,.012,.074,'edge');
  for(const x of [-.55,.55]){
    box('천장 고정봉',x,3.10,0,.014,.66,.014,'stem');
    box('천장 받침',x,3.441,0,.081,.026,.049,'bronze');
  }
  return parts;
}

export function placeHouseLiftSign(K,x,y,z,angle){
  const T=K.THREE;
  const canvas=makeCanvas(W,H);paintHouseLiftSign(canvas);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const pieces=houseSignParts(T).map(row=>row.geometry),geometry=mergeGeometries(pieces);
  for(const piece of pieces)piece.dispose();
  const material=new T.MeshLambertMaterial({map:texture,emissive:0xffffff,emissiveMap:texture,emissiveIntensity:.24});
  const screen=new T.Mesh(geometry,material);screen.name='하우스 전용 승강기 · 양면 길안내';
  screen.position.set(x,y,z);screen.rotation.y=angle;K.addMesh(screen);
}
