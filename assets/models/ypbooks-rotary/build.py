"""Editable public threshold, based on the August 2025 Gangnam Shinsegae photo."""
from math import pi, sin, cos
from pathlib import Path
import bpy

here = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("YPBooksRotaryFront")
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
def logo(x,y,z,r):
    vs=[(x+r*cos(2*pi*i/32),y,z+r*sin(2*pi*i/32)) for i in range(32)]
    mesh('적색 원형 심벌',vs,[tuple(range(32))],'c91f38')
    for side in [-1,1]:
        vs=[(x+side*r*a,y-.002,z+r*b) for a,b in [(0,-.40),(.69,.09),(.69,.42),(0,-.08)]]
        mesh('서점 백색 심벌',vs,[(0,1,2,3)],'fffbee')
def sign(x,y,z,width):
    box('흑색 슬림 채널 바',x,y,z-.13,width,.09,.26,'24282a')
    lettering('서점다운 서점',x-width*.14,y-.055,z,width*.27,.102,'fffcea')
    logo(x+width*.035,y-.058,z,.092)
    lettering('영풍문고',x+width*.212,y-.055,z,width*.25,.156,'fffcea')
# Wall follows the court. Flat central sign projects beyond the masonry.
for row in range(10):
    for i in range(-9,10):
        a=max(-2.55,(i+(row%2)*.5)*.34);b=min(2.55,(i+1+(row%2)*.5)*.34-.012)
        if b<=a:continue
        x=(a+b)*.5
        box('회색 벽돌 가로줄',x,.05-.20*(x/2.55)**2,3.04+.139*row,b-a,.10,.122,
            ['959998','a4a6a1','929593','a6aaa7'][(i+2*row)%4])
sign(0,-.22,3.37,3.70)
box('안쪽 간판 벽',.11,1.61,2.18,3.06,.06,.85,'8f7961')
sign(.06,1.52,2.36,2.18)
for x in [-2.46,2.46]:
    box('문설주',x,.34,0,.16,.75,3.02,'88857e')
colors=['ae563d','41899b','f0cd69','a2bc83','d58988','366277','edd8b3','747787']
def cover(x,y,z,w,h,i):
    box('표지',x,y,z,w,.045,h,colors[i%len(colors)])
    box('표지 도형',x-w*.10,y-.025,z+h*.48,w*.57,.005,h*.20,colors[(i+3)%8])
    box('표지 제목선',x,y-.026,z+h*.78,w*.66,.005,.009,'f0e7cb')
# Two shop fixtures only; retain the open space between them and the rotary floor.
for col in range(3):
    x=(col-1)*.46
    box('전면 전시대 패널',x,.67,0,.453,.59,.45,'9f7345')
    for tier in range(3):
        y=.43+.16*tier;z=.45+.15*tier
        box('단차 선반',x,y+.03,z-.03,.454,.21,.05,'ba905e')
        for j in range(3):cover(x+(j-1)*.135,y,z,.115,.18+(j%2)*.04,3*col+j+2*tier)
# A freestanding cream face-out rack at the left edge sits below eye level.
# The shelves visible higher up in the photo belong to the raised reading bay.
for tier in range(4):
    x=-2.09;y=.43+.14*tier;z=.18+.27*tier
    box('좌측 신간 거치대',x,y+.04,z,.75,.25,.052,'d5c8ad')
    box('거치대 낮은 전면 턱',x,y-.085,z,.76,.018,.055,'ddd4bf')
    for j in range(4):cover(x+(j-1.5)*.173,y-.035,z+.054,.147,.23,j+tier*2)
box('좌측 이동식 서가 받침',-2.09,.67,.04,.76,.72,.12,'cec6b0')
for edge in [-2.43,-1.75]:
    box('이동식 서가 측면 받침',edge,.77,.14,.035,.17,.82,'c0ad8d')
# The photograph shows a bronze-lined soffit behind the second sign and a
# blue retail bay through the right side of the opening.
for i in range(3,9):
    box('안쪽 청동색 벽 판재',(i-4)*.305+.05,1.565,.12,.298,.032,2.10,
        ['a89073','ad9478','a69075'][i%3])
box('안쪽 캐노피 하부',.08,1.15,2.20,2.80,.75,.095,'988471')
box('캐노피 가장자리 매입등',.08,.777,2.22,2.73,.015,.037,'fff0c5')
box('우측 매장 파란 벽면',1.90,1.61,0,.85,.055,2.72,'246381')
for i in range(3):
    box('우측 진열 마감 가로줄',1.86,1.56,.36+i*.13,.63,.038,.045,'78898a')
for x in [-1.75,-.8,.8,1.72]:
    box('문 안쪽 스폿',x,.49,2.84,.095,.14,.14,'333231')
    box('스폿 발광면',x,.48,2.835,.071,.10,.009,'fff4ce')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
exec(compile((here/'export.py').read_text(),str(here/'export.py'),'exec'))
