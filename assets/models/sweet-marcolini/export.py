"""Sample copper lighting in Cycles, retain the same three vertex-colour meshes."""
from pathlib import Path
from tempfile import TemporaryDirectory
import runpy
import subprocess
import bpy
from mathutils import Vector

here=Path(bpy.data.filepath).resolve().parent
scene=bpy.context.scene
deps=bpy.context.evaluated_depsgraph_get()
selected=[]
def merge(name,sources,origin):

    coords=[];faces=[];colours=[]
    for source in sorted(sources,key=lambda o:o.name):
        if source.type!='MESH':continue
        obj=source.evaluated_get(deps);data=obj.to_mesh()
        try:
            start=len(coords)
            coords.extend(obj.matrix_world@v.co-origin for v in data.vertices)
            attr=data.color_attributes.get('Copper radiance')
            for p in data.polygons:
                faces.append(tuple(start+i for i in p.vertices))
                base=data.materials[p.material_index].diffuse_color
                for i in p.vertices:
                    if attr:
                        rgb=attr.data[i].color
                        # Mild shoulder for highlights; retain an albedo floor
                        # so game diffuse light also works on shaded side panels.
                        colours.append((*[min(1,.14*base[k]+1.65*rgb[k]/(1+.72*rgb[k])) for k in range(3)],1))
                    else:colours.append(tuple(base))
        finally:obj.to_mesh_clear()
    merged=bpy.data.meshes.new(name);merged.from_pydata(coords,[],faces);merged.update()
    attr=merged.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for i,c in enumerate(colours):attr.data[i].color=c
    out=bpy.data.objects.new(name,merged);bpy.context.scene.collection.objects.link(out);selected.append(out)
original_panels={o:o.data for o in scene.objects if o.get('bake_copper')}
original_glass_visibility=bpy.data.collections['Glass'].hide_render
try:
    runpy.run_path(str(here/'lighting.py'))['bake_panels'](scene)
    for coll in list(bpy.data.collections):
        if not coll.get('bundle'):continue
        origin=Vector(coll['origin'])
        sources=list(coll.all_objects)
        merge(coll.name,[o for o in sources if not o.get('bake_copper')],origin)
        sampled=[o for o in sources if o.get('bake_copper')]
        if sampled: merge('CopperLightSamples',sampled,origin)
    bpy.ops.object.select_all(action='DESELECT')
    for o in selected:o.select_set(True)
    with TemporaryDirectory() as tmp:
        out=Path(tmp)/'chocolatier.glb';target=here/out.name
        bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,
            export_normals=False,export_materials='NONE',export_vertex_color='ACTIVE',export_yup=True)
        subprocess.run(['node',str(here/'pack.mjs'),str(out),str(target)],check=True)
finally:
    bpy.data.collections['Glass'].hide_render=original_glass_visibility
    for obj in selected:
        mesh=obj.data
        bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.meshes.remove(mesh)
    for obj,source_mesh in original_panels.items():
        temporary=obj.data
        if temporary!=source_mesh:
            obj.data=source_mesh
            bpy.data.meshes.remove(temporary)
