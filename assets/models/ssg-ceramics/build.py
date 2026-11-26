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
import sys
sys.dont_write_bytecode=True
sys.path.insert(0,str(OUT))
import finishes
import craft
images=finishes.generate()
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

craft_mat=surface('옻칠·태토·목공·금속의 표면','FFFFFF','Glaze',.33)
finishes.shader(craft_mat,images)
branch=surface('꽃병 가지','665646','Fixture',.56)
mist=surface('전시 녹엽','788151','Fixture',.59)
petal=surface('옅은 꽃잎','E1D5B4','Fixture',.62)
glass=surface('매입장 유리볼','FFFFFF','ColoredGlass',.18)
glass.blend_method='BLEND';glass.show_transparent_back=False;glass.use_backface_culling=True
vc=glass.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='GlassColour'
p=glass.node_tree.nodes['Principled BSDF']
glass.node_tree.links.new(vc.outputs['Color'],p.inputs['Base Color'])
glass.node_tree.links.new(vc.outputs['Alpha'],p.inputs['Alpha'])

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

shop=craft.Shop(mesh,block,bar,craft_mat,stone,branch,mist,petal,glass)
dish,apple=shop.dish,shop.apple

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
# The full counter bridges the low return. Below it the angled cutlery
# boards stop short of the separate vase on its square pedestal.
block('중단 청동 선반틀',-.804,-.50,.58,1.306,.62,.028,bronze,.055)
block('중단 미색 선반',-.804,-.50,.608,1.261,.57,.013,cream,.049)
shop.clear_counter(-.6,-.50,.952,1.74,.62,bronze)
shop.jar(-1.13,-.526,.168,.30,1)
shop.jar(-.693,-.515,.168,.40,2)
block('화병 받침',.030,-.513,.168,.276,.286,.242,stone,.010)
shop.plant(.030,-.513,.410)
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

shop.cutlery(-1.091,-.510,.621,0)
shop.cutlery(-.520,-.510,.621,1)
# The red panel rests on the counter in the branch photograph. No offer or
# date is legible, so retain the red stock and the small dark folded base.
block('붉은 안내지 받침',-.23,-.37,.979,.167,.061,.009,ribbon,.002)
panel=block('탁상 적색 안내지',0,0,0,.159,.008,.162,red,.002)
panel.rotation_euler.x=radians(-9);panel.location=(-.23,-.372,.986)
for x in [-1.16,-.82,-.48]:
    soft_contact(x,-.023,1.1627,.083,.058)
    dish('참외',x,-.03,1.162)
for i,(x,rgb) in enumerate([(-1.16,(.23,.35,.47)),(-.82,(.81,.42,.25)),(-.48,(.39,.17,.20))]):
    soft_contact(x,-.034,1.5727,.073,.053)
    shop.bowl(x,-.034,1.572,rgb)
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
    dish('참외',a,.062,1.301)
for i,k in enumerate(['접이','선','참외']):
    a=.67+i*.48
    standing(k,a,.105,.86)
    dish(k,a,-.20,.86)
# The catalogue's lidded Mi-gak apple and four-pinched celadon share the
# customer-facing side cabinet while the central return presents cutlery.
for x in [.71,1.59]:
    apple(x,-.117,1.301)
shop.cup(1.13,-.119,1.301)
shop.cup(.813,-.182,.86)
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
