"""Rebuild the CDG Gangnam retail vignette in metres; +X right, -Y to customer."""
from pathlib import Path
from math import sin, cos, pi, sqrt, atan2
import tempfile
import subprocess
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
library = bpy.data.collections.new('SSG_6F_CDG')
scene.collection.children.link(library)
batches = {k: [] for k in ['CdgGangnamLacquer','CdgGangnamCutAndSewn','CdgGangnamRepeat','CdgGangnamInk']}
CASE,CLOTH,PRINT,INK = batches
white = (.87,.86,.85)
black = (.012,.013,.018)
navy = (.024,.026,.037)
olive = (.081,.091,.049)
silver = (.40,.41,.43)
paper = (.79,.78,.77)
def material(name,rough):
    m=bpy.data.materials.new(name); m.use_nodes=True
    m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=rough
    return m
mats={k:material(k,r) for k,r in zip(batches,[.31,.78,.51,.77])}
for k in [CASE,CLOTH,INK]:
    tree=mats[k].node_tree
    col=tree.nodes.new('ShaderNodeVertexColor');col.layer_name='Pigment'
    tree.links.new(col.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['node',str(OUT/'graphics.mjs'),tmp],check=True)
    for k,file in [(PRINT,'repeat'),(INK,'ink')]:
        tree=mats[k].node_tree;tex=tree.nodes.new('ShaderNodeTexImage')
        tex.image=bpy.data.images.load(str(Path(tmp)/(file+'.png')));tex.image.pack()
        shader=tree.nodes.get('Principled BSDF')
        if k==INK:
            tree.links.new(tex.outputs['Alpha'],shader.inputs['Alpha'])
            mats[k].blend_method='CLIP'
            mats[k].alpha_threshold=.48
        else:tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])

def mesh(name,v,faces,k,color=white,uv=None,smooth=False,facecolors=None):
    me=bpy.data.meshes.new(name);me.from_pydata(v,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);library.objects.link(ob)
    me.materials.append(mats[k]);batches[k].append(ob)
    if k!=PRINT:
        attr=me.color_attributes.new(name='Pigment',type='BYTE_COLOR',domain='CORNER')
        for i,p in enumerate(me.polygons):
            rgba=(*(facecolors[i] if facecolors else color),1)
            for j in p.loop_indices:attr.data[j].color=rgba
    if uv:
        layer=me.uv_layers.new(name='Print')
        for p in me.polygons:
            for j in p.loop_indices:layer.data[j].uv=uv[me.loops[j].vertex_index]
    if smooth:
        for p in me.polygons:p.use_smooth=True
    return ob

def block(name,c,dim,color=white,k=CASE,angle=0):
    x,y,z=c;w,d,h=[n/2 for n in dim]
    v=[(x+i*w*cos(angle)-j*d*sin(angle),y+i*w*sin(angle)+j*d*cos(angle),z+l*h)
       for l in [-1,1] for i,j in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    return mesh(name,v,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],k,color)

def rings(name,rows,k,color,smooth=True,bands=None,cap=True):
    n=len(rows[0]);f=[];cols=[]
    for j in range(len(rows)-1):
        for i in range(n):
            a=j*n+i;b=j*n+(i+1)%n
            f.append((a,b,b+n,a+n));cols.append(bands[j] if bands else color)
    if cap:
        f.extend([tuple(reversed(range(n))),tuple(range((len(rows)-1)*n,len(rows)*n))]);cols.extend([color,color])
    return mesh(name,[p for row in rows for p in row],f,k,color,smooth=smooth,facecolors=cols)

def rod(name,a,b,r,color=silver,k=CASE):
    a,b=Vector(a),Vector(b);axis=(b-a).normalized()
    u=axis.cross(Vector((1,0,0)))
    if u.length<.01:u=axis.cross(Vector((0,1,0)))
    u.normalize();v=axis.cross(u)
    rings(name,[[tuple(p+r*(u*cos(t*pi/5)+v*sin(t*pi/5))) for t in range(10)] for p in [a,b]],k,color)

def sheet(name,coords,uv,k=PRINT,color=white):
    return mesh(name,coords,[(0,1,2,3)],k,color,uv)
def wall(name,x1,y1,x2,y2,h,vertical=True):
    length=sqrt((x2-x1)**2+(y2-y1)**2)
    uv=[(0,0),(0,length/.53),(-h/1.32,length/.53),(-h/1.32,0)] if vertical else [(0,0),(length/1.32,0),(length/1.32,h/.53),(0,h/.53)]
    sheet(name,[(x1,y1,.025),(x2,y2,.025),(x2,y2,h),(x1,y1,h)],uv)
# Open retail installation within the existing game room. The front portion
# keeps the plain white surround visible, as in the opening photograph.
W=2.72;rear=2.9;front=-6.15;H=3.02
wall('뒷벽 세로 인쇄',-W,rear,W,rear,H)
wall('왼쪽 벽 인쇄',-W,front,-W,rear,H)
wall('오른쪽 벽 인쇄',W,rear,W,front,H)
sheet('가로 인쇄 바닥',[(-W,front,.036),(W,front,.036),(W,rear,.036),(-W,rear,.036)],[(0,0),(2*W/1.47,0),(2*W/1.47,(rear-front)/.58),(0,(rear-front)/.58)])
for idx in range(4):
    left=-W+idx*1.45;right=min(W,left+.48)
    sheet('천장 인쇄 띠',[(left,front,H),(left,rear,H),(right,rear,H),(right,front,H)],[(0,0),((rear-front)/1.32,0),((rear-front)/1.32,.95),(0,.95)])
for x in [-1.6,1.56]:
    block('조명 레일',(x,-1.49,H+.025),(.036,8.7,.045),silver)
    for y in [-4.9,-2.6,-.2,2.1]:
        rod('트랙 램프',(x,y,H),(x-.04,y+.05,H-.14),.042,paper)
        rod('램프 렌즈',(x-.04,y+.05,H-.14),(x-.045,y+.055,H-.15),.033,(1,.98,.87))
# White counter with a recessed plinth, end caps and fine shadow joints.
block('진열대 받침',(1.91,-2.22,.093),(.54,4.92,.12),(.55,.54,.52))
block('백색 긴 진열대',(1.91,-2.22,.53),(.63,5,.84),white)
block('진열대 상판',(1.91,-2.22,.958),(.65,5.02,.024),(.96,.94,.91))

def ink(name,point,width,height,tile,color=white):
    # Subdivide to let lettering follow the actual breast/back curvature.
    v=[];uv=[];faces=[]
    cols,rows=(2,2) if name=='접힌 단의 인쇄' else (11,4)
    for j in range(rows):
        for i in range(cols):
            u=i/(cols-1);t=j/(rows-1)
            v.append(point((u-.5)*width,(t-.5)*height))
            uv.append((u,1-(tile+1-t)/8))
            if j and i:
                a=j*cols+i;faces.append((a-cols-1,a-cols,a,a-1))
    mesh(name,v,faces,INK,color,uv)

def garment(name,c,kind,color,angle=0,scale=1,graphic=0):
    # Garment space uses front at -Y. The yoke and arm slope differ by cut.
    striped=kind=='stripe'; jacket=kind in ('coach','stadium','hood','coat')
    short=kind=='tee';w=.287 if jacket else .268; L=.71 if jacket else .69
    if kind=='coat':L=.94
    ca,sa=cos(angle),sin(angle)
    def tr(x,y,z):
        return (c[0]+scale*(x*ca-y*sa),c[1]+scale*(x*sa+y*ca),c[2]+scale*z)
    def surface(a,t):
        # Eased shoulder line and slight rippling at hem; fabric hangs hollow.
        taper=1-.08*sin(pi*t)-(.61*max(0,(t-.79)/.21)**1.48)
        fold=(.009*sin(9*a+.5+t*2)+.004*sin(18*a-t*4))*(1-.60*t)
        if kind=='hood':
            taper*=.84+.19*min(1,t/.14)
            fold+=.012*sin(5*a+t*3)+.011*cos(9*a-1.4)*max(0,1-abs(t-.13)*5)
        depth=(.092 if kind=='hood' else .079 if jacket else .05)*(.84+.16*sin(pi*t))
        return (w*taper*sin(a),-(depth+fold)*cos(a),
                L*(t-1)-.016*cos(3*a+.5)*(1-t)**2-.035*abs(sin(a))*t**4)
    stripes=38
    levels=[i/stripes for i in range(stripes+1)] if striped else [0,.025,.065,.17,.33,.54,.72,.79,.86,.92,.97,1]
    rows=[[tr(*surface(2*pi*i/40,t)) for i in range(40)] for t in levels]
    bands=[(paper if j%2 else navy) if striped else color for j in range(len(levels)-1)]
    body=rings(name+' 몸판',rows,CLOTH,color,bands=bands,cap=False)
    # Baked light in the folds retains the drape in diffuse mall lighting.
    def fabric_shade(ob,n):
        me=ob.data;attr=me.color_attributes['Pigment']
        for face in me.polygons:
            for li in face.loop_indices:
                i=me.loops[li].vertex_index;a=2*pi*(i%n)/n;t=(i//n)/max(1,len(me.vertices)//n-1)
                light=.92+.30*cos(a-.5)+.23*sin(9*a+t*2)+.16*cos(5*a-.5-t*3)
                old=attr.data[li].color[:]
                attr.data[li].color=(*(min(1,old[j]*light) for j in range(3)),1)
    fabric_shade(body,40)
    hem=[ [tr(*(lambda p:(p[0]*1.008,p[1]*1.028,p[2]))(surface(2*pi*i/40,t))) for i in range(40)] for t in [.002,.014,.026,.041,.059] ]
    rings(name+' 밑단 박음질',hem,CLOTH,color,bands=[color,tuple(c*.72 for c in color),color,tuple(c*.8 for c in color)],cap=False)
    for sign in [-1,1]:
        sleeve_steps=26 if striped else 22 if kind in ('hood','coat') else 9
        levels2=[i/sleeve_steps for i in range(sleeve_steps+1)]
        sleeve=[]
        for t in levels2:
            rad=(.096 if jacket else .082)*(1-(.34 if short else .51)*t)
            row=[]
            for i in range(20):
                a=2*pi*i/20
                dr=rad*(1+.10*sin(5*a+2*t)+.09*cos(t*25)*(t**1.7))
                if kind=='hood':
                    dr*=1+.16*sin(t*48+a*1.6)+.09*cos(t*31-2*a)
                sx=(w*(.67+.10*min(t*6,1))+(.106 if short else .14)*t+.021*sin(pi*t))*sign
                sz=-.091-(.21 if short else .56)*t
                row.append(tr(sx+dr*cos(a),-.004-.035*t+dr*.83*sin(a),sz-.043*cos(a)*sign*(1-t)+.006*cos(a)*sign*t))
            sleeve.append(row)
        sleeve_ob=rings(name+' 소매',sleeve[::-1],CLOTH,color,bands=[(paper if j%2 else navy) if striped else color for j in range(len(sleeve)-1)])
        fabric_shade(sleeve_ob,20)
        if kind=='coat':
            attr=sleeve_ob.data.color_attributes['Pigment']
            for poly in sleeve_ob.data.polygons:
                if (poly.index//20)%2:continue
                for li in poly.loop_indices:attr.data[li].color=(.032,.042,.067,1)
        if jacket:
            for h in [0,.012,.024]:
                end=sleeve[-1]
                rings(name+' 시보리',[[tuple(p) for p in end],[(x,y,z-scale*(h+.012)) for x,y,z in end]],CLOTH,paper if kind=='stadium' and h==.012 else navy)
    neck=[]
    for t,r in [(0,.098),(1,.087),(1,.072),(0,.078)]:
        neck.append([tr(r*sin(a),-.056*cos(a),.006+t*.024-.02*cos(a)) for a in [2*pi*i/28 for i in range(28)]])
    rings(name+' 목둘레',neck,CLOTH,navy if striped else color,cap=False)
    if kind=='coach':
        # Turn-down collar, snap placket and two oblique welt pockets.
        for s in [-1,1]:
            coords=[tr(.006*s,-.057,.001),tr(.084*s,-.039,.009),tr(.119*s,-.061,-.074),tr(.057*s,-.081,-.106)]
            sheet('코치 재킷 칼라',coords,[(0,0)]*4,CLOTH,color)
            rod('사선 주머니 입술',tr(.227*s,-.057,-.42),tr(.136*s,-.077,-.535),.008,navy,CLOTH)
        rod('앞여밈',tr(0,-.088,-.68),tr(0,-.087,-.075),.009,color,CLOTH)
        for j in range(6):
            zz=-.12-j*.101
            rod('스냅 단추',tr(0,-.092,zz),tr(0,-.099,zz),.007,silver)
    def patch(dx,dz):
        t=1+(-.274+dz)/L
        # Invert local cross-section for this small print region.
        from math import asin
        width=w*(1-.08*sin(pi*t));a=asin(max(-.99,min(.99,dx/width)))
        px,py,pz=surface(a,t)
        return tr(px,py-.007,pz)
    if kind=='hood':
        # The displayed olive jacket faces the wall. A collapsed, open hood
        # sits on the yoke, with a rolled mouth, gathered crown and shoulder seam.
        hood=[]
        for j,(ww,dd,cy,zz) in enumerate([(.05,.023,-.063,-.24),(.104,.043,-.080,-.201),
                (.150,.060,-.086,-.13),(.160,.070,-.077,-.066),(.156,.074,-.071,-.027),
                (.159,.076,-.069,-.014),(.147,.068,-.067,-.008),(.127,.048,-.068,-.061),
                (.06,.022,-.066,-.118)]):
            row=[]
            for i in range(36):
                a=2*pi*i/36
                row.append(tr(ww*sin(a),cy-dd*cos(a)+.007*sin(5*a+j/2),
                              zz-.030*cos(a)+.014*sin(3*a+.3*j)))
            hood.append(row)
        fabric_shade(rings('뒤로 접힌 후드와 안감',hood,CLOTH,color,
                           bands=[color]*5+[tuple(c*.72 for c in color),tuple(c*.32 for c in color),tuple(c*.19 for c in color)]),36)
        ink('등판 검정 삼단 인쇄',patch,.372,.20,3,(.012,.016,.009))
    elif kind!='coach':ink(name+' 실크 인쇄',patch,.39 if jacket else .33,.13,graphic,black if color==paper or striped else white)
    # Bent steel hook, pale hanger shoulders, and a shallow chrome wall peg.
    for s in [-1,1]:
        rod('옷걸이 어깨',tr(0,0,.02),tr(.218*s,0,-.071),.009,silver)
    hook=[tr(-.012,0,.015),tr(-.011,0,.071),tr(.017,0,.089),tr(.021,0,.11),tr(.009,0,.124),tr(-.012,0,.119),tr(-.02,0,.106)]
    for a,b in zip(hook,hook[1:]):rod('걸고리',a,b,.0035,silver)
    rod('벽걸이 봉',tr(0,.28,.104),tr(0,-.012,.104),.009,silver)

# Hollow lacquer cylinder. Its slotted shell is built as continuous curved
# sections, leaving actual deep openings instead of painted rectangles.
CX,CY,R=-.79,.36,.83
def barrel(a,r,z):
    return CX+r*sin(a),CY-r*cos(a),z
def panel(name,a,b,r0,r1,z0,z1,color):
    n=max(2,round((b-a)*12))
    v=[]
    for i in range(n+1):
        k=a+(b-a)*i/n
        v.extend([barrel(k,r0,z0),barrel(k,r1,z0),barrel(k,r1,z1),barrel(k,r0,z1)])
    f=[(0,3,2,1),(4*n,4*n+1,4*n+2,4*n+3)]
    for i in range(n):
        for j in range(4):
            p=4*i+j;q=4*i+(j+1)%4
            f.append((p,q,q+4,p+4))
    ob=mesh(name,v,f,CASE,color)
    attr=ob.data.color_attributes['Pigment']
    for face in ob.data.polygons:
        for li in face.loop_indices:
            idx=ob.data.loops[li].vertex_index
            theta=a+(b-a)*(idx//4)/n
            # Soft reflected light on the lacquer and darker inner reveal.
            factor=.78+.16*cos(theta+.55)+.08*cos(2*theta-.28)
            if idx%4 in (0,3):factor*=.84
            attr.data[li].color=(*(min(1,c*factor) for c in color),1)
# Angles increase around the customer-facing curved shelf.
for z0,z1 in [(.04,.18),(.72,.82),(1.58,1.77),(2.14,2.34)]:
    panel('원통 진열장 띠',-pi,pi,.012,R,z0,z1,white)
for row,(z0,z1,holes) in enumerate([(.18,.72,[(-1.33,1.19),(1.45,2.55),(-2.68,-1.57)]),
                                    (.82,1.58,[(-1.63,-.88),(-.23,.18),(.38,1.15),(1.47,2.42)]),
                                    (1.77,2.14,[(-1.61,-.84),(-.66,.22),(.38,1.23),(1.51,2.42)])]):
    last=-pi
    for a,b in sorted(holes):
        panel('곡면 문설주',last,a,R-.12,R,z0,z1,white)
        panel('수납칸 안쪽',a,b,R-.36,R-.34,z0,z1,(.48,.47,.46))
        for side in [a,b-.018]:panel('수납칸 옆판',side,side+.018,R-.34,R,z0,z1,paper)
        if row==1 and a>.3:panel('중간 선반',a,b,R-.34,R,.99,1.015,white)
        last=b
    panel('곡면 문설주',last,pi,R-.12,R,z0,z1,white)

def folded(a,z,color,width,idx):
    # Rounded perimeter with two hem lips, an uneven rolled leading edge and
    # a compressed crown. Each visible folded edge takes the ink separately.
    x,y,_=barrel(a,R-.163,z);ca,sa=cos(a),sin(a)
    def pt(u,v,h):return (x+u*ca-v*sa,y+u*sa+v*ca,z+h)
    d=.255;h=.055
    rows=[]
    for zz,sc in [(0,.91),(.009,.994),(.019,1),(.025,.965),(.038,1),(.05,.98),(.057,.90)]:
        row=[]
        for i in range(32):
            t=2*pi*i/32
            rx=cos(t);ry=sin(t)
            u=width/2*(1 if rx>=0 else -1)*abs(rx)**.34
            v=d/2*(1 if ry>=0 else -1)*abs(ry)**.34
            row.append(pt(sc*u,sc*v,zz+.0025*sin(17*u+idx)*cos(t)))
        rows.append(row)
    rings('접힌 인쇄 셔츠',rows,CLOTH,color)
    ink('접힌 단의 인쇄',lambda u,v:pt(u,-d*.51,v+h/2),width*.98,.076,idx%3,black if color==paper else white)
for a,bottom,count,w in [(-.78,.18,8,.33),(-.15,.18,8,.33),(.55,.18,7,.40),(.74,1.015,8,.32),
                         (-.32,1.77,5,.38),(.77,1.77,5,.34),(1.89,1.77,5,.33),(-1.20,1.77,4,.32),
                         (1.99,.82,8,.32),(-1.25,.82,6,.32)]:
    for j in range(count):
        folded(a+.014*sin(j*3.4),bottom+j*.057,paper if (j//3+int(a*2))%3==0 else navy,w,j)

# Six-panel cap: domed crown, top button, stitched seams and a curved bill.
def cap(x,y,z,color):
    row=[]
    for j in range(8):
        t=j/7*pi*.49
        row.append([(x+.105*cos(t)*cos(i*pi/16),y+.104*cos(t)*sin(i*pi/16),z+.124*sin(t)) for i in range(32)])
    rings('육쪽 모자 크라운',row,CLOTH,color)
    v=[];f=[]
    for j in range(3):
        for i in range(17):
            a=-1+i/8;u=a*.095
            v.append((x+u,y-.065-j*.042*(1-.64*a*a),z+.017-.034*a*a-.002*j))
            if j and i:
                n=len(v)-1;f.append((n-18,n-17,n,n-1))
    mesh('모자 챙',v,f,CLOTH,color,smooth=True)
    for i in range(0,32,5):
        for j in range(6):
            rod('패널 솔기',row[j][i],row[j+1][i],.0016,navy,CLOTH)
    rod('모자 꼭지',(x,y,z+.12),(x,y,z+.13),.012,color,CLOTH)
panel('모자 받침',-.23,.18,R-.34,R,1.042,1.066,white)
for z in [.84,1.07]:
    px,py,_=barrel(-.02,R-.15,z);cap(px,py,z,black)
# Jacket and scarf mounted on the uncut face of the cylinder.
px,py,_=barrel(-.59,R+.068,1.59)
garment('스타디움 재킷',(px,py,1.60),'stadium',black,-.59,.94,2)
def scarf():
    v=[];f=[];cols=[]
    for side in [-1,1]:
        base=len(v)
        for j in range(31):
            t=j/30
            for i in range(5):
                w=(i/4-.5)*.081
                xx=side*(.057+.056*t)+w+.012*sin(5*t)
                yy=-.10-.025*sin(4*t+w*33)-.01*sin(w*60)
                v.append((px+xx*cos(-.59)-yy*sin(-.59),py+xx*sin(-.59)+yy*cos(-.59),1.615-t*(.70+.065*side)))
                if i and j:
                    k=len(v)-1;f.append((k-6,k-5,k,k-1));cols.append(paper if (i//2+j//3)%2 else black)
        for i in range(5):
            x,y,z=v[-5+i];rod('머플러 수술',(x,y,z),(x+.004,y,z-.036),.0025,paper,CLOTH)
    mesh('체커보드 머플러',v,f,CLOTH,paper,facecolors=cols)
scarf()
# Back gallery: the branch photograph shows black/white tops and a long-sleeve
# striped shirt on pegs, with a second row hung below the first.
for x,z,kind,col,idx in [(-1.79,2.23,'tee',black,1),(-.65,2.23,'tee',paper,1),
                         (.60,2.23,'tee',black,3),(1.80,2.18,'coach',navy,0),
                         (.04,1.28,'stripe',paper,0)]:
    garment('벽걸이 의류',(x,rear-.21,z),kind,col,0,1.05,idx)
for side in [-1,1]:
    for j,yy in enumerate([-4.26,-2.64,-.99,.99]):
        if side==1 and j==0:continue  # Keep the entrance coat clear of the side rail.
        kind=['coach','stadium','tee','stripe'][j]
        col=[olive if side<0 else navy,black,paper,paper][j]
        garment('옆벽 의류',(side*(W-.19),yy,1.99),kind,col,pi/2 if side<0 else -pi/2,1.04,j%4)
# Front-facing wall panel supporting the olive coach jacket, photographed at
# the left entrance. A clear aisle passes between it and the long right counter.
x1,x2=-W,-1.62;yf=-4.97
block('왼쪽 돌출 패널',((x1+x2)/2,yf+.053,1.52),(x2-x1,.10,3.0))
wall('입구 세로 인쇄',x1,yf-.003,x2,yf-.003,H)
garment('입구 후드 블루종',(-2.16,yf-.13,2.03),'hood',olive,0,1.17)
# Opposite end display. Keep it behind the long counter, leaving room to pass.
wall('오른쪽 인쇄 패널',1.72,-4.06,W,-4.06,H)
garment('스태프 코트 등판',(2.22,-4.20,2.07),'coat',black,0,1.08,4)

bpy.context.preferences.filepaths.save_version=0
print('Editable meshes',sum(len(o) for o in batches.values()))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# The tightly stacked folded shirts only expose the outer roll in normal play.
for ob in list(batches[CLOTH]):
    if not ob.name.startswith('접힌 인쇄 셔츠'):continue
    old=ob.data;rgba=old.color_attributes['Pigment'].data[0].color[:3]
    levels=[0,1,3,4,6]
    rows=[[tuple(old.vertices[j*32+i].co) for i in range(0,32,2)] for j in levels]
    rings('접힌 셔츠 경량',rows,CLOTH,rgba)
    batches[CLOTH].remove(ob);bpy.data.objects.remove(ob,do_unlink=True)
for name,obs in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for ob in obs:ob.select_set(True)
    bpy.context.view_layer.objects.active=obs[0]
    bpy.ops.object.join()
    bpy.context.object.name=name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
