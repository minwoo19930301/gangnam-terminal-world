"""Generate editable flower arrangements. Model coordinates are x, depth, height."""
from math import cos, sin, pi
from pathlib import Path
import random
import bpy

folder = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
shop = bpy.data.collections.new('MyeongFlower')
bpy.context.scene.collection.children.link(shop)
rng = random.Random(144)
tau = 2*pi
paper = ['b199c3','a5b46a','eed2d8','f2d7ab','97b1ba','c69598']
petals = ['b82f54','ce5c86','f3dbd0','f4b835','926cb1','ed8859','fcf1cb']
greens = ['32503c','63824a','749758','476d43']

class Piece:
    def __init__(self):
        self.points, self.faces, self.colours = [], [], []

    def face(self, points, tint):
        start = len(self.points)
        self.points.extend((x,-d,h) for x,d,h in points)
        self.faces.append(tuple(reversed(range(start,len(self.points)))))
        self.colours.append(tint)

    def rings(self, rings, tones, cap=False):
        for lower, upper in zip(rings,rings[1:]):
            for i in range(len(lower)):
                j = (i+1)%len(lower)
                self.face([lower[i], lower[j], upper[j], upper[i]], tones[i%len(tones)])
        if cap:
            self.face(rings[-1], tones[0])

    def finish(self, name):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.points,[],self.faces)
        obj = bpy.data.objects.new(name,mesh)
        shop.objects.link(obj)
        slots = list(dict.fromkeys(self.colours))
        for tone in slots:
            mat = bpy.data.materials.get(tone) or bpy.data.materials.new(tone)
            rgb = [int(tone[i:i+2],16)/255 for i in (0,2,4)]
            mat.diffuse_color = [((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb]+[1]
            mesh.materials.append(mat)
        for face,tone in zip(mesh.polygons,self.colours):
            face.material_index = slots.index(tone)

def circle(x,d,h,r,n=8):
    return [(x+r*cos(tau*i/n),d+r*sin(tau*i/n),h) for i in range(n)]

def box(p,x,d,h,w,depth,height,tone):
    layers=[[(x-w/2,d-depth/2,z),(x+w/2,d-depth/2,z),(x+w/2,d+depth/2,z),(x-w/2,d+depth/2,z)] for z in [h,h+height]]
    p.rings(layers,[tone],True)

def bucket(p,x,d,h,r,height,tone):
    p.rings([circle(x,d,h,r*.72),circle(x,d,h+height,r),
             circle(x,d,h+height+.018,r*1.04),circle(x,d,h+height+.018,r*.89)], [tone])
    p.face(circle(x,d,h+height+.012,r*.9),'354a36')

def bloom(p,x,d,h,tone,r):
    # Two interlocking scalloped corollas and a raised pollen disk.
    for layer in range(2):
        radius=r*(1-.32*layer)
        for i in range(5):
            a=tau*i/5+layer*.63
            def point(offset,length,height):
                along = sin(a+offset)*radius*length
                # Tilt the cup towards the customer so both rims read at eye height.
                return (x+cos(a+offset)*radius*length,d+.80*along-.60*height*radius,
                        h+.60*along+.80*height*radius)
            p.face([point(0,0,.23*layer),point(-.64,.68,.36),point(-.30,1,.66),
                    point(.30,1,.67),point(.64,.68,.36)],tone if layer==0 else 'fff1cc' if tone=='fcf1cb' else tone)
    p.face(circle(x,d,h+.38*r,.23*r,5),'e3b458')

def bunch(x,d,h,wrapped,index):
    p=Piece()
    if wrapped:
        shade=paper[index%len(paper)]
        rim=[(a,b,c+.095*(i%3)+.04*sin(i)) for i,(a,b,c) in enumerate(circle(x,d,h+.45,.188,9))]
        neck=circle(x,d,h+.18,.063,9)
        p.rings([circle(x,d,h+.025,.081,9),neck,rim],[shade])
        # Inside face of the staggered paper collar, with a two-loop ribbon at the waist.
        p.rings([[(a,b,c-.028) for a,b,c in rim][::-1],rim[::-1]],[shade])
        p.rings([circle(x,d,h+.16,.069),circle(x,d,h+.195,.069)],['7b556a'])
        for side in [-1,1]:
            a=(x,d-.065,h+.18)
            p.face([a,(x+.09*side,d-.092,h+.228),(x+.11*side,d-.09,h+.162)],'855f77')
            p.face([a,(x+.032*side,d-.09,h+.172),(x+.078*side,d-.097,h+.052)],'956d86')
        base=.35
    else:
        bucket(p,x,d,h,.17,.27,['70b7b9','edc6cd','e6dfcf','677d8e'][index%4])
        base=.22
    tone=petals[index%len(petals)]
    for j in range(9):
        angle=j*2.39996+index
        radial=.055*(j**.5)
        dx,dd=cos(angle)*radial,sin(angle)*radial
        head=h+base+.19+rng.uniform(-.045,.09)
        fx,fd=x+dx,d+dd
        p.rings([circle(x+dx*.35,d+dd*.35,h+base-.025,.006,3),circle(fx,fd,head,.006,3)],[greens[j%4]])
        for side in [-1,1]:
            a=angle+side*.8; ox,od=cos(a),sin(a)
            p.face([(fx,fd,head-.10),(fx+.045*ox-.019*od,fd+.045*od+.019*ox,head-.072),
                    (fx+.088*ox,fd+.088*od,head-.02),(fx+.045*ox+.019*od,fd+.045*od-.019*ox,head-.067)],greens[(j+side)%4])
        bloom(p,fx,fd,head,petals[(index+2)%7] if wrapped and j%4==1 else tone,rng.uniform(.051,.073))
    p.finish(('포장 꽃다발' if wrapped else '절화 양동이')+f' {index:02}')

racks=Piece()
for side in [-1,1]:
    for row in range(3):
        x=side*1.08; d=.34+row*.42; h=.29+row*.34
        box(racks,x,d,h-.055,1.00,.41,.055,'dcd3bf')
        for leg in [-.42,.42]:
            box(racks,x+leg,d+.1,.012,.037,.037,h-.06,'a9a6a3')
        for col in range(3):
            bunch(x+(col-1)*.33,d,h,side<0 or row==0,(0 if side<0 else 9)+row*3+col)
for row in range(2):
    h=1.04+row*.40; d=2.40+row*.36
    box(racks,0,d,h-.05,3.32,.36,.05,'e4d9cb')
    for x in [-1.53,0,1.53]:
        box(racks,x,d+.13,.015,.046,.048,h-.06,'a0968e')
    for col in range(9):
        bunch((col-4)*.36,d,h,False,18+row*9+col)
racks.finish('계단식 진열 선반')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'myeong.blend'),compress=True)
exec(compile((folder/'export.py').read_text(),str(folder/'export.py'),'exec'))
