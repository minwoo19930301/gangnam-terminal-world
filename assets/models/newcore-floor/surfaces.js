import { samples } from './samples.js';

export { samples as floorSamples };

// The module finishes loading the swatches before the synchronous place build.
// Node's geometry-only checks use the project's headless canvas without a decoder.
const swatches = await Promise.all(Object.entries(samples).map(async ([key, surface]) => {
  let image;
  if (typeof Image !== 'undefined') {
    image = new Image();
    image.src = new URL(key + '.jpg', import.meta.url).href;
    await image.decode();
  }
  return { key, ...surface, image };
}));

export function registerFloorFinishes(K) {
  for (const { key, size, meters, image } of swatches) {
    K.texture(key, ...size, (ctx, w, h) => {
      if (image) ctx.drawImage(image, 0, 0, w, h);
    }, meters);
  }
}
