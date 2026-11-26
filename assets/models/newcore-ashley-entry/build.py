"""Ashley Queens, Gangnam NewCore. Public-facing moulded portal and marquee."""
from pathlib import Path
from math import cos,sin,pi
import bpy
from mathutils import Vector
from mathutils.geometry import intersect_point_tri_2d

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bank=bpy.data.collections.new('NC_AshleyQueensEntrance');bpy.context.scene.collection.children.link(bank)
mats={}
def material(tone,lit=False):
    if (tone,lit) in mats:return mats[tone,lit]
    rgb=[int(tone[i:i+2],16)/255 for i in (0,2,4)]
    linear=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb]+[1]
    mat=bpy.data.materials.new(('전구 · ' if lit else '')+tone);mat.diffuse_color=linear
    if lit:
        mat.use_nodes=True
        bs=mat.node_tree.nodes.get('Principled BSDF')
        bs.inputs['Base Color'].default_value=linear
        bs.inputs['Emission Color'].default_value=linear
        bs.inputs['Emission Strength'].default_value=.75
    mats[tone,lit]=mat
    return mat

def mesh(name,verts,faces,tone,lit=False):
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
    o=bpy.data.objects.new(name,data);bank.objects.link(o);data.materials.append(material(tone,lit));return o

def box(name,x,y,z,w,d,h,tone):
    verts=[(x+a*w/2,y+b*d/2,z+k*h) for k in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,verts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],tone)

def moulding(name,x,y,z,w,d,h,tone):
    # Four mitred projecting strips leave the recessed panel face visible.
    t=.045
    for side in [-1,1]:
        box(name+' 세로',x+side*(w-t)/2,y,z,t,d,h,tone)
        box(name+' 가로',x,y,z+(0 if side<0 else h-t),w-2*t,d,t,tone)

green='313C3D';edge='495353';shadow='242C2D'
for side in [-1,1]:
    x=side*2.8
    box('검푸른 목재 기둥',x,0,0,.66,.54,3.34,green)
    box('기단 받침',x,-.01,0,.78,.59,.115,shadow)
    for z,w,d,h,tone in [(.115,.74,.58,.075,edge),(.19,.70,.56,.08,green),(.27,.74,.58,.045,edge),
                           (3.18,.70,.56,.055,edge),(3.235,.75,.60,.075,shadow),(3.31,.81,.65,.10,edge)]:
        box('기둥 단 몰딩',x,0,z,w,d,h,tone)
    moulding('기둥 앞면 액자',x,-.281,.39,.51,.035,2.64,edge)
    moulding('안쪽 음각',x,-.284,.47,.39,.018,2.48,shadow)
for z,w,d,h,tone in [(2.69,5.67,.50,.48,green),(3.17,5.68,.54,.051,edge),
                        (3.221,5.73,.58,.056,shadow),(3.277,5.82,.64,.060,green),(3.337,5.90,.72,.075,edge)]:
    box('수평 코니스',0,0,z,w,d,h,tone)
box('입구 천장 밑면',0,.62,2.71,5.07,1.38,.11,shadow)

font_path=Path('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
if not font_path.exists():raise RuntimeError('Georgia Bold is needed to regenerate the two native marquee words')
font=bpy.data.fonts.load(str(font_path))
def word(text,width,height,z):
    curve=bpy.data.curves.new(text,'FONT');curve.font=font;curve.body=text
    curve.align_x='CENTER';curve.align_y='CENTER';curve.resolution_u=4
    o=bpy.data.objects.new(text,curve);bank.objects.link(o)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)
    raw=o.data
    raw.calc_loop_triangles()
    mx=min(v.co.x for v in raw.vertices);Mx=max(v.co.x for v in raw.vertices)
    my=min(v.co.y for v in raw.vertices);My=max(v.co.y for v in raw.vertices)
    scale=width/(Mx-mx)
    # Keep the casting and the protected warm rim as distinct editable word meshes.
    def project(p):
        return Vector(((p.x-(mx+Mx)/2)*scale,(p.y-my)/(My-my)*height+z))
    coords=[project(v.co) for v in raw.vertices]
    polys=[tuple(p.vertices) for p in raw.polygons]
    triangles=[[coords[i] for i in tr.vertices] for tr in raw.loop_triangles]
    rim=[];side_faces=[]
    # Collect boundaries of the tessellated font once, cancelling interior edges.
    counts={}
    for f in polys:
        for a,b in zip(f,f[1:]+f[:1]):
            k=tuple(sorted((a,b)));counts[k]=counts.get(k,0)+1
    for (a,b),count in counts.items():
        if count!=1:continue
        va,vb=coords[a],coords[b];axis=vb-va
        if axis.length<.0001:continue
        n=Vector((-axis.y,axis.x)).normalized()*.0067
        rays=[va+n,vb+n,vb-n,va-n];idx=len(rim)
        rim.extend((v.x,-.358,v.y) for v in rays);side_faces.append(tuple(range(idx,idx+4)))
    mesh(text+' · 가는 금빛 가장자리',rim,side_faces,'FFDA83',True)
    mesh(text+' · 살짝 돌출된 황동 글씨',[(v.x,-.353,v.y) for v in coords],polys,'76592E')
    # Circular bulbs sit inside the strokes rather than on a rectangular backdrop.
    verts=[];faces=[]
    x=-width/2+.016
    while x<width/2:
        yy=z+.018
        while yy<z+height:
            pt=Vector((x,yy))
            if any(intersect_point_tri_2d(pt,*a) for a in triangles):
                j=len(verts);r=.0059
                verts.extend((x+r*cos(i*pi/4),-.363,yy+r*sin(i*pi/4)) for i in range(8))
                faces.append(tuple(range(j,j+8)))
            yy+=.030
        x+=.030
    mesh(text+' · 매입 전구',verts,faces,'FFF1A8',True)
    bpy.data.objects.remove(o,do_unlink=True)
word('ASHLEY',1.09,.19,3.005)
word('QUEENS',1.81,.30,2.679)

# Short patterned threshold, up to the first row of restaurant furniture.
stone=('AC9E89','B9B09D','B0A493','C9BAA0','9D9990')
for row in range(4):
    for col in range(12):
        x=(col-5.5)*.399;y=.13+row*.399
        box('현관 포세린 타일',x,y,.019,.397,.397,.012,stone[(col*7+row*3+col*row)%5])
        if (row+col)%3:continue
        for a,b in [(-1,-1),(-1,1),(1,-1),(1,1)]:
            ox=x+a*.067;oy=y+b*.067
            mesh('타일 네 잎 무늬',[(ox,oy,.032),(ox+a*.063,oy,.032),(ox+a*.08,oy+b*.06,.032),(ox,oy+b*.047,.032)],[(0,1,2,3)],'737D79')
box('대기 안내대 단',2.04,.83,0,.67,.49,.085,shadow)
box('검푸른 안내대 몸통',2.04,.83,.085,.60,.42,.91,green)
box('안내대 상판',2.04,.83,.995,.71,.50,.052,edge)
moulding('안내대 앞판',2.04,.608,.16,.51,.014,.73,edge)
box('안내판 받침',-2.17,-.02,0,.43,.32,.035,shadow)
for x in [-2.36,-1.98]:box('안내판 가는 다리',x,-.02,.035,.023,.025,1.16,edge)
box('대기 등록 안내판',-2.17,-.02,.64,.42,.04,.68,shadow)
for i,ww in enumerate([.29,.20,.27,.26,.18]):
    box('안내판 인쇄',-2.17,-.043,1.19-i*.078,ww,.004,.011,'CABEA6')
# The photograph shows three warm globes hanging towards the reception side.
for i,(x,y,z,r) in enumerate([(1.12,.84,2.43,.113),(1.55,.99,2.47,.126),(2.02,1.12,2.51,.143)]):
    box('펜던트 전선',x,y,z+r,.012,.012,3.31-z-r,'544C3B')
    box('펜던트 황동 소켓',x,y,z+.81*r,.050,.050,.055,'907650')
    verts=[];faces=[];sectors=12
    for ring in range(7):
        phi=-pi/2+ring*pi/6
        for j in range(sectors):
            a=j*2*pi/sectors
            verts.append((x+r*cos(phi)*cos(a),y+r*cos(phi)*sin(a),z+r*sin(phi)))
    for ring in range(6):
        for j in range(sectors):
            a=ring*sectors+j;b=ring*sectors+(j+1)%sectors
            faces.append((a,b,b+sectors,a+sectors))
    mesh('호박색 구형 펜던트 '+str(i+1),verts,faces,'FAD58E',True)
# Freestanding customer check-in tablet beside the reception podium.
box('태블릿 받침',2.38,.26,0,.26,.26,.035,'384041')
box('태블릿 얇은 암',2.38,.26,.035,.045,.05,1.04,'414A4A')
def tablet_rect(name,dx,lo,ww,hh,tone,advance):
    def pt(xx,zz):
        return (2.38+xx,.218+(zz-1.07)*.53-advance,zz)
    mesh(name,[pt(dx-ww/2,lo),pt(dx+ww/2,lo),pt(dx+ww/2,lo+hh),pt(dx-ww/2,lo+hh)],[(0,1,2,3)],tone)
tablet_rect('태블릿 검정 외함',0,1.02,.32,.205,'202426',0)
tablet_rect('태블릿 안내 화면',0,1.038,.289,.172,'6593B7',.003)
for j,ww in enumerate([.19,.13,.165]):
    tablet_rect('체크인 안내 줄',-.017,1.154-j*.026,ww,.008,'D9E8E9',.005)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'entrance.blend'),compress=True)
