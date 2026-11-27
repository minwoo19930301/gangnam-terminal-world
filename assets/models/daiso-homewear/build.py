"""Reconstruct the homewear rail and sloping pajama sample board."""
from pathlib import Path
from math import cos, sin, tau
import sys
import bpy
from mathutils import Vector
here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as m
from blender_display_export import bake_collection
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
title = '다이소 · 홈웨어 옷걸이와 잠옷 견본'
m.group = bpy.data.collections.new(title)
scene.collection.children.link(m.group)
for key, val in dict(steel='dddeda', hook='454849', panel='edede5', wood='b58f69', blue='aac4d7',
                     beige='cfc3ae', ink='252a35', pink='d3afb6', printgold='c7ac7b', teal='087775').items():
    m.palette[key] = m.material(key,val)
block, rod = m.block, m.rod
block('매대 받침',0,0,.02,2.42,.64,.09,'steel')
for x in (-1.15,.08,1.15):
    block('프레임 기둥',x,.12,.11,.045,.06,1.62,'steel')
block('흰 사각 행거 레일',.60,-.02,1.66,1.15,.055,.055,'steel')
block('상부 안내판',0,.18,1.84,2.39,.04,.28,'teal')
# Samples hang on a board that leans back. All fabric faces have several
# horizontal sections so both the silhouette and folds remain editable.
def panel(name, outline, color):
    return m.piece(name,outline,[tuple(range(len(outline)))],color)
def board_depth(h):
    return -.29 + (h-.2)*.265
panel('경사 견본 패널',[(x,board_depth(h),h) for x,h in [(-1.19,.18),(.01,.18),(.01,1.65),(-1.19,1.65)]],'panel')
for x in (-.90,-.32):
    block('목제 바지걸이',x,board_depth(1.48)-.024,1.48,.52,.033,.035,'wood')
    panel('잠옷의 고무 허리와 밑위',[(x+dx,board_depth(h)-.042,h) for dx,h in [(-.225,1.47),(.225,1.47),(.215,1.23),(0,1.17),(-.215,1.23)]],'blue')
    for dx in (-.18,.18):
        block('옷걸이 고정 집게',x+dx,board_depth(1.47)-.052,1.45,.036,.024,.066,'hook')
    for sign in (-1,1):
        cx=x+sign*.115
        corners=[(-.114,1.47),(.114,1.47),(.095,.36),(-.078,.36)]
        panel('연하늘 잠옷 바짓단',[(cx+dx,board_depth(h)-.041,h) for dx,h in corners],'blue')
        for row in range(5):
            h=.47+row*.20
            px=cx+(.042 if row%2 else -.02)
            for dx,dz,rad in [(0,0,.026),(-.019,.021,.011),(.019,.021,.011)]:
                panel('베어 패턴',[(px+dx+rad*cos(tau*i/10),board_depth(h+dz+rad*sin(tau*i/10))-.043,h+dz+rad*sin(tau*i/10)) for i in range(10)],'printgold')
for i in range(11):
    x=.15+i*.092
    tone=['blue']*3+['beige']*4+['ink']*3+['pink']
    rod('검정 옷걸이 후크',[(x,.027,1.65),(x,.02,1.73),(x,-.038,1.746),(x,-.064,1.705),(x,-.056,1.61)],.009,'hook')
    rod('옷걸이 어깨',[(x,-.26,1.47),(x,-.056,1.61),(x,.17,1.47)],.017,'hook')
    verts=[]
    for j,(h,spread) in enumerate([(.52,.232),(.91,.21),(1.34,.235),(1.46,.25),(1.55,.10),(1.57,.055)]):
        for k in range(10):
            angle=tau*k/10
            verts.append((x+(.029+.007*sin(3*angle+j))*cos(angle),-.043+spread*sin(angle),h+.013*cos(2*angle+j)))
    panel('접힌 반소매',[(x+.03,-.04,1.51),(x+.05,-.255,1.44),(x+.045,-.323,1.25),(x+.037,-.224,1.21),(x+.028,-.116,1.34)],tone[i])
    m.piece('옷걸이에 걸린 홈웨어 '+str(i+1),verts,[(j*10+k,j*10+(k+1)%10,(j+1)*10+(k+1)%10,(j+1)*10+k) for j in range(5) for k in range(10)],tone[i])
target=Vector((0,0,1))
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        v=area.spaces.active
        v.shading.color_type='MATERIAL'
        v.region_3d.view_location=target
        v.region_3d.view_distance=3.5
        v.region_3d.view_rotation=(target-Vector((.8,4,1.8))).to_track_quat('-Z','Y')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'homewear.blend'),compress=True)
bake_collection(m.group,'DaisoHomewear',here/'homewear.glb')
