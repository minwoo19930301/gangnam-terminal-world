"""Editable cladding and window joinery for four bays opposite the arched shopfronts."""
from pathlib import Path
from math import sin,cos,pi
import bpy

OUT=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
paint=bpy.data.materials.new('유리 반사와 재료 마감')
paint.use_nodes=True
nodes=paint.node_tree.nodes
tex=nodes.new('ShaderNodeTexImage')
tex.image=bpy.data.images.load(str(OUT/'finishes.jpg'));tex.image.pack()
col=nodes.new('ShaderNodeVertexColor');col.layer_name='COLOR_0'
mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
for a,b in [(tex.outputs['Color'],mix.inputs[1]),(col.outputs['Color'],mix.inputs[2]),(mix.outputs[0],nodes['Principled BSDF'].inputs['Base Color'])]:paint.node_tree.links.new(a,b)
nodes['Principled BSDF'].inputs['Roughness'].default_value=.43
verts=[];faces=[];colors=[];uvs=[]
def collection(name):
    c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);return c
def face(points,color,rect=None):
    i=len(verts);verts.extend(points);faces.append(tuple(range(i,len(verts))));colors.append(color)
    if rect:
        x1,y1,x2,y2=rect;uvs.extend([(x1,y1),(x2,y1),(x2,y2),(x1,y2)])
    else:uvs.extend([(.03,.054)]*len(points))
def finish(name):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    uv=mesh.uv_layers.new(name='마감')
    for loop,coord in zip(uv.data,uvs):loop.uv=coord
    attr=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    for p,colour in zip(mesh.polygons,colors):
        rgb=[int(colour[k:k+2],16)/255 for k in (0,2,4)]
        for idx in p.loop_indices:attr.data[idx].color_srgb=(*rgb,1)
    mesh.materials.append(paint)
    coll.objects.link(bpy.data.objects.new(name,mesh))
    verts.clear();faces.clear();colors.clear();uvs.clear()
def box(x,y,z,w,d,h,c):
    p=[(x+dx*w/2,y+dy*d/2,z) for dx,dy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
    q=[(a,b,z+h) for a,b,_ in p]
    face(p[::-1],c);face(q,c)
    for i in range(4):
        j=(i+1)%4;face([p[i],p[j],q[j],q[i]],c)
def plate(x1,x2,y,z1,z2,c='ffffff',uv=None):
    face([(x1,y,z1),(x2,y,z1),(x2,y,z2),(x1,y,z2)],c,uv)
coll=collection('FamilleShopfrontBay')
# The existing shell has a full-height rectangular opening above the store sign.
# Deep returns, a neutral rear lining and dark sill keep the gallery side self-contained.
box(0,-.12,4.88,5.43,.085,3.08,'303431')
for x in [-2.70,2.70]:box(x,.032,4.84,.11,.37,3.13,'373631')
box(0,.02,7.88,5.48,.43,.09,'625f55')
box(0,.02,4.79,5.51,.49,.13,'403f39')
finish('깊은 창턱과 상인방')
# Three pairs of tall steel casements, alternate leaves set forward at shallow angles.
# Modelled as closed leaf outlines and individual clips, with no public opening behind them.
for pair in range(3):
    start=-2.66+pair*1.777
    for leaf in range(2):
        angle=(11 if leaf==0 else -11)*pi/180
        width=.883
        origin_y=.028 if leaf==0 else .028+width*sin(11*pi/180)
        def pt(s,t,h):
            return (start+leaf*width*cos(11*pi/180)+s*cos(angle)-t*sin(angle),origin_y+s*sin(angle)+t*cos(angle),h)
        def member(a,b,z1,z2,thickness,c):
            p=[pt(a,-.018,z1),pt(b,-.018,z1),pt(b,thickness,z1),pt(a,thickness,z1)]
            q=[(x,y,z2) for x,y,z in p];face(q,c);face(p[::-1],c)
            for i in range(4):
                j=(i+1)%4;face([p[i],p[j],q[j],q[i]],c)
        shade=['dfe3db','bccbc8','d4ddd7','b9c2bd','c6cfc8','dee3d7'][pair*2+leaf]
        # Dark, partially reflective glass from the public side, with a return at the folded edge.
        face([pt(.035,0,4.96),pt(width-.035,0,4.96),pt(width-.035,0,7.84),pt(.035,0,7.84)],shade,(.339,.015,.661,.99))
        member(0,.050,4.93,7.865,.063,'242724')
        member(width-.050,width,4.93,7.865,.063,'282a26')
        for zz,hh in [(4.93,.067),(5.53,.032),(6.64,.034),(7.43,.025),(7.81,.055)]:
            member(.043,width-.043,zz,zz+hh,.040,'292c29')
        member(width*.49,width*.49+.027,4.985,7.815,.032,'393e39')
        # Narrow metal glazing beads sit forward of the recess and catch light along the frame.
        for ss in [.052,width-.067]:
            member(ss,ss+.010,5.00,7.80,.018,'687067')
        if leaf==0:
            for zz in [5.08,6.29,7.56]:member(width-.060,width-.012,zz,zz+.086,.077,'56574d')
    finish('검은 철제 격자 여닫이창 '+str(pair+1))
# A shallow charcoal fascia shades the customer entrance, below a bronze-grey transom.
box(0,.13,3.29,5.50,.20,.61,'282725')
box(0,.265,3.30,5.51,.087,.042,'494944')
box(0,.145,3.92,5.53,.24,.055,'32332f')
for i in range(3):
    x=-2.75+i*5.50/3
    plate(x+.014,x+5.50/3-.014,.282,3.978,4.55,['f7f4e7','e8e6dc','faf4df'][i],(.673,.018,.993,.976))
    box(x+.01,.278,3.961,.026,.041,.62,'41433d')
box(2.75,.278,3.961,.025,.041,.62,'41433d')
for z,h,depth,col in [(4.54,.045,.37,'494944'),(4.584,.125,.40,'67665d'),(4.70,.032,.44,'8a897e'),(4.73,.055,.39,'4d504b')]:
    box(0,.14,z,5.58,depth,h,col)
finish('짙은 점포 차양과 회청동빛 반사 띠')
coll=collection('FamilleLimestonePier')
# Only dress the public face of the existing structural pier. Short returns expose the brick beyond.
for j in range(10):
    z=.25+j*.762
    w=.85
    box(0,.295,z,w,.122,.752,'bdb4a4')
    plate(-w/2,w/2,.358,z+.005,z+.747,['f6f4ef','fcfaf4','f3f1eb','f8f6f0'][j%4],(.065,.11,.318,.945))
    for side in [-1,1]:
        box(side*.437,.297,z,.04,.123,.751,'d6cdbb')
        box(side*.459,.284,z,.017,.087,.751,'c5bca9')
for z,h,w,d,c in [(.014,.08,1.01,.24,'bdb4a3'),(.094,.16,.975,.218,'dfd5c1'),(.254,.038,.934,.191,'c4baa7'),
                   (7.87,.07,.984,.193,'c3baa7'),(7.94,.09,1.02,.22,'e9e0cc'),(8.03,.071,1.04,.25,'c7beaa')]:
    box(0,.25,z,w,d,h,c)
finish('석회암 덧기둥 · 수평 줄눈과 계단식 기단')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'shopfront.blend'),compress=True)
