"""Bake the Blender area lights and occlusion of the actual linked dining arrangement into second UVs."""
from math import radians
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import struct
import zlib

import bpy
import numpy as np

LIT=('sushi','teppan','tea','room','entry')
SIZES={'sushi':768,'teppan':768,'tea':768,'room':1024,'entry':768}

def game_image(path,image):
    w,h=image.size
    pixels=np.empty(w*h*4,dtype=np.float32);image.pixels.foreach_get(pixels)
    light=pixels.reshape(h,w,4)[:,:,:3];hit=np.max(light,axis=2)>.00001
    # The runtime still supplies its indoor fill, direct highlights and the night clock. Scale those
    # by the spatial variation from this real bake, reserving headroom above the neutral midpoint.
    print('LIGHT',path.stem, np.quantile(light[hit],[.05,.25,.5,.75,.95,.99]).round(3).tolist(),flush=True)
    gain=np.clip(.38+.72*np.power(np.maximum(0,light),.66),.36,1.94)
    # A bounded bilateral pass removes Monte Carlo grain on smooth plaster while
    # keeping the dark reveals between relief panels and their cast shadows.
    for stride in (1,1,2,2):
        total=gain.copy();weight=np.ones(gain.shape[:2],dtype=np.float32)
        for dx,dy,spatial in [(1,0,.88),(-1,0,.88),(0,1,.88),(0,-1,.88),(1,1,.67),(-1,1,.67),(1,-1,.67),(-1,-1,.67)]:
            shifted=np.roll(gain,(dy*stride,dx*stride),(0,1))
            delta=np.mean((gain-shifted)**2,axis=2)
            wgt=spatial*np.exp(-delta/.045)
            total+=shifted*wgt[:,:,None];weight+=wgt
        gain=total/weight[:,:,None]
    rgb=np.rint(gain[::-1]*127.5).astype(np.uint8)
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
    with TemporaryDirectory() as tmp:
        png=Path(tmp)/'light.png'
        png.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(b'\0'+row.tobytes() for row in rgb),7))+chunk(b'IEND',b''))
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:88}).toFile(process.argv[2]);",str(png),str(path)],cwd=path.parent.parents[2],check=True)

def combine(coll,key):
    graph=bpy.context.evaluated_depsgraph_get();verts=[];polys=[];uvs=[];indices=[];smooth=[];mats=[]
    for original in sorted(coll.objects,key=lambda o:o.name):
        if original.type!='MESH':continue
        ob=original.evaluated_get(graph);mesh=ob.to_mesh()
        try:
            source_uv=mesh.uv_layers.active.data
            start=len(verts);verts.extend(ob.matrix_world @ v.co for v in mesh.vertices)
            for f in mesh.polygons:
                mat=mesh.materials[f.material_index]
                if mat not in mats:mats.append(mat)
                indices.append(mats.index(mat));smooth.append(f.use_smooth)
                polys.append(tuple(start+v for v in f.vertices))
                uvs.extend(tuple(source_uv[i].uv) for i in f.loop_indices)
        finally:ob.to_mesh_clear()
    mesh=bpy.data.meshes.new(key+'_lightmap');mesh.from_pydata(verts,[],polys)
    for mat in mats:mesh.materials.append(mat.copy())
    mesh.polygons.foreach_set('material_index',indices);mesh.polygons.foreach_set('use_smooth',smooth);mesh.update()
    uv=mesh.uv_layers.new(name='Material');uv.uv.foreach_set('vector',[v for pair in uvs for v in pair])
    mesh.uv_layers.new(name='BakedLight');mesh.uv_layers.active_index=1
    return mesh

def bake_room(here,groups,pack):
    scene=bpy.context.scene;old_samples=scene.cycles.samples;scene.cycles.samples=144
    scene.cycles.use_adaptive_sampling=False;scene.cycles.seed=7
    scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=2
    for key in LIT:
        coll=groups[key]
        instance=next(o for o in scene.objects if o.instance_type=='COLLECTION' and o.instance_collection==coll)
        mesh=combine(coll,key)
        target=bpy.data.objects.new('검수 조명 베이크',mesh);scene.collection.objects.link(target)
        target.matrix_world=instance.matrix_world.copy();instance.hide_render=True
        size=SIZES[key];im=bpy.data.images.new(key+' · 실제 광량',width=size,height=size,alpha=True,float_buffer=True)
        im.colorspace_settings.name='Non-Color'
        copies=list(mesh.materials)
        try:
            for mat in copies:
                nodes=mat.node_tree.nodes;links=mat.node_tree.links
                color=next(n for n in nodes if n.type=='TEX_IMAGE' and n.image)
                uv=nodes.new('ShaderNodeUVMap');uv.uv_map='Material';links.new(uv.outputs['UV'],color.inputs['Vector'])
                selected=nodes.new('ShaderNodeTexImage');selected.image=im;nodes.active=selected
            bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
            bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.uv.smart_project(angle_limit=radians(65),island_margin=.005,correct_aspect=True,scale_to_bounds=True)
            bpy.ops.object.mode_set(mode='OBJECT');bpy.context.view_layer.update()
            bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},use_clear=True,margin=4,target='IMAGE_TEXTURES',
                                uv_layer='BakedLight')
            game_image(here/(key+'-light.webp'),im)
            game=mesh.copy();game.materials.clear()
            for poly in game.polygons:poly.material_index=0
            game.uv_layers.active_index=0;game.uv_layers[0].active_render=True
            pack(game,key)
        finally:
            instance.hide_render=False;bpy.data.objects.remove(target,do_unlink=True)
            bpy.data.meshes.remove(mesh);bpy.data.images.remove(im)
            for mat in copies:bpy.data.materials.remove(mat)
    scene.cycles.samples=old_samples
