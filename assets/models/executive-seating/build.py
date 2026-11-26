"""Editable curved leather armchairs of the hotel's 9F window lounge, from the June visitor photograph."""
from pathlib import Path
from math import pi,sin,cos,tau,exp
from mathutils import Matrix,Vector
import bpy,json,subprocess,sys
here=Path(__file__).resolve().parent;sys.path[:0]=[str(here),str(here.parent/'flavors-breakfast'),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
from kitchen import R,P,ring,sphere
from table import table
cfg=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {types,prefix} from './layout.js';console.log(JSON.stringify({types,prefix}))"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True);scene=bpy.context.scene;scene.name='JW 서울 9층 · 라운지 창가 좌석';scene.unit_settings.system='METRIC'
for k,col in {'cream':'d9cdb9','taupe':'b1a18d','ivory':'d0c3ae','cord':'ad9c84','cordlight':'c7b9a4','thread':'cabba4','ash':'39352f','foot':'5c5950','underside':'645c51','stone':'ebe8db','stoneEdge':'d5d0c2','apron':'4a4540'}.items():
    mat=m.material(k,col,.28 if k=='foot' else 0);m.palette[k]=mat;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Roughness'].default_value=.36 if k in ['cream','taupe','ivory'] else .52
    if k in ['cream','taupe','ivory']:bs.inputs['Coat Weight'].default_value=.12;bs.inputs['Coat Roughness'].default_value=.37
def skin(name,vertices,faces,col):
    o=m.piece(name,vertices,faces,col)
    for f in o.data.polygons:f.use_smooth=True
    return o
def tubeleg(x,d,tx,td):
    verts=[];faces=[];n=12
    for z,t,rad in [(.015,0,.0135),(.027,.035,.014),(.330,.92,.023),(.375,1,.025)]:
        verts+= [(x+(tx-x)*t+rad*cos(i*tau/n),d+(td-d)*t+rad*sin(i*tau/n),z) for i in range(n)]
    for j in range(3):faces += [(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)]
    faces += [tuple(range(n-1,-1,-1)),tuple(range(3*n,4*n))];skin('가늘어지는 원목 다리',verts,faces,'ash')
    P('바닥을 받치는 글라이드',x,d,0,[(.014,0),(.014,.009),(.013,.015)],'foot',14)
def shell_point(a,t,inner=False):
    # The curved back rises toward its centre. A shallow fan of gathers converges below the shoulder.
    arc=2.29;mid=(cos(a*pi/(2*arc))**1.55)
    low=.359+.018*(1-mid);height=.219+.299*mid
    top=low+height
    taper=.911+.111*sin(t*pi*.59);thickness=.052+.019*sin(pi*t)
    wrinkle=0
    if inner:
        # A pinched horizontal gather separates rounded shoulder padding from the lower lumbar panel.
        wrinkle-=.026*exp(-((t-.68)/.22)**2)*exp(-(a/.96)**4)
        wrinkle+=.036*exp(-((t-.48-.013*cos(a*6))/.068)**2)*exp(-(a/.52)**4)
        wrinkle-=.015*exp(-((t-.32)/.16)**2)*exp(-(a/.63)**4)
        for j in range(-6,7):
            axis=j*.158*(.44+1.33*abs(t-.45))
            dist=(a-axis)/(.022+.011*t)
            wrinkle+=.020*exp(-dist*dist)*(exp(-((t-.70)/.23)**2)+.43*exp(-((t-.26)/.13)**2))*mid
    rx=.383*taper+wrinkle-(thickness if inner else 0);rd=.325*taper+wrinkle-(thickness if inner else 0)
    return (sin(a)*rx,-cos(a)*rd-.027*t,low+(top-low)*t)
def bucket(col):
    seam='cord' if col=='taupe' else 'cordlight';arc=2.29;nu=126;nv=24;verts=[];faces=[]
    for side in [False,True]:
        for j in range(nv+1):
            verts += [shell_point(-arc+2*arc*i/nu,j/nv,side) for i in range(nu+1)]
    pitch=nu+1;base=pitch*(nv+1)
    for j in range(nv):
        for i in range(nu):
            q=j*pitch+i;f=(q,q+1,q+pitch+1,q+pitch);faces.append(f);faces.append(tuple(base+v for v in reversed(f)))
    for i in range(nu):
        k=nv*pitch+i;faces.extend([(k,k+1,k+1+base,k+base),(i+base,i+1+base,i+1,i)])
    for j in range(nv):
        for i in [0,nu]:
            q=j*pitch+i;f=(q,q+pitch,q+pitch+base,q+base);faces.append(f if i==0 else tuple(reversed(f)))
    skin('모서리가 이어진 가죽 팔걸이와 등판',verts,faces,col)
    top=[];out=[]
    for i in range(nu+1):
        a=-arc+2*arc*i/nu;op=shell_point(a,1);ip=shell_point(a,1,True)
        top.append(tuple((op[k]+ip[k])*.5 for k in range(3)));out.append(shell_point(a,.972))
    R('등판 위의 둥근 파이핑',top,.007,seam,8);R('등판 가장자리 솔기',out,.0017,seam,6)
    for j in [-1,1]:
        a=j*arc*.69
        R('옆판과 등판 봉제선',[shell_point(a+sin(i*.28)*.013,i/20) for i in range(21)],.0020,seam,6)
        for i in range(19):
            t=.06+i*.047
            R('옆판의 짧은 박음질',[shell_point(a+.016,t),shell_point(a+.016,t+.014)],.0011,'thread',4)
    # A slightly squarish, crowned cushion with a distinct piping line.
    verts=[];faces=[];rings=[(.15,.344),(.85,.351),(.96,.368),(1,.395),(.985,.422),(.91,.439),(.62,.449),(.21,.454),(.012,.455)];n=68
    def sq(c):return (1 if c>=0 else -1)*abs(c)**.77
    def cushion(a,rad,z):return (.320*rad*sq(cos(a)),.281*rad*sq(sin(a))+.027,z)
    for rad,z in rings:verts+= [cushion(i*tau/n,rad,z) for i in range(n)]
    for j in range(len(rings)-1):faces += [(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]);skin('누르면 둥글게 솟는 좌방석',verts,faces,col)
    R('좌방석 둘레의 파이핑',[cushion(i*tau/n,.987,.416) for i in range(n+1)],.0035,seam,7)
    P('좌방석 밑의 어두운 받침',0,0,.33,[(.272,0),(.280,.009),(.273,.035)],'underside',34,.80)
    for sx in [-1,1]:
        for sd in [-1,1]:tubeleg(sx*.282,sd*.239,sx*.233,sd*.193)
groups={}
for key,name in cfg['types'].items():
    c=bpy.data.collections.new(cfg['prefix']+name);scene.collection.children.link(c);groups[key]=c;m.group=c;c['preview_origin']=(0,0,0)
    chairs=[(-1.12,0,pi/2,'taupe' if key.endswith('A') else 'cream'),(1.12,0,-pi/2,'cream' if key.endswith('A') else 'taupe')]
    if key.startswith('trio'):chairs.append((0,-1.10,0,'ivory'))
    for x,d,angle,col in chairs:
        prior=set(c.objects);bucket(col);mat=Matrix.Translation((x,-d,0))@Matrix.Rotation(angle,4,'Z')
        for o in set(c.objects)-prior:o.matrix_world=mat@o.matrix_world
for c in groups.values():scene.collection.children.unlink(c)
top=bpy.data.collections.new('JW 9층 좌석 · 아이보리 원탁과 검은 에이프런');scene.collection.children.link(top);m.group=top;top['preview_origin']=(0,0,0);table();scene.collection.children.unlink(top)
table_preview=bpy.data.objects.new('창가 원탁',None);scene.collection.objects.link(table_preview);table_preview.instance_type='COLLECTION';table_preview.instance_collection=top;table_preview['web_part']='table'
for index,(k,c) in enumerate(groups.items()):
    o=bpy.data.objects.new(k+' · 좌석 조합',None);scene.collection.objects.link(o);o.instance_type='COLLECTION';o.instance_collection=c;o.location=((index%2)*3.86,(index//2)*3.32,0);o['web_part']=k
scene.world=bpy.data.worlds.new('창가 밝기');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.70,.71,.67,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.57
for x,y in [(-1.8,-2.2),(1,-1),(3.8,-2.2),(2,3.2),(3.7,5.0)]:
    l=bpy.data.lights.new('창가 확산광','AREA');l.energy=185;l.shape='DISK';l.size=2.5
    o=bpy.data.objects.new('확산광',l);scene.collection.objects.link(o);o.location=(x,y,2.9);o.rotation_euler=(Vector((x,y+.24,.42))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.cameras.new('창가 의자');o=bpy.data.objects.new('창가 의자 촬영',cam);scene.collection.objects.link(o);scene.camera=o
def aim(loc,target,lens):
    o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();cam.lens=lens
views=[((.08,-1.64,1.06),(-1.12,0,.53),52),((-1.48,-2.48,1.35),(-.05,.33,.38),42),((1.37,-.65,.76),(1.12,.04,.64),58)]
aim(*views[1]);bpy.context.preferences.filepaths.save_version=0;scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(here/'seating.blend'),compress=True)
# The 32 placed chairs use a single compressed seat. The original four arrangements
# remain available to the city master with their authored positions and finishes.
chair=bpy.data.collections.new('웹 · 크림 가죽 의자');scene.collection.children.link(chair);chair['preview_origin']=(0,0,0);m.group=chair;bucket('cream');bpy.context.view_layer.update()
scene.collection.children.link(top);bpy.context.view_layer.update();bake_collection(top,'table',here/'table.glb',preserve_smoothing=True,simplification=(.78,.00038));scene.collection.children.unlink(top)
bake_collection(chair,'chair',here/'chair.glb',preserve_smoothing=True,simplification=(.69,.00052));scene.collection.children.unlink(chair)
if '--bake' in sys.argv:
    from blender_furnished_light import bake_furnished
    banks=[o for o in scene.objects if o.instance_collection]
    for bank in banks:bank.hide_render=True
    preview=bpy.data.objects.new('웹 마감 베이크용 단일 의자',None);scene.collection.objects.link(preview);preview.instance_type='COLLECTION';preview.instance_collection=chair;preview['web_part']='chair'
    bake_furnished(here,scene.name,[('chair',chair.name,384)])
    bpy.data.objects.remove(preview,do_unlink=True)
    for bank in banks:bank.hide_render=False
    bake_furnished(here,scene.name,[('table',top.name,384)])
if '--render' in sys.argv:
    scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=770;scene.render.resolution_y=530;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=90
    for i,v in enumerate(views):aim(*v);scene.render.filepath='/tmp/gtw-exec-seat-'+str(i)+'.jpg';bpy.ops.render.render(write_still=True)
