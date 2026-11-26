// The Han runs from Hannam through Banpo towards Dongjak. Simulated current
// follows that bend in the OSM shoreline. World x is east and z is south.
// Fit the leaf-bank viewpoint's 22 m inlet to the OSM river outline. A
// separate terrain hole touching the river caused the base slab to fill it.
export function withJamwonInlet(outline) {
  const corner = outline.findIndex(([x,z]) => x === 191.99 && z === -1454.08);
  if (corner === -1) return outline;
  return [
    ...outline.slice(0,corner),
    [179.642709,-1441.903110], [196.140873,-1438.094209],
    [201.089796,-1459.530350], [197.876343,-1460.272235],
    ...outline.slice(corner+1),
  ];
}

function rippleTexture(THREE) {
  const size = 128, count = size*size, dx = new Float32Array(count), dz = new Float32Array(count);
  let seed = 74671;
  const random = () => (seed = seed*16807 % 2147483647) / 2147483647;
  // Integer harmonic frequencies wrap without texture seams. Summing many
  // directions makes broken wavelets rather than straight lines over the river.
  const harmonic = new Float64Array(size);
  for (let j=0;j<38;j++) {
    const k = 1+Math.floor(random()*10), l = Math.round((random()-.50)*13);
    const phase = random()*Math.PI*2, length = Math.hypot(k,l);
    const gain = (0.18+random()*.10)/Math.sqrt(length);
    for (let i=0;i<size;i++) harmonic[i] = Math.cos(i/size*Math.PI*2 + phase)*gain;
    for (let z=0;z<size;z++) for (let x=0;x<size;x++) {
      const slope = harmonic[(x*k+z*l) & (size-1)];
      dx[z*size+x] += slope*k/length;
      dz[z*size+x] += slope*l/length;
    }
  }
  const pixels = new Uint8Array(count*4);
  for (let i=0;i<count;i++) {
    pixels[i*4] = Math.round(128+125*Math.tanh(dx[i]));
    pixels[i*4+1] = Math.round(128+125*Math.tanh(dz[i]));
    pixels[i*4+3] = 255;
  }
  const texture = new THREE.DataTexture(pixels,size,size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true; texture.needsUpdate = true;
  return texture;
}

export function createRiverWater(THREE, scene, onFrame) {
  const ripples = rippleTexture(THREE);
  const time = {value:0}, overcast = {value:0};
  const material = new THREE.MeshPhongMaterial({
    color:0x2e5e67, specular:0x6c7778, shininess:65,
  });
  material.name = '한강 수면';
  onFrame((dt,t) => {
    time.value = t;
    overcast.value = scene.userData.riverCloudiness ?? 0;
  });
  material.onBeforeCompile = shader => {
    shader.uniforms.hanRipple = {value:ripples};
    shader.uniforms.hanTime = time;
    shader.uniforms.hanOvercast = overcast;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vHanXZ;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvHanXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
        varying vec2 vHanXZ;
        uniform float hanTime;
        uniform float hanOvercast;
        uniform sampler2D hanRipple;`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        float x = vHanXZ.x + 1250.0;
        float bend = sqrt(x*x + 62500.0);
        float axis = -0.27*x - 0.29*(x+bend);
        float axisSlope = -0.27 - 0.29*(1.0 + x/bend);
        // Constant transverse coordinate follows the centreline. Increasing
        // downstream distance moves southwest at Banpo, then bends west.
        vec2 p = vec2(-vHanXZ.x - 0.83*hanTime, vHanXZ.y - axis);
        float swell = sin(dot(p,vec2(0.14,0.19))+0.85*sin(0.08*p.y));
        vec2 large = texture2D(hanRipple,p*vec2(.083,.059)+0.043*swell).rg*2.0-1.0;
        mat2 skew = mat2(0.86,0.50,-0.50,0.86);
        vec2 small = texture2D(hanRipple,skew*p*0.213+vec2(0.019,-0.014)*hanTime).rg*2.0-1.0;
        vec2 slope = 0.44*large + 0.24*small + 0.016*vec2(swell,-swell);
        slope *= 1.0 + 0.30*hanOvercast;
        vec3 waterNormal = normalize(vec3(slope.x + axisSlope*slope.y, 1.0, -slope.y));
        normal = normalize(mat3(viewMatrix)*waterNormal);
        diffuseColor.rgb *= 1.0 + 0.065*swell + 0.20*slope.x;
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.105,0.133,0.121),hanOvercast*0.62);`)
      .replace('#include <opaque_fragment>', `
        #ifdef USE_FOG
          // Fog shares the scene's sky and time-of-day palette. Fresnel and
          // the real directional light supply the horizon sheen and sun glint.
          float facing = clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);
          float shine = 0.035 + 0.50*pow(1.0-facing,4.0);
          outgoingLight = mix(outgoingLight, fogColor*(0.50+0.22*waterNormal.y), shine);
        #endif
        #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => 'han-river-waves-2';
  return material;
}
