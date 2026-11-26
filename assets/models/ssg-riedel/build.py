"""Baccarat Gangnam. Metres, X right, +Y away from viewer, Z up."""
import bpy
import math
from pathlib import Path
from math import cos, sin, pi
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
collection = bpy.data.collections.new('SSG_9F_Baccarat')
scene.collection.children.link(collection)

def linear(hexcode):
    rgb = [int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb)+(1,)

def finish(name, roughness, alpha=1, metallic=0, luminous=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    p = mat.node_tree.nodes.get('Principled BSDF')
    tint = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    tint.layer_name = 'Tint'
    mat.node_tree.links.new(tint.outputs['Color'],p.inputs['Base Color'])
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    if alpha < 1:
        p.inputs['Alpha'].default_value = alpha
        mat.blend_method = 'BLEND'
    if luminous:
        socket = p.inputs.get('Emission Color') or p.inputs['Emission']
        mat.node_tree.links.new(tint.outputs['Color'],socket)
        p.inputs['Emission Strength'].default_value = .85
    return mat

wood = finish('BaccaratCabinet',.42)
metal = finish('BaccaratSilver',.22,metallic=.44)
crystal = finish('BaccaratCrystal',.12,.73,.16)
light = finish('BaccaratLight',.22,luminous=True)
colors = {}
def item(name, vertices, faces, mat, palette):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.materials.append(mat)
    obj = bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    attr = data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='CORNER')
    for p in data.polygons:
        code = palette(p.index) if callable(palette) else palette
        if code not in colors: colors[code] = linear(code)
        for i in p.loop_indices: attr.data[i].color = colors[code]
    return obj

def box(name,x,y,z,w,d,h,color,mat=wood):
    vs=[(x+i*w/2,y+j*d/2,z+k*h) for k in [0,1] for j in [-1,1] for i in [-1,1]]
    fs=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)]
    return item(name,vs,fs,mat,color)

# The cut bell has six broad scallops. Blend circular rings into a hexagon,
# and vary the height of the shoulder across each cut to make its arched lip.
clear=['f2eeeb','a6b5be','526471','e9f5fa','9cabb7','fcfafd','78858d','cbdbe2']
ruby=['8a1230','be2743','591328','ed5a67','9e1631','ed9091','7c1933','bb364d']
green=['206051','419477','154f42','84b9a0','286f55','a1c3a3','235d46','4c997b']
def vessel(name,x,y,z,rings, palette=clear, n=30, mat=crystal, scale=1, caps=True):
    vs=[]; fs=[]
    for height,radius,*shape in rings:
        hexmix,arch=(shape+[0,0])[:2]
        for j in range(n):
            t=2*pi*j/n
            phase=(t+pi/6)%(pi/3)-pi/6
            hexr=cos(pi/6)/cos(phase)
            r=scale*radius*(1+hexmix*(hexr-1))
            h=scale*(height+arch*cos(phase*3)**2)
            vs.append((x+r*cos(t),y+r*sin(t),z+h))
    for i in range(len(rings)-1):
        for j in range(n):
            a=i*n+j;b=i*n+(j+1)%n
            fs.append((a,b,b+n,a+n))
    if caps: fs += [tuple(reversed(range(n))),tuple(range(len(vs)-n,len(vs)))]
    def facet(index):
        row,j=divmod(index,n)
        # Broad highlights sit beside narrow dark bevels. Reverse and offset
        # the bands at changes of slope, like reflected strips on a cut facet.
        return palette[(j//max(1,n//16)+ (row//2 if row<8 else row)*3)%len(palette)]
    return item(name,vs,fs,mat,facet)

foot=[(0,.039,1),(.003,.042,1),(.006,.041,1),(.009,.026,1),(.015,.014,1),(.019,.009,1),(.032,.008,1),(.037,.012,1),(.044,.018,1),(.048,.018,1),(.055,.011,1),(.063,.009,1)]
def goblet(x,y,z,kind='잔',palette=clear):
    flute=kind=='플루트'
    stem=foot if not flute else [(h*1.36,r*.86,m) for h,r,m in foot]
    rings=([(0.088,.011,1),(.103,.016,1),(.145,.022,1,.028),(.208,.027),(.213,.027),(.213,.0255),(.202,.025),(.14,.020),(.103,.010)]
           if flute else [(.070,.018,1),(.080,.025,1),(.105,.036,1,.014),(.129,.042,.73,.019),(.149,.0455),(.157,.046),(.157,.0445),(.147,.044),(.119,.038),(.090,.024),(.081,.010)])
    vessel(kind+' 육각 굽과 마디',x,y,z,stem)
    vessel(kind+' 오목 컷 볼',x,y,z,rings,palette)
    # A short lower bowl connects to the uppermost stem facet.
    h,r,_=stem[-1]
    vessel('받침 접합',x,y,z,[(h,r,1),rings[0]],palette)

def decanter(x,y,z):
    profile=[(0,.046,1),(.005,.050,1),(.018,.052,1),(.042,.058,.95,.014),(.081,.063,.78,.024),(.113,.063,.35),(.144,.059,.7,.019),(.174,.045,1,.017),(.202,.029,.9),(.218,.022,1),(.224,.027,1),(.230,.032,1),(.236,.029,1),(.241,.020,1),(.268,.019,1),(.277,.025),(.280,.031),(.284,.031),(.284,.016),(.274,.015)]
    vessel('아르쿠르 디캔터 몸체',x,y,z,[(h*.90,r,*s) for h,r,*s in profile])
    vessel('다이아몬드 마개',x,y,z+.248,[(0,.011,1),(.021,.010,1),(.033,.017,1),(.040,.037,1),(.044,.036,1),(.051,.025,1),(.054,.021,1)])

def tumbler(x,y,z,palette=clear):
    vessel('두꺼운 굽의 컷 텀블러',x,y,z,[(0,.035,1),(.007,.036,1),(.019,.037,1),(.044,.039,1,.021),(.077,.041,.9,.012),(.099,.043),(.099,.0405),(.087,.040),(.026,.030)],palette)

def plate(x,y,z):
    vessel('흰 접시와 금색 테두리',x,y,z,[(0,.069),(.003,.077),(.010,.10),(.018,.121),(.021,.122),(.021,.114),(.010,.084)],['f7efe4','f9f5ef','e8dfd0'],n=36,mat=wood)
    vessel('접시 금선',x,y,z+.020,[(0,.121),(.001,.122),(.002,.121)],['c7a269'],n=36,mat=metal,caps=False)

black='332b2a';white='f2ece2';gold='c6a573';red='ae1831'
# Low contrasting floor inset, entirely within the customer display footprint.
for i in range(6):
    for j in range(5):
        box('격자 바닥', (i-2.5)*.47,-.60-(j*.47),.018,.47,.47,.010,'3c3c40' if (i+j)%2 else 'ede8e0')
# Picture-frame wall, flanking backlit vitrines and a sunburst mirror.
box('크림색 패널',0,.33,.03,3.18,.12,2.53,white)
for sx in [-1,1]:
    x=sx*1.05
    box('진열장 하부',x,.12,.03,.91,.51,.57,black)
    box('금속 받침',x,.12,.10,.94,.52,.014,gold,metal)
    box('진열장 배면',x,.23,.60,.91,.085,1.72,'999592',metal)
    for z in [.95,1.48,2.05]:
        box('선반 뒤의 확산 조명',x,.181,z,.83,.012,.088,'f9edd9',light)
    for offset in [-.45,.45]:
        box('은색 세로 프레임',x+offset,.10,.60,.027,.40,1.75,'c0bbbb',metal)
    for z in [.60,1.13,1.66,2.27]:
        box('은빛 진열 선반',x,.09,z,.91,.46,.030,'b6b9b7',metal)
        box('간접 조명',x,-.146,z+.014,.85,.012,.009,'fff0d3',light)
    for j in range(3):
        a=x+(j-1)*.235
        goblet(a,.045,.63,'잔',ruby if sx<0 else clear)
        if j==1: decanter(a,.06,1.16)
        else: tumbler(a,.05,1.16)
        goblet(a,.04,1.69,'플루트',green if sx>0 else clear)

# Radial, faceted glass batons around a silver centre, as in the branch photo.
def mirror():
    cx=0;cy=.22;cz=1.72
    vs=[];fs=[]
    for j in range(40):
        t=j*2*pi/40
        length=.384 if j%2==0 else .32
        def ray(r,w,depth):
            return (cx+r*cos(t)-w*sin(t),cy-depth,cz+r*sin(t)+w*cos(t))
        b=len(vs)
        vs += [ray(.125,-.012,0),ray(length-.023,-.013,0),ray(length,0,.011),ray(length-.023,.013,0),ray(.125,.012,0),ray(.19,0,.033)]
        fs.extend([(b+i,b+(i+1)%5,b+5) for i in range(5)])
    item('방사형 거울 유리살',vs,fs,metal,lambda i:clear[(i%5+2*(i//5))%8])
    for radius,color,depth in [(.147,gold,.016),(.13,'a1adaf',.024)]:
        vs=[(cx+radius*cos(t*2*pi/48),cy-depth,cz+radius*sin(t*2*pi/48)) for t in range(48)]
        item('거울 원반',vs,[tuple(range(48))],metal,color)
mirror()
for x in [-.52,.52]:
    box('액자 몰딩 세로',x,.253,1.04,.019,.035,1.45,'d6c9bb')
for z in [1.04,2.47]:
    box('액자 몰딩 가로',0,.253,z,1.05,.035,.019,'d6c9bb')
# Three customer-facing sides of a dark lacquer table, brass line under lip.
ty=-1.78
box('식탁 상판',0,ty,.815,1.88,.88,.065,black)
box('황동 상감',0,ty,.835,1.883,.883,.006,gold,metal)
box('식탁 하부 틀',0,ty,.74,1.74,.75,.08,black)
for x in [-.83,.83]:
    for y in [ty-.33,ty+.33]:
        box('식탁 다리',x,y,.028,.07,.07,.72,black)
top=.88
for x in [-.54,.53]:
    plate(x,ty-.15,top)
    # Folded linen, alternating raised and recessed pleats around a narrow base.
    vv=[(x-.045,ty-.19,top+.023)]
    for j in range(11):
        t=-.73+j*.146
        vv.append((x-.045+.15*cos(t),ty-.19+.15*sin(t),top+.030+(j%2)*.018))
    item('부채꼴로 접은 냅킨',vv,[(0,i,i+1) for i in range(1,11)],wood,
         lambda i:'f6f0e4' if i%2==0 else 'ded3bf')
    for k in [-1,1]:
        a=x+k*.15
        box('커틀러리 손잡이',a,ty-.18,top,.012,.105,.009,'b8b7b1',metal)
        if k>0:box('나이프 날',a,ty-.106,top,.017,.066,.006,'e0ddd5',metal)
        else:
            for d in [-.006,0,.006]:box('포크 끝',a+d,ty-.10,top,.003,.055,.006,'e0ddd5',metal)
    goblet(x-.095,ty+.126,top,'잔',green)
    goblet(x+.075,ty+.106,top,'플루트')
decanter(-.15,ty-.04,top)
goblet(.04,ty-.18,top,'잔',ruby)
tumbler(-.26,ty-.25,top)
# Photo ③: red conical lamp shade and clear, stepped stem.
vessel('스탠드 크리스털 받침',.19,ty+.16,top,[(0,.086,1),(.009,.083,1),(.018,.072,1),(.036,.04,1),(.047,.029,1),(.065,.032,1),(.084,.019,1),(.16,.016,1),(.183,.031,1),(.197,.025,1),(.217,.021,1),(.245,.028,1)])
vessel('루비색 스탠드 갓',.19,ty+.16,top,[(.22,.111),(.224,.113),(.364,.077),(.369,.075),(.368,.072),(.355,.073)],ruby,n=36)
# A small red plaque identifies the brand above the mirror.
box('붉은 상표 패널',0,.219,2.18,.69,.035,.266,red)
font=bpy.data.curves.new('Baccarat','FONT')
font.body='Baccarat';font.align_x='CENTER';font.align_y='CENTER';font.size=.174;font.resolution_u=4
font_path=Path('/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf')
if font_path.exists():font.font=bpy.data.fonts.load(str(font_path))
letter=bpy.data.objects.new('Baccarat',font);collection.objects.link(letter)
letter.location=(0,.198,2.309);letter.rotation_euler.x=pi/2
bpy.context.view_layer.objects.active=letter;letter.select_set(True);bpy.ops.object.convert(target='MESH')
letter.data.materials.append(light)
attr=letter.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='CORNER')
for entry in attr.data:entry.color=(1,1,1,1)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
exec(compile((OUT/'export.py').read_text(),str(OUT/'export.py'),'exec'))
