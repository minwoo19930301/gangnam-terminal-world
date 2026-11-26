"""Mount the editable railing bay and road surfaces from the game's bridge layout."""
from pathlib import Path
import bpy
from mathutils import Matrix, Vector

def mount(scene,model_dir,layout):
    target=bpy.data.collections.new('반포천1교 · 신반포로16길과 양쪽 보도')
    scene.collection.children.link(target)
    path=Path(model_dir)/'banpo-stream-bridge/rail.blend'
    bay=next((c for c in bpy.data.collections if c.name=='BanpoStreamRail' and c.library
              and Path(bpy.path.abspath(c.library.filepath)).resolve()==path.resolve()),None)
    if bay is None:
        with bpy.data.libraries.load(str(path),link=True,relative=True) as (_,items):
            items.collections=['BanpoStreamRail']
        bay=items.collections[0]
    names={'asphalt':'차도','sidewalk':'보도','concrete':'교면 하부','kerb':'보도 경계석','paint':'차도 중앙선','white':'차로 구분선'}
    for key,name in names.items():
        verts=[];faces=[]
        for face in layout['faces']:
            if face['mat']!=key:continue
            vertices=[(x,-z,y) for x,y,z in face['points']]
            n=face['normal'];normal=(n[0],-n[2],n[1]);ids=list(range(len(verts),len(verts)+4))
            if (Vector(vertices[1])-Vector(vertices[0])).cross(Vector(vertices[2])-Vector(vertices[0])).dot(Vector(normal))<0:
                ids.reverse()
            verts.extend(vertices);faces.append(ids)
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
        obj=bpy.data.objects.new(name,mesh);target.objects.link(obj)
        color=layout['colors'][key]
        rgb=[((color>>shift&255)/255) for shift in [16,8,0]]
        mat=bpy.data.materials.new('반포천1교 · '+name)
        mat.diffuse_color=tuple(((v+.055)/1.055)**2.4 for v in rgb)+(1,)
        mesh.materials.append(mat)
    root=bpy.data.objects.new('반포천1교 · 배치 원점',None)
    target.objects.link(root)
    root.empty_display_size=.1
    for a,b in layout['panels']:
        x,y,z=a;dx,dy,dz=[end-start for start,end in zip(a,b)]
        length=(dx*dx+dz*dz)**.5
        obj=bpy.data.objects.new('반포천1교 · 은회색 난간',None)
        target.objects.link(obj);obj.instance_type='COLLECTION';obj.instance_collection=bay;obj.empty_display_size=.12
        # Native X spans a 2 m bay. Preserve the slight uphill/downhill shear.
        affine=Matrix(((dx/2,dz/length,0,x),(-dz/2,dx/length,0,-z),(dy/2,0,1,y),(0,0,0,1)))
        obj.parent=root
        obj.matrix_parent_inverse=affine
    return target
