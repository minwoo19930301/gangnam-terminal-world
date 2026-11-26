import { Float32BufferAttribute } from 'three';
import { loadFixtureScene } from '../onebailey/load.js';

const library = await loadFixtureScene(new URL('./parts.glb', import.meta.url));
const geometry = {};
for (const name of ['Tread', 'Comb', 'Skirt', 'Return']) {
  const part = library.getObjectByName(name);
  geometry[name] = part.geometry.clone().applyMatrix4(part.matrixWorld);
}

// A place may supply a bespoke surface map. Give the ribbed tread and riser
// a continuous UV strip while retaining the Blender-authored safety colours.
const position = geometry.Tread.getAttribute('position');
const uv = [];
for (let i=0; i<position.count; i++) {
  uv.push(position.getX(i)+.5, position.getZ(i)+Math.min(position.getY(i),0));
}
geometry.Tread.setAttribute('uv', new Float32BufferAttribute(uv,2));

// The chain travels in normalized tread lengths. Only the clock changes each
// frame; every run shares the same compiled shader, even when lengths differ.
function chainMaterial(T, uniforms, map) {
  const material = new T.MeshLambertMaterial({ vertexColors:true, side:T.DoubleSide, map });
  material.name = 'Blender 에스컬레이터 · 디딤판';
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
        uniform float escTime, escFrequency, escRun, escLength, escRiseFactor;
        uniform vec2 escOrigin, escAxis;
        uniform vec3 escTint;
        varying float vEscAlong;`)
      .replace('#include <color_vertex>', `#include <color_vertex>
        if (color.b > color.r * 0.65) vColor.rgb *= escTint;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float advance = fract(escTime * escFrequency);
        float station = dot(instanceMatrix[3].xz - escOrigin, escAxis);
        float onIncline = step(-0.5 * escRun, station) * (1.0 - step(escLength - 1.5 * escRun, station));
        transformed.z += advance;
        transformed.y += advance * onIncline * escRiseFactor;
        vEscAlong = station + transformed.z * escRun;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float escLength; varying float vEscAlong;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
        if (vEscAlong < 0.0 || vEscAlong > escLength) discard;`);
  };
  material.customProgramCacheKey = () => 'blender-escalator-chain-v1';
  return material;
}

export function createEscalatorRenderer(T, addMesh, onFrame) {
  const clock = { value:0 };
  const trim = new T.MeshLambertMaterial({ vertexColors:true, side:T.DoubleSide });
  trim.name = 'Blender 에스컬레이터 · 고정 부품';
  onFrame((_dt, seconds) => { clock.value = seconds; });

  function batch(name, material, matrices) {
    const mesh = new T.InstancedMesh(geometry[name], material, matrices.length);
    mesh.name = 'Blender 에스컬레이터 · ' + name;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.computeBoundingSphere();
    // A batch is already one short flight. Preserve the shader's single run
    // coordinate system even for a very long flight; area pruning still applies.
    mesh.userData.split = true;
    addMesh(mesh,name==='Tread');
  }

  return function flight(low, high, width, steps, speed, color, map, withBalustrade) {
    const [x,y,z] = low;
    const length = Math.hypot(high[0]-x, high[2]-z), rise = high[1]-y;
    const ux = (high[0]-x)/length, uz = (high[2]-z)/length;
    const run = length/steps, stepHeight = rise/(steps-1);
    // The side section is sheared along the incline so its cross-section stays upright.
    function pose(across, along, up, sx, sy, sz, shear=0) {
      return new T.Matrix4().set(
        uz*sx, 0, ux*sz, x+uz*across+ux*along,
        0, sy, shear, y+up,
        -ux*sx, 0, uz*sz, z-ux*across+uz*along,
        0, 0, 0, 1);
    }
    const tint = new T.Vector3(1,1,1);
    if (color) {
      const reference = new T.Color(0x92999d);
      tint.set(color[0]/reference.r, color[1]/reference.g, color[2]/reference.b);
    }
    const verticalScale = Math.max(.001, Math.abs(stepHeight));
    const material = chainMaterial(T, {
      escTime:clock, escFrequency:{value:speed/run}, escRun:{value:run},
      escLength:{value:length}, escRiseFactor:{value:stepHeight/verticalScale},
      escOrigin:{value:new T.Vector2(x,z)}, escAxis:{value:new T.Vector2(ux,uz)}, escTint:{value:tint},
    }, map);
    const chain = [];
    for (let i=-1; i<steps; i++) chain.push(pose(0,i*run,Math.max(0,i)*stepHeight,width,verticalScale,run));
    batch('Tread', material, chain);
    batch('Comb', trim, [pose(0,0,0,width,1,1), pose(0,length,rise,-width,1,-1)]);
    if (!withBalustrade) return;
    const skirts = [], returns = [];
    for (const side of [-1,1]) {
      const offset = side*(width/2+.08);
      skirts.push(pose(offset,0,0,1,1,length,rise));
      returns.push(pose(offset,0,0,1,1,1), pose(offset,length,rise,-1,1,-1));
    }
    batch('Skirt', trim, skirts);
    batch('Return', trim, returns);
  };
}
