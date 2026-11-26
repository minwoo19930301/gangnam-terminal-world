"""Atelier Choux Gangnam. Blender X right, Y towards the backdrop, Z up."""
import bpy
import math
from pathlib import Path
from math import sin, cos, pi
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new("SSG_10F_AtelierChoux")
bpy.context.scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
palette = {}
def finish(name, value):
    mat = bpy.data.materials.new(name)
    srgb = [int(value[i:i+2], 16)/255 for i in (0,2,4)]
    rgba = tuple(((s+.055)/1.055)**2.4 if s>.04045 else s/12.92 for s in srgb)+(1,)
    mat.diffuse_color = rgba
    mat.use_nodes = True
    mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = rgba
    palette[name] = mat
    return mat

milk = finish('아이보리 도장','faf6ed')
edge = finish('크림 몰딩','e3d4bd')
shade = finish('서랍 틈','bba99b')
brass = finish('황동','bc9353')
pink = finish('장밋빛','d59394')
sage = finish('청자색','a6bfb7')
blue = finish('퀼트 블루','91b6c8')
ink = finish('밤색 자수','825f59')
linen = finish('생지','ede3d5')
printmat = bpy.data.materials.new('직물과 상자의 삽화')
printmat.use_nodes = True
tex = printmat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = bpy.data.images.load(str(OUT/'prints.jpg'))
tex.image.pack()
shader = printmat.node_tree.nodes['Principled BSDF']
shader.inputs['Roughness'].default_value = .89
printmat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])

def assign(o,name,mat):
    o.name = name
    o.data.materials.append(mat)
    return o

def box(name,x,y,z,w,d,h,mat,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    o = bpy.context.object
    o.dimensions = (w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('둥근 모서리','BEVEL')
        mod.width=bevel
        mod.segments=2
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return assign(o,name,mat)

def rod(name,a,b,r,mat,segments=10):
    v=Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=r,depth=v.length,location=(Vector(a)+Vector(b))/2)
    o=bpy.context.object
    o.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    return assign(o,name,mat)

def ball(name,x,y,z,sizes,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1,location=(x,y,z))
    o=bpy.context.object
    o.scale=sizes
    return assign(o,name,mat)

def patch(name,tile,nu,nv,position):
    verts=[position(i/nu,j/nv) for j in range(nv+1) for i in range(nu+1)]
    faces=[]
    for j in range(nv):
        for i in range(nu):
            a=j*(nu+1)+i
            faces.append((a,a+1,a+nu+2,a+nu+1))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    uv=mesh.uv_layers.new(name='인쇄')
    for loop in mesh.loops:
        k=loop.vertex_index
        u,v=(k%(nu+1))/nu,(k//(nu+1))/nv
        uv.data[loop.index].uv=((tile%2+.003+.994*u)/2,(1-tile//2+.003+.994*v)/2)
    o=bpy.data.objects.new(name,mesh)
    collection.objects.link(o)
    return assign(o,name,printmat)

def cord(name,pts,r,mat,closed=False):
    data=bpy.data.curves.new(name,'CURVE')
    data.dimensions='3D'
    data.bevel_depth=r
    data.bevel_resolution=0
    line=data.splines.new('POLY')
    line.points.add(len(pts)-1)
    for p,co in zip(line.points,pts): p.co=(*co,1)
    line.use_cyclic_u=closed
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj

def letters(text,x,y,z,size,mat):
    data=bpy.data.curves.new(text,'FONT')
    data.body=text
    data.align_x='CENTER'
    data.align_y='CENTER'
    data.size=size
    font=Path('/System/Library/Fonts/Supplemental/Baskerville.ttc')
    if font.exists(): data.font=bpy.data.fonts.load(str(font))
    obj=bpy.data.objects.new(text,data)
    collection.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    data.materials.append(mat)

# Recessed framed mural, with a slim molded surround and store wordmark.
by=2.63
box('벽면 쇼케이스',0,by,1.38,3.14,.15,2.76,linen,.035)
for x in (-1.50,1.50):
    box('벽면 세로 몰딩',x,by-.12,1.38,.08,.13,2.73,milk,.016)
for z in (.10,2.70):
    box('벽면 가로 몰딩',0,by-.12,z,3.08,.13,.09,milk,.018)
patch('파리 맨션 벽화',0,1,1,lambda u,v:((u-.5)*2.90,by-.081,.14+1.98*v))
letters('Atelier Choux',0,by-.086,2.41,.37,ink)
letters('P A R I S',0,by-.087,2.20,.092,ink)

# Hotel keepsake cases: printed fronts and side elevations, hinged top and handle.
def hotel(x,y,z,w,d,h):
    box('호텔 선물 상자',x,y,z+h/2,w,d,h,linen,.011)
    patch('호텔 정면',3,1,1,lambda u,v:(x+(u-.5)*(w-.012),y-d/2-.001,z+.004+v*(h-.01)))
    for side in (-1,1):
        patch('호텔 측면',3,1,1,lambda u,v:(x+side*(w/2+.001),y+side*(u-.5)*(d-.01),z+.004+v*(h-.01)))
    box('상자 뚜껑',x,y,z+h+.006,w+.012,d+.01,.018,sage,.004)
    cord('상자 손잡이',[(x+.16*w*cos(i*pi/12),y,z+h+.01+.06*sin(i*pi/12)) for i in range(13)],.007,brass)
    box('상자 걸쇠',x,y-d/2-.006,z+h-.02,.025,.01,.044,brass,.003)

# Rear freestanding open shelf, just forward of the mural.
for x in (-1.30,1.30):
    for y in (1.99,2.40):
        rod('선반 황동 기둥',(x,y,.10),(x,y,1.72),.015,brass)
for z in (.19,.82,1.44):
    box('진열 선반',0,2.19,z,2.70,.47,.036,milk,.009)
for x,z in [(-.91,.21),(-.46,.21),(.68,.21),(-.96,.84),(.66,.84),(.98,1.46)]:
    hotel(x,2.16,z,.31,.21,.33)

def cushion(name,x,y,z,w,h,t,tile,tilt=.20):
    # The two puffed faces meet at a piped knife-edge seam.
    def surface(u,v,front):
        a,b=2*u-1,2*v-1
        breadth=max(0,(1-a*a)*(1-b*b))
        return (x+a*w/2*(1-.06*(1-b*b)),y+tilt*(v-.5)*h+front*(.008+t*breadth**.58),
                z+b*h/2*(1-.08*(1-a*a)))
    for side in (-1,1):
        o=patch(name,tile,12,10,lambda u,v:surface(u if side<0 else 1-u,v,side))
        for face in o.data.polygons:face.use_smooth=True
    border=[(i/12,0) for i in range(12)]+[(1,j/10) for j in range(10)]+[(1-i/12,1) for i in range(12)]+[(0,1-j/10) for j in range(10)]
    cord('쿠션 파이핑',[(a,b+.008,c) for a,b,c in [surface(u,v,-1) for u,v in border]],.009,linen,True)

cushion('열기구 쿠션',-.50,2.18,1.67,.64,.41,.074,1)
cushion('회전목마 쿠션',.22,2.18,1.67,.64,.41,.074,2)
# Front chest: six separately framed drawer faces, knobs, feet and overhanging top.
cx,cy=.47,.54
for x in (-.70,.70):
    for y in (-.30,.30):
        box('서랍장 발',cx+x,cy+y,.095,.078,.078,.19,milk,.009)
box('서랍장 몸통',cx,cy,.52,1.55,.70,.76,milk,.02)
for row in range(3):
    for col in range(2):
        x=cx+(col-.5)*.747
        z=.276+row*.237
        box('서랍 앞판',x,cy-.363,z,.724,.040,.221,edge,.012)
        box('서랍 안쪽 몰딩',x,cy-.39,z,.667,.021,.170,milk,.009)
        ball('도자기 서랍 손잡이',x,cy-.422,z,(.025,.026,.025),milk)
box('서랍장 상판',cx,cy,.925,1.66,.78,.065,milk,.022)
hotel(cx+.50,cy+.13,.958,.36,.21,.41)
# Folded, individually edged swaddles displayed upright on a sloped rack.
for i,tile in enumerate([1,0,2]):
    x=cx-.56+i*.255
    box('카레 받침',x,cy-.06,.972,.246,.31,.027,brass,.004)
    box('접은 카레',x,cy-.02,1.111,.236,.21,.28,linen,.027)
    def fold(u,v):
        # U-shaped fold over the top of the upright stack.
        a=(u-.5)*.239
        if v<.78:return (x+a,cy-.142+.006*cos(2*pi*u),.985+v*.38)
        angle=(v-.78)/.22*pi
        return (x+a,cy-.142+.006*cos(2*pi*u)+.044*(1-cos(angle)),1.2814+.044*sin(angle))
    patch('접은 카레 무늬',tile,10,20,fold)
# The showroom cot is a bedding prop. Long rails expose the textiles from both sides.
bx,yy=-.44,-1.20
w,d=1.49,.82
for x in (bx-w/2,bx+w/2):
    for y in (yy-d/2,yy+d/2):
        box('침대 기둥',x,y,.51,.062,.062,1.02,milk,.010)
for y in (yy-d/2,yy+d/2):
    for z,h in ((.22,.10),(.91,.066)):
        box('침대 긴 난간',bx,y,z,w,.045,h,milk,.008)
    for i in range(13):
        x=bx-w/2+(i+1)*w/14
        box('긴 면 평살',x,y,.565,.037,.024,.64,milk,.005)
for x in (bx-w/2,bx+w/2):
    for z in (.22,.965):
        box('침대 끝 난간',x,yy,z,.047,d,.062,milk,.008)
    for i in range(7):
        box('짧은 면 평살',x,yy-d/2+(i+1)*d/8,.59,.022,.034,.70,milk,.004)
box('침대 받침',bx,yy,.31,w-.05,d-.045,.13,edge,.025)
box('시트 씌운 매트리스',bx,yy,.432,w-.08,d-.072,.15,milk,.057)
# Reversible quilt with a blue binding and slight stuffing ridges.
box('퀼트 테두리',bx,yy-.015,.524,1.28,.67,.054,blue,.022)
patch('회전목마 퀼트',2,24,16,lambda u,v:(bx+(u-.5)*1.14,yy-.018+(v-.5)*.57,.552+.014*sin(pi*v)*sin(pi*u)+.003*cos(8*pi*u)))
cushion('침대 맨션 쿠션',bx-.34,yy+.21,.707,.54,.40,.070,0,.46)
cushion('침대 회전목마 쿠션',bx+.31,yy+.21,.703,.54,.39,.075,2,.43)
# A swaddle folded over the near rail has two hanging faces joined over the bar.
def hung(u,v):
    x=bx-.23+(u-.5)*.48
    ripple=.012*cos(6*pi*u)+.004*sin(3*pi*u+2*v)
    if v<.43:return (x,yy-d/2-.035+ripple,.568+.375*v/.43)
    if v<.60:
        t=(v-.43)/.17*pi
        return (x,yy-d/2-.035*cos(t)+ripple,.943+.035*sin(t))
    return (x,yy-d/2+.035+ripple,.943-.34*(v-.60)/.40)
patch('난간에 펼친 열기구 카레',1,16,36,hung)
for u in (0,1):cord('카레 감침질',[hung(u,i/36) for i in range(37)],.0045,linen)

# Convert splines to standalone editable meshes; freeze the native file before batching.
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active=next(iter(collection.objects))
bpy.ops.object.convert(target='MESH')
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('EDITABLE_OBJECTS',len(collection.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'atelier.blend'),compress=True)
fixtures=bpy.data.materials.new('진열대 마감')
fixtures.use_nodes=True
nodes=fixtures.node_tree.nodes
colors=nodes.new('ShaderNodeVertexColor')
colors.layer_name='Finish'
fixtures.node_tree.links.new(colors.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
pieces=list(collection.objects)
for printed,batch in [(False,'ChouxJoinery'),(True,'ChouxTextiles')]:
    bpy.ops.object.select_all(action='DESELECT')
    chosen=[o for o in pieces if o and (o.data.materials[0]==printmat)==printed]
    if not printed:
        for o in chosen:
            m=o.data
            color=m.materials[0].diffuse_color[:]
            attr=m.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for item in attr.data:item.color=color
            m.materials.clear()
            m.materials.append(fixtures)
    for o in chosen:o.select_set(True)
    bpy.context.view_layer.objects.active=chosen[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
    pieces=[o for o in collection.objects if o!=bpy.context.object]
bpy.ops.export_scene.gltf(filepath=str(OUT/'atelier.glb'),export_format='GLB',export_animations=False)
