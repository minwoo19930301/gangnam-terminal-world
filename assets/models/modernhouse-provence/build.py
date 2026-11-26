"""Build the Modern House Gangnam French-market table and its glazed ceramics (metres)."""
from pathlib import Path
from math import cos, sin, pi, tau, radians
import runpy
import subprocess
import bpy
from mathutils import Matrix, Vector

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
booth = bpy.data.collections.new('모던하우스 · 마르셰 프로방스')
scene.collection.children.link(booth)
booth['export_model'] = 'provence'
booth['preview_origin'] = (0, 0, 0)


def glaze(name, hexcode, rough=.45):
    color = [int(hexcode[i:i+2], 16)/255 for i in (0, 2, 4)]
    color = tuple(v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in color)
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = rough
    return mat


ivory = glaze('크림색 진열 목공', 'ECDDC1')
shadow = glaze('선반 안쪽', 'C0AD90')
steel = glaze('차양 기둥 · 주석', '666A67', .28)
blue = glaze('파우더 블루 면포', '99BBDE')
navy = glaze('코발트색 테이프', '264B93')
red = glaze('양귀비색 유약', 'E75243', .27)
rose = glaze('산호색 테두리', 'FA8170', .25)
white = glaze('프렌치 바닐라 유약', 'FFF3D9', .24)
yellow = glaze('유자색 유약', 'EFC64D', .27)
green = glaze('잎사귀색 유약', '438857', .29)
mint = glaze('셀러리색 유약', 'A0C49C', .28)
dark = glaze('수박씨', '493B34')
glass = glaze('유리 테의 반사광', 'C2D5D2', .15)
wood = glaze('접시받침 참나무', 'AF8355')
carton = glaze('상품 포장 · 상아색', 'DBCFB4')
cotton = glaze('차양의 흰 꽃무늬', 'EBF1F2')
cube_faces = [(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]


def mesh(name, verts, faces, material, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    booth.objects.link(obj)
    data.materials.append(material)
    if smooth:
        for face in data.polygons:
            face.use_smooth = True
    return obj


def block(name, x, y, z, w, d, h, m):
    return mesh(name, [(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)], cube_faces, m)


def line(name, points, radius, mat, sides=6):
    points = list(map(Vector, points))
    verts, faces = [], []
    for i,p in enumerate(points):
        tangent = (points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
        normal = tangent.cross(Vector((0,0,1)) if abs(tangent.z)<.90 else Vector((0,1,0))).normalized()
        across = tangent.cross(normal)
        verts.extend(p+radius*(normal*cos(tau*k/sides)+across*sin(tau*k/sides)) for k in range(sides))
        if i:
            a=(i-1)*sides
            faces.extend((a+k,a+(k+1)%sides,a+sides+(k+1)%sides,a+sides+k) for k in range(sides))
    return mesh(name,verts,faces,mat,True)


def lathe(name, rings, materials, bands, n=26):
    verts=[(r*cos(tau*i/n), r*sin(tau*i/n), z) for r,z in rings for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
    faces.append(tuple(reversed(range(n))))
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    obj=mesh(name,verts,faces,materials[0],True)
    for m in materials[1:]:
        obj.data.materials.append(m)
    for j,band in enumerate(bands):
        for face in list(obj.data.polygons)[j*n:(j+1)*n]:
            face.material_index=band
    return obj


def circle_line(name,x,y,z,r,thick,mat):
    return line(name,[(x+r*cos(tau*i/24),y+r*sin(tau*i/24),z) for i in range(25)],thick,mat,5)


def fruit_print(x,y,z,size,stemmat,fruitmat):
    # Flat enamel decals authored as individual circular berries and pointed sepals.
    verts,faces=[],[]
    for dx,dy,s in [(-.27,.07,.57),(.27,0,.58),(0,-.28,.55)]:
        base=len(verts)
        verts.extend((x+size*(dx+s*cos(tau*i/9)),y+size*(dy+s*sin(tau*i/9)),z) for i in range(9))
        faces.append(tuple(range(base,base+9)))
    fruit=mesh('작은 토마토 전사',verts,faces,fruitmat)
    top=mesh('토마토 꼭지',[(x,y,z+.0008),(x-size*.83,y+size*.57,z+.0008),
                           (x-size*.12,y+size*.35,z+.0008),(x+size*.13,y+size*.88,z+.0008),
                           (x+size*.25,y+size*.30,z+.0008),(x+size*.74,y+size*.47,z+.0008)],
             [(0,1,2),(0,2,3),(0,3,4),(0,4,5)],stemmat)
    return fruit,top


def plate(x,y,z,r,edge,standing=False,print_=False,tilt=67):
    # The foot ring, stepped well and colored lip have separate surface bands.
    spec=[(.34,0),(.40,.04),(.48,.07),(.89,.15),(1,.24),(.997,.274),
          (.92,.263),(.84,.218),(.69,.115),(.27,.095)]
    obj=lathe('유약 접시 · 굽과 전',[(a*r,b*r) for a,b in spec],[white,edge],[0,0,0,1,1,1,0,0,0])
    parts=[obj]
    if print_:
        for k in range(5):
            angle=tau*k/5+.4
            parts.extend(fruit_print(r*.53*cos(angle),r*.53*sin(angle),r*.123,r*.085,green,red))
    mat=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(tilt if standing else 0),4,'X')
    for part in parts:
        part.matrix_world=mat
    if standing:
        for sx in [-1,1]:
            line('나무 접시받침',[(x+sx*r*.52,y-r*.18,z-r*.90),(x+sx*r*.52,y+r*.34,z-r*.86),
                              (x+sx*r*.52,y+r*.29,z+r*.05)],.011,wood)
            line('접시 앞턱',[(x+sx*r*.52,y-r*.18,z-r*.90),(x+sx*r*.52,y-r*.16,z-r*.57)],.009,wood)


def bowl(x,y,z,r,h,outer,edge):
    rings=[(.44,0),(.49,.07),(.53,.15),(.79,.44),(.97,.84),(1,.97),(.96,1),(.88,.91),(.72,.49),(.50,.28),(.19,.23)]
    obj=lathe('겹친 도기 볼',[(a*r,b*h) for a,b in rings],[outer,edge,white],[0,0,0,0,1,1,2,2,2,2],22)
    obj.location=(x,y,z)


def mugs(x,y,z,side):
    obj=lathe('걸어 둔 머그',[(.050,0),(.064,.008),(.078,.036),(.082,.117),(.08,.127),(.074,.129),(.069,.116),(.064,.024)],
              [white,rose],[0,0,0,0,1,0,0],22)
    theta=tau
    handle=line('머그 손잡이',[(.074+.050*sin(pi*i/12),0,.072+.042*cos(pi*i/12)) for i in range(13)],.010,white)
    # Face three small berries outward on the hanging cup.
    for k in range(3):
        px=-.018+.016*k
        berry=mesh('머그 옆면의 열매',[(px+.012*cos(theta*i/10),-.080,.069+.013*sin(theta*i/10)) for i in range(10)],
                   [tuple(range(10))],red)
        berry.location=(x,y,z)
    for ob in (obj,handle):
        ob.location=(x,y,z)
        ob.rotation_euler[1]=side*.23


# Cream open cubbies under the working top and slightly raised rear shelf.
for h in [.055,.825]:
    block('크림색 진열 상판',0,0,h,3.60,.96,.068,ivory)
block('진열대 안쪽 패널',0,.447,.119,3.54,.04,.708,shadow)
for x in [-1.765,-.92,-.02,.91,1.765]:
    block('칸막이',x,0,.117,.052,.94,.714,ivory)
block('뒷 단 상판',-.03,.228,1.32,3.33,.40,.045,ivory)
for x in [-1.61,-.58,.55,1.57]:
    block('뒷 단 받침',x,.23,.895,.035,.37,.425,steel)
for x in [-1.74,1.74]:
    for y in [-.395,.39]:
        block('각형 금속 기둥',x,y,.125,.043,.043,2.37+.49*(y+.51)-.125,steel)
    line('차양의 옆 보강대',[(x,-.44,2.30),(x,.42,2.72)],.017,steel)

# Sloped printed canvas with an indigo edge and a sewn, scalloped front valance.
def roof(y):
    return 2.37+.49*(y+.51)
mesh('비스듬한 천 차양',[(-1.82,-.51,roof(-.51)),(1.82,-.51,roof(-.51)),
    (1.82,.49,roof(.49)),(-1.82,.49,roof(.49))],[(0,1,2,3)],blue)
for y,w,m in [(-.393,.110,white),(-.326,.015,navy),(-.463,.014,red)]:
    mesh('차양에 댄 직조 띠',[(-1.82,y-w/2,roof(y-w/2)+.002),(1.82,y-w/2,roof(y-w/2)+.002),
        (1.82,y+w/2,roof(y+w/2)+.002),(-1.82,y+w/2,roof(y+w/2)+.002)],[(0,1,2,3)],m)
for i in range(12):
    left=-1.82+i*3.64/12
    points=[(left+3.64/12*j/12,-.511,2.325-.064*sin(pi*j/12)**2) for j in range(13)]
    mesh('물결 모양 천 끝단',[(x,y,2.374) for x,y,z in points]+points,
         [(j,j+1,14+j,13+j) for j in range(12)],blue)
    line('물결 모양 코발트 바이어스',points,.009,navy)
# Original small stylized floral repeats on the blue canvas. Keep a single editable appliqué.
verts,faces=[],[]
for row in range(5):
    for col in range(23):
        x=-1.75+col*.157+.035*(row%2)
        y=-.24+row*.157
        for p in range(5):
            angle=tau*p/5+.3*(col%3)
            base=len(verts)
            for length,width in [(0,0),(.019,.011),(.039,0),(.019,-.011)]:
                xp=x+length*cos(angle)-width*sin(angle)
                yp=y+length*sin(angle)+width*cos(angle)
                verts.append((xp,yp,roof(yp)+.003))
            faces.append(tuple(range(base,base+4)))
mesh('직접 그린 다섯잎 꽃무늬',verts,faces,cotton)

badge_points = [(-.46,.105),(-.38,.167),(-.37,.229),(-.12,.242),(0,.266),(.12,.242),(.37,.229),
                (.38,.167),(.46,.105),(.49,.017),(.46,-.081),(.38,-.15),(.375,-.225),(.13,-.232),
                (0,-.264),(-.13,-.232),(-.375,-.225),(-.38,-.15),(-.46,-.081),(-.49,.017)]
for y,scale,m in [(-.539,1,red),(-.545,.93,navy)]:
    mesh('마르셰 프로방스 문장',[(x*scale,y,2.48+z*scale) for x,z in badge_points],
         [tuple(reversed(range(len(badge_points))))],m)
for i,m in enumerate([navy,white,red]):
    block('프랑스 삼색기',-.031+i*.032,-.551,2.626,.032,.004,.041,m)


def lettering(word,size,height,font_file):
    curve=bpy.data.curves.new(word,'FONT')
    curve.body=word
    curve.align_x='CENTER'
    curve.align_y='CENTER'
    curve.size=size
    curve.resolution_u=5
    if Path(font_file).exists():
        curve.font=bpy.data.fonts.load(font_file,check_existing=True)
    obj=bpy.data.objects.new(word,curve)
    booth.objects.link(obj)
    obj.location=(0,-.552,height)
    obj.rotation_euler[0]=pi/2
    # Vector contours in the saved file avoid external font dependencies.
    bpy.context.view_layer.update()
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    outlines=bpy.data.meshes.new_from_object(evaluated)
    result=bpy.data.objects.new('레터링 · '+word,outlines)
    booth.objects.link(result)
    result.matrix_world=obj.matrix_world.copy()
    outlines.materials.append(white)
    bpy.data.objects.remove(obj,do_unlink=True)


lettering('Marché',.178,2.534,'/System/Library/Fonts/Supplemental/Georgia Italic.ttf')
lettering('PROVENCE',.099,2.403,'/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf')

# The signature half-watermelon serving dish rests above the rear shelf.
def melon(x,y,z,r):
    # Curved silhouette with a flat diagonal top, thick glazed rind and pitched face.
    rot=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(19),4,'Y') @ Matrix.Rotation(radians(10),4,'X')
    for depth,scale,m in [(0,1,green),(-.016,.935,white),(-.028,.865,red)]:
        pts=[(r*scale*cos(pi+i*pi/32),depth,r*scale*sin(pi+i*pi/32)) for i in range(33)]
        obj=mesh('반달 수박 접시 · 색유약',pts,[tuple(range(33))],m)
        obj.matrix_world=rot
    for px,pz in [(-.63,-.22),(-.31,-.49),(-.11,-.19),(.22,-.57),(.43,-.25),(.61,-.12)]:
        obj=mesh('수박씨 전사',[(px*r+.013*cos(tau*i/9),-.031,pz*r+.023*sin(tau*i/9)) for i in range(9)],
                 [tuple(range(9))],dark)
        obj.matrix_world=rot


melon(-.83,.262,1.90,.51)
for x,r,m in [(-1.42,.194,mint),(-.29,.228,red),(.22,.193,yellow),(1.39,.183,rose)]:
    plate(x,.14,1.365+r*.91,r,m,True,True)
for x,r,m in [(1.14,.163,rose),(1.46,.152,red),(-1.44,.147,mint)]:
    plate(x,-.31,.893+r*.90,r,m,True,True)
for x,r,count,m in [(-.85,.155,6,rose),(-.52,.137,5,red),(1.51,.165,6,green)]:
    for i in range(count):
        plate(x,-.275,.893+i*.024,r,m,print_=i==count-1)
for x,y_,r,n,m,trim in [(-.22,-.33,.102,3,yellow,yellow),(.013,-.34,.103,4,yellow,yellow),
        (.26,-.35,.085,3,yellow,yellow),(.45,-.34,.085,3,red,red),(.67,-.25,.128,5,red,red),
        (-1.27,-.38,.087,3,green,red),(-1.09,-.32,.079,3,green,red)]:
    for i in range(n):
        bowl(x,y_,.893+.034*i,r,.086,m,trim)

# Hanging cream mugs on a metal tree with a foot and branching hooks.
for x in [.66,.90]:
    block('머그 걸이 발판',x,.17,.898,.145,.24,.021,steel)
    line('머그 걸이 기둥',[(x,.21,.91),(x,.21,1.96)],.014,steel)
    for i in range(3):
        z=1.43+i*.174
        line('머그 걸이의 가지',[(x,.21,z),(x+.11,.14,z+.026),(x+.13,.12,z+.049)],.009,steel)
        mugs(x+.049,.115,z-.070,(-1)**i)

# Fine rims, bases and open contours let the glasses read through one another.
for col in range(4):
    for row in range(2):
        x=-1.60+col*.118
        y=-.08+row*.12
        z=.895
        circle_line('고블릿 잔 테',x,y,z+.197,.048,.0037,glass)
        circle_line('고블릿 받침',x,y,z+.004,.041,.0033,glass)
        line('고블릿 줄기',[(x,y,z+.004),(x,y,z+.089)],.004,glass)
        for angle in [-2.6,-.75,1.4]:
            line('고블릿 반사 윤곽',[(x+rr*cos(angle),y+rr*sin(angle),z+h) for rr,h in
                 [(.007,.089),(.032,.107),(.046,.14),(.048,.197)]],.0023,glass,5)
for x,r,n,m in [(-1.34,.182,7,mint),(-.54,.145,5,rose),(.37,.198,8,yellow),(1.30,.19,6,red)]:
    for i in range(n):
        plate(x,-.126,.123+i*.027,r,m,print_=i==n-1)
# Mixed reserve stock is visible through the lower cubbies, behind the sample plates.
for bay in range(4):
    for level in range(2):
        for column in range(2):
            x=-1.32+bay*.884+(column-.5)*.282
            z=.126+level*.142
            block('예비 재고 상자',x,.227,z,.262,.284,.140,carton)
            block('접시 포장 밴드',x,.084,z+.062,.242,.002,.027,rose if bay%2 else mint)
for x in [-1.65,-.85,.11,.96]:
    mugs(x,-.26,.127,1)
for i in range(9):
    x=-1.53+(i%5)*.27
    z=.898+(i//5)*.142
    block('골판지 포장 상자',x,.18,z,.245,.225,.132,carton)
    block('상자 전면 레이블',x,.065,z+.031,.124,.002,.056,white)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=5.8
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'market.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/'provence.glb')],check=True)
