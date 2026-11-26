"""Entrance and dining hall from the public NewCore Gangnam restaurant photographs."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("NC_YucheonDiningHall")
bpy.context.scene.collection.children.link(collection)
materials = {}
def finish(hexcode):
    if hexcode not in materials:
        m = bpy.data.materials.new(hexcode)
        rgb = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
        m.diffuse_color = [c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]+[1]
        materials[hexcode] = m
    return materials[hexcode]
def mesh(name,verts,faces,tint):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces)
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(finish(tint))
    return obj
def box(name,x,y,z,w,d,h,tint):
    verts=[(x+a*w/2,y+b*d/2,z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tint)
font=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
def lettering(label,x,y,z,width,height,tint):
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.font=font;c.align_x='CENTER';c.align_y='CENTER';c.resolution_u=4
    o=bpy.data.objects.new(label,c);collection.objects.link(o);c.materials.append(finish(tint))
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)
    o.scale=(width/max(.001,o.dimensions.x),height/max(.001,o.dimensions.y),1)
    o.rotation_euler.x=pi/2;o.location=(x,y,z)
# The black metal frame surrounds an open corner. Round end tiles sit under
# the dark roof strip; the name is suspended, with no opaque board behind it.
def tile(name,x,y,z,r,depth):
    profile=[(r*cos(pi*k/9),r*sin(pi*k/9)) for k in range(10)]
    vs=[(x+a,y+b,z+c) for b in (0,depth) for a,c in profile]
    faces=[(i,i+1,i+11,i+10) for i in range(9)]
    return mesh(name,vs,faces,'625e58')
def eave(y,z,span):
    box('기와 하부 목재 띠',0,y+.11,z-.065,span,.27,.075,'443b35')
    for i in range(round(span/.23)):
        x=-span/2+(i+.5)*.23
        tile('반원 기와',x,y,z,.111,.3)
        tile('앞 기와 마구리',x,y-.008,z,.094,.018)
def lantern(x,y):
    box('행거',x,y,2.93,.025,.025,.50,'38302a')
    box('유백지 등갓',x,y,2.37,.54,.53,.54,'f4d8a2')
    for a in [-1,1]:
        for b in [-1,1]:
            box('등갓 모서리',x+.274*a,y+.269*b,2.35,.024,.024,.59,'44392f')
    for z in [2.35,2.91]:
        for a in [-1,1]:
            box('등갓 가로 테',x,y+a*.27,z,.56,.022,.03,'44392f')
            box('등갓 옆 테',x+a*.275,y,z,.022,.54,.03,'44392f')
def dish(x,y,z,s,color):
    n=16
    for r,tint,off in [(s,'dde0d5',0),(s*.78,color,-.002)]:
        vs=[(x+r*cos(2*pi*i/n),y+off,z+r*.66*sin(2*pi*i/n)) for i in range(n)]
        mesh('메뉴 그릇 그림',vs,[tuple(range(n))],tint)
def menu(x,y):
    box('메뉴 받침',x,y,0,.68,.40,.045,'383734')
    box('안내판 다리',x,y,.045,.055,.06,.47,'46413c')
    box('검은 안내판 프레임',x,y,.48,.65,.07,1.25,'393830')
    box('크림색 메뉴 지면',x,y-.038,.53,.58,.009,1.15,'ede7d9')
    lettering('유천냉면',x,y-.047,1.56,.38,.075,'373a32')
    for row in range(3):
        for col in range(2):
            xx=x+(col-.5)*.27;zz=1.34-row*.31
            dish(xx,y-.052,zz,.105,['ce9f66','9b583b','ccac81','78935b','bb8255','a9a06d'][row*2+col])
            box('메뉴 설명선',xx,y-.051,zz-.115,.143,.008,.013,'5d5144')
def table(x,y):
    box('짙은 목재 식탁',x,y,.72,1.04,.68,.065,'554637')
    for off in [-.37,.37]:
        box('탁자 다리',x+off,y,0,.08,.48,.72,'413b33')
    for side in [-1,1]:
        yy=y+side*.50
        for dx in [-.16,.16]:
            for dy in [-.14,.14]:box('식당 의자 다리',x+dx,yy+dy,0,.033,.033,.43,'383534')
        box('검은 의자 방석',x,yy,.42,.39,.36,.045,'4a443d')
        box('검은 의자 등받이',x,yy+side*.17,.44,.38,.042,.36,'403e39')
    box('수저통',x+.34,y,.79,.14,.085,.13,'a4967a')
# Weathered plank-shaped floor tiles, fitted in offset courses as seen from the aisle.
for row in range(16):
    x=-3.75+row*.50
    for j in range(-1,7):
        near=max(.12,j*1.46+(row%3)*.42);far=min(8.40,(j+1)*1.46+(row%3)*.42-.012)
        if far>near:
            box('목재무늬 바닥 타일',x,(near+far)/2,.002,.491,far-near,.012,
                ['817769','746b60','8c8275','776e61','847b6e'][(j+row*3)%5])
# The restaurant ceiling seen behind the suspended white wordmark has a
# warm recessed central plane, darker than the department store grid.
box('입구 천장 하부',0,1.49,3.345,7.89,2.67,.07,'776c61')
for x in [-2.65,-.92,.92,2.65]:
    box('입구 천장 매입등',x,1.12,3.332,.108,.108,.017,'fff4d4')
for x in [-3.38,3.38]:
    box('홀 천장 단차',x,4.38,3.38,1.10,5.35,.085,'998e7e')
for x in [-3.94,3.94]:
    box('열린 입구 기둥',x,0,0,.105,.15,3.49,'403b34')
box('입구 금속 상인방',0,.03,3.36,8.05,.17,.13,'3f3935')
eave(.105,3.28,7.85)
for x in [-.91,.91]:box('간판 가는 현수봉',x,.11,2.96,.016,.018,.32,'4b4640')
lettering('유천냉면',.11,.025,2.97,2.06,.39,'fff9ec')
box('흰색 명패 바탕',-1.12,.055,2.82,.30,.055,.30,'fff8e7')
lettering('柳',-1.12,.022,2.98,.17,.19,'65574b')
for x,y in [(-2.92,.24),(-2.17,.42),(2.93,.34)]:menu(x,y)
box('식당 안쪽 청록 벽',0,8.43,0,8,.07,3.45,'37564d')
for i in range(7):
    x=(i-3)*.99
    box('미색 벽면 패널',x,8.35,1.06,.965,.065,1.77,'cac0a7')
    box('하부 목재 벽면',x,8.35,.04,.965,.075,.99,'675644')
for i in [-1,0,1]:
    x=i*1.96
    box('벽 액자',x,8.27,1.40,.65,.044,1.04,'403e36')
    box('음식 포스터',x,8.24,1.45,.57,.019,.93,'aa9475')
    dish(x,8.228,1.96,.22,['ab633e','839068','c49457'][i+1])
eave(8.13,2.91,7.82)
for x in [-2.05,1.86]:
    for y in [2.10,4.62]:table(x,y)
for y in [1.60,3.58,5.70]:lantern(2.95,y)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
