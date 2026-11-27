"""Build the public gallery sign and the photographed reception at Central City."""
from pathlib import Path
import bpy
import math
import runpy

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
def collection(name):
    c=bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c
def paint(name,rgb):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*rgb,1)
    return m
black=paint("흑철",(.026,.031,.032))
edge=paint("산등성이 백색 조명",(.98,.94,.78))
paper=paint("안내 카드 미색",(.81,.75,.59))
wine=paint("안내 카드 와인색",(.27,.048,.033))
lightwood=paint("목재 결",(.245,.118,.065))
red=paint("적색 입체 문자",(.96,.012,.009))
white=paint("백색 입체 문자",(.95,.94,.90))
wood=paint("접수 바 짙은 목재",(.104,.062,.042))
oak=paint("따뜻한 나무 상판",(.38,.17,.064))
steel=paint("유리잔 받침 금속",(.27,.31,.32))
walnut=[paint("후면 나무 판재 %d"%i,c) for i,c in enumerate(
    [(.29,.14,.075),(.18,.087,.047),(.12,.068,.043),(.41,.21,.092)])]

def shape(name,verts,faces,mat):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.materials.append(mat)
    obj=bpy.data.objects.new(name,mesh)
    active.objects.link(obj)
    return obj

def box(name,x,y,z,w,d,h,mat):
    coords=[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for i,j in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return shape(name,coords,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat)

def relief(name,outline,y,thickness,mat):
    n=len(outline)
    coords=[(x,y+dy,z) for dy in (0,thickness) for x,z in outline]
    return shape(name,coords,[tuple(range(n)),tuple(reversed(range(n,2*n)))]+
                 [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat)

# Outline the operator's two-line sign at subpixel alpha crossings. Separate
# closed splines keep the counters in O, B and A editable in the Blender file.
image=bpy.data.images.load(str(here/'wordmark.png'))
width,height=image.size
alpha=list(image.pixels)[3::4]
def mark(name,lo,hi,x,y,z,span,mat):
    adj={}
    def sample(i,j):
        return alpha[(height-1-j)*width+i] if 0<=i<width and lo<=j<=hi else 0
    for j in range(lo-1,hi+1):
        for i in range(-1,width):
            ring=[(i,j),(i+1,j),(i+1,j+1),(i,j+1)]
            cuts=[]
            for a,b in zip(ring,ring[1:]+ring[:1]):
                av,bv=sample(*a),sample(*b)
                if (av>.33)==(bv>.33):continue
                w=(.33-av)/(bv-av)
                cuts.append(tuple(round(p+(q-p)*w,3) for p,q in zip(a,b)))
            for a,b in zip(cuts[::2],cuts[1::2]):
                adj.setdefault(a,set()).add(b);adj.setdefault(b,set()).add(a)
    curve=bpy.data.curves.new(name,'CURVE')
    curve.dimensions='2D';curve.fill_mode='BOTH';curve.extrude=.012
    while adj:
        start=next(iter(adj));a=start;outline=[]
        while a in adj:
            outline.append(a);b=next(iter(adj[a]))
            adj[a].remove(b);adj[b].remove(a)
            if not adj[a]:del adj[a]
            if b in adj and not adj[b]:del adj[b]
            a=b
            if a==start:break
        if len(outline)<4:continue
        spline=curve.splines.new('POLY');spline.points.add(len(outline)-1)
        for point,(u,v) in zip(spline.points,outline):
            point.co=((u-width/2)*span/width,((lo+hi)/2-v)*span/width,0,1)
        spline.use_cyclic_u=True
    curve.materials.append(mat)
    obj=bpy.data.objects.new(name,curve);active.objects.link(obj)
    obj.rotation_euler.x=math.pi/2;obj.location=(x,y,z)

active=collection('OutbackCentralGallery')
box("상부 검은 간판 받침",0,.075,.01,3.36,.15,.74,black)
mark("OUTBACK STEAKHOUSE 적색 문자",15,43,0,-.032,.40,2.94,red)

active=collection('OutbackCentralReception')
# Local y recedes from the public doorway, +z is up.
box("ㄷ자 접수 바 전면",0,2.68,.04,5.37,.69,.99,wood)
for x in (-2.47,2.47):
    box("카운터 측면 반환",x,3.25,.04,.44,1.16,.99,wood)
    box("측면 상판",x,3.25,1.02,.5,1.22,.079,oak)
box("나무 카운터 상판",0,2.67,1.02,5.52,.81,.079,oak)
for x in (-2.52,-1.67,-.82,.03,.88,1.73,2.50):
    box("하부 목재 이음",x,2.329,.11,.015,.022,.85,black)
box("상판 전면 단",0,2.25,1.045,5.50,.032,.036,lightwood)
# Reception card, waiting tablet and drinks taps seen at the branch.
box("안내 카드 홀더",-1.18,2.56,1.098,.69,.19,.035,black)
box("와인색 메뉴 표면",-1.18,2.58,1.129,.63,.042,.24,wine)
for h in (1.205,1.235):
    box("카드 제목 줄",-1.28,2.555,h,.29,.015,.009,paper)
box("대기 등록 단말 기둥",-2.08,2.06,.028,.35,.3,.88,black)
box("대기 기기 받침",-2.08,2.06,.013,.46,.42,.036,black)
box("예약 확인 화면",-2.08,2.055,.875,.43,.26,.04,steel)
box("예약 안내판",-2.08,1.898,.59,.28,.018,.15,wine)
for x in (.17,.33,.49):
    box("음료 디스펜서",x,3.1,1.10,.058,.11,.37,steel)
    box("음료 손잡이",x,3.025,1.39,.033,.08,.14,black)
for x in (-2.68,2.68):box("검은 캐노피 기둥",x,3.54,1.1,.11,.11,1.69,black)
box("천장 접수 캐노피",0,2.99,2.69,5.68,2,.18,black)
box("전면 백색 등선",0,1.98,2.70,5.66,.035,.04,edge)
ridge=[(-2.83,2.90),(-2.38,2.92),(-1.99,2.95),(-1.69,2.98),(-1.44,2.95),
       (-1.21,2.97),(-.75,2.94),(-.44,2.96),(-.12,2.94),(.26,2.99),(.49,2.95),
       (.93,2.97),(1.29,3.02),(1.61,2.98),(1.92,2.96),(2.17,2.99),(2.83,2.93)]
relief("산등성이 윤곽 백색 조명",ridge+[(2.83,2.866),(-2.83,2.866)],1.992,.04,edge)
mark("접수 바 백색 OUTBACK",15,33,-.45,1.94,2.65,1.70,white)
for x in (-1.94,1.42):
    box("접수 단말 받침",x,2.77,1.1,.19,.17,.12,black)
    box("검은 접수 단말",x,2.79,1.2,.39,.07,.27,black)
box("바 뒤 낮은 수납장",0,4.12,.03,5.05,.35,.93,wood)
for r in range(7):
    left=-2.53
    widths=[.60,.90,1.14,.77,.83,.82] if r%2==0 else [1.07,.82,.67,1.08,.91,.51]
    for width in widths:
        x=left+width/2
        tone=walnut[(round(left*9)+r*7)%4]
        box("접수 뒤 목재 마감",x,4.12,.95+r*.23,width-.013,.064,.222,tone)
        left+=width
for x in (-2.5,-1.75,-1,-.25,.5,1.25,2,2.5):
    box("캐노피 밑 격자 틀",x,2.99,2.655,.018,1.88,.03,steel)
for yy in (2.07,2.48,2.89,3.30,3.71):
    box("캐노피 밑 격자 가로대",0,yy,2.655,5.56,.016,.022,black)
for x in (-2.13,-1.67,-1.21):
    box("술잔 걸이",x,2.99,2.31,.30,.58,.028,steel)
    for j in range(3):
        yy=2.78+j*.17
        box("잔 다리",x,yy,2.20,.025,.025,.11,steel)
        box("거꾸로 건 잔",x,yy,2.13,.091,.085,.075,steel)
for yy in (.63,1.52):
    for offset in (-.14,0,.14):
        box("대기 벤치 검은 좌판",-2.63,yy+offset,.46,2.58,.118,.064,black)
    for x in (-3.79,-1.47):
        box("벤치 하부 가로대",x,yy,.408,.052,.39,.055,black)
        for offset in (-.15,.15):
            box("벤치 다리",x,yy+offset,.027,.05,.045,.39,black)
scene.render.engine='BLENDER_WORKBENCH'
bpy.data.images.remove(image)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'front.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
