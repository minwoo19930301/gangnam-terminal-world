// Extract named kit batches in the browser, keeping linear tints and cropped sign-atlas UVs.
export function captureGroups(groups,images){
  const pieces=[];
    for(const [name,kit] of groups){
      for(const mesh of kit._.finalize()){
        const g=mesh.geometry,{position,uv,color}=g.attributes;
        const vertices=[],uvs=[],colors=[];
        const image=mesh.material.map?.image;
        let texture=null;
        let u0=0,v0=0,us=1,vs=1;
        if(image?.getContext){
          let canvas=image;
          if(mesh.material.alphaTest>0){
            const u=[],v=[];
            for(let i=0;i<uv.count;i++){u.push(uv.getX(i));v.push(uv.getY(i));}
            u0=Math.min(...u);v0=Math.min(...v);us=Math.max(...u)-u0;vs=Math.max(...v)-v0;
            canvas=document.createElement('canvas');
            canvas.width=Math.round(image.width*us);canvas.height=Math.round(image.height*vs);
            canvas.getContext('2d').drawImage(image,u0*image.width,(1-v0-vs)*image.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
          }
          const data=canvas.toDataURL('image/png');
          texture=Object.keys(images).find(key=>images[key]===data)??'surface-'+Object.keys(images).length;
          images[texture]=data;
        }
        for(let i=0;i<position.count;i++){
          vertices.push([position.getX(i),-position.getZ(i),position.getY(i)]);
          uvs.push([(uv.getX(i)-u0)/us,(uv.getY(i)-v0)/vs]);
          colors.push(color?[color.getX(i),color.getY(i),color.getZ(i)]:[1,1,1]);
        }
        pieces.push({name,texture,vertices,uvs,colors,indices:Array.from(g.index.array)});
      }
    }
  return pieces;
}
