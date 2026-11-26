import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {tableRuns} from './table-layout.js';
export {tableRuns};

export function registerSalonSix(K,{P,RECT,angle,y}) {
  const T=K.THREE, [x,z]=P(-2.25,43.5),cs=Math.cos(angle),sn=Math.sin(angle);
  const interior=eye=>{
    const dx=eye.x-x,dz=eye.z-z,u=dx*cs-dz*sn,v=dx*sn+dz*cs;
    return Math.abs(u)<5.68&&v<9.9&&(v>-10 || (v>-13&&Math.abs(u)<1.25));
  };
  K.detail({name:'JW 메리어트 · 살롱 6 회의 집기',floor:'3F',
    poly:RECT(-8,33.5,3.5,53.5),y0:y,y1:y+4.68,
    visibleFrom:(x,h,z)=>h>y-.15&&h<y+3.7&&interior({x,z})},()=>{
    salonCarpet(K);
    const carpet=RECT(-8,33.5,3.5,53.5).map(([x,z])=>[x,y+.014,z]);
    K.quad('jwSalonSixCarpet',carpet,[0,1,0],[[0,1],[1,1],[1,0],[0,0]]);
    const proxy=boxSilhouette(T,[
      ...tableRuns.map(([dx,dz,w,d,h])=>[dx,.035,dz,w,h-.035,d,0x30292f]),
      [-2.51,1.12,9.74,4.07,2.57,.085,0xe8e7e5],
      ...[-2.95,2.95].map(dx=>[dx,4.05,0,1.14,.18,11,0xffefcf]),
    ]);
    const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    // Room fittings receive a stable warm interior fill. Preserve the colour of
    // the light boxes instead of letting the outdoor sun extinguish them.
    const daylight={value:1};
    K.onSolarAltitude?.(a=>{daylight.value=T.MathUtils.smoothstep(a,-7,12);});
    paint.onBeforeCompile=shader=>{
      shader.uniforms.salonDaylight=daylight;
      shader.uniforms.salonOrigin={value:new T.Vector3(x,y,z)};
      shader.uniforms.salonAxis={value:new T.Vector2(cs,sn)};
      shader.vertexShader='varying vec3 salonP; uniform vec3 salonOrigin; uniform vec2 salonAxis;\n'+
        shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
          vec3 rp=(modelMatrix*vec4(transformed,1.)).xyz-salonOrigin;
          salonP=vec3(dot(rp.xz,vec2(salonAxis.x,-salonAxis.y)),rp.y,dot(rp.xz,salonAxis.yx));`);
      shader.fragmentShader='varying vec3 salonP; uniform float salonDaylight;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
        float panel=smoothstep(.89,.98,diffuseColor.r)*smoothstep(.77,.87,diffuseColor.g);
        outgoingLight=mix(outgoingLight,diffuseColor.rgb*vec3(.94,.89,.84),.52+.46*panel);
        float glazing=step(diffuseColor.r*1.4,diffuseColor.g)*step(diffuseColor.g*1.13,diffuseColor.b);
        // Soft indirect light at the photographed ceiling perimeter and around
        // the diffuser. These add no scene lights or shadow maps.
        vec2 edge=abs(salonP.xz)-vec2(2.95,4.95);
        vec2 d=abs(edge);
        float nearLamp=min(d.x+max(edge.y,0.),d.y+max(edge.x,0.));
        float wash=1./(1.+nearLamp*2.2);
        float ceiling=smoothstep(3.99,4.44,salonP.y);
        outgoingLight+=diffuseColor.rgb*ceiling*wash*vec3(.38,.27,.15);
        float upright=1.-abs(inverseTransformDirection(normal,viewMatrix).y);
        float litWall=upright*smoothstep(1.,4.32,salonP.y);
        outgoingLight*=1.+.12*litWall;
        if(glazing>.5){
          // Blend the photographed sky and tree tones, with a soft horizon.
          // The room partition behind these reflective panes remains opaque.
          float horizon=.39*sin(salonP.z*.65)+.12*sin(salonP.z*1.7);
          float h=smoothstep(1.15,2.78,salonP.y+horizon);
          vec3 day=mix(vec3(.093,.183,.166),vec3(.42,.60,.70),h);
          float edgeGlow=.055*pow(1.-abs(dot(normal,normalize(vViewPosition))),3.);
          outgoingLight=mix(vec3(.032,.043,.049),day,salonDaylight)+edgeGlow;
        }
        #include <opaque_fragment>`);
    };
    placeSingleDetail(K,{name:'JW 메리어트 · 살롱 6 U자 회의장',file:'../jw-salon-six/salon-six.glb',
      at:[x,y,z],angle,eyeHeight:1.5,floorTolerance:2.1,range:18,exitRange:21,
      fallback:proxy,fallbackMaterial:paint,material:paint,closeVisibleFrom:interior,
      // Gate on the fittings themselves. A guest looking upward can see the
      // lantern, while someone walking away from the entrance sees none of them.
      viewBounds:[new T.Box3(new T.Vector3(-3.2,0,-3.85),new T.Vector3(3.2,1.02,3.5)),
        new T.Box3(new T.Vector3(-4.6,1.1,9.6),new T.Vector3(-.42,3.8,9.82)),
        new T.Box3(new T.Vector3(-3.52,4.04,-5.52),new T.Vector3(3.52,4.25,5.52))]});
  });
}

// The operator photo shows a mottled grey/taupe floor rather than the gold
// loops drawn into the other salons' existing blue carpet.
function salonCarpet(K) {
  K.texture('jwSalonSixCarpet',512,512,(g,w,h)=>{
    const fibre=g,rand=K.rand(6316);
    g.save();g.scale(72/128,48/128);
    fibre.fillStyle='#817578';fibre.fillRect(0,0,128,128);
    for(let i=0;i<2400;i++){
      const x=rand()*128,z=rand()*128;
      const cloud=Math.sin(x*Math.PI/16+Math.cos(z*Math.PI/16))+Math.cos(z*Math.PI/32);
      fibre.strokeStyle=cloud+rand()>.55?'rgba(210,195,192,.48)':'rgba(54,44,51,.45)';
      fibre.lineWidth=.6+rand()*1.4;fibre.beginPath();fibre.moveTo(x,z);
      fibre.lineTo(x+rand()*4-1,z+rand()*2.8+.4);fibre.stroke();
    }
    g.restore();
    const tile=g.getImageData(0,0,72,48);
    for(let row=0;row<h;row+=48)for(let col=0;col<w;col+=72)g.putImageData(tile,col,row);
    // Contact shadows belong to the U formation. Each clipped radial gradient
    // is baked once into the existing floor texture, with no live shadow pass.
    const shadow=(x,z,rx,rz,opacity)=>{
      g.save();g.translate((.5+x/11.5)*w,(.5+z/20)*h);g.scale(rx*w/11.5,rz*h/20);
      const falloff=g.createRadialGradient(0,0,0,0,0,1);
      falloff.addColorStop(0,'rgba(29,21,26,'+opacity+')');
      falloff.addColorStop(.56,'rgba(29,21,26,'+(opacity*.73)+')');
      falloff.addColorStop(1,'rgba(29,21,26,0)');
      g.fillStyle=falloff;g.fillRect(-1,-1,2,2);g.restore();
    };
    for(const [x,z,width,depth] of tableRuns)shadow(x,z,width*.84,depth*.64,.60);
    for(const side of [-1,1])for(let i=0;i<6;i++)shadow(side*2.86,-2.60+i*1.05,.57,.54,.53);
    for(let i=0;i<4;i++)shadow((i-1.5)*.94,-3.55,.54,.57,.53);
  },[1,1],{lazy:true});
}
