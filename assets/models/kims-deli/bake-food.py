"""Bake each original meal in Cycles and project its actual surface depth onto a reduced web mesh."""
from math import ceil
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import struct
import zlib

import bpy
import numpy as np
from mathutils import Matrix,Vector
from mathutils.bvhtree import BVHTree

here=Path(__file__).resolve().parent
def bake(key,title,w,d):
    original=bpy.data.collections['킴스클럽 델리 · '+title]
    origin=Vector(original['preview_origin'])
    scene=bpy.data.scenes.new('델리 · '+title+' 제품 촬영')
    scene.collection.children.link(original)
    bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=72;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=7;scene.cycles.transmission_bounces=6
    nx=848;ny=round(nx*d/w)
    scene.render.resolution_x,scene.render.resolution_y=nx,ny;scene.render.resolution_percentage=100
    scene.render.film_transparent=True;scene.render.image_settings.file_format='WEBP'
    scene.render.image_settings.color_mode='RGBA';scene.render.image_settings.quality=89
    world=bpy.data.worlds.new('약한 델리 냉장 조명');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.86,.87,.81,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.43
    scene.world=world
    def light(name,relative,size,power,tint):
        lamp=bpy.data.lights.new(name,'AREA');lamp.shape='RECTANGLE';lamp.size,lamp.size_y=size
        lamp.energy=power;lamp.color=tint
        node=bpy.data.objects.new(name,lamp);scene.collection.objects.link(node)
        node.location=origin+Vector(relative)
        node.rotation_euler=(origin+Vector((0,0,.024))-node.location).to_track_quat('-Z','Y').to_euler()
    light('상품 조명 · 넓은 소프트박스',(-.19,.16,.29),(.24,.18),2.6,(1,.89,.78))
    light('덮개의 가는 반사 · 스트립',(.15,-.11,.22),(.24,.013),1.2,(.85,.94,1))
    cam=bpy.data.cameras.new('포장 정사 투영');cam.type='ORTHO'
    cam.ortho_scale=w*1.06
    eye=bpy.data.objects.new('포장 정사 투영',cam);scene.collection.objects.link(eye)
    eye.location=origin+Vector((0,0,.63));eye.rotation_euler=(0,0,0);scene.camera=eye
    scene.view_settings.view_transform='AgX'
    scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.44
    for source in original.objects:
        if source.get('transparent_lid'):source.hide_render=True
    # Include the label, crimped rim, food and sauce cup. The flexible optical
    # PET cover is represented by its highlights in the photographed material.
    def label_part(ob):
        return ob.name.startswith(('포장 · 흰 품목 스티커','스티커 · 검은 상호 띠','상품 스티커 ·','글자 · '))
    def trim_part(ob):return ob.name.startswith('포장 · 눌러 성형한 모서리')
    sticker=next(ob for ob in original.objects if ob.name.startswith('포장 · 흰 품목 스티커'))
    sticker_points=[sticker.matrix_world@v.co-origin for v in sticker.data.vertices]
    xmin=min(v.x for v in sticker_points);xmax=max(v.x for v in sticker_points)
    ymin=min(v.y for v in sticker_points);ymax=max(v.y for v in sticker_points)
    zlabel=max(v.z for v in sticker_points)+.00040
    verts=[];polygons=[]
    graph=bpy.context.evaluated_depsgraph_get()
    for raw in original.objects:
        if raw.get('transparent_lid') or raw.type!='MESH' or label_part(raw) or trim_part(raw):continue
        obj=raw.evaluated_get(graph);mesh=obj.to_mesh();n=len(verts)
        try:
            verts.extend(obj.matrix_world @ pt.co-origin for pt in mesh.vertices)
            polygons.extend([n+i for i in face.vertices] for face in mesh.polygons)
        finally:obj.to_mesh_clear()
    tree=BVHTree.FromPolygons(verts,polygons)
    fy=w*1.06*ny/nx;fx=w*1.06
    with TemporaryDirectory() as folder:
        tmp=Path(folder)
        scene.render.filepath=str(tmp/'food.webp')
        bpy.ops.render.render(write_still=True)
        full=bpy.data.images.load(str(tmp/'food.webp'),check_existing=False)
        px=np.ones((ny,nx,4),'f4');full.pixels.foreach_get(px.ravel())
        x0=max(0,int((.5+xmin/fx)*nx)-3);x1=min(nx,ceil((.5+xmax/fx)*nx)+3)
        y0=max(0,int((.5+ymin/fy)*ny)-3);y1=min(ny,ceil((.5+ymax/fy)*ny)+3)
        label=px[y0:y1,x0:x1].copy()
        for raw in original.objects:
            if label_part(raw) or trim_part(raw):raw.hide_render=True
        scene.render.filepath=str(tmp/'open.webp')
        bpy.ops.render.render(write_still=True)
        opened=bpy.data.images.load(str(tmp/'open.webp'),check_existing=False)
        opened.pixels.foreach_get(px.ravel())
        extra=label.shape[0]+8;total=ny+extra
        atlas_data=np.ones((total,nx,4),'f4')
        atlas_data[extra:]=px
        atlas_data[3:3+label.shape[0],3:3+label.shape[1]]=label
        # Below the food there is space for the label, clear trim and body side.
        # Blender's byte-backed WebP pixels are already display-encoded. A new
        # float-backed image would apply sRGB twice, washing out the fried coating.
        atlas_data[1:11,nx-14:nx-2,:3]=(.78,.77,.73)
        atlas_data[1:11,nx-30:nx-18,:3]=(.70,.55,.39) if key=='fried' else (.19,.19,.16)
        encoded=np.rint(np.clip(atlas_data,0,1)*255).astype('uint8')[::-1]
        def chunk(tag,data):
            return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
        raw=b''.join(bytes([0])+row.tobytes() for row in encoded)
        header=struct.pack('>2I5B',nx,total,8,6,0,0,0)
        (tmp/'atlas.png').write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',header)+chunk(b'IDAT',zlib.compress(raw,6))+chunk(b'IEND',b''))
        subprocess.run(['cwebp','-quiet','-q','86',str(tmp/'atlas.png'),'-o',str(tmp/'atlas.webp')],check=True)
        # Reconstruct the raised food and paper while leaving the air beneath the lid.
        # Avoid tall walls around the floating sticker by reconstructing it separately.
        # Limit tiny triangles
        # where the baked colour retains the detail more economically. A lip on
        # the lower edge keeps each pack visible from across the aisle.
        rows=34;cols=round(rows*w/d)
        projected=[];faces=[];uvs=[];idx={}
        for j in range(rows+1):
            y=d*(j/rows-.5)*1.014
            for i in range(cols+1):
                x=w*(i/cols-.5)*1.014
                co,normal,_,_=tree.ray_cast(Vector((x,y,.18)),Vector((0,0,-1)),.20)
                if co is None:continue
                idx[(i,j)]=len(projected);projected.append((x,y,co.z))
                uvs.append((.5+x/fx,(extra+ny*(.5+y/fy))/total))
        for j in range(rows):
            for i in range(cols):
                # Keep three-hit cells at the diagonal corners of an octagonal box.
                vertices=[idx[p] for p in [(i,j),(i+1,j),(i+1,j+1),(i,j+1)] if p in idx]
                if len(vertices)>=3:faces.append(tuple(vertices))
        edges={}
        for face in faces:
            for a,b in zip(face,face[1:]+face[:1]):
                edge=tuple(sorted((a,b)))
                if edge in edges:edges[edge]=None
                else:edges[edge]=(a,b)
        side_uv=((nx-24)/nx,6/total);trim_uv=((nx-8)/nx,6/total)
        for edge in edges.values():
            if edge is None:continue
            a,b=edge;upper=[projected[b],projected[a]]
            new=len(projected)
            projected.extend(upper+[(x*.88,y*.88,.001) for x,y,z in reversed(upper)])
            uvs.extend([side_uv]*4);faces.append((new,new+1,new+2,new+3))
        new=len(projected)
        for x,y in [(xmin,ymin),(xmax,ymin),(xmax,ymax),(xmin,ymax)]:
            projected.append((x,y,zlabel))
            uvs.append(((3+(.5+x/fx)*nx-x0)/nx,(3+(.5+y/fy)*ny-y0)/total))
        faces.append((new,new+1,new+2,new+3))
        for raw in original.objects:
            if not trim_part(raw):continue
            obj=raw.evaluated_get(graph);src=obj.to_mesh();new=len(projected)
            try:
                projected.extend(tuple(obj.matrix_world@v.co-origin) for v in src.vertices)
                uvs.extend([trim_uv]*len(src.vertices))
                faces.extend(tuple(new+i for i in face.vertices) for face in src.polygons)
            finally:obj.to_mesh_clear()
        native=bpy.data.meshes.new('포장 깊이');native.from_pydata(projected,[],faces);native.update()
        uv=native.uv_layers.new(name='제품 촬영')
        for loop in native.loops:uv.data[loop.index].uv=uvs[loop.vertex_index]
        for f in native.polygons:f.use_smooth=True
        item=bpy.data.objects.new(key,native);scene.collection.objects.link(item)
        # Keep the native thermoformed shell as a distinct, inexpensive primitive.
        # Only the two meshes in this product's scene are selected for export.
        clear=next(ob for ob in original.objects if ob.get('transparent_lid'))
        shell=clear.data.copy()
        shell.transform(clear.matrix_world)
        shell.transform(Matrix.Translation(-origin))
        lid=bpy.data.objects.new('Lid_'+key,shell);scene.collection.objects.link(lid)
        bpy.ops.object.select_all(action='DESELECT');item.select_set(True);lid.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(tmp/'low.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_materials='NONE',export_texcoords=True,export_yup=True)
        subprocess.run(['node',str(here/'food-material.mjs'),str(tmp/'low.glb'),str(tmp/'atlas.webp'),str(tmp/'color.glb'),key],check=True)
        subprocess.run(['node',str(here.parents[2]/'tools/pack_display.mjs'),str(tmp/'color.glb'),'.54','.00034'],check=True)
        subprocess.run(['node',str(here.parents[2]/'tools/optimize_model.mjs'),str(tmp/'color.glb'),str(here/(key+'.glb'))],check=True)
        # Capture an original orthophoto for the group of six distant islands.
        thumb=bpy.data.images.load(str(tmp/'food.webp'),check_existing=False)
        thumb.scale(278,round(278*d/w))
        # The proxy trims sample this tiny white swatch; the tray outline never touches it.
        pixels=np.empty(thumb.size[0]*thumb.size[1]*4,dtype='f4')
        thumb.pixels.foreach_get(pixels);pixels=pixels.reshape(thumb.size[1],thumb.size[0],4)
        pixels[:6,:6,:]=1;thumb.pixels.foreach_set(pixels.ravel());thumb.update()
        thumb.filepath_raw=str(tmp/'small.png');thumb.file_format='PNG';thumb.save()
        subprocess.run(['cwebp','-quiet','-q','86',str(tmp/'small.png'),'-o',str(here/(key+'-top.webp'))],check=True)
    print(key,'native polygons',len(polygons),'sampled vertices',len(idx),'projected faces',len(faces),flush=True)

for item in [('fried','한입새우튀김 포장',.228,.163),('sushi','새우롤 포장',.246,.154),('maki','김가루 롤 포장',.246,.154),('salad','팔각 양장피 포장',.226,.207)]:bake(*item)
