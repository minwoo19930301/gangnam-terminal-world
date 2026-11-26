"""COLLECT, Shinsegae Gangnam. Metres, Blender -Y faces the customer."""
from pathlib import Path
from math import sin, cos, pi, radians, sqrt
import tempfile
import bpy
import numpy as np
from mathutils import Vector, Matrix

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
gallery = bpy.data.collections.new("SSG_6F_Collect")
scene.collection.children.link(gallery)
scene.unit_settings.system = 'METRIC'
batches = {}
placement = Matrix.Identity(4)
prefix = ''
WOOD, CASE, FRAME, GLASS = ('CollectGangnamOak', 'CollectGangnamInterior',
                             'CollectGangnamFrames', 'CollectGangnamGlass')

def color(hexcode):
    rgb = [int(hexcode[k:k+2], 16)/255 for k in (0,2,4)]
    return tuple(v/12.92 if v < .04045 else ((v+.055)/1.055)**2.4 for v in rgb)+(1,)

def material(name, rgba, roughness, metal=0, alpha=1):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    mat.diffuse_color = rgba
    for key,value in [('Base Color',rgba),('Roughness',roughness),('Metallic',metal),('Alpha',alpha)]:
        shader.inputs[key].default_value = value
    if alpha < 1 and bpy.app.version < (4,2,0):
        mat.blend_method = 'BLEND'
    return mat

# Grain changes direction with the cut of the individual veneer panel. Packed
# source image and UVs survive appending just the collection into a master.
def oak_finish():
    rng = np.random.default_rng(23)
    v,u = np.mgrid[0:256,0:256]/256
    wave = v + .036*np.sin(2*pi*u)*np.cos(2*pi*v)+.009*np.sin(4*pi*(u+v))
    ring = np.cos(2*pi*(wave*9+.09*np.sin(2*pi*u)))
    fiber = .02*np.cos(2*pi*wave*61)+rng.normal(0,.0105,v.shape)
    shade = 1+.045*ring-.075*np.maximum(0,ring)**8+fiber
    pixels = np.ones((256,256,4),dtype=np.float32)
    pixels[:,:,:3] = shade[:,:,None]*np.array([.77,.596,.408])
    img = bpy.data.images.new('참나무 무늬목',256,256,alpha=False)
    img.pixels.foreach_set(pixels.ravel())
    with tempfile.TemporaryDirectory() as tmp:
        img.filepath_raw=str(Path(tmp)/'oak.png')
        img.file_format='PNG'
        img.save()
        img.pack()
    mat = material('참나무 무늬목',color('c69c70'),.48)
    tree=mat.node_tree
    tex=tree.nodes.new('ShaderNodeTexImage');tex.image=img
    tree.links.new(tex.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
    return mat

oak=oak_finish()
clear=material('유리와 맑은 렌즈',color('c4e7e5'),.14,.08,.12)
finishes={}
def make(name, verts, faces, tone, batch=CASE, smooth=False):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(prefix+name,mesh)
    gallery.objects.link(obj)
    obj.matrix_world=placement.copy()
    if batch==WOOD:
        mat=oak
        uv=mesh.uv_layers.new(name='목리')
        for face in mesh.polygons:
            axis=max(range(3),key=lambda i:abs(face.normal[i]))
            for idx in face.loop_indices:
                x,y,z=mesh.vertices[mesh.loops[idx].vertex_index].co
                a,b=((y,z),(x,z),(x,y))[axis]
                if '세로' in name: a,b=b,a
                uv.data[idx].uv=(a*.77,b*1.56)
    elif batch==GLASS: mat=clear
    else:
        key=(tone,batch)
        if key not in finishes:
            finishes[key]=material(tone+' '+batch,color(tone),.24 if batch==FRAME else .49,
                                   .36 if batch==FRAME else .08)
        mat=finishes[key]
    mesh.materials.append(mat)
    if smooth:
        for poly in mesh.polygons: poly.use_smooth=True
    batches.setdefault(batch,[]).append(obj)
    return obj

def strip(name,rings,tone,batch=CASE,closed=False,smooth=False):
    n=len(rings[0]); count=len(rings)
    faces=[]
    for j in range(count if closed else count-1):
        k=(j+1)%count
        for i in range(n):
            h=(i+1)%n
            faces.append((j*n+i,j*n+h,k*n+h,k*n+i))
    if not closed:
        faces.extend([list(reversed(range(n))),list(range((count-1)*n,count*n))])
    return make(name,[p for row in rings for p in row],faces,tone,batch,smooth)

def panel(name,x,y,z,w,d,h,tone='oak',radius=.008):
    r=min(radius,w*.48,d*.48)
    loop=[]
    for sx,sy,angle in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for j in range(3):
            t=radians(angle+45*j)
            loop.append((x+sx*(w/2-r)+r*cos(t),y+sy*(d/2-r)+r*sin(t)))
    return strip(name,[[(a,b,k) for a,b in loop] for k in (z,z+h)],tone,
                 WOOD if tone=='oak' else GLASS if tone=='glass' else CASE)

def tube(name,path,radii,tone,batch=FRAME,n=6):
    path=list(map(Vector,path))
    rings=[]
    for i,p in enumerate(path):
        tangent=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        guide=Vector((0,0,1)) if abs(tangent.z)<.9 else Vector((0,1,0))
        a=tangent.cross(guide).normalized()
        b=tangent.cross(a)
        r=radii[i] if isinstance(radii,list) else radii
        rings.append([p+r*(a*cos(2*pi*j/n)+b*sin(2*pi*j/n)) for j in range(n)])
    return strip(name,rings,tone,batch,smooth=True)

def ellipsoid(name,center,radii,tone):
    cx,cy,cz=center;rx,ry,rz=radii
    rings=[]
    for lat in [-1.52,-.80,0,.80,1.52]:
        rings.append([(cx+rx*cos(lat)*cos(i*pi/5),cy+ry*cos(lat)*sin(i*pi/5),
                       cz+rz*sin(lat)) for i in range(10)])
    return strip(name,rings,tone,FRAME,smooth=True)

def glasses(kind, x,y,z, angle=0, tilt=0, variant=0):
    global placement,prefix
    placement=(Matrix.Translation((x,y,z))@Matrix.Rotation(radians(angle),4,'Z')
               @Matrix.Rotation(radians(tilt),4,'X'))
    prefix=['원형 금속테','윗선이 평평한 금속테','뿔테','무테 선글라스'][kind]+' · '
    metal=['a78663','9a9997','ae946a'][variant%3]
    acetate=['221d1c','59392c','322624'][variant%3]
    rimtone=acetate if kind==2 else metal
    w=[.023,.025,.0255,.027][kind]; h=[.0218,.0207,.022,.019][kind]
    spacing=w+.010
    for side in [-1,1]:
        contour=[]
        for i in range(36):
            t=2*pi*i/36
            a,b=cos(t),sin(t)
            if kind==1:
                b=min(.81,b)*1.10
                a=(1 if a>=0 else -1)*abs(a)**.84
            elif kind==2:
                a*=1+.105*b
                b=.94*b+.045*a
            elif kind==3:
                a=(1 if a>=0 else -1)*abs(a)**.60
                b=(1 if b>=0 else -1)*abs(b)**.61
            contour.append((side*spacing+w*a,.005*(side*a+1)**2/4,h*b))
        if kind!=3:
            rings=[]
            for i,(px,py,pz) in enumerate(contour):
                a,b=cos(2*pi*i/36),sin(2*pi*i/36)
                thickness=(.0026+.0013*max(0,b)) if kind==2 else .00125
                # Rounded six-sided rim section with a thicker acetate brow.
                rings.append([(px+a*thickness*cos(j*pi/3),py+.001*sin(j*pi/3)*(2.4 if kind==2 else 1.2),
                               pz+b*thickness*cos(j*pi/3)) for j in range(6)])
            strip('렌즈 홈을 두른 림',rings,rimtone,FRAME,closed=True,smooth=True)
        lens=[(a,b+.0008,c) for a,b,c in contour]
        make('곡면 렌즈',[(side*spacing,-.0015,0)]+lens,
             [(0,i+1,(i+1)%len(lens)+1) for i in range(len(lens))],
             ['555b4a','715141','514d5b'][variant%3] if kind==3 else 'glass',
             FRAME if kind==3 else GLASS)
        end=side*(spacing+w-.0005)
        height=[.003,.004,.012,.003][kind]
        tube('경첩을 감싼 엔드피스',[(end,.004,height),(end+side*.005,.006,height+.001),
             (end+side*.008,.012,height)], [.0028,.0033,.0024],rimtone)
        end+=side*.008
        tube('경첩 핀',[(end,.014,height-.0027),(end,.014,height+.0027)],.0015,metal)
        path=[(end,.011,height),(end+side*.002,.028,height),
              (end+side*.003,.078,height-.001),(end,.106,height-.003)]
        tube('열린 다리',path,[.0023,.0027 if kind==2 else .0016,.002,.002],rimtone)
        tube('굽힌 귀팁',[path[-1],(end-side*.002,.118,height-.007),
             (end-side*.005,.131,height-.015),(end-side*.008,.140,height-.018)],
             [.002,.0033 if kind==2 else .002,.003,.0014],acetate if kind in [2,3] else metal)
        pad=side*.011
        tube('패드 암',[(side*.014,.002,-.006),(pad,.006,-.006),(pad,.010,-.004)],.0011,metal)
        ellipsoid('코받침',(pad,.011,-.005),(.0021,.0038,.006),metal if kind!=3 else 'b9997f')
        if kind==3:
            for screw_x in [side*(spacing-w+.002),end-side*.009]:
                ellipsoid('렌즈 고정 나사',(screw_x,.0005,.004),(.0013,.0015,.0013),metal)
        if kind==2:
            ellipsoid('앞면 리벳',(end-side*.003,.003,height),(.002,.0009,.001),metal)
    h0=.010 if kind==2 else .002
    tube('브리지',[(-.011,.001,h0),(-.007,-.0002,h0+.004),(0,-.001,h0+.006),
         (.007,-.0002,h0+.004),(.011,.001,h0)],.0035 if kind==2 else .0016,rimtone)
    prefix='';placement=Matrix.Identity(4)

def word(text,x,y,z,size):
    font=bpy.data.curves.new('상호','FONT')
    font.body=text;font.align_x='CENTER';font.size=size;font.space_character=1.22
    font.extrude=.002;font.resolution_u=3
    ob=bpy.data.objects.new('상호',font);gallery.objects.link(ob)
    ob.location=(x,y,z);ob.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    label=bpy.data.objects.new(text,mesh);gallery.objects.link(label);label.matrix_world=ob.matrix_world.copy()
    mesh.materials.append(material('칠흑 글자',color('231b17'),.45));batches[CASE].append(label)
    bpy.data.objects.remove(ob,do_unlink=True)

# Front elevation. Two orange lined cases flank the fine central stanchion,
# with a taller mirror and lighted open shelves on the sides.
for i in range(8):
    panel('세로 무늬목 벽판',-3.5+i,.145,.035,.994,.09,2.93)
for x in [-3.97,-2.76,-1.22,0,1.22,2.77,3.97]:
    panel('금속 세로 몰딩',x,.085,.06,.018,.03,2.87,'aa916f')
word('COLLECT',0,.078,2.49,.255)
for n,x in enumerate([-.61,.61,-3.35,3.35]):
    for z,h in [(.43,.40),(.89,1.29)]:
        panel('주황 가죽 뒷판' if n<2 else '벽장 뒷판',x,.065,z,1.197,.045,h,'d88952' if n<2 else 'oak')
    for j,z in enumerate([.86,1.35,1.81]):
        panel('진열 선반',x,-.097,z,1.18,.39,.032)
        panel('선반 안감',x,-.10,z+.032,1.15,.36,.008,'e6ba8f')
        panel('하부 조명 띠',x,-.24,z-.012,1.12,.014,.013,'fff1cd')
        panel('유리 선반 턱',x,-.283,z+.032,1.17,.005,.041,'glass')
        for k in range(3):
            glasses((k+j+n)%3,x+(k-1)*.32,-.201,z+.068,angle=[-8,0,9][k],variant=(k+n)%3)

for x in [-1.97,1.98]:
    panel('거울 받침 세로',x,.02,.6,.69,.12,1.68)
    panel('황동 피팅 거울 테두리',x,-.05,.70,.50,.05,1.42,'ad9166')
    panel('피팅 거울 은면',x,-.081,.713,.48,.011,1.391,'998f83')
    panel('피팅 선반',x,-.23,.86,1.15,.60,.055)
    for side in [-1,1]:
        panel('선반 지주',x+side*.50,-.21,.04,.038,.043,.82,'aa8b66')

# Photo's freestanding drawer cabinet, edged in stacked nickel lines. The
# lid of the six-compartment oxblood case is upright at the left end.
cx=-.62; cy=-1.26
for side in [-1,1]:
    for depth in [-1,1]:
        panel('쇼케이스 다리',cx+side*1.075,cy+depth*.295,0,.055,.055,.29,'a48d76')
for j in range(3):
    z=.25+j*.20
    panel('서랍 몸통',cx,cy,z,2.28,.73,.19)
    panel('서랍 은색 테',cx,cy,z+.171,2.286,.737,.013,'b8afa2')
    for side in [-1,1]:
        x=cx+side*.58
        panel('서랍 손잡이',x,cy-.386,z+.103,.165,.027,.010,'9a8e81')
panel('오렌지색 가죽 상판',cx,cy,.851,2.29,.74,.032,'ce8858')
for x in [cx-.03,cx+.65]:
    panel('안경 받침 트레이',x,cy,.883,.62,.54,.022,'be764c')
    panel('트레이 스웨이드',x,cy,.905,.599,.519,.005,'e4b998')
    for j in range(2):
        for k in range(2):
            glasses((k+j+(x>cx))%3,x+(k-.5)*.24,cy+(j-.5)*.21-.051,.936,angle=8-14*k,variant=k+j)
# Glass hood only on the right portion of the counter.
for x in [cx-.355,cx+.99]:
    panel('쇼케이스 측면 유리',x,cy,.887,.007,.641,.207,'glass')
panel('쇼케이스 덮개 유리',cx+.318,cy,1.094,1.35,.641,.007,'glass')
panel('유리 연마 단면',cx+.318,cy-.32,1.094,1.35,.006,.006,'729697')
bx=cx-.747; by=cy
panel('자주색 안경함',bx,by,.883,.57,.377,.060,'783738')
panel('안경함 스웨이드',bx,by,.943,.549,.355,.014,'efdfc7')
for side in [-1,1]:
    panel('안경함 가장자리',bx+side*.279,by,.943,.011,.37,.041,'783738')
    panel('안경함 가장자리',bx,by+side*.18,.943,.56,.009,.041,'783738')
panel('뚜껑 가죽',bx,by+.19,.945,.57,.024,.32,'713233')
panel('뚜껑 안쪽 거울',bx,by+.175,.966,.538,.006,.275,'ba9d87')
for dx in [-.09,.09]:panel('칸막이',bx+dx,by,.956,.007,.35,.026,'f6e9d7')
panel('칸막이',bx,by,.956,.55,.006,.026,'f6e9d7')
for j in range(2):
    for k in range(3):
        glasses(3,bx+(k-1)*.18,by+(j-.5)*.17-.055,.979,angle=0,variant=k+j)
for sx in [-1,1]:
    tube('상자 경첩 버팀쇠',[(bx+sx*.273,by+.045,.977),(bx+sx*.273,by+.167,1.084)],.0024,'bca16a',CASE)

# Bake the visible panel lighting and the reflected showroom into a single UV
# atlas. Rays for the mirrors use the actual editable counter and eyewear.
def bake_surfaces():
    from mathutils.bvhtree import BVHTree
    import math
    bpy.context.view_layer.update()
    points=[];polys=[];surfaces=[]
    for key in [WOOD,CASE,FRAME]:
        for obj in batches[key]:
            mesh=obj.data
            off=len(points)
            points.extend([obj.matrix_world@v.co for v in mesh.vertices])
            tone=np.array(mesh.materials[0].diffuse_color[:3])
            for poly in mesh.polygons:
                polys.append(tuple(off+i for i in poly.vertices))
                surfaces.append((tone,key))
    tree=BVHTree.FromPolygons(points,polys,all_triangles=False)
    atlas=np.zeros((512,512,4),dtype=np.float32);atlas[:,:,3]=1.
    mat=material('거울과 조명 진열장',(1,1,1,1),.34)
    img=bpy.data.images.new('진열장 조명과 거울 베이크',512,512,alpha=False)
    nodes=mat.node_tree.nodes;shader=nodes.get('Principled BSDF')
    tex=nodes.new('ShaderNodeTexImage');tex.image=img
    mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    emission=shader.inputs.get('Emission Color') or shader.inputs.get('Emission')
    mat.node_tree.links.new(tex.outputs['Color'],emission)
    shader.inputs['Emission Strength'].default_value=.42
    def surface(name,x,y,z,w,h,tile,pixels):
        ix,iy,iw,ih=tile
        # Duplicate edge pixels to prevent texture bleed through mip levels.
        atlas[iy-2:iy+ih+2,ix-2:ix+iw+2,:3]=np.pad(pixels,((2,2),(2,2),(0,0)),mode='edge')
        mesh=bpy.data.meshes.new(name)
        mesh.from_pydata([(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],[],[(0,1,2,3)])
        mesh.update()
        uv=mesh.uv_layers.new(name='베이크')
        for v,(s,t) in zip(uv.data,[(0,0),(1,0),(1,1),(0,1)]):
            v.uv=((ix+.5+s*(iw-1))/512,(iy+.5+t*(ih-1))/512)
        ob=bpy.data.objects.new(name,mesh);gallery.objects.link(ob);mesh.materials.append(mat)
        batches.setdefault('CollectGangnamFinish',[]).append(ob)
    def mirror(name,x,y,z,w,h,eye,tile):
        _,_,iw,ih=tile
        pixels=np.zeros((ih,iw,3))
        for j in range(ih):
            for i in range(iw):
                p=Vector((x+w*((i+.5)/iw-.5),y,z+h*(j+.5)/ih))
                d=(p-Vector(eye)).normalized();d.y=-d.y
                hit,normal,index,_=tree.ray_cast(p+d*.004,d,12)
                if hit is not None:
                    rgb,key=surfaces[index]
                    light=.62+.34*abs(normal.z)+.10*abs(normal.y)
                    grain=1+.05*sin(hit.z*226+2*sin(hit.x*9)) if key==WOOD else 1
                    rgb=np.power(np.maximum(.002,rgb*light*grain),1/2.2)
                else:
                    # Soft surroundings beyond the modelled fixtures. A warm
                    # timber floor, rear wall and ceiling complete the reflection.
                    dist=(-4.4-y)/min(d.y,-.001)
                    bx,_,bz=p+d*dist
                    if bz<0:
                        fx,fy,_=p+d*(-p.z/d.z)
                        rgb=np.array([.74,.59,.43])*(.88+.10*(int((fy+.08*fx)*4)%2)+.022*sin(fx*70))
                    elif bz>2.9:
                        rgb=np.array([.79,.68,.55])*(.87+.10*(int(bx*4)%2))
                    else:
                        rgb=np.array([.76,.62,.48])*(.95+.032*sin(bx*110+sin(bz*9)))
                        if abs((bx+.2)%1.28-.64)<.017:rgb*=.75
                pixels[j,i]=np.clip(rgb*.91+.035,0,1)
        surface(name,x,y,z,w,h,tile,pixels)
    mirror('왼쪽 피팅 거울',-1.97,-.092,.713,.478,1.39,(-2.48,-1.80,1.48),(4,4,90,244))
    mirror('오른쪽 피팅 거울',1.98,-.092,.713,.478,1.39,(2.62,-1.75,1.48),(100,4,90,244))
    mirror('안경함 내부 거울',bx,by+.168,.966,.538,.275,(bx+.10,by-.55,1.41),(196,4,212,110))
    # Horizontal light at each shelf washes the orange lining. The feathered
    # edge and shadow along the two stanchions are baked in display space.
    ih,iw=190,154
    b,a=np.mgrid[0:ih,0:iw]/np.array([ih-1,iw-1])[:,None,None]
    for k,xx in enumerate([-.61,.61,-3.35,3.35]):
        shade=1-.20*np.exp(-np.minimum(a,1-a)*16)
        wallz=.89+b*1.29
        light=np.zeros_like(b)
        for level in [.86,1.35,1.81,2.18]:
            light+=np.where(wallz<level,np.exp(-np.maximum(0,level-wallz)*10),0)
        base=np.array([.85,.51,.30]) if k<2 else np.array([.79,.65,.48])
        rgb=base[None,None,:]*shade[:,:,None]*(.94+.18*light[:,:,None])
        rgb+=light[:,:,None]*np.array([.14,.18,.20])
        if k>=2:rgb*=1+.02*np.cos(2*pi*(b*27+.3*np.sin(2*pi*a)))[:,:,None]
        tile=(4+160*(k%3),262 if k<3 else 4,iw,ih)
        if k==3: # Oak wall faces use the same sampled lighting.
            tile=(324,262,iw,ih)
        surface('선반 조명이 비친 안감',xx,.040,.89,1.18,1.29,tile,np.clip(rgb,0,1))
    img.pixels.foreach_set(atlas.ravel())
    with tempfile.TemporaryDirectory() as tmp:
        img.filepath_raw=str(Path(tmp)/'cabinet.png');img.file_format='PNG';img.save();img.pack()

bake_surfaces()

bpy.context.preferences.filepaths.save_version=0
print('COLLECT editable pieces:',sum(map(len,batches.values())))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Native materials remain independently editable. Runtime pigments share one
# vertex-colour material per finish family; glass and oak retain their UV/PBR.
for batch,objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    if batch in [CASE,FRAME]:
        mat=material(batch,(1,1,1,1),.24 if batch==FRAME else .49,.36 if batch==FRAME else .08)
        tree=mat.node_tree
        vcol=tree.nodes.new('ShaderNodeVertexColor');vcol.layer_name='Finish'
        tree.links.new(vcol.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
    for ob in objects:
        if batch in [CASE,FRAME]:
            mesh=ob.data;rgba=mesh.materials[0].diffuse_color[:]
            attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for v in attr.data:v.color=rgba
            mesh.materials.clear();mesh.materials.append(mat)
        ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
