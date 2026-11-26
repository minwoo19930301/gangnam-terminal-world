"""Author the Gangnam HERNO display in metres. Front is -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_6F_HERNO_MENS')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
batch = 'HernoGangnamFixtures'
palette = dict(oak='B68D62',oakedge='CDAB81', graphite='494541', reveal='292726',
 ivory='F4EADF', cream='DED6C8', stone='80756D', brass='9C876A', chrome='BCBBB7',
 ink='242B38', navy='384358', olive='635F46', moss='828065', rust='A34B3F',
 beige='BBAB96', suede='AC9174', taupe='928475', sand='D4C6B0', white='F0EDE6',
 zip='59544B', rib='49473D', glow='FFF1D5', shadow='4C4A49',glass='DFE6E5')
materials = {}
def linear(c):
    s = int(c,16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def finish(name):
    if name not in materials:
        rgb = palette[name]
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*[linear(rgb[i:i+2]) for i in (0,2,4)],1)
        m.use_nodes = True
        node=m.node_tree.nodes.get('Principled BSDF')
        node.inputs['Base Color'].default_value=m.diffuse_color
        node.inputs['Roughness'].default_value={'sand':.76,'lapel':.76,'suede':.89,'hood':.94,'navy':.98,'rib':.98,'metal':.30}.get(name,.57)
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(prefix+name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    ob.matrix_world=transform.copy()
    pieces.setdefault(batch,[]).append(ob)
    return ob

def skins(name, rings, color, bevel=0, cap=True):
    n=len(rings[0])
    faces=[list(reversed(range(n)))] if cap else []
    for k in range(len(rings)-1):
        for i in range(n):
            a=k*n+i
            b=k*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    if cap:
        faces.append([n*(len(rings)-1)+i for i in range(n)])
    return part(name,[p for ring in rings for p in ring],faces,color,bevel)

def outline(w,d,r):
    pts=[]
    for x,y,a in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        steps=2
        for j in range(steps+1):
            t=radians(a+90*j/steps)
            pts.append((x*(w/2-r)+r*cos(t),y*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,r,col):
    loop=outline(w,d,r)
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.004,h*.14))

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(t*pi/4),r*sin(t*pi/4),0)) for t in range(8)]
    return skins(name,[[p+v for v in ring] for p in [a,b]],col)


def place(x=0,y=0,z=0,angle=0):
    global transform
    transform=Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z')

def pipe(name,pts,r,col,n=6):
    rings=[]
    for i,p in enumerate(pts):
        axis=Vector(pts[min(i+1,len(pts)-1)])-Vector(pts[max(i-1,0)])
        normal=axis.normalized()
        base=normal.cross(Vector((0,1,0)))
        if base.length<.01: base=normal.cross(Vector((1,0,0)))
        base.normalize()
        other=normal.cross(base)
        rings.append([Vector(p)+r*(base*cos(j*2*pi/n)+other*sin(j*2*pi/n)) for j in range(n)])
    return skins(name,rings,col)

def surface(name,rings,col,closed=True):
    count=len(rings[0])
    faces=[(j*count+i,j*count+(i+1)%count,(j+1)*count+(i+1)%count,(j+1)*count+i)
           for j in range(len(rings)-1) for i in range(count if closed else count-1)]
    ob=part(name,[p for r in rings for p in r],faces,col)
    for f in ob.data.polygons:f.use_smooth=True
    return ob


# Sections follow the garment rather than slicing a single inflated capsule.
# Each baffle pinches along a slightly irregular horizontal sewn seam.
def cloth(name,rows,col,n=20,phase=0):
    rings=[]
    for cx,cy,z,w,d in rows:
        ring=[]
        for j in range(n):
            a=2*pi*j/n
            wrinkle=.0022*(cos(7*a+11*z+phase)+.5*sin(11*a-16*z))
            ring.append((cx+(w+wrinkle)*cos(a),cy+(d+wrinkle)*sin(a),
                         z+.005*sin(3*a+phase+2*z)))
        rings.append(ring)
    obj=skins(name,rings,col)
    for f in obj.data.polygons:
        f.use_smooth=len(f.vertices)==4
    return obj

def band_rows(lo,hi,count,shape):
    rows=[]
    for k in range(count):
        for f,bulk in [(0,.80),(.22,1.01),(.58,1.10),(.85,1.02)]:
            t=(k+f)/count
            x,y,w,d=shape(t)
            rows.append((x,y,lo+(hi-lo)*t,w*(.90+.10*bulk),d*bulk))
    x,y,w,d=shape(1)
    return rows+[(x,y,hi,w,d*.84)]

def garment(x,y,z,ang,col,quilt=True,hood=False,hanging=True):
    global batch
    place(x,y,z,ang)
    batch='HernoGangnamNylon'
    # Narrow neck, supported shoulders, lower hem slightly drawn in.
    def body(t):
        w=.218+.035*sin(pi*t)-.13*max(0,(t-.82)/.18)
        return (0,0,w,.093+.021*sin(pi*t)-.027*max(0,(t-.85)/.15))
    if quilt:
        rows=band_rows(0,.66,5,body)
    else:
        rows=[(*body(t)[:2],t*.66,*body(t)[2:]) for t in (0,.05,.43,.73,.85,.95,1)]
    cloth('가로 퀼팅 몸판' if quilt else '셔츠 재킷 몸판',rows,col,28)
    for s in (-1,1):
        def sleeve(t):
            return (s*(.277-.078*t+.014*sin(t*pi)),.004+.021*sin(t*pi),
                    .051+.030*t,.053+.034*t)
        arm=(band_rows(.012,.593,5,sleeve) if quilt else
             [(*sleeve(t)[:2],.012+.581*t,*sleeve(t)[2:]) for t in (0,.13,.44,.51,.8,1)])
        cloth('소매',arm,col,14,s)
        cloth('소맷단',[(s*.277,.004,.005,.052,.052),(s*.276,.004,.045,.054,.054)],col,14)
        pipe('사선 주머니 입술',[(s*.164,-.075,.107),(s*.157,-.093,.14),
             (s*.111,-.107,.27)],.009,col)
    if hood:
        # Double wall around an open, recessed hood mouth, with a dark lining.
        rings=[]
        for width,height,dep in [(.139,.156,.065),(.155,.167,-.038),(.143,.150,-.085),(.123,.126,-.057),(.090,.088,.049)]:
            rings.append([(width*cos(t*pi/14),dep+.026*sin(t*pi/14),.673+height*sin(t*pi/14)) for t in range(28)])
        surface('후드 겉감',rings[:3],col)
        surface('후드 안감',rings[2:],'shadow')
        cloth('소매 지퍼 포켓',[(.254,-.012,.34,.058,.077),(.247,-.012,.47,.060,.084)],col,14)
        rod('소매 포켓 지퍼',(.258,-.092,.35),(.254,-.092,.46),.003,'chrome')
    if quilt:
        cloth('스탠드 칼라',[(0,0,.624,.106,.071),(0,.003,.684,.098,.071),
             (0,.005,.707,.095,.065),(0,.005,.697,.083,.054)],col)
        pipe('앞 지퍼 테이프',[(0,-.081,.004),(0,-.108,.16),(0,-.124,.34),
             (0,-.112,.53),(0,-.079,.624),(0,-.064,.695)],.006,'zip')
        rod('이중 슬라이더',(.006,-.080,.67),(.009,-.085,.642),.004,'chrome')
    else:
        for s in [-1,1]:
            part('셔츠 칼라 끝',[(0,-.065,.64),(s*.087,-.041,.68),
                 (s*.126,-.077,.607),(s*.062,-.102,.568)],[(0,1,2,3)],col)
        rod('앞단',(.004,-.11,.03),(.004,-.113,.6),.009,col)
        for k in range(5):
            rod('프레스 단추',(0,-.12,.085+.108*k),(0,-.124,.085+.108*k),.006,'brass')
    if hanging:
        batch='HernoGangnamFixtures'
        pipe('원목 옷걸이',[(-.194,0,.594),(-.142,0,.635),(0,0,.697),(.142,0,.635),(.194,0,.594)],.016,'oak')
        pipe('걸이 갈고리',[(0,0,.69),(0,0,.734),(.018,0,.755),(.018,0,.775),
             (0,0,.785),(-.021,0,.778),(-.025,0,.757)],.004,'chrome')

def folded(x,y,z,col,angle=0):
    global batch
    batch='HernoGangnamFixtures'
    place(x,y,z,angle)
    rings=[]
    for k,scale in [(0,.94),(.012,1),(.053,.98),(.060,.91)]:
        rings.append([(a*scale,b*scale,k+.006*cos(14*a+5*b)) for a,b in outline(.39,.29,.038)])
    skins('접은 니트',rings,col)
    pipe('니트 접힌 가장자리',[(-.165,-.138,.023),(-.058,-.144,.02),(.081,-.142,.025),(.167,-.136,.026)],.003,col)
    pipe('목둘레 시보리',[(-.071,.126,.06),(-.056,.078,.063),(0,.056,.063),(.052,.079,.063),(.072,.125,.06)],.010,col)

def cabinet():
    global batch
    batch='HernoGangnamFixtures';place()
    plate('흑연색 배면',0,.29,.06,5.62,.11,2.76,.009,'graphite')
    for x in [-2.79,-.47,.47,2.79]:
        plate('금속 세로 격벽',x,.025,.07,.045,.61,2.70,.005,'graphite')
        plate('수직 매입 조명',x,-.283,.08,.014,.012,2.68,.002,'glow')
    for x,w in [(-1.63,2.30),(0,.90),(1.63,2.30)]:
        place()
        plate('기단',x,.01,.04,w,.57,.15,.009,'stone')
        for h in ([.85,1.35,1.83,2.29,2.69] if x==0 else [1.99,2.69]):
            plate('원목 선반',x,0,h,w,.58,.052,.006,'oak')
            plate('간접 조명',x,-.251,h-.006,w-.044,.017,.012,.003,'glow')
        if x:
            rod('니켈 행거 봉',(x-w/2,0,1.914),(x+w/2,0,1.914),.012,'chrome')
    for side,cols in [(-1,['beige','sand','taupe','olive','cream','navy']),
                      (1,['navy','ink','cream','stone','rust','navy'])]:
        for i,col in enumerate(cols):
            garment(side*1.63-.83+.323*i,-.018,1.14,36+(i%3)*8,col,side==1 or i%3==0)
        for i,col in enumerate(['cream','navy','taupe']):
            for k in range(2):
                folded(side*1.63-.62+i*.63,.013,2.044+.060*k,col,3*i-3)
    for i,col in enumerate(['beige','ink','taupe','sand']):
        for k in range(2):
            folded(0,-.02,[.85,1.35,1.83,2.29][i]+.054+.06*k,col,4)
    place()
    plate('상부 헤더',0,.02,2.76,5.64,.61,.28,.006,'reveal')
    font=bpy.data.curves.new('상호','FONT');font.body='HERNO';font.size=.22;font.align_x='CENTER';font.extrude=.002
    label=bpy.data.objects.new('상호',font);gallery.objects.link(label)
    label.location=(0,-.292,2.824);label.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(label.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    ob=bpy.data.objects.new('에르노 입체 상호',mesh);gallery.objects.link(ob);ob.matrix_world=label.matrix_world.copy()
    mesh.materials.append(finish('ivory'));pieces[batch].append(ob);bpy.data.objects.remove(label,do_unlink=True)

def mannequin():
    global batch
    batch='HernoGangnamFixtures';place(-1.52,-1.59,0,10)
    plate('착장 단상',0,0,.015,.83,.66,.115,.014,'graphite')
    for side in [-1,1]:
        s=side*.105
        cloth('바지 다리',[(s,-.003,.198,.082,.083),(s,.009,.25,.085,.091),
            (s,.015,.58,.086,.101),(s,.031,.67,.093,.099),(s,.016,.98,.103,.12),
            (s*.8,.01,1.07,.11,.105)],'ink',18)
        cloth('스니커즈',[(s,-.049,.134,.079,.153),(s,-.052,.157,.080,.156),
            (s,-.041,.186,.078,.143),(s,.007,.222,.067,.092)],'shadow',18)
    for side in [-1,1]:
        s=.28*side
        cloth('마네킹 손',[(s,-.006,.891,.023,.028),(s,-.009,.926,.035,.039),
            (s,0,.981,.043,.042),(s,0,1.023,.036,.035)],'ivory',14)
        cloth('스니커즈 옆창',[(side*.105,-.05,.133,.080,.154),
              (side*.105,-.05,.151,.081,.155)],'stone',18)
    cloth('목',[(0,0,1.62,.063,.06),(0,.003,1.78,.061,.06)],'ivory')
    cloth('마네킹 두상',[(0,-.016,1.72,.051,.054),(0,-.012,1.755,.080,.078),
          (0,.003,1.824,.089,.087),(0,.003,1.905,.087,.082),(0,0,1.94,.064,.067)],'ivory',24)
    cloth('캡 크라운',[(0,.008,1.856,.099,.096),(0,.008,1.906,.096,.098),
         (0,.012,1.956,.06,.065),(0,.012,1.974,.022,.025)],'beige',20)
    cloth('캡 챙',[(0,-.088,1.854,.094,.081),(0,-.088,1.866,.093,.08)],'beige')
    garment(-1.52,-1.59,.984,10,'olive',True,True,False)

def case():
    global batch
    batch='HernoGangnamFixtures';place(.60,-1.77)
    plate('차콜 받침',0,0,.03,1.77,.73,.27,.012,'graphite')
    plate('하단 진열면',0,0,.30,1.77,.73,.04,.008,'stone')
    plate('중간 트레이',0,0,.626,1.75,.71,.038,.008,'oakedge')
    for x in [-.87,.87]:
        for y in [-.35,.35]:
            rod('쇼케이스 모서리',(x,y,.32),(x,y,1.04),.012,'graphite')
        rod('상부 짧은 살',(x,-.35,1.04),(x,.35,1.04),.011,'graphite')
    for y in [-.35,.35]:
        rod('상부 긴 살',(-.87,y,1.04),(.87,y,1.04),.011,'graphite')
    batch='HernoGangnamGlass'
    plate('유리 상판',0,0,1.034,1.73,.69,.009,.004,'glass')
    for k,col in enumerate(['cream','sand','taupe']):
        folded(.33,-1.77,.341+.062*k,col,4-k)
    for i,col in enumerate(['beige','ink']):
        for k in range(2):
            folded(.22+i*.77,-1.77,.665+.061*k,col,2-i*9)

def return_rail():
    global batch
    batch='HernoGangnamFixtures'
    place(-2.91,-1.63,0,90)
    plate('측면 배면',0,.13,.08,2.49,.09,2.61,.008,'stone')
    plate('옆장 바닥 선반',0,.01,.06,2.49,.50,.13,.008,'graphite')
    for x in [-1.22,1.22]:
        plate('옆장 끝판',x,.01,.08,.045,.51,2.60,.006,'graphite')
    for z in [1.99,2.66]:
        plate('옆장 나무 선반',0,.01,z,2.49,.51,.05,.008,'oak')
        plate('옆장 조명',0,-.228,z-.008,2.43,.013,.014,.002,'glow')
    rod('옆장 행거 봉',(-1.21,-.04,1.914),(1.21,-.04,1.914),.012,'chrome')
    for i,col in enumerate(['taupe','cream','navy','beige','ink']):
        garment(-2.87,-2.51+i*.41,1.14,90+34+i*3,col,i%2==0)
    place(.27,-1.72)
    plate('쇼케이스 아래 러그',0,0,.004,2.87,1.61,.012,.028,'taupe')
    for x in [-1.33,1.33]:
        plate('러그 테두리',x,0,.016,.05,1.57,.002,.003,'sand')

cabinet()
return_rail()
mannequin()
case()

# Tileable tangential oak grain, scaled in metres on each shelf and end face.
from random import Random
rng=Random(45)
size=256
grain=bpy.data.images.new('에르노 참나무 무늬',width=size,height=size)
pixels=[]
for j in range(size):
    for i in range(size):
        a=2*pi*i/size;b=2*pi*j/size
        ring=sin(19*b+1.7*sin(a)+.8*cos(2*a-2*b))
        value=.82+.06*ring+.041*sin(47*b+2*sin(a))-.10*max(0,ring)**9+rng.uniform(-.018,.018)
        pixels.extend([value,value*.76,value*.54,1])
grain.pixels.foreach_set(pixels);grain.pack()
oak=finish('oak')
tex=oak.node_tree.nodes.new('ShaderNodeTexImage');tex.image=grain
oak.node_tree.links.new(tex.outputs['Color'],oak.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
wood=[]
for ob in list(pieces['HernoGangnamFixtures']):
    if ob.data.materials[0]!=oak:continue
    wood.append(ob);pieces['HernoGangnamFixtures'].remove(ob)
    uv=ob.data.uv_layers.new(name='선반 결')
    for face in ob.data.polygons:
        for idx in face.loop_indices:
            x,y,z=ob.data.vertices[ob.data.loops[idx].vertex_index].co
            uv.data[idx].uv=(x/1.15 if abs(face.normal.x)<.8 else y/.9,
                             y/.6 if abs(face.normal.z)>.7 else z/.48)
pieces['HernoGangnamOak']=wood
glass=finish('glass')
glass.diffuse_color=(.8,.89,.93,.09)
surf=glass.node_tree.nodes.get('Principled BSDF')
surf.inputs['Alpha'].default_value=.09
glass.blend_method='BLEND'
# Store the same vertex tint in both editable and exported nylon. The slight
# variation follows the folds; it remains visible even under diffuse mall light.
for name,objects in pieces.items():
    if name in ('HernoGangnamGlass','HernoGangnamOak'):continue
    for ob in objects:
        mesh=ob.data;mat=mesh.materials[0];rgb=mat.diffuse_color[:3]
        attr=mesh.color_attributes.new(name='색상',type='BYTE_COLOR',domain='POINT')
        for i,v in enumerate(mesh.vertices):
            x,y,z=v.co
            shade=(.91+.12*sin(22*x+7*z)+.07*cos(57*z+4*x)
                   +.30*max(0,v.normal.z)-.17*max(0,-v.normal.z)) if name.endswith('Nylon') else 1
            attr.data[i].color=(*[min(1,c*shade) for c in rgb],1)
        nodes=mat.node_tree.nodes
        if not nodes.get('옷감색') and name.endswith('Nylon'):
            node=nodes.new('ShaderNodeVertexColor');node.layer_name='색상';node.name='옷감색'
            mat.node_tree.links.new(node.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
for name,objects in pieces.items():
    bpy.ops.object.select_all(action='DESELECT')
    if name not in ('HernoGangnamGlass','HernoGangnamOak'):
        mat=bpy.data.materials.new(name);mat.use_nodes=True
        nodes=mat.node_tree.nodes;surf=nodes.get('Principled BSDF')
        surf.inputs['Roughness'].default_value=.38 if name.endswith('Nylon') else .66
        node=nodes.new('ShaderNodeVertexColor');node.layer_name='색상'
        mat.node_tree.links.new(node.outputs['Color'],surf.inputs['Base Color'])
        for ob in objects:
            ob.data.materials.clear();ob.data.materials.append(mat)
    for ob in objects:ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    bpy.context.view_layer.objects.active.name=name
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
