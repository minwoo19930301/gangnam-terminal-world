"""Create the public JW 8F lounge table settings and editable studio in metric Blender coordinates."""
from pathlib import Path
from math import sin,cos,pi,tau
import sys,subprocess
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
import finishes,winter,porcelain,dumplings
from export import registry,export

bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene.name='JW 8층 더 라운지 · 실제 플레이 식탁';cfg=registry(here)
scene['official_menu_photo']='https://www.marriott.com/ko/hotels/seljw-jw-marriott-hotel-seoul/photos/'
scene['naver_place']='https://map.naver.com/p/entry/place/1780808607'
scene['winter_reference']='https://kr.acrofan.com/detail.php?number=462830'
scene['scale_note']='Serving pieces and their table positions are fitted to the game. Public photos identify courses, shapes and finishes.'
finishes.materials(m,finishes.atlas(here))
def blue():
    porcelain.tea_pot(.056,.025,0,True);porcelain.teacup(-.085,-.049,0,True)
def white():
    porcelain.saucer(.039,.031,0,.082,.008);porcelain.tea_pot(.039,.031,.007,False)
    for x,d in [(-.115,-.042),(.121,-.067)]:porcelain.teacup(x,d,0,False)
makers={'stand':winter.stand,'sweets':winter.sweets,'blueTea':blue,'whiteTea':white,'scones':winter.scones,
        'soda':lambda:porcelain.highball(0,0,0),'flowers':winter.flower,'baskets':dumplings.main_baskets,
        'course':dumplings.appetizer,'ribs':dumplings.family_ribs,'sticks':lambda:porcelain.chopsticks(0,0,0)}
groups={}
for key,entry in cfg['parts'].items():
    group=bpy.data.collections.new(cfg['prefix']+entry[0]);scene.collection.children.link(group)
    groups[key]=group;group['preview_origin']=[0,0,0];m.group=group
    if key in makers:makers[key]()
for opaque,clear in [('soda','sodaGlass'),('scones','sconeGlass')]:
    for ob in list(groups[opaque].objects):
        if ob.data.materials[0].get('swatch')=='glass':
            groups[opaque].objects.unlink(ob);groups[clear].objects.link(ob)
for group in groups.values():finishes.uvs(group)
source=bpy.data.scenes.new('편집 · 개별 집기와 음식')
for group in groups.values():scene.collection.children.unlink(group);source.collection.children.link(group)
arranged=bpy.data.collections.new('3개 공개 석상의 플레이 배치');scene.collection.children.link(arranged)
BASE=28
for p in cfg['rows']:
    key=p['key'];ob=bpy.data.objects.new(groups[key].name,None);ob.instance_type='COLLECTION';ob.instance_collection=groups[key]
    ob.location=(p['u'],BASE-p['v'],p['h']);ob.rotation_euler.z=p['angle'];ob.empty_display_size=.026;arranged.objects.link(ob)
context=bpy.data.collections.new('촬영용 석재 테이블과 중성 바닥');scene.collection.children.link(context);m.group=context
table=m.material('오트밀 대리석의 밝은 결','d6c5ae');m.palette['tableSample']=table
nt=table.node_tree;bs=nt.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.30
wave=nt.nodes.new('ShaderNodeTexNoise');wave.inputs['Scale'].default_value=4.3;wave.inputs['Distortion'].default_value=1.2
ramp=nt.nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.23;ramp.color_ramp.elements[0].color=(.47,.39,.31,1)
ramp.color_ramp.elements[1].position=.74;ramp.color_ramp.elements[1].color=(.73,.64,.54,1)
nt.links.new(wave.outputs['Fac'],ramp.inputs[0]);nt.links.new(ramp.outputs[0],bs.inputs['Base Color'])
m.palette['ground']=m.material('사진용 웜 그레이 배경','b2a293')
for key,(u,v,h) in cfg['centers'].items():
    rx=.78 if key=='winter' else .62;rz=1.12 if key=='winter' else .62
    oval=m.profile('좌석 전경에 보이는 대리석 원탁',u,v-BASE,h-.051,
                   [(rx*.986,0),(rx*.996,.002),(rx,.009),(rx,.045),(rx*.996,.050),(rx*.989,.051)],'tableSample',100,rz/rx)
    m.profile('촬영용 테이블 받침',u,v-BASE,.02,[(.17,0),(.17,.021),(.059,.027),(.059,h-.06)],'darkGold',32)
m.block('매끈한 촬영 바닥',-1,0,-.026,14,28,.026,'ground')
for folder,filename,collection,u,v in [
        ('lounge-upholstery','sofa.blend','더 라운지 · 크림색 코너 소파',-3.65,34.35),
        ('lounge-drapery','drapes.blend','더 라운지 · 묶은 주름 커튼',-4.74,30.58)]:
    with bpy.data.libraries.load(str(here.parent/folder/filename),link=True,relative=True) as (src,dst):dst.collections=[collection]
    ob=bpy.data.objects.new('기존 라운지의 촬영용 '+collection,None);ob.instance_type='COLLECTION';ob.instance_collection=dst.collections[0]
    ob.location=(u,BASE-v,0);context.objects.link(ob)
studio=bpy.data.collections.new('조명 · 여섯 가까운 시점');scene.collection.children.link(studio)
def pos(k,x,d,z):
    u,v,h=cfg['centers'][k];return Vector((u+x,BASE-v-d,h+z))
def face(ob,location,target):
    ob.location=location;ob.rotation_euler=(target-location).to_track_quat('-Z','Y').to_euler()
def light(k,name,place,target,power,size,tint):
    piece=bpy.data.lights.new(name,'AREA');piece.energy=power;piece.shape='DISK';piece.size=size;piece.color=tint
    o=bpy.data.objects.new(name,piece);studio.objects.link(o);face(o,pos(k,*place),pos(k,*target))
for k in cfg['centers']:
    light(k,'창문에서 들어온 넓은 확산광',(-.84,-.71,1.08),(0,0,.12),33,1.00,(1,.91,.81))
    light(k,'천장과 소파에서 번지는 반사광',(.79,-.10,.79),(.01,.02,.09),20,.78,(.88,.92,1))
    light(k,'유리와 황동 가장자리의 긴 조명',(.31,.72,.95),(.02,.03,.17),37,.66,(1,.86,.70))
world=bpy.data.worlds.new('호텔 실내의 간접광');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.60,.55,.49,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.32;scene.world=world
def camera(k,name,loc,target,lens):
    c=bpy.data.cameras.new(name);c.lens=lens;c.clip_start=.003;c.clip_end=80
    ob=bpy.data.objects.new(name,c);studio.objects.link(ob);face(ob,pos(k,*loc),pos(k,*target));return ob
cams=[
 camera('winter','윈터 블리스 상차림',(-.36,1.45,.59),(0,.026,.225),45),
 camera('winter','딸기 디저트와 황동 트레이',(-.23,.62,.45),(-.015,.01,.331),55),
 camera('winter','세이보리와 디저트 중단',(-.24,.52,.27),(-.014,.007,.20),55),
 camera('winter','청회색 주전자와 스콘',(.59,.80,.32),(.10,.17,.074),48),
 camera('dimsum','세 찜기와 하얀 차 주전자',(.42,-.95,.81),(-.04,.02,.032),47),
 camera('dimsum','찜기 속 다른 만두 주름',(-.04,-.56,.32),(-.111,-.035,.036),57),
 camera('family','등갈비와 대나무 찜기',(.40,-.78,.68),(-.04,.02,.027),47),
]
scene.camera=cams[0];scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True
scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.34
scene.render.resolution_x=880;scene.render.resolution_y=580;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
bpy.context.preferences.filepaths.save_version=0
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(here/'lounge-tables.blend'),compress=True)
print('PUBLIC TABLES',len(groups),'native groups,',sum(len(c.objects) for c in groups.values()),'editable components',flush=True)
if '--studio-dir' in sys.argv:
    path=Path(sys.argv[sys.argv.index('--studio-dir')+1]);path.mkdir(parents=True,exist_ok=True)
    for i,cam in enumerate(cams):scene.camera=cam;scene.render.filepath=str(path/(str(i)+'.jpg'));bpy.ops.render.render(write_still=True)
    scene.camera=cams[0]
if '--native-only' not in sys.argv:export(here,groups)
