"""Author the editable TUMI exhibition vignette and export by surface finish."""
import bpy
import math
import random
from pathlib import Path
from mathutils import Vector, Matrix
from math import sin, cos, pi

out = Path(__file__).resolve().parent
rng = random.Random(38)
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('SSG_6F_TUMI')
bpy.context.scene.collection.children.link(collection)
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[collection.name]
bpy.context.preferences.filepaths.save_version = 0
groups = {}
for name, rough, metal in [('TumiGangnamVoyageur', .59, 0), ('TumiGangnamHardware', .26, .72),
                            ('TumiGangnamCeramic', .36, 0)]:
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes.get('Principled BSDF')
    color = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    color.layer_name = 'Tint'
    mat.node_tree.links.new(color.outputs['Color'], bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    groups[name] = mat
cloth, hardware, ceramic = groups.values()
# Relief-only woven normal tile. Texels pack into the native library and GLB.
weave=cloth.copy()
weave.name='TumiGangnamWovenNylon'
groups[weave.name]=weave
size=64
image=bpy.data.images.new('나일론 평직',width=size,height=size,alpha=False)
image.colorspace_settings.name='Non-Color'
pixels=[]
for j in range(size):
    for i in range(size):
        a,b=2*pi*i/size,2*pi*j/size
        du=.27*cos(4*a)*(.55+.45*cos(2*b))
        dv=.23*cos(4*b)*(.55-.45*cos(2*a))
        n=Vector((-du,-dv,1)).normalized()
        pixels.extend((.5+.5*n.x,.5+.5*n.y,.5+.5*n.z,1))
image.pixels.foreach_set(pixels)
image.pack()
tex=weave.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=image
bump=weave.node_tree.nodes.new('ShaderNodeNormalMap')
bump.inputs['Strength'].default_value=.48
weave.node_tree.links.new(tex.outputs['Color'],bump.inputs['Color'])
weave.node_tree.links.new(bump.outputs['Normal'],weave.node_tree.nodes.get('Principled BSDF').inputs['Normal'])
sand, trim, seam = 'ba9172', 'aa8061', '89674f'
coral, copper, silver = 'da7555', 'bc5a40', 'cac4ad'
ivory, teal = 'f2eada', '5bb1be'
frame = Matrix.Identity(4)

def finish(obj, name, tint, mat, smooth=False):
    obj.name = name
    obj.data.materials.append(mat)
    rgb = [int(tint[i:i+2],16)/255 for i in (0,2,4)]
    col = obj.data.color_attributes.new(name='Tint', type='BYTE_COLOR', domain='POINT')
    for v in col.data:
        v.color_srgb = (*rgb,1)
    for face in obj.data.polygons:
        face.use_smooth = smooth
    obj.matrix_world = frame @ obj.matrix_world
    return obj

def mesh(name, verts, faces, color, mat=cloth, smooth=True):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    return finish(obj,name,color,mat,smooth)

def block(name, loc, size, color, bevel=.0, mat=cloth):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.data.transform(Matrix.Diagonal((*size,1)))
    if bevel:
        mod = obj.modifiers.new('모서리', 'BEVEL')
        mod.width, mod.segments = bevel, 3
        bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(obj,name,color,mat)

def tube(name, points, radius, color, mat=cloth, sides=8):
    pts=list(map(Vector,points))
    verts=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        axis=Vector((0,1,0)) if abs(tangent.y)<.94 else Vector((1,0,0))
        u=tangent.cross(axis).normalized()
        v=tangent.cross(u)
        verts.extend(p+radius*(u*cos(2*pi*j/sides)+v*sin(2*pi*j/sides)) for j in range(sides))
    faces=[(i*sides+j,i*sides+(j+1)%sides,(i+1)*sides+(j+1)%sides,(i+1)*sides+j)
           for i in range(len(pts)-1) for j in range(sides)]
    return mesh(name,verts,faces,color,mat)

def shell(name, center, rows, color, power=.64, ripple=0, mat=cloth, count=40):
    # Superelliptic sections swell around seams. The lower rings gather more cloth.
    verts=[]
    for k,(z,w,d,shift) in enumerate(rows):
        for j in range(count):
            a=2*pi*j/count
            wave=1+ripple*(sin(5*a+.7*k)+.45*cos(9*a-.8*k))*(1-k/(2*len(rows)))
            def shape(t): return math.copysign(abs(t)**power,t)
            verts.append((center[0]+w*shape(cos(a))*wave,center[1]+shift+d*shape(sin(a))*wave,z))
    faces=[tuple(reversed(range(count)))]
    faces.extend((i*count+j,i*count+(j+1)%count,(i+1)*count+(j+1)%count,(i+1)*count+j)
                 for i in range(len(rows)-1) for j in range(count))
    faces.append(tuple(range(len(verts)-count,len(verts))))
    obj=mesh(name,verts,faces,color,weave if mat==cloth else mat)
    if mat==cloth:
        uv=obj.data.uv_layers.new(name='섬유 결')
        perimeter=4*(max(row[1] for row in rows)+max(row[2] for row in rows))
        for poly in obj.data.polygons:
            indices=[obj.data.loops[k].vertex_index for k in poly.loop_indices]
            wrap=max(i%count for i in indices)-min(i%count for i in indices)>count/2
            for k,i in zip(poly.loop_indices,indices):
                step=i%count
                if wrap and step==0:step=count
                uv.data[k].uv=(step/count*perimeter*50,verts[i][2]*50)
    return obj

def ribbon(name, path, width, thickness, color):
    verts=[]
    for x,y,z in path:
        verts += [(x-width/2,y-thickness/2,z),(x+width/2,y-thickness/2,z),
                  (x+width/2,y+thickness/2,z),(x-width/2,y+thickness/2,z)]
    faces=[(i*4+j,i*4+(j+1)%4,(i+1)*4+(j+1)%4,(i+1)*4+j)
           for i in range(len(path)-1) for j in range(4)]
    return mesh(name,verts,faces,color)

def place(x,y,z,angle=0):
    return Matrix.Translation((x,y,z)) @ Matrix.Rotation(math.radians(angle),4,'Z')

def logo(x,y,z,sz):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    obj=bpy.context.object
    obj.data.body='TUMI'
    obj.data.align_x='CENTER'
    obj.data.size=sz
    obj.data.extrude=.00045
    bpy.ops.object.convert(target='MESH')
    finish(obj,'투미 레터링',silver,hardware)

def zipper(name,pts):
    tube(name+' 테이프',pts,.0035,seam)
    tube(name+' 체인',[(x,y-.0027,z+.0008) for x,y,z in pts],.0014,silver,hardware,6)
    x,y,z=pts[-1]
    block(name+' 슬라이더',(x,y-.003,z),(.009,.007,.010),silver,.002,hardware)
    ribbon(name+' 지퍼 탭',[(x,y-.004,z),(x+.004,y-.010,z-.009),(x+.009,y-.012,z-.029)],.008,.002,trim)

def backpack(color, leather):
    shell('주름진 나일론 몸판',(0,0),[(0,.136,.071,0),(.013,.162,.080,0),(.035,.166,.085,0),
        (.065,.161,.082,0),(.12,.163,.079,0),(.23,.154,.081,.002),(.277,.147,.076,.004),
        (.30,.149,.074,.006),(.325,.141,.067,.009),(.365,.136,.056,.012),(.376,.119,.046,.009)],color,ripple=.028)
    for sign in [-1,1]:
        x=sign*.096
        shell('분리형 전면 지퍼 포켓',(x,-.077),[(.009,.055,.013,0),(.019,.064,.026,-.001),
            (.054,.066,.031,-.002),(.143,.062,.032,0),(.174,.059,.024,0),(.184,.046,.013,0)],color,ripple=.021)
        zipper('포켓 곡선',[(x+sign*.049,-.085,.172),(x+sign*.02,-.098,.173),
            (x-sign*.035,-.101,.156),(x-sign*.048,-.106,.147),(x-sign*.05,-.106,.114)])
        ribbon('패딩 어깨끈',[(sign*.066,.044,.352),(sign*.087,.099,.321),
            (sign*.099,.122,.234),(sign*.104,.114,.137),(sign*.113,.091,.079),
            (sign*.142,.058,.048)],.039,.013,leather)
        tube('측면 웰트',[(sign*.148,.048,.035),(sign*.157,.049,.091),(sign*.151,.051,.21),
                          (sign*.135,.053,.309)],.0022,leather)
    # Flap rolls over the mouth, then hangs free above the two separate pockets.
    paths=[(.064,.334,.118),(.058,.366,.126),(.033,.381,.132),(-.015,.384,.137),
           (-.061,.373,.139),(-.083,.354,.138),(-.089,.278,.135),(-.094,.249,.128),(-.096,.234,.111)]
    verts=[]
    for y,z,w in paths:
        for j in range(17):
            t=(j-8)/8
            verts.append((t*w,y+.009*t*t,z+.010*t*t))
    obj=mesh('접어 덮는 곡면 플랩',verts,[(i*17+j,i*17+j+1,(i+1)*17+j+1,(i+1)*17+j)
        for i in range(len(paths)-1) for j in range(16)],leather)
    tube('플랩 가장자리',verts[::17]+verts[-16:]+verts[16:-17:17][::-1],.0023,leather)
    ribbon('중앙 웨빙 벨트',[(0,-.077,.012),(0,-.094,.115),(0,-.1,.206),(0,-.095,.239)],.029,.004,leather)
    for z in [.193,.216]:
        block('버클 가로대',(0,-.104,z),(.035,.009,.006),silver,.002,hardware)
    for x in [-.015,.015]:
        block('버클 옆면',(x,-.104,.205),(.005,.009,.025),silver,.0015,hardware)
    tube('가죽 손잡이',[(.052*cos(pi*i/16),.022,.373+.054*sin(pi*i/16)) for i in range(17)],.008,leather)
    # Back pass-through sleeve and edge binding at the strap anchors.
    block('후면 슬리브',(0,.081,.168),(.24,.010,.079),leather,.005)
    for s in [-1,1]:
        block('어깨끈 조절쇠',(s*.11,.103,.121),(.041,.009,.008),silver,.002,hardware)
    logo(0,-.096,.250,.013)

def pouch(color):
    shell('세로 미니백',(0,0),[(0,.062,.024,0),(.010,.074,.031,0),(.038,.076,.033,0),
        (.159,.074,.032,0),(.182,.069,.028,0),(.191,.058,.025,0)],color,.48,.008)
    for y in [-.013,.015]:
        zipper('이중 수납', [(-.072,y,.119),(-.071,y,.166),(-.064,y,.183),(-.055,y,.191),
                           (.049,y,.192),(.064,y,.186),(.072,y,.173)])
    zipper('앞면 가로 포켓',[(-.066,-.031,.129),(0,-.035,.128),(.064,-.032,.129)])
    for sign in [-1,1]:
        x=sign*.073
        tube('옆면 연결 고리',[(x+.008*cos(i*pi/8),0,.143+.009*sin(i*pi/8)) for i in range(17)],.002,silver,hardware)
    ribbon('접어 놓은 크로스 끈',[(.076,0,.142),(.109,.011,.117),(.135,.038,.068),
        (.15,.048,.009),(.121,.055,.003),(-.028,.064,.003),(-.091,.051,.015),(-.078,.014,.139)],.013,.003,color)

# Cream display counter and blue pool-tile riser from the Gangnam exhibition.
block('석회색 진열대',(0,0,.50),(1.73,.70,1.0),ivory,.052,ceramic)
frame=place(-.06,-.088,1.0,-5)
backpack(sand,trim)
frame=place(-.428,-.113,1.0,8)
pouch(coral)
frame=place(.47,.025,1.0)
shell('백색 도기 화병',(0,0),[(0,.065,.065,0),(.012,.073,.073,0),(.143,.093,.093,0),
     (.192,.089,.089,0),(.22,.065,.065,0),(.224,.054,.054,0)],'ede6d4',1,mat=ceramic)
for i in range(17):
    a=i*2.4
    r=rng.uniform(.035,.145)
    end=Vector((r*cos(a),r*sin(a),rng.uniform(.335,.49)))
    start=Vector((.025*cos(a),.025*sin(a),.212))
    tube('꽃줄기',[start,start.lerp(end,.58)+Vector((0,0,.012)),end],.0024,'698050',sides=5)
    for k in (0,1):
        p=start.lerp(end,.45+k*.13)
        d=Vector((.043*cos(a+k*2),.043*sin(a+k*2),.038))
        n=Vector((-d.y,d.x,0))*.18
        mesh('피침형 잎',[p,p+d*.47+n,p+d,p+d*.47-n,p+d*.5+Vector((0,0,.004))],
             [(0,1,4),(1,2,4),(2,3,4),(3,0,4)],'637945')
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=rng.uniform(.018,.029),location=end)
    blossom=bpy.context.object
    for vert in blossom.data.vertices:vert.co*=rng.uniform(.89,1.11)
    finish(blossom,'노란 폼폰 꽃송이',rng.choice(['efd26a','e1b84b','f8db76']),cloth)

frame=Matrix.Identity(4)
# Turquoise square-tile side island. Grooves are shared across rows.
block('타일 줄눈 바탕',(-1.31,.30,.276),(.78,.65,.55),'bad6ce',.035,ceramic)
for row in range(6):
    for col in range(9):
        c=rng.choice(['63aeb4','6bb6bd','77bbc0','569da9'])
        block('앞면 풀 타일',(-1.31+(col-4)*.083,.30-.326,.052+row*.09),(.080,.010,.087),c,0,ceramic)
for side in [-1,1]:
    for row in range(6):
        for col in range(7):
            block('측면 풀 타일',(-1.31+side*.389,.30+(col-3)*.089,.052+row*.09),
                  (.008,.086,.087),teal,0,ceramic)
for row in range(7):
    for col in range(9):
        block('상판 풀 타일',(-1.31+(col-4)*.083,.30+(row-3)*.089,.553),
              (.080,.086,.008),teal,0,ceramic)
frame=place(-1.30,.20,.557,18)
backpack('839e92','779286')
frame=place(-1.55,.08,.557,-10)
pouch('78a6a4')
frame=Matrix.Identity(4)
# Nautical exhibition prop: alternating sleeves on the white display lifering.
for i in range(8):
    pts=[(-1.32+.235*cos((i+j/14)*pi/4),.55,1.42+.235*sin((i+j/14)*pi/4)) for j in range(15)]
    tube('행사 구명환',pts,.065,ivory if i%2==0 else '80c4cf',sides=16)
logo(-1.32,.482,1.64,.041)
logo(.28,-.351,.83,.072)
block('구명환 지지봉',(-1.32,.56,.96),(.033,.035,.81),'b7b9af',.006,hardware)

bpy.ops.wm.save_as_mainfile(filepath=str(out/'gallery.blend'),compress=True)
for name,mat in groups.items():
    pieces=[o for o in collection.objects if o.type=='MESH' and o.data.materials[0]==mat]
    bpy.ops.object.select_all(action='DESELECT')
    for obj in pieces:obj.select_set(True)
    bpy.context.view_layer.objects.active=pieces[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(out/'gallery.glb'),export_yup=True,export_texcoords=True,
                          export_animations=False)
