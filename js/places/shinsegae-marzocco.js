import { relief } from '../banpo_relief.js';

const source = new URL('../../assets/models/ssg-marzocco/gallery.glb', import.meta.url);
const batches = ['MarzoccoEnamel', 'MarzoccoSteel', 'MarzoccoArtwork', 'MarzoccoLettering', 'MarzoccoHopper'];

export function registerMarzocco(K, {poly, x, y, z, yaw}) {
  K.detail({floor:'9F', y0:y, y1:y+4.8, poly, name:'라마르조코 에스프레소 머신'}, () => {
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
    box(0,.02,0,3.85,.88,.71,0xb4b0a8);
    box(.29,.9,-.475,3.27,1.13,.075,0xcbd5ce);
    box(-1.65,.9,-.31,.62,1.17,.16,0x274593);
    for (const [a,color] of [[-.89,0xb22e25],[.53,0xb6bfbd]]) {
      box(a,.90,-.07,.37,.32,.23,color);
      box(a,1.16,.105,.37,.115,.19,color);
      box(a,.92,.115,.37,.065,.20,0x555956);
      box(a,1.105,.12,.068,.067,.069,0xb4bdba);
    }
    for (const a of [-.47,1.04]) {
      box(a,.90,0,.15,.23,.16,0x444949);
      box(a,1.13,0,.12,.11,.12,0x79786e);
    }

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
