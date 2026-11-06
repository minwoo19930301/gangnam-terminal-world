// Apartment and neighbourhood models reused from the user's seoul-real-estate-map (js/places/_re_models.json, assets/re/*.glb,
// made by tools/import_re_models.mjs). Exterior only: you do not walk into them; the OSM outlines they replace stay solid.
// The page shows a plain block for each model right away and swaps in the real model as it arrives (nearest first).
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// which models this page uses: everything whose footprint is near the area
export function pickReModels(data, box, margin) {
  if (!data || !data.models) return [];
  if (!box) return data.models;
  return data.models.filter(m => m.rect.some(([x, z]) => x >= box[0] - margin && x <= box[2] + margin && z >= box[1] - margin && z <= box[3] + margin));
}

// stand-ins (one merged mesh per model) and solid outlines; call before the first frame
export function reModelStandIns({ THREE, K, osm, scene, models }) {
  const byId = new Map(osm.buildings.map(b => [b.id, b]));
  const mat = new THREE.MeshLambertMaterial({ color: 0xd9d3c8 });
  const stand = new Map();
  for (const m of models) {
    const geos = [];
    for (const id of m.claims) {
      const b = byId.get(id); if (!b) continue;
      const h = b.height || (b.levels ? b.levels * 3 : Math.max(9, m.height * 0.8));
      const P = b.poly;
      for (let i = 0; i < P.length; i++) { const a = P[i], c = P[(i + 1) % P.length]; K.phys.addWall(a[0], a[1], c[0], c[1], -0.5, h, 0.2, 'building'); }
      const shape = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
      const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2); geos.push(g);
    }
    if (!geos.length) continue;
    const mesh = new THREE.Group(); for (const g of geos) mesh.add(new THREE.Mesh(g, mat));
    scene.add(mesh); stand.set(m.id, mesh);
  }
  return stand;
}

// load the GLBs, nearest first, a few at a time; returns { update(x, z) } to hide far ones
export function loadReModels({ THREE, scene, models, stand, from, onProgress }) {
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const live = [], mats = new Map();
  const lambert = src => { const k = src.color ? src.color.getHex() : 0xcccccc; if (!mats.has(k)) mats.set(k, new THREE.MeshLambertMaterial({ color: k, side: src.side ?? THREE.FrontSide, transparent: src.transparent && src.opacity < 1, opacity: src.opacity ?? 1 })); return mats.get(k); };
  const queue = models.slice().sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z));
  let done = 0, running = 0;
  const next = () => {
    while (running < 4 && queue.length) {
      const m = queue.shift(); running++;
      loader.load(m.file, gltf => {
        const root = gltf.scene;
        root.traverse(o => { if (o.isMesh) { o.material = Array.isArray(o.material) ? o.material.map(lambert) : lambert(o.material); o.matrixAutoUpdate = false; o.updateMatrix(); } });
        root.position.set(m.x, m.y || 0, m.z); root.rotation.y = (m.yaw || 0) * Math.PI / 180; root.updateMatrixWorld(true);
        root.userData.re = m; scene.add(root); live.push(root);
        const s = stand.get(m.id); if (s) { scene.remove(s); s.traverse(o => o.geometry && o.geometry.dispose()); stand.delete(m.id); }
        running--; done++; onProgress && onProgress(done, models.length); next();
      }, undefined, () => { running--; done++; onProgress && onProgress(done, models.length); next(); });
    }
  };
  next();
  return {
    update(x, z) { for (const r of live) { const m = r.userData.re; r.visible = Math.hypot(m.x - x, m.z - z) < 1400; } },
  };
}
