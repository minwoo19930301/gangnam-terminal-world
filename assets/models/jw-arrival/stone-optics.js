// Project a reflected ray onto the fitted lobby walls before sampling the static room probe.
// The capture uses game geometry and lights cubemapped once. Walking needs no reflection pass.
export function floorOptics(shader,origin,ground){
  shader.uniforms.lobbyProbe={value:origin};
  shader.uniforms.entranceGround={value:ground};
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 lobbySurface;')
    .replace('#include <project_vertex>','#include <project_vertex>\nlobbySurface=(modelMatrix*vec4(transformed,1.)).xyz;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
    varying vec3 lobbySurface;uniform vec3 lobbyProbe;uniform float entranceGround;
    vec2 hotelAxes(vec2 q){return vec2(dot(q,vec2(.933337,-.359001)),dot(q,vec2(.359001,.933337)));}
    vec2 worldAxes(vec2 q){return vec2(q.x*.933337+q.y*.359001,-q.x*.359001+q.y*.933337);}
    float postContact(vec2 p,vec2 c,float r){return 1.-smoothstep(r-.05,r+.49,length(p-c));}
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <envmap_fragment>',`
    vec3 surfaceWorld=lobbySurface;
    vec3 reflected=inverseTransformDirection(reflect(-normalize(vViewPosition),normal),viewMatrix);
    vec2 floorUV=hotelAxes(surfaceWorld.xz-lobbyProbe.xz),ray=hotelAxes(reflected.xz);
    vec3 start=vec3(floorUV.x,surfaceWorld.y-entranceGround,floorUV.y),dir=vec3(ray.x,reflected.y,ray.y);
    vec3 lo=vec3(-8.78,-.04,-6.49),hi=vec3(8.79,12.7,6.49),inv=sign(dir)/max(abs(dir),vec3(.0001));
    vec3 reach=max((lo-start)*inv,(hi-start)*inv);
    float t=max(.01,min(min(reach.x,reach.y),reach.z));
    vec3 hit=start+dir*t;vec2 sheet=worldAxes(hit.xz);
    vec3 corrected=vec3(sheet.x,hit.y-2.4,sheet.y);
    vec3 room=textureCube(envMap,vec3(flipEnvMap*corrected.x,corrected.yz)).rgb;
    float fres=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),2.5);
    float micros=sin(floorUV.x*51.+floorUV.y*29.)*.049+sin(floorUV.y*78.-floorUV.x*27.)*.035;
    outgoingLight=mix(outgoingLight,room,(.105+.30*fres)*(1.+micros));
    float ao=postContact(floorUV,vec2(0),1.84);
    for(int i=0;i<2;i++){float v=i==0?-3.90:3.90;
      ao=max(ao,postContact(floorUV,vec2(3.515,v),.66));ao=max(ao,postContact(floorUV,vec2(-2.945,v),.58));}
    outgoingLight*=1.-.22*ao;
  `);
}
