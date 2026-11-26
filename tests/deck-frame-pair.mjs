// Playwright serializes this callback into the page. Both renders share the same
// animation tick, traffic poses, loaded assets, escalator phase and lighting.
export function compareDeckFrame() {
  const {K,camera,player,renderer,scene} = window.__world;
  const kit = K._, deck = kit.deckVisibility, gl = renderer.getContext();
  const {drawingBufferWidth:width,drawingBufferHeight:height} = gl;
  function capture() {
    kit.cull(player.x,player.y+player.eye,player.z,true,camera);
    renderer.render(scene,camera);
    const rgba = new Uint8Array(width*height*4);
    gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
    return {calls:renderer.info.render.calls,tri:renderer.info.render.triangles,rgba};
  }
  const update = deck.update;
  let before;
  try {
    deck.update = () => update(null);
    before = capture();
  } finally {
    deck.update = update;
  }
  const after = capture();
  let different = 0, max = 0, total = 0;
  for (let i = 0; i < before.rgba.length; i += 4) {
    let delta = 0;
    for (let channel = 0; channel < 3; channel++) {
      const d = Math.abs(before.rgba[i+channel]-after.rgba[i+channel]);
      total += d; delta = Math.max(delta,d);
    }
    if (delta) different++;
    max = Math.max(max,delta);
  }
  return {before:[before.calls,before.tri],after:[after.calls,after.tri],active:deck.active,
    position:[player.x,player.y,player.z],different,max,mean:total/(width*height*3),width,height};
}
