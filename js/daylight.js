// NOAA solar position equations. World axes are east (+X), up (+Y), south (+Z).
const RAD = Math.PI / 180, MINUTE = 60000, DAY = 1440 * MINUTE, KST = 540 * MINUTE;
const clamp = x => Math.max(0, Math.min(1, x));
const midnight = ms => Math.floor((ms + KST) / DAY) * DAY - KST;

export function solarPosition(ms, { lat, lon }) {
  const t = (ms / DAY + 2440587.5 - 2451545) / 36525;
  const l = ((280.46646 + t * (36000.76983 + t * .0003032)) % 360) * RAD;
  const m = (357.52911 + t * (35999.05029 - .0001537 * t)) * RAD;
  const e = .016708634 - t * (.000042037 + .0000001267 * t);
  const center = Math.sin(m) * (1.914602 - t * (.004817 + .000014 * t))
    + Math.sin(2 * m) * (.019993 - .000101 * t) + Math.sin(3 * m) * .000289;
  const omega = (125.04 - 1934.136 * t) * RAD;
  const longitude = l + (center - .00569 - .00478 * Math.sin(omega)) * RAD;
  const tilt = (23 + (26 + (21.448 - t * (46.815 + t * (.00059 - .001813 * t))) / 60) / 60 + .00256 * Math.cos(omega)) * RAD;
  const declination = Math.asin(Math.sin(tilt) * Math.sin(longitude));
  const y = Math.tan(tilt / 2) ** 2;
  const eqMinutes = 4 / RAD * (y * Math.sin(2*l) - 2*e*Math.sin(m)
    + 4*e*y*Math.sin(m)*Math.cos(2*l) - .5*y*y*Math.sin(4*l) - 1.25*e*e*Math.sin(2*m));
  const solarMinutes = ((ms / MINUTE + lon * 4 + eqMinutes) % 1440 + 1440) % 1440;
  const hour = (solarMinutes / 4 - 180) * RAD, phi = lat * RAD;
  const east = -Math.cos(declination) * Math.sin(hour);
  const up = Math.sin(phi)*Math.sin(declination) + Math.cos(phi)*Math.cos(declination)*Math.cos(hour);
  const north = Math.cos(phi)*Math.sin(declination) - Math.sin(phi)*Math.cos(declination)*Math.cos(hour);
  return { altitude: Math.asin(up) / RAD, direction: [east, up, -north], morning: hour < 0 };
}

// Sunrise and sunset count the upper limb and standard horizon refraction.
export function horizonTime(ms, site, rising) {
  const start = midnight(ms);
  let lo = start + (rising ? 0 : DAY/2), hi = lo + DAY/2;
  while (hi - lo > 1000) {
    const mid = (hi + lo) / 2;
    if ((solarPosition(mid, site).altitude < -.833) === rising) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export const timeModes = ['live', 'sunrise', 'day', 'sunset', 'night'];
export function seoulClock(ms) { return new Date(ms + KST).toISOString().slice(11, 16); }
function previewTime(mode, ms, site) {
  if (mode === 'sunrise') return horizonTime(ms, site, true) + 14 * MINUTE;
  if (mode === 'sunset') return horizonTime(ms, site, false) - 14 * MINUTE;
  return midnight(ms) + (mode === 'night' ? 22 * 60 : 12 * 60 + 30) * MINUTE;
}

// Elevation stops: zenith, horizon, ground, skylight, ground bounce, direct
// sunlight, skylight intensity, sunlight intensity and interior fill.
const palette = [
  [-12, 0x020408, 0x080d16, 0x030509, 0x9aa9c0, 0x505a64, 0xddc6b3, .055, 0, .005],
  [-6, 0x172948, 0x454757, 0x202631, 0xa4aec4, 0x626478, 0xffab72, .32, 0, .22],
  [-1, 0x52749c, 0xc3a8b1, 0x8a8290, 0xf2e1db, 0xb29b97, 0xff9855, .98, .09, .47],
  [6, 0x6694bb, 0xe1c5af, 0xab9f91, 0xf6e5d2, 0xc1aa97, 0xffbe80, 1.3, .82, .52],
  [18, 0x588dc3, 0xd6e0e7, 0xa6adb0, 0xf4f7ff, 0xb7afa4, 0xffe7c5, 1.5, 1.38, .55],
  [50, 0x447ebb, 0xc7ddeb, 0x9aa3a8, 0xf4f8ff, 0xb3ad9f, 0xfff4e0, 1.55, 1.5, .55],
];
// A cool skylight opens the morning shadows while the first direct light is
// pale gold. Both curves meet at full night and again above the twilight band.
const morningPalette = [
  palette[0],
  [-6, 0x233950, 0x727e94, 0x3e4a58, 0xb9cde1, 0x737e91, 0xffcf9e, .40, 0, .22],
  [-1, 0x719ec2, 0xbcd4e0, 0x899ba6, 0xd9ebfa, 0xadb9c4, 0xffddb0, 1.06, .09, .47],
  [6, 0x76a8cf, 0xd9e8e9, 0xa6b3b6, 0xe6f3ff, 0xbac1c4, 0xffe8bf, 1.39, .78, .52],
  ...palette.slice(4),
];
export function createDaylight(THREE, scene, site, bounce, initialMode, onChange) {
  const uniforms = Object.fromEntries(['zenith','horizon','ground','solarColor','glowColor'].map(k => [k,{value:new THREE.Color()}]));
  Object.assign(uniforms,{solarDir:{value:new THREE.Vector3()}, warmth:{value:0}, disc:{value:0}});
  const material = new THREE.ShaderMaterial({
    uniforms, side:THREE.BackSide, depthTest:false, depthWrite:false, fog:false,
    vertexShader: `varying vec3 skyDir;
      void main(){skyDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform vec3 zenith,horizon,ground,solarColor,glowColor,solarDir;
      uniform float warmth,disc; varying vec3 skyDir;
      void main(){
        vec3 d=normalize(skyDir);
        vec3 sky=mix(horizon,zenith,pow(clamp(d.y,0.0,1.0),0.55));
        sky=mix(sky,ground,smoothstep(0.0,0.33,-d.y));
        float angle=length(d-solarDir);
        float glow=exp(-angle*angle*2.7)*exp(-abs(d.y)*3.0);
        sky=mix(sky,glowColor,warmth*glow);
        sky+=solarColor*disc*(0.23*exp(-angle*24.0)+2.0*(1.0-smoothstep(0.004,0.0065,angle)));
        gl_FragColor=vec4(sky,1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000,48,24),material);
  sky.renderOrder=-1000; sky.frustumCulled=false;
  const hemi = new THREE.HemisphereLight(), sun = new THREE.DirectionalLight(), ambient = new THREE.AmbientLight(0xffffff,.25);
  scene.add(sky,hemi,sun,ambient);
  scene.fog=new THREE.Fog(0xcfe0ee,350,2600);
  const handlers = [], scratch = new THREE.Color(), overcast = new THREE.Color(0x89959d);
  let mode = timeModes.includes(initialMode) ? initialMode : 'live';
  let cacheDate, preview, lastSecond, lastCloud, state;
  function sync(now=Date.now(), force=false) {
    const cloud=clamp(scene.userData.riverCloudiness || 0), second=Math.floor(now/1000);
    if (!force && second===lastSecond && cloud===lastCloud) return;
    lastSecond=second; lastCloud=cloud;
    if (mode!=='live' && midnight(now)!==cacheDate) {
      cacheDate=midnight(now); preview=previewTime(mode,now,site);
    }
    const instant=mode==='live' ? now : preview;
    scene.userData.solarTime=instant;
    const {altitude,direction,morning}=solarPosition(instant,site);
    const curve=morning ? morningPalette : palette;
    let i=1;
    while(i<curve.length-1 && altitude>curve[i][0]) i++;
    const a=curve[i-1], b=curve[i], f=clamp((altitude-a[0])/(b[0]-a[0]));
    function color(target,j){target.setHex(a[j]).lerp(scratch.setHex(b[j]),f);}
    const mix=j=>a[j]+(b[j]-a[j])*f;
    color(uniforms.zenith.value,1); color(uniforms.horizon.value,2); color(uniforms.ground.value,3);
    color(hemi.color,4); color(hemi.groundColor,5); color(sun.color,6);
    const warmth=clamp((17-altitude)/12)*clamp((altitude+10)/7)*(morning ? .44 : 1);
    uniforms.glowColor.value.setHex(morning?0xffe5ba:0xff975d);
    uniforms.solarColor.value.copy(sun.color);
    uniforms.solarDir.value.fromArray(direction);
    uniforms.warmth.value=warmth*(1-cloud*.85);
    uniforms.disc.value=clamp((altitude+1.5)/1.75)*(1-cloud);
    // City fog and the river share the same horizon tint through the transition.
    scene.fog.color.copy(uniforms.horizon.value).lerp(uniforms.glowColor.value,warmth*.18);
    overcast.setHex(0x0c1018).lerp(scratch.setHex(0x89959d),clamp((altitude+9)/12));
    uniforms.zenith.value.lerp(overcast,cloud*.72);
    uniforms.horizon.value.lerp(overcast,cloud*.8);
    scene.fog.color.lerp(overcast,cloud*.8); scene.fog.near=350-160*cloud; scene.fog.far=2600-1350*cloud;
    ambient.intensity=.012+.238*clamp((altitude+10)/10);
    hemi.intensity=mix(7)*(1-.16*cloud);
    sun.position.fromArray(direction).multiplyScalar(700);
    sun.intensity=mix(8)*(1-.8*cloud); bounce.value=mix(9);
    const night=altitude < -3;
    const phase=altitude < -9 ? '밤' : altitude < 9 ? (morning?'아침':'노을') : '낮';
    const clock=seoulClock(instant), previous=state;
    state={mode,instant,clock,phase,altitude,direction,night};
    if (!previous || previous.night!==night) for(const fn of handlers) fn(night);
    if (!previous || previous.altitude!==altitude) for(const fn of solarHandlers) fn(altitude);
    if (!previous || previous.clock!==clock || previous.phase!==phase || previous.night!==night || previous.mode!==mode) onChange(state);
  }
  const solarHandlers=[];
  sync();
  return {sky,sync,get state(){return state;},
    onNight(fn){handlers.push(fn);fn(state.night);},
    onSolarAltitude(fn){solarHandlers.push(fn);fn(state.altitude);},
    setMode(next){if(!timeModes.includes(next))return; mode=next;cacheDate=undefined;sync(Date.now(),true);},
  };
}
