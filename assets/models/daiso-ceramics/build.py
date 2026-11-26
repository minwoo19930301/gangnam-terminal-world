"""Branch-photo reconstruction of two Daiso aisle endcaps. Rebuild using Blender in background mode."""
from pathlib import Path
from math import sin,cos,pi
from mathutils import Vector
import bpy,json,sys,subprocess
here=Path(__file__).resolve().parent;sys.path[:0]=[str(here),str(here.parent/'flavors-breakfast'),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from kitchen import B,P,R,label
from cookware import cookware
from dinnerware import stock
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {rows,parts,prefix,bays} from './layout.js';console.log(JSON.stringify({rows,parts,prefix,bays}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.name='경부선 다이소 · 도기와 식기';scene.unit_settings.system='METRIC'
colors={'paper':'f1eee9','white':'eeeae2','cream':'e0dccb','warm':'cbc6b8','slate':'61605a','fog':'d4d9d6','blue':'7a9caf','blue2':'9eafbb','red':'b43b49','yellow':'ded398','navy':'364b85','ink':'2e302d','smoke':'e0e6e0','clear':'dae5de','walnut':'79523c','rail':'d1cfbf','tin':'b5bab7','ivory':'e4e1d8','motif':'aaa694','magenta':'c3809a','board':'dbdeda','black':'3b3e3c'}
for k,col in colors.items():
    mat=m.material(k,col,.72 if k=='tin' else 0);m.palette[k]=mat;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.18 if k in ['tin','white','cream','fog','smoke','clear','navy','blue','yellow'] else .47
    if k in ['white','cream','blue','ivory','yellow']:bs.inputs['Coat Weight'].default_value=.46;bs.inputs['Coat Roughness'].default_value=.14
    if k in ['smoke','clear']:bs.inputs['Transmission Weight'].default_value=.85;bs.inputs['IOR'].default_value=1.48
groups={}
def group(k):
    c=bpy.data.collections.new(cfg['prefix']+cfg['parts'][k][0]);scene.collection.children.link(c);groups[k]=c;m.group=c;c['preview_origin']=(0,0,0)
group('rack')
B('응회색 기단',0,0,.002,1.289,.546,.172,'board',.005)
B('철판 뒷면',0,-.228,.172,1.263,.034,1.724,'board',.004)
for sign in [-1,1]:
    x=sign*.626;B('홈이 뚫린 진열대 기둥',x,-.201,.157,.037,.078,1.805,'tin',.002)
    for j in range(37):B('선반 조정 슬롯',x,-.160,.222+j*.045,.008,.002,.015,'black')
for index,h in enumerate([.177,.314,.934,1.473,1.872]):
    B('흰 가변 철제 선반',0,.008,h,1.275,.530,.030,'paper',.003)
    if index in [1,2,3]:
        B('상품 가격표 홀더',0,.273,h-.036,1.269,.015,.058,'rail',.0015)
        for j in range(5):
            x=(j-2)*.232;B('백색 가격 꼬리표',x,.283,h-.030,.163,.002,.041,'white')
            if index==2 and j==3:label('3,000',x-.024,.285,h-.008,.100,.023,'ink')
            else:B('분류 색 띠',x-.030,.285,h-.013,.083,.002,.005,'magenta' if j%2 else 'slate')
            for q in range(9):B('라벨 상품코드',x+.030+q*.003,.285,h-.023,.0012,.001,.018,'ink')
        for side in [-1,1]:
            x=.610*side;R('떨어짐 방지 선반 턱',[(x,.243,h+.027),(x,.243,h+.073),(0,.243,h+.073)],.0032,'tin',8)
cookware(group);stock(group)
for c in groups.values():scene.collection.children.unlink(c)
for r in cfg['rows']:
    bay=cfg['bays'][r['bay']];ob=bpy.data.objects.new(r['key']+' · 진열',None);scene.collection.objects.link(ob);ob.instance_type='COLLECTION';ob.instance_collection=groups[r['key']]
    ob.location=(bay['u']-r['u']+2.30*r['bay'],-(bay['v']-r['v']),r['y']+4);ob['web_part']=r['key'];ob.empty_display_size=.03
scene.world=bpy.data.worlds.new('판매장 형광등 간접광');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.72,.75,.72,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.54
for i,x in enumerate([-1.05,.18,1.35,2.56,3.5]):
    l=bpy.data.lights.new('천장 주백색 형광등','AREA');l.energy=112;l.shape='RECTANGLE';l.size=1.19;l.size_y=.42
    ob=bpy.data.objects.new('광원',l);scene.collection.objects.link(ob);ob.location=(x,-.7,2.65);ob.rotation_euler=(Vector((x,0,1.04))-ob.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('손님 시점');ob=bpy.data.objects.new('매장 카메라',cam);scene.collection.objects.link(ob);scene.camera=ob
def aim(loc,target,lens):
    ob.location=loc;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
views=[((.57,-.99,1.36),(.23,0,1.12),46),((-.72,-1.21,1.76),(-.17,0,1.53),46),((2.98,-1.44,1.83),(2.32,0,1.37),37),((2.1,-4.4,2.15),(1.15,0,.99),39)]
aim(*views[-1]);scene.view_settings.view_transform='AgX';bpy.context.preferences.filepaths.save_version=0
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':a.spaces.active.region_3d.view_distance=5.;a.spaces.active.region_3d.view_location=(1.1,0,1)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'ceramics.blend'),compress=True)
for k,c in groups.items():
    scene.collection.children.link(c);bpy.context.view_layer.update();bake_collection(c,k,here/(k+'.glb'),preserve_smoothing=True,simplification=(.60,.00028));scene.collection.children.unlink(c)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    bake_furnished(here,scene.name,[(k,groups[k].name,n) for k,n in [('rack',384),('pots',384),('storage',256),('dinner',384),('bowls',320)]])
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=760;scene.render.resolution_y=530;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
    for i,view in enumerate(views):aim(*view);scene.render.filepath='/tmp/gtw-ceramics-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
