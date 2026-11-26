"""Public-facing SPORTS SHOE entrance, after the March 2024 Gangnam photo."""
from pathlib import Path
from math import sin, cos, pi
import json
import subprocess
import bpy

here = Path(__file__).resolve().parent
steps=json.loads(subprocess.check_output(
    ["node","--input-type=module","-e","import {steps} from './layout.js';console.log(JSON.stringify(steps));"],cwd=here))
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new("GangnamSportsShoeEntry")
bpy.context.scene.collection.children.link(collection)

def mesh(name,vertices,faces,color):
    m=bpy.data.meshes.new(name)
    m.from_pydata(vertices,[],faces)
    obj=bpy.data.objects.new(name,m)
    collection.objects.link(obj)
    mat=bpy.data.materials.get(color)
    if not mat:
        mat=bpy.data.materials.new(color)
        values=[int(color[i:i+2],16)/255 for i in (0,2,4)]
        mat.diffuse_color=(*[((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in values],1)
    m.materials.append(mat)
    return obj

def box(name,x,d,bottom,w,depth,h,color):
    verts=[(x+a*w/2,d+b*depth/2,bottom+c*h) for c in (0,1) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],color)

def front(name,x,d,z,w,h,color):
    return mesh(name,[(x-w/2,d,z-h/2),(x+w/2,d,z-h/2),(x+w/2,d,z+h/2),(x-w/2,d,z+h/2)],[(0,1,2,3)],color)

def capsule(name,x,d,z,w,h,color):
    radius=w/2
    coords=[(x+radius*cos(i*pi/16),d,z+h/2-radius+radius*sin(i*pi/16)) for i in range(17)]
    coords.extend((x+radius*cos(pi+i*pi/16),d,z-h/2+radius+radius*sin(pi+i*pi/16)) for i in range(17))
    return mesh(name,coords,[tuple(range(len(coords)))],color)

def text(label,x,d,z,w,h,color,font=None):
    curve=bpy.data.curves.new(label,'FONT');curve.body=label
    if font:curve.font=font
    curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=4
    obj=bpy.data.objects.new(label,curve);collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True);bpy.context.view_layer.objects.active=obj
    bpy.ops.object.convert(target='MESH')
    dims=obj.dimensions
    obj.scale=(w/max(.001,dims.x),h/max(.001,dims.y),1)
    obj.rotation_euler.x=pi/2;obj.location=(x,d,z)
    mat=bpy.data.materials.get(color)
    if not mat:
        mat=bpy.data.materials.new(color)
        mat.diffuse_color=(*[((int(color[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4)],1)
    obj.data.materials.append(mat)
    obj.select_set(False)

bold=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Bold.ttf')
italic=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf')
korean=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc')
L,R=steps['left'],steps['right']
palette=['9FA09A','A7A7A0','93958F','ACA9A1','A6A398']
def masonry(x0,x1,z0,z1):
    box('회색 벽돌 줄눈', (x0+x1)/2,.41,z0,x1-x0,.19,z1-z0,'73736D')
    for row in range(round((z1-z0)/.10)):
        z=z0+row*.10
        x=x0-(row%2)*.15
        while x<x1:
            left=max(x0,x+.006);right=min(x1,x+.29)
            if right>left:
                front('회색 긴 벽돌',(left+right)/2,.309,z+.048,right-left,min(.089,z1-z),palette[(row+round((x-x0)*8))%5])
            x+=.30
masonry(-2.67,L,0,3.01);masonry(R,2.73,0,3.01);masonry(-2.67,2.73,3.01,4.36)
box('검은 채널 간판',.45,.22,3.14,4.31,.16,.28,'232328')
for name,x,w,f in [('ABC-MART',-.99,.82,bold),('HOKA',.15,.59,bold),('Wilson',.98,.76,italic),('HDEX',1.99,.67,bold)]:
    text(name,x,.128,3.28,w,.145,'FFFFEF',f)
for z,label in [(3.326,'GRAND'),(3.228,'STAGE')]:
    text(label,-.416,.126,z,.26,.065,'FFFFEF',bold)
for x in [-.226,.54,1.506]:front('간판 구분점',x,.126,3.275,.024,.024,'FFFFEF')
capsule('진회색 안내판 테두리',-2.02,.285,1.43,1.01,1.87,'615B50')
capsule('둥근 아이보리 안내판',-2.02,.278,1.43,.97,1.83,'D8D0B9')
for label,z,w,h,f in [('SPORTS SHOE',2.03,.78,.077,bold),('스포츠 슈 전문관',1.90,.62,.064,korean),
    ('ABC-MART',1.67,.65,.078,bold),('GRAND STAGE',1.57,.40,.045,bold),('HDEX',1.36,.38,.077,bold),
    ('Wilson',1.11,.46,.09,italic),('HOKA',.84,.38,.07,bold)]:
    text(label,-2.02,.273,z,w,h,'33312D',f)
for i in range(steps['count']):
    d=steps['start']+steps['tread']*i
    z=i*steps['rise'];w=R-L
    box('계단 회색 디딤판',(L+R)/2,d+steps['tread']/2,z,w,steps['tread'],steps['rise'],'888984')
    front('흰 챌판',(L+R)/2,d-.002,z+.068,w-.025,.125,'CDCBC2')
    box('검은 논슬립',(L+R)/2,d+.026,z+steps['rise'],w,.038,.006,'373534')
    label='ABC-MART' if i%2==0 else "LET’S GET IT!!!"
    for x in [-.49,1.31]:
        text(label,x,d-.005,z+.068,.48 if i%2==0 else .66,.074,'292A29',bold)
        if i%2==0:
            text('GRAND',x+.32,d-.005,z+.088,.13,.033,'292A29',bold)
            text('STAGE',x+.32,d-.005,z+.048,.13,.033,'292A29',bold)
end=steps['start']+steps['count']*steps['tread']
level=steps['count']*steps['rise']
box('매장 입구 참',.02,(end+steps['landingEnd'])/2,level-.11,5.18,steps['landingEnd']-end,.11,'A7A397')
box('황색 점자 띠',(L+R)/2,.125,.014,R-L,.18,.018,'B38C42')
for i in range(52):
    for j in range(2):
        box('점형 돌기',L+.055+i*(R-L-.11)/51,.082+.076*j,.032,.028,.028,.009,'C39D4E')
# The cylindrical Wilson display is directly visible through the store mouth.
# Only its front row of balls and the short surrounding section are represented.
box('진열대 뒤판',-.34,3.68,level,.91,.12,1.57,'4A4741')
for col in range(3):
    for row in range(4):
        x=-.64+col*.30; z=level+.22+row*.32
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=.118,location=(x,3.54,z))
        obj=bpy.context.object
        for group in list(obj.users_collection):group.objects.unlink(obj)
        collection.objects.link(obj);obj.name='윌슨 진열구'
        mat=bpy.data.materials.get('A35B44')
        if not mat:
            mat=bpy.data.materials.new('A35B44');mat.diffuse_color=(.37,.105,.065,1)
        obj.data.materials.append(mat)
for x in [-.81,-.51,-.21,.10]:box('진열대 수직 광선',x,3.53,level,.022,.025,1.45,'FFF6D9')
text('Wilson',-.35,3.45,level+1.60,.81,.16,'D84937',italic)
# The landing opens beneath dark exposed framing. A white merchandise island
# and hanging coloured apparel flank the ball stand in the entrance photograph.
box('어두운 매장 천장',.02,2.37,4.0,5.25,2.94,.10,'35363A')
for x in [-2.35,-1.52,-.69,.14,.97,1.80,2.40]:
    box('천장의 검정 프레임',x,2.38,3.90,.047,2.90,.10,'27292C')
for d in [1.13,2.02,2.87,3.66]:
    box('천장 가로 보',.02,d,3.88,5.17,.055,.08,'2D2F2F')
for x in [-1.88,.59,2.09]:
    box('밝은 선형 등',x,2.45,3.865,.044,2.53,.026,'FFFFEF')
box('입구 안쪽 백색 진열 패널',1.57,3.79,level,1.94,.06,2.76,'EAE8E2')
box('백색 진열 섬',1.68,3.52,level,1.33,.48,.81,'E4E3DB')
box('진열 섬 상판',1.68,3.52,level+.81,1.38,.52,.058,'F1EFE9')
for x in [1.22,1.65,2.08]:
    box('운동화 밑창',x,3.48,level+.868,.26,.128,.026,'E0E0D8')
    box('신발 갑피',x-.018,3.48,level+.894,.212,.105,.052,'4F5558')
    box('신발 뒤축',x-.088,3.48,level+.937,.065,.10,.044,'B9B9AD')
box('의류 행거',1.63,3.70,level+2.36,1.72,.05,.034,'393A3A')
for i,color in enumerate(['4E6D93','A23D50','7C4D69','3E4555','544C68','578498']):
    x=1.01+i*.255; d=3.63-.026*(i%2); top=level+2.29
    pts=[(-.035,0),(-.09,-.03),(-.17,-.13),(-.12,-.19),(-.087,-.155),
         (-.095,-.49),(.095,-.49),(.087,-.155),(.12,-.19),(.17,-.13),(.09,-.03),(.035,0)]
    mesh('행거에 걸린 스포츠 상의',[(x+a,d,top+b) for a,b in pts],[tuple(range(len(pts)))],color)
box('좌측 장비 패널',-1.65,3.76,level,1.02,.08,2.78,'847B6E')
for z in [1.33,1.68,2.03,2.38]:
    box('벽면 진열 선반',-1.65,3.56,z,.90,.34,.038,'B6AC95')
# The left jamb has a narrow colour display in the photo.
box('입구 디지털 패널',L-.045,.26,.16,.10,.13,2.72,'39383A')
for i,col in enumerate(['70B2A9','A4B6BA','7E9DAB','94BFB1','ABD2CB','52A5A3']):
    front('디지털 패널 색면',L-.045,.190,.36+i*.40,.086,.40,col)
# Two warm parallel coves follow the shallow curve above the entrance.
for j in range(18):
    x=-2.64+(j+.5)*5.35/18;d=-.10+.20*(x/2.7)**2
    box('곡선 처마',x,d,4.19,5.36/18,.52,.18,'B9B4A7')
    for delta in [-.14,.07]:
        box('매입 라인 조명',x,d+delta,4.18,5.36/18,.025,.018,'FFFFEF')
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(here/'entry.blend'),compress=True)
