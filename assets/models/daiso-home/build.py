"""Build the branch's moon-jar vignette and natural-wood kitchen display."""
from math import cos, sin, pi, tau, exp
from pathlib import Path
from random import Random
import os
import runpy
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
import blender_shop_mesh as mesh

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = '다이소 · 달항아리와 목제 생활용품'
scene.unit_settings.system = 'METRIC'
rng = Random(29917)
block, profile, rod = mesh.block, mesh.profile, mesh.rod
colors = {
    'shelf': 'e7e7df', 'edge': 'bcc1bc', 'steel': '9eaaa6', 'panel': 'd4d7cf',
    'paper': 'f5f0e3', 'black': '343b39', 'ink': '3f4841', 'frame': '56615b',
    'mist': 'bfcdc4', 'aqua': 'acbeb3', 'vein': 'd9dfd5', 'gleam': 'f6f5e9', 'warmWhite':'f2ebdc', 'glaze': 'e3e3d7', 'ivory': 'eae5d9',
    'celadon': 'd8dfd4', 'red': 'b3564d', 'fibre': 'c6b960', 'grey': 'a3a49a',
    'olive': '687a4c', 'moss': '869267', 'green': '58733e', 'petal': 'f9f1da',
    'nectar': 'd59c49', 'rust': 'ac7042', 'blossom': 'd1a8a0', 'bluebird': '788e9a',
    'birch': 'c8a97d', 'beech': 'a98a60', 'honey': 'c5a06c', 'maple': 'b99365',
    'walnut': '71513c', 'bark': '8e6c4a', 'grain': 'a27a4b', 'kraft': 'deca9f',
    'card': 'eee5c9', 'shadow': '7b7367', 'pale': 'e5dcc0', 'rim': 'd6d4c7',
}
for key, value in colors.items():
    mesh.palette[key] = mesh.material(key, value, .16 if key == 'steel' else 0)
glaze = mesh.palette['glaze'].node_tree.nodes.get('Principled BSDF')
glaze.inputs['Roughness'].default_value = .24
roots = []

def group(name, parent):
    coll = bpy.data.collections.new(name)
    parent.children.link(coll)
    mesh.group = coll
    return coll

def root(name, origin):
    coll = group('다이소 · ' + name, scene.collection)
    coll['preview_origin'] = (origin, 0, 0)
    coll['자료'] = '2026년 4월 강남고속버스터미널점 방문 사진. 상품의 정확한 수·자리·치수는 구성.'
    roots.append(coll)
    return coll

font_path = next((p for p in (os.getenv('GTW_KOREAN_FONT'), '/System/Library/Fonts/Supplemental/AppleGothic.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/truetype/nanum/NanumGothic.ttf') if p and Path(p).is_file()), None)
if not font_path:
    raise RuntimeError('Set GTW_KOREAN_FONT to a Korean font to regenerate the display labels')
font = bpy.data.fonts.load(font_path)

def text(name, value, x, d, z, width, height, color='ink'):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = value
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.resolution_u = 2
    curve.font = font
    ob = bpy.data.objects.new(name, curve)
    mesh.group.objects.link(ob)
    curve.materials.append(mesh.palette[color])
    ob.location = (x, -d, z)
    ob.rotation_euler = (pi/2, 0, pi)
    bpy.context.view_layer.update()
    xs = [v[0] for v in ob.bound_box]
    ys = [v[1] for v in ob.bound_box]
    scale = min(width / max(.001, max(xs)-min(xs)), height / max(.001, max(ys)-min(ys)))
    ob.scale = (scale, scale, scale)
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob.select_set(False)
    return ob

def front(name, points, d, color):
    return mesh.piece(name, [(x,d,z) for x,z in points], [tuple(range(len(points)))], color)

def leaf(x, d, z, width, height, lean, color):
    points = [(x,z), (x+lean*.32-width*.46,z+height*.37),
              (x+lean*.68-width*.38,z+height*.68),(x+lean,z+height),
              (x+lean*.77+width*.30,z+height*.72),(x+lean*.31+width*.42,z+height*.34)]
    return front('잎사귀', points, d, color)

def cabinet(w, shelves, top):
    block('걸레받이',0,.01,.014,w-.044,.563,.101,'edge')
    block('철제 하부 받침',0,.01,.115,w,.585,.11,'shelf')
    block('진열 뒷판',0,.256,.226,w-.028,.036,top-.238,'panel')
    for x in [-w/2+.016,w/2-.016]:
        block('옆 기둥',x,.223,.124,.033,.082,top-.123,'edge')
    for h in shelves:
        block('흰 철제 선반',0,-.016,h,w+.012,.581,.027,'shelf')
        block('가격 레일 뒤 흰 철판',0,-.305,h-.02,w+.012,.016,.058,'edge')

def sphere(name, x, d, z, r, depth, height, color):
    rings = [(max(r*.01,r*sin(pi*j/6)),height*(1-cos(pi*j/6))*.5) for j in range(7)]
    ob = profile(name,x,d,z,rings,color,12,depth/r)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob

def jar(name, x, d, z, h, radius, color, tilt=0, seed=0):
    # One continuous thrown body, including hollow interior and the raised lip and foot.
    shape = [(.33,0),(.40,.012),(.41,.048),(.42,.072),(.56,.116),(.77,.222),(.93,.364),
             (1,.53),(.985,.632),(.93,.72),(.825,.807),(.62,.885),(.445,.926),
             (.415,.95),(.422,.965),(.452,.976),(.453,.992),(.436,1),(.368,1),
             (.352,.988),(.356,.959),(.371,.938),(.420,.914),(.59,.87),(.79,.784),
             (.884,.692),(.911,.60),(.915,.505),(.855,.37),(.73,.249),(.48,.143),(.17,.114)]
    segs = 40
    vertices = []
    for j,(factor,level) in enumerate(shape):
        for k in range(segs):
            t = tau*k/segs
            wobble = .007*sin(3*t+seed)+.004*sin(5*t+.7*seed)
            rr = radius*factor*(1+wobble)
            vertices.append((x+rr*cos(t)+tilt*level, d+rr*sin(t), z+level*h+.0008*sin(2*t+seed)*level))
    faces = [(j*segs+k,j*segs+(k+1)%segs,(j+1)*segs+(k+1)%segs,(j+1)*segs+k)
             for j in range(len(shape)-1) for k in range(segs)]
    faces.extend((tuple(reversed(range(segs))),tuple(range((len(shape)-1)*segs,len(shape)*segs))))
    ob = mesh.piece(name,vertices,faces,color)
    col = ob.data.color_attributes.new(name='매장 조명',type='BYTE_COLOR',domain='POINT')
    base = mesh.palette[color].diffuse_color
    for i,v in enumerate(col.data):
        j,k = divmod(i,segs)
        t = tau*k/segs
        inside = j>=19
        shade = (.28+.12*max(0,(j-29)/3)) if inside else (.91+.065*sin(t-.2)+.02*sin(2*t))
        if j<3: shade *= .89
        reflection = 0 if inside else .17*exp(-((cos(t)-.48)/.14)**2-((shape[j][1]-.64)/.27)**2)*max(0,-sin(t))
        v.color = tuple(min(1,base[n]*shade+reflection) for n in range(3))+(1,)
    for p in ob.data.polygons:
        p.use_smooth = True
    # A long, curved reflection from the ceiling strip follows the glazed shoulder.
    # Keep the small highlights editable independently from the ceramic profile.
    outer=shape[:18]
    def surface(hh,aa):
        j=next(i for i in range(1,len(outer)) if outer[i][1]>=hh)
        r0,z0=outer[j-1];r1,z1=outer[j]
        rr=radius*(r0+(r1-r0)*(hh-z0)/(z1-z0))
        rr*=1+.007*sin(3*aa+seed)+.004*sin(5*aa+.7*seed)
        rr+=.0011
        return (x+rr*cos(aa)+tilt*hh,d+rr*sin(aa),z+hh*h+.0008*sin(2*aa+seed)*hh)
    for angle,lo,hi,half,tone in [(-1.005,.56,.76,.025,'gleam'),(-.907,.59,.70,.015,'warmWhite')]:
        verts=[]
        for j in range(9):
            t=j/8
            pattern=half*(.18+.82*sin(pi*t)**.46)
            hh=lo+(hi-lo)*t
            aa=angle+.055*(t-.5)+.03*sin(seed)
            verts.extend((surface(hh,aa-pattern),surface(hh,aa+pattern)))
        mesh.piece('유약에 맺힌 천장등 반사',verts,[(2*j,2*j+1,2*j+3,2*j+2) for j in range(8)],tone)
    return ob

def botanical_frame(x,d,z,w,h,frame):
    block('액자 뒤판',x,d,z,w,.030,h,frame)
    block('액자의 흰 여백',x,d-.019,z+.018,w-.032,.007,h-.036,'paper')
    rod('압화가 붙은 가지',[(x-.07*w,d-.026,z+.23*h),(x,d-.026,z+.47*h),(x+.12*w,d-.026,z+.75*h)],.0026,'olive',5)
    for k in range(6):
        side = 1 if k%2 else -1
        leaf(x+w*(k*.022-.062),d-.029-k*.0001,z+(.29+k*.065)*h,w*.105,h*.12,side*w*.16,['moss','olive','green'][k%3])

def bouquet(x,d,z):
    for i in range(8):
        dx = [-.11,-.05,.06,.105,-.15,.02,.14,-.078][i]
        dy = [-.025,-.075,.063,-.035,.015,.012,.027,.042][i]
        h = [.227,.404,.357,.308,.334,.26,.35,.30][i]
        rod('조화의 휘어진 줄기',[(x,d,z),(x+dx*.43,d+dy*.33,z+h*.61),(x+dx,d+dy,z+h)],.0036,'green',6)
        leaf(x+dx*.30,d+dy*.4,z+h*.35,.033,h*.48,dx*.66+.04,'green')
        for j in range(5):
            t = tau*j/5+i*.73
            xx,zz = x+dx,z+h
            pts=[]
            for width,along in [(0,-.008),(-.014,.008),(-.026,.032),(-.016,.054),(0,.064),(.017,.052),(.025,.03),(.014,.006)]:
                pts.append((xx+width*cos(t)+along*sin(t),zz+along*cos(t)-width*sin(t)))
            v=[(px,d+dy-.015-j*.0005+(.009 if idx in [2,3,4,5] else .002),pz) for idx,(px,pz) in enumerate(pts)]
            v.append((xx+.031*sin(t),d+dy-.020,zz+.031*cos(t)))
            blossom=mesh.piece('아이보리색 조화의 꽃잎',v,[(idx,(idx+1)%8,8) for idx in range(8)],'petal')
            blossom.data.materials.append(mesh.palette['warmWhite'])
            for poly in blossom.data.polygons:
                poly.material_index=poly.index//5
        sphere('꽃받침의 노란 꽃술',x+dx,d+dy-.022,z+h-.008,.013,.008,.016,'nectar')
        for j in range(3):
            t = tau*j/3+i
            sphere('짙은 수술 끝',x+dx+.008*cos(t),d+dy-.026,z+h+.008*sin(t),.0036,.003,.006,'rust')

jars = root('달항아리와 압화 액자 진열', 0)
group('철제 매대와 옥빛 배경', jars)
cabinet(1.79, [.22,.89],2.14)
for d,z,w,h in [(.229,.275,1.70,.593),(.229,.925,1.70,.435),(.229,1.430,1.70,.51)]:
    block('옥빛 종이 배경',0,d,z,w,.012,h,'mist')
    for i in range(13):
        x=(i-6)*.136+rng.uniform(-.012,.012)
        p=[(x+rng.uniform(-.04,.04),d-.009,z+.14*h*j) for j in range(8)]
        rod('연옥색 잔금 무늬',p,.0012,'aqua',4)
        rod('연옥색 종이 무늬의 가지',[(p[3][0],d-.010,p[3][2]),(p[3][0]+.048,d-.010,p[3][2]+h*.08),(p[3][0]+.089,d-.010,p[3][2]+h*.10)],.0017,'vein',4)
block('뒤줄 항아리를 올리는 목재 단',.025,.088,1.342,1.65,.273,.055,'birch')
for x in [-.725,.775]:
    block('뒤줄 진열 단의 목제 다리',x,.146,.916,.040,.121,.426,'birch')
group('유약 항아리와 작은 달항아리',jars)
for i,(x,d,h,r) in enumerate([(-.649,.081,.297,.137),(-.342,.090,.318,.141),(-.040,.094,.236,.118),(.260,.084,.306,.145),(.605,.088,.335,.154)]):
    jar('윗줄 유백색 달항아리',x,d,1.397,h,r,['ivory','glaze','celadon'][i%3],.003*sin(i),i+1)
for i,(x,d,h,r) in enumerate([(-.680,-.096,.326,.146),(-.349,-.087,.37,.179),(-.014,-.10,.241,.119),(.318,-.092,.386,.181),(.668,-.097,.345,.161)]):
    jar('가운데 크고 작은 달항아리',x,d,.918,h,r,['glaze','ivory','celadon'][i%3],-.004*cos(i),i+.8)
for i,(x,d,h,r) in enumerate([(-.682,-.014,.366,.176),(-.372,.086,.285,.144),(-.187,-.094,.343,.162)]):
    jar('아래 선반의 목이 열린 항아리',x,d,.25+(.041 if i==0 else .005),h,r,'glaze',seed=.35+i)
group('펠트 받침과 꽃가지와 압화 액자',jars)
for i in range(41):
    band = 0 if i==0 else (1 if i<9 else (2 if i<23 else 3))
    start,number = [(0,1),(1,8),(9,14),(23,18)][band]
    t=tau*(i-start)/number+.21*band
    sphere('수제 느낌의 펠트 방울',-.683+band*.047*cos(t),-.015+band*.046*sin(t),.246,.026,.026,.046,['fibre','shelf','grey','olive'][i%4])
bouquet(-.678,-.089,1.21)
for x,w,h,frame in [(.25,.31,.345,'shelf'),(.622,.385,.437,'black')]:
    for k in reversed(range(2)):
        botanical_frame(x,.012+k*.073,.252,w,h,frame)
    rod('액자의 철제 받침',[(x-w*.43,-.144,.249),(x-w*.43,-.147,.322),(x+w*.43,-.147,.322),(x+w*.43,-.144,.249)],.006,'steel',6)
group('달항아리 안내 표찰과 파손 주의 띠',jars)
block('상단 안내판',0,.11,1.84,1.59,.025,.305,'paper')
text('상단 한글 안내','달항아리',.32,.091,2.034,.64,.105)
text('진열 설명','인테리어 소품',.32,.090,1.935,.50,.047)
# The printed panel shows a white vase and a flowering branch next to the lettering.
for layer,(x,z,rx,rz,tone) in enumerate([(-.264,1.900,.127,.013,'edge'),(-.261,1.990,.135,.101,'rim'),(-.258,1.996,.124,.095,'ivory')]):
    pts=[(x+rx*cos(tau*k/32),z+rz*sin(tau*k/32)) for k in range(32)]
    front('안내판에 인쇄된 달항아리의 둥근 몸',pts,.089-layer*.0012,tone)
block('그림 속 항아리 전과 굽',-.26,.087,2.08,.083,.002,.008,'rim')
front('꽃가지에 앉은 작은 청조',[(-.564,1.98),(-.52,2.018),(-.512,2.03),(-.50,2.028),(-.494,2.018),
    (-.482,2.011),(-.50,2.010),(-.523,1.993),(-.546,1.988)],.079,'bluebird')
for i in range(2):
    xx=[-.485,-.67][i]
    rod('그림 속 매화 가지',[(xx-.08,.091,1.848),(xx,.091,1.930),(xx+.056,.091,2.083)],.0039,'bark',5)
    for k in range(4):
        xx2=xx+.017*k-.033
        for j in range(5):
            a=tau*j/5
            sphere('연분홍 매화',xx2+.008*cos(a),.08,1.91+k*.033+.008*sin(a),.006,.005,.009,'blossom')
for x in [-.50,.50]:
    block('가느다란 파손 안내 레일',x,-.317,.875,.67,.008,.061,'paper')
    text('파손 주의 표기','파손 주의',x+.11,-.323,.901,.236,.040,'red')
    for i in range(4):
        block('안내문 인쇄 줄',x-.144,-.323,.890+i*.007,.168-i*.011,.002,.0028,'ink')

def colour_wood(obj, color, grain_axis=0):
    # The brown bands change with grain direction even when a coaster is entirely edge-on.
    attr = obj.data.color_attributes.new(name='매장 조명',type='BYTE_COLOR',domain='POINT')
    base = mesh.palette[color].diffuse_color
    for pt,item in zip(obj.data.vertices,attr.data):
        a = pt.co[grain_axis]
        b = pt.co[(grain_axis+1)%3]
        tone = .92+.08*sin(a*110+2.4*sin(b*16))+.057*cos(a*215+b*8)
        item.color = tuple(min(1,base[k]*tone) for k in range(3))+(1,)
    return obj

def coaster(x,d,z,r,thick,color,shape='round'):
    points=[]
    for i in range(40):
        a=tau*i/40
        if shape=='round':
            xx,zz=cos(a),sin(a)
        else:
            xx=(1 if cos(a)>=0 else -1)*abs(cos(a))**.37
            zz=(1 if sin(a)>=0 else -1)*abs(sin(a))**.37
        points.append((xx,zz))
    rings=[(.95,-thick/2),(1,-thick/2+.003),(1,thick/2-.002),(.957,thick/2)]
    verts=[(x+xx*r*rr,d+dd,z+zz*r*rr) for rr,dd in rings for xx,zz in points]
    n=len(points)
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(3) for i in range(n)]
    faces += [tuple(reversed(range(n))),tuple(range(3*n,4*n))]
    ob=mesh.piece('고무나무 '+('원형' if shape=='round' else '사각')+' 컵받침',verts,faces,color)
    for poly in ob.data.polygons:
        poly.use_smooth = poly.index < len(faces)-2
    return colour_wood(ob,color,2)

def face_grain(x,d,z,r,lines=3):
    for index in range(lines):
        yy=(index-(lines-1)*.5)*.37*r
        path=[]
        for step in range(8):
            xx=r*(step/7*1.33-.665)
            value=yy+.068*r*cos(6*xx/r+index*.54)-.085*xx
            path.extend([(x+xx,d,z+value-.004*r),(x+xx,d,z+value+.004*r)])
        faces=[(i,i+1,i+3,i+2) for i in range(0,len(path)-2,2)]
        mesh.piece('나뭇결을 따라 굽은 무늬',path,faces,'grain')

def tray(x,d,z,radius,color,legs):
    # Four radial outlines form a recessed wooden top and a visibly wavy edge.
    points=[]
    for i in range(40):
        t=tau*i/40
        r=radius*(1+.056*cos(5*t+.18)+.018*cos(3*t))
        points.append((r*cos(t),.77*r*sin(t)))
    rings=[(.966,.057),(1,.061),(1,.080),(.986,.084),(.931,.084),(.90,.074),(.72,.074)]
    v=[(x+xx*k,d+dd*k,z+h) for k,h in rings for xx,dd in points]
    n=len(points)
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
    faces.extend((tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))))
    platter=mesh.piece('물결 가장자리의 낮은 소반',v,faces,color)
    for poly in platter.data.polygons:
        poly.use_smooth = poly.index < len(faces)-2
    colour_wood(platter,color)
    for k in range(legs):
        t=tau*k/legs+pi/4
        xx,dd=x+.61*radius*cos(t),d+.48*radius*sin(t)
        leg=profile('벌어진 소반 다리',xx,dd,z,[(.012,0),(.016,.004),(.020,.057)],color,12)
        for poly in leg.data.polygons:
            poly.use_smooth = poly.index < len(leg.data.polygons)-2
        colour_wood(leg,color,2)
    block('목재 진열 라벨',x+radius*.43,d-radius*.28,z+.075,.047,.022,.0015,'paper')

def card_holder(x,d,z,w,color):
    th=.015
    base=block('목재 수납 받침의 바닥',x,d,z,w,.145,.017,color)
    colour_wood(base,color)
    for dx in [-w/2+th/2,w/2-th/2]:
        colour_wood(block('수납 받침의 측판',x+dx,d,z+.015,th,.144,.098,color),color,1)
    block('카드 수납 뒤판',x,d+.066,z+.015,w,.012,.113,color)
    # Concave semicircular finger notch is cut right down from the opening.
    outline=[(-w*.5,0),(w*.5,0),(w*.5,.082),(w*.20,.082)]
    for n in range(13):
        t=n*pi/12
        outline.append((w*.20*cos(t),.082-.033*sin(t)))
    outline.append((-w*.5,.082))
    n=len(outline)
    v=[(x+xx,d-.065+dd,z+.016+zz) for dd in [-.005,.005] for xx,zz in outline]
    faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(j,(j+1)%n,n+(j+1)%n,n+j) for j in range(n)]
    colour_wood(mesh.piece('손가락 홈이 파인 목제 앞판',v,faces,color),color)
    block('안쪽 작은 종이띠',x,d+.054,z+.039,w*.72,.003,.065,'paper')
    for i in range(3):
        block('제품 안내 인쇄선',x-w*.066,d+.051,z+.052+i*.009,w*(.33+i*.043),.003,.002,'shadow')

def packet(x,d,z):
    rod('타공판에서 나오는 걸이',[(x,.224,z+.258),(x,d-.018,z+.258),(x,d-.036,z+.274)],.0048,'steel',7)
    block('저채도 포장지의 뒷면',x,d+.002,z+.003,.186,.009,.175,'pale')
    coaster(x,d-.015,z+.093,.080,.012,'beech')
    outer=[(x+.069*cos(tau*j/32),d-.023,z+.093+.069*sin(tau*j/32)) for j in range(33)]
    rod('나무에 새긴 원형 테두리',outer,.0014,'bark',4)
    text('컵받침 제조 문양 상단','BONNE',x,d-.025,z+.106,.078,.019,'black')
    text('컵받침 제조 문양 하단','TABLE',x,d-.025,z+.082,.083,.021,'black')
    for dx in [-.091,.091]:
        rod('포장 봉합선',[(x+dx,d-.018,z+.004),(x+dx+(.003 if dx>0 else -.003),d-.012,z+.089),(x+dx,d-.003,z+.176)],.0017,'rim',4)
    rod('비닐이 접힌 부분',[(x-.073,d-.021,z+.018),(x-.035,d-.022,z+.013),(x+.068,d-.021,z+.018)],.0016,'shelf',4)
    block('컵받침의 종이 헤더',x,d-.008,z+.176,.198,.012,.083,'kraft')
    text('제품 표찰','고무나무',x,d-.016,z+.223,.125,.025)
    text('제품 표찰','컵받침',x,d-.016,z+.19,.105,.023)
    sphere('천공 주위 그림자',x,d-.018,z+.240,.008,.003,.01,'shadow')

wood = root('나무 소반과 컵받침·카드꽂이',3)
group('목제 생활용품 진열대',wood)
cabinet(1.82,[.22,.74,1.135],2.12)
block('타공 금속판',0,.202,1.153,1.75,.022,.738,'shelf')
# Each perforation is a short diamond in a shared mesh, with empty space between wraps.
holes=[]
for j in range(11):
    for i in range(27):
        x=(i-13)*.064;z=1.188+j*.064
        holes.extend([(x-.0037,.189,z),(x,.189,z+.0037),(x+.0037,.189,z),(x,.189,z-.0037)])
mesh.piece('타공판의 297개 작은 구멍',holes,[tuple(range(i,i+4)) for i in range(0,len(holes),4)],'shadow')
block('나무소품 안내판',0,.10,1.887,1.59,.026,.223,'card')
text('목제 주방 안내','내추럴 우드',.23,.081,2.032,.67,.067)
text('목제 주방 안내 작은글','목제 주방용품',.23,.080,1.952,.53,.051)
for i in range(4):
    rod('안내판에 인쇄된 나뭇결',[(x,.084,1.923+i*.038+.012*sin(12*x+i)) for x in [-.72,-.63,-.54,-.46,-.38,-.31]],.0024,'beech',4)
group('개별 포장한 고무나무 컵받침',wood)
for i in range(5):
    packet((i-2)*.295,-.030,1.487)
group('나뉜 흰 트레이와 낱개 컵받침',wood)
for index,x in enumerate([-.030,.223,.480,.724]):
    block('컵받침을 가른 하얀 통',x,-.046,1.164,.213,.475,.020,'shelf')
    for s in [-1,1]:
        block('트레이 양옆 막이',x+s*.103,-.045,1.181,.012,.471,.092,'shelf')
    for s in range(5):
        x2=x+(s-2)*.041
        front('물결꼴 트레이의 앞 살',[(x2-.018,1.178),(x2+.018,1.178),(x2+.017,1.228),(x2,1.251),(x2-.017,1.227)],-.284,'shelf')
    for i in range(11-index%2):
        coaster(x,-.242+i*.041,1.277,.092,.026,['birch','honey','beech','maple'][(2*i+index)%4],'round' if index in [1,2] else 'square')
        if i==0:
            face_grain(x,-.256,1.277,.092)
group('손가락 홈과 제품 카드가 있는 나무꽂이',wood)
for x in [-.23,-.438,-.65]:
    for i in range(3):
        card_holder(x,-.194+i*.151,1.163,.176,['birch','honey','beech'][i])
for i in range(3):
    card_holder(-.44+i*.21,-.12,.77,.185,['beech','birch','maple'][i])
group('겹쳐 놓은 물결 소반',wood)
for x,d,r,count,color in [(.58,-.021,.196,3,'walnut'),(.132,-.001,.183,2,'maple'),(-.52,-.020,.201,3,'bark'),(-.024,-.031,.182,2,'beech')]:
    z=.768 if x>.10 else .251
    for j in range(count):
        tray(x,d,z+j*.084,r,color,4)
for x in [-.685,-.434,-.19]:
    block('원목 도구의 네모 받침',x,.137,.77,.211,.14,.09,'birch')
for x in [.38,.66]:
    for j in range(4):
        coaster(x,-.13+j*.076,.384,.119,.039,['walnut','beech','honey'][j%3],'round')
        if j==0:
            face_grain(x,-.151,.384,.119)
for x in [-.52,.5]:
    block('진열 가장자리 인쇄 띠',x,-.318,.738,.68,.007,.046,'card')
    text('우드 분류','목제 생활용품',x,-.324,.763,.38,.031)

for coll in roots:
    for obj in coll.all_objects:
        obj.location += Vector(coll['preview_origin'])
bpy.data.fonts.remove(font,do_unlink=True)
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_location = (1.5, 0, 1.04)
        area.spaces.active.region_3d.view_distance = 5.7
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'homeware.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
