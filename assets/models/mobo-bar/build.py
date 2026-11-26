"""Editable original furniture for the garden-facing public MOBO Bar at JW Marriott Seoul."""
from pathlib import Path
from math import cos, sin, pi, tau, sqrt
from random import Random
import sys
import runpy

import bpy
from mathutils import Matrix, Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['reference']='https://www.myclubmarriott.com/hotel/restaurantdetail/en/mobo-bar'
scene['layout']='Lengths, quantities and bar layout adapted to the existing game pavilion.'
rng=Random(7214)
pigments={
    'charcoal':'303332','blackened':'46423c','blackfoot':'4c4941','iron':'525952','edge':'888a7d',
    'glass':'c8c4b0','glint':'eee3c6','amber':'dfb375','filament':'fff0c7','silver':'b8b5a7',
    'smoky':'65553e','ash':'a49178','ashdark':'897865','ashlight':'b5a28a','endgrain':'98846e',
    'plinth':'5f574b','bronzewash':'928470','washer':'ae9168','oak':'9c7353','slat':'a28a71',
    'leather':'a57453','back':'926648','piping':'6e503e','stitch':'c6a17d','turn':'8a624b',
    'amberbottle':'875223','honey':'ae7540','greenbottle':'576849','emerald':'36544b','clear':'adb2a0',
    'ruby':'845346','darkgreen':'415046','bottletoe':'685643','cap':'534a3e','foil':'a58b56',
    'label':'e1d4ba','redlabel':'aa6751','bluelabel':'688991','sage':'879582','cream':'ece5d2',
    'blacklabel':'4a4841','whitewine':'d3bf98','scoop':'b7a28b','trayclay':'bb896a','garnish':'c38744',
    'mint':'699357','woodsoil':'554b3d','leafdark':'516848','leaf':'6c8352','leaflight':'8d9d5c',
    'sprig':'819359','rosemary':'859a80','leafvein':'8c9f67','orange':'ecad56','cocktail':'e3b65d',
    'froth':'eee4c9','spice':'967153','copper':'ba8a66','napkin':'dfd7c4','shadow':'675a4b',
}
for name,val in pigments.items():
    metallic=.45 if name in ('bronzewash','washer','silver','edge','copper') else 0
    m.palette[name]=m.material(name,val,metallic)
groups={}
def group(label,key,origin):
    collection=bpy.data.collections.new('모보 바 · '+label)
    scene.collection.children.link(collection)
    collection['preview_origin']=[origin[0],-origin[1],origin[2]]
    groups[key]=collection
    m.group=collection
    return collection

block=m.block
rod=m.rod
profile=m.profile
piece=m.piece

# One long counter faces the real glazed garden side. Slats stay open so that the
# actual simulated day and night sky are visible between them.
bar=group('목재 카운터와 창 블라인드','counter',(0,0,0))
block('카운터 · 들어간 발받침',0,0,.015,9.64,.55,.13,'plinth',.012)
for n in range(9):
    x=-4.42+1.105*n
    block('카운터 · 연마한 금속 전면',x,-.06,.144,1.099,.59,.834,'bronzewash',.008)
    for strip in range(3):
        sx=x-.45+.31*strip
        block('전면 금속 · 불균일한 헤어라인',sx,-.358,.163,.004,.002,.77,'ashdark')
for k in range(6):
    d=-.44+.181*k
    block('손님 쪽 · 이어 맞춘 두꺼운 목재 상판',0,d,.981,10.13,.180,.092,['ash','ashlight','ash','ash','endgrain','ash'][k],.008)
    for n in range(3):
        x=rng.uniform(-4.2,4.2); length=rng.uniform(.43,1.52)
        pts=[(x-length/2+i*length/5,d+.025*sin(i*pi/5+k),1.074) for i in range(6)]
        rod('상판 · 가느다란 나뭇결',pts,.0015,'ashdark',4)
for x in [-5.005,5.005]:
    block('두꺼운 월넛 측판',x,.01,.015,.118,.993,.975,'endgrain',.010)
# Low under-window back bar with the trim seen behind the bottles.
block('창가 바 · 검은 가구 몸체',0,2.54,.06,10.10,.812,.85,'charcoal',.012)
block('창가 바 · 황동빛 프레임',0,2.54,.91,10.14,.86,.085,'washer',.008)
block('창가 바 · 병 진열 상판',0,2.54,.989,10.12,.84,.041,'ashlight',.008)
for j in range(10):
    x=-4.545+j*1.01
    block('창가 바 · 장문',x,2.125,.16,.997,.026,.684,'blackened',.006)
    block('창가 바 · 가로 손잡이',x,2.099,.73,.195,.029,.014,'edge',.004)
for col in range(5):
    xc=(col-2)*2.04
    for i in range(32):
        h=1.64+i*.0735
        # A tilted blade shows a warm upper face and a dark edge at eye height.
        z=h+.023
        piece('블라인드 · 각도를 준 가동 날개',
              [(xc+side*1.008,3.07+dy,z+dz) for dy,dz in [(-.033,0),(.033,.031),(.033,.037),(-.033,.006)] for side in [-1,1]],
              [(0,1,3,2),(2,3,5,4),(4,5,7,6),(6,7,1,0),(0,2,4,6),(1,7,5,3)],['slat','ashdark','ash','slat'][i%4])
    for sign in [-1,1]:
        block('블라인드 · 조절끈',xc+sign*.69,3.025,1.66,.006,.006,2.32,'blackfoot')
for i in range(6):
    x=-5.10+i*2.04
    block('외창 · 검은 세로 멀리언',x,3.105,.04,.083,.125,4.055,'charcoal',.005)
block('외창 · 창호 머리',0,3.105,4.01,10.28,.14,.105,'charcoal')
# Amber task bulbs hang from inexpensive straight projecting arms, as in the bar photograph.
for x in [-4.10,-1.37,1.37,4.10]:
    rod('전등 · 카운터 고정대',[(x,.395,1.075),(x,.395,2.202),(x,.34,2.234),(x,-.16,2.234)],.016,'blackened',9)
    rod('전등 · 짧은 전선',[(x,-.16,2.225),(x,-.16,2.105)],.006,'blackfoot',7)
    profile('전등 · 금속 소켓',x,-.16,2.064,[(.034,0),(.038,.016),(.029,.046),(.017,.052)],'washer',14)
    for side in [0,pi/2,pi,pi*1.5]:
        outline=[(.011,2.063),(.025,2.029),(.057,1.996),(.085,1.944),(.073,1.901),(.035,1.876),(.002,1.873)]
        rod('전등 · 유리 구면 하이라이트',[(x+r*cos(side),-.16+r*sin(side),h) for r,h in outline],.0027,'glint',6)
    rod('전등 · 에디슨 루프',[(x-.011,-.16,2.054),(x-.021,-.16,1.924),(x,-.16,1.903),(x+.021,-.16,1.924),(x+.011,-.16,2.054)],.003,'filament',7)

glass=group('호박빛 전구 갓','lamps',(0,-.16,1.90))
glass_mat=m.material('얇은 호박색 유리','f3d69a')
glass_mat.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value=.87
glass_mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.14
m.palette['bulbglass']=glass_mat
for x in [-4.10,-1.37,1.37,4.10]:
    profile('에디슨 전구 · 외피',x,-.16,1.870,[(.002,0),(.035,.006),(.074,.032),(.085,.071),(.074,.095),(.052,.128),(.026,.160),(.014,.188),(.012,.195)],'bulbglass',24)

# A saddle-leather chair is individually editable in Blender. Slightly sagged
# panels, wrapped edges and a centrally stitched back make it readable from the aisle.
chair=group('새들 가죽 하이체어','chair',(0,-.99,0))
cy=-.99
for side in (-1,1):
    rod('하이체어 · 뒤 다리와 등 기둥',[(side*.234,cy-.214,.017),(side*.228,cy-.204,.77),(side*.229,cy-.288,1.234)],.014,'charcoal',7)
    rod('하이체어 · 앞 다리',[(side*.234,cy+.223,.017),(side*.225,cy+.202,.77)],.014,'charcoal',7)
    rod('하이체어 · 옆쪽 가로대',[(side*.231,cy-.208,.25),(side*.231,cy+.21,.25)],.012,'charcoal',7)
    for d in [-.213,.223]:
        profile('다리 고무발',side*.234,cy+d,.006,[(.019,0),(.019,.027)],'blackfoot',8)
for d,h in [(.211,.253),(-.204,.255),(.202,.752),(-.206,.748)]:
    rod('하이체어 · 가로 발받침', [(-.23,cy+d,h),(.23,cy+d,h)],.014,'blackened',8)
def chair_surface(tangent,rows,cols,name,tone):
    vertices=[tangent(i/cols,j/rows) for j in range(rows+1) for i in range(cols+1)]
    faces=[(j*(cols+1)+i,j*(cols+1)+i+1,(j+1)*(cols+1)+i+1,(j+1)*(cols+1)+i) for j in range(rows) for i in range(cols)]
    obj=piece(name,vertices,faces,tone)
    for face in obj.data.polygons:face.use_smooth=True
    return obj
def seat_pt(w,l):
    return ((w-.5)*.483,cy-.224+.445*l,.766-.018*sin(pi*w)*sin(pi*l)+.005*(abs(w-.5)*2)**3)
def back_pt(w,l):
    return ((w-.5)*.479,cy-.207-.088*l+.022*sin(pi*w)+.007*sin(pi*l),.811+.388*l-.010*sin(pi*w)*(1-l))
chair_surface(seat_pt,5,10,'하이체어 · 살짝 처진 좌판','leather')
chair_surface(back_pt,6,12,'하이체어 · 곡면 가죽 등판','back')
for fn in [seat_pt,back_pt]:
    for w in [0,1]:
        rod('하이체어 · 접어서 감싼 가죽 단면',[fn(w,i/8) for i in range(9)],.008,'piping',7)
    for l in [0,1]:
        rod('하이체어 · 안감 말아 넣은 가장자리',[fn(i/10,l) for i in range(11)],.007,'turn',7)
for i in range(22):
    x,d,z=back_pt(.50,(i+.7)/23)
    rod('하이체어 · 중앙 손바느질',[(x-.003,d-.004,z),(x+.003,d-.004,z+.008)],.0016,'stitch',4)

# Bottle stock is mixed in height, colour, shoulder geometry and label design.
# Use linked native meshes for repeated shapes, keeping each item movable.
bottle_shapes={}
def bottle(x,d,z,variant,seed,scale=1):
    key=(variant,seed%5)
    if key not in bottle_shapes:
        radius=[.043,.049,.037,.051,.042,.039,.045][variant]
        hs=[.18,.146,.196,.132,.16,.185,.144][variant]
        rings=[(.78*radius,0),(radius,.009),(radius,.029),(radius,.060),(radius+.0009,.062),
               (radius+.0009,.127),(radius,.129),(radius,hs),(.94*radius,hs+.013),(.51*radius,hs+.034),
               (.016,hs+.053),(.015,hs+.114),(.019,hs+.115),(.019,hs+.143),(.014,hs+.147)]
        n=16 if variant!=3 else 8
        colors=['amberbottle','honey','greenbottle','clear','emerald','ruby','clear']
        obj=profile('병 · 몸통과 어깨',0,0,0,rings,colors[variant],n)
        mats=[m.palette[c] for c in ['bottletoe','label','cap',['redlabel','bluelabel','sage','blacklabel','foil'][seed%5],'glint','foil']]
        for material in mats:obj.data.materials.append(material)
        for face in obj.data.polygons:
            k,i=divmod(face.index,n)
            front=int(n*.67)<=i<int(n*.88)
            if k==0:face.material_index=1
            elif k==4 and (front or 0<=i<int(n*.30)):face.material_index=4 if i in [0,int(n*.72)] else 2
            elif k in (11,12,13):face.material_index=3 if seed%3 else 6
            elif k in (3,5) and front:face.material_index=6
            elif i==n//2 and k in [1,2,6,7,8]:face.material_index=5
            if 0<k<13 and not k in [3,5,11]:face.use_smooth=True
        bottle_shapes[key]=obj.data
        bpy.data.objects.remove(obj,do_unlink=True)
    obj=bpy.data.objects.new('창가 · 병과 인쇄 띠',bottle_shapes[key]);m.group.objects.link(obj)
    obj.location=(x,-d,z);obj.scale=(scale,scale,scale);obj.rotation_euler.z=rng.uniform(-.28,.28)

def elliptical_rim(name,x,d,z,r,color,depth=1,wire=.0018):
    rod(name,[(x+r*cos(tau*i/20),d+r*depth*sin(tau*i/20),z) for i in range(21)],wire,color,5)

def empty_glass(x,d,z,kind=0):
    if not kind:
        profile('와인잔 · 밑판과 줄기',x,d,z,[(.032,0),(.034,.003),(.016,.007),(.004,.013),(.003,.092),(.009,.098)],'glass',13)
        rings=[(.008,.098),(.027,.104),(.045,.130),(.047,.144),(.038,.207)]
    else:
        rings=[(.026,0),(.028,.007),(.035,.097),(.034,.102)]
        elliptical_rim('텀블러 · 두꺼운 바닥',x,d,z+.007,.026,'glass')
    # The clear bowl is open to its surroundings, with narrow glass reflections.
    for a in [pi*.22,pi*.78,pi*1.31,pi*1.86]:
        rod('잔 유리 · 비친 창의 가장자리',[(x+r*cos(a),d+r*sin(a),z+h) for r,h in rings],.0017,'glass',5)
    elliptical_rim('얇은 잔 입구',x,d,z+rings[-1][1],rings[-1][0],'glint')
trays=group('증류주 병과 유리잔','bottles',(0,2.54,1.03))
for tier in range(3):
    d=2.33+tier*.208
    block('병 진열 · 금속 단',0,d,1.031,2.85,.205,.041+tier*.077,'washer',.006)
    block('병 진열 · 유백 하부 조명 띠',0,d-.105,1.057+tier*.077,2.83,.005,.014,'filament')
    for i in range([11,15,15][tier]):
        x=(i-([11,15,15][tier]-1)/2)*(.225 if tier==0 else .177)+rng.uniform(-.029,.029)
        if tier==0 and i in [0,1,9,10]:
            empty_glass(x,d,1.075,0)
        else:bottle(x,d+rng.uniform(-.031,.031),1.073+tier*.077,(i+2*tier)%7,(tier*11+i)%17,rng.uniform(.84,1.13))
# A practical service vignette has copper cups, upside-down steel shaker,
# jiggers and a coupe of the pale orange cocktail in the hotel's second photo.
service=group('칵테일과 바 도구','service',(1.35,-.13,1.075))
sx,sd,h=1.35,-.13,1.076
block('칵테일 · 접은 린넨',sx+.08,sd+.01,h,.50,.28,.006,'napkin',.009)
def coupe(x,d,z):
    profile('쿠페 · 유리 받침과 줄기',x,d,z,[(.046,0),(.046,.003),(.026,.006),(.005,.013),(.004,.075),(.009,.083)],'glass',18)
    profile('쿠페 · 옅은 감귤빛 칵테일',x,d,z,[(.009,.082),(.026,.085),(.047,.100),(.059,.122),(.061,.140)],'cocktail',28)
    profile('쿠페 · 얇은 거품',x,d,z,[(.061,.139),(.061,.142),(.056,.143)],'froth',28)
    elliptical_rim('쿠페 · 얇은 둥근 입구',x,d,z+.146,.063,'glint',1,.0017)
    for i in range(7):
        a=i*2.4;r=.022*sqrt(i/7);profile('쿠페 · 향신료 가니시',x+r*cos(a),d+r*sin(a),z+.143,[(.006,0),(.008,.003),(.003,.008)],'spice',7)
coupe(sx-.045,sd,h+.008)
for j in range(2):
    x=sx+.23;d=sd+.09-j*.134
    profile('바 · 양면 지거',x,d,h+.009,[(.032,0),(.014,.039),(.013,.046),(.025,.080),(.025,.086),(.020,.084),(.012,.055)],'copper',16)
for i in range(2):
    x=sx-.40+i*.095;d=sd+.16
    profile('바 · 셰이커와 뚜껑',x,d,h,[(.034,0),(.043,.107),(.043,.125),(.031,.154),(.023,.161),(.024,.177)],'silver' if i else 'copper',17)
for i in range(3):
    x=sx+.61;d=sd+.065+i*.071
    empty_glass(x,d,h,1)
# A real tiered herb wall faces seats by the garden. Each leaf is deliberately
# shaped to show the pointed basil and rosemary against the open metal shelves.
herbs=group('철제 선반의 허브 화분','herbs',(-6.10,1.02,0))
hx,hd=-6.10,1.02
for dx in [-1.12,1.12]:
    for dd in [-.22,.22]:
        block('허브 선반 · 사각 강관',hx+dx,hd+dd,.012,.035,.037,3.32,'charcoal')
for level in range(3):
    z=.58+level*.88
    block('허브 선반 · 직사각 플랜터',hx,hd,z,2.26,.47,.226,'blackened',.015)
    block('허브 선반 · 흙',hx,hd,z+.219,2.19,.423,.012,'woodsoil')
    for i in range(46):
        x=hx+rng.uniform(-1.04,1.04);d=hd+rng.uniform(-.165,.165);h=rng.uniform(.20,.40)
        lean=rng.uniform(-.055,.055);tip=(x+lean,d+.03,z+.23+h)
        rod('허브 · 갈라지는 줄기',[(x,d,z+.23),(x+lean*.4,d,z+.23+.51*h),tip],.0038,'sprig',4)
        for j in range(11):
            frac=.13+j*.074; a=j*2.4+i*1.3
            u,v=cos(a),sin(a);base=(x+lean*frac,d+.02*frac,z+.23+h*frac)
            ln=(.114-.034*frac)*rng.uniform(.75,1.28);w=.033 if level!=1 else .014
            xx,zz,yy=base
            points=[(xx,zz,yy),(xx+.49*ln*u-w*v,zz+.49*ln*v+w*u,yy+.030),
                    (xx+.46*ln*u,zz+.46*ln*v,yy+.037),(xx+ln*u,zz+ln*v,yy+.039),
                    (xx+.49*ln*u+w*v,zz+.49*ln*v-w*u,yy+.027)]
            leaf=piece('허브 · 접힌 생잎',points,[(0,1,2),(1,3,2),(2,3,4),(0,2,4)],['leaf','leaflight','rosemary','leafdark'][(i+j+level)%4])
# Additional linked copies match the counter, enabling physical contact shadows
# at the same positions in the native source, the light bake and the game.
poses=bpy.data.collections.new('모보 바 · 촬영용 반복 배치')
scene.collection.children.link(poses)
for coll,offsets in [(chair,[-4.28,-2.89,-1.46,-.05,1.39,2.83,4.23]),(trays,[-3.20,-.07,3.08])]:
    # Use the master itself at the leftmost placement and linked copies elsewhere.
    start=offsets[0]
    for ob in coll.objects:ob.location.x+=start
    origin=list(coll['preview_origin']);origin[0]+=start;coll['preview_origin']=origin
    for x in offsets[1:]:
        ob=bpy.data.objects.new('같은 집기 · 링크',None)
        ob.instance_type='COLLECTION';ob.instance_collection=coll;ob.location.x=x-start
        poses.objects.link(ob)
# Keep the unrotated herb prototype beside the assembly; its linked copies
# run across the bar end wall, exactly as registered by the walking scene.
for obj in herbs.objects:obj.location.x-=14
herb_origin=Vector(herbs['preview_origin']);herb_origin.x-=14
herbs['preview_origin']=tuple(herb_origin)
for d in [-3.78,-1.47,.84]:
    obj=bpy.data.objects.new('정원 쪽 단부의 허브 선반',None)
    obj.instance_type='COLLECTION';obj.instance_collection=herbs;poses.objects.link(obj)
    obj.matrix_world=Matrix.Translation(Vector((-6.45,-d,0)))@Matrix.Rotation(pi/2,4,'Z')@Matrix.Translation(-herb_origin)
stone=group('석재 바닥과 접촉 그림자','stone',(.205,-8,0))
stoneA=m.material('따뜻한 회색 석재','b4ac9e');m.palette['stone']=stoneA
m.palette['joint']=m.material('회색 줄눈','8a857b')
width,depth=15.74,23.57
cx,cd=.205,-8
block('바닥 줄눈 바탕',cx,cd,.017,width,depth,.002,'joint')
for row in range(20):
    for col in range(13):
        ww=width/13;dd=depth/20
        block('버너 연마한 석회석 타일',cx-ww*6+ww*col,cd-dd*9.5+dd*row,.019,ww-.006,dd-.006,.004,'stone')
for a in bpy.context.screen.areas:
    if a.type=='VIEW_3D':
        a.spaces.active.shading.color_type='MATERIAL'
        a.spaces.active.region_3d.view_distance=16
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'mobo.blend'),compress=True)
for key,coll in groups.items():
    if key!='stone':bake_collection(coll,'Mobo'+key.title(),here/(key+'.glb'))
runpy.run_path(str(here/'floor.py'),run_name='__main__')
runpy.run_path(str(here/'panels.py'),run_name='__main__')
