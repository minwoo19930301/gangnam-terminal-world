"""Editable hotel arrival hall, metric. The two closed strands follow the photographed silhouette."""
from pathlib import Path
from math import sin,cos,tau,pi,sqrt
from mathutils import Vector,Matrix,Quaternion
import bpy,json,subprocess,sys
here=Path(__file__).resolve().parent
sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from bell_service import build_bell
from stonework import make_stonework
from foyer_flowers import foyer_flowers
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {prefix,parts,rows,beads,center} from './layout.js';console.log(JSON.stringify({prefix,parts,rows,beads,center}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='JW 메리어트 · 현관 홀';scene.unit_settings.system='METRIC'
colors={'stone':'39322f','edge':'625451','shadow':'27201f','brass':'b49b68','shiny':'dfc487','brushed':'99825f','black':'302e30','cream':'d9cabc',
 'print':'453f34','rubber':'363638','carpet':'654c43','fabric':'4b4849','leather':'634e42','handle':'3a3530','stitch':'c7af8b','bag1':'444b4b','bag2':'806957',
 'bronzewood':'754c39','walnut':'77503e','grain':'8c6250','amber':'b99067','honey':'c2a47e','recess':'4d352b','tile':'cbb89c','glass':'cac1af','rail':'8c806f'}
colors.update({'grout':'9c8e77','floor0':'c6b49b','floor1':'c1af96','floor2':'cbbba1','floor3':'c3b49e','floor4':'c8b8a0','vein':'b5a78e','warm':'dfb474','charcloth':'343237','bluecloth':'3a4149','button':'514b46','veneer0':'5e4235','veneer1':'604537','veneer2':'5d4135','veneer3':'634739'})
colors.update({'glaze':'302929','water':'484437','bark':'64563e','twig':'6f7146','green0':'3b5536','green1':'526839','green2':'6d7944','green3':'848c4e','green4':'4c633b','green5':'909453','petal0':'d5a72e','petal1':'e9c151','petal2':'d7b73c','petal3':'e2b334','pollen':'b58d33'})
for i,col in enumerate(['f0e7d1','efe3bf','ddc9a2','ebdbc1','e8d6aa','f6ebd8','d7c29e','e1cfad','ebdfc6','d0b895','ede3cc']):colors['lattimo'+str(i)]=col
for key,col in colors.items():
    metal=.85 if key in ['brass','shiny','brushed','rail'] else .20 if key in ['stone','edge','bag1'] else 0
    mat=m.material(key,col,metal);m.palette[key]=mat
    bs=mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value=.20 if key in ['shiny','brass','stone'] else .45
    if key=='glaze':
        bs.inputs['Roughness'].default_value=.17;bs.inputs['Coat Weight'].default_value=.45
    if key.startswith('lattimo'):
        bs.inputs['Roughness'].default_value=.16
        bs.inputs['IOR'].default_value=1.51;bs.inputs['Transmission Weight'].default_value=.27
        bs.inputs['Coat Weight'].default_value=.46;bs.inputs['Coat Roughness'].default_value=.105
        bs.inputs['Subsurface Weight'].default_value=.09;bs.inputs['Subsurface Scale'].default_value=.028
        noise=mat.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=9.3;noise.inputs['Detail'].default_value=2.5
        bump=mat.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.16;bump.inputs['Distance'].default_value=.0013
        mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);mat.node_tree.links.new(bump.outputs['Normal'],bs.inputs['Normal'])
groups={}
def group(k):
    c=bpy.data.collections.new(cfg['prefix']+cfg['parts'][k][0]);scene.collection.children.link(c);groups[k]=c;m.group=c;c['preview_origin']=(0.,0.,0.);return c
B,P,R=m.block,m.profile,m.rod
def toptext(label,x,d,z,width,size,col,serif=False):
    cu=bpy.data.curves.new(label,'FONT');cu.body=label;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.resolution_u=5
    for path in (['/System/Library/Fonts/Supplemental/Georgia.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'] if serif else ['/System/Library/Fonts/Supplemental/Arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        if Path(path).exists():cu.font=bpy.data.fonts.load(path,check_existing=True);break
    o=bpy.data.objects.new(label,cu);m.group.objects.link(o);o.location=(x,-d,z);cu.materials.append(m.palette[col]);bpy.context.view_layer.update()
    o.scale.x=min(1,width/max(.001,o.dimensions.x));bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()));mesh.transform(o.matrix_world)
    glyph=bpy.data.objects.new(label+' · 각자',mesh);m.group.objects.link(glyph);glyph['inscription']=label;bpy.data.objects.remove(o,do_unlink=True)
group('dais')
# The 2026 June and August guest views show a round warm stone dais, with a recessed charcoal toe.
P('그늘에 들어간 검은 하부 띠',0,0,.009,[(1.77,0),(1.846,.009),(1.852,.060)],'shadow',120)
P('따뜻한 석재 원형 단',0,0,.053,[(1.85,0),(1.899,.011),(1.906,.023),(1.906,.248),(1.899,.258),(1.879,.265)],'honey',144)
P('무광 석재 윗면',0,0,.314,[(1.879,0),(1.881,.004),(1.872,.008)],'tile',144)
for j in range(46):
    x=-1.65+((j*73)%101)/101*3.3;d=-1.6+((j*31)%101)/101*3.2
    pts=[(x+k*.020,d+k*.010+.005*sin(k*.7+j),.3222) for k in range(8)]
    if all(xx*xx+dd*dd<1.84**2 for xx,dd,h in pts):R('석회석의 가는 결',pts,.00065,'cream',4)
group('cords')
posts=[(-2.19,-2.25),(0,-2.25),(2.19,-2.25),(2.19,0),(2.19,2.25),(0,2.25),(-2.19,2.25),(-2.19,0)]
for i,(x,d) in enumerate(posts):
    P('낮게 눌린 스테인리스 원판',x,d,.003,[(.064,0),(.073,.002),(.077,.007),(.072,.013),(.040,.018)],'rail',28)
    P('보호줄의 가는 지주',x,d,.018,[(.011,0),(.010,.016),(.0075,.703),(.01,.707),(.008,.715)],'brushed',14)
    xx,dd=posts[(i+1)%len(posts)]
    R('지주 사이 늘어지는 줄',[(x+(xx-x)*j/14,d+(dd-d)*j/14,.716-.036*sin(pi*j/14)) for j in range(15)],.003,'rail',7)
def glass_bead(b,i):
    # An indented blown vessel with two small necks. Build sections around the local string axis.
    n=18;bands=12;rot=b['roll'];v=b['variant'];points=[];faces=[]
    direction=Vector((b['axis'][0],b['axis'][1],b['axis'][2])).normalized()
    q=Vector((0,0,1)).rotation_difference(direction) @ Quaternion(Vector((0,0,1)),rot)
    for j in range(bands+1):
        t=-pi/2+.065+(pi-.13)*j/bands;z=sin(t);r=cos(t)
        for k in range(n):
            a=k*tau/n
            distortion=1+.055*sin(3*a+v*.81)*r+.025*cos(5*a+2*z+v)*r+.03*sin(2*a-4*z-v*.3)-.07*max(0,cos(a-v*.57))**8*max(0,1-abs(z-.23)*3.1)
            # Flatten the pole next to each wire hole and leave a slight pinched waist in selected beads.
            waist=1-(.05+.012*(v%3))*max(0,1-abs(z-.03)*3.8)
            local=Vector((b['rx']*(r*distortion*waist*cos(a)+.036*z*z),b['ry']*r*distortion*waist*sin(a),b['rz']*(z*(1-.025*r)+.026*sin(2*a+v)*r*r)))
            pos=q@local;points.append((b['x']+pos.x,b['d']+pos.y,b['z']+pos.z))
    for j in range(bands):
        faces.extend([(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for k in range(n)])
    faces.extend([tuple(reversed(range(n))),tuple(range(bands*n,(bands+1)*n))])
    obj=m.piece('유리알 %03d · 불어 만든 입구'%i,points,faces,'lattimo'+str(v))
    for poly in obj.data.polygons:poly.use_smooth=len(poly.vertices)==4
    obj['glass_bead_index']=i
    return obj
idx=0
for k,beads in cfg['beads'].items():
    group(k)
    for b in beads:
        idx+=1;glass_bead(b,idx)
        if b['variant'] in (0,5,8):
            p=Vector((b['x'],b['d'],b['z']));axis=Vector(b['axis']);half=b['rz']
            R('유리 목 속 금속 핀',[tuple(p+axis*half*.929),tuple(p+axis*(half+.006))],.005,'rail',7)
assert idx==512
# The crown of the two loops hangs just beneath the lattice on short, dark suspension wires.
for x,d,h in [(-.08,.05,15.19),(.09,.15,15.32)]:
    R('상단 서스펜션',[ (x,d,h-14.05),(x,d,15.55-14.05)],.006,'rail',8)
    P('상부 체결판',x,d,15.50-14.05,[(.037,0),(.037,.031)],'brushed',20)
group('screen')
B('낮은 석재 신발',0,0,0,.754,1.69,.088,'stone',.016)
# Tall folded wood leaves broken by two dark vertical reveals, as seen on both sides of the lobby.
for j,(x,d,w,l) in enumerate([(-.253,-.205,.213,1.25),(.021,.07,.26,1.28),(.296,.282,.107,1.03)]):
    B('독립된 월넛 날개',x,d,.087,w,l,3.68,'walnut' if j%2 else 'bronzewood',.004)
    for z in [.091,1.844]:
        B('정면의 넓은 금속과 목재 면',x+w/2+.003,d,z,.006,l-.059,1.72,'brushed' if j==1 else 'honey',.001)
    B('세로로 반사되는 브론즈 날',x-w/2-.003,d,.1,.005,.061,3.62,'brass')
    for side in [-1,1]:
        B('끝단의 황동 프레임',x,d+side*(l/2+.002),.088,w+.003,.007,3.68,'brushed',.001)
        B('하부 브론즈 띠',x,d+side*(l/2+.006),.957,w+.005,.008,.018,'brass')
    for k in range(13):
        dd=d+(k-6)*l/15
        R('세로 목리',[(x+w/2+.0008,dd+.0022*sin(z*3.4+j+k),z) for z in [.10,.74,1.6,2.4,3.1,3.76]],.0007,'grain',4)
build_bell(group,toptext)
make_stonework(group)
foyer_flowers(group)
for c in groups.values():scene.collection.children.unlink(c)
for row in cfg['rows']:
    key=row['key'];ob=bpy.data.objects.new(key+' · 로비 배치',None);scene.collection.objects.link(ob)
    ob.instance_type='COLLECTION';ob.instance_collection=groups[key];ob.empty_display_size=.08
    ob.location=(row['u']-cfg['center']['u'],-(row['v']-cfg['center']['v']),row['y']);ob.rotation_euler.z=row.get('angle',0);ob['web_part']=key;ob.scale=(row.get('widthScale',1),row.get('widthScale',1),1)
scene.world=bpy.data.worlds.new('현관 반사광');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.64,.62,.57,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.39
def area(name,loc,aim,energy,size,color):
    l=bpy.data.lights.new(name,'AREA');l.energy=energy;l.shape='DISK';l.size=size;l.color=color
    ob=bpy.data.objects.new(name,l);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector(aim)-ob.location).to_track_quat('-Z','Y').to_euler()
for n,h in enumerate([2.1,4.7,8.3,12.3,15.8]):
    area('격자에서 번지는 빛',(-2.4,1.1,h),(0,0,h-.65),270,2.4,(1,.78,.54))
    area('석재의 반사광',(2.3,-2.9,h-.20),(0,0,h-.8),220,3.3,(.81,.88,1))
area('벨 데스크 다운라이트',(14,-4.0,3.9),(14,-6,1),440,3.1,(1,.82,.66))
cam=bpy.data.cameras.new('작품과 로비');camera=bpy.data.objects.new('작품과 로비',cam);scene.collection.objects.link(camera);scene.camera=camera
def aim(loc,target,lens):
    camera.location=loc;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
aim((4,-3.0,2.7),(0,0,1.25),43);scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
for ar in bpy.context.screen.areas:
    if ar.type=='VIEW_3D':ar.spaces.active.region_3d.view_distance=14;ar.spaces.active.region_3d.view_location=(0,0,6.3)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'arrival.blend'),compress=True)
for key,c in groups.items():
    scene.collection.children.link(c);bpy.context.view_layer.update()
    bake_collection(c,key,here/(key+'.glb'),preserve_smoothing=True,simplification=(.63,.00038))
    scene.collection.children.unlink(c)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    bake_furnished(here,scene.name,[(k,groups[k].name,n) for k,n in [('dais',512),('vessel',384),('screen',384),('trolley',384),('columnShoe',256)]])
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True
    scene.render.resolution_x=780;scene.render.resolution_y=580;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=91
    for i,(xyz,t,l) in enumerate([((2.26,-2.0,.92),(0,0,.63),59),((1.10,.56,3.56),(-.09,0,3.65),55),((20.2,-9.0,2.42),(14.55,-5.90,.91),50),((2.5,-2.6,15.6),(0,0,14.76),48)]):
        aim(xyz,t,l);scene.render.filepath='/tmp/gtw-arrival-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
