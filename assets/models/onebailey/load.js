import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Use the same exported mesh in browser graphics, headless tests and previews.
export async function loadFixtureScene(url) {
  const buffer = url.protocol === 'file:'
    ? await (await import('node:fs/promises')).readFile(url)
    : new Uint8Array(await (await fetch(url)).arrayBuffer());
  const gltf = await new GLTFLoader().parseAsync(
    buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
  return gltf.scene;
}
