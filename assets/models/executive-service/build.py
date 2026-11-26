"""Native JW Seoul executive-lounge beverage and pastry service, in metres."""
from pathlib import Path
from math import sin,cos,pi
from mathutils import Vector
from random import Random
import bpy,json,sys,subprocess
here=Path(__file__).resolve().parent
sys.path[:0]=[str(here),str(here.parent/'flavors-breakfast'),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from kitchen import B,R,platter,card,P
from coffee import coffee
from bakery import treats
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {rows,parts,prefix} from './layout.js';console.log(JSON.stringify({rows,parts,prefix}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='JW 메리어트 9층 · 라운지 서비스';scene.unit_settings.system='METRIC'
colors={'ink':'393631','black':'262726','bronze':'785941','tin':'c1bfb3','chrome':'d2d5ce','screen':'304957','screen2':'546b72','white':'f1ece2','paper':'eae8d9',
 'bean':'34251d','roast':'503225','beanlight':'6b4936','glass':'d6e8df','smoke':'343531','candyglass':'d6e8df','cream':'e9d4a9','butter':'d4b57f','biscuit':'b5824e','gold':'bc9055',
 'dark':'493027','cocoa':'745247','apricot':'e0a16f','rose':'d98a9e','pistachio':'a5ab69','lemon':'e4c363','berry':'a75c66','caramel':'ba8859','green':'697c55',
 'blue':'6e9bb4','salmon':'d98f76','wood':'725742','inset':'664b39','grain':'80634c','stone':'e5dfce','vein':'c7c0ad','brass':'b49971'}
for k,col in colors.items():
    metal=.82 if k in ['chrome','tin'] else .55 if k in ['brass','bronze'] else 0
    mat=m.material(k,col,metal);m.palette[k]=mat;bs=mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value=.14 if k in ['glass','candyglass','chrome','screen','screen2'] else .28 if k in ['tin','white','stone'] else .48
    if k in ['candyglass','glass']:bs.inputs['Transmission Weight'].default_value=.96;bs.inputs['IOR'].default_value=1.48
groups={}
def group(k):
    c=bpy.data.collections.new(cfg['prefix']+cfg['parts'][k][0]);scene.collection.children.link(c);groups[k]=c;m.group=c;c['preview_origin']=(0,0,0)
group('cabinet')
B('안으로 물린 짙은 걸레받이',0,0,.001,6.35,.672,.102,'black',.009)
B('월넛 장',0,0,.101,6.42,.750,.736,'wood',.008)
for i in range(10):
    x=(i-4.5)*.639
    B('원목 장의 문짝',x,.374,.129,.628,.020,.681,'inset',.003)
    for j in range(13):
        xx=x+(j-6)*.048;R('나무 결',[(xx+.003*sin(i+j+k),.385,.148+k*.071) for k in range(10)],.0011,'grain',4)
    R('황동 손잡이',[(x-.084,.386,.730),(x-.084,.407,.730),(x+.084,.407,.730),(x+.084,.386,.730)],.005,'brass',8)
B('연마한 밝은 석재',0,0,.836,6.48,.813,.054,'stone',.008)
rnd=Random(398)
for k in range(100):
    x=rnd.uniform(-3.1,3.1);d=rnd.uniform(-.38,.24);length=rnd.uniform(.044,.136)
    R('돌 결',[(x+j*.009+.004*sin(k+j),d+length*j/9,.8905) for j in range(10)],.0011,'vein',4)
group('wall')
B('라운지 다과 벽장',0,-.018,.001,6.47,.144,1.72,'wood',.009)
B('매립 진열의 밝은 뒷판',-2.32,.060,.008,1.70,.044,1.39,'stone',.004)
for z in [.268,.683,1.125]:
    B('매립장의 긴 통풍구',-2.32,.085,z,1.23,.010,.064,'black',.003)
    for j in range(3):B('검은 슬롯 사이 루버',-2.32,.091,z+.010+j*.019,1.219,.004,.004,'tin')
for i in range(31):
    x=-1.463+i*.060;B('세로 황동 살',x,.077,.008,.010,.021,1.09,'brass',.0015)
for i in range(6):B('가느다란 가로 결속재',-.564,.066,.119+i*.178,1.815,.013,.009,'bronze')
B('커피 서비스 벽감',1.85,.074,.003,2.75,.023,.987,'inset')
for x in [.471,2.055,3.186]:B('목재 벽감 프레임',x,.125,.003,.045,.122,1.04,'wood',.003)
for j in range(3):B('잔 뒤쪽 오픈 선반',2.62,.118,.277+j*.303,1.115,.135,.029,'wood',.003)
for j in range(4):
    x=.83+j*.68;B('벽장 상부 도어',x,.093,1.045,.668,.061,.62,'grain',.005)
B('벽감 상부 금속 두겁',1.835,.128,.996,2.75,.121,.033,'brass',.003)
group('cakes')
platter('작은 슈 페이스트리 플래터',-.079,.178,0,.158,'white',.79)
for i in range(12):
    xx=-.080+(i%4-1.5)*.054;dd=.176+(i//4-1)*.058
    P('두 입 크기 구운 페이스트리',xx,dd,.018,[(.023,0),(.027,.008),(.025,.035),(.018,.045),(.010,.049)],'gold' if i%2 else 'butter',12,.91)
for j,(a,b) in enumerate([('초콜릿 쿠키','CHOCOLATE'),('버터 쿠키','BUTTER'),('초코칩 쿠키','CHOCOLATE CHIP')]):
    card((j-1)*.332,-.010,.007,.132,.061,a,b,True)
coffee(group);treats(group)
for c in groups.values():scene.collection.children.unlink(c)
for r in cfg['rows']:
    ob=bpy.data.objects.new(r['key']+' · 실배치',None);scene.collection.objects.link(ob);ob.instance_type='COLLECTION';ob.instance_collection=groups[r['key']]
    ob.location=(r['u']-11.4,-(r['v']-6.85),r['y']-41);ob.empty_display_size=.04;ob['web_part']=r['key']
scene.world=bpy.data.worlds.new('창가의 간접광');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.67,.62,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.53
def light(name,loc,aim,power,size,color):
    l=bpy.data.lights.new(name,'AREA');l.energy=power;l.shape='DISK';l.size=size;l.color=color
    ob=bpy.data.objects.new(name,l);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(aim)-ob.location).to_track_quat('-Z','Y').to_euler()
for i,x in enumerate([-2.65,-1.52,-.33,.86,2.23]):light('상판 상부 라운지 조명',(x,.1,2.9),(x,-.13,1.07),81,.72,(1,.88,.72))
light('창문에서 들어온 확산광',(-1.4,-3.88,2.25),(.34,0,1.06),460,3.6,(.89,.94,1))
light('기기 측면 하이라이트',(3.64,-.64,2.07),(1.3,0,1.21),89,1.7,(1,.91,.81))
cam=bpy.data.cameras.new('서비스 테이블');ob=bpy.data.objects.new('라운지 진열',cam);scene.collection.objects.link(ob);scene.camera=ob
def aim(loc,target,lens):
    ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
views=[((2.27,-1.44,1.85),(1.39,0,1.38),44),((-.68,-1.25,1.65),(-.68,0,1.04),47),((-2.93,-1.34,1.89),(-2.31,0,1.48),42),((2.9,-5.63,3.06),(.12,0,1.05),35)]
aim(*views[-1]);scene.view_settings.view_transform='AgX';bpy.context.preferences.filepaths.save_version=0
for ar in bpy.context.screen.areas:
    if ar.type=='VIEW_3D':ar.spaces.active.region_3d.view_distance=7;ar.spaces.active.region_3d.view_location=(0,0,1)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'lounge.blend'),compress=True)
for k,c in groups.items():
    scene.collection.children.link(c);bpy.context.view_layer.update();bake_collection(c,k,here/(k+'.glb'),preserve_smoothing=True,simplification=(.66,.00025));scene.collection.children.unlink(c)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    evening_preview=next(o for o in scene.objects if o.get('web_part')=='evening');evening_preview.hide_render=True
    bake_furnished(here,scene.name,[(k,groups[k].name,n) for k,n in [('cabinet',512),('coffee',384),('ice',256),('cups',256),('macarons',320),('shelf',384),('wall',512)]])
    evening_preview.hide_render=False
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=18;scene.cycles.use_denoising=True;scene.render.resolution_x=800;scene.render.resolution_y=550;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=93
    for i,view in enumerate(views):aim(*view);scene.render.filepath='/tmp/gtw-exec-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
