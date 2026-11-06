import * as THREE from 'three';
import { createPhysics, createPlayer } from './physics.js';
import { createKit } from './kit.js';
import { buildCity, createTraffic } from './city.js';
import { PLACES } from './places/index.js';
import { createMap } from './map.js';
import { FONT } from './textures.js';

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
  const fontsReady = Promise.race([Promise.all(['400', '700'].map(w => document.fonts.load(`${w} 32px "Noto Sans KR"`, '가나다'))), new Promise(r => setTimeout(r, 4000))]).catch(() => { }).then(() => mark('fonts'));
  const osmP = fetch('data/osm.json').then(r => r.json());
  const wantIds = Q.get('places') ? Q.get('places').split(',') : PLACES;
  const modP = wantIds.map(id => import(`./places/${id}.js`).then(m => ({ id, m }), e => ({ id, e })));
  const osm = await osmP; mark('osm');

  // Quality: ?q=low forces the light path (no MSAA, lower pixel-ratio ceiling); phones and small-memory devices
  // pick it automatically. Geometry is never reduced — only the render resolution adapts (see adaptResolution).
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

  // sky + light
  const skyGeo = new THREE.SphereGeometry(3000, 32, 16); const skyCol = []; const pos = skyGeo.attributes.position;
  const top = new THREE.Color(0x4f86c6), hor = new THREE.Color(0xcfe0ee), gnd = new THREE.Color(0x9aa3a8);
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 3000; const c = y > 0 ? hor.clone().lerp(top, Math.pow(y, 0.6)) : hor.clone().lerp(gnd, Math.min(1, -y * 4)); skyCol.push(c.r, c.g, c.b); }
  skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(skyCol, 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -1; scene.add(sky);
  scene.fog = new THREE.Fog(0xcfe0ee, 350, 2600);
  const hemi = new THREE.HemisphereLight(0xf4f8ff, 0xb3ad9f, 1.55); scene.add(hemi); // bright ground colour so ceilings and slab undersides do not read muddy
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.5); sun.position.set(-300, 600, 400); scene.add(sun);
  const amb = new THREE.AmbientLight(0xffffff, 0.25); scene.add(amb);

  const phys = createPhysics();
  const K = createKit(THREE, scene, { osm, phys, maxAniso: renderer.capabilities.getMaxAnisotropy(), maxTex: renderer.capabilities.maxTextureSize, low: LOW });
  K._.atlas.start(); // sign rects are reserved during the build; text is painted once the fonts are in
  // modules may register night handlers while they build, so this must exist before any build()
  const nightFns = []; K.onNight = fn => nightFns.push(fn);

  // ---- places ----
  const want = Q.get('places') ? Q.get('places').split(',') : PLACES;
  const mods = [];
  for (const r of await Promise.all(modP)) { if (r.e) fail(`load ${r.id}`, r.e); else mods.push(r); }
  const claimedBuildings = new Set(), claimedRoads = new Set(), claimedAreas = new Set();
  for (const { m } of mods) { for (const id of m.meta?.claims || []) claimedBuildings.add(id); for (const id of m.meta?.claimRoads || []) claimedRoads.add(id); for (const id of m.meta?.claimAreas || []) claimedAreas.add(id); }
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
    try { roadsInfo = buildCity(K, osm, { claimedBuildings, claimedRoads, claimedAreas, log: s => console.log(s) }); } catch (e) { fail('city', e); }
  }
  // ground with holes
  const [bx0, bz0, bx1, bz1] = osm.bbox;
  const holes = K._.groundHoles.map(h => h.poly);
  try { K.hpoly({ tex: 'concrete', color: 0xc9c6bf }, [[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]], -0.04, true, holes); }
  catch (e) { fail('ground', e); K.hpoly({ tex: 'concrete', color: 0xc9c6bf }, [[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]], -0.04, true); }
  mark('city'); status('메시 합치는 중…'); await new Promise(r => setTimeout(r, 0));
  K._.finalize(); mark('finalize');
  K._.cull(6, 1.6, -125, true);
  const traffic = roadsInfo && Q.get('traffic') !== '0' ? createTraffic(K, roadsInfo, 180) : null;

  // ---- player ----
  const player = createPlayer(phys, { respawn: { x: 6, y: 0, z: -125, yaw: 0 } });
  const spawns = K._.spawns;
  const start = Q.get('pos') ? Q.get('pos').split(',').map(Number) : null;
  if (start) { player.x = start[0]; player.y = start[1]; player.z = start[2]; }
  else { const s0 = spawns.find(s => s.default) || { x: 6, y: 0, z: -125, yaw: Math.PI * 0.6 }; player.teleport(s0.x, s0.y, s0.z, s0.yaw); }
  if (Q.get('yaw')) player.yaw = +Q.get('yaw') * Math.PI / 180;
  if (Q.get('pitch')) player.pitch = +Q.get('pitch') * Math.PI / 180;
  if (Q.has('fly')) player.fly = true;

  // ---- HUD / input ----
  const keys = {};
  const hudZone = $('zone'), hudSub = $('zone-sub'), hudPrompt = $('prompt'), hudCoord = $('coord');
  let menuOpen = false, nearIt = null;
  const map = createMap({ THREE, K, osm, player, phys, spawns, places: placeInfo, container: $('app'), zoneAt: () => currentZone });
  let currentZone = null;
  if (SHOT) document.body.classList.add('shot');
  const canvas = renderer.domElement;
  const lock = () => { if (!SHOT && !menuOpen && !map.isOpen()) canvas.requestPointerLock?.(); };
  canvas.addEventListener('click', lock);
  $('start').addEventListener('click', () => { $('start').classList.add('hidden'); lock(); });
  document.addEventListener('pointerlockchange', () => document.body.classList.toggle('locked', document.pointerLockElement === canvas));
  document.addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) { player.yaw -= e.movementX * 0.0022; player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch - e.movementY * 0.0022)); } });
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    keys[e.code] = true;
    if (menuOpen) { if (/^Digit\d$|^Numpad\d$/.test(e.code)) pickFloorByKey(e.code); if (e.code === 'Escape' || e.code === 'KeyE') closeMenu(); return; }
    if (e.code === 'KeyF') { player.fly = !player.fly; player.vy = 0; toast(player.fly ? '비행 모드 (Space 위 / C 아래)' : '걷기 모드'); }
    if (e.code === 'KeyE' && nearIt) use(nearIt);
    if (e.code === 'KeyM') { map.toggle(); if (map.isOpen()) document.exitPointerLock?.(); }
    if (e.code === 'KeyN') setNight(!night);
    if (e.code === 'KeyH') $('help').classList.toggle('hidden');
    if (e.code === 'KeyR') { const r = player.respawn; player.teleport(r.x, r.y, r.z, r.yaw); }
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 1800); }
  window.__toast = toast;
  // touch controls
  const touch = { mx: 0, mz: 0, id: null, lookId: null, lx: 0, ly: 0, ox: 0, oy: 0 };
  const stick = $('stick'), knob = $('knob');
  addEventListener('touchstart', e => {
    $('start').classList.add('hidden');
    for (const t of e.changedTouches) {
      if (t.target.closest && t.target.closest('button,#map-full,#elev')) continue;
      if (t.clientX < innerWidth * 0.45 && touch.id === null) { touch.id = t.identifier; touch.ox = t.clientX; touch.oy = t.clientY; stick.style.left = (t.clientX - 60) + 'px'; stick.style.top = (t.clientY - 60) + 'px'; stick.classList.add('on'); }
      else if (touch.lookId === null) { touch.lookId = t.identifier; touch.lx = t.clientX; touch.ly = t.clientY; }
    }
  }, { passive: true });
  addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === touch.id) { const dx = t.clientX - touch.ox, dy = t.clientY - touch.oy; const l = Math.min(50, Math.hypot(dx, dy)); const a = Math.atan2(dy, dx); knob.style.transform = `translate(${Math.cos(a) * l}px,${Math.sin(a) * l}px)`; touch.mx = Math.cos(a) * l / 50; touch.mz = Math.sin(a) * l / 50; }
      if (t.identifier === touch.lookId) { player.yaw -= (t.clientX - touch.lx) * 0.005; player.pitch = Math.max(-1.5, Math.min(1.5, player.pitch - (t.clientY - touch.ly) * 0.005)); touch.lx = t.clientX; touch.ly = t.clientY; }
    }
  }, { passive: true });
  addEventListener('touchend', e => { for (const t of e.changedTouches) { if (t.identifier === touch.id) { touch.id = null; touch.mx = touch.mz = 0; knob.style.transform = ''; stick.classList.remove('on'); } if (t.identifier === touch.lookId) touch.lookId = null; } });
  $('btn-use').addEventListener('click', () => nearIt && use(nearIt));
  $('btn-map').addEventListener('click', () => map.toggle());
  $('btn-run').addEventListener('click', () => { touch.run = !touch.run; $('btn-run').classList.toggle('on', touch.run); });
  $('btn-fly').addEventListener('click', () => { player.fly = !player.fly; });

  // elevator / interact menu
  function use(it) {
    if (it.elevator) return openMenu(it.elevator);
    if (it.onUse) it.onUse(player, K);
  }
  let menuEl = null;
  function openMenu(el) {
    menuOpen = true; menuEl = el; document.exitPointerLock?.();
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

  // night mode
  let night = Q.has('night');
  function setNight(v) {
    night = v; document.body.classList.toggle('night', v);
    hemi.intensity = v ? 0.35 : 1.55; sun.intensity = v ? 0.08 : 1.5; amb.intensity = v ? 0.25 : 0.25; K._.bounce.value = v ? 0.38 : 0.55;
    const t = v ? 0x0b1530 : 0x4f86c6, h = v ? 0x223050 : 0xcfe0ee; const cols = sky.geometry.attributes.color;
    const T1 = new THREE.Color(t), H1 = new THREE.Color(h), G1 = new THREE.Color(v ? 0x10141c : 0x9aa3a8);
    for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 3000; const c = y > 0 ? H1.clone().lerp(T1, Math.pow(y, 0.6)) : H1.clone().lerp(G1, Math.min(1, -y * 4)); cols.setXYZ(i, c.r, c.g, c.b); }
    cols.needsUpdate = true; scene.fog.color.setHex(v ? 0x1a2238 : 0xcfe0ee);
    for (const f of nightFns) f(v);
  }
  if (night) setNight(true);

  // ---- loop ----
  const clock = new THREE.Clock(); let t = 0, frames = 0, fpsT0 = performance.now(), fps = 0;
  let signsGo = false;
  const gl = renderer.getContext(), scratch = document.createElement('canvas'), sctx = scratch.getContext('2d');
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
      gl.generateMipmap(gl.TEXTURE_2D);
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
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05); t += dt;
    const input = {
      f: (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - touch.mz,
      s: (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + touch.mx,
      run: keys.ShiftLeft || keys.ShiftRight || touch.run, jump: keys.Space, up: keys.Space, down: keys.KeyC || keys.ControlLeft,
    };
    if (menuOpen || map.isOpen()) { input.f = input.s = 0; }
    player.update(dt, input);
    camera.position.set(player.x, player.y + player.eye, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0, 'YXZ');
    sky.position.copy(camera.position);
    for (const f of K._.frameFns) { try { f(dt, t, player); } catch (e) { } }
    if (traffic) traffic.update(dt);
    // zone + interactables
    currentZone = phys.zoneAt(player.x, player.y + 0.1, player.z);
    const zname = currentZone ? currentZone.name : (player.y < -2 ? '지하' : '거리');
    hudZone.textContent = zname + (currentZone && currentZone.floor ? ` · ${currentZone.floor}` : '');
    hudSub.textContent = currentZone ? currentZone.sub : '';
    nearIt = null; let bd = Infinity;
    for (const it of K._.interactables) { const d = Math.hypot(it.x - player.x, it.z - player.z); if (d < it.r && d < bd && (it.y == null || Math.abs(it.y - player.y) < 2.5)) { if (it.elevator && !it.elevator.floors.some(f => Math.abs(f.y - player.y) < 1.5)) continue; bd = d; nearIt = it; } }
    hudPrompt.textContent = nearIt ? `E · ${nearIt.label}` : ''; hudPrompt.classList.toggle('show', !!nearIt);
    $('btn-use').classList.toggle('show', !!nearIt);
    frames++; { const now = performance.now(); if (now - fpsT0 > 1000) { fps = frames * 1000 / (now - fpsT0); frames = 0; fpsT0 = now; adaptResolution(fps); } }
    hudCoord.textContent = `x ${player.x.toFixed(0)}  z ${player.z.toFixed(0)}  높이 ${player.y.toFixed(1)}m  ${player.fly ? '✈ ' : ''}${fps.toFixed(0)}fps${pixelRatio < Math.min(devicePixelRatio, 2) - 0.01 ? ` · 해상도 ${Math.round(pixelRatio / Math.min(devicePixelRatio, 2) * 100)}%` : ''}`;
    map.update(dt);
    K._.cull(camera.position.x, camera.position.y, camera.position.z);
    // progressive sign painting (≈5 ms per frame); only the painted rectangles are uploaded (texSubImage2D)
    if (signsGo && K._.atlas.pending()) uploadSignRects(K._.atlas.flush(5, player.x, player.z));
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  $('loading').classList.add('hidden');
  if (SHOT || start) $('start').classList.add('hidden');
  // Noto Sans KR is served in unicode-range slices; load the slices for every character the signs use, otherwise
  // canvas text silently falls back to another font for glyphs whose slice is not loaded yet.
  const signFonts = fontsReady.then(() => { const txt = K._.atlas.chars(); return Promise.race([Promise.all(['400', '700'].map(w => document.fonts.load(`${w} 32px "Noto Sans KR"`, txt))), new Promise(r => setTimeout(r, 8000))]).catch(() => { }); }).then(() => mark('signFonts'));
  if (SHOT) { await signFonts; K._.atlas.flushAll(); for (const p of K._.atlas.pages) p.t.needsUpdate = true; }
  else signFonts.then(() => { signsGo = true; });
  mark('ready');
  Object.assign(window.__world, { ready: true, K, phys, player, camera, scene, renderer, map, places: placeInfo, stats: { ...K._.stats, phys: phys.stats, draw: () => renderer.info.render }, setNight });
  frame();
}
boot().catch(e => { fail('boot', e); status('오류: ' + e.message); });
