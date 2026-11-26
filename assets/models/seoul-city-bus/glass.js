// The bus is stationary at each stop. Its window reflection uses the surrounding
// terminal and apartments seen from this axle, with a daytime and a night pass.
export function cityBusGlass(T,route,shared,level){
  const material=new T.MeshPhongMaterial({color:0x688c95,specular:0x93b5bc,shininess:63,
    transparent:true,opacity:.31,depthWrite:false,side:T.DoubleSide,forceSinglePass:true});
  material.defines={BANPO_RIGID:1};
  material.onBeforeCompile=shader=>{
    shader.uniforms.stopProbe=shared.texture;shader.uniforms.probeLoaded=shared.ready;
    shader.uniforms.busNight=level;shader.uniforms.stopRow={value:route==='142'?0:2};
    shader.fragmentShader='uniform sampler2D stopProbe;\nuniform float probeLoaded,busNight,stopRow;\n'+shader.fragmentShader.replace(
      '#include <opaque_fragment>',`
        vec3 reflectionDirection=inverseTransformDirection(reflect(-normalize(vViewPosition),normal),viewMatrix);
        float probeU=atan(reflectionDirection.z,reflectionDirection.x)*0.159154943+0.5;
        float probeV=clamp(0.5-asin(clamp(reflectionDirection.y,-1.0,1.0))*0.318309886,0.006,0.994);
        vec3 reflectionDay=texture2D(stopProbe,vec2(probeU,1.0-(stopRow+probeV)*0.25)).rgb;
        vec3 reflectionNight=texture2D(stopProbe,vec2(probeU,1.0-(stopRow+1.0+probeV)*0.25)).rgb;
        float facing=clamp(dot(normalize(vViewPosition),normal),0.0,1.0);
        float fresnel=0.12+0.77*pow(1.0-facing,3.0);
        outgoingLight=mix(outgoingLight,mix(reflectionDay,reflectionNight,busNight),probeLoaded*(0.30+0.60*fresnel));
        diffuseColor.a=clamp(0.29+fresnel*.63,0.0,.91);
        #include <opaque_fragment>`);
  };
  return material;
}
