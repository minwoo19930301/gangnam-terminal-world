"""Editable OAKBERRY counter using the existing north deli cell and the shop photograph."""
import math
from pathlib import Path

import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
counter = bpy.data.collections.new("GangnamOakberryCounter")
scene.collection.children.link(counter)


def finish(name, rgb, roughness=.52, metal=0, glow=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*rgb, 1)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = mat.diffuse_color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metal
    if glow:
        bsdf.inputs["Emission Color"].default_value = mat.diffuse_color
        bsdf.inputs["Emission Strength"].default_value = glow
    return mat


def shape(name, verts, faces, material):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    mesh.materials.append(material)
    ob = bpy.data.objects.new(name, mesh)
    counter.objects.link(ob)
    return ob


def prism(name, outline, bottom, height, material):
    n = len(outline)
    faces = [tuple(reversed(range(n))), tuple(range(n, 2*n))]
    faces.extend((i, (i+1)%n, n+(i+1)%n, n+i) for i in range(n))
    return shape(name, [(x,y,z) for z in (bottom,bottom+height) for x,y in outline], faces, material)


def rectangle(x, y, width, depth):
    a, b = width/2, depth/2
    return [(x-a,y-b), (x+a,y-b), (x+a,y+b), (x-a,y+b)]


def rounded(width, depth, radius):
    # Traverse rounded corners anticlockwise, including the long front face.
    outline = []
    for x,y,start in ((1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)):
        for i in range(7):
            a = math.radians(start + 90*i/6)
            outline.append((x*(width/2-radius)+radius*math.cos(a),y*(depth/2-radius)+radius*math.sin(a)))
    return outline


def disk(x,y,r,n=24):
    return [(x+r*math.cos(2*math.pi*i/n),y+r*math.sin(2*math.pi*i/n)) for i in range(n)]


def ellipsoid(name,x,y,z,radii,material):
    rings, sides = 8, 20
    verts = [(x,y,z-radii[2])]
    for j in range(1,rings):
        b = -math.pi/2 + math.pi*j/rings
        for i in range(sides):
            a=2*math.pi*i/sides
            verts.append((x+radii[0]*math.cos(a)*math.cos(b), y+radii[1]*math.sin(a)*math.cos(b), z+radii[2]*math.sin(b)))
    verts.append((x,y,z+radii[2]))
    faces=[(0,1+(i+1)%sides,1+i) for i in range(sides)]
    for j in range(rings-2):
        for i in range(sides):
            k=1+j*sides
            faces.append((k+i,k+(i+1)%sides,k+sides+(i+1)%sides,k+sides+i))
    k=1+(rings-2)*sides
    faces.extend((k+i,k+(i+1)%sides,len(verts)-1) for i in range(sides))
    ob=shape(name,verts,faces,material)
    for face in ob.data.polygons: face.use_smooth=True


wood = finish("월넛 바탕", (.19,.092,.043))
slats = finish("월넛 세로살", (.31,.159,.076))
brass = finish("상판 황동 띠", (.57,.36,.17), .36, .5)
marble = finish("미색 석재 상판", (.78,.75,.67), .33)
purple = finish("오크베리 보라", (.159,.042,.235))
onyx = finish("로고판 · 짙은 자주", (.085,.026,.107))
cream = finish("아이보리 글자", (.88,.86,.76))
opal = finish("오팔 유리 구", (.99,.975,.89), .24, glow=1.8)
green = finish("넓은 잎", (.084,.235,.070))
fruit = finish("아사이", (.12,.033,.044))
berry = finish("베리·바나나 토핑", (.55,.16,.14))
paper = finish("인쇄 메뉴지", (.80,.77,.69))
ink = finish("메뉴 글줄", (.15,.10,.14))
cup = finish("종이컵 상단 링", (.70,.68,.59))

prism("받침",rounded(4.60,.80,.17),.015,.08,brass)
prism("둥근 월넛 하부장",rounded(4.70,.87,.18),.095,.79,wood)
for i in range(78):
    x=-2.12+i*.055
    prism("전면 세로살",rectangle(x,-.441,.029,.014),.103,.754,slats)
for side in (-1,1):
    for j in range(10):
        prism("끝면 세로살",rectangle(side*2.355,(j-4.5)*.047,.014,.025),.103,.754,slats)
prism("상판 밑 따뜻한 띠",rounded(4.76,.93,.19),.869,.028,brass)
prism("곡면 모서리 석재 상판",rounded(4.80,.95,.19),.897,.063,marble)
prism("보라색 전면 간판",rectangle(.09,-.465,1.99,.024),.27,.51,onyx)
prism("간판 아래 석재 선반",rectangle(.09,-.47,2.06,.080),.237,.037,marble)

letters = bpy.data.curves.new("볼록 문자 원본", "FONT")
letters.body="OAKBERRY AÇAÍ"; letters.align_x="CENTER";letters.align_y="CENTER";letters.size=.187;letters.extrude=.0017;letters.bevel_depth=.0007
letters.materials.append(cream)
text=bpy.data.objects.new("OAKBERRY AÇAÍ · 양각 글자",letters)
counter.objects.link(text);text.location=(.09,-.482,.553);text.rotation_euler.x=math.pi/2

for i,x in enumerate((-2.02,-1.07,1.12,2.01)):
    y=.05 if i in (1,2) else .12
    prism("보라색 조명 기둥",disk(x,y,.070),.96,.36,purple)
    prism("오팔 받침 금속 링",disk(x,y,.077),1.30,.026,brass)
    ellipsoid("흰 유리 조명",x,y,1.405,(.106,.106,.108),opal)
for i,x in enumerate((-.73,-.49,-.25)):
    prism("아사이 컵",disk(x,-.06,.062),.96,.106,purple)
    prism("종이컵 링",disk(x,-.06,.066),1.062,.012,cup)
    prism("아사이 과육",disk(x,-.06,.058),1.074,.006,fruit)
    for j in range(3):
        a=j*2.094+i*.4
        ellipsoid("과일 토핑",x+.031*math.cos(a),-.06+.031*math.sin(a),1.082,(.017,.016,.013),berry if j==0 else cream)
for x in (.31,.55,.80):
    prism("안내 카드 받침",rectangle(x,.015,.20,.11),.96,.012,purple)
    prism("상품 안내 면",rectangle(x,.04,.187,.012),.972,.247,paper)
    for r in range(5):
        prism("인쇄된 메뉴 줄",rectangle(x-.014,.030,.121-r*.009,.004),1.171-r*.028,.007,ink)
for x in (-1.58,1.56):
    prism("식물 받침",disk(x,.12,.103),.96,.135,brass)
    for i in range(11):
        a=i*2.399;r=.12+(i%3)*.035
        bx,by=x+r*math.cos(a),.12+r*math.sin(a)
        mid=(x+.6*(bx-x),.12+.6*(by-.12),1.31+(i%3)*.023)
        w=.059
        shape("열대 식물 잎",[(x,.12,1.085),(mid[0]-w*math.sin(a),mid[1]+w*math.cos(a),mid[2]),(bx,by,1.26+(i%4)*.036),(mid[0]+w*math.sin(a),mid[1]-w*math.cos(a),mid[2]),(mid[0],mid[1],mid[2]+.016)],[(0,4,1),(1,4,2),(2,4,3),(3,4,0)],green)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/"counter.blend"),compress=True)
