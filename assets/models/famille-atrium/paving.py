"""Bake a seamless four-by-four honed-stone sample from editable Blender pavers."""
from pathlib import Path
from random import Random
import bpy


def render_paving(destination):
    main=bpy.context.scene
    scene=bpy.data.scenes.new('광장 포장 · 석재 마감 견본')
    coll=bpy.data.collections.new('광장 포장 · 줄눈과 잔골재')
    scene.collection.children.link(coll)
    bpy.context.window.scene=scene
    rng=Random(24)
    pitch=.245
    side=4*pitch
    def mat(name, colour):
        m=bpy.data.materials.new(name)
        m.use_nodes=True
        m.diffuse_color=(*colour,1)
        return m

    joint=mat('줄눈 · 밝은 회색',(.19,.18,.16))
    stone=mat('화강석 · 차콜',(.065,.069,.067))
    nodes=stone.node_tree.nodes
    bsdf=nodes.get('Principled BSDF')
    noise=nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value=155
    noise.inputs['Detail'].default_value=2.2
    coords=nodes.new('ShaderNodeTexCoord')
    stone.node_tree.links.new(coords.outputs['Object'],noise.inputs['Vector'])
    tint=nodes.new('ShaderNodeValToRGB')
    for e,c in zip(tint.color_ramp.elements,[(.032,.039,.037,1),(.116,.109,.093,1)]): e.color=c
    stone.node_tree.links.new(noise.outputs['Fac'],tint.inputs['Fac'])
    obinfo=nodes.new('ShaderNodeObjectInfo')
    mix=nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=.38
    stone.node_tree.links.new(tint.outputs[0],mix.inputs[1])
    stone.node_tree.links.new(obinfo.outputs['Color'],mix.inputs[2])
    stone.node_tree.links.new(mix.outputs[0],bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value=.79
    grout_bsdf=joint.node_tree.nodes.get('Principled BSDF')
    grout_bsdf.inputs['Base Color'].default_value=joint.diffuse_color
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)]
    def tile_mesh(name,width,height,material):
        d=bpy.data.meshes.new(name)
        d.from_pydata([(x*width/2,y*width/2,z*height) for z in (0,1) for y in (-1,1) for x in (-1,1)],[],faces)
        d.update(); d.materials.append(material)
        return d
    def place(name,geometry,x,y,z):
        o=bpy.data.objects.new(name,geometry); coll.objects.link(o)
        o.location=(x,y,z);return o
    place('줄눈 바탕',tile_mesh('줄눈',side+.45,.015,joint),0,0,-.015)
    tiles=tile_mesh('모서리를 다듬은 포석',pitch-.004,.022,stone)
    variants=[.53+rng.random()*.43 for _ in range(16)]
    for row in range(-1,5):
        for col in range(-1,5):
            ob=place('포석',tiles,(col-1.5)*pitch,(row-1.5)*pitch,0)
            tone=variants[4*(row%4)+col%4]
            ob.color=(tone,tone*.99,tone*.97,1)
            bevel=ob.modifiers.new('작은 모서리 면','BEVEL');bevel.width=.0022;bevel.segments=2
    scene.world=bpy.data.worlds.new('포장 견본 · 흐린 하늘')
    scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(1,1,1,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=.85
    camera=bpy.data.cameras.new('포장 견본 정사 카메라')
    camera.type='ORTHO';camera.ortho_scale=side
    ob=bpy.data.objects.new('포장 견본 정사 카메라',camera)
    scene.collection.objects.link(ob); ob.location=(0,0,3);scene.camera=ob
    sun=bpy.data.lights.new('줄눈 사광','SUN')
    sun.energy=1.2;sun.angle=.35
    l=bpy.data.objects.new('줄눈 사광',sun)
    scene.collection.objects.link(l);l.rotation_euler=(.64,-.52,0)
    scene.render.engine='CYCLES';scene.cycles.samples=16
    scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='WEBP';scene.render.image_settings.quality=89
    scene.render.filepath=str(destination);bpy.ops.render.render(write_still=True)
    bpy.context.window.scene=main
    bpy.data.images.load(str(destination)).pack()
