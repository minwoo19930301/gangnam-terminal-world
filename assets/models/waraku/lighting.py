"""Bake local irradiance for the two large surfaces in the furnished Blender scene."""
from math import radians
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import bpy
import numpy as np
from mathutils import Vector
from blender_light_atlas import game_image

def local_mesh(collection, name):
    graph=bpy.context.evaluated_depsgraph_get()
    origin=Vector(collection['preview_origin'])
    vertices=[];faces=[];materials=[];face_material=[];smooth=[]
    for source in sorted(collection.all_objects,key=lambda ob:ob.name):
        if source.type!='MESH':continue
        ob=source.evaluated_get(graph);data=ob.to_mesh()
        try:
            start=len(vertices)
            vertices.extend(ob.matrix_world@pt.co-origin for pt in data.vertices)
            for poly in data.polygons:
                mat=data.materials[poly.material_index]
                if mat not in materials:materials.append(mat)
                face_material.append(materials.index(mat))
                faces.append(tuple(start+i for i in poly.vertices));smooth.append(poly.use_smooth)
        finally:ob.to_mesh_clear()
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    mesh.polygons.foreach_set('use_smooth',smooth)
    for mat in materials:mesh.materials.append(mat.copy())
    mesh.polygons.foreach_set('material_index',face_material)
    tint=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly in mesh.polygons:
        val=materials[poly.material_index].diffuse_color
        for loop in poly.loop_indices:tint.data[loop].color=val
    mesh.uv_layers.new(name='Cycles irradiance')
    return mesh

def remove_outliers(image):
    # Suppress isolated indirect samples before filtering the light atlas. Preserve broad
    # shadows and trim edges by only clipping samples outside their local interquartile range.
    width,height=image.size
    data=np.empty(width*height*4,dtype=np.float32);image.pixels.foreach_get(data)
    image_data=data.reshape(height,width,4)
    rgb=image_data[:,:,:3]
    pad=np.pad(rgb,((2,2),(2,2),(0,0)),mode='edge')
    neighbors=np.stack([pad[y:y+height,x:x+width] for x,y in
        [(0,2),(4,2),(2,0),(2,4),(1,1),(3,1),(1,3),(3,3),(2,2)]])
    ordered=np.partition(neighbors,(2,6),axis=0)
    lower,upper=ordered[2],ordered[6]
    slack=.025+.18*(upper-lower)
    rgb[:]=np.clip(rgb,lower-slack,upper+slack)
    image.pixels.foreach_set(data)


def bake(here, names):
    scene=bpy.data.scenes['114호 · 조명과 앞쪽 두 자리']
    bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=96
    scene.cycles.sample_clamp_indirect=1.8;scene.cycles.sample_clamp_direct=4.0
    scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=3;scene.render.bake.use_clear=True
    tools=here.parents[2]/'tools'
    light_targets={'room':640,'table':512}
    for key,size in light_targets.items():
        source=bpy.data.collections['와라쿠 · '+names[key]]
        preview=next(o for o in scene.objects if o.get('web_part')==key)
        mesh=local_mesh(source,'와라쿠_웹_'+key)
        target=bpy.data.objects.new('실내 조명 베이크용 '+key,mesh)
        scene.collection.objects.link(target)
        target.matrix_world=preview.matrix_world.copy()
        target.location+=Vector(source['preview_origin'])
        preview.hide_render=True
        image=bpy.data.images.new('실내 조사량 '+key,size,size,alpha=True,float_buffer=True)
        image.colorspace_settings.name='Non-Color'
        copies=list(mesh.materials)
        try:
            for mat in copies:
                tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;mat.node_tree.nodes.active=tex
            bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
            bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.uv.smart_project(angle_limit=radians(68),island_margin=.005,scale_to_bounds=True)
            bpy.ops.object.mode_set(mode='OBJECT');bpy.context.view_layer.update()
            bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},use_clear=True,margin=4,
                                target='IMAGE_TEXTURES',uv_layer='Cycles irradiance')
            remove_outliers(image)
            game_image(here/(key+'-light.webp'),image)
            mesh.materials.clear()
            for poly in mesh.polygons:poly.material_index=0
            target.location=(0,0,0)
            bpy.context.view_layer.update()
            with TemporaryDirectory() as t:
                glb=Path(t)/(key+'.glb')
                bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,
                    export_materials='NONE',export_vertex_color='ACTIVE',export_texcoords=True,export_normals=True,export_yup=True)
                subprocess.run(['node',str(tools/'pack_display.mjs'),str(glb),'.58','.0009'],check=True)
                subprocess.run(['node',str(tools/'optimize_model.mjs'),str(glb),str(here/(key+'.glb'))],check=True)
        finally:
            preview.hide_render=False;bpy.data.objects.remove(target,do_unlink=True);bpy.data.meshes.remove(mesh)
            bpy.data.images.remove(image)
            for mat in copies:bpy.data.materials.remove(mat)
