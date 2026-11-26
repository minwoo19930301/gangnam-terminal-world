"""Blender source for JW Marriott Seoul Flavors, based on the photographed breakfast service."""
from pathlib import Path
from math import sin,cos,pi
from mathutils import Vector
import bpy,json,sys,subprocess
here=Path(__file__).resolve().parent
sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from kitchen import B,P,R,ring,kitchens
from buffet import buffet
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {rows,parts,prefix,service} from './layout.js';console.log(JSON.stringify({rows,parts,prefix,service}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.name='JW 플레이버즈 · 조식';scene.unit_settings.system='METRIC'
colors={'black':'292925','iron':'373932','grout':'45473f','stone':'4e4d4a','speckle':'696863','vein':'88857d','warm':'d8b27d','drawer':'393e38','rail':'727066','brass':'a08558',
 'steel':'a5a9a2','chrome':'d8dad0','paper':'f1ede1','ink':'343632','white':'f2ede1','cream':'eee3cb','mango':'e9b231','orange':'ea9132','kale':'83a441','grapefruit':'ef995f','pitaya':'bb266f',
 'glass':'dce6df','tumbler':'a0b7b1','oak':'b58a54','grain':'926439','clay':'342c28','glaze':'231f1c','oxide':'614637','broth':'c9591c','tofu':'eae0bc',
 'oil':'dc8826','kimchi':'c55a35','onion':'e4dcaa','green':'71824a','pepper':'a14f3c','carrot':'d1833d','braise':'855338','bamboo':'bc905a','straw':'cda66f','darkbamboo':'936638',
 'leaf':'657746','dumpling':'dfb879','bun':'e2cfab','bean':'4a3948','salmon':'db977a','seaweed':'52634c','red':'914941','rubber':'302f2e','cheese':'dfc283','ham':'c58880','roe':'dd9370','roe2':'d78359','purple':'614256','fat':'e8c3a9','steelDark':'727b78','tomato':'c25e42','lightbud':'efe5cf','fold':'c5af91'}
groups={}
for k,col in colors.items():
    metal=.8 if k in ['brass','steel','chrome','rail'] else .28 if k=='iron' else 0
    mat=m.material(k,col,metal);m.palette[k]=mat;bs=mat.node_tree.nodes['Principled BSDF']
    wet=k in ['glass','tumbler','glaze','broth','oil','mango','orange','kale','grapefruit','pitaya','stone','white','bean','salmon','red']
    bs.inputs['Roughness'].default_value=.12 if k in ['glass','chrome'] else .24 if wet or metal else .52
    if wet:bs.inputs['Coat Weight'].default_value=.37;bs.inputs['Coat Roughness'].default_value=.16
    if k in ['glass','tumbler']:
        bs.inputs['Transmission Weight'].default_value=.94;bs.inputs['IOR'].default_value=1.48
def group(k):
    c=bpy.data.collections.new(cfg['prefix']+cfg['parts'][k][0]);scene.collection.children.link(c);groups[k]=c;m.group=c;c['preview_origin']=(0,0,0)
for key,length in [('long',6.36),('short',5.10)]:
    group(key)
    B('안쪽으로 들어간 발끝 공간',0,0,.004,length-.16,.832,.099,'black',.008)
    B('조리대 속 프레임',0,0,.098,length-.066,.918,.873,'drawer',.008)
    B('연마한 짙은 대리석 상판',0,0,.974,length,1.025,.066,'stone',.009)
    for side in [-1,1]:
        for i in range(8 if key=='long' else 6):
            count=8 if key=='long' else 6;w=(length-.14)/count;x=(i-(count-1)/2)*w
            B('목재 패널의 좁은 프레임',x,side*.461,.121,w-.012,.022,.83,'black',.004)
            B('떼어낼 수 있는 뷔페 패널',x,side*.474,.143,w-.043,.016,.775,'drawer',.003)
            for dx in [-.338,.338]:
                dd=min(w*.38,abs(dx));B('세로 패널 줄눈',x+(dd if dx>0 else -dd),side*.486,.156,.008,.003,.744,'rail')
            if i%2==0:
                R('서랍당김쇠',[(x-.061,side*.477,.822),(x-.061,side*.499,.833),(x+.061,side*.499,.833),(x+.061,side*.477,.822)],.0055,'steel',7)
        B('상판 아래 좁은 금속 띠',0,side*.478,.950,length-.065,.019,.024,'rail')
    for j in range(104 if key=='long' else 79):
        import random
        rng=random.Random(340+j)
        x=rng.uniform(-length*.47,length*.47);d=rng.uniform(-.46,.32)
        pts=[(x+k*.008+rng.uniform(-.002,.002),d+k*.018+.002*sin(k+j),1.0403) for k in range(6)]
        R('대리석 세맥',pts,rng.uniform(.00045,.0015),'speckle' if j%3 else 'vein',4)
kitchens(group);buffet(group)
for c in groups.values():scene.collection.children.unlink(c)
# Blender X runs along the local counter length; the three actual game islands share this scene.
west=cfg['service']['west'];v0=33.3
for r in cfg['rows']:
    ob=bpy.data.objects.new(r['key']+' · 조식 배치',None);scene.collection.objects.link(ob);ob.instance_type='COLLECTION';ob.instance_collection=groups[r['key']]
    ob.location=(v0-r['v'],-(r['u']-west),r['y']-6);ob.empty_display_size=.04;ob['web_part']=r['key']
scene.world=bpy.data.worlds.new('조식당 간접광');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.54,.59,.60,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.48
def light(name,loc,target,size,power,col):
    l=bpy.data.lights.new(name,'AREA');l.shape='DISK';l.size=size;l.energy=power;l.color=col
    ob=bpy.data.objects.new(name,l);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
for i,x in enumerate([-5.8,-3.3,-1.40,.5,2.6,4.8,6.9]):
    light('황동 펜던트의 빛',(x,-1.04,3.9),(x,0,.92),1.14,165,(1,.83,.62))
light('푸드홀 옆면광',(.7,-4.6,2.95),(.4,0,1.07),4.2,450,(.83,.91,1))
cam=bpy.data.cameras.new('플레이버즈 조식');ob=bpy.data.objects.new('셰프 스테이션',cam);scene.collection.objects.link(ob);scene.camera=ob
def aim(loc,target,lens):
    ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
views=[((-5.83,-2.62,2.25),(-3.9,0,1.25),38),((2.76,-.75,1.63),(3.16,-.04,1.15),56),((1.19,-.88,1.70),(1.65,-.03,1.27),54),((1.15,-3.17,2.04),(.06,-2.22,1.16),47),((-3.09,-3.5,1.85),(-2.14,-2.21,1.40),49)]
aim(*views[0]);scene.view_settings.view_transform='AgX';bpy.context.preferences.filepaths.save_version=0
for ar in bpy.context.screen.areas:
    if ar.type=='VIEW_3D':ar.spaces.active.region_3d.view_distance=9;ar.spaces.active.region_3d.view_location=(.15,-.80,.8)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'breakfast.blend'),compress=True)
for k,c in groups.items():
    scene.collection.children.link(c);bpy.context.view_layer.update();bake_collection(c,k,here/(k+'.glb'),preserve_smoothing=True,simplification=(.70,.00033));scene.collection.children.unlink(c)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    bake_furnished(here,scene.name,[(k,groups[k].name,n) for k,n in [('long',512),('short',512),('board',320),('pot',256),('steamers',384),('bowls',384),('slicer',384)]])
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=760;scene.render.resolution_y=530;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
    for i,v in enumerate(views):aim(*v);scene.render.filepath='/tmp/gtw-flavors-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
