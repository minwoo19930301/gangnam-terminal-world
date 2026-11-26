"""Model the visible edge of the reading deck in the Gangnam Shinsegae branch."""
import math
import random
from pathlib import Path
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('YPBooksReadingBay')
bpy.context.scene.collection.children.link(collection)
rng=random.Random(6550)
materials={}
def material(code):
    if code not in materials:
        mat=bpy.data.materials.new(code)
        rgb=[int(code[i:i+2],16)/255 for i in (0,2,4)]
        mat.diffuse_color=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb]+[1]
        materials[code]=mat
    return materials[code]

verts,faces,tints=[],[],[]
def face(points,color):
    base=len(verts)
    verts.extend(points);faces.append(tuple(range(base,base+len(points))));tints.append(color)
def part(name):
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces)
    paint=list(dict.fromkeys(tints))
    for code in paint:data.materials.append(material(code))
    for poly,code in zip(data.polygons,tints):poly.material_index=paint.index(code)
    obj=bpy.data.objects.new(name,data);collection.objects.link(obj)
    verts.clear();faces.clear();tints.clear()
def block(x,y,z,w,d,h,color):
    base=[(x+a*w/2,y+b*d/2,z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    top=[(px,py,z+h) for px,py,_ in base]
    face(base[::-1],color);face(top,color)
    for i in range(4):face([base[i],base[(i+1)%4],top[(i+1)%4],top[i]],color)
def rod(a,b,r,s,color,n=7):
    a,b=Vector(a),Vector(b);axis=(b-a).normalized()
    ref=Vector((0,0,1)) if abs(axis.z)<.85 else Vector((0,1,0))
    u=axis.cross(ref).normalized();v=axis.cross(u)
    lo,hi=[[tuple(c+rad*(u*math.cos(i*math.tau/n)+v*math.sin(i*math.tau/n))) for i in range(n)] for c,rad in [(a,r),(b,s)]]
    face(lo[::-1],color);face(hi,color)
    for i in range(n):face([lo[i],lo[(i+1)%n],hi[(i+1)%n],hi[i]],color)

# Three dark risers and warm timber nosings can be read from the court.
for i in range(3):
    first=2.08+.31*i
    rear=first+.31 if i<2 else 4.92
    level=(i+1)*.16
    block(-1.23,(first+rear)/2,level-.16,2.54,rear-first,.132,'34332d')
    # Stagger boards with their grain across the step; the back platform has
    # several successive courses just as the photographed deck does.
    courses=max(2,math.ceil((rear-first)/.135))
    depth=(rear-first)/courses
    for row in range(courses):
        x=-2.5
        while x<.038:
            end=min(.04,x+rng.uniform(.56,1.05))
            tint=rng.choice(['af8154','b18455','b68a5b','b58756','ac7c51'])
            block((x+end)/2,first+(row+.5)*depth,level-.025,end-x-.002,depth-.0015,.027,tint)
            x=end
    block(-1.23,first+.009,level-.031,2.54,.026,.029,'c89c69')
part('독서 공간 · 짙은 챌판과 원목 디딤판')

# Shelves viewed across the corner of the branch. Use different book heights,
# page blocks and front-facing covers, without assigning a title or sales rank.
covers=['e8e1cd','e9be72','637a9c','92b8a2','e4ad9f','e7ca96','6b906e','b86a56','73adb1','b1a6b6','343f4c','c1c999']
def shelf(side):
    sidewall=side=='left'
    length=1.80 if sidewall else 2.31
    def local(x,d,z):return (-2.49+d,3.85+x,z) if sidewall else (-1.24+x,4.91-d,z)
    def cub(x,d,z,w,dep,h,color):
        px,py,_=local(x,d,z)
        block(px,py,z,dep if sidewall else w,w if sidewall else dep,h,color)
    cub(0,.022,.48,length,.038,2.49,'e8dfca')
    for i in range(4):cub((i/3-.5)*length,.16,.48,.035,.31,2.46,'c7ae85')
    for i in range(6):
        z=.61+i*.397
        cub(0,.16,z-.031,length,.31,.042,'b4966e')
        cub(0,.311,z-.012,length,.016,.018,'ddc59e')
        if i in [3,5]:cub(0,.307,z-.033,length,.012,.012,'fff4d4')
        for j in range(3):
            start=-length/2+j*length/3+.043;end=start+length/3-.087
            if (i+2*j)%3==1 or i==5:
                count=3 if sidewall else 4
                for k in range(count):
                    w=(end-start)/count
                    x=start+(k+.5)*w
                    h=rng.uniform(.17,.26)
                    col=rng.randrange(len(covers))
                    cub(x,.22,z+.012,w*.88,.040,h,covers[col])
                    cub(x-w*.07,.244,z+.035,w*.59,.004,h*.44,covers[(col+3)%len(covers)])
                    cub(x,.245,z+h*.79,w*.61,.005,.011,'f1e9d7')
                    cub(x,.245,z+h*.71,w*.36,.005,.005,'eee7d9')
                    cub(x,.221,z+h+.01,w*.79,.027,.003,'eee6d6')
                    if (k+i)%2:
                        # A cropped sun and a hill give face-out children's books
                        # distinct silhouettes even at normal standing distance.
                        shade=covers[(col+6)%len(covers)]
                        ring=[local(x+w*(.18+.12*math.cos(t*math.tau/8)),.249,z+h*(.49+.085*math.sin(t*math.tau/8))) for t in range(8)]
                        face(ring[::-1] if sidewall else ring,shade)
            else:
                x=start
                while x<end-.035:
                    width=rng.uniform(.023,.049);mid=x+width/2
                    h=rng.uniform(.175,.27);d=rng.uniform(.099,.145)
                    code=rng.choice(covers);cub(mid,.16+d/2,z+.012,width-.002,d,h,code)
                    if rng.random()<.39:cub(mid,.162+d,z+h*.75,width*.73,.004,.018,'eae2c9')
                    x+=width
    part('원목 서가 · '+('왼쪽 벽' if sidewall else '정면 벽'))
shelf('left');shelf('back')

# In the visitor photograph the stepped area has low cushioned timber seating,
# a branching light-wood display support, and black tracks with small lamps.
for x in [-1.14,-.72]:
    block(x,3.64,.48,.09,.37,.27,'765b41')
block(-.93,3.64,.73,.71,.45,.075,'aa8359')
block(-.93,3.64,.805,.67,.422,.09,'838674')
block(-.93,3.85,.80,.71,.039,.19,'a77a4c')
part('독서 자리 · 목재 좌대와 회록색 방석')
rod((-.31,4.40,.48),(-.31,4.40,1.93),.074,.056,'b68d5c')
for i,(dx,dy,dz) in enumerate([(-.36,-.22,.71),(.19,-.12,.85),(-.19,.28,.94),(-.54,.02,.52)]):
    start=(-.31,4.40,1.72+i*.06)
    mid=(start[0]+dx*.48,start[1]+dy*.48,start[2]+dz*.61)
    end=(start[0]+dx,start[1]+dy,start[2]+dz)
    rod(start,mid,.043,.032,'bb9465');rod(mid,end,.034,.021,'c4a076')
part('서가 · 가지 모양의 목재 기둥')
for x in [-2.1,-.75]:
    block(x,3.63,3.13,.036,2.30,.045,'3d3d38')
    for d in [2.61,4.65]:rod((x,d,3.17),(x,d,4.45),.008,.008,'696861',5)
    for d in [2.70,3.58,4.26]:
        a=(x,d,3.15);b=(x-.05,d+.04,3.01);c=(b[0]-.01,b[1]+.008,b[2]-.020)
        rod(a,b,.047,.059,'42413b');rod(b,c,.050,.048,'fff0ca')
part('검은 조명 레일과 스폿')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'reading.blend'),compress=True)
exec(compile((here/'export-reading.py').read_text(),str(here/'export-reading.py'),'exec'))
