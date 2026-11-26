// One daylight subscription per world, including materials created by late GLB loads.
const nightLevels = new WeakMap();
export function apartmentNight(K) {
  if (!nightLevels.has(K)) {
    const uniform = {value:0};
    if (K.onSolarAltitude) K.onSolarAltitude(degrees => {
      uniform.value = Math.max(0,Math.min(1,(-degrees-2)/8));
    });
    else K.onNight?.(night => { uniform.value = night ? 1 : 0; });
    nightLevels.set(K,uniform);
  }
  return nightLevels.get(K);
}

// Reuse the existing facade draw. "paint" uses the apartment texture's authored
// glazing rectangles; "glass" follows native glazing; "silhouette" supplies
// matching scale to otherwise blank low-detail tower walls.
export function lightApartmentWindows(material, night, mode, atlasLayer) {
  const compile = material.onBeforeCompile, priorKey = material.customProgramCacheKey();
  const mapped = mode==='paint', mixed = mode==='batch', shell = mode==='silhouette';
  material.customProgramCacheKey = () => priorKey+'|apartment:'+mode+':'+(atlasLayer??'');
  material.onBeforeCompile = function(shader,renderer) {
    compile.call(this,shader,renderer);
    shader.uniforms.apartmentNight = night;
    const varying = 'varying vec3 vAptPoint;\nvarying vec3 vAptNormal;\n'+
      (mixed?'varying float vAptGlass;\n':'');
    shader.vertexShader = varying+(mixed?'attribute float apartmentGlass;\n':'')+shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vAptPoint = (modelMatrix * vec4(transformed,1.)).xyz;
      vAptNormal = normalize(mat3(modelMatrix) * normal);
      ${mixed?'vAptGlass = apartmentGlass;':''}`);
    shader.fragmentShader = varying+'uniform float apartmentNight;\n'+shader.fragmentShader;
    const active = atlasLayer!==undefined ? ' && abs(vLayer-'+Number(atlasLayer).toFixed(1)+')<.25' : mixed ? ' && vAptGlass>.99' : shell ? ' && vAptPoint.y>2.4' : '';
    shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>',`
      if (apartmentNight>0. && abs(vAptNormal.y)<.25${active}) {
        vec2 n=normalize(vAptNormal.xz);
        float face=floor(dot(vAptPoint.xz,n)*.5);
        vec2 unit=${mapped?'vMapUv':'vec2(dot(vAptPoint.xz,vec2(n.y,-n.x))/3.5,(vAptPoint.y+.15)/3.0)'};
        vec2 f=fract(unit), edge=max(fwidth(unit),vec2(.003));
        vec2 cell=floor(unit)+vec2(face*3.,face);
        // Small-integer modular hashing keeps identical frames stable across GPUs.
        vec2 grid=mod(cell,vec2(71.,97.));
        // Mix the two axes before the final permutation: a linear seed repeats
        // the same brightness and tint five windows across and six floors down.
        float seed=mod(dot(grid,vec2(17.,31.))+mod(grid.x*grid.y,23.),101.);
        seed=mod(seed*seed+7.*seed,101.);
        ${mapped||shell ? `vec2 pane=smoothstep(vec2(.07,.205)-edge,vec2(.07,.205)+edge,f)
                      *(1.-smoothstep(vec2(.93,.775)-edge,vec2(.93,.775)+edge,f));
          float frame=abs(fract((f.x-.06)/.22+.5)-.5);
          float mask=pane.x*pane.y*mix(.24,1.,smoothstep(.016,.05,frame));` :
        `float mask=smoothstep(.028-edge.x,.028+edge.x,f.x)*(1.-smoothstep(.972-edge.x,.972+edge.x,f.x));
          float mullion=smoothstep(.007-edge.x,.007+edge.x,abs(f.x-.48));
          mask*=mix(.33,1.,mullion);`}
        float shade=mix(.68,1.,smoothstep(.02,.56,f.y));
        // Some households draw one curtain, while adjacent panes share the same lamp.
        shade*=mix(1.,.57,step(22.,seed)*smoothstep(.43,.50,f.x));
        vec3 lamp=seed<19.?vec3(1.,.81,.59):seed<31.?vec3(.85,.85,.77):vec3(1.,.65,.36);
        float lit=step(seed,45.)*(.33+.40*fract(seed*.137));
        outgoingLight+=lamp*(apartmentNight*lit*mask*shade);
      }
      #include <opaque_fragment>`);
  };
}
