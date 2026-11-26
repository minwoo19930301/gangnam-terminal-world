"""Public-facing tea counter, lattice lanterns and flared pier at Shinsegae Gangnam."""
from pathlib import Path
from math import cos, sin, pi, atan2
import re, sys, bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as shop
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='차지 · 신세계 강남점'
scene.unit_settings.system='METRIC'
col=bpy.data.collections.new('ChageeGangnamShop')
scene.collection.children.link(col)
def components(name):
 group=bpy.data.collections.new(name);col.children.link(group)
 return group
shop.group=components('01 석재 카운터')
shop.palette={n:shop.material(n,c,m) for n,c,m in [
 ('회색 석재','BDAC97',0),('석재 옆면','AC9980',0),('석재 상판','D3C3AA',.08),('황동','AA8150',.4),
 ('목재','B58F62',0),('목재 밝은 단면','CFAD7C',0),('차광 몰딩','7E644D',.12),('등지','FFE7B4',0),
 ('등지 음영','FAE4B1',0),('백색 타일','E5DFD0',.08),('타일 줄눈','C7BEAB',0),
 ('후면 벽','BAA88E',0),('벽장 내부','907351',0),('검정','342F2B',.08),
 ('흰색','FAF6E8',0),('홍색','EA191E',0),('남색 인쇄','304569',0),('남색','485D7B',0),('포장지','DDD8BD',0),
 ('은색','B2B5AC',.48),('차','BD904F',0)]}
for n in ['등지','흰색','홍색']:
 m=shop.palette[n]; sh=m.node_tree.nodes.get('Principled BSDF')
 sh.inputs['Emission Color'].default_value=m.diffuse_color
 sh.inputs['Emission Strength'].default_value=.36 if n=='등지' else .07
box=shop.block
def counter():
 # Chamfered counter stone follows the old case footprint; base shadow and inset band.
 for name,z,h,pad,mat in [('바닥 그림자',.025,.10,-.045,'차광 몰딩'),('회색 석재 하부',.125,.46,0,'회색 석재'),
                            ('얇은 짙은 줄눈',.585,.036,0,'차광 몰딩'),('회색 석재 상부',.621,.303,0,'회색 석재'),
                            ('도톰한 상판',.924,.073,.028,'석재 상판')]:
  a,d=3.13+pad,.68+pad;b=.23
  poly=[(-a+b,-d),(a-b,-d),(a,-d+b),(a,d-b),(a-b,d),(-a+b,d),(-a,d-b),(-a,-d+b)]
  vs=[(x,y,z+k*h) for k in (0,1) for x,y in poly]
  shop.piece(name,vs,[tuple(range(7,-1,-1)),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)],mat)
 for x in [-1.65,.21,1.85]:box('상판 접합부',x,.682,.14,.007,.006,.78,'석재 옆면')
counter()
shop.group=components('02 차 선반과 메뉴')
box('후면 목재 벽',0,-2.55,.02,6.44,.11,3.12,'후면 벽')
# Fixed shelves behind the serving line and a perpendicular return at the left.
for x,w in [(-2.39,1.47),(2.31,1.56)]:
 box('조명 선반 배판',x,-2.45,.94,w,.09,2.05,'벽장 내부')
 for level in range(4):
  z=1.06+level*.47
  box('조명 선반',x,-2.25,z,w,.40,.048,'목재 밝은 단면')
  box('선반 밑 간접등',x,-2.076,z-.022,w-.045,.02,.024,'등지')
  for j in range(5):
   bx=x+(j-2)*.245
   if (level+j)%3:
    shop.profile('차 포장 원통',bx,-2.19,z+.052,[(.072,0),(.077,.012),(.076,.158),(.081,.163),(.081,.177)],'남색' if (level+j)%4 else '포장지',10)
    box('차통 라벨',bx,-2.113,z+.095,.057,.006,.052,'흰색')
   else:
    box('상자 차 선물',bx,-2.19,z+.05,.17,.15,.18,'남색 인쇄' if level%2 else '포장지',.005)
    box('선물 띠',bx,-2.112,z+.05,.023,.005,.18,'목재 밝은 단면')
box('메뉴 보드 금속틀',.04,-2.39,2.11,2.64,.07,.51,'황동')
box('메뉴 보드',.04,-2.343,2.135,2.58,.04,.46,'등지')
for x in [-.96,.94]:
 for j in range(4):
  box('메뉴 행',x,-2.317,2.21+j*.065,.31-j%2*.08,.006,.009,'목재')
for x in [-1.55,-.84,-.11,.60]:
 shop.profile('차 추출 용기',x,-1.96,1.06,[(.135,0),(.137,.06),(.154,.10),(.148,.46),(.157,.48),(.145,.51)],'은색',12)
 box('티 바',x,-1.80,1.14,.055,.088,.055,'검정')
box('작업 상판',0,-2.05,.94,6.05,.68,.10,'석재 상판')
box('후면 하부장',0,-2.23,.025,6.05,.38,.91,'목재')
# Paired tapered upper branches, patterned with narrow tile joints.
shop.group=components('03 타일 기둥과 격자 인방')
for sign in [-1,1]:
 center=-.80
 for j in range(8):
  lo=j/8;hi=(j+1)/8
  def bounds(t):
   outer=.365+.99*t*t
   inner=.033+.42*t*t
   return (center+sign*inner,center+sign*outer,1.00+1.40*t)
  il,ol,zl=bounds(lo);ih,oh,zh=bounds(hi)
  for label,q0,q1,material in [('석재 기둥',0,1,'백색 타일'),('가로 줄눈',0,.07,'타일 줄눈')]:
   v=[]
   for zz in (q0,q1):
    for d in (-1.48,-.90):
     for x in [il+(ih-il)*zz,ol+(oh-ol)*zz]:
      v.append((x,d+(.003 if material=='타일 줄눈' else 0),zl+(zh-zl)*zz))
   shop.piece(label,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],material)
# Fill only the space between both inner profiles at the base of the column.
# Its front face sits behind the returns so the tile faces cannot overlap.
for j in range(5):
 t0=j/8;t1=(j+1)/8
 def infill(t):
  return (.033+.42*t*t)*(1-max(0,(t-.375)/.25))
 p0,p1=infill(t0),infill(t1)
 q=[(-.80-p0,1+1.40*t0),(-.80+p0,1+1.40*t0),(-.80+p1,1+1.40*t1),(-.80-p1,1+1.40*t1)]
 shop.piece('기둥 중앙 타일',[(x,d,z) for d in (-1.47,-.903) for x,z in q],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6)],'백색 타일')
# Translucent gridded head and the folded return on the left. No secondary lit draws.
def lantern(name,x,d,width,depth,lo,height):
 box(name+' · 등지',x,d,lo,width,depth,height,'등지')
 for end in [-1,1]:
  side=d+end*(depth/2+.014)
  n=max(1,round(width/.31))
  for j in range(n+1):box('목재 세로살',x-width/2+j*width/n,side,lo,.032,.032,height,'목재')
  for z in [lo,lo+height*.52,lo+height-.026]:box('목재 가로살',x,side,z,width+.04,.034,.026,'목재')
 for side in [x-width/2-.014,x+width/2+.014]:
  n=max(1,round(depth/.31))
  for j in range(n+1):box('돌아가는 격자',side,d-depth/2+j*depth/n,lo,.031,.028,height,'목재')
  for z in [lo,lo+height*.52,lo+height-.026]:box('돌아가는 띠',side,d,z,.032,depth,.026,'목재')
 box('격자 하부 황동선',x,d,lo-.045,width+.07,depth+.07,.047,'황동')
# The middle bay swells out toward the aisle, following the opening perspective.
def front_d(x):
 return -.372+.19*max(0,1-((x-.32)/1.85)**2)**2

def band(label,x0,x1,d0,d1,z,height,thick,mat):
 v=[(x,d+t*thick,z+k*height) for k in (0,1) for t in (-.5,.5) for x,d in [(x0,d0),(x1,d1)]]
 return shop.piece(label,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],mat)

left,right=-2.25,2.61
for j in range(16):
 a,b=left+(right-left)*j/16,left+(right-left)*(j+1)/16
 da,db=front_d(a),front_d(b)
 band('투광 격자지',a,b,da-.016,db-.016,2.39,.68,.028,'등지' if j%5 else '등지 음영')
 box('좁은 황동 격자살',a,da+.013,2.39,.025,.037,.68,'목재')
 for z,h in [(2.357,.033),(2.714,.018),(3.039,.031)]:
  band('곡면 가로살',a,b,da+.005,db+.005,z,h,.04,'목재 밝은 단면')
 corners=[(a,-1.04),(b,-1.04),(b,db),(a,da)]
 shop.piece('조명 캐노피 하부',[(x,d,2.365) for x,d in corners],[(0,1,2,3)],'석재 상판')
box('인방 후면',.18,-1.04,2.39,4.86,.045,.68,'목재')
for edge in [left,right]:
 dep=front_d(edge)+1.04
 box('인방 옆면',edge,-1.04+dep/2,2.39,.042,dep,.68,'등지')
 for zz in [2.39,2.714,3.039]:
  box('인방 옆면 가로살',edge,-1.04+dep/2,zz,.052,dep,.023,'목재')
 for kk in [0,.5,1]:
  box('인방 옆면 세로살',edge,-1.04+kk*dep,2.39,.056,.027,.68,'목재')
lantern('돌출한 격자 단부',-2.62,-.46,.78,1.06,1.03,2.05)
lantern('좌측 접힌 리턴',-2.63,-1.69,.78,1.28,2.41,.66)
# Shallow interior ceiling and its continuous warm shadow gap behind the lantern.
box('매장 천장',0,-1.69,3.075,6.44,1.79,.11,'석재 상판')
box('간접 조명 홈',0,-2.38,3.053,6.26,.12,.025,'등지')
for x in [-2.3,-.75,.78,2.34]:
 shop.profile('천장 매입등',x,-1.65,3.050,[(.040,0),(.048,.008)],'등지',12)

# Location photographs show yellow milk tea, white lids and blue tea packaging.
shop.group=components('04 티 바와 픽업 번호')
for j in range(5):
 x=1.16+.15*j
 shop.profile('밀크티 컵',x,.03,1.,[(.045,0),(.057,.105),(.065,.143)],'차',12)
 shop.profile('흰 리드',x,.03,1.143,[(.068,0),(.067,.014),(.057,.020),(.054,.024)],'흰색',12)
for j in range(3):
 x=2.40+j*.15
 box('남색 포장 상자',x,-.19,1.0,.13,.13,.22,'남색 인쇄')
 box('포장 인쇄',x,-.121,1.065,.083,.008,.042,'포장지')
# The visitor photograph shows a numbered tea-bar pickup mat and raised white TEA BAR letters.
def lettering(text,name,x,d,z,width,vertical,material):
 font=bpy.data.curves.new(name,'FONT');font.body=text;font.align_x='CENTER';font.align_y='CENTER'
 font.extrude=.008 if vertical else .001;font.resolution_u=3
 ob=bpy.data.objects.new(name,font);shop.group.objects.link(ob);font.materials.append(shop.palette[material])
 ob.rotation_euler.x=pi/2 if vertical else 0
 bpy.context.view_layer.update()
 factor=width/ob.dimensions.x;ob.scale=(factor,factor,factor)
 ob.location=(x,-d,z)
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 bpy.ops.object.convert(target='MESH')
lettering('TEA BAR','밝은 픽업대 입체 글자',1.40,.693,.51,1.46,True,'흰색')
box('픽업 번호 매트',1.52,.347,1.000,2.26,.44,.007,'차광 몰딩')
for j in range(10):
 x=.52+j*.222
 box('번호 구획',x+.11,.347,1.007,.006,.40,.002,'목재 밝은 단면')
 shop.profile('밝은 번호 원',x,.498,1.010,[(.062,0),(.062,.002)],'흰색',16)
 lettering(str(j),'픽업 번호 '+str(j),x,.498,1.013,.045,False,'차광 몰딩')
# Narrow streaks and the raised side seams make the grey curved tiles read at eye height.
for side in [-1,1]:
 for rib in [.14,.53,.88]:
  points=[]
  for i in range(17):
   t=i/16;inner=.033+.42*t*t;outer=.365+.99*t*t
   points.append((-.8+side*(inner+(outer-inner)*rib),-.894,1.+1.40*t))
  shop.rod('갈라지는 기둥 세로 줄눈',points,.007,'타일 줄눈',5)

# Official vector mark. Separate each of its original contours and position its seal/wordmark.
shop.group=components('05 브랜드 표식')
svg=(here/'mark.svg').read_text()
paths=re.findall(r'<path[^>]*>',svg)
import tempfile
vectors=[]
with tempfile.TemporaryDirectory() as tmp:
 for idx,path in enumerate(paths):
  p=Path(tmp)/('path%d.svg'%idx);p.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 201">'+path+'</path></svg>')
  before=set(bpy.data.objects);bpy.ops.import_curve.svg(filepath=str(p))
  for curve in [o for o in bpy.data.objects if o not in before and o.type=='CURVE']:
   curve.data.resolution_u=2;bpy.ops.object.select_all(action='DESELECT');curve.select_set(True);bpy.context.view_layer.objects.active=curve;bpy.ops.object.convert(target='MESH')
   o=bpy.context.object;pts=[o.matrix_world@v.co for v in o.data.vertices];faces=[tuple(f.vertices) for f in o.data.polygons]
   vectors.append((idx,pts,faces));bpy.data.objects.remove(o,do_unlink=True)
xmin=min(v.x for i,p,f in vectors for v in p);xmax=max(v.x for i,p,f in vectors for v in p);ymin=min(v.y for i,p,f in vectors for v in p)
shop.rod('원형 상표 테두리',[(.30,-.171,2.742),(.30,-.160,2.742)],.321,'황동',48)
for idx,pts,faces in vectors:
 seal=max(v.x for v in pts)<xmin+(xmax-xmin)*.33
 poses=[(.30,-.153,2.425,.635,('흰색' if idx==0 else '홍색'))] if seal else [(-2.62,.10,1.80,.70,'검정'),(-.02,-2.310,2.26,.66,'검정')]
 for x,d,z,w,mat in poses:
  cx=xmin+(xmax-xmin)*(.14334 if seal else .667)
  scale=w/(xmax-xmin)*700/(200.68 if seal else 465)
  shop.piece('차지 원형 상표' if seal else 'CHAGEE 채널 레터',[(x+(v.x-cx)*scale,d+(.004 if seal and idx else .001),(v.y-ymin)*scale+z) for v in pts],faces,mat)
# Compact native area lights approximate the warm shelf and lantern reflections.
for x,d,z,energy,size in [(0,-.85,2.30,36,3.5),(-2.15,-2.05,2.50,7,1.0),(2.10,-2.05,2.50,7,1.0)]:
 light=bpy.data.lights.new('목재 캐노피 반사광','AREA');light.energy=energy;light.size=size
 light.color=(1,.83,.62)
 o=bpy.data.objects.new(light.name,light);col.objects.link(o);o.location=(x,-d,z)

for group in list(bpy.data.collections):
 if group.name.endswith('.svg') and not group.all_objects:
  bpy.data.collections.remove(group)
scene.world=bpy.data.worlds.new('스위트파크 편집 조명')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'counter.blend'),compress=True)
