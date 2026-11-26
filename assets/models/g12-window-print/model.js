import {print} from './print.js';

// Public road side only. The original G12 wall owns the glass and collision.
export function drawG12Print(K,x,y,z,angle) {
  const {columns,rows,pitch,radius,inks,packed}=print;
  const width=columns*pitch, height=rows*pitch;
  const T=K.THREE, key='g12-public-glass-print';
  const pixels=8,bytes=atob(packed);
  K.texture(key,columns*pixels,rows*pixels,(g,W,H)=>{
    g.clearRect(0,0,W,H);
    // The three colours share one material. Subpixel gaps remain transparent.
    inks.forEach((ink,slot)=>{
      g.fillStyle='#'+ink;g.beginPath();
      for(let i=0;i<columns*rows;i++){
        if(((bytes.charCodeAt(i>>2)>>(2*(i%4)))&3)!==slot+1)continue;
        const cx=(i%columns+.5)*pixels,cy=(Math.floor(i/columns)+.5)*pixels,r=radius/pitch*pixels;
        g.moveTo(cx+r,cy);g.arc(cx,cy,r,0,2*Math.PI);
      }
      g.fill();
    });
  },[width,height],{transparent:true});
  const material=new T.MeshLambertMaterial({map:K.T.custom(key).tex,alphaTest:.23,side:T.FrontSide});
  const mesh=new T.Mesh(new T.PlaneGeometry(width,height),material);
  mesh.name='고투몰 G12 · 지상 유리 점인쇄';
  mesh.position.set(x,y,z);mesh.rotation.y=angle;
  K.addMesh(mesh);
}
