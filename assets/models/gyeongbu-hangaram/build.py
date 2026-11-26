"""HanGaram Banpo framing workshop, photographed public retail display."""
from math import cos,pi,sin,sqrt
from pathlib import Path
from random import Random
import json
import runpy
import sys
import bpy

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene['public_source']='Hangaram Banpo official branch photo, Writelab firsthand visit 2022, photographs 4–6. Hand-modelled for the existing game.'
scene['interpretation']='Shop module registration, display assignment, dimensions, frame count, moulding profiles and original sample pictures are inferred.'
def collection(name):
    c=bpy.data.collections.new(name);scene.collection.children.link(c);return c
room=collection('한가람 반포 · 액자 코너');fine=collection('근접 · 몰딩 새김과 그림');m.group=room
rng=Random(194777)
tones={'벽':'f3f1e6','상아':'e6e1cc','매트':'f5f0d8','꽃무늬':'d7d5bf','미색':'ddd8c9','철':'898d8f','검정':'262727',
       '그늘':'4c4c4a','빈지':'c4bda2','자주':'733041','깊은자주':'542331','주홍':'db4e67','귤':'ef961b','연두':'a2b82c',
       '노랑':'efc343','참나무':'bd8e58','나뭇결':'926b45','호두':'69503e','짙은결':'42352f','체리':'93613f','메이플':'dea964',
       '청동':'9e804a','황동':'d9b36a','금박':'eac889','금빛':'f4d89a','실버':'b3b4aa','은빛':'d7d8cf','무광백':'f2f1e6',
       '포장':'c5d3d4','반사':'f0eee6','모서리':'899fa5','박스':'bca689','마루':'d7d4bd','아트지':'e4dcca',
       '지평':'acb3a3','숲':'5f756b','풀':'8e9a6d','안개':'b0c3bc','강':'92abb0','서늘':'98adbb','새벽':'d1b87d','노을':'cb986d',
       '벽돌':'a8705b','회청':'718b98','밤청':'46576b','녹청':'648478','꽃분홍':'b47488','종이':'f3ede1'}
for n,h in tones.items():m.palette[n]=m.material(n,h)
block=m.block;piece=m.piece;rod=m.rod;profile=m.profile
def face(name,points,mat):return piece(name,points,[tuple(range(len(points)))],mat)
def ellipse(name,x,d,z,a,b,c,mat,n=18):
    return face(name,[(x+a*cos(k*2*pi/n)-c*sin(k*2*pi/n),d,z+b*sin(k*2*pi/n)) for k in range(n)],mat)
def front(name,x,d,z,w,h,color):
    return face(name,[(x-w/2,d,z-h/2),(x+w/2,d,z-h/2),(x+w/2,d,z+h/2),(x-w/2,d,z+h/2)],color)
def bump(name,x,d,z,s,mat):
    p=[(x-s,d,z),(x,d,z+s*.68),(x+s,d,z),(x,d,z-s*.68),(x,d+s*.53,z)]
    return piece(name,p,[(j,(j+1)%4,4) for j in range(4)],mat)
# Sectioned moulding, with gilt ridges, ogee recesses, fillets, scoops and stepped square beads.
profiles=[
    [(-.50,0),(-.48,.24),(-.39,.25),(-.31,.10),(-.21,.06),(-.13,.11),(.03,.40),(.20,.53),(.34,.45),(.43,.30),(.49,.39),(.50,.40)],
    [(-.50,.0),(-.49,.27),(-.39,.27),(-.39,.17),(-.31,.17),(-.27,.33),(-.20,.33),(-.16,.14),(.22,.08),(.34,.24),(.41,.34),(.49,.34)],
    [(-.50,.04),(-.46,.30),(-.37,.38),(-.28,.31),(-.14,.14),(.09,.08),(.24,.12),(.39,.28),(.47,.31),(.50,.23)],
    [(-.50,.0),(-.48,.28),(-.39,.28),(-.36,.16),(.26,.14),(.32,.23),(.39,.23),(.41,.33),(.48,.33),(.50,.13)],
]
schemes=[('청동','금박','금빛'),('호두','나뭇결','메이플'),('그늘','실버','은빛'),('상아','무광백','반사'),
         ('검정','그늘','실버'),('체리','참나무','황동'),('실버','은빛','무광백'),('황동','금빛','반사')]
def moulding(name,points,normals,profile_no,width,d,dark,base,highlight,closed=False):
    section=profiles[profile_no%len(profiles)];n=len(points);rows=[]
    for offset,height in section:
        rows.append([(x+nx*width*offset,d+width*height,z+nz*width*offset) for (x,z),(nx,nz) in zip(points,normals)])
    count=n if closed else n-1
    for i,(lower,upper) in enumerate(zip(rows,rows[1:])):
        delta=section[i+1][1]-section[i][1]
        mat=highlight if delta>.13 else dark if delta<-.12 else base
        piece(name,lower+upper,[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(count)],mat)
    if not closed:
        for j in [0,n-1]:face('단면 · 잘라낸 목재',[(r[j][0],d-.002,r[j][2]) for r in (rows[0],rows[-1])]+[r[j] for r in reversed(rows)],dark)
def chevron(x,d,z,w,drop,band,scheme,prof,index):
    length=sqrt(w*w+drop*drop);nx=drop/length;nz=w/length
    points=[(x-w,z-drop),(x,z),(x+w,z-drop)]
    moulding('V형 맞춤 견본 · 절곡 프로필',points,[(-nx,nz),(0,1/nz),(nx,nz)],prof,band,d,*scheme)
    save=m.group;m.group=fine
    if index%3==0:
        for side in [-1,1]:
            for k in range(1,14):
                f=k/14;bump('연주 무늬 · 작은 둥근 알',x+side*w*f,d+band*.47,z-drop*f,.010 if band>.07 else .007,scheme[2])
    elif index%3==1:
        for side in [-1,1]:
            for k in range(1,9):
                f=k/9;xx=x+side*w*f;zz=z-drop*f
                face('금박 몰딩 · 새겨진 잎사귀',[(xx-.020,d+band*.49,zz-.009),(xx,d+band*.49,zz+.009),
                      (xx+.018,d+band*.49,zz+.012),(xx+.003,d+band*.49,zz-.004)],scheme[2])
    else:
        for side in [-1,1]:
            for cut in [-.009,.009]:
                pts=[(x+side*w*i/7,d+band*.40,z-drop*i/7+cut+.0019*sin(i*2+index)) for i in range(1,7)]
                rod('원목 몰딩 · 가는 나뭇결',pts,.0018,scheme[0],4)
    m.group=save

# Public glass storefront and freestanding oak easels are shown in the Banpo shop photographs.
block('맞춤액자 코너 · 뒷벽',0,-5.00,.01,6.32,.10,2.73,'벽')
for x in [-3.13,3.14]:
    block('코너 · 밝은 측면 벽',x,-2.50,.01,.075,4.85,2.73,'벽')
block('상단 · 자줏빛 외장 보드',0,-.04,2.22,6.39,.12,.56,'자주')
block('상단 · 짙은 아래 띠',0,-.03,2.212,6.42,.14,.034,'깊은자주')
for x in [-3.12,-1.36,.38,3.12]:
    block('쇼윈도 · 참나무 문틀',x,-.04,.011,.073,.15,2.38,'참나무')
    block('문틀 · 결을 따라 새긴 홈',x+.015,.037,.054,.009,.006,2.24,'나뭇결')
for x,w in [(-2.24,1.68),(1.74,2.63)]:
    block('쇼윈도 · 밑틀',x,-.035,.013,w,.151,.092,'참나무')
    block('쇼윈도 · 천장 조명 홈',x,-.05,2.30,w,.173,.035,'참나무')
# Five sample chains on pale floral boards, each with its own spacing and finish.
for j,(x,count,bottom,top,w) in enumerate([(-2.72,9,.40,2.13,.305),(-1.96,9,.39,2.14,.339),(.80,8,.59,2.12,.335),(1.64,9,.50,2.12,.351),(2.51,9,.48,2.13,.349)]):
    d=-.34-(j%2)*.05
    block('맞춤액자 · 견본 보드',x,d-.076,.115,w*2+.12,.095,2.15,'상아')
    block('맞춤액자 · 측면 목재 마감',x-w-.051,d-.013,.13,.019,.017,2.12,'참나무')
    for row in range(9):
        for col in range(3):
            ax=x+(col-1)*w*.77+.024*(row%2);z=.24+.231*row
            ellipse('견본판 · 옅은 나뭇잎 무늬',ax,d-.023,z+.033,.016,.031,.011,'꽃무늬',8)
            ellipse('견본판 · 잎 두 장',ax+.015,d-.022,z,.015,.021,-.009,'꽃무늬',8)
    for k in range(count):
        peak=bottom+.097+k*(top-bottom)/(count-1)
        chevron(x,d+.025,peak,w*(.89+.025*(k%4)),.207+.026*((j+k)%3),.069+.012*((j+k)%4),
                schemes[(j*3+k)%len(schemes)],k+j,j*count+k)
# Mitered completed frame walls and small offset mat apertures.
def framed(name,x,d,z,w,h,band,scheme,idx,art=0):
    points=[(x-w/2,z-h/2),(x+w/2,z-h/2),(x+w/2,z+h/2),(x-w/2,z+h/2)]
    normals=[(-1,-1),(1,-1),(1,1),(-1,1)]
    block(name+' · 프레임 바탕',x,d-.025,z-h/2,w,.073,h,scheme[0])
    front(name+' · 매트보드',x,d+.019,z,w-band*.70,h-band*.70,'매트')
    moulding(name+' · 사면 프로파일',points,normals,idx,band,d+.049,*scheme,True)
    if art:
        panelw=w-band*1.55;panelh=h-band*1.55;px=d+.030
        front('견본 그림 · 직접 구성한 채색',x,px,z,panelw,panelh,['안개','새벽','서늘'][art%3])
        save=m.group;m.group=fine
        def landscape(pts,mat,layer):
            face('견본화 · 산과 강의 색면',[(x+a*panelw,px+layer*.0009,z+b*panelh) for a,b in pts],mat)
        if art%3==2:
            # A still life with a blue ceramic vase and a loose branch of flowers.
            landscape([(-.12,-.42),(.12,-.42),(.18,-.22),(.15,-.09),(.07,-.05),(.07,.01),(-.07,.01),(-.07,-.05),(-.16,-.12),(-.18,-.20)],'회청',1)
            for k in range(6):
                ax=(k-2.6)*.115;az=.17+.14*sin(k*.86)
                rod('견본화 · 가는 꽃대',[(x,px+.004,z+.01*panelh),(x+ax*panelw/2,px+.004,z+.12*panelh),
                    (x+ax*panelw,px+.004,z+az*panelh)],.0019,'숲',4)
                for petal in range(5):
                    a=2*pi*petal/5
                    ellipse('견본화 · 작은 꽃잎',x+ax*panelw+.015*cos(a),px+.006,z+az*panelh+.014*sin(a),
                            .014,.011,.003*sin(a),'꽃분홍' if k%2 else '매트',7)
        else:
            for k,(offset,material) in enumerate([(.09,'지평'),(-.035,'풀'),(-.19,'숲'),(-.33,'강')]):
                path=[(-.50,-.50),(.50,-.50)]+[(.50-i*.0833,offset+.055*sin(i*.97+art+k)+.022*cos(1.65*i)) for i in range(13)]
                landscape(path,material,k+1)
            ellipse('견본화 · 작은 해',x+panelw*(.19 if art%2 else -.20),px+.006,z+panelh*.25,.058*panelh,.058*panelh,0,'매트',14)
            for j in range(18):
                xx=x+panelw*(.42-rng.random()*.84);yy=z+panelh*(-.04-rng.random()*.29)
                face('견본화 · 붓자국',[(xx-.008,px+.009,yy),(xx+.011,px+.009,yy+.016),(xx+.02,px+.009,yy+.008)],['호두','풀','청동'][j%3])
            if art%3==0:
                for k in range(5):
                    xx=x+panelw*(-.37+k*.042);yy=z-panelh*.21;h=panelh*(.23+.12*sin(k*.97))
                    face('견본화 · 침엽수 실루엣',[(xx-.016,px+.011,yy),(xx,px+.011,yy+h),(xx+.018,px+.011,yy)],'밤청')
        m.group=save
for i,(x,z,w,h) in enumerate([(-2.64,1.98,.64,.48),(-1.80,1.97,.76,.61),(-.89,2.01,.67,.56),(0,1.95,.77,.65),
                                   (.96,1.91,.79,.64),(1.90,2.02,.79,.55),(2.70,1.99,.57,.47)]):
    framed('뒷벽 완성액자',x,-4.91,z,w,h,.055+.006*(i%3),schemes[(i+2)%8],i,1+i%3)
for x in [-2.03,-.69,.65,1.99]:
    block('완성 프레임 · 계단식 매대',x,-4.46,.02,1.30,.86,.48,'미색')
    for j in range(3):
        for k in range(2):
            z=.74+.22*j;xx=x+(k-.5)*.52
            d=-4.04-.19*j
            framed('매대 · 작은 액자',xx,d,z,.39+.045*((k+j)%2),.32+.045*(j%2),.030,
                   schemes[(j*2+k+round(x*2))%8],j+k)
            front('매대 · 견본지 위 문자',xx,d+.032,z,.117,.009,'빈지')
# H-frame studio easels with splayed feet, a movable ledge, slot and brass clamp.
def easel(x,d,z,scale,black=False):
    wood='검정' if black else '메이플';edge='그늘' if black else '나뭇결'
    def pt(a,b,h):return (x+a*scale,d+b*scale,z+h*scale)
    def timber(points,r,tone):rod('이젤 · 부재', [pt(*p) for p in points],r*scale,tone,4)
    for side in [-1,1]:
        timber([(side*.29,.24,.02),(side*.245,.08,.79),(side*.185,-.225,1.89)],.026,wood)
        timber([(side*.265,.18,.19),(side*.229,-.33,.10)],.022,edge)
        timber([(side*.11,-.34,.035),(side*.165,-.10,1.23)],.024,wood)
    timber([(-.244,.074,.77),(.244,.074,.77)],.033,wood)
    timber([(-.225,-.06,1.14),(.225,-.06,1.14)],.024,wood)
    timber([(0,.102,.62),(0,-.27,2.08)],.046,wood)
    timber([(0,.088,.78),(0,-.205,1.90)],.014,edge)
    block('이젤 · 앞으로 나온 받침턱',x,d+.077*scale,z+.74*scale,.66*scale,.23*scale,.049*scale,wood,.003)
    block('이젤 · 윗쪽 고정턱',x,d-.192*scale,z+1.69*scale,.254*scale,.17*scale,.052*scale,wood)
    for by,yy in [(1.652,-.115),(.703,.141)]:
        ellipse('이젤 · 황동 원형 조임 손잡이',x, d+yy*scale,z+by*scale,.032*scale,.032*scale,0,'황동',12)
    for offset in [-.015,.012]:
        timber([(offset,.096,.74),(offset,-.246,2.0)],.0017,'나뭇결')
easel(-2.37,-2.44,.017,.99);easel(-1.88,-1.96,.017,.85,True);easel(-2.70,-3.21,.017,.93)
easel(2.49,-3.04,.017,.80)
# A wrapped canvas has a sloped front, folded gussets, and silver-grey corners.
def wrapped(x,d,width,h,lean,idx,small=False):
    bottom=.091 if not small else .52
    outline=[(x-width/2,d,bottom),(x+width/2,d,bottom),(x+width/2,d-lean,bottom+h),(x-width/2,d-lean,bottom+h)]
    back=[(xx,dd-.057,zz) for xx,dd,zz in outline]
    piece('비닐포장 캔버스 · 면과 두꺼운 가장자리',outline+back,[(0,1,2,3),(4,7,6,5),(0,3,7,4),(1,5,6,2),(2,6,7,3)],'포장' if idx%3 else '모서리')
    for side in [-1,1]:
        cx=x+side*width/2
        face('비닐포장 · 모서리를 감싼 삼각 접힘',[(cx,d-lean+.003,bottom+h),(cx-side*.094,d-lean+.003,bottom+h),
              (cx,d-lean+.017,bottom+h-.074)],'반사')
    m.group=fine
    for side in [-1,1]:
        ax=x+side*(width/2-.024)
        rod('비닐포장 · 얇은 주름',[(ax,d+.002,bottom+.024),(ax-side*.041,d-lean*.36+.003,bottom+h*.36),
             (ax+side*.006,d-lean*.77+.003,bottom+h*.77),(ax,d-lean+.003,bottom+h-.018)],.0022,'반사',5)
    m.group=room
for x in [1.18,2.49]:
    block('캔버스 보관통 · 낮은 목재 받침',x,-1.97,.018,1.15,.71,.166,'박스')
    for sx in [-.54,.54]:block('보관통 · 옆 고정대',x+sx,-1.96,.081,.035,.67,.50,'빈지')
    for i in range(4):
        wrapped(x+(i%2-.5)*.42,-1.73-(i//2)*.26,.39+.064*((i+1)%3),.72+.125*(i%3),.089+.026*(i%2),i)
for i,x in enumerate([.91,1.39,1.89,2.42]):
    framed('진열창 · 소형 샘플 프레임',x,-.155,.268,.29+.014*(i%2),.34,.022,schemes[(i+5)%8],i)
# Finished frames on the return gallery wall and a stack of smaller framed pictures in the front window.
# Rotate the whole native gallery, including the inset landscapes, as a single bank.
from mathutils import Matrix
known=set(room.objects)|set(fine.objects)
for row in range(2):
    for i in range(4):
        xx=-1.39+.87*i;zz=1.11+row*.73
        framed('옆벽 · 완성 액자 견본',xx,0,zz,.71 if (i+row)%2 else .65,.54 if row else .44,.049,
               schemes[(i+2*row+2)%len(schemes)],i+row,1+(i+row)%3)
transform=Matrix.Translation((3.042,2.96,0))@Matrix.Rotation(-pi/2,4,'Z')
bpy.context.view_layer.update()
for obj in (set(room.objects)|set(fine.objects))-known:obj.matrix_world=transform@obj.matrix_world
for x,z,size,art in [(-2.65,.41,.29,1),(-1.69,.35,.20,2),(.81,.33,.22,3),(2.13,.40,.25,1)]:
    framed('쇼윈도 · 전면 작은 견본',x,-.149,z,size,size*1.22,.019,schemes[art+2],art,art)
# The photographs show a light modular ceiling, square panels and track spots.
block('천장 · 밝은 흡음 패널',0,-2.53,2.731,6.24,4.88,.040,'벽')
for i in range(11):block('천장 · 잔눈금 가로',-3.07+i*.61,-2.55,2.727,.007,4.80,.006,'미색')
for i in range(9):block('천장 · 잔눈금 세로',0,-.13-i*.59,2.726,6.18,.007,.007,'미색')
for x in [-1.76,1.76]:
    for d in [-1.38,-3.64]:
        block('매장 천장 · 패널등 금속 테두리',x,d,2.706,.60,.59,.017,'철')
        block('매장 천장 · 정사각 확산판',x,d,2.704,.558,.548,.007,'무광백')
for x in [-2.75,-1.95,.82,1.60,2.44]:
    rod('쇼윈도 · 스폿 헤드 관절',[(x,-.24,2.31),(x,-.23,2.223)],.014,'검정',8)
    profile('쇼윈도 · 소형 원통 스폿',x,-.23,2.16,[(.037,0),(.042,.016),(.039,.079)],'실버',12)
# Author the published corporate mark as real white letters on the photographed burgundy fascia.
# Transparent counters and the original four ink drops stay individually editable.
for name,tone in [('남보라','38256f'),('진분홍','ac0055'),('다홍','ef610c'),('황주황','f69a05')]:
    m.palette[name]=m.material(name,tone)
inks={'letters':'무광백','violet':'남보라','fuchsia':'진분홍','red':'다홍','orange':'황주황'}
outline=json.loads((here/'wordmark.json').read_text())
for ink,rings in outline.items():
    curve=bpy.data.curves.new('한가람문구 · 본점 로고','CURVE')
    curve.dimensions='2D';curve.fill_mode='BOTH';curve.extrude=.0035;curve.materials.append(m.palette[inks[ink]])
    for ring in rings:
        spline=curve.splines.new('POLY');spline.points.add(len(ring)-1);spline.use_cyclic_u=True
        for pt,(a,b) in zip(spline.points,ring):pt.co=((a-88)*.00752,(b-32.5)*.00752,0,1)
    obj=bpy.data.objects.new('한가람문구 · '+inks[ink],curve);room.objects.link(obj)
    obj.location=(-.50,-.037,2.515);obj.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.convert(target='MESH');obj.select_set(False)
# Double-sided hanging Frames sign projecting over the public walkway.
for d in [.21,.76]:
    rod('맞춤액자 표지 · 천장 매달림',[(2.86,d,2.63),(2.86,d,2.82)],.009,'검정',8)
block('맞춤액자 · 사각 검은 몸체',2.86,.504,2.185,.086,.88,.443,'검정')
for x in [2.813,2.907]:
    for d in [.109,.896]:block('돌출 표지 · 흰 세로 프레임',x,d,2.224,.004,.011,.34,'미색')
    for z in [2.225,2.557]:block('돌출 표지 · 흰 가로 프레임',x,.504,z,.004,.794,.010,'미색')
# Customer counter and mat samples stay behind the public area.
for x in [-2.95,-1.72]:
    block('안쪽 작업대 · 짧은 다리',x,-3.95,.015,.06,.42,.73,'철')
block('안쪽 · 작은 목재 작업대',-2.33,-3.95,.744,1.36,.49,.05,'참나무')
for k in range(7):
    front('매트보드 · 여러 색의 샘플',-2.47+.036*k,-3.692,.842+.011*k,.326,.064,['상아','빈지','회청','매트','검정','호두','실버'][k])
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        view=area.spaces.active;view.shading.color_type='MATERIAL';view.region_3d.view_distance=8
        view.region_3d.view_location=(0,1.7,1.55)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'hangaram-framing.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
