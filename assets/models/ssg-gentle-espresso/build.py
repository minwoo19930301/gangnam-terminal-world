"""살롱드호우섬 강남점 식탁. 미터 단위, +Y는 식탁 안쪽이다."""
from pathlib import Path
from math import cos, sin, pi, sqrt
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_SalonDeHaoSum')
bpy.context.scene.collection.children.link(col)
rng = Random(6737)
tau = 2*pi

def finish(name, value, batch='HaoMeal'):
    vals = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba
    p.inputs['Roughness'].default_value=.29 if batch=='HaoGlaze' else .58
    m['batch']=batch
    return m

stone=finish('상아색 식탁','e8ddc8')
wood=finish('목재 테두리','573c31')
frame=finish('짙은 카트 프레임','343a35')
bamboo=finish('대나무 살','c78d56')
honey=finish('찜기 테두리','e2b781')
seam=finish('대나무 이음','9d6940')
white=finish('백자','faf4e4','HaoGlaze')
celadon=finish('청자색 문양','83a38b','HaoGlaze')
paper=finish('찜 종이','f0e6d7')
ink=finish('블랙 하가우','20232a','HaoGlaze')
pastry=finish('소롱포 피','e9c781')
pot=finish('갈색 뚝배기 유약','553322','HaoGlaze')
rim=finish('뚝배기 입술','99643f','HaoGlaze')
clay=finish('솥 받침','292423')
sauce=finish('마파 소스','aa4d21','HaoGlaze')
tofu=finish('두부','eab981')
rice=finish('밥알','efdbb0')
green=finish('청경채','52863c')
stem=finish('청경채 줄기','a3bd64')
chile=finish('고추','ba4628')
scallion=finish('쪽파','43824d')
cloth=finish('접은 냅킨','204c43')
brass=finish('손잡이','b59863','HaoGlaze')

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

def dish(x,y,z,r):
    turn('백자 접시',x,y,z,[(r*.55,0),(r*.62,.004),(r,.016),(r,.021),(r*.91,.019),(r*.57,.008)],white)

top=.80
panel('식탁 상판',0,0,.768,1.30,.91,.032,stone,.035)
panel('목재 앞치마',0,0,.714,1.25,.86,.054,wood,.025)
for x in [-.53,.53]:
    for y in [-.33,.33]:panel('식탁 다리',x,y,0,.058,.058,.72,wood)

def dumpling(x,y,z,black,angle):
    # Crescent har gow with a gathered straight seam, or round purse with a twisted crown.
    loops=[]
    for k in range(17):
        f=k/16
        row=[]
        for j in range(84):
            t=tau*j/84
            if black:
                rr=(.50+.52*sin(pi*f))*(1-.77*f**3)
                fold=1+.084*cos(11*t+1.3*f)*sin(pi*f)**.7
                a=.049*rr*cos(t)*fold
                b=.036*rr*sin(t)*fold+.014*cos(t)**2+.008*f
                h=.049*f+.006*sin(t)*sin(pi*f)
            else:
                rr=(.65+.49*sin(pi*f))*(1-.82*f**2)
                pleat=1+.073*cos(11*t-2.4*f)*(.15+.85*f)
                a=.040*rr*cos(t)*pleat;b=.039*rr*sin(t)*pleat
                h=.059*f+.0035*cos(11*t-2.4*f)*f
            row.append((x+a*cos(angle)-b*sin(angle),y+a*sin(angle)+b*cos(angle),z+h))
        loops.append(row)
    rings('부채 주름 블랙 하가우' if black else '꼬아 닫은 게살 소롱포',loops,ink if black else pastry)

def basket(x,y,black):
    dish(x,y,top,.173)
    z=top+.018
    turn('대나무 찜통',x,y,z,[(.134,0),(.145,.009),(.148,.085),(.145,.089),(.139,.088),(.136,.025)],bamboo)
    for hi in [.008,.021,.082]:
        turn('겹대 띠',x,y,z+hi,[(.146,0),(.150,.001),(.150,.005),(.146,.006),(.145,0)],honey,band=True)
    turn('찜지',x,y,z,[(.136,.042),(.136,.043)],paper)
    for i in range(-3,4):
        for j in range(-3,4):
            if i*i+j*j<=10:
                turn('찜지 통기공 음영',x+i*.038,y+j*.038,z+.0432,[(.0046,0),(.0046,.0002)],seam,10)
    for j in range(3):
        t=tau*j/3+.25
        dumpling(x+.070*cos(t),y+.065*sin(t),z+.044,black,t+.7)
    for a in [-1.5,.66,2.75]:
        for h in [.031,.050]:
            pts=[(x+.149*cos(a+i*.038),y+.149*sin(a+i*.038),z+h+.002*i) for i in range(4)]
            tube('대나무 엮음 매듭',pts,.002,honey)
basket(-.27,-.17,True)
basket(-.27,.19,False)

# Brown earthen pot on black heat trivet. Rice, tofu, chiles and folded bok choy.
x,y=.15,.06
turn('내열 받침',x,y,top,[(.13,0),(.169,.009),(.171,.021),(.155,.026)],clay)
z=top+.024
turn('뽀짜이판 뚝배기',x,y,z,[(.090,0),(.121,.013),(.151,.046),(.158,.094),(.166,.111),(.164,.122),(.152,.123),(.145,.097),(.111,.026)],pot)
turn('도톰한 솥전',x,y,z+.113,[(.161,0),(.166,.002),(.165,.010),(.159,.013),(.152,.010),(.152,.005)],rim,band=True)
turn('고슬한 솥밥',x,y,z,[(.146,.079),(.147,.099),(.115,.104)],rice)
turn('마파 소스',x-.014,y-.006,z+.099,[(.125,0),(.123,.006),(.095,.010)],sauce)
for i in range(90):
    t=rng.random()*tau
    rr=.13*sqrt(rng.random())
    xx,yy=x+rr*cos(t),y+rr*sin(t)
    if xx>x+.04 and yy>y:continue
    if i%4==0:
        panel('양념 두부',xx,yy,z+.105,.024,.022,.014+rng.random()*.008,tofu,.004)
    else:
        turn('다진 양념',xx,yy,z+.109,[(.006,0),(.006,.004),(.003,.007)],[chile,scallion,rim][i%3],7)
for i in range(5):
    a=.02+i*.24
    pts=[]
    for j in range(12):
        f=j/11;length=.097*f;w=.014*sin(pi*f)**.6+.002
        cx=x+.018+length*cos(a);cy=y+.015+length*sin(a)
        hh=z+.119+.014*sin(pi*f)+i*.0008
        pts.append([(cx-w*sin(a),cy+w*cos(a),hh),(cx,cy,hh+.007),(cx+w*sin(a),cy-w*cos(a),hh)])
    mesh('청경채 잎',[p for row in pts for p in row],[(j*3+k,j*3+k+1,j*3+k+4,j*3+k+3) for j in range(11) for k in range(2)],green)
    tube('청경채 잎맥',[row[1] for row in pts[:9]],.003,stem)

# Two covers, a side dish, folded napkin and chopsticks.
for xx,yy in [(.44,-.24),(.44,.25)]:
    dish(xx,yy,top,.105)
    turn('청자색 띠',xx,yy,top+.016,[(.092,0),(.094,.001),(.090,.002)],celadon,band=True)
    for j in range(20):
        t=tau*j/20
        turn('접시 잎무늬',xx+.083*cos(t),yy+.083*sin(t),top+.019,[(.003,0),(.002,.001)],celadon,6)
    for dx in [-.011,.011]:
        tube('젓가락',[(xx+.116+dx,yy-.102,top+.006),(xx+.106+dx,yy+.102,top+.005)],.0038,wood)
turn('차 잔',-.53,.05,top,[(.032,0),(.044,.018),(.048,.073),(.045,.077),(.041,.071),(.032,.012)],white)
dish(.038,-.285,top,.064)
for i in range(15):
    t=i*2.4;r=.040*sqrt(i/15)
    tube('절임 채소',[(.038+r*cos(t)+j*.006,-.285+r*sin(t)+.004*sin(j),top+.012+.008*sin(j*pi/5)) for j in range(6)],.0038,honey)
mesh('접은 녹색 냅킨',[(.01,.34,top),(.17,.34,top),(.10,.39,top+.103),(.07,.414,top)],[(0,1,2),(1,3,2),(3,0,2)],cloth)

# Movable side trolley, staged with clean stacked plates beside the dining table.
cx,cy=-1.19,.18
for xx in [cx-.29,cx+.29]:
    for yy in [cy-.18,cy+.18]:
        tube('바퀴 축',[(xx,yy,.064),(xx,yy,.158)],.013,brass)
        tube('고무 캐스터',[(xx-.013,yy,.059),(xx+.013,yy,.059)],.054,frame,20)
        tube('바퀴 허브',[(xx-.016,yy,.059),(xx+.016,yy,.059)],.020,brass,16)
        tube('카트 기둥',[(xx,yy,.136),(xx,yy,.856)],.013,frame)
for hh in [.17,.49,.79]:
    panel('카트 트레이',cx,cy,hh,.63,.40,.028,wood,.024)
    for yy in [cy-.195,cy+.195]:panel('쟁반 가드',cx,yy,hh+.027,.62,.011,.030,brass,.004)
for yy in [cy-.18,cy+.18]:
    tube('카트 손잡이',[(cx-.29,yy,.82),(cx-.30,yy,.88),(cx-.34,yy,.923),(cx-.399,yy,.923)],.014,frame)
tube('손잡이 가로대',[(cx-.399,cy-.18,.923),(cx-.399,cy+.18,.923)],.017,wood)
for xx,count in [(cx-.13,5),(cx+.13,3)]:
    for j in range(count):dish(xx,cy,.819+j*.009,.117)
for j in range(5):dish(cx,cy,.519+j*.010,.152)

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE MESHES',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'meal.blend'),compress=True)
# Bake per-part surface colours and preserve separate glossy and matte finishes.
for batch in ['HaoMeal','HaoGlaze']:
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
