"""Rebuild the editable Gangnam BOSS Golf display and its two runtime batches."""
import math
import os
import struct
import tempfile
import zlib
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
PI, TAU = math.pi, math.tau
sin, cos = math.sin, math.cos
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_7F_BOSS_GOLF')
bpy.context.scene.collection.children.link(gallery)
frame = Matrix.Identity(4)
groups = {'BossGolfGangnamTextiles': [], 'BossGolfGangnamFixtures': []}
palette = dict(white='f8f6f0', ivory='e8dfcb', chalk='fcfaf1', camel='b88a5c',
               sand='d5bf9d', ink='202122', black='13151a', grey='a5aaa9',
               knit='f5f1e8', wood='bf9871', brass='beb59c', edge='d6d2c4',
               mirror='a9b5b2', glint='e6ebe3', silver='b6b9a9', reflected='929681', lime='7a9e2b', resin='d9cbb0',
               leather='ebdfc5', zip='80796c', sole='c4bda8', shadow='544f49')

def place(x=0,y=0,z=0,degrees=0):
    global frame
    frame = Matrix.Translation((x,y,z)) @ Matrix.Rotation(math.radians(degrees),4,'Z')

def linear(i):
    v=int(i,16)/255
    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4

# One embedded atlas. Left half is neutral interlocking knit for tinting; right
# half carries the four large colour fields visible on the archived argyle top.
def knit_atlas():
    w,h=512,256
    data=bytearray()
    for r in range(h):
        data.append(0)
        v=1-r/(h-1)
        for col in range(w):
            u=(col%256)/255
            if col<256: base=(250,249,246)
            elif v>1-abs(u-.5)*1.63: base=(248,247,242)
            elif v<.93-abs(u-.5)*1.53 and v<.53-abs(u-.5)*1.32: base=(169,174,175)
            else: base=(223,215,199)
            wave=cos(TAU*(col/4+.33*abs((r%6)-3)))
            relief=.975+.019*wave+.008*cos(TAU*r/6)
            data.extend(max(0,min(255,round(c*relief))) for c in base)
    def chunk(k,b):
        return struct.pack('!I',len(b))+k+b+struct.pack('!I',zlib.crc32(k+b)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(data,9))+chunk(b'IEND',b'')
    with tempfile.TemporaryDirectory() as tmp:
        path=Path(tmp)/'boss-knit.png';path.write_bytes(png)
        img=bpy.data.images.load(str(path));img.pack();img.filepath='//boss-knit.png'
    return img

atlas=knit_atlas()
materials={}
def material(color,cloth):
    key=(color,cloth)
    if key in materials:return materials[key]
    m=bpy.data.materials.new(color+(' 직물' if cloth else ' 마감'));m.use_nodes=True
    shader=m.node_tree.nodes.get('Principled BSDF')
    rgb=tuple(linear(palette[color][i:i+2]) for i in (0,2,4))+(1,)
    m.diffuse_color=rgb
    shader.inputs['Base Color'].default_value=rgb
    shader.inputs['Roughness'].default_value=.78 if cloth else .42
    if cloth:
        tex=m.node_tree.nodes.new('ShaderNodeTexImage');tex.image=atlas
        mix=m.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY'
        mix.inputs[0].default_value=1;mix.inputs[1].default_value=rgb
        m.node_tree.links.new(tex.outputs['Color'],mix.inputs[2])
        m.node_tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    materials[key]=m
    return m

def mesh(name,verts,faces,color,cloth=False,smooth=False,uv=None):
    m=bpy.data.meshes.new(name)
    m.from_pydata(verts,[],faces);m.update()
    ob=bpy.data.objects.new(name,m);gallery.objects.link(ob);ob.matrix_world=frame
    m.materials.append(material(color,cloth))
    if smooth:m.polygons.foreach_set('use_smooth',[True]*len(m.polygons))
    if cloth:
        layer=m.uv_layers.new(name='편직')
        for p in m.polygons:
            for j in p.loop_indices:
                k=m.loops[j].vertex_index
                x,y,z=verts[k]
                layer.data[j].uv=uv[k] if uv else (.01+.47*((x*.9+y*.6+.5)%1),(.2+z*.9)%1)
    groups['BossGolfGangnamTextiles' if cloth else 'BossGolfGangnamFixtures'].append(ob)
    return ob

def skin(name,rings,color,cloth=False,smooth=True,uv=None,cap=True):
    n=len(rings[0]);faces=[]
    for k in range(len(rings)-1):
        for j in range(n):
            a=k*n+j;b=k*n+(j+1)%n
            faces.append((a,b,b+n,a+n))
    if cap:faces.extend([tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))])
    return mesh(name,sum(rings,[]),faces,color,cloth,smooth,uv)

def oval(name,levels,color,cloth=False,n=24,fold=0):
    rings=[]
    for z,rx,ry,x,y in levels:
        row=[]
        for i in range(n):
            a=TAU*i/n
            wav=1+fold*(cos(a*7+z*2)+.5*cos(a*5-z))
            row.append((x+rx*cos(a)*wav,y+ry*sin(a)*wav,z))
        rings.append(row)
    return skin(name,rings,color,cloth)

def box(name,x,y,z,w,d,h,c):
    rings=[[(x+sx*w/2,y+sy*d/2,zz) for sx,sy in [(-1,-1),(1,-1),(1,1),(-1,1)]] for zz in [z,z+h]]
    return skin(name,rings,c,smooth=False)

def tube(name,pts,r,c,cloth=False,n=8):
    rings=[]
    for i,p in enumerate(pts):
        t=(Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(i-1,0)])).normalized()
        ref=Vector((0,1,0)) if abs(t.y)<.9 else Vector((1,0,0))
        u=t.cross(ref).normalized();v=t.cross(u).normalized()
        rings.append([tuple(Vector(p)+r*(u*cos(TAU*j/n)+v*sin(TAU*j/n))) for j in range(n)])
    return skin(name,rings,c,cloth)

def panel(name,points,color,cloth=False):
    return mesh(name,points,[tuple(range(len(points)))],color,cloth)

font_path=os.environ.get('GTW_BOLD_FONT','/System/Library/Fonts/Supplemental/Arial Bold.ttf')
font=bpy.data.fonts.load(font_path) if Path(font_path).is_file() else bpy.data.fonts['Bfont'] if 'Bfont' in bpy.data.fonts else None
def letters(text,x,y,z,size,c,thickness=.001):
    curve=bpy.data.curves.new(text,'FONT');curve.body=text;curve.size=size;curve.align_x='CENTER'
    if font:curve.font=font
    curve.extrude=thickness;curve.resolution_u=3
    ob=bpy.data.objects.new(text,curve);gallery.objects.link(ob)
    bpy.context.view_layer.update()
    geo=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    label=bpy.data.objects.new(text,geo);gallery.objects.link(label)
    label.matrix_world=frame @ Matrix.Translation((x,y,z)) @ Matrix.Rotation(PI/2,4,'X')
    geo.materials.append(material(c,False));groups['BossGolfGangnamFixtures'].append(label)
    bpy.data.objects.remove(ob,do_unlink=True)

def rib(name,x,y,z,rx,ry,height,c):
    oval(name,[(z,rx*.985,ry*.98,x,y),(z+.004,rx,ry,x,y),(z+height,rx,ry,x,y)],c,True)

def ball(name,x,y,z,rx,ry,rz,c):
    oval(name,[(z+rz*sin(a),max(.001,rx*cos(a)),max(.001,ry*cos(a)),x,y)
               for a in [-PI/2,-1.12,-.75,-.39,0,.39,.75,1.12,PI/2]],c)

def visor(z,col='ink'):
    # Open crown with an inner sweatband. Vary band at temples and tip the peak.
    rings=[]
    for inner,h in [(False,0),(False,.056),(True,.056),(True,0),(False,0)]:
        row=[]
        for j in range(48):
            a=TAU*j/48;front=max(0,-sin(a))
            row.append(((.097-.005*inner)*cos(a),(.104-.005*inner)*sin(a),z+h*(.63+.37*front)+.01*sin(a)))
        rings.append(row)
    skin('바이저 머리띠와 안감',rings,col,True,cap=False)
    grid=[];faces=[];edge=[]
    for i in range(33):
        a=-PI/2+PI*i/32;dx=sin(a);forward=cos(a)
        for j in range(5):
            t=j/4;pt=(dx*(.094+.019*t),-.098*forward-t*(.012+.089*forward**1.35),
                       z-.012-.017*t+.018*forward-.009*dx*dx)
            grid.append(pt)
            if j==4:edge.append(pt)
        if i:
            for j in range(4):
                k=(i-1)*5+j;faces.append((k,k+5,k+6,k+1))
    mesh('바이저 곡선 챙',grid,faces,col,True,True)
    tube('챙 가장자리 파이핑',edge,.0022,'white',True,6)
    letters('BOSS',0,-.105,z+.013,.032,'white')
    # Knotted back tab with two hanging tails.
    for side in (-1,1):
        panel('뒤 조절 리본',[(side*.006,.1,z+.035),(side*.048,.127,z+.022),(side*.04,.135,z-.064),(side*.01,.119,z-.046)],col,True)

def bucket(z,col):
    oval('패딩 버킷햇 크라운',[(z+.011,.089,.097,0,0),(z+.072,.086,.09,0,0),(z+.09,.071,.074,0,0)],col,True)
    rings=[[(r*cos(TAU*i/32),r*1.05*sin(TAU*i/32),z+h+.003*cos(TAU*i/32*3)) for i in range(32)]
           for r,h in [(.124,-.018),(.121,-.013),(.107,.005),(.09,.026)]]
    skin('누빔 모자 챙',rings,col,True,cap=False)
    for radius,h in [(.116,-.005),(.107,.005),(.098,.015)]:
        tube('챙 누빔선',[(radius*cos(TAU*j/32),radius*1.05*sin(TAU*j/32),z+h+.003*cos(TAU*j/32*3)) for j in range(33)],.0009,'grey' if col=='ink' else 'sand',True,5)

def sleeves(z,c,body_width=.22,long=True):
    for s in [-1,1]:
        end=.035 if long else .29
        levels=[(end,.045,.044,s*(body_width+.071),-.027),(end+.035,.047,.048,s*(body_width+.07),-.024),
                (.31,.056,.063,s*(body_width+.04),-.004),(.46,.061,.074,s*body_width,.004),(.51,.049,.064,s*(body_width-.014),0)]
        oval('소매 주름',[(z+h,rx,ry,x,y) for h,rx,ry,x,y in levels],c,True,16,.027)
        rib('소매 시보리',s*(body_width+.07),-.027,z+end-.007,.047,.046,.035,c)

def shirt(z,c,style):
    # Shoulder and hem contours form a closed garment with front/back fullness.
    rows=[(0,.19,.06),(.034,.205,.067),(.09,.207,.069),(.25,.197,.074),(.41,.214,.083),(.48,.217,.076),(.52,.188,.067),(.555,.082,.055)]
    if style=='vest':rows=[(.007,.146,.097),(.046,.153,.106),(.14,.149,.111),(.26,.163,.13),(.37,.189,.136),(.46,.18,.115),(.51,.153,.085),(.53,.095,.063)]
    rings=[];uv=[];n=40
    for k,(h,w,d) in enumerate(rows):
        row=[]
        for j in range(n):
            a=TAU*j/n;fr=max(0,-sin(a));fold=.0035*cos(7*a+3*h)
            v=h/.555
            # Lower the front neck of the vest to expose the collared underlayer.
            cut=0
            px=(w+fold)*cos(a);py=(d+fold)*sin(a)
            if style=='vest' and k>=5:
                weight=(.23,.65,1)[k-5]
                cut=.106*max(0,1-abs(cos(a))) * weight if sin(a)<0 else 0
                py-=.046*fr**2*weight
            row.append((px,py,z+h-cut))
            uv.append((.507+.484*(.5+.49*cos(a)),.014+.968*v) if style=='argyle' else (.01+.47*(.5+.49*cos(a)),.015+.96*v))
        rings.append(row)
    skin('브이넥 니트 조끼' if style=='vest' else '편직 몸판',rings,c,True,uv=uv,cap=style!='vest')
    if style=='vest':
        # Connected bands follow the actual neckline including its back.
        for offset,radius,color in [(0,.005,'ink'),(.008,.0038,'camel')]:
            seam=[(px*1.018,py*1.027,h-offset) for px,py,h in rings[-1]]
            tube('브이넥 삼색 가장자리',seam+[seam[0]],radius,color,True)
        letters('B',.082,-.126,z+.343,.045,'ink')
        rib('조끼 밑단',0,0,z+.004,.15,.102,.044,c)
        return
    sleeves(z,c)
    rib('편직 허릿단',0,0,z,.194,.064,.035,c)
    if style=='polo':
        oval('폴로 목둘레',[(z+.535,.081,.055,0,0),(z+.579,.072,.052,0,0)],c,True)
        for s in [-1,1]:
            panel('접힌 폴로 칼라',[(s*.006,-.057,z+.564),(s*.078,-.018,z+.57),(s*.099,-.065,z+.511),(s*.052,-.082,z+.488)],c,True)
            for offset,col in [(0,'camel'),(.025,'white')]:
                panel('어깨 시그니처 줄무늬',[(s*(.114+offset),-.056,z+.543),(s*(.135+offset),-.051,z+.536),(s*(.139+offset),.047,z+.535),(s*(.116+offset),.048,z+.542)],col,True)
        tube('단추 여밈',[(0,-.061,z+.551),(0,-.084,z+.414)],.006,c,True)
        for i in range(3):ball('폴로 단추',0,-.071-i*.006,z+.523-i*.036,.005,.003,.005,'sand')
        letters('BOSS',.098,-.078,z+.395,.019,'ivory' if c=='ink' else 'ink')
    else:
        oval('라운드 립 칼라',[(z+.548,.085,.054,0,0),(z+.57,.075,.05,0,0)],c,True)
        if style=='argyle':letters('BOSS',0,-.084,z+.425,.018,'grey')

def pleats(z):
    rings=[]
    for h,w,d,amp in [(0,.251,.179,.023),(.016,.249,.178,.023),(.17,.222,.153,.017),(.30,.181,.127,.006),(.34,.161,.118,.002)]:
        row=[]
        for k in range(24):
            for frac,depth in [(0,0),(.67,0),(.72,-amp),(.87,-amp*.75)]:
                a=TAU*(k+frac)/24;row.append(((w+depth)*cos(a),(d+depth)*sin(a),z+h+.0025*cos(2*a)))
        rings.append(row)
    skin('스물네 겹 칼주름 스커트',rings,'white',True,False)
    rib('스커트 허리단',0,0,z+.32,.163,.118,.045,'white')

def mannequin():
    place(1.12,-1.18,.064,-14)
    for s in [-1,1]:
        # Turned ankles, calf, knee and thigh differ in section and posture.
        x=s*.087;y=s*.028
        oval('마네킹 다리',[(h,wx,wy,x+s*dx,y+dy) for h,wx,wy,dx,dy in [
            (.06,.037,.044,.025,0),(.16,.033,.042,.022,0),(.28,.05,.064,.02,.015),(.4,.057,.068,.015,.024),
            (.51,.05,.057,.008,-.009),(.55,.056,.064,.005,-.014),(.69,.074,.087,0,0),(.84,.087,.098,-.005,.015)]],'resin')
        oval('흰 골프화 밑창',[(.003,.053,.131,x+s*.024,y-.049),(.024,.055,.133,x+s*.024,y-.049)],'sole')
        oval('흰 골프화 갑피',[(.024,.055,.13,x+s*.024,y-.049),(.047,.052,.124,x+s*.024,y-.05),(.079,.04,.077,x+s*.024,y-.022),(.098,.037,.042,x+s*.024,y)],'chalk')
        for j in range(3):tube('골프화 끈',[(x-.002,y-.063-j*.014,.077-j*.006),(x+.044,y-.065-j*.014,.076-j*.006)],.0024,'ivory')
    pleats(.605)
    z=.938
    oval('이너 하이넥',[(z+.36,.148,.123,0,0),(z+.46,.148,.079,0,0),(z+.51,.096,.063,0,0),(z+.55,.063,.06,0,0),(z+.58,.063,.061,0,0)],'chalk',True)
    sleeves(z,'chalk',.174);shirt(z,'white','vest')
    for s in [-1,1]:
        oval('손목과 손',[(z-.091,.02,.024,s*.248,-.033),(z-.066,.03,.026,s*.247,-.037),(z-.013,.031,.028,s*.245,-.032),(z+.045,.026,.028,s*.245,-.023)],'resin',n=16)
        ball('마네킹 엄지',s*.219,-.048,z-.037,.014,.014,.03,'resin')
    oval('마네킹 목과 얼굴',[(1.486,.055,.052,0,0),(1.53,.054,.052,0,0),(1.543,.047,.067,0,-.016),
         (1.575,.072,.082,0,-.014),(1.628,.092,.097,0,-.004),(1.696,.093,.10,0,0),
         (1.745,.084,.089,0,.004),(1.777,.057,.069,0,.005),(1.791,.014,.021,0,.005)],'resin',n=32)
    for side in (-1,1):ball('마네킹 귀',side*.087,.002,1.627,.013,.018,.027,'resin')
    visor(1.683)

def hanger(z):
    tube('금속 옷걸이 훅',[(0,0,z),(.02,0,z+.025),(.026,0,z+.049),(.015,0,z+.064),(-.005,0,z+.066),(-.02,0,z+.052),(-.018,0,z+.033)],.0036,'brass')
    tube('목재 옷걸이',[(-.203,0,z-.076),(-.17,0,z-.047),(-.062,0,z-.013),(0,0,z),(.062,0,z-.013),(.17,0,z-.047),(.203,0,z-.076)],.014,'wood')

# Rear sales wall and its polished frame. All merchandise faces Blender -Y.
place()
box('아이보리 매장 배경',0,.205,.04,5.35,.12,2.75,'ivory')
box('거울 금속 테두리',-.91,.125,.11,.81,.07,2.46,'brass')
box('거울 회녹색 면',-.91,.081,.13,.77,.023,2.42,'mirror')
# The mirror shows pale ceiling courses, light strips and a distant rail.
for h,col in [(1.96,'silver'),(2.16,'edge'),(2.33,'silver')]:
    panel('거울 속 천장선',[(-1.28,.066,h),(-.54,.066,h+.101),(-.54,.066,h+.125),(-1.28,.066,h+.024)],col)
for j in range(5):
    hx=-1.24+j*.16
    box('거울 속 천장 조명',hx,.061,2.25+j*.021,.043,.004,.008,'glint')
for j in range(6):
    hx=-1.20+j*.105; h=1.18+.045*cos(2*j)
    panel('거울 속 행거 실루엣',[(hx-.035,.064,h-.29),(hx+.032,.064,h-.29),(hx+.04,.064,h-.035),(hx,.064,h),(hx-.037,.064,h-.032)],'reflected')
box('거울 속 행거봉',-.93,.062,1.24,.72,.004,.011,'silver')
for text,h,size in [('BOSS',2.02,.32),('GOLF',1.888,.099)]:
    letters(text,.93,.132,h,size*1.033,'chalk',.002)
    letters(text,.93,.121,h,size,'lime',.005)
# Low shelf for the soft, round-brimmed hats just under the rear wordmark.
box('모자 벽선반',1.46,-.055,1.45,1.32,.39,.035,'chalk')
for x,col in [(1.12,'ink'),(1.73,'white')]:
    place(x,-.07,1.49,-12 if col=='ink' else 18);bucket(.024,col)

def trousers(z,c):
    # Paired tapered legs with subtle pressed creases and an actual crotch.
    for side in (-1,1):
        levels=[(0,.062,.041,.079),(.025,.062,.040,.078),(.20,.063,.042,.079),
                (.40,.070,.054,.073),(.64,.082,.055,.073),(.77,.084,.058,.068)]
        oval('슬랙스 바짓가랑이',[(z+h,w,d,side*x,.008*sin(h*4)) for h,w,d,x in levels],c,True,16,.015)
        tube('슬랙스 중앙 주름',[(side*.08,-.041,z+.02),(side*.076,-.047,z+.31),(side*.069,-.054,z+.64)],.0017,c,True,5)
    oval('슬랙스 허리',[(z+.67,.154,.061,0,0),(z+.765,.157,.065,0,0),(z+.806,.144,.058,0,0)],c,True)
    rib('벨트 허릿단',0,0,z+.786,.148,.059,.026,c)
    for side in (-1,1):
        box('옷걸이 집게',side*.113,-.005,z+.805,.026,.027,.043,'brass')
    tube('바지걸이', [(-.137,0,z+.836),(.137,0,z+.836)],.005,'brass')

def rail(cx,cy,width,styles):
    place(cx,cy)
    box('행거 섀도 밑판',0,0,.01,width-.06,.43,.045,'shadow')
    box('샴페인 금속 받침',0,0,.049,width,.49,.052,'brass')
    for s in [-1,1]:box('사각 단면 행거 기둥',s*(width/2-.056),0,.098,.028,.032,1.47,'brass')
    box('금속 행거 가로봉',0,0,1.565,width-.085,.03,.029,'brass')
    for pos,angle,c,style in styles:
        place(cx+pos,cy,.0,angle);hanger(1.516)
        if style=='trousers':trousers(.622,c)
        else:shirt(.951,c,style)

rail(-.71,-1.06,1.91,[(-.64,-12,'white','argyle'),(-.27,66,'white','plain'),(-.091,69,'white','polo'),
      (.085,60,'ink','plain'),(.279,61,'ink','trousers'),(.47,66,'white','trousers'),(.68,43,'ink','polo')])
rail(-1.99,-.22,.96,[(-.21,18,'camel','polo'),(.132,67,'chalk','plain'),(.31,65,'ink','plain')])
place()
box('마네킹 받침',1.12,-1.18,0,.66,.61,.061,'edge')
mannequin()

# The branch photograph shows the small cream carry bag on the honey-coloured
# base of the second rail. Raised handles and side gussets survive a side view.
place(-2.06,-.47,.105,-10)
def handbag():
    oval('미니백 보강 바닥',[(0,.177,.074,0,0),(.018,.185,.078,0,0)],'camel',n=32)
    def rim(z,w,d):
        return [(w*math.copysign(abs(cos(a))**.40,cos(a)),d*math.copysign(abs(sin(a))**.45,sin(a)),z) for a in (TAU*j/32 for j in range(32))]
    skin('미니백 옆면과 거싯',[rim(.015,.18,.072),rim(.056,.185,.075),rim(.155,.167,.065),rim(.174,.153,.057)],'leather')
    for h,c in [(.037,'camel'),(.048,'black')]:skin('가방 삼색 띠',[rim(h,.185,.076),rim(h+.009,.185,.076)],c,cap=False)
    for side in [-1,1]:
        tube('가죽 손잡이',[(.079*cos(PI*j/16),side*.052,.163+.099*sin(PI*j/16)) for j in range(17)],.007,'camel')
        for sign in [-1,1]:
            tube('손잡이 고정 탭',[(sign*.079,side*.056,.173),(sign*.079,side*.067,.131)],.008,'camel')
    letters('BOSS',0,-.074,.087,.048,'black')
    tube('상단 지퍼',[(-.145,0,.175),(0,0,.179),(.145,0,.175)],.003,'zip')
handbag()

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
print('EDITABLE',len(gallery.objects))
for group,objects in groups.items():
    cloth=group.endswith('Textiles')
    runtime=bpy.data.materials.new(group);runtime.use_nodes=True
    tree=runtime.node_tree;shader=tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.78 if cloth else .43
    colors=tree.nodes.new('ShaderNodeVertexColor');colors.layer_name='색상'
    if cloth:
        tex=tree.nodes.new('ShaderNodeTexImage');tex.image=atlas
        mix=tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
        tree.links.new(tex.outputs['Color'],mix.inputs[1]);tree.links.new(colors.outputs['Color'],mix.inputs[2])
        tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    else:tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        m=ob.data;rgba=m.materials[0].diffuse_color[:]
        attr=m.color_attributes.new(name='색상',type='BYTE_COLOR',domain='POINT')
        attr.data.foreach_set('color',rgba*len(m.vertices))
        m.materials.clear();m.materials.append(runtime);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
    bpy.context.object.name=group
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
