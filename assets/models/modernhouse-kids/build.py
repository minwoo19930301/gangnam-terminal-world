"""Public Modern House Gangnam kids' bedding and gifts bay, from the Visit Seoul branch photo."""
from pathlib import Path
from math import cos, sin, pi, tau
import runpy
import subprocess
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system='METRIC'


def paint(name,hexcode):
    rgb=[int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb],1)
    return m


sun=paint('해바라기색 도장','EBC852')
pale=paint('개나리색 마감','F3DB72')
ochre=paint('진열장 홈','C6A345')
cream=paint('선반 엣지','F1E8CC')
ivory=paint('우유색 순면','F6E7D5')
grey=paint('칸막이의 안쪽','D5D1C5')
butter=paint('버터색 파일','EAC08B')
caramel=paint('밤색 벨루어','BA845C')
blush=paint('산호색 스티치','E4A4A5')
rose=paint('딸기우유색','EDC9D0')
sky=paint('파스텔 하늘색','B7D9EC')
ink=paint('감침질 · 짙은 갈색','483C39')
mint=paint('민트색','BADECA')
lilac=paint('라일락','CAAFCD')
honey=paint('곰돌이 노란색','ECC46D')
leaf=paint('침대 주변의 올리브색 카펫','8D9278')
coral=paint('산호색 인형 셔츠','C66C61')
denim=paint('미드나이트 블루','4C7297')
group=None
ox=0


def start(name,file,offset):
    global group,ox
    group=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(group)
    group['export_model']=file
    group['preview_origin']=(offset,0,0)
    ox=offset


def obj(name,verts,faces,mat,smooth=False):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata([(x+ox,y,z) for x,y,z in verts],[],faces)
    mesh.update()
    result=bpy.data.objects.new(name,mesh)
    group.objects.link(result)
    mesh.materials.append(mat)
    if smooth:
        for f in mesh.polygons:
            f.use_smooth=True
    return result


def block(name,x,y,z,w,d,h,mat):
    return obj(name,[(x+i*w/2,y+j*d/2,z+k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)],
               [(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)],mat)


def extrude(name,poly,axis,lo,hi,mat):
    n=len(poly)
    verts=[(x,y,z) if axis=='Z' else (x,z,y) for z in (lo,hi) for x,y in poly]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces+=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return obj(name,verts,faces,mat)


def ellipse(name,x,y,z,a,b,c,mat,n=12,m=7,tilt=0):
    verts,faces=[],[]
    if max(a,b,c)<.047:
        n,m=min(n,9),min(m,4)
    for j in range(m+1):
        lat=-pi/2+(j+.012 if j==0 else j-.012 if j==m else j)*pi/m
        for i in range(n):
            ang=tau*i/n
            xx=a*cos(lat)*cos(ang)
            zz=c*sin(lat)
            verts.append((x+xx*cos(tilt)-zz*sin(tilt),y+b*cos(lat)*sin(ang),z+zz*cos(tilt)+xx*sin(tilt)))
    for j in range(m):
        faces.extend((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for i in range(n))
    faces+=[tuple(reversed(range(n))),tuple(range(m*n,(m+1)*n))]
    return obj(name,verts,faces,mat,True)


def rim(name,points,r,mat,sides=5):
    pts=list(map(Vector,points))
    verts,faces=[],[]
    for i,p in enumerate(pts):
        direction=(pts[min(i+1,len(pts)-1)]-pts[max(i-1,0)]).normalized()
        n=direction.cross(Vector((0,0,1)) if abs(direction.z)<.9 else Vector((0,1,0))).normalized()
        b=direction.cross(n)
        verts.extend(p+r*(n*cos(tau*j/sides)+b*sin(tau*j/sides)) for j in range(sides))
        if i:
            a=(i-1)*sides
            faces.extend((a+j,a+(j+1)%sides,a+sides+(j+1)%sides,a+sides+j) for j in range(sides))
    return obj(name,verts,faces,mat,True)


def oval_slab(name,x,y,z,w,d,h,mat):
    rad=d/2;flat=w/2-rad
    pts=[(x+sgn*flat+rad*cos(a+pi*k/14),y+rad*sin(a+pi*k/14)) for sgn,a in [(1,-pi/2),(-1,pi/2)] for k in range(15)]
    return extrude(name,pts,'Z',z,z+h,mat)


def pillow(name,x,y,z,w,d,h,base,printmat,twist=0,pattern='petal'):
    # Each side is a gently convex sewn panel, flattened and pinched near the corners.
    def surface(u,v,upper):
        xx=u*w/2*(1-.074*abs(v)**5)
        yy=v*d/2*(1-.057*abs(u)**5)
        puff=(max(0,1-abs(u)**3)*max(0,1-abs(v)**3))**.53
        px=x+xx*cos(twist)-yy*sin(twist)
        py=y+xx*sin(twist)+yy*cos(twist)
        zz=z+h*(.48+(.036+.47*puff)*(1 if upper else -1))
        return (px,py,zz)
    n=8
    verts=[surface(i*2/n-1,j*2/n-1,k) for k in (False,True) for j in range(n+1) for i in range(n+1)]
    face=[]
    layer=(n+1)**2
    for j in range(n):
        for i in range(n):
            a=j*(n+1)+i
            f=(a,a+1,a+n+2,a+n+1)
            face.extend([f[::-1],tuple(q+layer for q in f)])
    edge=list(range(n+1))+[j*(n+1)+n for j in range(1,n+1)]+list(range(layer-2,n*(n+1)-1,-1))+[j*(n+1) for j in range(n-1,0,-1)]
    face.extend((edge[i],edge[(i+1)%len(edge)],edge[(i+1)%len(edge)]+layer,edge[i]+layer) for i in range(len(edge)))
    obj(name,verts,face,base,True)
    seam=[tuple((Vector(verts[i])+Vector(verts[i+layer]))*.5) for i in edge]
    rim('베개 가장자리 파이핑',seam+seam[:1],.004,cream)
    # Decals follow the actual curved surface, including its twist.
    pv,pf=[],[]
    for j in range(2):
        for i in range(3):
            u=-.59+i*.52+.15*(j%2)
            v=-.38+j*.63
            petals=5 if pattern=='petal' else 3
            for k in range(petals):
                t=tau*k/petals
                start=len(pv)
                for df,ds in [(0,0),(.047,.031),(.087,0),(.046,-.031)]:
                    ex=u+df*cos(t)-ds*sin(t)
                    ey=v+(df*sin(t)+ds*cos(t))*1.4
                    p=surface(ex,ey,True)
                    pv.append((p[0],p[1],p[2]+.003))
                pf.append(tuple(range(start,start+4)))
    obj('순면 위의 조그만 반복무늬',pv,pf,printmat)


def plush(x,y,z,scale,tone,species):
    s=scale
    def part(name,dx,dy,dz,a,b,c,m,tilt=0,n=12):
        ellipse(name,x+dx*s,y+dy*s,z+dz*s,a*s,b*s,c*s,m,n,7,tilt)
    part('인형 몸통',0,.034,.165,.14,.112,.165,tone)
    for side in (-1,1):
        part('인형의 봉제 발',side*.086,-.042,.055,.072,.084,.052,tone)
        part('인형의 짧은 팔',side*.133,-.001,.164,.049,.060,.088,tone,side*.32)
    part('둥근 봉제 얼굴',0,0,.315,.155,.125,.143,tone,n=16)
    for side in (-1,1):
        if species=='bunny':
            part('토끼 귀',side*.078,.016,.46,.046,.035,.112,tone,-side*.14)
            part('토끼 귀 안감',side*.08,-.010,.468,.023,.011,.073,rose,-side*.14)
        else:
            part('곰 귀',side*.118,.010,.424,.056,.042,.059,tone,-side*.13)
            part('곰 귓바퀴',side*.123,-.022,.431,.032,.014,.033,blush)
        part('수놓은 눈',side*.053,-.114,.338,.010,.005,.012,ink,n=8)
    part('타원 주둥이',0,-.108,.284,.069,.034,.046,ivory)
    part('자수 코',0,-.138,.301,.018,.008,.013,ink,n=8)
    for side in (-1,1):
        part('작은 리본 매듭',side*.037,-.100,.186,.041,.018,.023,blush,-side*.28)


start('모던하우스 키즈 · 노란 아치와 침대','arches',0)
# Alcoves have solid spandrels around real openings, shelves and recessed back panels.
for cx,rad,base,top in [(-1.77,1.32,1.74,3.38),(1.75,1.24,1.72,3.38)]:
    for side in [-1,1]:
        outer=cx+side*1.74
        inner=cx+side*rad
        block('노란 벽체 · 아치 옆 세로면',(outer+inner)/2,0,0,abs(outer-inner),.22,top,sun)
    for i in range(32):
        a=pi*i/32;b=pi*(i+1)/32
        x1,x2=cx+rad*cos(a),cx+rad*cos(b)
        h1,h2=base+rad*sin(a),base+rad*sin(b)
        obj('아치형 문선 · 절곡',[(x1,-.114,h1),(x2,-.114,h2),(x2,-.114,top),(x1,-.114,top),
              (x1,.112,h1),(x2,.112,h2)],[(0,1,2,3),(0,4,5,1)],sun)
    # The outline band follows the intrados; the join between arch and jamb is continuous.
    curve=[(cx+rad,-.116,.012)]+[(cx+rad*cos(pi*i/36),-.116,base+rad*sin(pi*i/36)) for i in range(37)]+[(cx-rad,-.116,.012)]
    rim('오목한 아치 몰딩',curve,.018,pale)
    block('벽감의 유백색 등판',cx,.18,0,rad*2.03,.055,3.21,grey if cx<0 else cream)
# Many rows are visible through the left arch, with plush ears over the shelf edges.
for h in [.22,.73,1.24,1.75,2.26,2.755]:
    rr=1.31 if h<1.75 else max(.06,(1.32**2-(h-1.74)**2)**.5)
    block('인형 칸막이 선반',-1.77,-.025,h,2*rr,.40,.034,cream)
for dx in [-.43,.43]:
    block('선반 칸의 세로판',-1.77+dx,-.025,.25,.033,.40,2.63,cream)
def zip_bag(x,z,tone,round_ears=False):
    ellipse('아동용 둥근 파우치',x,-.097,z+.157,.182,.103,.157,tone,16,9)
    curve=[(x+.159*cos(a),-.138,z+.166+.129*sin(a)) for a in [pi*i/22 for i in range(23)]]
    rim('파우치 지퍼선',curve,.005,ochre)
    ellipse('지퍼 손잡이',x+.145,-.153,z+.157,.011,.006,.027,cream,8,5)
    if round_ears:
        for side in [-1,1]:
            ellipse('파우치 옆 귀',x+side*.125,-.096,z+.289,.060,.032,.062,tone)
    else:
        rim('손가락 손잡이',[(x+.095*cos(pi*i/14),-.09,z+.255+.10*sin(pi*i/14)) for i in range(15)],.009,tone)


def character_cushion(x,z,mouse,bow):
    tone=ink if mouse else honey
    ellipse('큰 캐릭터 얼굴 쿠션',x,-.084,z+.207,.214,.127,.204,tone,18,10)
    for side in [-1,1]:
        ellipse('둥근 쿠션 귀',x+side*.166,-.064,z+.379,.098 if mouse else .074,.046,.099 if mouse else .066,tone)
    face=ivory if mouse else butter
    for side in [-1,1]:
        ellipse('얼굴의 옅은 볼',x+side*.061,-.177,z+.20,.100,.052,.130,face,15,8)
        ellipse('감은 속눈썹',x+side*.062,-.227,z+.218,.013,.004,.021,ink,8,4)
    ellipse('연한 주둥이',x,-.211,z+.132,.103,.043,.057,face)
    ellipse('코',x,-.250,z+.160,.033,.012,.020,ink)
    if bow:
        for side in [-1,1]:
            ellipse('분홍색 머리 리본',x+side*.073,-.133,z+.378,.088,.046,.054,rose,14,7,side*.4)
        ellipse('리본 중심',x,-.171,z+.382,.035,.022,.037,blush)


for i,h in enumerate([.256,.766,1.276,1.786,2.296]):
    if i==4:
        for k in range(3):
            character_cushion(-1.77+(k-1)*.52,h,k!=2,k==1)
    elif i==3:
        for k in range(5):
            x=-1.77+(k-2)*.443
            if k in (2,3): character_cushion(x,h,k==2,True)
            else: zip_bag(x,h,[rose,sky,mint,honey,blush][k],k<2)
    elif i==2:
        for k,tone in enumerate([rose,ivory,ink,honey,butter,caramel]):
            x=-1.77+(k-2.5)*.379
            if k<3: zip_bag(x,h,tone)
            else: plush(x,-.086,h,.77,tone,'bear')
    elif i==1:
        for k in range(7):
            x=-1.77+(k-3)*.344
            if k in (0,4): zip_bag(x,h,[rose,sky][k//4])
            else: plush(x,-.091,h,.79,[butter,honey,ivory,caramel][k%4],'bunny' if k%2 else 'bear')
    else:
        for k in range(6):
            x=-1.77+(k-2.5)*.39
            block('하단 상품 패키지',x,-.05,h,.33,.27,.25,[rose,sky,mint,butter][k%4])
            block('패키지 앞면 창',x,-.188,h+.043,.232,.003,.154,ivory)
            ellipse('패키지의 동물 일러스트',x,-.193,h+.114,.063,.004,.064,blush if k%2 else honey)
# The small caption sits within the bedding recess, facing the sales floor.
plaque=block('침구 소개판',2.46,-.143,1.89,.69,.023,.51,ivory)
for word,hh in [('Sweet',2.237),('Dream',2.118)]:
    curve=bpy.data.curves.new(word,'FONT')
    curve.body=word;curve.align_x='CENTER';curve.align_y='CENTER';curve.size=.122;curve.resolution_u=4
    label=bpy.data.objects.new(word,curve);group.objects.link(label)
    label.location=(2.46,-.164,hh);label.rotation_euler[0]=pi/2
    bpy.context.view_layer.update()
    data=bpy.data.meshes.new_from_object(label.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    part=bpy.data.objects.new(word+' · 레터링',data);group.objects.link(part)
    part.matrix_world=label.matrix_world.copy();data.materials.append(ink);bpy.data.objects.remove(label,do_unlink=True)
oval_slab('침대 밑의 올리브색 단모 카펫',1.73,-1.00,.003,3.17,2.38,.011,leaf)
# The bed in the right lighted recess extends into the shop without crossing its aisle.
for xx in [1.75-.56,1.75+.56]:
    for yy in [-1.52,-.35]:
        block('침대 다리',xx,yy,.02,.105,.105,.29,cream)
block('아이보리 프레임',1.75,-.99,.22,1.55,1.87,.34,cream)
pillow('모서리가 둥근 매트리스',1.75,-.99,.55,1.55,1.86,.165,ivory,ivory)
head=[(1.75+.73*cos(pi*i/24),.58+.86*sin(pi*i/24)) for i in range(25)]+[(1.02,.45),(2.48,.45)]
extrude('레몬색 반원 침대 머리판',head,'Y',-.14,-.05,sun)
pillow('침대 위 연하늘 베개',1.76,-.47,.715,1.02,.52,.204,sky,cream,-.035)
# Quilt drapes over the foot and both edges; the stitch channels follow the same surface.
def quilt(u,v):
    dx=.84*u; yy=-1.11+.91*v
    drop=.215*max(0,(abs(u)-.80)/.20)**1.25+.24*max(0,(-v-.80)/.20)**1.25
    zz=.758+.023*cos(u*5*pi+v*.23)**2+.016*cos(v*4*pi-u*.3)**2-drop
    return (1.75+dx,yy,zz)
nu,nv=24,16
obj('아이보리 누비이불',[quilt(i*2/nu-1,j*2/nv-1) for j in range(nv+1) for i in range(nu+1)],
    [(j*(nu+1)+i,j*(nu+1)+i+1,(j+1)*(nu+1)+i+1,(j+1)*(nu+1)+i) for i in range(nu) for j in range(nv)],ivory,True)
for k in range(-4,5):
    pts=[quilt(k*.20,j*2/nv-1) for j in range(nv+1)]
    rim('누비선',[(x,y,z+.002) for x,y,z in pts],.0025,cream)
for j in range(3):
    for i in range(5):
        u=-.64+i*.31+.05*(j%2);v=-.50+j*.39
        x,y,z=quilt(u,v)
        ellipse('누비이불의 꽃잎',x,y,z+.004,.024,.014,.004,[rose,lilac,sky][(i+j)%3],9,4)

start('모던하우스 키즈 · 베개 진열대','pillows',9)
oval_slab('타원형 매대의 노란 테',0,0,.838,3.43,1.07,.075,sun)
oval_slab('크림색 상판',0,0,.913,3.43,1.07,.027,cream)
block('선반 아래 받침',0,.01,.06,2.90,.78,.073,pale)
for xx in [-1.42,-.48,.48,1.42]:
    block('둥근 매대의 칸막이',xx,0,.122,.041,.78,.715,sun)
for k in range(6):
    x=-1.14+k*.451
    for j in range(3+(k%2)):
        pillow('접어서 놓은 유아 홑이불',x,-.031,.139+j*.052,.413,.57,.059,[ivory,rose,sky][(k+j//3)%3],cream,.03*sin(k+j))
for k,(x,y,t,m,p) in enumerate([(-1.12,.05,.22,sky,cream),(-.61,-.08,-.22,sky,denim),
                (-.09,.11,.10,rose,blush),(.47,-.11,-.16,ivory,lilac),(1.08,.07,-.20,ivory,blush)]):
    pillow('부드러운 어린이 베개',x,y,.943+.015*(k%2),.72,.59,.209,m,p,t)
    if k in (1,4):
        rim('바느질한 면 라벨',[(x+.13,y-.275,1.029),(x+.15,y-.305,.997),(x+.16,y-.33,.944)],.013,denim)

start('모던하우스 키즈 · 물병과 도시락','gifts',16)
oval_slab('물병 매대의 노란 상판',0,0,.91,2.47,.80,.055,pale)
block('물병 진열대 하단 선반',0,0,.07,2.05,.68,.054,pale)
block('물병 진열대 중단 선반',0,.015,.47,2.05,.65,.037,pale)
block('물병 매대 뒷면',0,.306,.09,2.13,.09,.819,sun)
for x in [-1.01,1.01]:
    block('골이 있는 측판',x,0,.108,.078,.68,.80,sun)
    for j in range(15):
        block('측판의 좁은 줄홈',x+(.040 if x>0 else -.040),-.315+j*.045,.12,.007,.014,.77,ochre)
def bottle(x,y,z,m,height):
    n=16;spec=[(.052,0),(.063,.022),(.062,.70*height),(.052,.79*height),(.040,.82*height),(.040,height)]
    verts=[(x+r*cos(tau*i/n),y+r*sin(tau*i/n),z+hh) for r,hh in spec for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(5) for i in range(n)]
    ob=obj('파스텔 물병 · 나사식 마개',verts,faces+[tuple(range(5*n,6*n))],m,True)
    ob.data.materials.append(cream)
    for f in list(ob.data.polygons)[4*n:]:
        f.material_index=1
    rim('집게형 보틀 손잡이',[(x+.036+.030*sin(pi*i/12),y,z+height-.012+.039*cos(pi*i/12)) for i in range(13)],.005,m)
for row in range(2):
    for col in range(7):
        bottle(-.98+.183*col,-.20+row*.16,.965,[pale,sky,mint,rose][(col+row)%4],.223+.02*(col%2))
for col in range(3):
    for j in range(3):
        x=.49+col*.239
        block('도시락 상자',x,.026,.966+j*.079,.219,.27,.061,[pale,rose,mint][col])
        block('도시락 뚜껑',x,.026,1.025+j*.079,.225,.275,.017,cream)
for col in range(5):
    for j in range(2):
        block('유아 수저케이스 포장',-.78+col*.39,-.035,.514+j*.063,.339,.40,.055,rose if col%2 else butter)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=13
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'kids.blend'),compress=True)
runpy.run_path(str(HERE.parent/'interior-architecture'/'export.py'),run_name='__main__')
for file in ('arches','pillows','gifts'):
    subprocess.run(['node',str(HERE.parents[2]/'tools'/'pack_display.mjs'),str(HERE/(file+'.glb'))],check=True)
