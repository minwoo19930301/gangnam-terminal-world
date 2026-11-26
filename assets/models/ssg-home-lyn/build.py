"""Rebuild the editable Haller display and export the three material batches."""
import bpy
import bmesh
import math
import random
import struct
import tempfile
import zlib
from mathutils import Vector, Matrix
from pathlib import Path

OUT = Path(__file__).resolve().parent
COLLECTION = 'SSG_9F_USM_Haller'
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
collection = bpy.data.collections.new(COLLECTION)
scene.collection.children.link(collection)
scene.unit_settings.system = 'METRIC'
scene.render.fps = 24
scene.tool_settings.transform_pivot_point = 'MEDIAN_POINT'

def material(name, metal, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    return m, p

chrome, cp = material('USMChrome', .69, .22)
paint, pp = material('USMLacquer', .11, .34)
felt, fp = material('USMSoftPanels', 0, .93)
for mat, shader in [(chrome, cp), (paint, pp)]:
    v = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    v.layer_name = 'Finish'
    mat.node_tree.links.new(v.outputs['Color'], shader.inputs['Base Color'])

# One UV tile per finish. The impressed channels are shaded in the bake, with
# two fibre lengths and fleck values sampled in sRGB. No reference photo pixels.
TILE = 192
PALETTE = [(148,145,151), (22,88,139), (96,110,36), (113,157,184),
           (159,49,49), (192,179,165), (231,168,35), (50,53,57)]
def weave_atlas():
    rng = random.Random(421)
    stride = TILE*4*3
    raw = bytearray()
    for y in range(TILE*2):
        row = bytearray()
        for x in range(TILE*4):
            i = (y//TILE)*4+x//TILE
            u, v = (x%TILE)/TILE, (y%TILE)/TILE
            path = (math.hypot(u*1.5-.08, v-.10)*8 if i in (1,2) else
                    (u*10+v*4 if i in (0,4,7) else u*10))
            line = path%1
            relief = -17*math.exp(-((line-.48)/.055)**2)+9*math.exp(-((line-.56)/.060)**2)
            noise = rng.gauss(0,6.8)+2.7*math.sin(x*2.1+y*.84)+1.8*math.sin(y*2.7-x*.25)
            row.extend(max(0,min(255,round(c+noise+relief))) for c in PALETTE[i])
        assert len(row)==stride
        raw.extend(b'\0'+row)
    def chunk(k, data):
        return struct.pack('>I',len(data))+k+data+struct.pack('>I',zlib.crc32(k+data)&0xffffffff)
    png=(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',TILE*4,TILE*2,8,2,0,0,0))+
         chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    with tempfile.TemporaryDirectory() as d:
        p=Path(d)/'usm-needle-felt.png'
        p.write_bytes(png)
        img=bpy.data.images.load(str(p))
        img.pack()
        img.filepath='//usm-needle-felt.png'
    tex=felt.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=img
    felt.node_tree.links.new(tex.outputs['Color'], fp.inputs['Base Color'])
weave_atlas()

STEEL=(.72,.76,.79)
WHITE=(.91,.89,.83)
BLACK=(.022,.025,.028)
def piece(name, verts, faces, mat, color, smooth=False, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    if bevel:
        bm=bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.bevel(bm,geom=list(bm.edges),offset=bevel,segments=2,affect='EDGES',profile=.5)
        bm.to_mesh(mesh)
        bm.free()
    obj=bpy.data.objects.new(name,mesh)
    collection.objects.link(obj)
    mesh.materials.append(mat)
    if mat!=felt:
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
        for val in attr.data: val.color=(*color,1)
    if smooth:
        for f in mesh.polygons: f.use_smooth=True
    return obj

def box(label, loc, dims, mat=paint, color=WHITE, bevel=.002, tilt=0):
    w,d,h=(t/2 for t in dims)
    vs=[(x*w,y*d,z*h) for z in (-1,1) for y in (-1,1) for x in (-1,1)]
    fs=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)]
    o=piece(label,vs,fs,mat,color,bevel=min(bevel,w*.7,d*.7,h*.7))
    o.location=loc
    o.rotation_euler.x=tilt
    return o

def rod(name,a,b,r,mat=chrome,color=STEEL,n=12):
    v=Vector(b)-Vector(a)
    vs=[(r*math.cos(2*math.pi*i/n),r*math.sin(2*math.pi*i/n),z) for z in (0,v.length) for i in range(n)]
    fs=[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    fs += [tuple(reversed(range(n))),tuple(range(n,2*n))]
    o=piece(name,vs,fs,mat,color,True)
    for f in list(o.data.polygons)[-2:]: f.use_smooth=False
    o.location=a
    o.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    if mat == chrome:
        # A cool reflected band and a narrow highlight keep polished round
        # tubes legible under the game's largely diffuse interior lighting.
        attr=o.data.color_attributes['Finish']
        for loop in o.data.loops:
            angle=2*math.pi*(loop.vertex_index%n)/n
            band=.25+.40*(.5+.5*math.cos(angle+.5))+.32*max(0,math.cos(2*angle-.6))**6
            attr.data[loop.index].color=tuple(c*band for c in color)+(1,)
    return o

def ball(p):
    bm=bmesh.new()
    bmesh.ops.create_icosphere(bm,subdivisions=2,radius=.014)
    bm.verts.ensure_lookup_table()
    bm.verts.index_update()
    o=piece('할러 구형 커넥터',[v.co[:] for v in bm.verts],
            [[v.index for v in f.verts] for f in bm.faces],chrome,STEEL,True)
    o.location=p
    bm.free()

def grid(xs,ys,zs):
    for x in xs:
        for y in ys:
            rod('수직 강관',(x,y,zs[0]),(x,y,zs[-1]),.0095)
            for z in zs: ball((x,y,z))
    for z in zs:
        for y in ys: rod('가로 강관',(xs[0],y,z),(xs[-1],y,z),.0095)
        for x in xs: rod('깊이 강관',(x,ys[0],z),(x,ys[-1],z),.0095)

def caster(x,y):
    rod('회전축',(x,y,.071),(x,y,.104),.011)
    for dx in (-.016,.016):
        o=box('캐스터 포크',(x+dx,y-.009,.053),(.006,.021,.048),chrome,STEEL)
        o.rotation_euler.x=-.35
    rod('고무 바퀴',(x-.014,y-.016,.035),(x+.014,y-.016,.035),.033,paint,BLACK,18)
    rod('바퀴 허브',(x-.018,y-.016,.035),(x+.018,y-.016,.035),.012,chrome,STEEL)

def panel(x,y,z,w,h,tile,tilt=0,tabs=True):
    d=.014
    o=box('소프트 패널 '+str(tile),(x,y,z),(w,d,h),felt,WHITE,.004,tilt)
    uv=o.data.uv_layers.new(name='펠트 결')
    for loop in o.data.loops:
        v=o.data.vertices[loop.vertex_index].co
        u=.015+.970*(v.x/w+.5)
        t=.015+.970*(v.z/h+.5)
        uv.data[loop.index].uv=((tile%4+u)/4,(1-tile//4+t)/2)
    if tabs:
        for side in (-1,1):
            off=Vector((0,-.012,side*(h*.5-.018)))
            pos=Vector((x,y,z))+Matrix.Rotation(tilt,3,'X')@off
            box('직물 당김 탭',pos,(.037,.012,.031),paint,BLACK,.004,tilt)

def deck(x0,x1,y0,y1,z):
    box('분체도장 선반',((x1+x0)/2,(y1+y0)/2,z),(x1-x0-.017,y1-y0-.017,.012))

# Branch exhibition photograph 747877: 500/750 mm sample wall above a
# shallow white bench, a low open tube grid, and its separate swatch trolley.
xs=[-.94,-.44,.31]
ys=[-.28,.07,.42]
grid(xs,ys,[.106,.242,.586])
grid(xs,ys[1:],[.586,.936,1.286,1.636])
for x in xs:
    for y in (ys[0],ys[-1]): caster(x,y)
for i,(a,b) in enumerate(zip(xs,xs[1:])):
    for j in range(2): deck(a,b,ys[j],ys[j+1],.587)
    deck(a,b,.07,.42,1.635)
    box('흰색 배면판',((a+b)/2,.081,.760),(b-a-.021,.012,.327))
    for z,tile in [(1.111,[2,3][i]),(1.461,[0,1][i])]:
        panel((a+b)/2,.075,z,b-a-.024,.325,tile)
        panel((a+b)/2,.410,z,b-a-.024,.325,tile,tabs=False)
for x in (xs[0],xs[-1]):
    for z in (.761,1.111,1.461):
        box('측면 철판',(x,.245,z),(.011,.328,.325))
# Trolley with actual tilted removable panels in a four-sided lipped bin.
tx,ty=.84,-.13
grid([tx-.25,tx+.25],[ty-.175,ty+.175],[.106,.25,.67,.875])
for x in (tx-.25,tx+.25):
    for y in (ty-.175,ty+.175): caster(x,y)
for z in (.11,.672): deck(tx-.25,tx+.25,ty-.175,ty+.175,z)
for sy in (-1,1): box('견본함 앞뒤 철판',(tx,ty+sy*.173,.771),(.477,.012,.182))
for sx in (-1,1): box('견본함 측판',(tx+sx*.248,ty,.771),(.012,.326,.182))
for i,tile in enumerate([4,6,1,7,2]):
    start=len(collection.objects)
    center=Vector((tx-.045,ty+.094-i*.039,1.055-i*.016))
    panel(*center,.295,.47,tile,-.28)
    # Sample cards rest at a diagonal against the side of the trolley.
    pivot=center+Vector((0,0,-.22))
    swing=Matrix.Rotation(.39,3,'Y')
    for part in list(collection.objects)[start:]:
        part.location=pivot+swing@(part.location-pivot)
        part.rotation_euler=(swing@part.rotation_euler.to_matrix()).to_euler()
# Low red/taupe two-bay sideboard from the same branch exhibition.
sx,sy=-2.20,.24
grid([sx-.75,sx,sx+.75],[sy-.175,sy+.175],[.06,.41,.76])
for x in (sx-.75,sx,sx+.75):
    for y in (sy-.175,sy+.175):
        rod('높이조절 발',(x,y,.009),(x,y,.052),.017,paint,BLACK)
        rod('원형 받침',(x,y,.004),(x,y,.015),.029,paint,BLACK)
for i in (-1,1):
    a=sx+i*.375
    for z,tile in ((.235,5),(.585,4)):
        panel(a,sy-.17,z,.727,.324,tile)
        panel(a,sy+.17,z,.727,.324,tile,tabs=False)
    deck(a-.375,a+.375,sy-.175,sy+.175,.76)
for x in (sx-.75,sx+.75):
    for z in (.235,.585): box('수납장 측판',(x,sy,z),(.012,.329,.326))

# The adjacent floor light in the exhibition has a rounded, pleated white
# diffuser, a slim stem and a polished disc foot. Its maker is unconfirmed.
lx,ly=-1.29,-.16
rod('조명 원형 받침',(lx,ly,.008),(lx,ly,.031),.135,chrome,STEEL,40)
rod('조명 기둥',(lx,ly,.031),(lx,ly,1.096),.010,chrome,STEEL)
profile=[(1.075,.063),(1.11,.087),(1.18,.123),(1.25,.154),(1.30,.161),
         (1.34,.155),(1.39,.132),(1.44,.098),(1.495,.073)]
verts=[]
faces=[]
segments=96
for z,r in profile:
    for i in range(segments):
        a=2*math.pi*i/segments
        radius=r*(1 if i%2 else .965)
        verts.append((lx+radius*math.cos(a),ly+radius*math.sin(a),z))
for ring in range(len(profile)-1):
    for i in range(segments):
        j=(i+1)%segments
        faces.append((ring*segments+i,ring*segments+j,(ring+1)*segments+j,(ring+1)*segments+i))
faces.append(tuple(range((len(profile)-1)*segments,len(profile)*segments)))
piece('주름 조명 갓',verts,faces,paint,(.96,.92,.82))
def lettering(text,x,y,z,size):
    font=bpy.data.curves.new(text,'FONT')
    font.body=text
    font.size=size
    font.align_x='CENTER'
    o=bpy.data.objects.new(text,font)
    collection.objects.link(o)
    o.location=(x,y,z)
    o.rotation_euler.x=math.pi/2
    bpy.context.view_layer.objects.active=o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o.select_set(False)
    o.data.materials.append(paint)
    at=o.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='CORNER')
    for v in at.data:v.color=(.02,.025,.025,1)
box('탁상 안내판',(sx,sy,.891),(.51,.024,.256),paint,WHITE,.008)
box('안내판 받침',(sx,sy,.775),(.39,.14,.021))
lettering('USM',sx,sy-.013,.885,.138)
lettering('USM Haller',sx,sy-.013,.822,.038)

bpy.context.preferences.filepaths.save_version=0
for obj in collection.objects: obj.select_set(False)
print('Editable objects:',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'haller.blend'),compress=True)
# Flatten the assembly only after saving its individual native parts.
for mat in (chrome,paint,felt):
    bpy.ops.object.select_all(action='DESELECT')
    pieces=[o for o in collection.objects if o.type=='MESH' and o.data.materials[0]==mat]
    for o in pieces:o.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join()
    bpy.context.object.name=mat.name
bpy.ops.export_scene.gltf(filepath=str(OUT/'haller.glb'),export_format='GLB',export_yup=True)
