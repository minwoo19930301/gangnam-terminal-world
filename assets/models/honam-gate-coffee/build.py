"""Model the public Central City Starbucks entrance photographed beside Famille Gate 1."""
import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
front = bpy.data.collections.new("HonamGateCoffee")
scene.collection.children.link(front)


def finish(name, rgb, rough=.55, glow=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = m.diffuse_color
    shader.inputs["Roughness"].default_value = rough
    if glow:
        shader.inputs["Emission Color"].default_value = m.diffuse_color
        shader.inputs["Emission Strength"].default_value = glow
    return m


walnut = finish("기둥과 문선 · 호두나무", (.235,.104,.049))
veneer = finish("결 방향이 다른 목재 판", (.33,.17,.078))
stone = finish("녹색 석재 디딤판", (.048,.081,.066), .27)
nosing = finish("석재 모서리 반사", (.15,.196,.166), .34)
black = finish("무광 검정 문자판", (.023,.025,.024))
steel = finish("헤어라인 금속", (.27,.29,.27), .29)
milk = finish("정면의 흰 입체 문자", (.99,.99,.975), .37, 1.3)
green = finish("돌출등 녹색 유리", (.002,.245,.129), .26,.38)
ivory = finish("실내 반사 천장", (.70,.59,.46))
oak = finish("테이블과 픽업대", (.43,.25,.13))
espresso = finish("에스프레소 머신", (.23,.25,.24), .24)
menu = finish("칠판", (.065,.060,.051))
warm = finish("매입등과 메뉴 조명", (.98,.81,.57), .3,.85)
seat = finish("짙은 색 의자", (.10,.077,.064))


def attach(obj, name, mat):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    front.objects.link(obj)
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def box(name, x, y, z, w, d, h, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x,y,z+h*.5))
    obj = attach(bpy.context.object,name,mat)
    obj.dimensions = (w,d,h)
    return obj


def disc(name, x, y, z, r, depth, mat, angle):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=depth, location=(x,y,z))
    obj=attach(bpy.context.object,name,mat)
    obj.rotation_euler=(math.pi/2,0,angle)
    return obj


def letters(name, text, x, y, z, width, mat):
    shape=bpy.data.curves.new(name,"FONT")
    shape.body=text
    typeface=Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
    if typeface.is_file():
        shape.font=bpy.data.fonts.load(str(typeface),check_existing=True)
    shape.align_x="CENTER"
    shape.align_y="CENTER"
    shape.extrude=.006
    obj=bpy.data.objects.new(name,shape)
    front.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=math.pi/2
    shape.materials.append(mat)
    bpy.context.view_layer.update()
    scale=width/obj.dimensions.x
    obj.scale=(scale,scale,1)
    return obj


# Game +Z points out toward the bus hall. Blender +Y is the shop interior.
floor=.96
box("매장과 윗참 바닥",0,1.42,0,6.46,4.34,floor,stone)
for i in range(6):
    y=-2.33+(i+.5)*.265
    top=(i+1)*.16
    box("녹색 돌 계단 %d"%(i+1),-.39,y,0,5.62,.265,top,stone)
    box("디딤코",-.39,y-.121,top-.023,5.62,.024,.023,nosing)
# Joint lines stagger across successive honed-stone treads.
    for joint in [-2.48,-1.0,.48,1.96]:
        box("석판 줄눈",joint+(i%2)*.27,y,top+.0005,.011,.26,.002,nosing)
for x in [-3.21,2.42]:
    box("윗참 측면 마감",x,-.40,0,.045,.7,.96,nosing)
box("뒷벽",0,3.53,floor,6.46,.13,2.98,walnut)
box("실내 천장",0,1.62,3.94,6.47,4.08,.10,ivory)
for x in [-3.16,3.16]:
    box("측벽 목재",x,1.58,floor,.14,3.88,3.0,walnut)
for x in [-3.09,2.76]:
    box("입구 목재 세로 기둥",x,-.36,.02,.27 if x<0 else .91,.42,3.96,walnut)
    box("목재 음각 테두리",x,-.59,1.05,.23 if x<0 else .8,.016,2.2,veneer)
# Shallow reveals in the walnut casing flank the glazed entrance.
for x in [2.39,2.57,2.79,3.0]:
    box("호두나무 문선의 접합",x,-.598,.08,.012,.018,3.74,walnut)
for x in [.39,1.64,2.28]:
    box("창 앞 금속 난간주",x,-.68,floor,.038,.045,.91,steel)
box("창 앞 짙은 난간 손잡이",1.34,-.68,1.85,1.94,.075,.055,seat)
box("검은 간판 띠",-.23,-.47,3.1,5.87,.33,.79,black)
letters("STARBUCKS · 밝은 채널 문자","STARBUCKS",-.23,-.656,3.50,4.0,milk)
for x in [-2.98,-1.04,.35,1.69,2.3]:
    box("유리문 금속 문선",x,-.34,floor,.045,.09,2.15,steel)
box("창 하부 금속",.61,-.34,floor+.04,3.26,.13,.085,steel)
# This arm holds a round, double-sided blade, readable from along the aisle.
box("돌출등 철물",2.77,-.88,3.28,.12,.77,.12,black)
disc("양면 원형 돌출등",2.77,-1.22,3.28,.37,.14,green,math.pi/2)
logo=bpy.data.images.load(str(here/"siren.png"))
pixels=list(logo.pixels)
size=logo.size[0]
verts=[]; faces=[]
for side in [-1,1]:
    for row in range(size):
        start=None
        for col in range(size+1):
            i=4*(row*size+min(col,size-1))
            white=col<size and pixels[i]>.65 and pixels[i+3]>.70
            if white and start is None: start=col
            if not white and start is not None:
                x=2.77+side*.071; z=3.28+(row/size-.5)*.72
                a=-1.22+side*(start/size-.5)*.72; b=-1.22+side*(col/size-.5)*.72
                j=len(verts); verts.extend([(x,a,z),(x,b,z),(x,b,z+.72/size),(x,a,z+.72/size)])
                faces.append((j,j+1,j+2,j+3));start=None
mesh=bpy.data.meshes.new("사이렌 로고 · 양면 흰 유리")
mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new(mesh.name,mesh);front.objects.link(obj);mesh.materials.append(milk)
for x in [-2.10,0,1.95]:
    for y in [.25,1.95]:
        box("작은 매입 천장등",x,y,3.91,.17,.12,.03,warm)
box("주문 바",.33,2.35,floor,3.6,.75,.91,walnut)
box("밝은 픽업 상판",.33,2.35,1.87,3.72,.82,.075,oak)
for x in [-.90,.0,1.23]:
    box("메뉴 보드",x,3.42,2.34,.82,.065,.62,menu)
    for j in range(3):
        box("메뉴 행",x,3.38,2.77-j*.11,.54-j*.085,.01,.022,ivory)
box("커피 머신",1.06,2.49,1.95,.65,.35,.37,espresso)
for x in [-2.43,2.39]:
    box("카페 테이블",x,.82,1.64,.74,.61,.055,oak)
    box("테이블 다리",x,.82,floor,.085,.085,.68,steel)
    box("의자 좌판",x,1.54,1.39,.48,.42,.07,seat)
    box("의자 등받이",x,1.73,1.42,.48,.06,.39,seat)
    for dx in [-.17,.17]:
        for dy in [-.14,.14]:box("의자 다리",x+dx,1.54+dy,floor,.04,.04,.44,steel)
# The glazed bays seen from the hall have a suspended drink print and metal rails.
paper = finish("메뉴 인쇄지",(.78,.68,.57))
box("창 안 음료 포스터",-.41,-.29,1.52,.67,.035,1.01,paper)
box("포스터 속 컵",-.41,-.315,1.70,.24,.008,.31,ivory)
box("포스터 속 컵뚜껑",-.41,-.319,2.01,.28,.008,.035,walnut)
for i in range(2):
    box("포스터 설명",-.41,-.315,2.32-i*.065,.39-i*.08,.008,.021,walnut)
for x in [-.66,-.16]:
    box("포스터 걸이",x,-.29,2.53,.012,.012,.58,steel)
for x in [-.35,-.22,-.09]:
    bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.041,radius2=.057,depth=.14,location=(x,2.14,2.015))
    attach(bpy.context.object,"픽업 컵",ivory)
glass=finish("입구 투명 유리",(.68,.78,.74),.16)
glass.diffuse_color=(.68,.78,.74,.20)
shader=glass.node_tree.nodes.get("Principled BSDF")
shader.inputs["Alpha"].default_value=.2
shader.inputs["Transmission Weight"].default_value=.75
panes=[]
for a,b in [(-1.04,.35),(.35,1.69),(1.69,2.30)]:
    panes.append(box("금속 문선 사이 유리",(a+b)/2,-.34,1.06,b-a-.04,.012,2.03,glass))
# The source opens at visitor eye level; the preview rig is outside the asset collection.
def aim(obj,point):
    obj.rotation_euler=(Vector(point)-obj.location).to_track_quat("-Z","Y").to_euler()

bpy.ops.object.camera_add(location=(-3.75,-9.3,2.17))
camera=bpy.context.object
camera.name="호남선 대합실 · 보행자 카메라"
camera.data.lens=36
aim(camera,(0,0,1.98));scene.camera=camera
for position,energy,diameter,target in [
    ((-1,-5,6.8),620,5.5,(0,0,1.6)),
    ((3,-1,4.4),170,3.2,(1,1,1.5)),
    ((-1,1.45,3.85),90,2.1,(0,2,1.3))
]:
    bpy.ops.object.light_add(type="AREA",location=position)
    lamp=bpy.context.object;lamp.name="매장 프리뷰 · 확산광"
    lamp.data.energy=energy;lamp.data.shape="DISK";lamp.data.size=diameter;aim(lamp,target)
scene.world=bpy.data.worlds.new("대합실 반사광")
scene.world.color=(.26,.27,.26)
scene.render.engine="CYCLES"
scene.cycles.samples=12
scene.render.resolution_x=1000;scene.render.resolution_y=610;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="JPEG";scene.render.image_settings.quality=91
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=="VIEW_3D":
            area.spaces.active.region_3d.view_perspective="CAMERA"
bpy.context.preferences.filepaths.save_version=0
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(here/"front.blend"),compress=True)
# Three.js uses a separate transparent material on the same window coordinates.
for pane in panes:
    bpy.data.objects.remove(pane,do_unlink=True)
for obj in list(front.objects):
    if obj.type=="FONT":
        graph=bpy.context.evaluated_depsgraph_get()
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(graph))
        copy=bpy.data.objects.new(obj.name+" · 게임",mesh);front.objects.link(copy);copy.matrix_world=obj.matrix_world.copy()
bake_collection(front,"HonamGateCoffee",here/"front.glb")
