"""The Margaux Grill's public dining-room barrel chair. Dimensions are in metres."""
from math import cos,sin,pi,tau
from pathlib import Path
import bpy
from mathutils import Vector

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new('MargauxDiningChair')
bpy.context.scene.collection.children.link(collection)
paint=bpy.data.materials.new('짙은 갈색 가죽과 착색 목재')
paint.use_nodes=True
node=paint.node_tree.nodes.new('ShaderNodeVertexColor');node.layer_name='COLOR_0'
shader=paint.node_tree.nodes['Principled BSDF']
paint.node_tree.links.new(node.outputs['Color'],shader.inputs['Base Color'])
shader.inputs['Roughness'].default_value=.40
verts=[];faces=[];colors=[]

def face(points,c):
    i=len(verts);verts.extend(points);faces.append(tuple(range(i,len(verts))));colors.append(c)

def finish(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for poly,color in zip(mesh.polygons,colors):
        rgb=[int(color[i:i+2],16)/255 for i in (0,2,4)]
        for j in poly.loop_indices:attr.data[j].color_srgb=(*rgb,1)
    mesh.materials.append(paint);collection.objects.link(bpy.data.objects.new(name,mesh))
    verts.clear();faces.clear();colors.clear()

def around(a,w,d,z,dy=0):
    return (w*sin(a),dy-d*cos(a),z)

def band(rings,palette,n=20):
    for j,(a,b) in enumerate(zip(rings,rings[1:])):
        for i in range(n):
            t=tau*i/n;s=tau*(i+1)/n
            face([around(t,*a),around(s,*a),around(s,*b),around(t,*b)],palette[j])
    face([around(tau*i/n,*rings[-1]) for i in range(n)],palette[-1])

# Slightly crowned cushion with a separate sewn welt and a recessed base.
band([(.228,.211,.391,.012),(.251,.229,.405,.012),(.258,.236,.433,.012),
      (.253,.232,.453,.012),(.235,.209,.465,.012),(.155,.146,.470,.012)],
     ['362922','493830','59463b','655247','625045'])
finish('타원형 가죽 방석과 둥근 앞단')
band([(.255,.234,.432,.012),(.259,.238,.435,.012),(.255,.234,.438,.012)],
     ['6e584b','715f50'])
finish('방석 가장자리 파이핑')
angles=[(-118+i*236/20)*pi/180 for i in range(21)]
def shell(a,w,d,h):
    t=abs(a)/(118*pi/180)
    bottom=.406+t**2*.039
    top=.814-t**2.15*.173
    return around(a,w,d,bottom+h*(top-bottom))
# Rolled top edge, slightly flared arms, curved external walnut-brown leather.
sections=[(.244,.220,0),(.256,.232,.05),(.277,.251,.87),(.278,.252,.962),
          (.271,.245,1),(.250,.223,1),(.241,.215,.946),(.227,.198,.12),(.229,.2,.018)]
palette=['382922','4a3931','57453c','6d5a4e','776357','685246','544037','49372f']
for j,(a,b) in enumerate(zip(sections,sections[1:])):
    for t,s in zip(angles,angles[1:]):
        face([shell(t,*a),shell(s,*a),shell(s,*b),shell(t,*b)],palette[j])
for angle in (angles[0],angles[-1]):face([shell(angle,*s) for s in sections],'644d40')
finish('팔걸이로 이어지는 곡면 가죽 등받이')
for t,s in zip(angles,angles[1:]):
    face([shell(t,.278,.252,.934),shell(s,.278,.252,.934),
          shell(s,.278,.252,.942),shell(t,.278,.252,.942)],'8a7360')
finish('등받이의 가는 테두리 봉제선')

def leg(x,y):
    side=1 if x>0 else -1
    front=1 if y>0 else -1
    rings=[]
    for z,r,spread in [(.013,.016,1),(.032,.017,.96),(.36,.025,.09),(.414,.026,0)]:
        rings.append([(x+side*.046*spread+r*cos(tau*i/6),y+front*.040*spread+r*sin(tau*i/6),z) for i in range(6)])
    for j,(a,b) in enumerate(zip(rings,rings[1:])):
        for i in range(6):
            k=(i+1)%6
            face([a[i],a[k],b[k],b[i]],['302823','534339','4b3a30'][j])
for x in [-.172,.172]:
    for y in [-.150,.150]:leg(x,y)
finish('밖으로 벌어진 가는 목재 다리 네 개')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'chair.blend'),compress=True)
