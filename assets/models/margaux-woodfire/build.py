"""Editable dining-room view of the JW Seoul Margaux Grill hearth."""
from math import cos, exp, pi, sin, sqrt
from pathlib import Path
import random
import sys

import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(HERE))
sys.path.insert(0,str(HERE.parents[2]/'tools'))
import blender_shop_mesh as m
import surface

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
rng=random.Random(491)
def group(name):
    col=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col
brick=group('HearthMasonry')
iron=group('HearthIron')
fire=group('HearthEmbers')
palette={'brick':'81503e','mortar':'4b3b34','dark':'292a29','flat':'3e3935','back':'3a312c',
         'steel':'93948f','steelLight':'bbb9ae','brush':'777c7b','lip':'615d57','soot':'39322f',
         'char':'382d25','bark':'584234','split':'8b5b38','ash':'939087','crust':'855034',
         'bread':'a57649','flour':'bd9565','pan':'41423e','herb':'5e7345','tomato':'ab4f2e',
         'flame':'ffaa31','ember':'d45118'}
m.palette={n:m.material(n,col,.55 if n in ('steel','brush','steelLight','pan') else .10 if n=='dark' else 0)
           for n,col in palette.items()}
block=m.block;rod=m.rod;piece=m.piece
# These material patches and worn surfaces represent the public-facing image.
# No mechanical internals are drawn. The original counter is already in game.
m.group=brick
block('화덕 벽의 어두운 줄눈',0,-.911,.95,5.80,.11,1.99,'mortar')
def brick_tile(name,left,right,d,z):
    width=right-left
    # Irregular cut edges, small recessed joints and a shallow bevel are visible from the counter.
    ob=block(name,(left+right)/2,d,z,width,.105,.205,'brick',.008)
    ob.modifiers[0].segments=1
    ob['brick_tone']=rng.uniform(.66,1.21)
    return ob
for j in range(9):
    z=.976+j*.219
    start=-2.884-(.235 if j%2 else 0)
    while start<2.886:
        end=start+.466+rng.uniform(-.035,.035)
        a=max(start+.006,-2.89);b=min(end-.008,2.89)
        if b-a>.065:
            brick_tile('줄눈을 어긋나게 쌓은 내화벽돌',a,b,-.831+rng.uniform(-.009,.009),z+rng.uniform(-.003,.003))
        start=end
# Side returns frame the alcove in three dimensions; only the outer edges of
# the photographed recess are extrapolated to the existing platform.
for s in [-1,1]:
    block('화덕 옆 벽의 줄눈',s*2.927,-.38,.95,.105,1.16,1.99,'mortar')
    for j in range(9):
        start=-.91-(.22 if j%2 else 0)
        while start<.19:
            a=max(-.88,start+.006);b=min(.19,start+.446)
            if b-a>.05:
                ob=block('모서리에서 돌아간 벽돌',s*2.87,(a+b)/2,.976+j*.219,
                         .121,b-a,.204,'brick',.006)
                ob.modifiers[0].segments=1
                ob['brick_tone']=rng.uniform(.66,1.10)
            start+=.46
block('화덕 바닥의 재 받침',0,-.075,.956,5.74,1.54,.07,'soot',.018)
# Individual low-poly ash and char fragments along the ember bed.
def pebble(name,x,d,z,w,length,h,col):
    n=7;v=[]
    for level,rad in [(0,.76),(.37,1),(1,.52)]:
        for k in range(n):
            a=2*pi*k/n+.08*level;r=rad*rng.uniform(.86,1.08)
            v.append((x+w*r*cos(a),d+length*r*sin(a),z+h*level*rng.uniform(.91,1.1)))
    f=[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(2) for k in range(n)]
    f.append(tuple(range(2*n,3*n)));return piece(name,v,f,col)
for i in range(102):
    x=rng.uniform(-1.09,1.09);d=rng.uniform(-.43,.63)
    pebble('재와 숯 조각',x,d,1.021,rng.uniform(.022,.078),rng.uniform(.018,.061),rng.uniform(.013,.063),
           rng.choice(['ash','char','soot','char','crust']))

m.group=iron
# Brushed stainless hood, folded sloping front and distinctly dark underside.
for x in [-2.80,0,2.80]:
    block('레인지 후드의 천장 고정부',x,-.58,3.31,.081,.072,1.05,'brush',.005)
block('후드 아래 그림자',0,-.04,2.916,5.99,2.28,.05,'dark',.012)
def hood_panel(a,b):
    v=[(a,-1.14,2.95),(b,-1.14,2.95),(b,1.10,2.95),(a,1.10,2.95),
       (a+.18,-.96,3.59),(b-.18,-.96,3.59),(b-.18,.63,3.59),(a+.18,.63,3.59)]
    return piece('접어서 경사진 스테인리스 후드',v,[(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7),(4,5,6,7)],'brush',.006)
hood_panel(-2.99,2.99)
block('후드 앞쪽 접힌 하단',0,1.098,2.925,5.976,.046,.095,'steel',.006)
block('후드 턱 빛나는 모서리',0,1.122,2.933,5.966,.012,.014,'steelLight',.004)
for s in [-1,1]:
    for z in [1.77,2.39]:
        block('양옆 스테인리스 선반',s*1.76,-.57,z,1.89,.54,.050,'steel',.007)
        block('선반 접힌 앞날',s*1.76,-.288,z-.035,1.89,.025,.07,'steelLight',.004)
        for dx in [-.65,.65]:
            rod('선반의 짧은 받침',[(s*1.76+dx,-.79,z-.22),(s*1.76+dx,-.36,z-.026)],.018,'lip',6)
    block('양옆 낮은 그릴 프레임',s*1.41,-.032,1.205,1.08,.89,.052,'dark',.009)
    for i in range(20):
        x=s*1.41-.507+i*.053
        rod('평행한 쇠살',[(x,-.46,1.268),(x,.39,1.268)],.008,'flat',6)
# Operator photo: suspended open basket has an asymmetric curved foot and
# narrow straps on its four faces. The interior stays open around the fire.
for x in [-.64,.64]:
    for d in [-.27,.35]:
        pts=[(x,d,2.47),(x,d,1.64),(x*.96,d*.91,1.54),(x*.86,d*.78,1.42),
             (x*.69,d*.68,1.29),(x*.40,d*.57,1.21),(x*.13,d*.53,1.19)]
        rod('화로 바구니 굽은 평철',pts,.024,'dark',8)
    for h,span in [(2.46,.64),(2.18,.64),(1.92,.64),(1.67,.64),(1.48,.57),(1.32,.47)]:
        block('바구니 측면의 띠',x*span/.64,.04,h,.043,.627,.047,'dark',.004)
for h,span,dd in [(2.46,.64,.35),(2.18,.64,.35),(1.92,.64,.35),(1.67,.64,.35),(1.48,.57,.30),(1.32,.47,.24)]:
    for s in [-1,1]:
        block('화덕 바구니의 평철 띠',0,dd if s>0 else -.78*dd,h,span*2+.04,.032,.047,'dark',.004)
        block('띠의 마모된 모서리',0,(dd+.018) if s>0 else -.78*dd-.018,h+.034,span*2,.009,.009,'lip')
for x in [-.63,.63]:
    rod('짙은 바구니 걸이',[(x,.02,2.476),(x,.02,2.916)],.018,'flat',8)
# Split log ends and black bark overlap the real brick background.
for i,(a,b) in enumerate([((-.63,.24,1.29),(.48,-.10,1.54)),((-.56,-.17,1.48),(.62,.13,1.35)),
                           ((-.20,.40,1.16),(.64,-.31,1.32)),((-.44,-.21,1.31),(.22,.29,1.55))]):
    rod('불에 그을린 장작',[a,b],.091,'bark',9)
    aa,bb=Vector(a),Vector(b);axis=(bb-aa).normalized()
    rod('갈라진 나뭇결 단면',[tuple(aa-axis*.004),tuple(aa-axis*.008)],.073,'split',9)
    for k in [-.039,.018]:
        rod('장작 껍질의 골',[tuple(aa+Vector((0,k,.061))),tuple(bb+Vector((0,k,.060)))],.009,'char',5)
# Bread and stock seen on the steel ledges, represented from the dining side.
for i,(x,z) in enumerate([(-1.99,2.444),(-1.73,2.444),(-1.89,1.822),(-2.24,1.822)]):
    pebble('구운 빵',x,-.48,z,.21,.105,.115,'bread')
    for k in [-.077,0,.077]:
        rod('빵 표면의 가는 칼집',[(x+k-.03,-.515,z+.099),(x+k+.035,-.468,z+.105)],.006,'flour',5)
for x,z in [(1.47,1.825),(1.66,1.825),(1.76,1.825),(1.58,1.92)]:
    pebble('선반 위 토마토',x,-.46,z,.076,.070,.11,'tomato')
block('얕은 조리용 쟁반',1.87,-.46,2.445,.73,.36,.033,'steel',.013)
for i in range(29):
    pebble('쟁반 위 녹색 채소',1.87+rng.uniform(-.26,.26),-.46+rng.uniform(-.1,.1),2.477,
           .064,.052,rng.uniform(.060,.126),'herb')

# The red bed and separate soft edges of pale inner and orange outer tongues
# can be selected independently in the native file.
m.group=fire
for i in range(62):
    x=rng.uniform(-.69,.69);d=rng.uniform(-.25,.44)
    pebble('숯 사이의 불씨',x,d,1.03+rng.uniform(0,.032),rng.uniform(.009,.040),
           rng.uniform(.009,.034),rng.uniform(.008,.028),'ember')
def tongue(i,x,d,h,r,inner):
    verts=[];tints=[];rings=[(0,.4),(.17,1),(.41,.86),(.66,.57),(.86,.29),(1,.018)]
    lean=rng.uniform(-.17,.17);phase=rng.random()*pi*2
    for f,w in rings:
        for k in range(7):
            a=2*pi*k/7;rr=r*w*(.85+.15*cos(a*3+phase+f*3))
            verts.append((x+lean*f+.045*sin(f*8+phase)*f+rr*cos(a),
                          d+.03*sin(f*4+phase)+rr*.38*sin(a),1.22+h*f))
            tints.append((f,inner))
    faces=[(j*7+k,j*7+(k+1)%7,(j+1)*7+(k+1)%7,(j+1)*7+k) for j in range(len(rings)-1) for k in range(7)]
    ob=piece('불꽃 · 밝은 속' if inner else '불꽃 · 주황 가장자리',verts,faces,'flame')
    ob['tongue']=True;ob['core']=inner
    paint=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for i,(height,inside) in enumerate(tints):
        # Alpha falls towards the tip so the dark iron braces remain legible.
        paint.data[i].color=(1,.93-.29*height if inside else .36-.25*height,
                             .47-.23*height if inside else .012, (.97 if inside else .63)*(1-height*.85))
for i in range(12):
    x=rng.uniform(-.49,.49);d=rng.uniform(-.18,.26);h=rng.uniform(.48,1.12);r=rng.uniform(.07,.16)
    tongue(i,x,d,h,r,False);tongue(i,x,d+.012,h*.76,r*.62,True)

# Bake colour and local firelight on individual source vertices. This is the
# visible hearth only; no real point lights or room-wide lighting adjustment.
for col in [brick,iron,fire]:
    for ob in col.objects:
        mat=ob.data.materials[0]
        paint=ob.data.color_attributes.get('Tint')
        if paint is None:
            paint=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            for i,v in enumerate(ob.data.vertices):
                x,dy,z=v.co;d=-dy
                warm=exp(-1.19*sqrt(x*x+(.64*d)**2+2.4*(z-1.53)**2))
                tone=ob.get('brick_tone',1.0)
                soot=1-.65*exp(-1.25*abs(x)-1.4*abs(z-2.53)) if mat.name in ('brick','mortar') else 1
                if mat.name in ('brick','soot','ash','bark','split','dark','flat','mortar','brush','lip','steel'):
                    color=tuple(min(.94,mat.diffuse_color[j]*tone*soot+warm*k)
                                for j,k in enumerate((.190,.052,.006)))
                else:color=tuple(mat.diffuse_color[:3])
                if mat.name=='ember':color=(rng.uniform(.60,1),rng.uniform(.048,.23),.002)
                paint.data[i].color=(*color,1)
for name,mat in m.palette.items():
    tree=mat.node_tree;p=tree.nodes.get('Principled BSDF')
    attr=tree.nodes.new('ShaderNodeVertexColor');attr.layer_name='Tint'
    tree.links.new(attr.outputs['Color'],p.inputs['Base Color'])
    p.inputs['Roughness'].default_value=.89 if name in ('brick','mortar','char','ash') else .54
    if name in ('flame','ember'):
        tree.links.new(attr.outputs['Color'],p.inputs['Emission Color'])
        p.inputs['Emission Strength'].default_value=2.1
    if name=='flame':
        tree.links.new(attr.outputs['Alpha'],p.inputs['Alpha']);mat.surface_render_method='DITHERED'
surface.make(HERE/'aggregate.png',brick)
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'hearth.blend'),compress=True)
