"""Build the Gangnam shop using the brand's own photograph of the eighth floor."""
from math import cos, pi, sin
from pathlib import Path
import sys
import bpy

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
sys.path.insert(0,str(HERE.parents[2]/'tools'))
sys.dont_write_bytecode=True
import blender_shop_mesh as m
import finishes
import contact

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
root=bpy.data.collections.new('SSG_8F_Brownyard')
bpy.context.scene.collection.children.link(root)
groups={}
for batch in ['BrownyardOak','BrownyardCloth','BrownyardDisplay','BrownyardGlass','BrownyardLight']:
    groups[batch]=bpy.data.collections.new(batch)
    root.children.link(groups[batch])
def group(name):m.group=groups[name]

colors={'timber':'d5a166','grain':'c58f54','beech':'dfaf69','edge':'ad7947','shadow':'866444',
        'wall':'dfcfb6','tile':'e2d3b9','grout':'b9a78d','shelf':'eee4cb','white':'f3eddf',
        'shade':'847c70','gold':'b8996a','metal':'b1afa1','shoe':'d5c3a4','sole':'d4bf9b',
        'black':'292b2c','charcoal':'45494a','navy':'354454','indigo':'546575','cream':'ded7be',
        'shirt':'ede9db','taupe':'a49881','sand':'bcb192','blue':'a1b4c2','rust':'99524a',
        'plum':'75595b','olive':'727663','wool':'95918b','blackboot':'383839','tanboot':'c4b599',
        'leather':'423e38','screen':'bbbdb5','glass':'d8e7df','glow':'fff5dc','logo':'fff8e6',
        'brown':'9c896a','knitDark':'4d4e4e','knitLight':'c8c3ae','rug':'baa88d','seam':'746f64'}
m.palette={name:m.material(name,color,.36 if name in ('metal','gold') else 0) for name,color in colors.items()}
m.palette['glass'].node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.16
m.palette['glass'].node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.15
m.palette['glass'].surface_render_method='DITHERED'
for name in ['glow','logo']:
    node=m.palette[name].node_tree.nodes.get('Principled BSDF')
    node.inputs['Emission Color'].default_value=m.palette[name].diffuse_color
    node.inputs['Emission Strength'].default_value=.9
images=finishes.textures()
# Native materials are independently editable, including timber grain and woven cloth.
for name in ['timber','grain','beech','edge','shadow']:
    finishes.native_texture(m.palette[name],images['BrownyardOak'])
for name in ['shirt','taupe','sand','blue','rust','plum','olive','wool','cream','indigo','navy','knitDark','knitLight','rug']:
    finishes.native_texture(m.palette[name],images['BrownyardCloth'])

def box(name,x,d,z,w,depth,h,col,r=0,horizontal=False):
    ob=m.block(name,x,d,z,w,depth,h,col,r)
    if horizontal:ob['across_grain']=True
    return ob
def rod(name,pts,r,c,seg=8):return m.rod(name,pts,r,c,seg)
def skin(name,rings,col,smooth=True):
    n=len(rings[0])
    faces=[tuple(reversed(range(n)))]
    for j in range(len(rings)-1):
        for k in range(n):
            i=j*n+k;l=j*n+(k+1)%n
            faces.append((i,l,l+n,i+n))
    faces.append(tuple(range((len(rings)-1)*n,len(rings)*n)))
    ob=m.piece(name,[p for ring in rings for p in ring],faces,col)
    for f in list(ob.data.polygons)[1:-1]:f.use_smooth=smooth
    return ob

# The shop parcel is 8.74 x 6.62 in plan coordinates. This fitout remains inside
# the existing enclosing retail walls and leaves both sides of the centre table open.
group('BrownyardDisplay')
box('밝은 바닥 줄눈',0,1.12,.025,6.14,8.40,.009,'grout')
for i in range(6):
    for j in range(8):
        box('무광 석재 타일',-3.07+(i+.5)*1.023,-3.08+(j+.5)*1.05,.034,
            1.020,1.046,.005,['tile','wall','tile'][(i+2*j)%3])
box('매장 크림색 천장',0,1.12,3.13,6.14,8.40,.033,'shelf')
box('면조명 얇은 틀',-.12,.93,3.112,2.04,5.12,.018,'metal')
group('BrownyardLight')
box('확산판',-.12,.93,3.105,1.99,5.07,.009,'glow')
for x in [-2.35,-2.08,2.01,2.27]:
    for d in [-2.36,-1.28,-.19,.89,1.96,3.05,4.10]:
        m.profile('매입 다운라이트',x,d,3.105,[(.033,0),(.046,.011)],'glow',12)

group('BrownyardOak')
# Visible upright grain, recessed board joints, shadow plinth and warm cap.
for i in range(8):
    box('후면 목재 벽 패널',-2.66+i*.76,-3.014,.05,.756,.095,3.08,
        ['timber','beech','timber','grain'][i%4])
box('뒤 벽 하부 걸레받이',0,-2.95,.055,6.10,.075,.085,'edge',.003,True)
for d in [-2.34,-1.03,.28,1.59,2.70]:
    box('오른쪽 오크 벽',3.012,d,.05,.09,1.30 if d!=2.70 else .92,3.08,'timber')
box('결제대 전판',0,-2.31,.04,2.00,.52,.83,'beech',.018)
box('결제대 상판',0,-2.30,.87,2.04,.56,.045,'grain',.008,True)
box('뒤 벽 낮은 벤치',2.12,-2.72,.07,1.45,.36,.40,'grain',.015,True)
group('BrownyardDisplay')
box('카운터 디스플레이 뒤판',-.12,-2.32,1.01,.43,.034,.29,'screen',.008)
box('디스플레이 받침목',-.12,-2.32,.915,.055,.08,.18,'metal',.004)
box('디스플레이 받침발',-.12,-2.31,.911,.22,.14,.012,'metal',.005)
box('작은 단말기',.40,-2.28,.915,.10,.10,.075,'black',.006)
group('BrownyardLight')
# Standing letters as real mesh in the native file; retain letter spacing at a distance.
font=bpy.data.curves.new('BROWNYARD 서체','FONT');font.body='BROWNYARD';font.align_x='CENTER'
font_file=Path('/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf')
if font_file.exists():font.font=bpy.data.fonts.load(str(font_file))
font.size=.245;font.space_character=1.32;font.extrude=.007;font.bevel_depth=.0012
font.resolution_u=4;font.bevel_resolution=1
text=bpy.data.objects.new('후면 흰 입체 상호',font);m.group.objects.link(text)
text.location=(0,2.95,2.37);text.rotation_euler=(pi/2,0,0)
text.data.materials.append(m.palette['logo'])
bpy.ops.object.select_all(action='DESELECT');text.select_set(True);bpy.context.view_layer.objects.active=text
bpy.ops.object.convert(target='MESH')

# A narrow block-glass panel and second white wordmark are visible at the
# right edge of the operator photograph. Keep it behind the public threshold.
group('BrownyardGlass')
for i in range(4):
    for j in range(12):
        box('입구 측면 유리블록',2.64+(i-1.5)*.205,2.77,.085+j*.206,.197,.095,.197,'glass',.014)
group('BrownyardDisplay')
for i in range(5):
    box('유리블록 세로 이음',2.64+(i-2)*.205,2.77,.077,.008,.084,2.48,'shade',.002)
for j in range(13):
    box('유리블록 가로 이음',2.64,2.77,.077+j*.206,.825,.084,.008,'shade',.002)
small=text.copy();small.data=text.data.copy();small.name='유리블록의 작은 상호'
groups['BrownyardLight'].objects.link(small)
small.scale=(.48,.48,.48);small.location=(2.64,-2.83,1.90)

# Oak side-wall cabinetry with a continuous warm hanging rail, shelf and shoe boxes.
group('BrownyardOak')
box('왼쪽 옷장 받침',-2.72,-.10,.055,.60,5.58,.14,'grain',.01,True)
box('왼쪽 옷장 벽판',-3.006,-.10,.16,.082,5.58,2.62,'timber')
for d in [-2.85,-1.44,-.04,1.36,2.67]:
    box('옷장 칸막이',-2.71,d,.17,.67,.065,2.59,'beech',.006)
box('신발상자 선반',-2.72,-.09,2.08,.64,5.58,.055,'beech',.006,True)
box('왼쪽 옷장 상단',-2.73,-.09,2.76,.66,5.58,.082,'beech',.008,True)
group('BrownyardDisplay')
rod('벽행거 금속봉',[(-2.58,-2.85,1.77),(-2.58,2.65,1.77)],.018,'gold',16)
for j in range(12):
    d=-2.6+j*.453
    for h in [2.145,2.31]:
        box('아이보리 종이 상자',-2.70,d,h,.50,.397,.146,'white',.005)
        box('손잡이 틈',-2.444,d,h+.07,.004,.055,.011,'shade',.003)

# Freestanding beech A-frames. Each pair of legs flares toward the floor.
def rack(x,d,length):
    group('BrownyardOak')
    for end in [-1,1]:
        z=d+end*length/2
        for side in [-1,1]:
            rod('A자형 목재 행거 다리',[(x+side*.34,z,.06),(x+side*.045,z,1.88)],.029,'beech',10)
        rod('행거 하부 가로대',[(x-.255,z,.48),(x+.255,z,.48)],.019,'grain')
    rod('둥근 옷걸이 봉',[(x,d-length/2-.066,1.70),(x,d+length/2+.066,1.70)],.028,'beech',14)
    group('BrownyardDisplay')
    for e in [-1,1]:m.profile('금속 접합 캡',x,d+e*length/2,1.82,[(.029,0),(.030,.022)],'gold',12)

def hanging(x,d,col,kind,index,rod_height=1.70):
    group('BrownyardDisplay')
    rod('옷걸이 곡선 고리',[(x,d,rod_height-.10),(x,d,rod_height-.037),(x+.04,d,rod_height-.009),
        (x+.044,d,rod_height+.017),(x+.026,d,rod_height+.031),(x-.009,d,rod_height+.028)],.0055,'metal',5)
    group('BrownyardOak')
    rod('목재 옷걸이 어깨',[(x-.224,d,rod_height-.192),(x-.08,d,rod_height-.097),(x,d,rod_height-.082),
        (x+.08,d,rod_height-.097),(x+.224,d,rod_height-.192)],.012,'beech',6)
    group('BrownyardCloth')
    top=rod_height-.092; length=[.78,.69,.84][kind]
    # Concentric sections follow the shoulder slope. Shallow hanging folds vary with each piece.
    rings=[];phase=index*1.7
    for level,w,thick in [(0,.258,.061),(.17,.25,.068),(.57,.25,.073),(.81,.237,.068),(.91,.221,.059),(1,.071,.046)]:
        ring=[]
        for k in range(24):
            a=2*pi*k/24;sx=cos(a);sz=sin(a)
            ripple=.016*sin(4.8*pi*sx+phase)*(1-level*.7)
            ring.append((x+w*sx,d+(thick+ripple)*sz,top-length*(1-level)+.013*cos(4*a+phase)*(1-level)))
        rings.append(ring)
    skin('행거에 걸린 셔츠와 니트',rings,col)
    for side in [-1,1]:
        rings=[]
        for level,off,down,rad in [(0,.19,.087,.105),(.33,.248,.199,.080),(.68,.29,.306 if kind==1 else .410,.065),(1,.304,.352 if kind==1 else .63,.057)]:
            rings.append([(x+side*(off+rad*.52*cos(a)),d+rad*sin(a),top-down+rad*.59*cos(a))
                          for a in [2*pi*k/12 for k in range(12)]])
        skin('처지는 소매',rings,col)
    if kind==0:
        # Pointed collars and a lightly raised centre placket on cotton shirts.
        for side in [-1,1]:
            p=[(x,d+.045,top),(x+side*.07,d+.04,top),(x+side*.098,d+.074,top-.089),(x+side*.022,d+.080,top-.052)]
            m.piece('셔츠 칼라',p,[(0,1,2,3)],col)
        rod('셔츠 앞단',[(x,d+.074,top-.06),(x+.005,d+.074,top-length+.029)],.005,col,5)
        if index==0:
            group('BrownyardDisplay')
            for k in range(5):
                h=top-.13-k*.115
                box('앞단 자개 단추',x+.008,d+.083,h,.012,.005,.012,'white',.002)
            group('BrownyardCloth')
        for side in [-1,1]:
            rod('소매 끝 이중 스티치',[(x+side*.273,d+.030,top-.597),
                (x+side*.300,d+.048,top-.610),(x+side*.328,d+.028,top-.620)],.0028,col,4)
    else:
        collar=[(x+.079*cos(a),d+.048*sin(a),top-.012) for a in [2*pi*k/20 for k in range(21)]]
        rod('니트 목둘레',collar,.010,col,5)

pale=['shirt','cream','sand','cream','blue','shirt','navy','rust']
darks=['navy','black','charcoal','olive','taupe','indigo','sand']
for i,x in enumerate([-.99,.90,2.44]):
    d=-.44 if i<2 else -.14
    rack(x,d,2.05)
    colors=pale if i<2 else darks
    for j in range(9):
        hanging(x,d+.84-j*.208,colors[(j+i*2)%len(colors)],(j+i)%3,j)
wall_colors=['shirt']*4+['cream']*3+['taupe']*3+['olive']*2+['charcoal']*3+['black']*5+['navy']*3
for j,col in enumerate(wall_colors):
    d=2.47-j*.225
    hanging(-2.57,d,col,j%3,j,1.77)

# Open three-tier entrance table. The raised toe, separate sole and boot shaft
# distinguish the stock silhouettes from the folded knitwear on adjacent trays.
TX,TD=-.14,1.83
group('BrownyardOak')
for xx in [-1.05,1.05]:
    for dd in [-.44,.44]:
        box('전면 진열대 다리',TX+xx,TD+dd,.05,.048,.048,1.04,'grain',.004)
for h in [.23,.56,1.055]:
    for s in [-1,1]:
        box('나무 진열대 긴 테',TX,TD+s*.44,h,2.16,.048,.055,'beech',.004,True)
        box('나무 진열대 짧은 테',TX+s*1.05,TD,h,.048,.88,.055,'beech',.004,True)
group('BrownyardDisplay')
for h in [.17,.50,.88]:
    for x in [-.70,0,.70]:
        box('흰 진열판',TX+x,TD,h,.673,.85,.022,'shelf',.008)
group('BrownyardGlass')
box('가구 투명 상판',TX,TD,1.078,2.085,.84,.015,'glass',.004)

def shoes(x,d,y,boots,col):
    group('BrownyardDisplay')
    for side in [-1,1]:
        cx=x+side*.075
        rings=[]
        for offset,w,height,base in [(-.144,.037,.072,.023),(-.115,.052,.082,.019),(-.052,.055,.093,.015),
                (.015,.061,.079,.012),(.094,.063,.052,.014),(.150,.048,.041,.021),(.169,.015,.029,.027)]:
            ring=[]
            for j in range(14):
                a=2*pi*j/14
                ring.append((cx+w*cos(a),d+offset,y+base+(.5+.5*sin(a))*height))
            rings.append(ring)
        skin('갑피',rings,col)
        # Separate rounded and slightly upturned outsole.
        outsole=[(cx+.064*cos(a)*(1+.13*sin(a)),d+.157*sin(a)+.006,
                  y+.006+.013*max(0,sin(a))**4) for a in [2*pi*j/24 for j in range(24)]]
        skin('둥근 밑창',[outsole,[(a,b,c+.017) for a,b,c in outsole]],'leather' if boots else 'sole')
        if boots:
            rings=[]
            for h,w in [(.060,.052),(.112,.055),(.175,.049),(.215,.046)]:
                rings.append([(cx+w*cos(a),d-.086+.050*sin(a),y+h) for a in [2*pi*j/16 for j in range(16)]])
            skin('앵클 부츠 목',rings,col)
            for sign in [-1,1]:
                panel=[(cx+sign*.048,d-.109,y+.104),(cx+sign*.048,d-.065,y+.116),
                       (cx+sign*.044,d-.067,y+.202),(cx+sign*.044,d-.103,y+.201)]
                m.piece('첼시 부츠 고무 밴드',panel,[(0,1,2,3)],'charcoal')
                rod('부츠 옆선 봉제',panel+[panel[0]],.0023,'leather',4)
            rod('뒷축 가죽 고리',[(cx,d-.126,y+.194),(cx,d-.137,y+.237),
                (cx,d-.144,y+.230),(cx,d-.138,y+.196)],.004,'leather',5)
            m.profile('부츠 입구',cx,d-.086,y+.213,[(.038,0),(.038,.002)],'black',16,1.08)
        else:
            for j in range(3):
                delta=j*.021
                rod('옅은 신발끈',[(cx-.040,d-.050+delta,y+.103-j*.005),(cx+.039,d-.029+delta,y+.096-j*.005)],.0038,'shirt',5)

def folded(x,d,z,col,knit=False):
    group('BrownyardCloth')
    for layer in range(2):
        box('접힌 옷 겹',x+.008*layer,d+.008*layer,z+.022*layer,.43,.33,.031,col,.012)
    if knit:
        for j in range(5):
            base=d-.13+j*.060
            for row in range(2):
                pts=[(x-.197+i*.0246,base+(.012 if i%2 else -.012)+row*.010,z+.055) for i in range(17)]
                band=[(a,b+.010,c+.0005) for a,b,c in pts]
                vertices=pts+band
                faces=[(i,i+1,18+i,17+i) for i in range(16)]
                m.piece('자카드 니트의 헤링본 띠',vertices,faces,'knitLight' if j%2 else 'knitDark')
        for side in [-1,1]:
            for k in range(25):
                xx=x-.198+k*.0165
                rod('접힌 니트의 잔 골',[(xx,d+side*.148,z+.054),(xx+.002,d+side*.159,z+.047)],
                    .0022,'knitLight' if k%3==0 else 'wool',4)
    else:
        rod('접힌 옷 가장자리',[(x-.20,d+.14,z+.050),(x+.20,d+.14,z+.050)],.004,col,5)

for a,d,h,boots,col in [(0,-.01,.902,False,'shoe'),(-.68,.01,.523,True,'blackboot'),
                         (.69,.02,.523,False,'tanboot'),(0,-.01,.194,True,'blackboot')]:
    shoes(TX+a,TD+d,h,boots,col)
for x,h,col,pattern in [(-.70,.902,'wool',True),(.70,.902,'taupe',False),(0,.523,'shirt',False),
                        (-.70,.194,'navy',False),(.70,.194,'wool',True)]:
    folded(TX+x,TD,h,col,pattern)
    if h==.523 and col=='shirt':
        # White shirt and narrow dark tie in the brand's middle shelf photo.
        c=TX+x
        for side in [-1,1]:
            p=[(c,TD-.094,h+.079),(c+side*.043,TD-.135,h+.070),
               (c+side*.082,TD-.086,h+.060),(c+side*.036,TD-.035,h+.061)]
            m.piece('접은 셔츠의 칼라',p,[(0,1,2,3)],'shirt')
        p=[(c-.016,TD-.088,h+.072),(c+.016,TD-.088,h+.072),
           (c+.029,TD+.125,h+.059),(c,TD+.155,h+.058),(c-.029,TD+.125,h+.059)]
        m.piece('검은 넥타이',p,[(0,1,2,3,4)],'black')

# The loose cream rug runs only below the entry fixture.
group('BrownyardCloth')
box('전면 러그',TX,TD,.041,2.68,1.54,.011,'rug',.005)
for k in range(3):
    offset=-.62+k*.40
    pts=[]
    for i in range(24):
        x=-1.30+i*2.6/23
        pts.append((TX+x,TD+offset+.075*cos(i*.65+k),.055))
    rod('러그 짙은 선직',pts,.0042,'knitDark',4)
for i in range(50):
    x=TX-1.3+2.6*i/49
    for s in [-1,1]:
        rod('러그 짧은 술',[(x,TD+s*.766,.049),(x+.015*sin(i*1.74),TD+s*(.798+.017*cos(i)),.045)],.0037,'rug',4)

for name,collection in groups.items():
    if name not in images:continue
    for obj in collection.objects:
        finishes.uv(obj.data,obj.matrix_world,name,obj.get('across_grain',False))
contact.bake([groups[k] for k in ['BrownyardOak','BrownyardCloth','BrownyardDisplay']])
contact.show_native([mat for name,mat in m.palette.items() if name not in ['logo','glow','glass']])
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'gallery.blend'),compress=True)
