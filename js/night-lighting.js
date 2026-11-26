// Electric illumination is fixed to the scene. A view through a doorway can
// contain a lit shop and a dark street at the same time.
import { OUTDOOR } from './areas.js';
import { pointInPoly } from './physics.js';
import { relief } from './banpo_relief.js';

function roomLightVolume(THREE, zones, physics, maxSize) {
  const rooms = zones.filter(z => z.place && !OUTDOOR.has(z.place) &&
    Number.isFinite(z.y0) && Number.isFinite(z.y1) && z.y1 > z.y0);
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  let low = Infinity, high = -Infinity;
  for (const z of rooms) {
    bounds[0] = Math.min(bounds[0], z.bb[0]); bounds[1] = Math.min(bounds[1], z.bb[1]);
    bounds[2] = Math.max(bounds[2], z.bb[2]); bounds[3] = Math.max(bounds[3], z.bb[3]);
    for (const [x, south] of z.poly) {
      const ground = relief(x, south) + (z.heightOffset?.(x, south) ?? 0);
      low = Math.min(low, ground + z.y0); high = Math.max(high, ground + z.y1);
    }
  }
  if (!rooms.length) { bounds.fill(0); low = high = 0; }
  const limit = Math.min(maxSize, 320);
  const step = Math.max(2, (bounds[2] - bounds[0]) / (limit - 4), (bounds[3] - bounds[1]) / (limit - 4));
  const dy = Math.max(1.2, (high - low + 16) / (limit - 4));
  const x0 = bounds[0] - step, z0 = bounds[1] - step, y0 = low - 8;
  const w = Math.ceil((bounds[2] - x0) / step) + 2;
  const d = Math.ceil((bounds[3] - z0) / step) + 2;
  const h = Math.ceil((high + 8 - y0) / dy) + 1;
  // Texture axes are east, south and elevation. A roof test excludes terraces,
  // parks and exposed platforms even on a page that also contains indoor shops.
  const data = new Uint8Array(w * d * h);
  for (const zone of rooms) {
    const [west, north, east, south] = zone.bb;
    for (let j = Math.ceil((north-z0)/step); j <= Math.floor((south-z0)/step); j++) {
      for (let i = Math.ceil((west-x0)/step); i <= Math.floor((east-x0)/step); i++) {
        const x = x0 + i*step, z = z0 + j*step;
        if (!pointInPoly(x,z,zone.poly)) continue;
        const offset = zone.heightOffset?.(x,z) ?? 0, floor = zone.y0 + offset;
        const roof = physics.ceilingAbove(x,z,floor+.65,zone.y1+offset+3);
        if (!Number.isFinite(roof)) continue;
        const ground = relief(x,z);
        const first = Math.max(0, Math.ceil((floor + ground - y0 - .45*dy)/dy));
        const last = Math.min(h-1, Math.floor((Math.min(roof,zone.y1+offset) + ground - y0 + .45*dy)/dy));
        for (let k=first;k<=last;k++) data[(k*d+j)*w+i]=255;
      }
    }
  }
  const texture = new THREE.Data3DTexture(data,w,d,h);
  texture.format = THREE.RedFormat;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return {texture, origin:new THREE.Vector3(x0-step/2, z0-step/2, y0-dy/2),
    inverseSize:new THREE.Vector3(1/(w*step),1/(d*step),1/(h*dy))};
}

// Keep the four nearest overhead luminaires per small street tile. The shader
// can illuminate every visible lamp without adding hundreds of Three lights.
function streetLightTiles(THREE, lamps) {
  const cell=10, reach=23;
  let west=0,north=0,east=0,south=0;
  if(lamps.length) {
    west=Math.min(...lamps.map(p=>p[0]))-reach; east=Math.max(...lamps.map(p=>p[0]))+reach;
    north=Math.min(...lamps.map(p=>p[2]))-reach; south=Math.max(...lamps.map(p=>p[2]))+reach;
  }
  const w=Math.ceil((east-west)/cell)+1,h=Math.ceil((south-north)/cell)+1;
  const values=new Float32Array(w*h*16), distances=new Float32Array(w*h*4).fill(Infinity);
  for (const [x,y,z] of lamps) {
    const column=Math.floor((x-west)/cell), row=Math.floor((z-north)/cell);
    for(let j=Math.max(0,row-3);j<=Math.min(h-1,row+3);j++) for(let i=Math.max(0,column-3);i<=Math.min(w-1,column+3);i++) {
      const dx=west+(i+.5)*cell-x, dz=north+(j+.5)*cell-z, distance=dx*dx+dz*dz;
      const first=(j*w+i)*4;
      let slot=first;
      for(let k=1;k<4;k++) if(distances[first+k]>distances[slot])slot=first+k;
      if(distance>=distances[slot])continue;
      distances[slot]=distance; values.set([x,y,z,1],slot*4);
    }
  }
  const texture=new THREE.DataTexture(values,w*4,h,THREE.RGBAFormat,THREE.FloatType);
  texture.needsUpdate=true;
  return {texture,origin:new THREE.Vector2(west,north)};
}

const declarations = `
uniform highp sampler3D roomLightMap;
uniform vec3 roomOrigin, roomInverseSize;
uniform highp sampler2D streetLightMap;
uniform vec2 streetOrigin;
float roomAt(vec3 worldPos) {
  vec3 uv=(worldPos.xzy-roomOrigin)*roomInverseSize;
  if(any(lessThan(uv,vec3(0.0)))||any(greaterThan(uv,vec3(1.0))))return 0.0;
  return texture(roomLightMap,uv).r;
}
vec3 electricDiffuse(vec3 worldPos, vec3 surfaceNormal, float room) {
  vec3 light=room*vec3(.90,.81,.71)*(.74+.19*surfaceNormal.y);
  ivec2 cell=ivec2(floor((worldPos.xz-streetOrigin)/10.0));
  ivec2 dims=textureSize(streetLightMap,0);
  if(cell.x<0||cell.y<0||cell.x*4>=dims.x||cell.y>=dims.y||room>.98)return light;
  for(int i=0;i<4;i++){
    vec4 lamp=texelFetch(streetLightMap,ivec2(cell.x*4+i,cell.y),0);
    vec3 toLight=lamp.xyz-worldPos;
    float dist2=max(dot(toLight,toLight),.8);
    float incidence=max(dot(surfaceNormal,toLight*inversesqrt(dist2)),0.0);
    float beam=smoothstep(.12,.58,toLight.y*inversesqrt(dist2));
    float fade=1.0-smoothstep(185.0,529.0,dist2);
    light+=vec3(1.0,.81,.60)*(lamp.w*50.0*beam*fade*incidence/dist2)*(1.0-room);
  }
  return light;
}`;

// The relief shader has already put the fragment in the same elevation frame
// as the camera. This also works for moving vehicles and Blender instances.
export function installElectricLighting(THREE, kit, physics, lamps, maxSize) {
  const rooms=roomLightVolume(THREE,kit._.zonesList,physics,maxSize);
  const streets=streetLightTiles(THREE,lamps);
  for(const name of ['lambert','phong','standard','physical','toon']) {
    const lib=THREE.ShaderLib[name];
    if(!lib)continue;
    Object.assign(lib.uniforms,{
      roomLightMap:{value:rooms.texture},roomOrigin:{value:rooms.origin},roomInverseSize:{value:rooms.inverseSize},
      streetLightMap:{value:streets.texture},streetOrigin:{value:streets.origin},
    });
    lib.fragmentShader=lib.fragmentShader.replace('#include <common>', '#include <common>\n'+declarations)
      .replace('#include <opaque_fragment>', `
        float afterDark=1.0-smoothstep(.012,.245,ambientLightColor.r);
        if(afterDark>0.0) {
          vec3 worldPos=cameraPosition-(vViewPosition*mat3(viewMatrix));
          vec3 worldN=normal*mat3(viewMatrix);
          float room=roomAt(worldPos+.48*worldN);
          outgoingLight+=diffuseColor.rgb*electricDiffuse(worldPos,worldN,room)*afterDark;
        }
        #include <opaque_fragment>`);
  }
}
