"""Weave geometry in Blender's Z-up frame. One selectable object per basket."""
from pathlib import Path
from math import cos, sin, pi
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
NAME='FlowerMarketWicker'
bpy.ops.wm.read_factory_settings(use_empty=True)
collection=bpy.data.collections.new(NAME)
bpy.context.scene.collection.children.link(collection)
material=bpy.data.materials.new('등나무와 염색 버드나무')
material.use_nodes=True
shader=material.node_tree.nodes.get('Principled BSDF')
shader.inputs['Roughness'].default_value=.66
attribute=material.node_tree.nodes.new('ShaderNodeVertexColor')
attribute.layer_name='Reed'
material.node_tree.links.new(attribute.outputs['Color'],shader.inputs['Base Color'])
PALETTES=[(183,139,82),(108,67,43),(135,53,63),(203,167,111)]

def linear(c):
    x=c/255
    return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4

def basket(name,center,width,depth,height,tone,rectangle,handle,bow=.60):
    vertices=[];faces=[];colors=[]
    def strand(path,radius,shade,closed=False,sides=3,band=False):
        # A flattened section catches a different highlight on each face of a cane.
        first=len(vertices)
        for j,point in enumerate(path):
            before=path[(j-1)%len(path)] if closed or j else point
            after=path[(j+1)%len(path)] if closed or j<len(path)-1 else point
            direction=(after-before).normalized()
            axis=Vector((0,0,1)) if abs(direction.z)<.85 else Vector((1,0,0))
            across=direction.cross(axis).normalized();up=direction.cross(across)
            for k in range(sides):
                angle=2*pi*k/sides
                if band:
                    # Flat willow strips have a narrow beveled edge and a broad woven face.
                    cross=(.40*across*(1 if k in (0,1) else -1)
                           +1.45*up*(1 if k in (1,2) else -1))
                else:
                    cross=across*cos(angle)+up*sin(angle)
                vertices.append(tuple(point+radius*cross))
                colors.append((*[linear(min(255,max(0,c*shade))) for c in PALETTES[tone]],1))
        for j in range(len(path) if closed else len(path)-1):
            nxt=(j+1)%len(path)
            for k in range(sides):
                kk=(k+1)%sides
                faces.append((first+j*sides+k,first+j*sides+kk,first+nxt*sides+kk,first+nxt*sides+k))
    def ring(theta,t,offset=0):
        power=.53 if rectangle else 1
        def shaped(x):return (abs(x)**power)*(1 if x>=0 else -1)
        return Vector((shaped(cos(theta))*(width*(.77+t*.23)/2+offset),
                       shaped(sin(theta))*(depth*(.77+t*.23)/2+offset),height*t))
    stakes=20 if rectangle else 18
    rows=7 if height<.24 else 9
    for n in range(stakes):
        strand([ring(2*pi*n/stakes,j) for j in (0,1)],.0042,1.08-(n%4)*.022)
    for j in range(rows):
        t=(j+.55)/rows
        path=[ring(2*pi*n/stakes,t,.0055*cos(pi*(n+j))) for n in range(stakes)]
        strand(path,.010 if height>.20 else .0085,.87+(j%3)*.055,True,4,True)
    for t,r in [(0,.011),(1,.013)]:
        strand([ring(2*pi*n/36,t) for n in range(36)],r,1.11,True,5)
    # Split parallel bows and their wrapped grip are visible through the open top.
    if handle:
        for offset in [-.007,.007]:
            strand([Vector((offset,depth*.49*cos(pi*n/24),height+depth*bow*sin(pi*n/24))) for n in range(25)],.009,1.05)
        for n in range(9,16):
            angle=pi*n/24
            q=Vector((0,depth*.49*cos(angle),height+depth*bow*sin(angle)))
            strand([q+Vector((.019*cos(k*pi/4),0,.012*sin(k*pi/4))) for k in range(8)],.0035,.74,True)
    else:
        # Flattened horizontal grip loop on the outer short face.
        strand([Vector((width*.50+.008,-.072+.144*n/16,height-.022-.032*sin(pi*n/16))) for n in range(17)],.0065,1.20)
    for n in range(-3,4):
        u=n/4
        strand([Vector((u*width*.36,side*depth*.37*(1-.15*u*u),.012)) for side in [-1,1]],.009,.77)
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(material)
    col=mesh.color_attributes.new(name='Reed',type='FLOAT_COLOR',domain='POINT')
    col.data.foreach_set('color',[v for color in colors for v in color])
    for face in mesh.polygons:face.use_smooth=True
    mesh.update()
    ob=bpy.data.objects.new(name,mesh);collection.objects.link(ob);ob.location=center

for j in range(8):
    basket('선반 · 수납 바구니 '+str(j+1),(.265,1.57-j*.45,.97),.43,.40,.23,
           [2,0,1,2,0,1,0,2][j],True,False)
for tier in [3,4]:
    for j in range(8):
        basket('선반 · 꽃 손잡이 바구니 '+str(tier)+'-'+str(j+1),
               (.265,1.57-j*.45,.13+tier*.42),.40,.39,.22,
               [0,3,0,0,3,0,3,0][(j+tier)%8],j%3!=0,True,.40)
for j in range(4):
    z=-1.4+j*.94
    basket('걸이 · 꽃바구니 '+str(j+1),(1.20,-z,2.28),.47,.42,.215,[0,3,1,0][j],j==2,True)
    basket('상자 위 · 꽃바구니 '+str(j+1),(1.35,1.4-j*.92,.61),.46,.42,.27,[0,3,0,1][j],j%2==1,True)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'baskets.blend'),compress=True)
