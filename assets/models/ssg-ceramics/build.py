"""Kwangjuyo Gangnam. Metres; +Y behind the display, +Z up."""
import bpy
import runpy
from pathlib import Path
from math import pi, sin, cos, exp, radians
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.context.scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_Kwangjuyo')
bpy.context.scene.collection.children.link(collection)

def mesh(name, verts, faces, finish, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    data.materials.append(finish)
    for poly in data.polygons:
        poly.use_smooth = smooth
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    return obj

def linear(code):
    rgb = bytes.fromhex(code)
    return tuple(((v/255+.055)/1.055)**2.4 if v>10 else v/3294.6 for v in rgb)+(1,)

def surface(name, code, finish, roughness, metallic=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = linear(code)
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = m.diffuse_color
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    m['batch'] = finish
    return m

bronze = surface('새틴 청동 테두리','9D785D','Bronze',.33,.45)
beige = surface('기둥 패널','B59C87','Fixture',.48)
cream = surface('상아색 도장','EEE0CD','Fixture',.48)
dark = surface('선반 안쪽 그늘','766454','Fixture',.48)
red = surface('다홍색 포장 상자','A82E30','Fixture',.48)
ribbon = surface('상자 가장자리','811D25','Fixture',.48)
white = surface('설빛 유약','F0E7D4','Glaze',.22)
moon = surface('월백 유약','D9DFD8','Glaze',.22)
green = surface('청자 유약','8DAA89','Glaze',.22)
raw = surface('갈색 태토','A98D79','Glaze',.22)
ink = surface('남빛 하단','354664','Glaze',.22)
warm = surface('빛받은 적갈색','D9A891','Glaze',.22)
stone = surface('진열대 받침','E3CCB7','Fixture',.48)
light = surface('선반 하부 등','FFF1D7','Fixture',.48)

def block(name,x,y,z,w,d,h,m,corner=.007):
    # Rounded plan with narrow, chamfered top and bottom arrises.
    verts=[]; faces=[]
    rad=min(w/2-.0001,d/2-.0001,corner)
    cham=min(.003,h/4,rad*.4)
    for height,inset in [(0,cham),(cham,0),(h-cham,0),(h,cham)]:
        for q,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for i in range(5):
                a=pi/2*(q+i/4)
                verts.append((x+sx*(w/2-rad)+(rad-inset)*cos(a),y+sy*(d/2-rad)+(rad-inset)*sin(a),z+height))
    n=20
    for k in range(3):
        for i in range(n):
            j=(i+1)%n
            faces.append((k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i))
    faces.extend([tuple(reversed(range(n))),tuple(range(3*n,4*n))])
    return mesh(name,verts,faces,m)

def bar(name,p,q,r,m):
    direction=Vector(q)-Vector(p)
    axis=direction.normalized()
    side=axis.cross(Vector((1,0,0)) if abs(axis.x)<.85 else Vector((0,1,0))).normalized()
    cross=axis.cross(side)
    verts=[Vector(c)+r*(side*cos(i*pi/6)+cross*sin(i*pi/6)) for c in (p,q) for i in range(12)]
    faces=[(i,(i+1)%12,(i+1)%12+12,i+12) for i in range(12)]
    return mesh(name,verts,faces,m,True)

def shade(obj,colors):
    tint=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for attr,col in zip(tint.data,colors):
        attr.color=col
    mat=obj.data.materials[0]
    if not mat.node_tree.nodes.get('표면색'):
        node=mat.node_tree.nodes.new('ShaderNodeVertexColor')
        node.name='표면색'
        node.layer_name='Tint'
        mat.node_tree.links.new(node.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def lathe(name,pos,profile,n,shape,paint,tilt=0):
    # Explicit inside return, lip and recessed foot; point colors follow the glaze.
    verts=[]; colors=[]; faces=[]
    for row,(r,h) in enumerate(profile):
        for i in range(n):
            a=2*pi*i/n
            radius,height=shape(r,h,a)
            verts.append((radius*cos(a),radius*sin(a),height))
            rgb,gain=paint(row,r,h,a)
            # A soft light-box reflection turns with each individual pot.
            phase=cos(a+1.95)
            pool=.045*max(0,phase)**18 + .028*max(0,cos(a+.65))**24
            gain*=.82+.13*cos(a+1.7)+.05*cos(2*a+.6)
            colors.append(tuple(min(1,c*gain+pool) for c in rgb.diffuse_color[:3])+(1,))
    for k in range(len(profile)-1):
        for i in range(n):
            j=(i+1)%n
            faces.append((k*n+i,k*n+j,(k+1)*n+j,(k+1)*n+i))
    faces.extend([tuple(reversed(range(n))),tuple(range((len(profile)-1)*n,len(profile)*n))])
    obj=mesh(name,verts,faces,white,True)
    obj.location=pos
    obj.rotation_euler.x=radians(tilt)
    shade(obj,colors)
    return obj

def dish(kind,x,y,z,tilt=0):
    folded=kind=='접이'; melon=kind=='참외'
    r=.085 if folded else .095 if melon else .12
    h=.038 if folded else .026 if melon else .041
    profile=[(.05,.08),(.34,.08),(.35,0),(.43,0),(.45,.12),(.58,.18),(.76,.44),(.93,.80),(1,.97),(.996,1),(.976,.995),(.90,.82),(.72,.53),(.49,.28),(.24,.22),(.025,.22)]
    def shape(rad,height,a):
        crease=max(0,cos((4 if folded else 8)*a))**12 if folded or melon else 0
        return r*rad*(1-crease*rad**2*(.075 if folded else .045)), h*(height-.105*crease*rad**3)
    def paint(row,rad,height,a):
        m=(raw if row<8 else green) if folded else white
        crease=max(0,cos((4 if folded else 8)*a))**12 if folded or melon else 0
        return m, (.70+.25*rad+.13*height-.18*crease*rad+.08*cos(a-.9))*(.73 if row<8 else 1)
    return lathe({'접이':'청자 네 쪽 접이 접시','참외':'미각 설빛 참외형접시','선':'선 오목 접시'}[kind],(x,y,z),profile,48 if melon else 32,shape,paint,tilt)

def jar(x,y,z,h,split=False):
    profile=[(.04,.02),(.32,.02),(.32,0),(.39,0),(.40,.04),(.47,.10),(.64,.19),(.84,.33),(.96,.45),(1,.57),(.98,.68),(.91,.78),(.78,.87),(.60,.94),(.44,.97),(.46,.989),(.46,1),(.40,1),(.39,.973),(.41,.94),(.63,.88),(.77,.76),(.82,.57),(.64,.30),(.1,.15)]
    def paint(row,r,v,a):
        m=moon
        if split:
            m=ink if v<.33 else warm if v<.58 else white
        return m, (.89+.11*cos(a+1)*sin(pi*v)+.04*sin(2*pi*v))*(.65 if row>18 else 1)
    return lathe('하단 이색 항아리' if split else '월백 원호',(x,y,z),profile,32,
                 lambda r,v,a:(r*h*.49*(1+.008*sin(3*a+v)),v*h),paint)

def apple(x,y,z):
    # Two editable halves with matching gadroons and a short upright stem.
    steps=[[(.10,.006),(.45,.008),(.63,.08),(.84,.20),(.99,.38),(1,.49),(.97,.51),(.91,.49),(.85,.40),(.66,.19),(.10,.13)],
           [(.12,.50),(.93,.50),(.99,.515),(.99,.62),(.89,.77),(.73,.89),(.52,.97),(.30,1),(.16,.965),(.09,.96)]]
    for name,profile in zip(['미각 사과형 합 몸체','미각 사과형 합 뚜껑'],steps):
        lathe(name,(x,y,z),profile,64,lambda r,h,a:(.069*r*(1-.082*max(0,cos(16*a))**3),.104*h),
              lambda row,r,h,a:(white,.96-.16*max(0,cos(16*a))**4*r+.04*cos(a)))
    bar('사과 꼭지',(x,y,z+.099),(x+.003,y,z+.119),.0045,white)

# Recessed pillar and its three warm-edged shelves; the low bronze framed return
# projects beyond the pillar, like the manufacturer's Gangnam opening photograph.
cx=-.82
block('기둥 뒷판',cx,.24,0,1.37,.15,3.0,beige)
block('기둥 하단',cx,.07,.02,1.36,.38,1.10,beige,.035)
block('빛받는 선반 속판',cx,.145,1.10,1.13,.035,1.34,cream)
# Sample the warm light pool falling down the rear wall below each strip.
for base,top in [(1.162,1.527),(1.572,1.947),(1.992,2.397)]:
    verts=[]; colors=[]; faces=[]
    for row in range(9):
        t=row/8
        for col in range(17):
            u=col/16
            verts.append((cx+(u-.5)*1.123,.124,base+(top-base)*t))
            gain=.60+.41*(sin(pi*u)**.55)*(.44+.56*sin(pi*t*.80))+.12*t
            colors.append(tuple(min(1,c*gain) for c in cream.diffuse_color[:3])+(1,))
            if row and col:
                i=row*17+col
                faces.append((i-18,i-17,i,i-1))
    panel=mesh('매입장 조명 그라데이션',verts,faces,cream.copy())
    shade(panel,colors)
for side in [-1,1]:
    block('매입장 측판',cx+side*.626,.04,.97,.12,.42,1.57,beige,.018)
    block('선반 테두리',cx+side*.562,-.151,1.11,.018,.025,1.31,bronze)
block('기둥 머리',cx,.055,2.46,1.36,.42,.54,beige,.024)
for h in [1.12,1.53,1.95,2.40]:
    block('매입 선반',cx,-.004,h,1.14,.345,.035,bronze)
    block('미색 진열면',cx,-.006,h+.032,1.11,.329,.010,cream)
    block('선반 아래 조명',cx,-.118,h-.006,1.02,.012,.008,light)
for i,(w,d,h) in enumerate([(.60,.21,.14),(.33,.18,.14)]):
    z=1.992+.14*i
    block('광주요 적색 상자',cx,-.01,z,w,d,h,red)
    block('상자 뚜껑',cx,-.01,z+h-.034,w+.006,d+.006,.035,ribbon)

# Lower showroom return: two open levels with a row of plate slots over two jars.
block('둥근 모서리 받침',-.60,-.50,.014,1.78,.68,.14,cream,.13)
block('청동 바닥 몰딩',-.60,-.50,.142,1.78,.68,.026,bronze,.13)
for a in [-1.42,.22]:
    for b in [-.77,-.24]:
        block('개방형 진열장 기둥',a,b,.166,.032,.032,.815,bronze)
for z in [.58,.952]:
    block('청동 선반틀',-.60,-.50,z,1.74,.62,.028,bronze,.07)
    block('미색 진열 선반',-.60,-.50,z+.028,1.68,.57,.013,cream,.066)
jar(-1.04,-.53,.168,.32,True)
jar(-.59,-.51,.168,.375,True)
block('원호 받침',-.09,-.50,.168,.32,.32,.12,stone,.018)
jar(-.09,-.50,.288,.25)
# Display the folded lips face-on, on discreet angled metal supports.
def soft_contact(x,y,z,w,d,base=cream):
    verts=[(x,y,z)]
    colors=[tuple(c*.49 for c in base.diffuse_color[:3])+(1,)]
    for size,gain in [(.38,.62),(.73,.90),(1,1)]:
        for j in range(20):
            a=2*pi*j/20
            verts.append((x+w*size*cos(a),y+d*size*sin(a),z))
            colors.append(tuple(c*gain for c in base.diffuse_color[:3])+(1,))
    faces=[(0,1+i,1+(i+1)%20) for i in range(20)]
    for k in [1,21]:
        faces.extend((k+i,k+20+i,k+20+(i+1)%20,k+(i+1)%20) for i in range(20))
    obj=mesh('기물 아래 음영',verts,faces,base.copy())
    shade(obj,colors)

def standing(kind,x,y,z):
    soft_contact(x,y,z+.0006,.103,.052)
    radius={'선':.12,'참외':.095,'접이':.085}[kind]
    bar('접시대 등받이',(x,y+.035,z),(x,y+.070,z+radius*1.2),.003,bronze)
    for side in [-1,1]:
        bar('접시대 발',(x,y+.034,z+.003),(x+side*radius*.48,y-.028,z+.003),.003,bronze)
    dish(kind,x,y,z+radius*.97,73)

for i in range(7):
    obj=dish('참외' if i%2 else '선',-1.28+i*.075,-.49,.621+(.092 if i%2 else .117),75)
    obj.rotation_euler.z=radians(54)
for a in [-.49,-.22,.05]:
    dish('접이',a,-.53,.621)
for i,a in enumerate([-1.06,-.66,-.26]):
    soft_contact(a,-.54,.9937,.090,.065)
    apple(a,-.54,.993)
dish('참외',.04,-.54,.993)
for x,k in [(-1.15,'선'),(-.84,'접이'),(-.53,'참외')]:
    standing(k,x,0,1.162)
for i,x in enumerate([-1.16,-.82,-.48]):
    soft_contact(x,-.036,1.5727,.085,.065)
    dish('접이',x,-.036,1.572)
# Side credenza with rounded front corners and open bronze uprights.
sx=1.17
block('하부 걸레받이',sx,-.04,.015,1.62,.66,.095,bronze,.115)
block('미색 문갑',sx,-.04,.108,1.66,.70,.72,cream,.12)
for i in [-1,0,1]:
    block('문갑 전면',sx+i*.495,-.393,.135,.484,.019,.663,stone,.012)
block('문갑 상판',sx,-.04,.825,1.67,.71,.035,cream,.12)
for x in [.40,1.94]:
    for y in [.156,-.195]:
        bar('둥근 진열장 골조',(x,y,.86),(x,y,1.77),.017,bronze)
for z in [1.26,1.72]:
    block('선반 청동 틀',sx,-.02,z,1.61,.44,.028,bronze,.055)
    block('선반 깔판',sx,-.02,z+.028,1.58,.42,.013,cream,.047)
for a in [.64,1.14,1.67]:
    standing('선',a,.016,1.761)
    dish('참외',a,-.035,1.301)
for i,k in enumerate(['접이','선','참외']):
    a=.67+i*.48
    standing(k,a,.105,.86)
    dish(k,a,-.20,.86)
# Lettering on pillar crown, sized for the play camera. Bfont is built in.
font=bpy.data.curves.new('광주요 영문 명판','FONT')
font.body='KWANGJUYO'; font.size=.133; font.align_x='CENTER'
font.space_character=1.14; font.extrude=.001
label=bpy.data.objects.new('광주요 명판',font)
collection.objects.link(label)
label.location=(cx,-.162,2.63);label.rotation_euler.x=pi/2
font.materials.append(bronze)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'showroom.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
