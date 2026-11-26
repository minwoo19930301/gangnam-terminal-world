"""Bake soft cast shadows from the assembled shop's fixtures and merchandise before lossy mesh compression."""
from math import radians
import bpy
from blender_light_atlas import game_image
from export import packed

SIZES={'envelope':1024,'back':768,'table':512,'shelf':512,'bench':512,'puffer':512,'navy':512,'bow':512}

def combine(coll):
    verts=[];faces=[];slots=[];materials=[];smooth=[];colors=[]
    graph=bpy.context.evaluated_depsgraph_get()
    for source in sorted(coll.objects,key=lambda item:item.name):
        ob=source.evaluated_get(graph);src=ob.to_mesh()
        try:
            off=len(verts);verts.extend(ob.matrix_world@v.co for v in src.vertices)
            for p in src.polygons:
                faces.append(tuple(off+i for i in p.vertices));smooth.append(p.use_smooth)
                mat=src.materials[p.material_index]
                if mat not in materials:materials.append(mat)
                slots.append(materials.index(mat));colors.extend(list(mat.diffuse_color)*len(p.vertices))
        finally:ob.to_mesh_clear()
    mesh=bpy.data.meshes.new('Lightmap refresh')
    mesh.from_pydata(verts,[],faces);mesh.update()
    for mat in materials:mesh.materials.append(mat.copy())
    mesh.polygons.foreach_set('material_index',slots);mesh.polygons.foreach_set('use_smooth',smooth)
    mesh.color_attributes.new(name='COLOR_0',domain='CORNER',type='BYTE_COLOR').data.foreach_set('color',colors)
    mesh.uv_layers.new(name='Shop lighting')
    return mesh

def sales_floor(here,groups):
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=112
    scene.cycles.use_adaptive_sampling=False;scene.cycles.seed=19;scene.cycles.max_bounces=4;scene.cycles.diffuse_bounces=2
    for key,size in SIZES.items():
        coll=groups[key];instance=next(ob for ob in scene.objects if ob.instance_collection==coll)
        mesh=combine(coll);target=bpy.data.objects.new('베이크 · '+key,mesh);scene.collection.objects.link(target)
        target.matrix_world=instance.matrix_world.copy();instance.hide_render=True
        im=bpy.data.images.new('불빛과 접촉 음영',width=size,height=size,float_buffer=True)
        im.colorspace_settings.name='Non-Color';mats=list(mesh.materials)
        try:
            for mat in mats:
                nodes=mat.node_tree.nodes;node=nodes.new('ShaderNodeTexImage');node.image=im;nodes.active=node
            bpy.ops.object.select_all(action='DESELECT');target.select_set(True);bpy.context.view_layer.objects.active=target
            bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
            bpy.ops.uv.smart_project(angle_limit=radians(65),island_margin=.004,correct_aspect=True,scale_to_bounds=True)
            bpy.ops.object.mode_set(mode='OBJECT');bpy.context.view_layer.update()
            bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT'},use_clear=True,margin=4,
                                target='IMAGE_TEXTURES',uv_layer='Shop lighting')
            game_image(here/(key+'-light.webp'),im)
            baked=mesh.copy();baked.materials.clear()
            for poly in baked.polygons:poly.material_index=0
            packed(here,baked,key)
        finally:
            instance.hide_render=False;bpy.data.objects.remove(target,do_unlink=True)
            bpy.data.meshes.remove(mesh);bpy.data.images.remove(im)
            for mat in mats:bpy.data.materials.remove(mat)
