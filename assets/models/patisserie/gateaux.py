"""Bake the photographed whole-cake and boxed-pastry presentation in metres."""
from math import cos, sin, pi, tau
from pathlib import Path
import bpy, sys

here=Path(__file__).resolve().parent
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
from blender_display_export import bake_collection

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
gallery=bpy.data.collections.new('파티세리 · 홀케이크와 쁘띠 가토')
scene.collection.children.link(gallery)
gallery['preview_origin']=(0,0,0)
m.group=gallery
tones={'pearls':'FFF1D5','cream':'F6EAE4','ivory':'E3CBB3','chocolate':'754537','truffle':'4B2B29',
       'cocoa':'995B48','gold':'DCA74B','amber':'BC792E','strawberry':'DC3D35','berry':'982B46',
       'seed':'FFBF74','ribbon':'603D34','box':'D2BDB1','darkprint':'5B413D','vanilla':'E9D5A6',
       'apricot':'F79832','pistachio':'899B48','cherry':'BD3E50','glaze':'DC716A','edge':'C9CED2'}
for name,hexcode in tones.items():m.palette[name]=m.material(name,hexcode,.55 if name=='gold' else 0)

def orb(label,x,d,z,rx,rd,rz,col):
    bands,segments=(3,5) if rx<.005 else (6,12)
    return m.profile(label,x,d,z-rz,[(rx*max(.025,sin(pi*j/bands)),rz*(1-cos(pi*j/bands)))
            for j in range(bands+1)],col,segments,rd/rx)

def curls(label,x,d,z,rise,width,angle,col):
    # A tapered tempered-chocolate band turning through a half loop.
    vertices=[]
    for j in range(17):
        t=j/16; a=-.48*pi+1.20*pi*t
        u=.038*cos(a); v=.012*sin(t*pi*1.3); h=rise*(.5+.5*sin(a))
        half=width*(.2+.8*sin(pi*t)**.5)/2
        for shift,thick in [(-half,0),(half,0),(half,.0018),(-half,.0018)]:
            vertices.append((x+u*cos(angle)-(v+shift)*sin(angle),d+u*sin(angle)+(v+shift)*cos(angle),z+h+thick))
    m.piece(label,vertices,[(4*j+k,4*j+(k+1)%4,4*j+4+(k+1)%4,4*j+4+k) for j in range(16) for k in range(4)],col)

def berry(x,d,z,scale):
    r=.022*scale
    m.profile('딸기 과육',x,d,z,[(r*.78,0),(r,.007*scale),(r*.91,.018*scale),(r*.48,.030*scale),(r*.10,.037*scale)],'strawberry',18,.90)
    for level,rr in [(0.010,.99),(.020,.83)]:
        for k in range(7):
            a=tau*(k+level*22)/7
            orb('딸기 씨',x+r*rr*cos(a),d+r*rr*.90*sin(a),z+level*scale,.0011,.0011,.0016,'seed')

def cake(x,d,choco,variation):
    r=.133
    m.block('금빛 홀케이크 받침',x,d,.004,.322,.306,.012,'gold',.006)
    m.block('받침의 짙은 단면',x,d,.001,.321,.305,.004,'amber')
    coat='chocolate' if choco else 'cream'
    m.profile('둥근 홀케이크의 아이싱',x,d,.016,[(r*.95,0),(r,.006),(r,.095),(r*.99,.102),(r*.95,.105)],coat,60)
    for i in range(2):m.profile('아이싱 마감 띠',x,d,.021+.004*i,[(r+.0005,0),(r+.001,.0018)],'cocoa' if choco else 'ivory',60)
    for n in range(8):
        a=(.16+n*.085)*tau
        if choco:
            curls('얇게 말린 다크 초콜릿',x+.057*cos(a),d+.042*sin(a),.120,.036+(n%3)*.010,.023,a,'truffle' if n%2 else 'cocoa')
        elif n in [1,4,6]:
            berry(x+.069*cos(a),d+.052*sin(a),.120,1+.10*(n%3))
        else:
            orb('크림 봉우리',x+.059*cos(a),d+.049*sin(a),.128,.015,.016,.017,'pearls')
    curls('홀케이크 초콜릿 장식',x+.022,d+.023,.119,.068,.018,variation,'truffle')
    for k in range(6):
        a=k*2.4;orb('금박 조각',x+.020+.016*cos(a),d+.008+.016*sin(a),.128+(k%2)*.006,.004,.002,.0018,'gold')

def carton(x,d):
    m.block('접은 케이크 상자',x,d,.001,.366,.191,.203,'box',.004)
    for side in [-1,1]:
        xx=x+side*.084
        m.piece('상자 앞면의 각진 초콜릿색 인쇄',[(xx-.070,d-.096,.045),(xx+.065,d-.096,.080),(xx+.080,d-.096,.184),(xx+.012,d-.096,.137)],[(0,1,2,3)],'darkprint')
    m.block('상자 덮개 이음',x,d,.204,.0017,.177,.001,'ribbon')

for i,(x,d,choco) in enumerate([(-.02,-.063,False),(.379,.007,False),(.777,-.064,True)]):
    cake(x,d,choco,i+.21)
    carton(x,.185)

def petit(x,d,index):
    width=.172;depth=.114
    m.block('은은한 금색 바닥판',x,d,.002,width+.044,depth+.04,.006,'gold',.004)
    for z,h,mat in [(.009,.015,'truffle'),(.024,.012,'vanilla'),(.036,.018,['berry','apricot','chocolate'][index]),(.054,.005,'cream'),(.059,.015,['cherry','apricot','truffle'][index])]:
        m.block('쁘띠 가토의 시트와 무스',x,d,z,width,depth,h,mat,.002)
    for k in range(3):
        orb('무스 위의 과일과 초콜릿',x+(k-1)*.027,d,.079,.019,.016,.011,['glaze','apricot','cocoa'][index])
    # Edges carry fine highlights while the storefront glazing stays transparent.
    w=width/2+.011;l=depth/2+.009
    for a in [-w,w]:
        for b in [-l,l]:m.rod('투명 포장 접힌 모서리',[(x+a,d+b,.008),(x+a,d+b,.102)],.0008,'edge',5)
    m.rod('투명 포장 상단 접힘',[(x-w,d-l,.102),(x+w,d-l,.102),(x+w,d+l,.102),(x-w,d+l,.102),(x-w,d-l,.102)],.0008,'edge',5)

for i,x in enumerate([-.873,-.602,-.331]):
    for d in [-.106,.094]:petit(x,d,i)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'gateaux.blend'),compress=True)
bake_collection(gallery,'Gateaux',here/'gateaux.glb',preserve_smoothing=True,simplification=(.78,.00018))
