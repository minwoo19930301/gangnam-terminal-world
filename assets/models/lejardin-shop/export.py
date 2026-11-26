"""Export the editable model, the game's flower instance transforms and two views of the native conifer spray."""
from pathlib import Path
from tempfile import TemporaryDirectory
from math import radians
import json,subprocess,sys
import bpy
import numpy as np
from mathutils import Matrix,Vector
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
from blender_display_export import bake_collection
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {parts,prefix} from './layout.js';console.log(JSON.stringify({parts,prefix}));"],cwd=here))
groups={key:bpy.data.collections[cfg['prefix']+p[0]] for key,p in cfg['parts'].items()}
source=bpy.data.scenes['편집 소품과 화훼 원형'];shop=bpy.data.scenes['센트럴시티 122-1호 · 르자당'];C=Matrix.Rotation(-1.5707963267948966,4,'X')
lit_sizes={'shell':1024,'front':1024,'case':768,'counter':512,'cards':384,'parcels':384}
def packed(mesh,key):
    obj=bpy.data.objects.new(key,mesh);bpy.context.scene.collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    with TemporaryDirectory() as tmp:
        dst=Path(tmp)/(key+'.glb');tools=here.parents[2]/'tools'
        bpy.ops.export_scene.gltf(filepath=str(dst),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE' if mesh.color_attributes else 'NONE',export_texcoords=True,export_animations=False)
        subprocess.run(['node',str(tools/'pack_display.mjs'),str(dst),'.87','.00042'],check=True)
        subprocess.run(['node',str(tools/'optimize_model.mjs'),str(dst),str(here/(key+'.glb'))],check=True)
    bpy.data.objects.remove(obj,do_unlink=True);bpy.data.meshes.remove(mesh)
def finish_webp(key,base,light):
    lit=np.minimum(1.46,.63+.54*np.power(np.maximum(light,0),.65))
    final=np.clip(np.maximum(base,0)*lit,0,1)
    srgb=np.where(final<=.0031308,final*12.92,1.055*final**(1/2.4)-.055)
    rgb=np.rint(srgb[::-1]*255).astype(np.uint8);h,w=rgb.shape[:2]
    with TemporaryDirectory() as tmp:
        raw=Path(tmp)/'surface.rgb';raw.write_bytes(rgb.tobytes())
        subprocess.run(['node','--input-type=module','-e',
            "import sharp from 'sharp';import {readFile} from 'node:fs/promises';const [a,w,h,b]=process.argv.slice(1);await sharp(await readFile(a),{raw:{width:+w,height:+h,channels:3}}).webp({quality:88,effort:5}).toFile(b)",
            str(raw),str(w),str(h),str(here/(key+'-finish.webp'))],cwd=here.parents[2],check=True)
def bake(key,group):
    bpy.context.window.scene=source;graph=bpy.context.evaluated_depsgraph_get();v=[];f=[];mats=[];slots=[];sm=[]
    for obj in group.objects:
        if obj.type!='MESH':continue
        o=obj.evaluated_get(graph);me=o.to_mesh()
        try:
            off=len(v);v.extend(o.matrix_world@p.co for p in me.vertices)
            for face in me.polygons:
                f.append([off+i for i in face.vertices]);mat=me.materials[face.material_index]
                if mat not in mats:mats.append(mat)
                slots.append(mats.index(mat));sm.append(face.use_smooth)
        finally:o.to_mesh_clear()
    mesh=bpy.data.meshes.new(key+' 마감');mesh.from_pydata(v,[],f);mesh.update()
    for m in mats:mesh.materials.append(m.copy())
    mesh.polygons.foreach_set('material_index',slots);mesh.polygons.foreach_set('use_smooth',sm)
    mesh.uv_layers.new(name='피복과 주변광')
    bpy.context.window.scene=shop;instance=next(o for o in shop.objects if o.instance_collection==group)
    ob=bpy.data.objects.new('베이크 · '+key,mesh);shop.collection.objects.link(ob);ob.matrix_world=instance.matrix_world.copy();instance.hide_render=True
    size=lit_sizes[key];im=bpy.data.images.new('UV 마감',width=size,height=size,float_buffer=True);im.colorspace_settings.name='Non-Color'
    mats=list(mesh.materials)
    try:
        for m in mats:
            n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im;m.node_tree.nodes.active=n
        bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=radians(62),island_margin=.005,scale_to_bounds=True);bpy.ops.object.mode_set(mode='OBJECT')
        bpy.context.view_layer.update()
        samples=[]
        for flags in [{'COLOR'},{'DIRECT','INDIRECT'}]:
            bpy.ops.object.bake(type='DIFFUSE',pass_filter=flags,use_clear=True,margin=5,target='IMAGE_TEXTURES')
            buf=np.empty(size*size*4,dtype=np.float32);im.pixels.foreach_get(buf);samples.append(buf.reshape(size,size,4)[:,:,:3])
        finish_webp(key,*samples);ready=mesh.copy()
        if key=='case':
            # Alpha carries optical finish only. The game's steel frame stays opaque.
            strength={'mirror':.82,'steel':.10,'shelfEdge':.40,'brass':.59}
            values=np.ones((len(ready.loops),4),dtype=np.float32)
            for face in ready.polygons:
                name=ready.materials[face.material_index].name.split('.')[0]
                values[face.loop_start:face.loop_start+face.loop_total,3]=strength.get(name,.025)
            attr=ready.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
            attr.data.foreach_set('color',values.ravel());ready.color_attributes.active_color=attr
        ready.materials.clear()
        for face in ready.polygons:face.material_index=0
        packed(ready,key)
    finally:
        instance.hide_render=False;bpy.data.objects.remove(ob,do_unlink=True);bpy.data.meshes.remove(mesh);bpy.data.images.remove(im)
        for mat in mats:bpy.data.materials.remove(mat)
def template(key,data):
    coll=bpy.data.collections.new('내보낼 상품 송이');source.collection.children.link(coll)
    obj=bpy.data.objects.new(key,data);coll.objects.link(obj);bpy.context.view_layer.update()
    try:bake_collection(coll,key,here/(key+'.glb'),simplification=(.61,.00058),preserve_smoothing=True,color_attribute='Petal pigment')
    finally:bpy.data.objects.remove(obj,do_unlink=True);bpy.data.collections.remove(coll)
def pine_atlas(mesh):
    sc=bpy.data.scenes.new('가지 불투명도 사진');sc.world=shop.world;sc.render.engine='CYCLES';sc.cycles.samples=24;sc.render.film_transparent=True
    sc.render.resolution_x=512;sc.render.resolution_y=320;sc.render.resolution_percentage=100;sc.render.image_settings.file_format='PNG';sc.render.image_settings.color_mode='RGBA'
    sc.view_settings.view_transform='Standard';bpy.context.window.scene=sc
    ob=bpy.data.objects.new('촬영용 실제 가지',mesh);sc.collection.objects.link(ob)
    cd=bpy.data.cameras.new('침엽 정사영');cd.type='ORTHO';cd.ortho_scale=.474;c=bpy.data.objects.new('침엽 정사영',cd);sc.collection.objects.link(c);sc.camera=c
    for loc,power in [((-.34,-.38,.56),6.6),((.52,.40,.72),8.1)]:
        ld=bpy.data.lights.new('부드러운 가지 측광','AREA');ld.energy=power;ld.size=.59
        lo=bpy.data.objects.new(ld.name,ld);sc.collection.objects.link(lo);lo.location=loc;lo.rotation_euler=(Vector((.19,0,.018))-lo.location).to_track_quat('-Z','Y').to_euler()
    with TemporaryDirectory() as temp:
        for i,(loc,rot) in enumerate([((.201,0,.71),(0,0,0)),((.201,-.70,.029),(1.57079632679,0,0))]):
            c.location=loc;c.rotation_euler=rot;sc.render.filepath=str(Path(temp)/(str(i)+'.png'));bpy.ops.render.render(write_still=True)
        subprocess.run(['node','--input-type=module','-e',
            "import sharp from 'sharp';const [a,b,out]=process.argv.slice(1);await sharp({create:{width:512,height:640,channels:4,background:'#00000000'}}).composite([{input:a,left:0,top:0},{input:b,left:0,top:320}]).webp({quality:90,alphaQuality:99}).toFile(out);",
            str(Path(temp)/'0.png'),str(Path(temp)/'1.png'),str(here/'conifer.webp')],cwd=here.parents[2],check=True)
    bpy.context.window.scene=source
def portable(key,group,done):
    bpy.context.window.scene=source;bpy.context.view_layer.update();items={};body=[]
    for o in sorted(group.objects,key=lambda o:o.name):
        species=o.get('web_flower')
        if not species:body.append(o);continue
        mat=C@o.matrix_world@C.inverted();p,q,s=mat.decompose()
        items.setdefault(species,[]).append([*[round(v,5) for v in p],*[round(v,5) for v in (q.x,q.y,q.z,q.w)],*[round(v,5) for v in s]])
        if species not in done:
            if species=='pineBough':pine_atlas(o.data)
            else:template(species,o.data)
            done.add(species)
    if items:(here/(key+'-poses.json')).write_text(json.dumps(items,separators=(',',':'))+'\n')
    coll=bpy.data.collections.new('내보낼 집기와 줄기');source.collection.children.link(coll)
    for ob in body:coll.objects.link(ob)
    try:
        if key!='bulbs':
            simplification=(.20,.0014) if key=='brand' else (.76,.00077)
            bake_collection(coll,key,here/(key+'.glb'),simplification=simplification,preserve_smoothing=True,color_attribute='Petal pigment')
    finally:bpy.data.collections.remove(coll)
    if key=='bulbs':
        # One point light sprite per photographed-style short LED. Store quantized positions
        # only; the octahedral glass LED capsules themselves stay in the GLB.
        o=next(o for o in body if o.get('emissive_bulbs'));coords=np.array([list(C@(o.matrix_world@v.co)) for v in o.data.vertices])
        centers=coords.reshape(-1,6,3).mean(axis=1)
        (here/'bulbs-mm.bin').write_bytes(np.rint(centers*1000).astype('<i2').tobytes())
shop.cycles.samples=64;shop.cycles.diffuse_bounces=2
only=set(sys.argv[sys.argv.index('--parts')+1:]) if '--parts' in sys.argv else None;done=set()
if '--sprites' in sys.argv or only is None:
    from impostors import photograph
    photograph(groups.values(),here)
if '--sprites' in sys.argv:sys.exit(0)
for k,g in groups.items():
    if only and k not in only:continue
    if k in lit_sizes:bake(k,g)
    else:portable(k,g,done)
    print('FLORIST EXPORTED',k,flush=True)
