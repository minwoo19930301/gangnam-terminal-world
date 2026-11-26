"""카테고릭 강남점 브루잉 바. +Y는 카운터 안쪽, +Z는 위."""
from pathlib import Path
from math import cos, sin, pi, sqrt
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_Categorique')
bpy.context.scene.collection.children.link(col)
rng = Random(6737)
tau = 2*pi

def finish(name, value, batch='CategoriqueBrewingBar'):
    vals = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba
    p.inputs['Roughness'].default_value=.29 if batch=='CategoriqueGlaze' else .58
    m['batch']=batch
    return m

def mesh(name,vs,fs,mat,smooth=False):
    me=bpy.data.meshes.new(name)
    me.from_pydata(vs,[],fs)
    me.materials.append(mat)
    for p in me.polygons:p.use_smooth=smooth
    obj=bpy.data.objects.new(name,me)
    col.objects.link(obj)
    return obj

def rings(name,loops,mat,smooth=True,cap=True):
    n=len(loops[0])
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(len(loops)-1) for j in range(n)]
    if cap:faces.extend([tuple(reversed(range(n))),tuple(range(n*(len(loops)-1),n*len(loops)))])
    return mesh(name,[p for row in loops for p in row],faces,mat,smooth)

def turn(name,x,y,z,profile,mat,n=48,band=False):
    if band:profile=[*profile,profile[0]]
    return rings(name,[[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z+h) for i in range(n)] for r,h in profile],mat,cap=not band)

def panel(name,x,y,z,w,d,h,mat,rad=.012):
    r=min(rad,w/2-.0001,d/2-.0001)
    def outline(shrink,high):
        v=[]
        for corner,(sx,sy) in enumerate(((1,1),(-1,1),(-1,-1),(1,-1))):
            for i in range(5):
                a=(corner+i/4)*pi/2
                v.append((x+sx*(w/2-r)+(r-shrink)*cos(a),y+sy*(d/2-r)+(r-shrink)*sin(a),z+high))
        return v
    b=min(r/3,h/4,.005)
    return rings(name,[outline(b,0),outline(0,b),outline(0,h-b),outline(b,h)],mat,False)

def tube(name,points,r,mat,n=8):
    loops=[]
    for i,p in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        v=tangent.cross(Vector((1,0,0)) if abs(tangent.x)<.85 else Vector((0,1,0))).normalized()
        w=tangent.cross(v)
        loops.append([Vector(p)+r*(v*cos(tau*j/n)+w*sin(tau*j/n)) for j in range(n)])
    return rings(name,loops,mat)

def oval(name,x,y,z,rx,ry,rz,mat,n=24,k=9,rough=0):
    loops=[]
    for j in range(k+1):
        a=-pi*.495+pi*.99*j/k
        row=[]
        for i in range(n):
            t=tau*i/n
            r=1+rough*(rng.random()-.5)
            row.append((x+rx*cos(a)*cos(t)*r,y+ry*cos(a)*sin(t)*r,z+rz*sin(a)*r))
        loops.append(row)
    return rings(name,loops,mat)

from math import atan2
black=finish('먹색 도장','272923','CategoriqueGlaze')
dark=finish('흑연색','393b36')
white=finish('유백색 도기','f6efe2','CategoriqueGlaze')
steel=finish('헤어라인 스테인리스','b9b8ad','CategoriqueMetal')
gold=finish('구릿빛 금속','bc8a55','CategoriqueMetal')
bright=finish('반사 테두리','dedacb','CategoriqueMetal')
coffee=finish('커피','40261c','CategoriqueGlaze')
foam=finish('우유 크림','efd8b5','CategoriqueGlaze')
timber=finish('꿀빛 나뭇결','ffffff','CategoriqueAsh')
stone=finish('회갈색 석기','b6b1a1')
leather=finish('올리브색 가죽','5b5845','CategoriqueGlaze')
cream=finish('마스카르포네','f5dec2')
cake=finish('커피 비스퀴','7a5038')
cocoa=finish('코코아','593526')
glass=finish('옅은 연녹색 유리','bdd0c8','CategoriqueGlass')
light=finish('조명 안쪽','ffe9ab','CategoriqueLight')
def shader(m):return m.node_tree.nodes.get('Principled BSDF')
for m in (steel,gold,bright):
    shader(m).inputs['Metallic'].default_value=.55
    shader(m).inputs['Roughness'].default_value=.29
glass.blend_method='BLEND'
shader(glass).inputs['Alpha'].default_value=.45
shader(glass).inputs['Roughness'].default_value=.12
shader(light).inputs['Emission Color' if bpy.app.version >= (4,0,0) else 'Emission'].default_value=(1,.76,.39,1)
shader(light).inputs['Emission Strength'].default_value=.7
tex=timber.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=bpy.data.images.load(str(OUT/'ash.jpg'));tex.image.pack()
timber.node_tree.links.new(tex.outputs['Color'],shader(timber).inputs['Base Color'])
def grain(obj,angle=0):
    uv=obj.data.uv_layers.new(name='목리 방향')
    for loop in obj.data.loops:
        x,y,z=obj.data.vertices[loop.vertex_index].co
        uv.data[loop.index].uv=((x*cos(angle)+y*sin(angle))*.59,(-x*sin(angle)+y*cos(angle)+z)*1.34)
    return obj

def footprint(name,outline,z,h,material):
    return rings(name,[[(x,y,z+s) for x,y in outline] for s in (0,h)],material,False)
# Mitred counter, including the return on each end. Pale work deck sits
# below the customer edge so the silhouettes of the drippers remain visible.
front=[(-1.48,-.59),(1.48,-.59),(2.15,-.13),(2.15,.76),(-2.15,.76),(-2.15,-.13)]
footprint('검은 바 받침',[(x*.96,y*.95) for x,y in front],.065,.895,black)
footprint('낮은 걸레받이',[(x*.92,y*.9) for x,y in front],.012,.055,dark)
footprint('브루잉 작업면',front,.954,.029,steel)
outer=[(-2.22,.8),(-2.22,-.18),(-1.51,-.68),(1.51,-.68),(2.22,-.18),(2.22,.8)]
inner=[(-1.88,.8),(-1.88,.006),(-1.403,-.338),(1.403,-.338),(1.88,.006),(1.88,.8)]
for i in range(5):
    pts=[outer[i],outer[i+1],inner[i+1],inner[i]]
    a=atan2(pts[1][1]-pts[0][1],pts[1][0]-pts[0][0])
    grain(footprint('연귀이음 원목 상판',pts,.984,.073,timber),a)
# Rear wall compresses the public display shelf and sign into the guide bay.
panel('배경 판재',0,.90,0,4.43,.065,2.93,stone)
panel('천장 캐노피',0,.19,2.947,4.46,1.56,.14,white)
panel('먹색 상호 띠',0,-.555,2.845,4.47,.10,.32,black)
mirror=finish('거울에 비친 그늘','686b65','CategoriqueMetal')
for side in (-1,1):
    panel('뒤쪽 스테인리스 패널',side*.69,.847,1.09,1.35,.032,1.54,steel)
    panel('천장 몰딩 반사',side*.69,.825,2.17,1.34,.008,.104,bright)
    panel('패널 아래 그림자',side*.69,.823,1.09,1.34,.014,.035,mirror)
    panel('목재 블라인드 배경',side*1.81,.835,.98,.73,.041,1.83,dark)
    for j in range(23):
        cx=side*1.81
        grain(footprint('블라인드 가로살',[(cx-.36,.783),(cx+.36,.783),(cx+.36,.814),(cx-.36,.814)],1.07+j*.073,.049,timber))
    panel('블라인드 수직줄',side*1.77,.781,1.07,.008,.006,1.66,gold,.002)
fontfile=Path('/System/Library/Fonts/Supplemental/Georgia.ttf')
font=bpy.data.fonts.load(str(fontfile)) if fontfile.exists() else bpy.data.fonts.get('Bfont')
def lettering(name,word,x,y,z,size,m):
    curve=bpy.data.curves.new(name,'FONT');curve.body=word;curve.font=font
    curve.align_x='CENTER';curve.align_y='CENTER';curve.size=size;curve.resolution_u=4
    ob=bpy.data.objects.new(name,curve);col.objects.link(ob);ob.location=(x,y,z);ob.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=ob;ob.select_set(True);bpy.ops.object.convert(target='MESH')
    ob.data.materials.append(m);ob.select_set(False)
    return ob

def cup_mark(name,cx,cy,z,radius,color):
    ob=lettering(name,'Categorique',cx,cy-radius,z,.011,color)
    for vertex in ob.data.vertices:
        a=vertex.co.x/radius
        vertex.co.x=radius*sin(a)
        vertex.co.z+=radius*(cos(a)-1)
lettering('카테고릭 상호','Categorique',0,-.607,3.001,.265,white)
for sx in (-1.38,1.38):
    grain(panel('벽 선반',sx,.70,1.78,1.42,.28,.046,timber))
    for i in range(6):
        turn('잔 보관 선반',sx-.49+i*.18,.66,1.826,[(.029,0),(.042,.061),(.044,.066),(.039,.066),(.036,.053)],white,24)
# Four black enamel shades, turned silver socket and the broad central drum.
def pendant(x,y,z):
    turn('검은 갓',x,y,z,[(.176,.0),(.18,.012),(.167,.084),(.138,.147),(.088,.218),(.066,.243),(.06,.258)],black,48)
    turn('황백색 반사판',x,y,z-.002,[(.171,0),(.169,.003)],light,40)
    turn('소켓 은색 칼라',x,y,z+.25,[(.068,0),(.071,.014),(.058,.022),(.058,.071),(.063,.081),(.038,.092)],steel,32)
    tube('조명 줄',[(x,y,z+.34),(x,y,2.96)],.006,dark)
    turn('천장 접시',x,y,2.92,[(.038,0),(.052,.015),(.052,.029)],black,20)
for sx in (-1.62,1.62):
    pendant(sx,-.18,2.06);pendant(sx*.74,.39,2.16)
turn('중앙 원통 조명',0,.18,2.23,[(.48,0),(.506,.012),(.513,.029),(.513,.316),(.49,.33)],steel,64)
turn('중앙 원통 안쪽',0,.18,2.226,[(.479,0),(.49,.003)],gold,56)
# Five-place pour-over machine: hollow brew window, fluted bowls, decanters.
base=.984;mx=.19;my=.04
panel('추출기 물받이',mx,my,base,.90,.22,.032,steel)
for side in (-.432,.432):
    panel('추출기 측판',mx+side,my,base+.023,.041,.211,.447,steel)
panel('추출 레일',mx,my,base+.345,.89,.206,.126,steel)
panel('레일 아래 접힘',mx,my-.099,base+.345,.89,.015,.012,mirror,.004)
panel('레일 광택 테두리',mx,my-.102,base+.456,.89,.005,.007,bright,.002)
for side in (-.432,.432):
    panel('옆판 음영',mx+side+.013,my-.107,base+.035,.009,.006,.419,mirror,.002)
panel('드리퍼 받침 선반',mx,my,base+.147,.848,.178,.013,dark)
lettering('브루어 명판','P O U R S T E A D Y',mx,my-.105,base+.407,.031,dark)
def round_handle(name,x,y,z,r,mat):
    tube(name,[(x+r*cos(pi/2-i*pi/18),y,z+r*sin(pi/2-i*pi/18)) for i in range(19)],.004,mat)
for i in range(5):
    x=mx+(i-2)*.160
    turn('유리 서버',x,my,base+.033,[(.037,0),(.05,.007),(.052,.022),(.036,.081),(.037,.091),(.032,.091),(.031,.083)],glass,32)
    turn('서버 안 커피',x,my,base+.036,[(.036,0),(.047,.007),(.046,.032)],coffee,24)
    round_handle('서버 손잡이',x+.036,my,base+.090,.028,dark)
    turn('드리퍼 굽',x,my,base+.16,[(.039,0),(.047,.004),(.046,.009),(.021,.013)],steel,28)
    loops=[]
    for radius,h,rib,twist in [( .019,.012,0,0),(.024,.022,.001,0),(.060,.092,.003,.12),(.064,.099,.003,.14),(.059,.100,0,.14),(.019,.025,0,0)]:
        loops.append([(x+(radius+rib*cos(16*tau*j/64))*cos(tau*j/64+twist),my+(radius+rib*cos(16*tau*j/64))*sin(tau*j/64+twist),base+.16+h) for j in range(64)])
    rings('나선 주름 드리퍼',loops,bright)
    for j in range(12):
        a=tau*j/12
        tube('드리퍼 주름 음영',[(x+r*cos(a+t),my+r*sin(a+t),base+.16+h) for r,t,h in [(.025,0,.023),(.043,.065,.059),(.061,.12,.093)]],.0015,mirror,5)
# Two copper stands with pear-shaped glass reservoirs and crossed supports.
for x in (-1.37,-.92):
    y=.085
    turn('추출 스탠드 밑판',x,y,base,[(.100,0),(.102,.014),(.091,.021)],gold,28)
    for j in range(3):
        a=j*tau/3
        tube('꼬인 동제 지주',[(x+.093*cos(a),y+.093*sin(a),base+.018),(x+.073*cos(a+2.1),y+.073*sin(a+2.1),base+.58)],.006,gold)
    for h in (.21,.565):
        turn('스탠드 고리',x,y,base+h,[(.082,0),(.086,.003),(.085,.01),(.078,.011),(.078,0)],gold,32,True)
    turn('유리 저장구',x,y,base+.475,[(.013,0),(.016,.036),(.047,.078),(.071,.119),(.072,.150),(.061,.176),(.047,.182),(.047,.196),(.052,.199),(.048,.205)],glass,40)
    turn('저장구 입술',x,y,base+.674,[(.050,0),(.052,.002),(.052,.005),(.048,.006),(.047,0)],bright,32,True)
    turn('추출 유리병',x,y,base+.024,[(.046,0),(.061,.01),(.056,.079),(.027,.125),(.031,.141)],glass,28)
    turn('추출액',x,y,base+.025,[(.045,0),(.057,.010),(.055,.040)],coffee,24)
# Pair of black grinders with tapered transparent hoppers and coffee beans.
for x in (1.02,1.39):
    y=.12
    panel('그라인더 발',x,y,base,.215,.24,.032,black)
    turn('검은 그라인더',x,y,base+.031,[(.084,0),(.077,.18),(.096,.22),(.103,.26),(.097,.291),(.057,.30)],black,32)
    turn('호퍼',x,y,base+.32,[(.038,0),(.081,.065),(.087,.154),(.084,.157),(.077,.15)],glass,32)
    turn('원두 호퍼 속',x,y,base+.322,[(.035,0),(.073,.065),(.075,.089)],coffee,28)
    for j in range(24):
        a=j*2.4;r=.067*(j/24)**.5
        oval('원두 낱알',x+r*cos(a),y+r*sin(a),base+.412+.009*(1-r/.067),.008,.005,.004,cake,8,3)
    turn('호퍼 뚜껑',x,y,base+.478,[(.087,0),(.088,.008),(.079,.012)],black,28)
    panel('분쇄구',x,y-.086,base+.20,.052,.065,.046,steel)
# Service on the customer ledge: broad porcelain mug, rolled-lip takeaway,
# and one spooned portion with visible soaked biscuit and cocoa dust.
top=1.057
def porcelain(x,y):
    turn('잔 받침',x,y,top,[(.054,0),(.076,.006),(.08,.013),(.077,.015),(.057,.009),(.035,.008)],white,48)
    turn('흰 머그',x,y,top+.010,[(.032,0),(.043,.006),(.046,.016),(.049,.082),(.049,.087),(.045,.089),(.043,.084),(.041,.025)],white)
    round_handle('머그 둥근 손잡이',x+.044,y,top+.062,.028,white)
    turn('밀크커피 표면',x,y,top+.087,[(.042,0),(.044,.002)],foam,40)
    cup_mark('잔의 상호',x,y,top+.057,.049,dark)
porcelain(-.61,-.515)
px=-.86;py=-.46
turn('검은 종이컵',px,py,top,[(.034,0),(.035,.008),(.046,.116),(.048,.119)],black,36)
turn('흰 뚜껑',px,py,top+.116,[(.049,0),(.05,.004),(.049,.01),(.045,.011),(.043,.019),(.038,.021)],white,36)
cup_mark('종이컵 상호',px,py,top+.070,.043,white)
x=-.27;y=-.51
turn('낮은 석기 접시',x,y,top,[(.093,0),(.142,.008),(.146,.017),(.139,.022),(.115,.012),(.078,.009)],stone,56)
def portion(name,levels,mat):
    loops=[]
    for radius,h in levels:
        row=[]
        for j in range(42):
            a=tau*j/42
            ripple=1+.096*sin(3*a+.4)+.046*cos(7*a)-.027*sin(11*a)
            row.append((x+radius*ripple*cos(a),y+radius*.77*ripple*sin(a),top+.012+h+.002*cos(4*a)))
        loops.append(row)
    rings(name,loops,mat)
portion('에스프레소에 적신 비스퀴',[(.064,0),(.085,.008),(.085,.026)],cake)
portion('마스카르포네 층',[(.083,.024),(.091,.032),(.088,.044)],cream)
portion('가운데 비스퀴 층',[(.087,.041),(.084,.05)],cake)
portion('스푼으로 뜬 크림',[(.082,.047),(.089,.052),(.086,.063),(.070,.075),(.047,.082)],cream)
portion('코코아가루 층',[(.086,.0655),(.078,.077),(.053,.085),(.020,.089)],cocoa)
for j in range(65):
    a=j*2.4;r=.078*(j/65)**.5
    oval('코코아가루',x+r*cos(a),y+.73*r*sin(a),top+.102-.020*(r/.078)**2,.0028,.002,.0013,cake,6,2)
tube('디저트 스푼 자루',[(x+.099,y-.065,top+.022),(x+.10,y+.039,top+.027)],.0032,steel)
oval('스푼 볼',x+.100,y+.052,top+.027,.011,.020,.003,bright,18,5)
# Bent wooden chair at either end leaves the central standing position free.
for cx in (-1.80,1.80):
    cy=-.89
    for dx in (-.19,.19):
        for dy in (-.17,.17):
            tube('의자 다리',[(cx+dx*1.12,cy+dy*1.12,.012),(cx+dx,cy+dy,.68)],.022,gold,10)
    grain(panel('의자 좌판 틀',cx,cy,.66,.47,.43,.046,timber,.048))
    panel('올리브 가죽 방석',cx,cy,.702,.447,.416,.065,leather,.061)
    path=[(cx+.228*cos(t),cy-.194*sin(t),.967) for t in [pi*i/30 for i in range(31)]]
    tube('곡목 등받이',path,.027,gold,12)
    for dx in (-.217,.217):
        tube('팔걸이 지지대',[(cx+dx,cy,.684),(cx+dx,cy,.968)],.019,gold)
    loops=[]
    for h,r in [(0,1),(.012,1.03),(.13,1.03),(.151,.99)]:
        row=[(cx+.220*r*cos(a),cy-.180*r*sin(a),.788+h) for a in [pi*(.10+.80*j/20) for j in range(21)]]
        loops.append(row+[(a,b+.027,c) for a,b,c in reversed(row)])
    rings('곡면 가죽 등받이',loops,leather)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'categorique.blend'),compress=True)
for batch in sorted({m['batch'] for m in bpy.data.materials if 'batch' in m}):
    parts=[o for o in col.objects if o.data.materials[0]['batch']==batch]
    bpy.ops.object.select_all(action='DESELECT')
    if batch not in ('CategoriqueAsh','CategoriqueLight','CategoriqueGlass'):
        m=parts[0].data.materials[0].copy()
        v=m.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Tint'
        m.node_tree.links.new(v.outputs['Color'],shader(m).inputs['Base Color'])
        for ob in parts:
            attr=ob.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
            rgba=ob.data.materials[0].diffuse_color[:]
            for item in attr.data:item.color=rgba
            ob.data.materials.clear();ob.data.materials.append(m)
    for ob in parts:ob.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    if len(parts)>1:bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
