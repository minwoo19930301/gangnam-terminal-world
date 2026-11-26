"""Native customer display. Local +Y goes from the aisle toward the sample wall."""
from pathlib import Path
from math import sin, cos, pi, sqrt, radians
from mathutils import Vector, Matrix
import bpy
import runpy

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SSG_9F_HermanMiller')
bpy.context.scene.collection.children.link(collection)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0
basis = Matrix.Identity(4)
prefix = ''

def material(name, hexcolor, finish):
    rgb = [int(hexcolor[i:i+2], 16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgba
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgba
    p.inputs['Metallic'].default_value = .58 if finish=='Alloy' else 0
    p.inputs['Roughness'].default_value = {'Alloy':.31,'Frame':.43,'Fabric':.86,'Display':.65}[finish]
    m['finish'] = finish
    return m

graphite=material('흑연 프레임','3A4041','Frame')
rubber=material('우레탄','242729','Frame')
pewter=material('망사 경사','707A79','Fabric')
weft=material('망사 위사','495152','Fabric')
alloy=material('연마 알루미늄','A7B0B1','Alloy')
chalk=material('백색 프레임','D4D4CA','Frame')
cloth=material('청록 직물','386F78','Fabric')
seam=material('직물 단면','315961','Fabric')
ivory=material('따뜻한 회백색','E5E1D6','Display')
oak=material('목재 마구리','A78665','Display')
ink=material('인쇄 먹색','303434','Display')
vermilion=material('주홍색','C94532','Display')
swatches=[pewter,weft,rubber,cloth,seam,material('겨자색 직물','B69A5C','Fabric'),material('벽돌색 직물','A56151','Fabric'),chalk]

def mesh(name, vs, fs, mat, smooth=True):
    data=bpy.data.meshes.new(prefix+name)
    data.from_pydata(vs,[],fs)
    data.materials.append(mat)
    for p in data.polygons:p.use_smooth=smooth
    obj=bpy.data.objects.new(prefix+name,data)
    collection.objects.link(obj)
    obj.matrix_world=basis.copy()
    return obj

def rows(name,rings,mat,cap=True,smooth=True):
    n=len(rings[0])
    faces=[(i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j) for i in range(len(rings)-1) for j in range(n)]
    if cap:faces += [tuple(reversed(range(n))),tuple(range((len(rings)-1)*n,len(rings)*n))]
    return mesh(name,[p for row in rings for p in row],faces,mat,smooth)

def tube(name,pts,r,mat,sides=10):
    pts=[Vector(p) for p in pts]
    rings=[]
    # Parallel transport the cross section so bent struts have no twisted faces.
    last=None
    for i,p in enumerate(pts):
        t=(pts[min(len(pts)-1,i+1)]-pts[max(0,i-1)]).normalized()
        ref=last if last is not None else (Vector((0,0,1)) if abs(t.z)<.9 else Vector((1,0,0)))
        u=(ref-t*ref.dot(t)).normalized();v=t.cross(u);last=u
        radius=r[i] if isinstance(r,list) else r
        rings.append([tuple(p+radius*(u*cos(2*pi*j/sides)+v*sin(2*pi*j/sides))) for j in range(sides)])
    return rows(name,rings,mat)

def rounded(name,x,y,z,w,d,h,mat,r=.025):
    # Rounded rectangular section with rolled top and bottom edges.
    rings=[]
    for dz,shrink in [(0,.006),(.007,0),(max(.008,h-.007),0),(h,.006)]:
        ww=w/2-shrink;dd=d/2-shrink;rr=min(r,ww*.8,dd*.8)
        ring=[]
        for k,(sx,sy) in enumerate([(1,1),(-1,1),(-1,-1),(1,-1)]):
            for j in range(5):
                a=(k+j/4)*pi/2
                ring.append((x+sx*(ww-rr)+rr*cos(a),y+sy*(dd-rr)+rr*sin(a),z+dz))
        rings.append(ring)
    return rows(name,rings,mat,True,False)

def chair_base(frame,light):
    for k in range(5):
        a=2*pi*k/5+.2
        def spoke(r,h,s=0):
            return (r*cos(a)-s*sin(a),r*sin(a)+s*cos(a),h)
        tube('방사형 다리', [spoke(.035,.188),spoke(.115,.172),spoke(.255,.124),spoke(.318,.096)], [.037,.033,.024,.019],frame)
        tube('캐스터 목',[spoke(.314,.063),spoke(.318,.103)],.018,rubber)
        for s in [-.022,.022]:
            tube('이중 캐스터',[spoke(.322,.041,s-.009),spoke(.322,.041,s+.009)],.039,rubber,18)
            tube('캐스터 허브',[spoke(.322,.041,s*1.45),spoke(.322,.041,s*1.54)],.015,frame,12)
    tube('가스 리프트',[(0,0,.145),(0,0,.28)],.044,frame,18)
    tube('피스톤',[(0,0,.26),(0,0,.39)],.030,alloy,18)
    rounded('틸트 하우징',0,.012,.337,.23,.235,.089,graphite,.05)
    tube('장력 조절축',[(.075,.01,.375),(.182,-.01,.375)],.017,alloy)
    tube('장력 다이얼',[(.155,-.01,.375),(.19,-.01,.375)],.034,rubber,18)
    tube('높이 레버',[(-.09,-.015,.368),(-.168,-.048,.369),(-.212,-.075,.39)],.009,frame)
    rounded('레버 손잡이',-.209,-.078,.378,.054,.039,.021,rubber,.015)
    for s in [-1,1]:
        tube('좌판 링크',[(s*.091,.095,.362),(s*.161,.144,.408),(s*.211,.134,.447)],.019,frame)
        tube('팔 받침 기둥',[(s*.18,.143,.397),(s*.255,.144,.438),(s*.282,.134,.56),(s*.284,.103,.637)], [.024,.03,.026,.02],frame)
        tube('팔 높이 조절 슬리브',[(s*.284,.107,.59),(s*.284,.099,.67)],.017,alloy if light else graphite)
        rounded('팔걸이 패드',s*.279,.027,.644,.084,.248,.045,rubber,.041)

# Squared oval boundaries and a dished ruled membrane. Each filament goes
# across the aperture to the inside of its moulded rim, including the corners.
def surface(u,v,back):
    x=u*sqrt(1-.34*v*v)
    t=v*sqrt(1-.34*u*u)
    if back:
        return (.254*x*(1+.10*t),.207+.068*t+.048*x*x-.036*(1-t*t),.763+.231*t)
    return (.253*x*(1-.035*t),.233*t-.025,.465+.035*x*x+.010*t-.015*t*t)

def membrane(back):
    border=[surface(-1+2*j/24,-1,back) for j in range(24)]
    border += [surface(1,-1+2*j/24,back) for j in range(24)]
    border += [surface(1-2*j/24,1,back) for j in range(24)]
    border += [surface(-1,1-2*j/24,back) for j in range(25)]
    tube('성형 테두리',border,.019 if back else .022,graphite,12)
    for i in range(1,44):
        u=-1+2*i/44
        tube('펠리클 경사',[surface(u,-1+2*j/12,back) for j in range(13)],.0027,pewter,4)
    for i in range(1,31):
        v=-1+2*i/31
        tube('펠리클 위사',[surface(-1+2*j/12,v,back) for j in range(13)],.0027 if i%5 else .0042,weft,4)

def aeron():
    chair_base(graphite,False)
    membrane(False);membrane(True)
    for s in [-1,1]:
        tube('등판 회전 프레임',[(s*.176,.10,.373),(s*.228,.153,.449),(s*.229,.176,.565),(s*.19,.215,.644)], [.025,.028,.022,.017],graphite)
        tube('등판 후면 요크',[(s*.205,.235,.641),(s*.12,.255,.603),(s*.045,.256,.589),(0,.251,.604)],.019,graphite)
    tube('천골 지지축',[(0,.25,.45),(0,.269,.59),(0,.248,.75)],.022,graphite)
    for h,w in [(.606,.107),(.692,.142)]:
        rounded('포스처핏 패드',0,.209,h,w,.053,.062,graphite,.022)

def embody():
    chair_base(chalk,True)
    rounded('넓은 직물 좌판',0,-.022,.427,.533,.485,.078,cloth,.102)
    rounded('좌판 하부 지지틀',0,-.018,.413,.485,.443,.029,chalk,.08)
    # Horizontal cross sections: narrow at shoulders, flared across lumbar,
    # convex at the front and inclined away from the seat near the shoulders.
    profile=[(.51,.135,.161),(.55,.182,.156),(.61,.206,.135),(.69,.198,.133),(.79,.17,.17),(.90,.149,.21),(1.005,.158,.243),(1.054,.148,.253),(1.067,.114,.253)]
    rings=[]
    for h,w,y in profile:
        ring=[]
        for j in range(44):
            a=2*pi*j/44
            xx=w*cos(a)
            ring.append((xx,y+.045*(xx/w)**2+.032*sin(a),h))
        rings.append(ring)
    rows('엠바디 직물 등판',rings,cloth)
    tube('백핏 중앙 척추',[(0,.192,.409),(0,.241,.517),(0,.233,.64),(0,.218,.731),(0,.247,.848),(0,.278,.961),(0,.286,1.039)],[.039,.041,.027,.026,.022,.018,.014],chalk)
    for j in range(10):
        h=.566+j*.049
        i=next(i for i in range(len(profile)-1) if profile[i][0]<=h<=profile[i+1][0])
        h0,w0,y0=profile[i];h1,w1,y1=profile[i+1];t=(h-h0)/(h1-h0)
        w=w0*(1-t)+w1*t;y=y0*(1-t)+y1*t
        for s in [-1,1]:
            tube('등판 탄성 갈비살',[(0,y+.076,h-.026),(s*w*.37,y+.071,h-.010),(s*w*.72,y+.081,h+.022),(s*w*.92,y+.064,h+.031)],[.012,.011,.008,.006],chalk,8)
            tube('등판 결합부',[(s*w*.73,y+.064,h+.013),(s*w*.74,y+.046,h+.048)],.007,graphite,8)
    for s in [-1,1]:
        tube('등판 링크',[(s*.095,.07,.363),(s*.132,.181,.391),(s*.09,.239,.512),(0,.236,.552)],.022,chalk)
    tube('백핏 다이얼',[(.096,.168,.389),(.16,.189,.394)],.035,graphite,16)

def place(name,x,y,z,angle):
    global prefix,basis
    prefix=name+' · '
    basis=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')

def text_label(label,x,y,z,size,mat):
    curve=bpy.data.curves.new(label,'FONT');curve.body=label;curve.size=size
    curve.align_x='CENTER';curve.align_y='CENTER';curve.extrude=.0008
    o=bpy.data.objects.new(label,curve);collection.objects.link(o)
    o.location=(x,y,z);o.rotation_euler.x=pi/2;curve.materials.append(mat)
    bpy.context.view_layer.objects.active=o;o.select_set(True)
    bpy.ops.object.convert(target='MESH');o.select_set(False)

place('에어론',-.70,-.04,.195,-22);aeron()
place('엠바디',.67,.075,.195,38);embody()
place('후면 엠바디',2.12,.33,.195,153);embody()
place('진열',0,0,0,0)
rounded('그림자 받침',.68,.12,.017,4.08,1.12,.14,ink,.055)
rounded('진열대',.68,.12,.12,4.22,1.24,.075,ivory,.07)
rounded('표본 벽',.68,1.40,.016,4.28,.13,2.18,ivory,.035)
rounded('하단 장',.68,1.28,.03,4.22,.32,.48,oak)
rounded('표본 받침',.68,1.25,.505,4.26,.39,.042,ivory)
text_label('Herman Miller',-.46,1.325,1.74,.222,vermilion)
text_label('Aeron',-.70,-.506,.158,.064,ink)
text_label('Embody',.67,-.506,.158,.064,ink)
text_label('Backfit',2.12,-.506,.158,.064,ink)
for i,mat in enumerate(swatches):
    x=.68+(i%4)*.467;y=1.284;h=1.36-(i//4)*.43
    rounded('표본 카드',x,y,h,.332,.033,.364,chalk,.015)
    rounded('마감 표본',x,y-.024,h+.058,.292,.019,.276,mat,.008)
    rounded('걸쇠',x,y-.038,h+.32,.053,.018,.041,alloy,.007)
    for j in range(3):
        tube('표본 직조선',[(x-.132,y-.035,h+.079+j*.015),(x+.132,y-.035,h+.079+j*.015)],.0025,mat,4)
text_label('8Z Pellicle',-.46,1.322,1.22,.106,ink)
text_label('PostureFit SL',-.46,1.322,1.045,.071,ink)
text_label('Backfit',-.46,1.322,.854,.094,ink)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'seating.blend'),compress=True)
print('EDITABLE_OBJECTS',len(collection.objects))
runpy.run_path(str(OUT/'export.py'))
