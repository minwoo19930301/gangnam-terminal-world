// Transmit the food through this table-sized jar without a second scene render.
export function jarGlass(T) {
  return new T.ShaderMaterial({
    transparent:true,depthWrite:false,side:T.FrontSide,
    vertexShader:`
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 worldNormal;
      varying vec3 rayToEye;
      void main(){
        vec4 local=vec4(position,1.0);
        vec3 n=normal;
        #ifdef USE_INSTANCING
          local=instanceMatrix*local;
          mat3 basis=mat3(instanceMatrix);
          n=basis*(n/vec3(dot(basis[0],basis[0]),dot(basis[1],basis[1]),dot(basis[2],basis[2])));
        #endif
        vec4 p=modelMatrix*local;
        worldNormal=normalize(mat3(modelMatrix)*n);
        rayToEye=cameraPosition-p.xyz;
        gl_Position=projectionMatrix*viewMatrix*p;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader:`
      #include <common>
      #include <logdepthbuf_pars_fragment>
      varying vec3 worldNormal;
      varying vec3 rayToEye;
      void main(){
        #include <logdepthbuf_fragment>
        vec3 n=normalize(worldNormal),v=normalize(rayToEye);
        float rim=pow(1.0-clamp(dot(n,v),0.0,1.0),2.7);
        vec3 reflected=reflect(-v,n);
        float light=pow(max(dot(reflected,normalize(vec3(-0.56,0.55,0.62))),0.0),38.0);
        float second=pow(max(dot(reflected,normalize(vec3(0.69,0.42,-0.53))),0.0),62.0);
        float highlight=light+0.64*second;
        gl_FragColor=vec4(mix(vec3(.65,.43,.16),vec3(1.0,.94,.75),clamp(rim+.7*highlight,0.0,1.0)),.085+.42*rim+.32*highlight);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}
