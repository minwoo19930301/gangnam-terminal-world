"""NewCore Gangnam dessert counter, authored in metres in the Blender kitchen scene."""
from pathlib import Path
from math import sin,cos,tau,pi,sqrt
from random import Random
from mathutils import Vector,Matrix
import bpy,json,subprocess,sys

here=Path(__file__).resolve().parent;tools=here.parents[2]/'tools';sys.path[:0]=[str(tools),str(here)]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from pastry import make_sweets
from dining import make_dining
from restaurant import architecture
from cold_salad import make_cold_salad
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts,rows,prefix} from './layout.js';console.log(JSON.stringify({parts,rows,prefix}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.name='애슐리퀸즈 · 디저트와 스테이크';scene.unit_settings.system='METRIC'
palette={'green':'394842','recess':'252e2b','rail':'62695f','brass':'9b835c','gold':'bda178','silver':'c8c7bd','steel':'9a9c95','char':'272825',
 'rubber':'24241f','steelblue':'6e777a','chrome':'d2d5ce','pale':'a7b3ae','glazing':'657775','stone':'625d58','vein':'a0998e',
 'slate':'514e48','edge':'777470','bowl':'f4f0e4','ivory':'f1ebdc','cream':'f8f0d9','beige':'d6c4a7','wood':'a27845','oak':'cb9d62',
 'darkwood':'64523c','bamboo':'d6bf88','paper':'ede8db','print':'262725','red':'a04c38','amber':'d48a32','pump':'efeee4','blue':'456486',
 'cocoa':'71412c','chocolate':'783e23','silk':'864a2d','liquid':'985b34','pool':'66341f','chip':'503228','cookie':'3c3029','syrup':'be813c',
 'caramel':'a06836','jam':'9a2d38','berry':'b34c52','rose':'dd9b92','rosewood':'863d43','lemon':'e6c35b','mint':'a8c1a2','lilac':'c0abc0',
 'sugar':'f4ede4','butter':'ddb775','toast':'bb8547','apricot':'ce9153','pastry':'c79450','wall':'d6c8ae','light':'f5e0b2','bronze':'8e795a',
 'bronzedark':'645c50','meat':'72513b','sear':'4a392a','juices':'805037','fat':'b39460','broccoli':'667f40','sprout':'526b34',
 'carrot':'b47847','asparagus':'63753d','pasta':'dfbc76','chair':'576158'}
palette.update({'grout':'8b8176','tile0':'c8b69b','tile1':'bcab90','tile2':'c1ae94','tile3':'c5b298','basalt':'34332f','ceiling':'3b3e38','mold':'35413a','frost':'c3d3c5'})
palette.update(rind='F09313',pith='FFF0BB',citrus='FFA01D',juice='FFBC34',pumpkin='DB9D22',golden='E7AC35',currant='55222B',gherkin='899745',palePickle='DFD9A3')
for key,tone in palette.items():
    metal=.76 if key in ['silver','steel','chrome','bronze','bronzedark','brass','gold'] else .22 if key in ['rail','steelblue'] else 0
    mat=m.material(key,tone,metal);m.palette[key]=mat
    bs=mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value=.18 if key in ['chrome','chocolate','liquid','silk','pool','juices','glazing'] else .25 if key in ['bowl','silver','steel','jam'] else .48
    if key in ['chocolate','silk','liquid','pool','jam','bowl','juices']:
        bs.inputs['Coat Weight'].default_value=.33;bs.inputs['Coat Roughness'].default_value=.18
B=m.block;P=m.profile;R=m.rod;rng=Random(51126);groups={}
def group(key):
    c=bpy.data.collections.new(cfg['prefix']+cfg['parts'][key][0]);scene.collection.children.link(c);groups[key]=c;m.group=c;c['preview_origin']=(0,0,0);return c
def smooth(obj):
    for poly in obj.data.polygons:
        if len(poly.vertices)<=4:poly.use_smooth=True
    return obj
def ball(name,x,d,z,rx,rd,rz,mat,n=18,bands=9):
    vs=[];faces=[]
    for j in range(bands+1):
        a=-pi/2+.003+j*(pi-.006)/bands
        vs.extend([(x+rx*cos(a)*cos(tau*i/n),d+rd*cos(a)*sin(tau*i/n),z+rz*sin(a)) for i in range(n)])
    for j in range(bands):
        faces.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
    faces+=[tuple(reversed(range(n))),tuple(range(bands*n,(bands+1)*n))]
    return smooth(m.piece(name,vs,faces,mat))
def loft(name,x,d,z,rings,mat):
    vs=[];faces=[];n=16
    for width,depth,h in rings:
        rad=min(.014,width*.14,depth*.14)
        for j,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for k in range(4):
                a=pi*.5*(j+k/3);vs.append((x+sx*(width*.5-rad)+rad*cos(a),d+sy*(depth*.5-rad)+rad*sin(a),z+h))
    for j in range(len(rings)-1):faces.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
    faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
    return m.piece(name,vs,faces,mat)
def engraving(text,x,d,z,width,height,mat='paper',serif=False,scale=1):
    cu=bpy.data.curves.new(text,'FONT');cu.body=text;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=height;cu.resolution_u=5
    name=Path('/System/Library/Fonts/Supplemental/Georgia.ttf' if serif else '/System/Library/Fonts/AppleSDGothicNeo.ttc')
    if not name.exists():name=Path('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf' if serif else '/usr/share/fonts/truetype/nanum/NanumGothic.ttf')
    if name.exists():cu.font=bpy.data.fonts.load(str(name),check_existing=True)
    obj=bpy.data.objects.new(text,cu);m.group.objects.link(obj);obj.rotation_euler=(pi/2,0,pi);obj.location=(x,-d,z)
    cu.materials.append(m.palette[mat]);bpy.context.view_layer.update()
    s=min(1,width/(obj.dimensions.x or 1));obj.scale.x=s*scale;bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()));mesh.transform(obj.matrix_world)
    ob=bpy.data.objects.new(text+' · 글자면',mesh);m.group.objects.link(ob);ob['inscription']=text;bpy.data.objects.remove(obj,do_unlink=True)
def face_ring(label,x,d,z,r,w,col,seg=40,scale_z=1):
    pts=[(x+r*cos(i*tau/seg),d,z+r*scale_z*sin(i*tau/seg)) for i in range(seg+1)];return R(label,pts,w,col,8)
def rim(label,x,d,z,r,small,col,seg=42):
    return R(label,[(x+r*cos(i*tau/seg),d+r*sin(i*tau/seg),z) for i in range(seg+1)],small,col,8)

group('island')
B('하부 걸레받이',0,.01,0,6.18,.84,.109,'recess',.009)
B('녹회색 하부장',0,0,.091,6.18,.914,.816,'green',.013)
for i in range(6):
    x=(i-2.5)*1.016
    B('끼워 맞춘 프레임',x,-.461,.146,.989,.026,.672,'rail',.008)
    B('음각 사각 문짝',x,-.480,.168,.943,.018,.628,'green',.007)
    B('하부장 속판',x,-.490,.224,.842,.013,.499,'recess',.006)
    B('도장 필드',x,-.499,.242,.813,.009,.470,'green',.006)
    for xx in [-.069,.069]:R('서랍 손잡이 다리',[(x+xx,-.485,.740),(x+xx,-.526,.740)],.007,'brass')
    R('포개진 라운드 손잡이',[(x-.071,-.527,.740),(x+.071,-.527,.740)],.0095,'brass')
B('연마한 회색 석재',0,-.007,.902,6.236,1.022,.075,'stone',.012)
B('두꺼운 석재 뒤턱',0,.459,.969,6.205,.058,.12,'slate',.009)
# These irregular veins follow the stone across its top; Blender noise adds finer mineral grains.
for j in range(31):
    x=rng.uniform(-3.02,3.0);d=rng.uniform(-.18,.35);points=[]
    for k in range(9):
        xx=x+(k-4)*.033
        zz=d+(k-4)*.037+.010*sin(k*1.24+j)+rng.uniform(-.008,.008)
        if -.494<zz<.477 and -3.099<xx<3.099:points.append((xx,zz,.9772))
    if len(points)>1:R('대리석 석영맥',points,rng.uniform(.0005,.0016),rng.choice(['vein','slate','edge']),5)
group('screen')
B('와이어 유리의 어두운 배면',0,.031,0,6.25,.077,1.91,'glazing',.008)
for xx in [-3.11,-1.555,0,1.555,3.11]:B('패널 금속 이음',xx,-.009,0,.024,.049,1.91,'rail',.003)
for h in [.016,1.887]:B('오크색 유리 프레임',0,-.025,h,6.23,.056,.029,'bronzedark',.004)
B('안내판 금속 프레임',-.33,-.074,.192,2.72,.06,.564,'char',.023)
B('와플 안내판 검은 바탕',-.33,-.111,.210,2.675,.015,.529,'print',.009)
engraving('DIY 와플과 크로플',-.33,-.121,.614,2.43,.14)
for i,(x,lab) in enumerate([( .48,'와플'),(-.31,'크로플'),(-1.13,'토핑')]):
    for j in range(3):
        ball('안내판의 작은 와플 삽화',x+(j-1)*.064,-.125,.433+abs(j-1)*.022,.063,.004,.041,['butter','toast','cream'][j],12,6)
    engraving(lab,x,-.132,.300,.55,.068)
B('흰 디저트 인쇄물',1.99,-.049,.37,1.47,.061,.94,'paper',.004)
engraving('DESSERT',1.99,-.087,.995,1.24,.274,'print',True)
engraving('SUPER SWEET',1.99,-.088,.630,1.27,.137,'red',True)
group('fountain')
P('검은 원통 받침',0,0,.013,[(.137,0),(.156,.013),(.170,.053),(.176,.102),(.177,.257),(.169,.291),(.157,.299)],'char',56)
P('하부 고무 받침',0,0,0,[(.128,0),(.137,.008),(.136,.023)],'rubber',40)
for x in [-.108,.108]:
    for d in [-.081,.081]:P('수평 조절발',x,d,0,[(.013,0),(.014,.013)],'rubber',12)
P('넓게 벌어진 스테인리스 볼',0,0,.282,[(.124,0),(.164,.008),(.201,.030),(.227,.069),(.239,.10),(.238,.110),(.231,.115),(.218,.088),(.188,.058),(.139,.032),(.077,.026)],'chrome',80)
rim('둥글게 접힌 스텐 림',0,0,.392,.237,.005,'silver',64)
P('코코아가 고인 수면',0,0,.337,[(.129,0),(.187,.004),(.204,.016),(.205,.023),(.189,.029),(.075,.033),(.019,.025)],'pool',72)
for r in [.092,.129,.171]:rim('볼 안의 동심 물결',.004,0,.370+(r-.1)*.06,r,.0016,'silk',70)
P('중심 공급관',0,0,.350,[(.039,0),(.038,.097)],'steel',32)
group('chocolate')
# Each lip folds under the next sheet. Low-amplitude angular ripples break perfect axial symmetry.
levels=[(.136,.067,.134),(.112,.208,.125),(.094,.335,.114),(.075,.451,.092)]
for k,(rad,base,height) in enumerate(levels):
    radius=[(.42,0),(.47,.10),(.54,.50),(.68,.74),(1,.82),(1.025,.91),(.98,.98),(.84,1.0),(.47,1.014)]
    if k==0:radius=[(.45,-.51),(.51,-.30)]+radius
    n=72;vs=[];faces=[]
    for j,(r,h) in enumerate(radius):
        for i in range(n):
            a=i*tau/n
            pulse=1+.021*cos(3*a+k*.72)+.010*cos(5*a+.6*j)+.007*sin(11*a+.3*j)
            z=base+h*height+(.0035*sin(4*a+.54*k)+.0013*sin(9*a+.3*j))*(.8 if j>1 else .22)
            vs.append((r*rad*pulse*cos(a),r*rad*pulse*sin(a),z))
    for j in range(len(radius)-1):
        faces.extend([(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)])
    faces+=[tuple(reversed(range(n))),tuple(range((len(radius)-1)*n,len(radius)*n))]
    ob=smooth(m.piece('흘러내리는 퐁뒤 '+str(k+1)+'단',vs,faces,'chocolate'))
    ob.data.materials.append(m.palette['silk']);ob.data.materials.append(m.palette['liquid'])
    for j in range(len(radius)-1):
        for i in range(n):
            p=ob.data.polygons[j*n+i];a=tau*i/n
            if j in [len(radius)-3,len(radius)-2]:p.material_index=1
            if j==len(radius)-2 and cos(3*a+.3*k)>.64:p.material_index=2
ball('초콜릿의 둥근 정점',0,0,.535,.062,.060,.021,'silk',44,11)
group('iron')
B('나무로 감싼 이중 와플기 받침',0,0,.014,.897,.543,.125,'wood',.011)
B('요철 손잡이 전면',0,-.260,.021,.886,.023,.088,'oak',.004)
B('스테인리스 가열기 상판',0,0,.14,.871,.509,.026,'steel',.004)
for i,x in enumerate([-.212,.212]):
    loft('검은 베이클라이트 받침',x,.035,.165,[(.352,.351,0),(.363,.363,.018),(.344,.344,.051),(.320,.320,.059)],'rubber')
    loft('단조 하부 철판',x,.033,.221,[(.330,.336,0),(.342,.345,.018),(.338,.343,.052)],'char')
    loft('두껍게 기울어진 주물 덮개',x,.034,.272,[(.341,.346,0),(.339,.345,.014),(.289,.291,.076),(.269,.269,.078)],'steelblue')
    P('뚜껑 중앙 볼트',x,.034,.350,[(.009,0),(.008,.008)],'silver',10)
    R('짧은 검은 손잡이',[(x,-.114,.248),(x,-.213,.235),(x,-.250,.233)],.023,'rubber',12)
    for dx in [-.105,.105]:
        R('뚜껑 힌지',[(x+dx-.021,.208,.24),(x+dx+.021,.208,.24)],.017,'silver',12)
    B('붉은 온도 표시',x,-.274,.083,.036,.008,.024,'red',.003)
for x in [-.25,.22]:
    B('분리된 주방 타이머',x,-.269,.007,.117,.074,.018,'paper',.006)
    B('액정의 어두운 테두리',x,-.268,.025,.051,.029,.003,'char',.002)
group('batter')
loft('반죽 집기의 금속 통',0,.018,0,[(.285,.297,0),(.298,.309,.011),(.296,.307,.301)],'steel')
B('주황색 플레인 와플믹스 안내',0,-.145,.013,.289,.008,.269,'amber',.002)
engraving('PLAIN',0,-.152,.196,.26,.074,'paper',True)
engraving('WAFFLE MIX',0,-.153,.117,.26,.043)
P('와플 믹스 펌프 용기',0,.018,.100,[(.107,0),(.116,.013),(.116,.202),(.091,.224),(.069,.232),(.069,.251)],'pump',36)
P('펌프 나사산',0,.018,.331,[(.069,0),(.074,.005),(.074,.029),(.040,.034)],'ivory',30)
R('흰 펌프대와 굽은 토출구',[(0,.018,.361),(0,.018,.466),(0,.021,.518)],.013,'pump',16)
R('믹스 토출구',[(0,.032,.516),(0,-.020,.532),(0,-.106,.529),(0,-.138,.509),(0,-.142,.480)],.016,'pump',20)
for i,x in enumerate([-.074,.060]):
    P('와플 반죽 계량컵',x,-.185,0,[(.030,0),(.034,.003),(.041,.066),(.041,.072),(.037,.074),(.028,.010)],'silver',24)
    R('계량컵 고리',[(x+.036,-.185,.061),(x+.062,-.185,.062),(x+.061,-.185,.032),(x+.035,-.185,.031)],.003,'steel')
    if i==0:P('계량한 반죽',x,-.185,.041,[(.034,0),(.036,.002),(.032,.005)],'butter',24)
architecture(group,ball,loft,engraving,face_ring,rim)
make_sweets(group,ball,rim,loft)
make_cold_salad(group,ball,loft,engraving)
make_dining(group,ball,loft,engraving,face_ring,rim)
for c in groups.values():scene.collection.children.unlink(c)
for r in cfg['rows']:
    ob=bpy.data.objects.new(r['key']+' · 식당 배치',None);scene.collection.objects.link(ob);ob.instance_type='COLLECTION'
    ob.instance_collection=groups[r['key']];ob.empty_display_size=.07;ob.location=(r['x'],-r['d'],r['h']);ob.rotation_euler.z=r.get('rot',0);ob['web_part']=r['key']
def area(label,xyz,target,power,size,color):
    light=bpy.data.lights.new(label,'AREA');light.energy=power;light.size=size;light.color=color
    ob=bpy.data.objects.new(label,light);scene.collection.objects.link(ob);ob.location=xyz;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('식당 간접광');scene.world.use_nodes=True;bg=scene.world.node_tree.nodes['Background'];bg.inputs[0].default_value=(.55,.53,.47,1);bg.inputs[1].default_value=.52
for i,x in enumerate([-9.4,-4.1,-1.15,1.55,4.40]):
    area('천장 다운라이트 '+str(i),(x,-7.2,3.41),(x,-7.82,.88),[145,140,150,155,165][i],.56,(1,.89,.73))
area('통로 반사광',(.80,-3.3,2.99),(.6,-7.77,1.12),485,5.0,(.81,.90,1))
area('명판의 벽 세척등',(-10,-6.1,2.9),(-9.45,-8.25,1.3),190,1.5,(1,.91,.73))
camera=bpy.data.cameras.new('뉴코아 디저트');ob=bpy.data.objects.new('소재 촬영',camera);scene.collection.objects.link(ob);scene.camera=ob
views=[((-.05,-4.18,2.54),(1.0,-7.84,1.42),32),((-1.78,-6.72,1.96),(-.92,-7.82,1.59),56),((1.26,-6.96,1.93),(.74,-7.82,1.12),57),((4.11,-6.30,1.87),(3.56,-7.82,1.15),48),((-8.50,-5.16,1.87),(-9.36,-8.3,1.72),39),((-5.03,-1.91,1.47),(-5.64,-2.68,.833),56)]
def aim(view):
    xyz,target,lens=view;ob.location=xyz;ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();camera.lens=lens
aim(views[0]);scene.view_settings.view_transform='AgX'
bpy.context.preferences.filepaths.save_version=0
for ar in bpy.context.screen.areas:
    if ar.type=='VIEW_3D':ar.spaces.active.region_3d.view_distance=7.1;ar.spaces.active.region_3d.view_location=(.75,-7.50,1)
bpy.ops.wm.save_as_mainfile(filepath=str(here/'dessert-room.blend'),compress=True)
for key,c in groups.items():
    scene.collection.children.link(c);bpy.context.view_layer.update()
    bake_collection(c,key,here/(key+'.glb'),preserve_smoothing=True,simplification=(.63,.00058))
    scene.collection.children.unlink(c)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    targets=[(k,groups[k].name,n) for k,n in [('island',512),('screen',480),('wall',512),('bowls',320),('table',320),('buffet',512),('ceiling',384)]]
    bake_furnished(here,scene.name,targets)
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=14;scene.cycles.use_denoising=True
    scene.render.resolution_x=850;scene.render.resolution_y=570;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=89
    for i,v in enumerate(views):aim(v);scene.render.filepath='/tmp/gtw-dessert-studio-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
