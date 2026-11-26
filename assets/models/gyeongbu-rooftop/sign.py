"""Build the weathered raised lettering pictured on the official 10F photograph."""
from math import cos,sin,pi
from random import Random
import bpy


def build(m,group):
    m.group=group
    for name,ink in [('청색도장','5b8bb0'),('청색옆면','395b73'),('노출강판','738087'),('낡은도장','8498a2'),
                     ('녹얼룩','77665a'),('받침금속','777c79'),('표지배경','e8e4da')]:
        m.palette[name]=m.material(name,ink,.32 if name!='표지배경' else 0)
    front=.680;back=.452
    # This local backing covers the distant flat text only while the relief is in view.
    m.block('서체 근접 배경 · 간판 벽',2.3,.426,2.66,43.0,.025,4.06,'표지배경')
    for k in range(9):
        m.block('벽면 · 세로 분할',-17.7+4.95*k,.441,2.69,.012,.004,3.98,'낡은도장')
    rng=Random(1941979)
    glyphs=[
        [[(.05,.17),(.27,.78),(.52,.20)],[(.59,.48),(.82,.48)],[(.82,.04),(.82,.95)]],
        ['ring',[(.09,.48),(.91,.48)],[(.51,.47),(.51,.345)],[(.16,.32),(.80,.32),(.80,.20),(.17,.20),(.17,.06),(.85,.06)]],
        [[(.16,.83),(.79,.83),(.79,.42)],[(.49,.49),(.49,.20)],[(.11,.17),(.91,.17)]],
        [[(.19,.61),(.48,.91),(.81,.63)],[(.48,.61),(.48,.48)],[(.09,.45),(.91,.45)],[(.18,.28),(.79,.28),(.79,.05)]],
        [[(.10,.85),(.10,.17),(.51,.17),(.51,.85)],[(.12,.52),(.49,.52)],[(.57,.49),(.82,.49)],[(.82,.04),(.82,.96)]],
        [[(.11,.39),(.49,.86),(.87,.39)],[(.08,.16),(.92,.16)]],
        [[(.52,.84),(.11,.84),(.11,.15),(.54,.15)],[(.14,.51),(.51,.51)],[(.59,.49),(.84,.49)],[(.84,.035),(.84,.96)]],
        [[(.10,.81),(.49,.81),(.49,.19),(.10,.19),(.10,.81)],[(.79,.04),(.79,.96)]],
        [[(.14,.92),(.14,.54),(.51,.54)],[(.70,.46),(.70,.93)],[(.71,.70),(.90,.70)],[(.18,.37),(.77,.37),(.77,.20),(.18,.20),(.18,.055),(.82,.055)]],
    ]
    for i,paths in enumerate(glyphs):
        center=-16+4.6*i;ww=2.38;hh=2.36
        def world(x,h):return (center+(x-.50)*ww,5.10+(h-.50)*hh)
        # Brackets and return metal appear below and between the free-standing channel strokes.
        for h in [4.51,5.53]:
            m.block('앵글 · 수평 보강재',center,.490,h,1.96,.074,.046,'받침금속')
            for side in [-1,1]:m.block('앵글 · 벽 고정',center+side*.66,.477,h-.051,.078,.087,.13,'청색옆면')
        for n,path in enumerate(paths):
            if path=='ring':
                path=[(.50+.245*cos(j*pi/13),.743+.154*sin(j*pi/13)) for j in range(27)]
            path=[world(x,h) for x,h in path]
            thickness=.175 if i not in (1,3,8) else .142
            outlines=[]
            for j,(x,z) in enumerate(path):
                a=path[max(0,j-1)];b=path[min(len(path)-1,j+1)]
                vx,vz=b[0]-a[0],b[1]-a[1];l=(vx*vx+vz*vz)**.5 or 1
                nx,nz=-vz/l*thickness/2,vx/l*thickness/2
                outlines.append(((x+nx,z+nz),(x-nx,z-nz)))
            verts=[(x,d,z) for d in [back,front] for pairs in outlines for x,z in pairs]
            size=len(path)*2;faces=[];slots=[]
            for j in range(len(path)-1):
                lo=2*j;hi=lo+2
                faces.extend([(size+lo,size+hi,size+hi+1,size+lo+1),(lo,lo+1,hi+1,hi),
                              (lo,hi,size+hi,size+lo),(lo+1,size+lo+1,size+hi+1,hi+1)])
                slots.extend([0,1,1,1])
            faces.extend([(0,size,size+1,1),(size-2,size-1,2*size-1,2*size-2)]);slots.extend([1,1])
            obj=m.piece('큰 청색 채널 문자 · '+'서울고속버스터미날'[i],verts,faces,'청색도장')
            obj.data.materials.append(m.palette['청색옆면'])
            for f,idx in zip(obj.data.polygons,slots):f.material_index=idx
            for k in range(len(path)-1):
                x1,z1=path[k];x2,z2=path[k+1];length=((x2-x1)**2+(z2-z1)**2)**.5
                if length<.13:continue
                for j in range(max(1,round(length*3))):
                    t=rng.uniform(.07,.93);dx,dz=(x2-x1)/length,(z2-z1)/length
                    across=rng.uniform(-.30,.30)*thickness;px=x1+(x2-x1)*t-across*dz;pz=z1+(z2-z1)*t+across*dx
                    a=rng.uniform(.012,.052);b=rng.uniform(.011,.033)
                    verts=[(px+dx*a*aa-dz*b*bb,front+.003,pz+dz*a*aa+dx*b*bb) for aa,bb in [(-1,-.3),(-.42,-1),(.81,-.66),(.92,.29),(.10,.91),(-.82,.55)]]
                    hue=rng.choice(['노출강판','낡은도장','낡은도장','녹얼룩'])
                    m.piece('도장 · 벗겨진 금속 조각',verts,[tuple(range(6))],hue)
    # English row, extruded from Blender's built-in Roman face with darker sheet-metal returns.
    f=bpy.data.curves.new('영문 글자 원본','FONT');f.body='SEOUL EXPRESS BUS TERMINAL'
    f.align_x='CENTER';f.align_y='CENTER';f.size=1;f.resolution_u=5;f.extrude=.028
    font=bpy.data.objects.new('원본',f);group.objects.link(font)
    dep=bpy.context.evaluated_depsgraph_get();data=bpy.data.meshes.new_from_object(font.evaluated_get(dep))
    xs=[v.co.x for v in data.vertices];ys=[v.co.y for v in data.vertices]
    cx=(min(xs)+max(xs))/2;cy=(min(ys)+max(ys))/2
    points=[(2.4+(v.co.x-cx)*39.75/(max(xs)-min(xs)),.574+v.co.z*2.8,3.36+(v.co.y-cy)*.79/(max(ys)-min(ys))) for v in data.vertices]
    obj=m.piece('대형 영문 · SEOUL EXPRESS BUS TERMINAL',points,[tuple(face.vertices) for face in data.polygons],'청색도장')
    obj.data.materials.append(m.palette['청색옆면'])
    for a,b in zip(obj.data.polygons,data.polygons):
        if b.normal.z<.70:a.material_index=1
    bpy.data.objects.remove(font,do_unlink=True);bpy.data.meshes.remove(data)
