"""Edit the five cut-flower and foliage types used by this retail display."""
import math
import random
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('FreshFlowerWholesaleBank')
bpy.context.scene.collection.children.link(collection)
paint = bpy.data.materials.new('생화 매대 재료 · 정점색')
paint.use_nodes = True
vertex = paint.node_tree.nodes.new('ShaderNodeVertexColor')
vertex.layer_name = 'COLOR_0'
bsdf = paint.node_tree.nodes.get('Principled BSDF')
paint.node_tree.links.new(vertex.outputs['Color'], bsdf.inputs['Base Color'])
bsdf.inputs['Roughness'].default_value = .3

vertices, faces, colors = [], [], []
rng = random.Random(552)
tau = math.tau


def face(points, color):
    first = len(vertices)
    vertices.extend(points)
    faces.append(tuple(range(first, len(vertices))))
    colors.append(color)


def finish(name):
    mesh = bpy.data.meshes.new(name)
    organic=not name.startswith(('목재','집게'))
    if organic:
        distinct={}
        remap=[]
        for pt in vertices:
            key=tuple(round(float(x),6) for x in pt)
            remap.append(distinct.setdefault(key,len(distinct)))
        mesh.from_pydata(list(distinct),[],[tuple(remap[i] for i in poly) for poly in faces])
    else:
        mesh.from_pydata(vertices, [], faces)
    mesh.update()
    attr = mesh.color_attributes.new(name='COLOR_0', type='BYTE_COLOR', domain='CORNER')
    for poly, color in zip(mesh.polygons, colors):
        poly.use_smooth=organic
        rgb = [int(color[i:i+2], 16)/255 for i in (0, 2, 4)]
        for idx in poly.loop_indices:
            attr.data[idx].color_srgb = (*rgb, 1)
    mesh.materials.append(paint)
    obj=bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    vertices.clear()
    faces.clear()
    colors.clear()
    return obj


def block(x, y, z, width, length, height, color):
    low = [(x+a*width/2, y+b*length/2, z) for a,b in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    high = [(a,b,c+height) for a,b,c in low]
    for i in range(4):
        j = (i+1)%4
        face([low[i], low[j], high[j], high[i]], color)
    face(high, color)
    face(low[::-1], color)

# A stepped face of cut foliage, facing the shopper in Blender -Y.
for tier in range(3):
    y=-.54+tier*.50
    h=.35+tier*.40
    block(0,y,.03,3.78,.52,h-.03,['403c34','544a37','5c513a'][tier])
    block(0,y,h,3.80,.55,.044,'937d56')
    block(0,y-.269,h-.06,3.80,.05,.105,'393a30')
    finish('목재 계단 선반 '+str(tier+1))

def twig(a,b,r,c):
    a,b=Vector(a),Vector(b);delta=b-a
    if delta.length<.001:return
    side=delta.cross(Vector((0,1,0)))
    if side.length<.001:side=delta.cross(Vector((1,0,0)))
    side.normalize();up=delta.normalized().cross(side)
    for i in range(4):
        a0=i*math.pi/2;a1=a0+math.pi/2
        d0=r*(side*math.cos(a0)+up*math.sin(a0));d1=r*(side*math.cos(a1)+up*math.sin(a1))
        face([tuple(a+d0),tuple(a+d1),tuple(b+d1*.76),tuple(b+d0*.76)],c)

leafpal=[('4a6939','6f8942'),('2f5735','5a7650'),('536c37','859050'),('506c60','8eaca0'),('537b48','8b9d64')]
def leaf(base,tip,width,palette):
    a,b=Vector(base),Vector(tip);d=b-a
    across=Vector((-d.y,d.x,0))
    if across.length<.001:across=Vector((1,0,0))
    across.normalize()
    sections=[(a,a,a)]
    for t,f in [(.22,.60),(.48,1),(.76,.69)]:
        m=a+d*t
        m.z+=width*math.sin(t*math.pi)*.23
        sections.append((m-across*(width*f*.5),m+Vector((0,0,width*f*.14)),m+across*(width*f*.5)))
    sections.append((b,b,b))
    for prev,nxt in zip(sections,sections[1:]):
        for k,c in enumerate(palette):
            if (prev[k]-prev[k+1]).length<.0001:face([tuple(prev[k]),tuple(nxt[k]),tuple(nxt[k+1])],c)
            elif (nxt[k]-nxt[k+1]).length<.0001:face([tuple(prev[k]),tuple(nxt[k]),tuple(prev[k+1])],c)
            else:face([tuple(prev[k]),tuple(nxt[k]),tuple(nxt[k+1]),tuple(prev[k+1])],c)

def rounded_leaf(base, direction, width):
    tip=base+direction
    side=Vector((-direction.y,direction.x,0)).normalized()
    left=[];right=[]
    for j in range(6):
        t=j/5
        radius=width*.5*(math.sin(math.pi*t)**.53)
        centre=base+direction*t+Vector((0,0,math.sin(t*math.pi)*.018))
        left.append(centre-side*radius);right.append(centre+side*radius)
    for j in range(5):
        middle=(left[j]+right[j])*.5+Vector((0,0,.005))
        nxt=(left[j+1]+right[j+1])*.5+Vector((0,0,.005))
        face([tuple(left[j]),tuple(middle),tuple(nxt),tuple(left[j+1])],'6d9182')
        face([tuple(middle),tuple(right[j]),tuple(right[j+1]),tuple(nxt)],'9cb1a0')

def bud(x,y,z,r,h,pal,phase):
    base=(x,y,z-h*.66);cap=(x,y,z+h)
    rings=[[(x+r*f*math.cos(phase+i*tau/4),y+r*f*math.sin(phase+i*tau/4),z+zoff*h) for i in range(4)] for f,zoff in [(1,0),(.78,.66)]]
    for i in range(4):
        j=(i+1)%4
        face([base,rings[0][j],rings[0][i]],pal[0])
        face([rings[0][i],rings[0][j],rings[1][j],rings[1][i]],pal[i%len(pal)])
        face([rings[1][i],rings[1][j],cap],pal[(i+1)%len(pal)])

species={}
for tier in range(3):
    for lot in range(6):
        cx=-1.58+lot*.63
        cy=-.51+tier*.50
        h=.40+tier*.40
        style=[['mist','berry','tassel','leaves','mist','berry'],
               ['tassel','leaves','violet','tassel','berry','leaves'],
               ['mist','berry','leaves','mist','berry','tassel']][tier][lot]
        location=(cx,cy,h)
        if style in species:
            obj=bpy.data.objects.new('묶음 '+str(tier+1)+'단 '+str(lot+1),species[style])
            collection.objects.link(obj)
            obj.location=location
            obj.rotation_euler.z=.12*math.sin(tier*4+lot*3)
            obj.scale=(1+.06*math.cos(lot*2),1+.05*math.cos(tier+lot),1+.09*math.sin(lot*3))
            continue
        cx=cy=h=0.0
        # Darker inner foliage and cascading leaves conceal the bare shelf risers.
        for j in range(36):
            x=rng.uniform(-.27,.27);front=rng.uniform(-.21,.20)
            base=Vector((x*.64,front+.10,.14))
            tip=Vector((x+rng.uniform(-.10,.10),front-rng.uniform(.25,.43),rng.uniform(-.13,.20)))
            leaf(base,tip,rng.uniform(.070,.145),leafpal[(tier+lot+j%3)%5])
        swatches={'berry':('6d7c36','a2aa4e','8a9639'),'tassel':('712e3d','ae5864','a24658'),'violet':('554071','8670a1','76558f'),
                  'mist':('b4ad85','e5e1c5','d6d8bc'),'leaves':('4a6c49','66865b','799367')}[style]
        for stem in range(20):
            x=cx+rng.uniform(-.22,.22);y=cy+rng.uniform(-.09,.10)
            length=rng.uniform(.27,.51);rise=rng.uniform(.10,.35)
            base=Vector((x,y+.15,h+.045));end=Vector((x+rng.uniform(-.16,.16),y-length,h+rise))
            mid=base.lerp(end,.60)+Vector((0,0,.095))
            twig(base,mid,.008,'667242');twig(mid,end,.006,'687643')
            for j in range(4):
                at=base.lerp(end,.20+j*.19)+Vector((0,0,.055))
                side=1 if (j+stem)%2 else -1
                tip=at+Vector((side*rng.uniform(.07,.15),rng.uniform(-.14,-.05),rng.uniform(-.035,.08)))
                leaf(at,tip,rng.uniform(.035,.082) if style!='leaves' else .125,leafpal[(lot+tier+j//2)%len(leafpal)])
            if style=='leaves':
                for j in range(4):
                    at=base.lerp(end,.33+j*.21)
                    rounded_leaf(at,Vector(((-1 if j%2 else 1)*.10,-.11,.09-j*.025)),.13)
                continue
            if style=='mist':
                top=end+Vector((.025,-.06,rng.uniform(.10,.22)))
                twig(end,top,.005,'718060')
                for j in range(8):
                    at=end.lerp(top,j/8);a=j*2.4;span=.032*(1-j/10)
                    bud(at.x+span*math.cos(a),at.y+span*math.sin(a),at.z,.017,.026,swatches,a)
                continue
            if style=='tassel':
                tail=end+Vector((.03,-.045,-rng.uniform(.15,.27)))
                twig(end,tail,.006,'84504b')
                for j in range(7):
                    at=end.lerp(tail,j/7)
                    bud(at.x+rng.uniform(-.015,.015),at.y+rng.uniform(-.014,.014),at.z,.026*(1-j/15),.027,swatches,j)
            else:
                for j in range(7):
                    a=j*2.4+stem
                    r=.015+.018*(j%3)
                    at=end+Vector((math.cos(a)*r,math.sin(a)*r,.015*(j%4)))
                    bud(*at,.024 if style=='berry' else .019,.026 if style=='berry' else .041,swatches,a)
        obj=finish({'berry':'연두 열매','tassel':'늘어진 적자색 꽃차례','mist':'연백색 잔꽃','leaves':'둥근 은녹색 잎','violet':'보라 잔꽃'}[style])
        obj.data.name=style;obj.location=location;species[style]=obj.data
for i,(x,y,z) in enumerate([(-1.15,-.57,.86),(.65,.43,1.57),(1.53,-.05,1.1)]):
    twig((x,y,z-.23),(x,y-.012,z),.008,'534e42')
    block(x,y,z-.016,.13,.012,.12,'eae6ce')
    for j in range(2):block(x-.016,y-.009,z+.043-j*.022,.064-j*.018,.006,.005,'96927b')
    finish('집게 표찰 '+str(i+1))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'flower-bank.blend'),compress=True)
