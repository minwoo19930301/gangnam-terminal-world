import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-twl/gallery.glb', import.meta.url);
const batches = ['TWLOak', 'TWLTimber', 'TWLGlaze', 'TWLStoneware', 'TWLMetal'];

export function registerTwl(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'TWL 다기와 공예 그릇'}, () => {
    const T = K.THREE;
    const root = new T.Group();
    root.position.set(x, y + relief(x,z), z);
    root.rotation.y = yaw;
    const fallback = new T.Group();
    root.add(fallback);
    const boxGeometry = new T.BoxGeometry();
    const colors = new Map();
    function box(px, py, pz, w, h, d, color) {
      if (!colors.has(color)) colors.set(color, new T.MeshStandardMaterial({color}));
      const part = new T.Mesh(boxGeometry, colors.get(color));
      part.scale.set(w,h,d);
      part.position.set(px, py+h/2, pz);
      fallback.add(part);
    }
    box(0,.18,0,3.07,.07,1.02,0xb57a4b);
    box(0,.87,0,3.07,.081,1.02,0xe8d8bc);
    for (const a of [-1.49,1.49]) for (const b of [-.47,.47]) box(a,.055,b,.074,.90,.074,0xab7149);
    box(0,.08,-2.83,4.94,2.34,.075,0xb57a4b);
    box(0,.08,-2.58,4.94,.45,.57,0x97603e);
    const cup = new T.CylinderGeometry(1,.52,1,12,1,true);
    function vessel(a,h,b,r,height,color) {
      if (!colors.has(color)) colors.set(color,new T.MeshStandardMaterial({color,side:T.DoubleSide}));
      const part = new T.Mesh(cup,colors.get(color));
      part.position.set(a,h+height/2,b);
      part.scale.set(r,height,r);
      fallback.add(part);
    }
    for (const h of [.535,1.055,1.575,2.375]) {
      box(0,h,-2.58,4.96,.062,.63,0xe3c3a1);
      if (h<2) for (const a of [-1.88,-.98,.84,1.83]) vessel(a,h+.062,-2.58,.18,.16,0xb3c4aa);
    }
    vessel(-.91,.951,-.12,.15,.19,0x363d39);
    vessel(.37,.951,-.13,.25,.24,0xeae3d0);
    for (const a of [-1.22,-.77,.96,1.28]) vessel(a,.951,.17,.08,.09,0x86a99f);

    // Layer ownership is captured synchronously when this detail callback returns.
    // Replace the contents of these same meshes when the GLB finishes loading.
    const empty = new T.BufferGeometry(), pendingMaterial = new T.MeshBasicMaterial();
    const slots = batches.map(name => {
      const mesh = new T.Mesh(empty,pendingMaterial);
      mesh.name = name;
      mesh.visible = false;
      root.add(mesh);
      return mesh;
    });
    K.addMesh(root);
    let ready = false, loading = false, retryAt = 0;
    async function load() {
      loading = true;
      try {
        const [{GLTFLoader},{MeshoptDecoder}] = await Promise.all([
          import('three/addons/loaders/GLTFLoader.js'), import('three/addons/libs/meshopt_decoder.module.js')
        ]);
        const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(source.href);
        gltf.scene.updateMatrixWorld(true);
        const parts = batches.map(name => gltf.scene.getObjectByName(name));
        if (!parts.every(part => part?.isMesh && part.geometry.attributes.position)) throw Error('Missing gallery batch');
        parts.forEach((part,i) => {
          const mesh = slots[i];
          mesh.geometry = part.geometry;
          mesh.material = part.material;
          mesh.matrix.copy(part.matrixWorld);
          mesh.matrixAutoUpdate = false;
          mesh.visible = true;
        });
        empty.dispose();
        pendingMaterial.dispose();
        ready = true;
      } catch {
        retryAt = performance.now() + 5000;
      } finally {
        loading = false;
      }
    }
    K.onFrame((_dt,_time,player) => {
      const dx=x-player.x, dz=z-player.z, dist=dx*dx+dz*dz;
      const ahead=-dx*Math.sin(player.yaw)-dz*Math.cos(player.yaw);
      const sameFloor=player.y>=y-.20 && player.y<y+4.6;
      root.visible = sameFloor && dist<22*22 && ahead>-.25*Math.sqrt(dist)-2;
      const near=root.visible && dist<11*11;
      if (near && !ready && !loading && performance.now()>=retryAt) void load();
      fallback.visible = !(ready && near);
      if (ready) for (const mesh of slots) mesh.visible=near;
    });
  });
}
