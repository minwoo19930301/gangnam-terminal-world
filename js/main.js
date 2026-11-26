import * as THREE from 'three';
import { installElectricLighting } from './night-lighting.js';
import { createDaylight, timeModes } from './daylight.js';
import { createPhysics, createPlayer } from './physics.js';
import { floorArrival } from './floor-arrival.js';
import { createKit } from './kit.js';
import { applyRoadEdits } from './blender-roads.js';
import { drawBlenderBuilding, loadBuildingArea } from './blender-buildings.js';
import { buildCity, createTraffic } from './city.js';
import { PLACES } from './places/index.js';
import { createMap } from './map.js';
import { FONT } from './textures.js';
import { planArea, areaIdAt, areaIdForKey, areaName, districtAt, OUTDOOR } from './areas.js';
import { JUNCTIONS, OPEN_STAGE_FRONT } from './places/_junctions.js';
import { LANDMARKS } from './landmarks.js';
import { pickReModels, reModelStandIns, loadReModels } from './remodels.js';

import { installRelief, relief } from './banpo_relief.js';
import { jamwonRiverExtension } from './banpo_dem.js';
import { cutSurface } from './ground.js';
const Q = new URLSearchParams(location.search);
const SHOT = Q.has('shot');
const $ = id => document.getElementById(id);
const status = t => { const el = $('loading-text'); if (el) el.textContent = t; };
const errors = [];
window.__world = { ready: false, errors, timing: {} };
const mark = (k) => { window.__world.timing[k] = Math.round(performance.now()); };
const fail = (where, e) => { console.error(where, e); errors.push(`${where}: ${e && e.message || e}`); };

async function boot() {
  // Fonts are only needed when sign text is painted (after the world is up), so they load in parallel with the
  // map data and the place modules instead of blocking them.
  status('지도 데이터 불러오는 중…');
  const fontSheet = $('sign-fonts');
  const sheetReady = fontSheet.media === 'all' ? Promise.resolve() : new Promise(resolve => {
    fontSheet.addEventListener('load', resolve, {once:true});
    fontSheet.addEventListener('error', resolve, {once:true});
  });
  const fontsReady = Promise.race([
    sheetReady.then(() => Promise.all(['400', '700'].map(w => document.fonts.load(`${w} 32px "Noto Sans KR"`, '가나다')))),
    new Promise(resolve => setTimeout(resolve, 4000)),
  ]).catch(() => {}).then(() => mark('fonts'));
  const osmP = fetch('data/osm.json').then(r => r.json());
  const reP = fetch('js/places/_re_models.json').then(r => r.ok ? r.json() : null).catch(() => null);
  // ---- area loading: an address builds only its area (js/areas.js); ?area=all, ?places=… and screenshots build everything
  const META = await fetch('js/places/_meta.json').then(r => r.json()).catch(() => null);
  const hashR = /^#\/([^?]*)(?:\?(.*))?$/.exec(location.hash || '');
  const hashKey = hashR ? hashR[1].split('/').map(decodeURIComponent).join('/') : '';
  const hashPos = hashR && new URLSearchParams(hashR[2] || '').get('p') ? new URLSearchParams(hashR[2] || '').get('p').split(',').map(Number) : null;
  // Explicit camera links use the same starting position to select the outdoor
  // district and place the player. Otherwise a multi-district module can boot
  // at its bounding-box centre and force a second load after the first step.
  const requestedPos=Q.get('pos')?.split(',').map(Number);
  const start=requestedPos?.length>=3&&requestedPos.slice(0,3).every(Number.isFinite)?requestedPos:null;
  const AREA_ID = (!META || SHOT || Q.get('places') || Q.get('area') === 'all') ? 'all' : (Q.get('area') || areaIdForKey(hashKey, start??hashPos, META));
  const AREA = META ? planArea(AREA_ID, META, JUNCTIONS) : { id: 'all', modules: PLACES, keep: null, keepDetail: null };
  const exteriorTerrain = !AREA.id.startsWith('in:');
  const shellMargin = exteriorTerrain ? 180 : 110;
  const shellBounds = AREA.box?.map((v,i) => v + (i < 2 ? -shellMargin : shellMargin));
  const shellsReady = loadBuildingArea(shellBounds).then(() => null, error => error);
  installRelief(THREE, exteriorTerrain);
  if (AREA.id !== 'all') status(`${areaName(AREA.id, META)} 불러오는 중…`);
  const wantIds = Q.get('places') ? Q.get('places').split(',') : PLACES.filter(id => AREA.modules.includes(id));
  const modP = wantIds.map(id => import(`./places/${id}.js`).then(async m => {
    if (AREA.id === 'all') await m.prepareFullDetail?.();
    return {id, m};
  }).catch(e => ({id, e})));
  const osm = applyRoadEdits(await osmP); mark('osm');

  // Quality: ?q=low forces the light path (no MSAA, lower pixel-ratio ceiling); phones and small-memory devices
  // pick it automatically. The render resolution adapts further to the measured frame rate (see adaptResolution).
  const LOW = Q.get('q') === 'low' || (!Q.get('q') && ((navigator.deviceMemory && navigator.deviceMemory <= 4) || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)));
  const renderer = new THREE.WebGLRenderer({ antialias: !SHOT && !LOW, logarithmicDepthBuffer: true, preserveDrawingBuffer: SHOT, powerPreference: 'high-performance' });
  const MAX_PR = SHOT ? 1 : Math.min(devicePixelRatio, LOW ? 1.25 : 2);
  let pixelRatio = MAX_PR;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  $('app').prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.08, 4000);
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

  const phys = createPhysics();
  const K = createKit(THREE, scene, { osm, phys, maxAniso: renderer.capabilities.getMaxAnisotropy(), maxTex: renderer.capabilities.maxTextureSize, low: LOW, keep: AREA.keep, keepDetail: AREA.keepDetail, streetView: AREA.id.startsWith('out:'), interiorView: AREA.id.startsWith('in:') });
  K._.atlas.start(); // sign rects are reserved during the build; text is painted once the fonts are in
  const timeControl = $('sky-mode'), timeLabel = $('sky-clock');
  let storedMode;
  try { storedMode = sessionStorage.getItem('sky-mode'); } catch {}
  const initialMode = Q.has('night') ? 'night' : SHOT ? 'day' : storedMode || 'live';
  const daylight = createDaylight(THREE, scene, osm.origin, K._.bounce, initialMode, state => {
    timeControl.value = state.mode;
    timeLabel.textContent = state.clock + ' · ' + state.phase;
    document.body.classList.toggle('night', state.night);
  });
  K.onNight = daylight.onNight;
  K.onSolarAltitude = daylight.onSolarAltitude;
  K.displayClock = () => daylight.state.clock;
  const streetLuminaires = [];
  K.streetLight = (x,y,z,strength=1) => streetLuminaires.push([x,y+relief(x,z),z,strength]);
  function setTimeMode(mode) {
    if (!timeModes.includes(mode)) return;
    if (!SHOT) {
      try { sessionStorage.setItem('sky-mode', mode); } catch {}
      if (Q.has('night')) {
        Q.delete('night');
        const url = new URL(location.href); url.searchParams.delete('night');
        history.replaceState(history.state, '', url);
      }
    }
    daylight.setMode(mode);
  }
  const setNight = on => setTimeMode(on ? 'night' : 'day');
  timeControl.addEventListener('change', () => { setTimeMode(timeControl.value); timeControl.blur(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) daylight.sync(Date.now(), true); });

  // ---- places ----
  const mods = [];
  for (const r of await Promise.all(modP)) { if (r.e) fail(`load ${r.id}`, r.e); else mods.push(r); }
  const claimedBuildings = new Set(), claimedRoads = new Set(), claimedAreas = new Set();
  for (const { m } of mods) { for (const id of m.meta?.claims || []) claimedBuildings.add(id); for (const id of m.meta?.claimRoads || []) claimedRoads.add(id); for (const id of m.meta?.claimAreas || []) claimedAreas.add(id); }
  // apartments reused from the user's real-estate map (js/remodels.js): their OSM outlines are not built as generic boxes
  const RE = await reP;
  const reModels = SHOT && !Q.has('re') ? [] : pickReModels(RE, AREA.id === 'all' ? null : AREA.box, AREA.id.startsWith('in:') ? 200 : 350);
  for (const m of reModels) for (const id of m.claims) claimedBuildings.add(id);
  // modules of other areas are not loaded, but what they claim is still theirs (the city must not put generic boxes there)
  if (META && AREA.id !== 'all') for (const v of Object.values(META)) { for (const id of v.claims) claimedBuildings.add(id); for (const id of v.claimRoads) claimedRoads.add(id); for (const id of v.claimAreas) claimedAreas.add(id); }
  const shellError = await shellsReady;
  if (shellError) {
    // Static hosts can briefly serve an older tile index during a release.
    try { await loadBuildingArea(); }
    catch (fallbackError) { console.warn('Using footprint exteriors', shellError, fallbackError); }
  }
  const placeInfo = [];
  for (const { id, m } of mods) {
    status(`짓는 중… ${m.meta?.name || id}`);
    await new Promise(r => setTimeout(r, 0));
    K._.setCurrent(id, m.meta);
    const t0 = performance.now();
    try { m.build(K); placeInfo.push({ id, name: m.meta?.name || id, ms: Math.round(performance.now() - t0) }); }
    catch (e) { fail(`build ${id}`, e); }
  }
  K._.setCurrent('city');
  let roadsInfo = null;
  if (Q.get('city') !== '0') {
    mark('places'); status('도시(OSM) 짓는 중…'); await new Promise(r => setTimeout(r, 0));
    try { roadsInfo = buildCity(K, osm, { claimedBuildings, claimedRoads, claimedAreas, shellBounds, streetBounds: exteriorTerrain ? null : shellBounds, log: s => console.log(s) }); } catch (e) { fail('city', e); }
  }
  // far massing: buildings of place modules this area does not load stand as plain OSM blocks (skyline, walls)
  if (META && AREA.id !== 'all') {
    K._.setCurrent('lod');
    for (const [mid, v] of Object.entries(META)) {
      if ((AREA.modules.includes(mid) && !(AREA.id.startsWith('in:') && !AREA.id.slice(3).split('+').includes(mid))) || mid === 'streets' || mid === 'hangang' || mid === 'jamwon_hangang') continue;
      for (const bid of v.claims) for (const b of osm.buildings.filter(b => b.id === bid)) {
        const h = b.height || (b.levels ? b.levels * 3.6 : 12);
        // The hotel mass shares a wall with the Famille dining gallery.
        // The gallery supplies the visible interior faces at these openings.
        if (AREA.id === 'in:famille+centralcity' && mid === 'jwmarriott' && bid === 136986976) {
          const openings = [
            OPEN_STAGE_FRONT,
            { x: 16.88, z: 148.69, w: 18.1, y1: 9.8 }, // east hall, local u=4..22
            { x: -12.27, z: 159.97, w: 44.6, y1: 8 }, // vaulted gallery, u=22..66.5
          ];
          const mat = { tex: 'concrete', color: 0xd3cbbf };
          const bottom = b.minHeight || 0;
          K.polyWalls(b.poly, bottom, h, { mat, openings, thick: .02, solid: false });
          K.hpoly(mat, b.poly, h, true, b.holes);
          K.hpoly(mat, b.poly, bottom, false, b.holes);
          continue;
        }
        // The registered 2F–11F Shinsegae retail apron covers the
        // northern part of the JW OSM footprint (local v=84.7..145.3).
        // Preserve the hotel beyond the apron, on the ground floor, and above
        // the department store roof at 55m. These are model coordinates, not a survey.
        // The long-edge interpolation below depends on this exact OSM corner
        // order. If the footprint or heights change, use the original LOD.
        const expected=[[29.26,144.45],[-14.35,31.08],[-76.64,54.72],[-33.04,168.08]];
        const knownFootprint=Array.isArray(b.poly)&&b.poly.length===4&&
          expected.every((p,i)=>Array.isArray(b.poly[i])&&Math.hypot(b.poly[i][0]-p[0],b.poly[i][1]-p[1])<.25)&&
          (!b.holes||b.holes.length===0)&&Number.isFinite(h)&&h>7&&(b.minHeight||0)<=0;
        if (AREA.id==='in:shinsegae' && mid==='jwmarriott' && bid===136986976 && knownFootprint) {
          const [se,ne,nw,sw] = b.poly;
          const length=Math.hypot(sw[0]-nw[0],sw[1]-nw[1]);
          const t=(145.3-84.7+2)/length; // 2m outside the retail apron
          const lerp=(a,c,t)=>[a[0]+(c[0]-a[0])*t,a[1]+(c[1]-a[1])*t];
          const south=[se,lerp(ne,se,t),lerp(nw,sw,t),sw];
          const opts={mat:{tex:'concrete',color:0xd3cbbf},solid:false};
          if(t>0&&t<1) {
            try {
              K.prism(b.poly,b.minHeight||0,7,{...opts,top:false});
              K.prism(south,7,Math.min(55,h),{...opts,top:h<=55?opts.mat:false,bottom:false});
              if(h>55)K.prism(b.poly,55,h,{...opts,bottom:false});
              continue;
            } catch(e) { console.warn('Shinsegae/JW LOD cut failed; keeping full mass',e); }
          }
        }
        try {
          const x = b.poly.reduce((sum,v) => sum + v[0], 0) / b.poly.length;
          const z = b.poly.reduce((sum,v) => sum + v[1], 0) / b.poly.length;
          const ground = relief(x,z);
          const base = b.minHeight || Math.min(0,...b.poly.map(v => relief(...v)-ground));
          K.withTerrainAnchor(x,z,() => {
            const authored=drawBlenderBuilding(K,b,0xffffff,'landmark');
            K.prism(b.poly,base,h,{mat:{tex:'concrete',color:0xd3cbbf},holes:b.holes,
              side:authored ? false : undefined,top:authored ? false : undefined,
              bottom:authored ? false : undefined,solid:AREA.lodSolid!==false});
          });
        } catch (e) { }
      }
    }
  }
  K._.setCurrent('ground');
  const drawGround = ([x0,z0,x1,z1]) => cutSurface(
    [[x0,z0],[x1,z0],[x1,z1],[x0,z1]], K._.groundHoles,
    piece => K.hpoly({tex:'concrete',color:0xc9c6bf},piece,-.04)
  );
  drawGround(osm.bbox);
  // The authored upstream shore continues past the north edge of the OSM
  // export. Water and the inlet use the same ground openings as physics.
  if (mods.some(({id}) => id === 'jamwon_hangang')) {
    const riverX=jamwonRiverExtension.map(p=>p[0]), riverZ=jamwonRiverExtension.map(p=>p[1]);
    drawGround([Math.min(...riverX),Math.min(...riverZ),
      Math.max(...riverX,META?.jamwon_hangang?.box?.[2] ?? 1500),osm.bbox[1]]);
  }
  mark('city'); status('메시 합치는 중…'); await new Promise(r => setTimeout(r, 0));
  K._.finalize(); mark('finalize');
  const gl = renderer.getContext();
  installElectricLighting(THREE,K,phys,streetLuminaires,gl.getParameter(gl.MAX_3D_TEXTURE_SIZE));
  K._.cull(6, 1.6, -125, true);
  const reStand = reModels.length ? reModelStandIns({ THREE, K, osm, scene, models: reModels, terrain: exteriorTerrain }) : new Map();
  const traffic = roadsInfo && Q.get('traffic') !== '0' ? createTraffic(K, roadsInfo, 180) : null;

  // ---- virtual doors: every way into another page is a visible door with a sign (js/places/_meta.json entrances/junctions) ----
  // Walking through one reloads straight into the page behind it (no waiting). Outdoors: a door at every building entrance
  // ("<building> 들어가기"); inside a building: doors out ("밖으로 · <district>") and into the buildings its corridors lead to.
  const portals = [];
  if (META && AREA.id !== 'all') {
    const OWNP = AREA.id.startsWith('in:') ? new Set(AREA.id.slice(3).split('+')) : null;
    const add = (x, z, y, w, nx, nz, target, label, key) => portals.push({ x, z, y, w, nx, nz, tx: -nz, tz: nx, target, label, key });
    for (const [mid, v] of Object.entries(META)) {
      if (OUTDOOR.has(mid)) continue;
      const inArea = !OWNP && AREA.box && v.box && !(v.box[2] < AREA.box[0] - 150 || v.box[0] > AREA.box[2] + 150 || v.box[3] < AREA.box[1] - 150 || v.box[1] > AREA.box[3] + 150);
      for (const e of v.entrances || []) {
        // Some same-floor connections are also recorded as street-level entrances.
        // Both sides already exist in the same scene, including when viewed outdoors.
        if (e.other && areaIdAt({ place: e.other }, e.x, e.y, e.z) === areaIdAt({ place: mid }, 0, 0, 0)) continue;
        if (OWNP && OWNP.has(mid)) { // a door out of this building: walking along +n leaves
          const tgt = e.other ? areaIdAt({ place: e.other }, e.x, e.y, e.z) : 'out:' + districtAt(e.x + e.nx * 3, e.z + e.nz * 3).id;
          if (tgt === AREA.id) continue;
          add(e.x, e.z, e.y, e.w, e.nx, e.nz, tgt, e.other ? `${META[e.other]?.name || e.other} 가기` : `밖으로 · ${areaName(tgt, META)}`, `${e.other || 'street'}/1F`);
        } else if (!OWNP && inArea) { // outdoors: a door into this building (walking against n enters)
          add(e.x, e.z, e.y, e.w, -e.nx, -e.nz, areaIdAt({ place: mid }, 0, 0, 0), `${v.name} 들어가기`, `${mid}/1F`);
        }
      }
      if (OWNP && OWNP.has(mid)) for (const j of v.junctions || []) { // corridors to the next building
        if (OWNP.has(j.other) || j.nx == null) continue;
        const width = JUNCTIONS.find(link => link.id === j.id)?.width || 7;
        add(j.x, j.z, j.y, width, j.nx, j.nz, areaIdAt({ place: j.other }, j.x, j.y, j.z), `${META[j.other]?.name || j.other} 가기`, `${j.other}/${j.y < -1 ? 'B1' : '1F'}`);
      }
    }
    // the visible door: thin glowing frame, a light curtain and a sign above (one sign per 18 m cluster of doors to the same place)
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.85, fog: false });
    // Thin portal planes have one visible face at each pixel.
    const curtainMat = new THREE.MeshBasicMaterial({ color: 0x6fc3ff, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true });
    const signed = [];
    for (const p of portals) {
      const g = new THREE.Group(); g.position.set(p.x, p.y, p.z); g.rotation.y = Math.atan2(p.tx, p.tz) - Math.PI / 2;
      const h = 2.7, w = Math.min(p.w, 12);
      const bar = (bw, bh, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), frameMat); m.position.set(x, y, 0); g.add(m); };
      bar(0.07, h, -w / 2, h / 2); bar(0.07, h, w / 2, h / 2); bar(w, 0.07, 0, h);
      const c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), curtainMat); c.position.y = h / 2; g.add(c);
      if (!signed.some(s => s.label === p.label && Math.hypot(s.x - p.x, s.z - p.z) < 18)) {
        signed.push(p);
        const cv = document.createElement('canvas'); cv.width = 512; cv.height = 112; const cx = cv.getContext('2d');
        cx.fillStyle = 'rgba(16,40,70,0.88)'; cx.beginPath(); cx.roundRect ? cx.roundRect(4, 4, 504, 104, 22) : cx.rect(4, 4, 504, 104); cx.fill();
        cx.fillStyle = '#fff'; cx.font = `700 44px ${FONT}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(p.label + ' ▸', 256, 58, 480);
        const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
        const sm = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.7), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, fog: false, forceSinglePass: true }));
        sm.position.set(0, h - 0.5, 0.45); g.add(sm); // inside the top of the frame, a little toward the side you approach from
      }
      g.renderOrder = 3; scene.add(g); p.mesh = g;
    }
  }
  // walked through a door this frame? (segment from the last position crosses the door line, inside its width/height)
  let lastPos = null; let portalArmed = false;
  function portalCheck() {
    const P = { x: player.x, y: player.y, z: player.z };
    if (!lastPos) { lastPos = P; return; }
    if (!portalArmed) { if (performance.now() - bootT > 2500) portalArmed = true; lastPos = P; return; }
    for (const p of portals) {
      if (Math.abs(P.y - p.y) > 3.5) continue;
      const a = (lastPos.x - p.x) * p.nx + (lastPos.z - p.z) * p.nz, b = (P.x - p.x) * p.nx + (P.z - p.z) * p.nz;
      if (!(a < 0 && b >= 0)) continue; // must cross along the door's direction (into the next page)
      const t = a / (a - b), cx = lastPos.x + (P.x - lastPos.x) * t, cz = lastPos.z + (P.z - lastPos.z) * t;
      if (Math.abs((cx - p.x) * p.tx + (cz - p.z) * p.tz) > p.w / 2 + 0.4) continue;
      reloadAt(p.key, P.x + p.nx * 1.5, P.y, P.z + p.nz * 1.5, player.yaw * 180 / Math.PI, areaName(p.target, META));
      return;
    }
    lastPos = P;
  }
  // ---- 3D pins over the key places (outdoors only) ----
  const pins = [];
  if (!SHOT && (AREA.id === 'all' || AREA.id.startsWith('out:'))) {
    for (const L of LANDMARKS) {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const cx = cv.getContext('2d');
      cx.font = `700 46px ${FONT}`; const tw = Math.min(470, cx.measureText(L.name).width + 60);
      cx.fillStyle = L.color || '#2a5d9f'; cx.beginPath(); cx.roundRect ? cx.roundRect(256 - tw / 2, 6, tw, 84, 20) : cx.rect(256 - tw / 2, 6, tw, 84); cx.fill();
      cx.beginPath(); cx.moveTo(240, 88); cx.lineTo(272, 88); cx.lineTo(256, 118); cx.closePath(); cx.fill();
      cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(L.name, 256, 50, 450);
      if (L.sub) { cx.font = `500 30px ${FONT}`; cx.fillStyle = '#20303a'; cx.fillText(L.sub, 256, 140, 470); }
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, fog: false, transparent: true }));
      const [x, y, z] = L.roofPin ?? [L.x, L.y ?? 10, L.z];
      sp.position.set(x, y + 6, z); sp.renderOrder = 10; scene.add(sp); pins.push({ L, sp });
    }
  }
  function pinUpdate() {
    if (!pins.length) return;
    const indoor = player.y < -2 || (currentZone && currentZone.place && !OUTDOOR.has(currentZone.place) && phys.ceilingAbove(player.x, player.z, player.y + 0.5, player.y + 12) < Infinity);
    for (const { L, sp } of pins) {
      const d = Math.hypot(L.x - player.x, L.z - player.z);
      sp.visible = !indoor && d > 30 && d < 1600;
      const s = Math.max(10, Math.min(170, d * 0.11)); sp.scale.set(s, s * 160 / 512, 1); // ~6° wide: readable at any distance
    }
  }

  // ---- player ----
  const player = createPlayer(phys, { respawn: { x: 6, y: 0, z: -125, yaw: 0 } });
  const spawns = K._.spawns;
  if (start) { player.x = start[0]; player.y = start[1]; player.z = start[2]; }
  else { const s0 = spawns.find(s => s.default) || { x: 6, y: 0, z: -125, yaw: Math.PI * 0.6 }; player.teleport(s0.x, s0.y, s0.z, s0.yaw); }
  if (Q.get('yaw')) player.yaw = +Q.get('yaw') * Math.PI / 180;
  if (Q.get('pitch')) player.pitch = +Q.get('pitch') * Math.PI / 180;
  if (Q.has('fly')) player.fly = true;

  // ---- HUD / input ----
  const keys = {};
  const hudZone = $('zone'), hudSub = $('zone-sub'), hudPrompt = $('prompt'), hudCoord = $('coord');
  function updateText(node, value) {
    if (node.textContent !== value) node.textContent = value;
  }
  let menuOpen = false, nearIt = null;
  // ---- leaving the area: reload at the new address with a loading screen ----
  let leaving = false, reloadTimer;
  function reloadAt(key, x, y, z, yawDeg, why) {
    if (leaving || SHOT || AREA.id === 'all') return false;
    // loop guard: never bounce between areas more than 4 times in 20 s
    let hist = []; try { hist = JSON.parse(sessionStorage.getItem('areaHops') || '[]').filter(t => Date.now() - t < 20000); } catch (e) { }
    if (hist.length >= 4) { toast('구역 이동을 잠시 멈췄어요 (반복 이동 감지)'); return false; }
    hist.push(Date.now()); try { sessionStorage.setItem('areaHops', JSON.stringify(hist)); } catch (e) { }
    leaving = true;
    const enc = '#/' + key.split('/').map(encodeURIComponent).join('/');
    const href = `${enc}?p=${x.toFixed(1)},${y.toFixed(1)},${z.toFixed(1)},${Math.round(((yawDeg % 360) + 360) % 360)}`;
    const lt = $('loading-text'); if (lt) lt.textContent = `${why} 불러오는 중…`;
    $('loading').classList.remove('hidden'); document.exitPointerLock?.();
    history.pushState(null, '', location.pathname + location.search + href);
    reloadTimer = setTimeout(() => location.reload(), 60);
    return true;
  }
  function leaveArea(x, y, z, yaw, destination) {
    if (leaving) return true;
    if (AREA.id === 'all') return false;
    // A directory result can name a shop in a district whose floors are unloaded.
    const zn = destination ?? phys.zoneAt(x, (y ?? 0) + 0.1, z);
    const id = areaIdAt(zn, x, y ?? 0, z);
    if (id === AREA.id) return false;
    const key = zn && zn.place ? `${zn.place}/${zn.floor || '1F'}` : 'street';
    reloadAt(key, x, y ?? 0, z, yaw != null ? yaw * 180 / Math.PI : player.yaw * 180 / Math.PI, areaName(id, META));
    return true; // A remote destination cannot be placed on this scene's local floor.
  }
  const map = createMap({ THREE, K, osm, player, phys, spawns, places: placeInfo, directory: META, container: $('app'), zoneAt: () => currentZone, leaveArea });
  let currentZone = null;
  if (SHOT) document.body.classList.add('shot');
  const canvas = renderer.domElement;
  const lock = e => {
    if (e?.pointerType === 'touch' || e?.sourceCapabilities?.firesTouchEvents) return;
    if (!SHOT && !menuOpen && !map.isOpen() && document.hasFocus() && canvas.isConnected) {
      canvas.requestPointerLock?.()?.catch(error => {
        if (!['WrongDocumentError','NotAllowedError','AbortError','SecurityError'].includes(error.name)) console.warn(error);
      });
    }
  };
  canvas.addEventListener('click', lock);
  $('start').addEventListener('click', e => { $('start').classList.add('hidden'); lock(e); });
  document.addEventListener('pointerlockchange', () => document.body.classList.toggle('locked', document.pointerLockElement === canvas));
  document.addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) { player.yaw -= e.movementX * 0.0022; player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch - e.movementY * 0.0022)); } });
  addEventListener('keydown', e => {
    if (e.target.matches?.('input, select')) return;
    keys[e.code] = true;
    if (menuOpen) { if (/^Digit\d$|^Numpad\d$/.test(e.code)) pickFloorByKey(e.code); if (e.code === 'Escape' || e.code === 'KeyE') closeMenu(); return; }
    if (e.code === 'KeyF') { player.fly = !player.fly; player.vy = 0; toast(player.fly ? '비행 모드 (Space 위 / C 아래)' : '걷기 모드'); }
    if (e.code === 'KeyE' && nearIt) use(nearIt);
    if (e.code === 'KeyM') { map.toggle(); if (map.isOpen()) document.exitPointerLock?.(); }
    if (e.code === 'KeyN' && !e.repeat) {
      if (e.shiftKey) setTimeMode('live'); else setNight(!daylight.state.night);
    }
    if (e.code === 'KeyH') $('help').classList.toggle('hidden');
    if (e.code === 'KeyR') { const r = player.respawn; player.teleport(r.x, r.y, r.z, r.yaw); }
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 1800); }
  window.__toast = toast;
  // The visible left pad moves; a separate finger anywhere outside UI looks.
  const touch = { mx: 0, mz: 0, id: null, lookId: null, lx: 0, ly: 0 };
  const stick = $('stick'), knob = $('knob');
  function resetPad() {
    touch.id = null; touch.mx = touch.mz = 0;
    knob.style.transform = ''; stick.classList.remove('on');
  }
  function resetTouch() { resetPad(); touch.lookId = null; }
  function movePad(t) {
    const rect = stick.getBoundingClientRect();
    const dx = t.clientX - (rect.left + rect.width / 2), dy = t.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy), radius = rect.width * .30;
    const reach = Math.min(distance, radius), scale = distance ? reach / distance : 0;
    knob.style.transform = `translate(${dx * scale}px,${dy * scale}px)`;
    // A small dead zone lets a resting thumb stay still.
    const strength = Math.max(0, (reach - radius * .10) / (radius * .90));
    touch.mx = distance ? dx / distance * strength : 0;
    touch.mz = distance ? dy / distance * strength : 0;
  }
  addEventListener('touchstart', e => {
    if (menuOpen || map.isOpen() || !$('start').classList.contains('hidden')) return;
    for (const t of e.changedTouches) {
      if (t.target.closest?.('#stick')) {
        if (touch.id === null) { touch.id = t.identifier; stick.classList.add('on'); movePad(t); }
        continue;
      }
      if (t.target.closest?.('button,select,#map-full,#elev,#start,.gt-mini')) continue;
      if (touch.lookId === null) { touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY; }
    }
  }, { passive: true });
  addEventListener('touchmove', e => {
    if (menuOpen || map.isOpen()) { resetTouch(); return; }
    for (const t of e.changedTouches) {
      if (t.identifier === touch.id) movePad(t);
      if (t.identifier === touch.lookId) { player.yaw -= (t.clientX - touch.lx) * 0.005; player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch - (t.clientY - touch.ly) * 0.005)); touch.lx = t.clientX; touch.ly = t.clientY; }
    }
  }, { passive: true });
  function endTouches(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === touch.id) resetPad();
      if (t.identifier === touch.lookId) touch.lookId = null;
    }
  }
  addEventListener('touchend', endTouches, { passive: true });
  addEventListener('touchcancel', endTouches, { passive: true });
  addEventListener('blur', resetTouch);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetTouch(); });
  $('btn-use').addEventListener('click', () => nearIt && use(nearIt));
  $('btn-map').addEventListener('click', () => { resetTouch(); map.toggle(); });
  $('btn-run').addEventListener('click', () => { touch.run = !touch.run; $('btn-run').classList.toggle('on', touch.run); });
  $('btn-fly').addEventListener('click', () => { player.fly = !player.fly; });

  // elevator / interact menu
  function use(it) {
    if (it.elevator) return openMenu(it.elevator);
    if (it.onUse) it.onUse(player, K);
  }
  let menuEl = null;
  function openMenu(el) {
    menuOpen = true; menuEl = el; resetTouch(); document.exitPointerLock?.();
    const box = $('elev'); box.innerHTML = `<div class="elev-title">${el.name}</div>`;
    const list = document.createElement('div'); list.className = 'elev-list';
    [...el.floors].sort((a, b) => b.y - a.y).forEach((f, i) => {
      const b = document.createElement('button'); b.innerHTML = `<b>${f.label}</b><span>${f.name || ''}</span>`;
      if (Math.abs(f.y - player.y) < 1.2) b.classList.add('here');
      b.onclick = () => { goFloor(f); }; list.appendChild(b);
    });
    box.appendChild(list); const c = document.createElement('button'); c.className = 'elev-close'; c.textContent = '닫기 (E)'; c.onclick = closeMenu; box.appendChild(c);
    box.classList.remove('hidden');
  }
  function goFloor(f) { player.teleport(menuEl.x + (f.dx || 0), f.y + 0.05, menuEl.z + (f.dz || 0), player.yaw); closeMenu(); toast(`${menuEl.name} · ${f.label} ${f.name || ''}`); }
  function pickFloorByKey(code) { const n = code.slice(-1); const f = menuEl.floors.find(f => f.label.replace(/[^0-9B]/g, '') === n || f.label === n + 'F' || f.label === n + '층'); if (f) goFloor(f); }
  function closeMenu() { menuOpen = false; $('elev').classList.add('hidden'); }

  // ---- loop ----
  // ---- routes: every room/floor has its own address (#/place/floor?p=x,y,z,yaw) ----
  // Walking into another place/floor pushes a history entry (so Back returns to the previous room); the position
  // inside the room is kept up to date with replaceState. Opening an address goes straight to that spot, or to
  // the first spawn of that room when it has no position.
  const route = (() => {
    const keyOf = zn => zn && zn.place && zn.place !== 'streets' ? `${zn.place}/${zn.floor || '1F'}` : (player.y < -2 ? 'underground' : 'street');
    let cur = null, pending = null, since = 0, lastWrite = 0, applying = false;
    const enc = k => '#/' + k.split('/').map(encodeURIComponent).join('/');
    const href = k => `${enc(k)}?p=${player.x.toFixed(1)},${player.y.toFixed(1)},${player.z.toFixed(1)},${Math.round(((player.yaw * 180 / Math.PI) % 360 + 360) % 360)}`;
    function parse(h) {
      const m = /^#\/([^?]*)(?:\?(.*))?$/.exec(h || ''); if (!m) return null;
      const key = m[1].split('/').map(decodeURIComponent).join('/'), q = new URLSearchParams(m[2] || ''), p = q.get('p');
      return { key, destination:q.get('destination'), pos: p ? p.split(',').map(Number) : null };
    }
    function go(r) {
      if (!r) return false;
      applying = true; setTimeout(() => { applying = false; }, 800);
      if (r.pos && r.pos.length >= 3 && r.pos.every(Number.isFinite)) { player.teleport(r.pos[0], r.pos[1], r.pos[2], r.pos[3] != null ? r.pos[3] * Math.PI / 180 : player.yaw); return true; }
      const [addressPlace, floor] = r.key.split('/');
      const place = META?.[addressPlace]?.floorAliases?.[floor] ?? addressPlace;
      const entrance = r.destination && spawns.find(s => s.mapDestination && s.place === place &&
        s.floor === floor && s.destinationId === r.destination);
      const sp = entrance || (floor && floorArrival(phys, K._, player, place, floor)) || spawns.find(s => s.place === place);
      if (sp) { player.teleport(sp.x, sp.y ?? 0, sp.z, sp.yaw); return true; }
      return false;
    }
    addEventListener('popstate', () => {
      clearTimeout(reloadTimer);
      const r = parse(location.hash);
      if (META && AREA.id !== 'all' && areaIdForKey(r?.key, r?.pos, META) !== AREA.id) {
        leaving = true;
        location.reload();
        return;
      }
      if (leaving) $('loading').classList.add('hidden');
      leaving = false;
      go(r);
    });
    return {
      start() { const r = parse(location.hash); if (r && !start) go(r); },
      update(zn) {
        const now = performance.now(), k = keyOf(zn);
        if (k !== (pending ?? cur)) { pending = k; since = now; }
        if (pending && now - since > 600) {
          const first = cur === null; cur = pending; pending = null; lastWrite = now;
          if (!SHOT) { if (first || applying) history.replaceState(null, '', href(cur)); else history.pushState(null, '', href(cur)); }
        } else if (cur && now - lastWrite > 2000 && !SHOT) { lastWrite = now; history.replaceState(null, '', href(cur)); }
      },
    };
  })();
  route.start();
  camera.position.set(player.x, player.y + player.eye + relief(player.x, player.z), player.z);
  camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
  K._.ensureDetail(player.x, player.y + player.eye, player.z, SHOT ? 45 : 24, Infinity, SHOT ? null : camera);
  const clock = new THREE.Clock(); let t = 0, frames = 0, fpsT0 = performance.now(), fps = 0;
  let signsGo = false;
  const scratch = document.createElement('canvas'), sctx = scratch.getContext('2d');
  const mipPages = new Set();
  let mipTime = 0;
  function uploadSignRects(jobs) {
    const byPage = new Map();
    for (const j of jobs) { if (!byPage.has(j.r.page)) byPage.set(j.r.page, []); byPage.get(j.r.page).push(j); }
    for (const [page, list] of byPage) {
      const props = renderer.properties.get(page.t);
      if (!props.__webglTexture || page.t.version === 0 || page.t.needsUpdate) { page.t.needsUpdate = true; continue; } // not uploaded yet: full upload next render
      renderer.state.bindTexture(gl.TEXTURE_2D, props.__webglTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      const S = K._.atlas.SIZE;
      for (const j of list) {
        scratch.width = j.pw; scratch.height = j.ph; sctx.clearRect(0, 0, j.pw, j.ph);
        sctx.drawImage(page.c, j.r.x, j.r.y, j.pw, j.ph, 0, 0, j.pw, j.ph);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, j.r.x, S - j.r.y - j.ph, gl.RGBA, gl.UNSIGNED_BYTE, scratch);
      }
      mipPages.add(page);
    }
    const now = performance.now();
    if (now-mipTime >= 150 || !K._.atlas.pending()) {
      for (const page of mipPages) {
        renderer.state.bindTexture(gl.TEXTURE_2D, renderer.properties.get(page.t).__webglTexture);
        gl.generateMipmap(gl.TEXTURE_2D);
      }
      mipPages.clear();
      mipTime = now;
    }
  }
  // Dynamic resolution: drop the pixel ratio while the frame rate is low, raise it again when there is headroom.
  // Skipped for screenshots, ?fixedres, and while the tab is hidden (browsers throttle hidden tabs to ~1 fps).
  function adaptResolution(f) {
    if (SHOT || Q.has('fixedres') || document.hidden || f < 3) return;
    let np = pixelRatio;
    if (f < 40) np = Math.max(0.5, pixelRatio * (f < 25 ? 0.75 : 0.88));
    else if (f > 57 && pixelRatio < MAX_PR) np = Math.min(MAX_PR, pixelRatio * 1.08);
    if (Math.abs(np - pixelRatio) > 0.01) { pixelRatio = np; renderer.setPixelRatio(pixelRatio); }
  }
  // Walked into another area? Only on a clear move, never while brushing past a door, an arcade or a plaza edge:
  //  - into a building: standing under a roof, at least 3.5 m deep inside that building's zones (8 points around you
  //    all belong to it), for 1.2 s;
  //  - out of the building this page shows: at least 3 m away from all of its zones, for 1 s;
  //  - into another outdoor district: 25 m past the district edge.
  // Floors of the same building never reload (elevators, stairs and escalators stay inside the page).
  let areaPending = null, areaSince = 0; const bootT = performance.now();
  const OWN = AREA.id.startsWith('in:') ? new Set(AREA.id.slice(3).split('+')) : null;
  const bldgAt = (x, y, z) => { const zn = phys.zoneAt(x, y + 0.1, z); return zn && zn.place && zn.place !== 'city' && !OUTDOOR.has(zn.place) ? zn.place : null; };
  const ring = (x, y, z, r, test) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (!test(bldgAt(x + Math.cos(a) * r, y, z + Math.sin(a) * r))) return false; } return test(bldgAt(x, y, z)); };
  const sameArea = (a, b) => a && b && areaIdAt({ place: a }, 0, 0, 0) === areaIdAt({ place: b }, 0, 0, 0);
  function wantedArea(zn) {
    const x = player.x, y = player.y, z = player.z, here = bldgAt(x, y, z);
    if (OWN) { // inside a building page: stay unless clearly out of it
      if (here && OWN.has(here)) return AREA.id;
      if (!ring(x, y, z, 3, p => !p || !OWN.has(p))) return AREA.id;
      if (here && ring(x, y, z, 3.5, p => sameArea(p, here)) && phys.ceilingAbove(x, z, y + 0.5, y + 15) < Infinity) return areaIdAt({ place: here }, x, y, z);
      return 'out:' + districtAt(x, z).id;
    }
    if (here && ring(x, y, z, 3.5, p => sameArea(p, here)) && phys.ceilingAbove(x, z, y + 0.5, y + 15) < Infinity) return areaIdAt({ place: here }, x, y, z);
    const d = districtAt(x, z);
    if ('out:' + d.id !== AREA.id && districtAt(x + 25, z).id === d.id && districtAt(x - 25, z).id === d.id && districtAt(x, z + 25).id === d.id && districtAt(x, z - 25).id === d.id) return 'out:' + d.id;
    return AREA.id;
  }
  function areaWatch(zn) {
    if (AREA.id === 'all' || leaving || menuOpen || performance.now() - bootT < 2000) return;
    const id = wantedArea(zn);
    if (id === AREA.id) { areaPending = null; return; }
    if (id !== areaPending) { areaPending = id; areaSince = performance.now(); return; }
    if (performance.now() - areaSince < (id.startsWith('in:') ? 1200 : 1000)) return;
    const key = zn && zn.place ? `${zn.place}/${zn.floor || '1F'}` : (player.y < -2 ? 'underground' : 'street');
    reloadAt(key, player.x, player.y, player.z, player.yaw * 180 / Math.PI, areaName(id, META));
  }
  function frame() {
    const elapsed = clock.getDelta();
    const dt = Math.min(elapsed, 0.05); t += dt;
    const input = {
      f: (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - touch.mz,
      s: (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + touch.mx,
      run: keys.ShiftLeft || keys.ShiftRight || touch.run, jump: keys.Space, up: keys.Space, down: keys.KeyC || keys.ControlLeft,
    };
    if (menuOpen || map.isOpen()) { resetTouch(); input.f = input.s = 0; }
    // Low frame rates should not shorten every step. Keep collision and gravity
    // substeps small, and discard elapsed time after tab suspension or a long pause.
    const movementTime = elapsed > 0.5 ? dt : Math.min(elapsed, 0.15);
    const movementSteps = Math.max(1, Math.ceil(movementTime / 0.05));
    for (let i = 0; i < movementSteps; i++) player.update(movementTime / movementSteps, input);
    camera.position.set(player.x, player.y + player.eye + relief(player.x, player.z), player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
    daylight.sky.position.copy(camera.position);
    daylight.sync();
    for (const f of K._.frameFns) { try { f(dt, t, player); } catch (e) { } }
    if (traffic) traffic.update(dt,camera);
    // zone + interactables
    currentZone = phys.zoneAt(player.x, player.y + 0.1, player.z);
    // Keep the destination hash until the scheduled area reload reads it.
    if (!leaving) route.update(currentZone);
    areaWatch(currentZone); portalCheck(); pinUpdate();
    reLive?.update(camera, performance.now());
    const zname = currentZone ? currentZone.name : (player.y < -2 ? '지하' : '거리');
    updateText(hudZone, zname + (currentZone?.floor ? ` · ${currentZone.floor}` : ''));
    updateText(hudSub, currentZone?.sub || '');
    nearIt = null;
    let closest = Infinity;
    for (const it of K._.interactables) {
      const dx = it.x - player.x, dz = it.z - player.z;
      if (Math.abs(dx) >= it.r || Math.abs(dz) >= it.r) continue;
      const distance = dx*dx + dz*dz;
      if (distance >= it.r*it.r || distance >= closest || (it.y != null && Math.abs(it.y-player.y) >= 2.5)) continue;
      if (it.elevator && !it.elevator.floors.some(f => Math.abs(f.y-player.y) < 1.5)) continue;
      closest = distance; nearIt = it;
    }
    updateText(hudPrompt, nearIt ? `E · ${nearIt.label}` : '');
    hudPrompt.classList.toggle('show', !!nearIt);
    $('btn-use').classList.toggle('show', !!nearIt);
    frames++; { const now = performance.now(); if (now - fpsT0 > 1000) { fps = frames * 1000 / (now - fpsT0); frames = 0; fpsT0 = now; adaptResolution(fps); } }
    updateText(hudCoord, `x ${player.x.toFixed(0)}  z ${player.z.toFixed(0)}  높이 ${(player.y + relief(player.x, player.z)).toFixed(1)}m  ${player.fly ? '✈ ' : ''}${fps.toFixed(0)}fps${pixelRatio < Math.min(devicePixelRatio, 2) - 0.01 ? ` · 해상도 ${Math.round(pixelRatio / Math.min(devicePixelRatio, 2) * 100)}%` : ''}`);
    map.update(dt);
    // lazy floor detail near the camera (bounded per frame); screenshots paint new sign text immediately
    if (K._.ensureDetail(player.x, player.y + player.eye, player.z, SHOT ? 60 : 48, SHOT ? Infinity : 2, SHOT ? null : camera) && SHOT && K._.atlas.pending()) { K._.atlas.flushAll(); for (const p of K._.atlas.pages) p.t.needsUpdate = true; }
    K._.cull(player.x, player.y + player.eye, player.z, false, camera);
    // Bound both canvas work and GPU uploads while walking.
    if (signsGo && K._.atlas.pending()) uploadSignRects(K._.atlas.flush(1.5, player.x, player.z, 8));
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  if (SHOT || start) $('start').classList.add('hidden');
  // arrived by walking into this area (reload): no intro card again, just a hint to click back in
  let hopped = false; try { const h = JSON.parse(sessionStorage.getItem('areaHops') || '[]'); hopped = h.length && Date.now() - h[h.length - 1] < 30000; } catch (e) { }
  if (hopped) { $('start').classList.add('hidden'); setTimeout(() => toast(`${areaName(AREA.id, META)} · 화면을 클릭하면 계속 걸어요`), 300); }
  // Noto Sans KR is served in unicode-range slices; load the slices for every character the signs use, otherwise
  // canvas text silently falls back to another font for glyphs whose slice is not loaded yet.
  const signFonts = fontsReady.then(() => { const txt = K._.atlas.chars(); return Promise.race([Promise.all(['400', '700'].map(w => document.fonts.load(`${w} 32px "Noto Sans KR"`, txt))), new Promise(r => setTimeout(r, 8000))]).catch(() => { }); }).then(() => mark('signFonts'));
  if (SHOT) { await signFonts; K._.atlas.flushAll(); for (const p of K._.atlas.pages) p.t.needsUpdate = true; }
  else signFonts.then(() => { signsGo = true; });
  // First upload and draw the visible room under the arrival screen. The next
  // presented frame is available for input without paying that upload cost.
  if (!SHOT) {
    renderer.render(scene,camera);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  $('loading').classList.add('hidden');
  mark('ready');
  const reLive = reModels.length ? loadReModels({THREE, scene, models:reModels, stand:reStand, renderer, terrain:exteriorTerrain}) : null;
  Object.assign(window.__world, { ready: true, area: AREA.id, wantedArea: () => wantedArea(phys.zoneAt(player.x, player.y + 0.1, player.z)), K, phys, player, camera, scene, renderer, map, places: placeInfo, stats: { ...K._.stats, phys: phys.stats, draw: () => renderer.info.render }, setNight, setTimeMode, daylight });
  frame();
}
boot().catch(e => { fail('boot', e); status('오류: ' + e.message); });
