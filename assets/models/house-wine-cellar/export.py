"""Bake this shop's lamps into editable sales-floor fittings for a single draw per piece."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import sys
import bpy

folder=Path(__file__).resolve().parent
tool_dir=folder.parents[2]/'tools'
sys.dont_write_bytecode=True
sys.path.insert(0,str(tool_dir))
from blender_furnished_light import local_mesh

scene=bpy.context.scene
from mathutils import Vector
scene.render.engine='CYCLES'
scene.cycles.samples=256
scene.cycles.max_bounces=3
for key,collection_name in [('gallery','WineSalesGallery'),('wall','WineInscription'),('island','WineDisplayIsland'),('desk','WineMarbleDesk'),('ceiling','WineCeilingStrip')]:
    src=bpy.data.collections[collection_name]
    mesh=local_mesh(src,collection_name)
    mats=list(mesh.materials)
    obj=bpy.data.objects.new('Surface',mesh)
    scene.collection.objects.link(obj)
    obj.location=Vector(src['preview_origin'])
    src.hide_render=True
    bake=mesh.color_attributes.new(name='ShopLight',type='FLOAT_COLOR',domain='CORNER')
    mesh.color_attributes.active_color=bake
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active=obj
    try:
        bpy.ops.object.bake(type='COMBINED',pass_filter={'DIRECT','INDIRECT','COLOR','DIFFUSE','GLOSSY','EMIT'},target='VERTEX_COLORS',use_clear=True)
        tint=mesh.color_attributes['COLOR_0']
        low,high=10,0
        for face in mesh.polygons:
            mat=mats[face.material_index]
            base=mat.diffuse_color
            shader=mat.node_tree.nodes['Principled BSDF']
            luminous=shader.inputs['Emission Strength'].default_value>0 and max(shader.inputs['Emission Color'].default_value[:3])>.05
            for loop in face.loop_indices:
                sample=bake.data[loop].color
                low=min(low,max(sample[:3]))
                high=max(high,max(sample[:3]))
                # Tone map the installation's own lamps; a small ambient component
                # retains readable wood on the unlit side of shelves and lettering.
                color=[min(1.0,.21*base[c]+1.18*sample[c]/(1+.54*sample[c])) for c in range(3)]
                tint.data[loop].color=(*([min(1,base[c]*1.18) for c in range(3)] if luminous else color),1)
        if high<=low+.08:raise RuntimeError(f'No useful illumination sampled for {key}: {low}, {high}')
        print('SHOP BAKE',key,len(mesh.polygons),low,high,flush=True)
        mesh.color_attributes.remove(bake)
        mesh.color_attributes.active_color=mesh.color_attributes['COLOR_0']
        mesh.materials.clear()
        mesh.uv_layers.remove(mesh.uv_layers[0])
        obj.location=(0,0,0)
        bpy.context.view_layer.update()
        with TemporaryDirectory() as temp:
            raw=Path(temp)/(key+'.glb')
            bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,
                export_materials='NONE',export_vertex_color='ACTIVE',export_normals=False,export_texcoords=False)
            subprocess.run(['node',str(folder/'pack.mjs'),str(raw),str(folder/raw.name),key],check=True)
    finally:
        src.hide_render=False
        bpy.data.objects.remove(obj,do_unlink=True)
        bpy.data.meshes.remove(mesh)
        for mat in mats:bpy.data.materials.remove(mat)
