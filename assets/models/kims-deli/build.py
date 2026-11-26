"""Build the public deli fixtures and individually editable ingredients in original Blender geometry."""
from math import sin,cos,pi,tau
from pathlib import Path
from random import Random
import runpy
import sys

import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['branch']='뉴코아 강남점 2관 B1 킴스클럽 · 델리 by 애슐리'
scene['reference']='https://www.eland.co.kr/news/viewNews?cate=P&cateIdx=573'
scene['product_reference']='https://aria2890.tistory.com/entry/kimsclub-gangnam-express-bus-terminal'
groups={}
rng=Random(731)

def group(label,key,origin):
    coll=bpy.data.collections.new('킴스클럽 델리 · '+label);scene.collection.children.link(coll)
    coll['preview_origin']=(origin[0],-origin[1],origin[2]);m.group=coll;groups[key]=coll
    return coll

def mat(key,code,rough=.55,metal=0):
    if key in m.palette:return m.palette[key]
    new=m.material(key,code,metal);new.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=rough
    m.palette[key]=new;return new

for name,code,rough,metal in [('oak','9c7856',.55,0),('heartwood','85674d',.62,0),('grainwood','ac8969',.56,0),
    ('litewood','c29c71',.48,0),('shadow','4e483e',.66,0),('ebony','3c3d36',.45,.05),('joint','594c3f',.62,0),
    ('black','282b2a',.36,.14),('white','f2eedc',.55,0),('frame','bda482',.50,.25),('crew','878781',.4,.45),
    ('milk','f2ebcd',.44,0),('inner','adb0a3',.35,.37),('grate','747970',.43,.38),('warm','edd9a6',.36,0),
    ('tile','ddd9c9',.68,0),('reveal','aba28e',.55,0)]:mat(name,code,rough,metal)

mesh=m.piece;block=m.block;profile=m.profile;rod=m.rod
fonts={}
for key,path in {
    'ko':'/System/Library/Fonts/AppleSDGothicNeo.ttc','serif':'/System/Library/Fonts/Supplemental/Georgia Bold.ttf',
    'display':'/System/Library/Fonts/Supplemental/Didot.ttc','sans':'/System/Library/Fonts/Supplemental/Arial.ttf',
}.items():
    if Path(path).exists():fonts[key]=bpy.data.fonts.load(path,check_existing=True)

def text(label,x,d,z,height,tint,horizontal=False,style='sans'):
    data=bpy.data.curves.new('입체 글자','FONT');data.body=label;data.align_x='CENTER';data.align_y='CENTER'
    data.size=height;data.extrude=min(.0012,height*.015);data.resolution_u=4
    if style in fonts:data.font=fonts[style]
    ob=bpy.data.objects.new(label,data);m.group.objects.link(ob)
    ob.location=(x,-d,z)
    # Vertical displays face the public aisle at local -d.
    if not horizontal:ob.rotation_euler=(pi/2,0,pi)
    bpy.context.view_layer.update()
    baked=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    dest=bpy.data.objects.new('글자 · '+label,baked);m.group.objects.link(dest);dest.matrix_world=ob.matrix_world.copy()
    baked.materials.append(m.palette[tint]);bpy.data.objects.remove(ob,do_unlink=True)
    return dest

def ellipse(name,x,d,z,rx,rd,h,tone,n=14):
    rings=[(.13,-1),(.71,-.67),(1,-.12),(.98,.19),(.67,.74),(.15,1)]
    pts=[(x+rx*r*cos(tau*i/n),d+rd*r*sin(tau*i/n),z+h*hh) for r,hh in rings for i in range(n)]
    fs=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
    fs.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
    obj=mesh(name,pts,fs,tone)
    for face in obj.data.polygons:face.use_smooth=True
    return obj

def rounded(name,x,d,z,w,depth,height,tone,r=.003):
    return block(name,x,d,z,w,depth,height,tone,r)

products=runpy.run_path(str(here/'products.py'))['make_products']((group,mat,mesh,block,profile,rod,text,ellipse,rounded))
# The wooden islands have black recessed plinths, a raised tray and simple
# dark rails, as seen in the 2026 restaurant-side photograph.
island=group('나무 포장식품 매대','island',(0,1.8,0))
D=1.8
block('섬 매대 · 검은 안쪽 걸레받이',0,D,.028,2.49,.97,.097,'black',.018)
for i in range(9):
    x=-1.25+i*.312
    block('하부장 · 무늬목 세로 패널',x,D,.123,.309,1.13,.668,['oak','heartwood','oak','grainwood'][i%4],.0035)
    for j in range(3):
        a=x-.10+j*.082;r=rng.uniform(.07,.32)
        rod('하부 목재 · 결',[ (a,D-.566,.17),(a+.002,D-.566,.19+r),(a-.001,D-.566,.39+r)],.0009,'heartwood',4)
block('섬 매대 · 모서리까지 감싼 상판',0,D,.787,2.90,1.265,.071,'grainwood',.012)
block('섬 매대 · 얇은 상판 끝면',0,D-.631,.802,2.88,.019,.042,'litewood',.004)
for sign in [-1,1]:
    xx=sign*1.385
    for dz in [-.53,.53]:block('운반대 · 레일 받침',xx,D+dz,.857,.026,.026,.056,'black')
    rod('상판 · 낮은 안전레일',[(xx,D-.53,.910),(xx,D+.53,.910)],.012,'ebony',10)
block('후면 단상 · 하부 목재',0,D+.38,.853,2.82,.42,.204,'heartwood',.008)
block('후면 단상 · 제품 받침',0,D+.38,1.057,2.86,.45,.037,'litewood',.007)
for x in [-1.30,0,1.30]:
    block('종이 메뉴 보드 · 발',x,D+.43,1.091,.14,.086,.015,'crew',.004)
    block('종이 메뉴 보드 · 끼우는 금속판',x,D+.43,1.106,.016,.014,.123,'crew')
    block('작은 제품 안내판',x,D+.43,1.225,.226,.012,.143,'milk',.003)
    text('DELI',x,D+.421,1.316,.041,'black',style='serif')
    text('by ASHLEY',x,D+.421,1.271,.024,'black')
# Original cartouche. Text is separate geometry in the source and remains
# readable from the main aisle, with the fridge below it on the same fixture.
wall=group('후레시 스시 벽장과 간판','wall',(0,4.1,0))
D=4.1
block('냉장 쇼케이스 · 하부장',0,D,.045,8.38,.86,.68,'oak',.018)
block('쇼케이스 · 낮은 검은 발판',0,D,.002,8.23,.70,.110,'shadow')
block('진열장 · 은백색 뒤판',0,D+.39,.64,8.34,.056,1.032,'milk',.008)
for level in [.79,1.035,1.285,1.525]:
    for i in range(44):
        x=(i-21.5)*.186
        block('뒤판 · 얇은 냉기구',x,D+.359,level,.127,.004,.009,'grate')
for sign in [-1,1]:
    block('냉장고 · 측면 단열 패널',sign*4.159,D+.034,.683,.076,.77,1.027,'frame',.008)
    block('측판 · 안쪽 반사판',sign*4.115,D+.03,.702,.011,.73,.921,'inner')

for i in range(4):
    x=(i-1.5)*2.06
    for k in range(3):
        level=.70+k*.242
        block('냉장 매대 · 열을 나누는 얕은 선반',x,D+.038+k*.060,level,2.03,.69-k*.095,.035,'inner',.006)
        block('냉장 매대 · 가격띠 레일',x,D-.307+k*.108,level+.018,2.03,.035,.069,'frame',.002)
        for j in range(6):
            xx=x+(j-2.5)*.319
            block('냉장 매대 · 작은 흰 표찰',xx,D-.329+k*.108,level+.021,.126,.006,.040,'white',.001)
    block('냉장등 · 밝은 선형 램프',x,D-.282,1.594,2.04,.038,.032,'warm')
    block('냉장용 유리문 · 가로 손잡이',x,D-.34,.693,2.04,.023,.03,'crew')
for x in [-4.14,-2.07,0,2.07,4.14]:
    block('냉장 매대 · 구획 기둥',x,D+.36,.575,.035,.080,1.081,'inner')
block('매대 위 간접조명 챙',0,D+.009,1.639,8.41,.90,.098,'frame',.012)
block('상부 진열벽 바탕',0,D+.262,1.732,8.42,.17,1.52,'tile')
for i in range(3):
    x=(i-1)*2.76
    block('나무 간판 · 프레임',x,D+.112,1.866,2.66,.114,1.25,'heartwood',.012)
    for j in range(6):
        block('프레임 안의 목재 판',x,D+.051,1.913+j*.193,2.565,.017,.190,['oak','grainwood','oak'][j%3])
    for side in [-1,1]:
        block('간판 · 상아색 세로 선',x+side*1.246,D+.034,1.925,.020,.010,1.125,'milk')
        block('간판 · 상아색 가로 선',x,D+.034,2.489+side*.557,2.51,.010,.018,'milk')
    if i!=1:
        text('FRESH SUSHI',x,D+.021,2.555,.328,'white',style='display')
        text('Ashley Fresh · Delicious' if i==0 else "Let's eat SUSHI & ROLL",x,D+.020,2.30,.102,'milk',style='serif')
    else:
        # Side points, dipped shoulders and flat central crown follow the
        # branch's black-and-ivory DELI sign. The geometry is authored here.
        outline=[(-1,0),(-.91,.066),(-.84,.115),(-.79,.201),(-.74,.302),(-.69,.347),
                 (-.57,.365),(.57,.365),(.69,.347),(.74,.302),(.79,.201),(.84,.115),(.91,.066),(1,0),
                 (.90,-.057),(.84,-.09),(.79,-.141),(-.79,-.141),(-.84,-.09),(-.90,-.057)]
        for scale,dep,tone in [(1,.025,'black'),(.947,.016,'white')]:
            pts=[(x+a*scale,D+dep,2.54+b*scale) for a,b in outline]
            mesh('DELI · 방패 모양 명판',pts,[tuple(range(len(pts)))],tone)
        block('DELI · 하단 바탕',x,D+.020,2.157,1.563,.037,.270,'black',.035)
        text('DELI',x,D+.010,2.659,.633,'black',style='serif')
        text('by ASHLEY',x,D-.002,2.310,.206,'white',style='serif')
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        a.spaces.active.shading.color_type='MATERIAL'
        a.spaces.active.region_3d.view_distance=9
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'deli.blend'),compress=True)
for key in ['island','wall']:bake_collection(groups[key],'Deli'+key.title(),here/(key+'.glb'))
runpy.run_path(str(here/'bake-food.py'),run_name='__main__')
