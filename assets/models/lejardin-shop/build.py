"""Author the public florist and retain all assemblies, flowers, foliage and local shop lights."""
from pathlib import Path
import json,subprocess,sys
from mathutils import Vector
import bpy
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
import botany,evergreen,fixtures

def registry():
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',
        "import {parts,prefix,rows} from './layout.js';console.log(JSON.stringify({parts,prefix,rows}));"],cwd=here))
colors={
 'limestone':'d3c2ac','stoneEdge':'e1d3bc','flute':'b4a28c','joint':'a69d8d','floor':'e7e5dd','floorCool':'e0e1db','vein':'d6d5cf',
 'wall':'e5ded1','white':'f4f0e6','black':'232425','steel':'363333','darkBronze':'4c423a','brass':'948774','mirror':'a2a696','shelfEdge':'545545',
 'wood0':'77513c','wood1':'654737','velvet':'7e1726','ribbon':'751623','brown':'564135','twig':'66573c',
 'letter':'fffbec','glow':'f4e4c0','glass':'d2e2df','water':'b8d7cf','clearEdge':'b5c4c3',
 'leaf':'4d754e','leafDark':'38583f','sage':'688163','stem':'75915c','pigment':'e1e3d9',
 'paperPink':'cca5af','whitePaper':'f0e8db','paperBlush':'e4cdba','kraft':'c69b69','vellum':'e2ddca','paperSoft':'e3cba5','ivoryPaper':'eae7d5','ink':'8e7271',
}
cfg=registry()
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='센트럴시티 122-1호 · 르자당';scene.unit_settings.system='METRIC'
scene['naver_place']='https://map.naver.com/p/entry/place/1654024884'
scene['seasonal_public_photos']='https://m.blog.naver.com/mattias7/224466753309'
scene['placement']='기존 오픈 스테이지 매장에 맞춘 재구성. 지도 핀과 게임 입구는 구별된다.'
m.palette={k:m.material(k,v,.61 if k in ['brass','darkBronze','shelfEdge','mirror'] else .12 if k in ['steel','floor','floorCool'] else 0) for k,v in colors.items()}
for key,mat in m.palette.items():
    graph=mat.node_tree;shader=graph.nodes.get('Principled BSDF');rough=.8 if key in ['limestone','paperPink','wall','leaf','kraft'] else .46
    shader.inputs['Roughness'].default_value=rough
    if key in ['glass','water','clearEdge','vellum']:
        shader.inputs['Transmission Weight'].default_value=.86 if key!='vellum' else .26
        shader.inputs['IOR'].default_value=1.33 if key=='water' else 1.47;shader.inputs['Roughness'].default_value=.065 if key!='vellum' else .32
    if key in ['glass','water','clearEdge']:
        # The reference shows a clear cooler with faint reflections at grazing incidence.
        # Pane modelling uses both optical surfaces; limit the base reflection to avoid a milky display.
        transparent=graph.nodes.new('ShaderNodeBsdfTransparent');mix=graph.nodes.new('ShaderNodeMixShader')
        fresnel=graph.nodes.new('ShaderNodeFresnel');fresnel.inputs['IOR'].default_value=1.28 if key=='glass' else 1.38
        graph.links.new(fresnel.outputs[0],mix.inputs[0]);graph.links.new(transparent.outputs[0],mix.inputs[1]);graph.links.new(shader.outputs[0],mix.inputs[2])
        graph.links.new(mix.outputs[0],graph.nodes.get('Material Output').inputs['Surface'])
    if key in ['letter','glow']:
        shader.inputs['Emission Color'].default_value=mat.diffuse_color
        shader.inputs['Emission Strength'].default_value=2.9 if key=='letter' else 2.2
    if key=='pigment':
        node=graph.nodes.new('ShaderNodeVertexColor');node.layer_name='Petal pigment'
        graph.links.new(node.outputs['Color'],shader.inputs['Base Color']);shader.inputs['Subsurface Weight'].default_value=.12
        shader.inputs['Subsurface Scale'].default_value=.0006
    if key in ['wood0','wood1','limestone','floor','floorCool','velvet','kraft','wall']:
        noise=graph.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=76 if key=='velvet' else 5.6
        noise.inputs['Detail'].default_value=3.9
        coords=graph.nodes.new('ShaderNodeTexCoord');mapping=graph.nodes.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY'
        mapping.inputs[1].default_value=(9.0,4.0,.45) if key.startswith('wood') else (2,4,1)
        graph.links.new(coords.outputs['Generated'],mapping.inputs[0]);graph.links.new(mapping.outputs[0],noise.inputs['Vector'])
        ramp=graph.nodes.new('ShaderNodeValToRGB');v=mat.diffuse_color[:]
        ramp.color_ramp.elements[0].color=tuple(c*.72 for c in v[:3])+(1,);ramp.color_ramp.elements[1].color=tuple(min(1,c*1.16) for c in v[:3])+(1,)
        graph.links.new(noise.outputs['Fac'],ramp.inputs[0]);graph.links.new(ramp.outputs[0],shader.inputs['Base Color'])
        bump=graph.nodes.new('ShaderNodeBump');bump.inputs['Distance'].default_value=.0016;bump.inputs['Strength'].default_value=.19
        graph.links.new(noise.outputs['Fac'],bump.inputs['Height']);graph.links.new(bump.outputs[0],shader.inputs['Normal'])
builders={'shell':fixtures.shell,'front':fixtures.portal,'brand':fixtures.brand,'case':fixtures.cooler,'clear':fixtures.doors,'vases':fixtures.vaseware,
          'counter':fixtures.counter,'cards':fixtures.stand,'blueWrap':lambda:fixtures.bouquet(False),'mixedWrap':lambda:fixtures.bouquet(True),
          'bulbs':evergreen.lights,'parcels':evergreen.packages}
groups={}
for key,(name,*_) in cfg['parts'].items():
    group=bpy.data.collections.new(cfg['prefix']+name);scene.collection.children.link(group);groups[key]=group;m.group=group
    if key in botany.COLORS:botany.bank(key)
    elif key in evergreen.sizes:evergreen.make(key)
    else:builders[key]()
source=bpy.data.scenes.new('편집 소품과 화훼 원형');source.unit_settings.system='METRIC'
for group in groups.values():scene.collection.children.unlink(group);source.collection.children.link(group)
shop=bpy.data.collections.new('매장에 놓인 작품');scene.collection.children.link(shop)
for key,x,d,h in cfg['rows']:
    group=groups[key];ob=bpy.data.objects.new(group.name,None);ob.instance_type='COLLECTION';ob.instance_collection=group
    ob.location=(x,-d,h);ob.empty_display_size=.05;shop.objects.link(ob)
studio=bpy.data.collections.new('매장 조명과 촬영기');scene.collection.children.link(studio)
def aim(obj,loc,at):
    obj.location=(loc[0],-loc[1],loc[2]);target=Vector((at[0],-at[1],at[2]));obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
def light(name,loc,at,watts,size,tint=(1,.97,.90)):
    data=bpy.data.lights.new(name,'AREA');data.energy=watts;data.shape='DISK';data.size=size;data.color=tint
    obj=bpy.data.objects.new(name,data);studio.objects.link(obj);aim(obj,loc,at)
light('광장 천장 빛',(.27,-3.6,4.5),(0,.4,1.55),610,3.7)
light('전면 우측 간접광',(-4.2,-2.3,2.8),(-1.1,.3,1.6),258,2.1,(.89,.94,1))
light('매장 안쪽 매립등',(1.16,3.1,3.18),(1.02,4.05,.88),138,1.4)
light('카드와 손질대 위 조명',(2.35,.8,3.14),(2.4,.55,.55),106,1.03)
light('정면 유리 위의 확산광',(-1.12,.81,3.15),(-1.1,1.62,1.23),131,1.65)
for x in [-1.96,-.95,.03]:
    for z in [.86,1.375,1.91]:light('절화 냉장고의 선반등',(x,1.50,z),(x,1.72,z-.35),3.4,.46,(1,.94,.79))
light('뒷벽 간접광',(-.34,4.35,2.76),(0,4.5,1.2),103,1.38)
ctx=bpy.data.collections.new('촬영용 광장 바닥');scene.collection.children.link(ctx);m.group=ctx
m.block('사진에서 광장으로 이어지는 석재',0,-3.25,-.065,12,6.60,.093,'limestone')
for d in [-1.15,-3.78]:m.block('공용 광장의 짙은 석재 띠',0,d,.028,11.22,.138,.01,'steel')
def camera(name,loc,target,lens):
    data=bpy.data.cameras.new(name);data.lens=lens;data.clip_start=.008
    ob=bpy.data.objects.new(name,data);studio.objects.link(ob);aim(ob,loc,target);return ob
cams=[
 camera('광장 앞 흰 간판과 조명 트리',(1.22,-7.83,1.68),(-.13,.25,1.64),34),
 camera('절화 냉장고의 세 단',(-.31,-1.0,1.46),(-1.03,1.72,1.14),40),
 camera('버건디 포장과 작은 전구',(-3.08,-2.46,1.40),(-1.89,-.28,.95),41),
 camera('장미와 수국 근접',(-.88,1.12,1.33),(-1.18,1.72,1.06),50),
 camera('아이보리 꽃다발',(.64,3.08,1.54),(.72,3.95,1.43),56),
 camera('크라프트 혼합 꽃다발',(1.42,3.22,1.48),(1.40,3.99,1.40),54),
 camera('전면 황동 하드웨어와 석재',(-2.16,-2.47,1.33),(-2.72,-.02,1.62),41),
]
scene.camera=cams[0];world=bpy.data.worlds.new('부드러운 실내 광장');world.use_nodes=True
world.node_tree.nodes.get('Background').inputs[0].default_value=(.47,.50,.54,1);world.node_tree.nodes.get('Background').inputs[1].default_value=.38;scene.world=world
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.cycles.max_bounces=7;scene.cycles.transparent_max_bounces=8
scene.render.resolution_x=1000;scene.render.resolution_y=665;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG'
scene.render.image_settings.quality=91;scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0;scene['editable_mesh_objects']=sum(o.type=='MESH' for g in groups.values() for o in g.objects)
scene['flower_heads_and_boughs']=sum('web_flower' in o for g in groups.values() for o in g.objects)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'flowershop.blend'),compress=True)
print('FLORIST',len(groups),scene['editable_mesh_objects'],scene['flower_heads_and_boughs'],flush=True)
if '--studio' in sys.argv:
    dest=Path(sys.argv[sys.argv.index('--studio')+1]);dest.mkdir(exist_ok=True,parents=True)
    for i,c in enumerate(cams):
        scene.camera=c;scene.render.filepath=str(dest/(str(i)+'.jpg'));bpy.ops.render.render(write_still=True)
