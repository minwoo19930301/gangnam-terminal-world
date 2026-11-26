"""히바린 강남점 시그니처 샘플러. 미터 단위, +Y는 식탁 안쪽이다."""
from pathlib import Path
from math import cos, sin, pi, sqrt
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_Hibarin')
bpy.context.scene.collection.children.link(col)
rng = Random(176)
tau = 2*pi

def finish(name, value, batch='HibarinGangnamSampler'):
    vals = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba
    p.inputs['Roughness'].default_value=.29 if batch=='HibarinGangnamGlaze' else .58
    if batch=='HibarinGangnamGlaze':
        p.inputs['Metallic'].default_value=.13
    m['batch']=batch
    return m

def mesh(name,vs,fs,mat,smooth=False):
    me=bpy.data.meshes.new(name)
    me.from_pydata(vs,[],fs)
    me.materials.append(mat)
    for p in me.polygons:p.use_smooth=smooth
    obj=bpy.data.objects.new(name,me)
    col.objects.link(obj)
    return obj

def rings(name,loops,mat,smooth=True,cap=True):
    n=len(loops[0])
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(len(loops)-1) for j in range(n)]
    if cap:faces.extend([tuple(reversed(range(n))),tuple(range(n*(len(loops)-1),n*len(loops)))])
    return mesh(name,[p for row in loops for p in row],faces,mat,smooth)

def turn(name,x,y,z,profile,mat,n=48,band=False):
    if band:profile=[*profile,profile[0]]
    return rings(name,[[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z+h) for i in range(n)] for r,h in profile],mat,cap=not band)

def panel(name,x,y,z,w,d,h,mat,rad=.012):
    r=min(rad,w/2-.0001,d/2-.0001)
    def outline(shrink,high):
        v=[]
        for corner,(sx,sy) in enumerate(((1,1),(-1,1),(-1,-1),(1,-1))):
            for i in range(5):
                a=(corner+i/4)*pi/2
                v.append((x+sx*(w/2-r)+(r-shrink)*cos(a),y+sy*(d/2-r)+(r-shrink)*sin(a),z+high))
        return v
    b=min(r/3,h/4,.005)
    return rings(name,[outline(b,0),outline(0,b),outline(0,h-b),outline(b,h)],mat,False)

def tube(name,points,r,mat,n=8):
    loops=[]
    for i,p in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        v=tangent.cross(Vector((1,0,0)) if abs(tangent.x)<.85 else Vector((0,1,0))).normalized()
        w=tangent.cross(v)
        loops.append([Vector(p)+r*(v*cos(tau*j/n)+w*sin(tau*j/n)) for j in range(n)])
    return rings(name,loops,mat)

def glaze(name,color):
    return finish(name,color,'HibarinGangnamGlaze')

oak=finish('오크 무늬목','ab794d')
wood=finish('의자 프레임','8b6344')
grain=finish('목리','916941')
linen=finish('좌판 직물','7b695e')
black=glaze('흑유 도기','252023')
steel=glaze('철망','aaa8a1')
cream=glaze('아이보리 도기','e6e0cf')
red=glaze('옻칠 숟가락','ad3922')
ink=finish('먹색','333430')
paper=finish('차림지','e8e3cf')
print_color=finish('차림지 선묘','b1ac94')
top=.77
panel('모서리를 굴린 식탁',0,0,top-.035,.95,1.16,.035,oak)
panel('식탁 하부 테',0,0,top-.091,.88,1.08,.056,wood)
for sx in [-1,1]:
    for sy in [-1,1]:
        panel('식탁 다리',sx*.409,sy*.502,0,.052,.052,.705,wood)
    cx=sx*.69
    panel('의자 좌판',cx,0,.42,.43,.44,.047,linen,.04)
    for i in [-1,1]:
        for j in [-1,1]:
            tube('의자 다리',[(cx+i*.20,j*.20,0),(cx+i*.17,j*.17,.426)],.021,wood)
        tube('등받이 기둥',[(cx+sx*.174,i*.169,.425),(cx+sx*.204,i*.187,.847)],.019,wood)
    for h in [.63,.78]:
        tube('휜 등받이',[(cx+sx*(.198+.024*sin(pi*i/8)),(i/8-.5)*.393,h+.01*sin(pi*i/8)) for i in range(9)],.035,oak,10)

vs=[];fs=[]
for i in range(210):
    x=rng.uniform(-.465,.465);y=rng.uniform(-.565,.45);length=min(.56-y,rng.uniform(.045,.46))
    for j in range(8):
        t=j/7;w=.0009*sin(pi*t);px=x+.0021*sin(t*4+i)
        vs.extend([(px-w,y+t*length,top+.0001),(px+w,y+t*length,top+.0001)])
        k=len(vs)-4
        if j:fs.append((k,k+1,k+3,k+2))
mesh('무늬목의 가는 결',vs,fs,grain)

# The sampler sits in three black wells over a printed serving tray.
base=top+.012
panel('쟁반 테두리',-.026,-.227,top,.666,.493,.011,black)
panel('무늬 차림지',-.026,-.227,top+.010,.649,.476,.002,paper)
vs=[];fs=[]
for row in range(7):
    for col_i in range(10):
        for rr in [.019,.024,.029,.034]:
            cx=-.322+col_i*.066;cy=-.445+row*.067
            for k in range(11):
                a=pi*k/10
                vs.extend([(cx+(rr+dr)*cos(a),cy+(rr+dr)*sin(a),base+.0003) for dr in [-.00048,.00048]])
                n=len(vs)-4
                if k:fs.append((n,n+1,n+3,n+2))
mesh('차림지의 겹부채 물결',vs,fs,print_color)
dish_y=-.137
panel('세 칸 카츠 접시',-.026,dish_y,base+.001,.61,.214,.010,black)
for i in [-1,0,1]:
    xx=-.026+i*.196
    for side in [-1,1]:
        panel('낮은 사각 접시 테',xx,dish_y+side*.103,base+.01,.199,.007,.024,black,.003)
        panel('접시 칸막이',xx+side*.096,dish_y,base+.01,.007,.203,.024,black,.003)
    # Diamond wire racks below each portion with rolled edges.
    for sign in [-1,1]:
        for k in range(-6,7):
            off=k*.024
            lo=max(-.085,-.085-off);hi=min(.085,.085-off)
            if hi>lo:
                tube('마름모 철망',[(xx+lo,dish_y+sign*(lo+off),base+.019),(xx+hi,dish_y+sign*(hi+off),base+.019)],.0011,steel,5)
crust=[finish('빵가루 '+str(i),c) for i,c in enumerate(['ba712e','d58c37','e7a94d','efd093','955524','cc8336'])]
pork=finish('등심 단면','debc97')
cheese=glaze('모차렐라','ffedb4')
white=finish('치즈 둘레','f4dfbd')
green=glaze('꽈리고추','55822a')
fry_z=base+.020
# Model the cut surfaces and individually directed panko shards. All shards
# belonging to one piece and colour are a single editable part.
def cutlet(name,cx,cy,a,rx,ry,height,cut=None):
    def loc(x,y,z):
        return cx+x*cos(a)-y*sin(a),cy+x*sin(a)+y*cos(a),fry_z+z
    n=32
    def point(q,s,h):
        # A softly squared, slightly lopsided section.
        xx=cos(q);yy=sin(q)
        return loc(rx*(1 if xx>=0 else -1)*abs(xx)**.79*s*(1+.055*sin(3*q)),ry*(1 if yy>=0 else -1)*abs(yy)**.81*s,h+.0025*sin(2*q)*s)
    profile=[(.83,.002),(1,.012),(1.02,height*.69),(.89,height)]
    rings(name,[[point(tau*j/n,s,h) for j in range(n)] for s,h in profile],crust[0])
    if cut:
        for s,h,m in [(.84,height+.0006,white if cut==cheese else pork),(.70,height+.0017,cut)]:
            rings(name+' 절단면',[[point(tau*j/n,s*f,h+dh) for j in range(n)] for f,dh in [(1,0),(.62,.0015),(.15,.0025)]],m)
    buckets=[([],[]) for _ in crust]
    for j in range(round(690*rx*ry/.003)):
        q=rng.random()*tau
        lid=rng.random()<.46
        s=(rng.uniform(.89,1) if cut else sqrt(rng.random())*.95) if lid else rng.uniform(.97,1.025)
        h=height+rng.uniform(-.002,.001) if lid else rng.uniform(.005,height-.002)
        p=Vector(point(q,s,h));dx=.0017+rng.random()*.0023
        angle=rng.random()*tau
        v=Vector((cos(angle)*dx,sin(angle)*dx,rng.uniform(.0001,.002)))
        w=Vector((-sin(angle)*dx*.35,cos(angle)*dx*.35,.0003))
        verts,faces=rng.choice(buckets);k=len(verts)
        verts.extend([p-v,p+w,p+v,p-w,p+Vector((0,0,.0018))])
        faces.extend([(k+i,k+(i+1)%4,k+4) for i in range(4)])
    for j,(vs,fs) in enumerate(buckets):
        if vs:mesh(name+' 바삭한 결',vs,fs,crust[j])
# Left well: fried prawn with a distinct fan tail and a round croquette.
cutlet('유부주머니카츠',-.209,-.098,-.1,.044,.045,.047)
cutlet('새우튀김',-.233,-.157,.76,.027,.088,.038)
tail=finish('익힌 새우 꼬리','cd7634')
for i in range(3):
    b=Vector((-.283,-.102,fry_z+.031));p=b+Vector((-.014-i*.006,.038-i*.008,.021))
    mesh('새우 꼬리 부채',[b,p+Vector((-.008,-.002,0)),p+Vector((.005,.004,.002)),b+Vector((.007,.001,-.002))],[(0,1,2,3),(3,2,1,0)],tail)
for j in [-1,1]:
    cutlet('트리플 모짜체다카츠 반쪽',-.043+j*.031,-.14,.09,.028,.077,.051,cheese)
# Right well: breaded loin cut across the grain, slightly fanned.
for j in range(4):
    cutlet('등심 카츠 조각',.119+j*.028,-.14+j*.004,.32,.018,.066-.008*abs(1.5-j),.037,pork if j==0 else None)
rings('꽈리고추',[[(-.002+.03*t+r*cos(a),-.077-.115*t,z+r*sin(a)) for a in [tau*i/12 for i in range(12)]] for t,r,z in [(0,.002,fry_z+.056),(.13,.004,fry_z+.053),(.20,.010,fry_z+.047),(.38,.018,fry_z+.037),(.6,.012,fry_z+.041),(.78,.014,fry_z+.03),(1,.002,fry_z+.022)]],green)
# Udon in the black bowl; thick smooth strands have distinct highlights.
ux,uy=-.05,-.344
turn('미니 우동 흑유 그릇',ux,uy,base,[(.040,0),(.044,.008),(.074,.034),(.094,.081),(.095,.087),(.092,.089),(.088,.084),(.064,.038),(.035,.014)],black)
broth=glaze('미니커리우동 국물','75421f')
turn('우동 국물',ux,uy,base+.066,[(.082,0),(.083,.001)],broth)
noodle=glaze('우동 면발','ddb75e')
for j in range(6):
    pts=[]
    phase=j*.83
    for k in range(53):
        t=k/52
        angle=t*tau*1.13+phase
        xx=.044*cos(angle)+.016*sin(2*angle+phase)+(j-2.5)*.005
        yy=.047*sin(angle)+.016*sin(3*angle+phase)
        pts.append((ux+xx,uy+yy,base+.069+.007*sin(2*angle+phase)+j*.00075))
    tube('굽이진 우동 면발',pts,.0054,noodle,8)
scallion=[finish('실파 바깥','518137'),finish('실파 속','a5b858')]
for j in range(22):
    xx=ux+rng.uniform(-.032,.032);yy=uy+rng.uniform(-.027,.029);zz=base+.079+rng.uniform(0,.004)
    turn('송송 썬 파',xx,yy,zz,[(.0046,0),(.0054,.0025),(.0033,.003),(.0033,0)],scallion[j%2],10,True)
tube('칠 숟가락 자루',[(.227,-.443,base+.007),(.209,-.363,base+.009),(.195,-.309,base+.015)],.006,red)
rings('칠 숟가락 술',[[ (.19+.022*s*cos(q),-.283+.036*s*sin(q),base+h) for q in [tau*k/24 for k in range(24)]] for s,h in [(.13,.007),(.78,.014),(1,.024),(.94,.025),(.64,.016),(.10,.011)]],red)
for j in range(2):
    tube('검은 젓가락',[(.319+j*.011,-.436,base+.003),(.309+j*.011,-.195,base+.004)],.0026,ink)

# Reference photograph shows four square bottles, long necks, flip caps and
# cream labels inside a white caddy with two wire retaining rails.
labels=['유자폰즈','매콤크림소스','참깨소스','돈카츠소스']
sauces=[glaze(n,c) for n,c in zip(labels,['573b26','dfc7aa','c9a479','382c29'])]
rack_y=.304
panel('흰 소스받침',0,rack_y,top,.408,.124,.014,cream)
for side in [-1,1]:
    panel('받침 옆판',side*.198,rack_y,top+.010,.009,.124,.045,cream)
    panel('받침 테',0,rack_y+side*.058,top+.012,.399,.008,.035,cream)
    for h in [.078,.127]:
        tube('받침 가드',[(side*.191,rack_y+.05,top+.018),(side*.191,rack_y-.052,top+h),(0,rack_y-.052,top+h)],.0026,steel)
from os import environ
font=bpy.data.fonts.load(environ.get('GTW_KOREAN_FONT','/System/Library/Fonts/Supplemental/AppleMyungjo.ttf'))
def label(word,x,y,z,size):
    curve=bpy.data.curves.new(word,'FONT');curve.body=word;curve.font=font;curve.size=size;curve.align_x='CENTER';curve.resolution_u=2
    obj=bpy.data.objects.new(word,curve);col.objects.link(obj);obj.location=(x,y,z);obj.rotation_euler.x=pi/2
    curve.materials.append(ink);bpy.ops.object.select_all(action='DESELECT');obj.select_set(True)
    bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
for j,word in enumerate(labels):
    x=(j-1.5)*.094;y=rack_y;z=top+.014
    panel(word+' 병',x,y,z,.079,.072,.174,sauces[j],.013)
    def shoulder(r,h):
        return [(x+r*cos(t)*(.99+.12*abs(sin(2*t))),y+r*.94*sin(t)*(.99+.12*abs(sin(2*t))),z+h) for t in [tau*i/32 for i in range(32)]]
    rings(word+' 어깨와 목',[shoulder(r,h) for r,h in [(.039,.165),(.039,.176),(.031,.183),(.018,.189),(.017,.249),(.02,.252)]],sauces[j])
    turn('플립캡',x,y,z+.244,[(.020,0),(.021,.004),(.021,.031),(.018,.035)],black,32)
    panel('병 라벨',x,y-.0365,z+.015,.059,.0012,.142,paper,.0005)
    label('hibarin',x,y-.0373,z+.132,.012)
    for k,ch in enumerate(word):label(ch,x,y-.0373,z+.112-k*.015,.016)
    # Circular leaf emblem, reconstructed with fine lines from the packaging.
    yy=y-.0377;zz=z+.147
    tube('라벨 잎 테',[(x+.009*cos(tau*k/24),yy,zz+.009*sin(tau*k/24)) for k in range(25)],.00052,ink,5)
    for k in [-1,0,1]:
        tube('잎맥',[(x-.006,yy,zz+k*.003+.003),(x+.004,yy,zz+k*.003-.003)],.00045,ink,4)
# Ridged suribachi with ground sesame. The interior wall carries radial grooves.
mx,my=-.282,.09
clay=glaze('절구 안쪽 적갈유','a46849')
turn('깨 절구',mx,my,top,[(.036,0),(.044,.009),(.069,.046),(.076,.053),(.074,.059),(.068,.059),(.061,.047),(.035,.018)],black)
rings('빗살무늬 절구 안쪽',[[(mx+r*cos(tau*k/48),my+r*sin(tau*k/48),top+h) for k in range(48)] for r,h in [(.068,.059),(.062,.048),(.034,.019),(.001,.017)]],clay,cap=False)
for j in range(64):
    a=tau*j/64
    tube('절구의 빗살',[(mx+r*cos(a+t),my+r*sin(a+t),top+h) for r,t,h in [(.025,0,.018),(.034,.02,.020),(.061,.08,.048),(.066,.10,.056)]],.00064,wood,4)
seeds=finish('볶은 참깨','e3bd79')
for i in range(53):
    a=rng.random()*tau;r=.024*sqrt(rng.random());x=mx+r*cos(a);y=my+r*sin(a)
    rings('볶은 참깨 낟알',[[ (x+s*.0025*cos(tau*k/7),y+s*.0014*sin(tau*k/7),top+h) for k in range(7)] for s,h in [(.65,.020),(1,.021),(.42,.0225)]],seeds)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.outliner.orphans_purge(do_recursive=True)
print('EDITABLE MESHES',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'hibarin.blend'),compress=True)
# Bake per-part surface colours and preserve separate glossy and matte finishes.
for batch in ['HibarinGangnamSampler','HibarinGangnamGlaze']:
    parts=[o for o in col.objects if o.data.materials[0].get('batch')==batch]
    mat=parts[0].data.materials[0].copy()
    mat.name=batch+' finish'
    v=mat.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Tint'
    mat.node_tree.links.new(v.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in parts:
        rgba=obj.data.materials[0].diffuse_color[:]
        tint=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
        for item in tint.data:item.color=rgba
        obj.data.materials.clear();obj.data.materials.append(mat)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join();bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
