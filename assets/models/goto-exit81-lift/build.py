"""Street glass, stone plinth and the public passenger cabin finish."""
from pathlib import Path
import sys
import bpy

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as shop
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='고투몰 8-1 · 보도 승강기'
scene.unit_settings.system='METRIC'
root=bpy.data.collections.new('GotoExit81Lift')
scene.collection.children.link(root)
opaque=bpy.data.collections.new('8-1 · 금속과 실내 마감')
glass=bpy.data.collections.new('8-1 · 외부 유리')
root.children.link(opaque)
root.children.link(glass)
shop.group=opaque
shop.palette={k:shop.material(k,v,metal) for k,v,metal in [
    ('석재','A69C92',0),('줄눈','796F68',0),('금속','A6A8A0',.48),
    ('밝은 모서리','C5C5B9',.45),('고무','414944',.02),('내부','BEC3BA',.25),
    ('내부 하단','91998D',.32),('확산판','FFF3CC',0),('버튼','D8D8C6',.50),
    ('표시','D5B775',.04),('유리','B6CEC3',0)]}
block=shop.block

def sides(label,half,lo,hi,thick,mat,front=True):
    for x in [-half,half]:
        block(label,x,0,lo,thick,2*half,hi-lo,mat)
    block(label,0,-half,lo,2*half+thick,thick,hi-lo,mat)
    if front:
        for x in [-1,1]:
            width=half-.65
            block(label,x*(half-width/2),half,lo,width,thick,hi-lo,mat)

# Low stone strips and silver glazing caps visible behind the bus shelter.
sides('보도측 석재 받침',1.25,.005,.40,.065,'석재')
for n in [-1,1]:
    for d in [-.62,.62]:
        block('측면 석재 줄눈',n*1.286,d,.015,.003,.012,.373,'줄눈')
    block('뒤쪽 석재 줄눈',n*.65,-1.285,.015,.012,.003,.373,'줄눈')
for x in [-1.24,1.24]:
    for d in [-1.24,1.24]:
        block('외곽 알루미늄 모서리',x,d,.38,.088,.088,3.57,'금속',.008)
for y in [.39,2.22,3.89]:
    for d in [-1.25,1.25]:
        if y>.40 or d<0:
            block('가로 유리 캡',0,d,y,2.54,.079,.069,'금속',.006)
    for x in [-1.25,1.25]:
        block('측면 유리 캡',x,0,y,.079,2.54,.069,'금속',.006)
for x,d,w,depth in [(0,-1.25,.049,.071),(-1.25,0,.071,.049),(1.25,0,.071,.049)]:
    block('중앙 세로 유리 캡',x,d,.40,w,depth,3.52,'밝은 모서리',.003)
block('상부 지붕 판금',0,0,3.945,2.60,2.60,.055,'금속',.013)
for x in [-1.19,0,1.19]:
    block('상부 수평 부재',x,0,3.77,.075,2.38,.105,'내부')
for x in [-.67,.67]:
    block('문틀',x,1.248,.005,.073,.095,2.22,'밝은 모서리',.008)
block('문 상인방',0,1.24,2.18,1.41,.15,.12,'금속',.007)
for x in [-.015,.015]:
    block('닫힘선 마감',x,1.245,.03,.016,.044,2.14,'고무')
# Passenger cabin. Leave the doorway and approach at the existing walkable level.
for z in [0,.028]:
    block('문턱 홈',0,1.215+z,.009,1.29,.012,.007,'고무')
block('승객실 미끄럼방지 바닥',0,0,.012,2.08,2.10,.018,'내부 하단')
for x in [-1.04,1.04]:
    for d in [-1.02,1.02]:
        block('승객실 기둥',x,d,.032,.074,.075,2.24,'내부',.006)
sides('승객실 하부 보호판',1.035,.032,.70,.026,'내부 하단',False)
sides('승객실 보호판 상단',1.035,.69,.735,.04,'밝은 모서리',False)
for x in [-1,1]:
    shop.rod('측면 손잡이',[(x*.995,-.84,.94),(x*.960,-.84,.94),
             (x*.960,.78,.94),(x*.995,.78,.94)],.023,'밝은 모서리',12)
shop.rod('후면 손잡이',[(-.83,-.995,.94),(-.83,-.955,.94),(.83,-.955,.94),(.83,-.995,.94)],.023,'밝은 모서리',12)
block('승객실 상부 테두리',0,0,2.25,2.16,2.16,.12,'금속',.014)
block('천장 매입판',0,0,2.234,1.97,1.96,.027,'내부',.006)
for x in [-.70,.70]:
    block('천장 간접 확산등',x,0,2.225,.17,1.62,.018,'확산판',.008)
for side in [-1,1]:
    block('측벽 상단 띠',side*1.038,0,2.05,.042,2.07,.17,'내부',.004)
block('후벽 상단 띠',0,-1.038,2.05,2.07,.042,.17,'내부',.004)
block('호출판 베젤',.91,1.286,.92,.19,.042,.42,'금속',.009)
block('호출판 어두운 면',.91,1.313,.95,.14,.012,.35,'고무',.004)
block('누름버튼',.91,1.329,1.012,.080,.024,.080,'버튼',.008)
for a,b in [(-.022,0),(0,.022)]:
    shop.rod('내려감 표시',[(.91+a,1.345,1.046+abs(a)*.7),(.91+b,1.345,1.046+abs(b)*.7)],.005,'고무')
shop.group=glass
shader=shop.palette['유리'].node_tree.nodes.get('Principled BSDF')
shader.inputs['Transmission Weight'].default_value=.82
shader.inputs['Roughness'].default_value=.14
shader.inputs['Alpha'].default_value=.29
for x in [-1.25,1.25]:block('측면 녹색 유리',x,0,.40,.014,2.46,3.50,'유리')
block('뒤쪽 녹색 유리',0,-1.25,.40,2.46,.014,3.50,'유리')
for x in [-.96,.96]:block('현관 고정 유리',x,1.25,.4,.59,.014,3.50,'유리')
block('현관 위 유리',0,1.25,2.30,1.28,.014,1.60,'유리')
for x in [-.324,.324]:block('현관 유리문',x,1.25,.025,.63,.014,2.14,'유리')
em=shop.palette['확산판'].node_tree.nodes.get('Principled BSDF')
em.inputs['Emission Color'].default_value=(1,.88,.72,1)
em.inputs['Emission Strength'].default_value=2
lamp=bpy.data.lights.new('승객실 천장 반사광','AREA')
lamp.energy=24
lamp.shape='RECTANGLE'
lamp.size=1.45
lamp.size_y=1.45
lamp.color=(1,.92,.80)
light=bpy.data.objects.new(lamp.name,lamp);light.location=(0,0,2.20);root.objects.link(light)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'lift.blend'),compress=True)
