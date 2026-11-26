// Compact stationary transforms, per-tree tint and visitor pose colours together for the current camera.
export function visitorView(T,scene,relief){
  const batches=[],projection=new T.Matrix4(),previous=new T.Matrix4(),frustum=new T.Frustum();
  const identity=new T.Matrix4(),sphere=new T.Sphere(),box=new T.Box3(),instance=new T.Matrix4();
  let generation=0,lastArray=false;
  const before=scene.onBeforeRender;
  scene.onBeforeRender=function(renderer,world,camera,target){
    before?.call(this,renderer,world,camera,target);
    if(!batches.length)return;
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if(!projection.equals(previous)||lastArray!==!!camera.isArrayCamera){
      previous.copy(projection);frustum.setFromProjectionMatrix(projection);lastArray=!!camera.isArrayCamera;generation++;
    }
    for(const b of batches){
      if(!b.mesh.visible||!b.mesh.layers.test(camera.layers))continue;
      const moved=!b.mesh.matrixWorld.equals(identity);
      if(b.seen===generation&&b.moved===moved)continue;
      b.seen=generation;b.moved=moved;
      if(camera.isArrayCamera||moved){
        for(let i=0;i<b.capacity;i++)b.now[i]=i;
        apply(b,b.capacity);continue;
      }
      if(!frustum.intersectsSphere(b.bounds)){apply(b,0);continue;}
      let n=0;
      for(let i=0;i<b.capacity;i++){
        const offset=i*4;sphere.center.fromArray(b.spheres,offset);sphere.radius=b.spheres[offset+3];
        if(frustum.intersectsSphere(sphere))b.now[n++]=i;
      }
      apply(b,n);
    }
  };
  function apply(b,count){
    let low=count,high=-1;
    for(let dest=0;dest<count;dest++){
      const src=b.now[dest];
      if(b.drawn[dest]===src)continue;
      b.drawn[dest]=src;low=Math.min(low,dest);high=dest;
      for(const [attribute,source] of b.inputs){
        const size=attribute.itemSize,srcAt=src*size,destAt=dest*size;
        for(let k=0;k<size;k++)attribute.array[destAt+k]=source[srcAt+k];
      }
    }
    if(high>=0)for(const [attribute] of b.inputs){
      attribute.addUpdateRange(low*attribute.itemSize,(high-low+1)*attribute.itemSize);
      attribute.needsUpdate=true;
    }
    b.mesh.count=count;
  }
  return mesh=>{
    if(mesh.count<6)return;
    const capacity=mesh.count,parts=mesh.userData.lod;
    box.makeEmpty();
    for(const g of parts){if(!g.boundingBox)g.computeBoundingBox();box.union(g.boundingBox);}
    const local=box.getBoundingSphere(new T.Sphere()),spheres=new Float32Array(capacity*4);
    const hull=new T.Box3(),drawn=new Uint32Array(capacity);
    for(let i=0;i<capacity;i++){
      mesh.getMatrixAt(i,instance);sphere.copy(local).applyMatrix4(instance);
      sphere.center.y+=relief(instance.elements[12],instance.elements[14]);
      sphere.radius+=.025;sphere.center.toArray(spheres,i*4);spheres[i*4+3]=sphere.radius;
      sphere.getBoundingBox(box);hull.union(box);drawn[i]=i;
    }
    const attrs=[mesh.instanceMatrix,...(mesh.instanceColor?[mesh.instanceColor]:[]),...Object.values(parts[0].attributes).filter(a=>a.isInstancedBufferAttribute)];
    const inputs=attrs.map(a=>[a,a.array.slice()]);
    batches.push({mesh,capacity,spheres,drawn,now:new Uint32Array(capacity),bounds:hull.getBoundingSphere(new T.Sphere()),inputs,seen:-1});
  };
}
