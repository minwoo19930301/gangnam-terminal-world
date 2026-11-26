"""꼴라주 강남점 식탁. 미터 단위, +Y는 식탁 안쪽이다."""
from pathlib import Path
from math import cos, sin, pi, sqrt
from random import Random
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
col = bpy.data.collections.new('SSG_11F_Collage')
bpy.context.scene.collection.children.link(col)
rng = Random(6737)
tau = 2*pi

def finish(name, value, batch='CollageDining'):
    vals = [int(value[i:i+2],16)/255 for i in (0,2,4)]
    rgba = tuple(v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in vals)+(1,)
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=rgba
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=rgba
    p.inputs['Roughness'].default_value=.29 if batch=='CollageGlaze' else .58
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

wood=finish('짙은 월넛','513426')
ebony=finish('검게 칠한 곡목','322c25')
brass=finish('황동','b7a16f','CollageMetal')
steel=finish('은색 금속','b8bdc0','CollageMetal')
foil=finish('구겨진 은박','cabfb0','CollageMetal')
glaze=finish('백자','faf8ef','CollageGlaze')
line=finish('접시 가는 띠','575547')
topmat=finish('회녹색 상판','c6c8a8')
edge=finish('살구색 선','cc8662')
olive=finish('올리브색 좌판','758160')
sauce=finish('데미글라스','743820','CollageGlaze')
crust=finish('구운 함박 표면','ffffff','CollageHamburg')
spud=finish('감자 껍질','b88a55')
flesh=finish('구운 감자 속','efcd8c')
cream=finish('감자 위 버섯 버터','fff4db','CollageGlaze')
leaf=finish('어린잎','50713b')
pea=finish('그린빈','609143','CollageGlaze')
carrot=finish('당근','e37630','CollageGlaze')
noodle=finish('스파게티','e9b960','CollageGlaze')
iron=finish('무쇠 철판','37332e')
for m,roughness,metal in [(steel,.24,.66),(foil,.32,.63),(brass,.32,.52)]:
    shader=m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Metallic'].default_value=metal
    shader.inputs['Roughness'].default_value=roughness

# Divider with upholstered back, raised handrail, and an offset bentwood chair.
panel('부스 하부 받침',0,.75,.045,1.54,.52,.335,wood,.03)
panel('부스 방석',0,.695,.38,1.55,.57,.106,olive,.056)
panel('칸막이 몸판',0,.997,.07,1.62,.10,1.10,wood,.031)
panel('칸막이 상부 몰딩',0,.992,1.15,1.66,.138,.054,wood,.025)
for x in [-.745,.745]:
    turn('황동 플랜지',x,1,1.203,[(.032,0),(.033,.006),(.019,.014)],brass,20)
    tube('난간 기둥',[(x,1,1.213),(x,1,1.337)],.013,brass)
tube('황동 손스침',[(-.77,1,1.34),(.77,1,1.34)],.019,brass,16)
fabric=finish('식물무늬 직물','ffffff','CollageBotanical')
tex=fabric.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=bpy.data.images.load(str(OUT/'upholstery.jpg'));tex.image.pack()
fabric.node_tree.links.new(tex.outputs['Color'],fabric.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
# Project a continuous print across the gently reclined and convex seat back.
back=panel('둥근 등받이 쿠션',0,.902,.477,1.53,.119,.655,fabric,.052)
uv=back.data.uv_layers.new(name='직물 재단')
for v in back.data.vertices:
    x,y,z=v.co
    v.co.y+=.077*(z-.477)-.029*sin(pi*(z-.477)/.655)
for loop in back.data.loops:
    x,y,z=back.data.vertices[loop.vertex_index].co
    uv.data[loop.index].uv=((x+.765)/1.53,(z-.477)/.655)
for x in [-.77,.77]:panel('측면 마감',x,.93,.43,.04,.15,.71,wood)
cy=-.68;cx=-.28
turn('곡목 의자 좌판',cx,cy,.427,[(.166,0),(.199,.018),(.205,.038),(.203,.048),(.183,.054)],ebony,40)
turn('의자 가죽 방석',cx,cy,.477,[(.178,0),(.182,.012),(.171,.023),(.10,.027)],olive,40)
for dx in [-1,1]:
    for dy in [-1,1]:
        tube('휘어진 의자 다리',[(cx+.175*dx,cy+.174*dy,.012),(cx+.154*dx,cy+.149*dy,.22),(cx+.12*dx,cy+.12*dy,.447)],.015,ebony,10)
def chairloop(width,height,dip,radius):
    pts=[]
    for i in range(31):
        t=pi*i/30
        pts.append((cx-width*cos(t),cy-.135-dip*sin(t),.45+height*sin(t)**.86))
    tube('증기로 휜 등받이',pts,radius,ebony,12)
chairloop(.167,.48,.115,.020)
chairloop(.127,.343,.09,.013)
tube('의자 다리 원형 보강대',[(cx+.168*cos(i*tau/32),cy+.166*sin(i*tau/32),.259) for i in range(33)],.011,ebony)

# Rounded square table, double warm edge stripe, central cast pedestal.
top=.79
panel('월넛 상판 테',0,0,.74,1.19,.84,.047,wood,.04)
panel('올리브 상판',0,0,.783,1.19,.84,.007,topmat,.04)
for inset in [.021,.035]:
    for s in [-1,1]:
        panel('상판 테두리 선',0,s*(.42-inset),top,1.19-2*inset,.003,.0012,edge,.001)
        panel('상판 테두리 선',s*(.595-inset),0,top,.003,.84-2*inset,.0012,edge,.001)
turn('주철 테이블 다리',0,0,.012,[(.292,0),(.302,.012),(.277,.032),(.107,.057),(.063,.076),(.047,.119),(.047,.655),(.111,.703),(.155,.727)],iron)

# Iron platter in a wooden trivet with an opened sheet of foil.
fx,fy=-.145,-.09
panel('철판 나무 받침',fx,fy,top+.002,.385,.315,.024,wood,.037)
def ellipse(name,x,y,z,rx,ry,profile,mat,n=48):
    return rings(name,[[(x+rx*r*cos(i*tau/n),y+ry*r*sin(i*tau/n),z+h) for i in range(n)] for r,h in profile],mat)
base=top+.027
ellipse('무쇠 철판',fx,fy,base,.182,.143,[(.88,0),(1,.012),(1,.023),(.96,.027),(.88,.014)],iron)
panel('철판 손잡이',fx-.208,fy,base+.012,.096,.038,.022,iron)
def mottled(obj,amount):
    m=obj.data.materials[0]
    attr=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for v in attr.data:
        k=1+amount*(rng.random()-.5)
        v.color=tuple(min(1,c*k) for c in m.diffuse_color[:3])+(1,)
    if not m.node_tree.nodes.get('Vertex Color'):
        vc=m.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Tint'
        m.node_tree.links.new(vc.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
loops=[];count=64
for j in range(6):
    loop=[]
    for i in range(count):
        t=i*tau/count
        r=[.55,.83,.92,1.01,1.09,1.16][j] + (.015+.009*j)*rng.uniform(-1,1)
        h=[.014,.015,.027,.05,.078,.073][j]+(j/5)**2*(.020*sin(7*t)+.019*rng.uniform(-1,1))
        loop.append((fx+.147*r*cos(t),fy+.107*r*sin(t),base+h))
    loops.append(loop)
vertices=[v for layer in loops for v in layer];faces=[]
for j in range(5):
    for i in range(count):
        a=j*count+i;b=j*count+(i+1)%count
        faces.extend([(a,b,a+count),(b,b+count,a+count)])
f=mesh('찢어 펼친 은박 주름',vertices,faces,foil);mottled(f,1.15)
ellipse('데미글라스 소스',fx,fy,base+.016,.134,.093,[(.95,0),(1,.007),(.94,.009)],sauce)
p=oval('오리지널 함박스테이크',fx-.013,fy+.006,base+.054,.081,.065,.042,crust,48,14,.13)
sear=crust.node_tree.nodes.new('ShaderNodeTexImage')
sear.image=bpy.data.images.load(str(OUT/'sear.jpg'));sear.image.pack()
crust.node_tree.links.new(sear.outputs['Color'],crust.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
crust.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.34
uv=p.data.uv_layers.new(name='함박 겉면')
for face in p.data.polygons:
    cols=[p.data.loops[i].vertex_index%48 for i in face.loop_indices]
    seam=max(cols)-min(cols)>24
    for i,k in zip(face.loop_indices,cols):
        vi=p.data.loops[i].vertex_index
        uv.data[i].uv=(1 if seam and k==0 else k/48,vi//48/14)

for j in range(5):
    x=fx+.04+j*.009
    tube('꼬투리 그린빈',[(x,fy-.077,base+.033),(x+.012,fy-.053,base+.042),(x+.035,fy-.010,base+.043)],.0055,pea)
for x,y in [(-.097,-.043),(.076,.046)]:
    oval('윤기 나는 당근',fx+x,fy+y,base+.041,.022,.018,.022,carrot,15,7,.10)
# Split baked potato on the exposed side of the iron platter.
px,py=fx+.105,fy-.090
for i in [-1,1]:
    oval('통감자 껍질',px+i*.022,py-.014,base+.048,.026,.046,.023,spud)
    oval('갈라진 감자 속살',px+i*.018,py-.014,base+.058,.024,.043,.018,flesh)
oval('감자 위 버섯 버터',px,py-.014,base+.070,.023,.030,.015,cream,20,8,.17)
for j in range(28):
    dx,dy=rng.uniform(-.016,.016),rng.uniform(-.018,.018)
    oval('파슬리 가루',px+dx,py-.014+dy,base+.083-.006*(abs(dx)+abs(dy))/.035,.0017,.001,.0008,leaf,6,3)

def porcelain(x,y,r):
    turn('테두리가 얇은 접시',x,y,top+.002,[(r*.55,0),(r*.63,.004),(r,.018),(r,.023),(r*.94,.024),(r*.65,.011),(r*.48,.009)],glaze)
    turn('짙은 접시 선',x,y,top+.002,[(r*.858,.0200),(r*.863,.0203)],line,56,True)
nx,ny=.181,.130
porcelain(nx,ny,.164)
# Individual strands wound around a loose nest. Distinct height and pitch
# keep the visible ends, foam and salad leaves above the rim.
for i in range(33):
    phase=rng.uniform(0,tau);rad=rng.uniform(.043,.083)
    points=[]
    for j in range(38):
        t=j/37;angle=phase+t*tau*rng.uniform(.99,1.01)
        r=rad+.009*sin(3*angle+phase)
        points.append((nx+r*cos(angle),ny+.85*r*sin(angle),top+.018+.017*sin(pi*t)+.029*(1-rad/.09)+.003*sin(3*angle+i)))
    tube('오일 스파게티',points,.0029,noodle,6)
for i in range(13):
    a=i*2.4
    x=nx+.032*cos(a);y=ny+.028*sin(a)
    dx=.038*cos(a);dy=.038*sin(a)
    mesh('샐러드 어린잎',[(x,y,top+.055),(x+dx*.5-dy*.29,y+dy*.5+dx*.29,top+.073),(x+dx*.50,y+dy*.50,top+.079),(x+dx*.55+dy*.29,y+dy*.55-dx*.29,top+.073),(x+dx,y+dy,top+.094)],[(0,2,1),(0,3,2),(1,2,4),(2,3,4)],leaf)
for i in range(15):
    a=i*2.399;r=.024*sqrt(i/15)
    oval('파스타 거품',nx-.066+r*cos(a),ny-.014+r*sin(a),top+.037+rng.uniform(-.003,.005),.012,.012,.010,cream,12,5)
for x,y in [(-.397,.172),(.383,-.144)]:
    porcelain(x,y,.076)
    tube('포크 자루',[(x-.015,y-.058,top+.022),(x+.01,y+.018,top+.025)],.0048,steel)
    for j in range(4):
        tube('포크 살',[(x+.01,y+.018,top+.025),(x+.007+j*.003,y+.031,top+.025),(x+.012+j*.003,y+.051,top+.029)],.0013,steel,6)
for x,y in [(-.402,-.21),(.365,.256)]:
    turn('물잔 굽과 몸통',x,y,top+.002,[(.026,0),(.031,.004),(.035,.068),(.033,.072),(.029,.067),(.025,.012)],glaze,32)

# Public decorative finishes from the shop photographs: panelled partition
# and an overhead green-and-ivory chevron with a copper fascia.
ivory=finish('크림색 장식 패널','e6ddce')
forest=finish('천장 짙은 녹색','234738')
copper=finish('구릿빛 띠','ad7958','CollageMetal')
inkwash=finish('회색 식기 그림','aaa396')
for x in [-.97,0,.97]:
    panel('벽 장식 패널',x,1.91,.08,.966,.05,2.67,ivory,.007)
    panel('하단 몰딩',x,1.867,.15,.96,.035,.09,wood)
    # Restrained urn silhouette within the divided light panels, interpreted
    # from the soft-focus dining-room photograph.
    outline=[(-.047,0),(-.084,.012),(-.083,.023),(-.04,.037),(-.032,.069),(-.089,.106),(-.123,.16),(-.135,.207),(-.119,.216),(-.131,.227),(-.081,.24),(-.058,.249),(-.032,.258),(-.021,.277),(0,.283)]
    profile=outline+[(-a,h) for a,h in reversed(outline[:-1])]
    mesh('패널 도기 장식',[(x+a,1.879,1.71+h) for a,h in reversed(profile)],[tuple(range(len(profile)))],inkwash)
    for h,r in [(.016,.08),(.208,.128),(.228,.116)]:
        tube('도기 장식 선',[(x-r,1.873,1.71+h),(x+r,1.873,1.71+h)],.0035,ivory,6)
for x in [-1.455,-.485,.485,1.455]:panel('월넛 세로틀',x,1.863,.075,.033,.064,2.73,wood,.004)
panel('구릿빛 상부 장식띠',0,1.843,2.64,2.95,.13,.165,copper)
panel('천장 장식 바탕',0,1.52,2.807,2.95,.79,.045,ivory)
for i in range(4):
    a=-1.46+i*.73
    for x0,x1,ya,yb in [(a,a+.365,1.28,1.51),(a+.365,a+.73,1.51,1.28)]:
        mesh('천장 녹색 꺾임무늬',[(x0,ya,2.802),(x0,ya+.19,2.802),(x1,yb+.19,2.802),(x1,yb,2.802)],[(0,1,2,3)],forest)

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE',len(col.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'collage.blend'),compress=True)
for batch in ['CollageDining','CollageGlaze','CollageMetal','CollageBotanical','CollageHamburg']:
    parts=[o for o in col.objects if o.data.materials[0]['batch']==batch]
    bpy.ops.object.select_all(action='DESELECT')
    if batch not in ['CollageBotanical','CollageHamburg']:
        mat=(steel if batch=='CollageMetal' else parts[0].data.materials[0]).copy()
        v=mat.node_tree.nodes.new('ShaderNodeVertexColor');v.layer_name='Tint'
        mat.node_tree.links.new(v.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
        for obj in parts:
            if not obj.data.color_attributes.get('Tint'):
                tint=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
                color=obj.data.materials[0].diffuse_color[:]
                for item in tint.data:item.color=color
            obj.data.materials.clear();obj.data.materials.append(mat)
    for obj in parts:obj.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    if len(parts)>1:bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
