"""Berwick Gangnam. Metres, local -Y faces the customer."""
from pathlib import Path
from math import pi, sin, cos, radians, exp
import bpy
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_6F_Berwick')
bpy.context.scene.collection.children.link(gallery)
groups = {}
batch = 'BerwickCabinetry'
basis = Matrix.Identity(4)
materials = {}
serif_path=Path('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
serif=bpy.data.fonts.load(str(serif_path)) if serif_path.exists() else None

def rgba(hexcode):
    def convert(offset):
        c = int(hexcode[offset:offset+2],16)/255
        return c/12.92 if c < .04045 else ((c+.055)/1.055)**2.4
    return (*[convert(i) for i in (0,2,4)],1)

def part(name, vertices, faces, color, smooth=False):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    gallery.objects.link(obj)
    obj.matrix_world=basis.copy()
    if (batch,color) not in materials:
        mat=bpy.data.materials.new(name+' '+color)
        mat.diffuse_color=rgba(color)
        mat.use_nodes=True
        bs=mat.node_tree.nodes.get('Principled BSDF')
        bs.inputs['Base Color'].default_value=mat.diffuse_color
        bs.inputs['Roughness'].default_value=roughness()
        materials[batch,color]=mat
    mesh.materials.append(materials[batch,color])
    for face in mesh.polygons: face.use_smooth=smooth
    groups.setdefault(batch,[]).append(obj)
    return obj

def roughness():
    return {'BerwickGoodyearCalf':.22,'BerwickFittings':.36}.get(batch,.68)

def loft(name,rings,color,smooth=False,closed=True,caps=True):
    n=len(rings[0]); fs=[]
    for r in range(len(rings)-1):
        for i in range(n if closed else n-1):
            a=r*n+i;b=r*n+(i+1)%n
            fs.append((a,b,b+n,a+n))
    if caps:
        fs.extend([tuple(reversed(range(n))),tuple(range(n*(len(rings)-1),n*len(rings)))])
    return part(name,[v for ring in rings for v in ring],fs,color,smooth)

def place(x,y,z,angle=0,tilt=0):
    return Matrix.Translation((x,y,z)) @ Matrix.Rotation(radians(angle),4,'Z') @ Matrix.Rotation(radians(tilt),4,'X')

def slab(name,x,y,z,w,d,h,r,col,bevel=0):
    def ring(inset,level):
        pts=[]
        for dx,dy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
            for j in range(5):
                a=radians(start+j*22.5)
                pts.append((x+dx*(w/2-r)+(r-inset)*cos(a),y+dy*(d/2-r)+(r-inset)*sin(a),z+level))
        return pts
    levels=[(bevel,0),(0,bevel),(0,h-bevel),(bevel,h)] if bevel else [(0,0),(0,h)]
    return loft(name,[ring(i,l) for i,l in levels],col)

def tube(name,path,r,color,n=6):
    rings=[]
    for i,p in enumerate(path):
        tangent=(Vector(path[min(i+1,len(path)-1)])-Vector(path[max(0,i-1)])).normalized()
        ref=Vector((0,0,1)) if abs(tangent.z)<.9 else Vector((0,1,0))
        a=tangent.cross(ref).normalized();b=tangent.cross(a)
        rings.append([Vector(p)+r*(a*cos(2*pi*j/n)+b*sin(2*pi*j/n)) for j in range(n)])
    return loft(name,rings,color,True)

def oval(name,x,y,z,rx,ry,h,col):
    return loft(name,[[(x+rx*cos(j*pi/12),y+ry*sin(j*pi/12),k) for j in range(24)] for k in (z,z+h)],col)

def lettering(value,x,y,z,size,color):
    curve=bpy.data.curves.new(value,'FONT')
    if serif:curve.font=serif
    curve.body=value; curve.size=size; curve.align_x='CENTER'
    curve.extrude=.0008; curve.resolution_u=5;curve.space_character=1.02
    obj=bpy.data.objects.new(value,curve);gallery.objects.link(obj)
    obj.matrix_world=basis @ Matrix.Translation((x,y,z)) @ Matrix.Rotation(pi/2,4,'X')
    dg=bpy.context.evaluated_depsgraph_get(); mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    ob=part(value,[v.co[:] for v in mesh.vertices],[p.vertices[:] for p in mesh.polygons],color)
    ob.matrix_world=obj.matrix_world.copy()
    bpy.data.objects.remove(obj,do_unlink=True);bpy.data.meshes.remove(mesh)

# Each station describes distance along the last, half girth, crown height,
# and collar opening angle. The waist narrows before the heel flares.
stations=[
 (-.153,.004,.026,0),(-.148,.022,.035,0),(-.137,.038,.046,0),
 (-.116,.049,.052,0),(-.089,.054,.055,0),(-.062,.055,.062,0),
 (-.042,.053,.070,0),(-.022,.050,.081,0),(0,.047,.094,0),
 (.023,.044,.109,0),(.043,.042,.119,0),(.054,.041,.116,.30),
 (.063,.040,.109,.61),(.077,.039,.100,.78),(.096,.040,.097,.77),
 (.113,.039,.099,.66),(.130,.033,.101,.48),(.140,.022,.102,.25),(.145,.004,.096,0)]
def shape(y):
    for a,b in zip(stations,stations[1:]):
        if y<=b[0]:
            t=max(0,(y-a[0])/(b[0]-a[0]))
            return tuple(v+(w-v)*t for v,w in zip(a[1:],b[1:]))
    return stations[-1][1:]

def bottom(y):
    return .014+.013*exp(-((y+.156)/.040)**2)+.017/(1+exp(-(y-.015)/.014))

def skin(y,angle,hero=False):
    w,h,_=shape(y);base=bottom(y)
    center=.007*exp(-((y+.067)/.056)**2)
    crease=0
    if hero:
        for k in (-.054,-.045,-.034):
            dy=y-k-.006*cos(angle)
            crease-=.0018*exp(-(dy/.0025)**2)*sin(angle)**2
    return (center+w*cos(angle),y,base+(h-base)*max(0,sin(angle))**.70+crease)

def footwear(x,y,z,turn,color,hero=False,tilt=0):
    global basis,batch
    basis=place(x,y,z,turn,tilt)
    rows=sorted(set([s[0] for s in stations]+[-.060+j*.003 for j in range(12)])) if hero else [stations[j][0] for j in (0,2,3,5,7,9,10,12,14,16,18)]
    # Welt comes out beyond upper, with a slight toe spring and clear waist.
    outline=[(sign,yy) for sign in (1,-1) for yy in (rows if sign==1 else rows[::-1])]
    def band(scale,dz):
        return [(skin(v,0)[0]-shape(v)[0]+s*(shape(v)[0]+scale),v,bottom(v)+dz) for s,v in outline]
    batch='BerwickFittings'
    loft('가죽창 가장자리',[band(.004,-.011),band(.005,-.008),band(.005,-.002)],'302325')
    loft('굿이어 웰트',[band(.005,-.002),band(.0055,.001),band(.0035,.003)],'71503C')
    heel_layers=[(0,.020,'42302A')] if not hero else [(0,.005,'332626'),(.005,.005,'553B30'),(.01,.005,'674836'),(.015,.005,'46312B')]
    for lvl,thick,col in heel_layers:
        heelrows=[.067,.080,.105,.122,.135,.141]
        foot=[(s*(shape(v)[0]+.002),v) for s in (1,-1) for v in (heelrows if s==1 else heelrows[::-1])]
        loft('적층 굽', [[(a,b,k) for a,b in foot] for k in (lvl,lvl+thick)],col)
    batch='BerwickGoodyearCalf'
    # Opposing quarters leave a real opening; the interior reveals the lining and tree.
    edges=[]
    for side in [1,-1]:
        rings=[]; lip=[]
        for yy in rows:
            angle=pi/2-shape(yy)[2]
            arcs=[angle*i/(9 if hero else 5) for i in range(10 if hero else 6)]
            vals=[skin(yy,a if side==1 else pi-a,hero) for a in arcs]
            rings.append(vals[::-1] if side==1 else vals)
            if yy>=.043:lip.append(vals[-1])
        # Cross section runs right to left as seen from the toe; normals point out.
        shell=loft('로이스 카프 갑피',rings,color,True,False,False)
        attr=shell.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        base=rgba(color)
        for v,item in zip(shell.data.vertices,attr.data):
            a,b,h=v.co
            glow=.84+.48*exp(-((b+.094)/.084)**2)
            # Broad window reflection across the burnished toe and outer counter.
            streak=exp(-((a+.023+.009*sin(b*33))/.016)**2) * exp(-((b+.103)/.054)**2)
            counter=exp(-((b-.101)/.055)**2)*exp(-((a-.036)/.006)**2)
            item.color=(*[k*glow+(.030*streak+.022*counter)*max(0,min(1,(h-.025)/.019)) for k in base[:3]],1)
        edges.append(lip)
        tube('발목 가죽 바인딩',lip,.0018,'67483B')
        lip2=[(a*.93,b,h-.012) for a,b,h in lip]
        loft('송아지가죽 안감',[lip,lip2],'B3895F',False,False,False)
        # Separate facing with a curved lower corner and real open throat.
        yz=[(-.013,.80),(-.010,.48),(.006,.32),(.045,.24),(.077,.49),(.071,.70),(.050,1.39),(.001,1.38)]
        def on(v,t):
            a=t if side==1 else pi-t
            a0,yy,h=skin(v,a)
            return (a0+side*.0009,yy,h+.0013)
        patch=[on(v,t) for v,t in yz]
        part('오픈 레이싱 쿼터',patch,[tuple(range(len(patch)))],color)
        tube('쿼터 봉제선',patch[:6],.00075,'805F4F' if color!='252528' else '4C4746',5)
    batch='BerwickFittings'
    for i in range(4):
        yy=.002+i*.011
        a,b,h=skin(yy,1.31);l,_,_=skin(yy,pi-1.31)
        if hero:
            for ex in (l,a):
                oval('구멍 가장자리',ex,yy,h+.0018,.003,.003,.001,'705640')
        tube('외날 구두끈',[(l,yy,h+.002),((a+l)/2,yy+.001,shape(yy)[1]+.0038),(a,yy+.001,h+.002)],.0019,'58453B' if hero else '40332C',6 if hero else 4)
    # Recessed insole and carved heel grip above the collar.
    oval('깔창',0,.088,.069,.033,.048,.003,'B99062')
    tree=[(.059,.011,.086,.103),(.070,.020,.084,.118),(.083,.023,.083,.126),(.102,.022,.082,.123),(.119,.018,.083,.111),(.130,.007,.086,.104)]
    rings=[[(w*cos(j*pi/8),yy,(low+high)/2+(high-low)/2*sin(j*pi/8)) for j in range(16)] for yy,w,low,high in tree]
    loft('목제 슈트리 뒤축 손잡이',[ring[::-1] for ring in rings],'C3986B',True)
    if hero:
        for dx in (-.009,-.004,.006,.012):
            tube('슈트리 나뭇결',[(dx,yy,high-.001-(dx/w)**2*(high-low)*.24) for yy,w,low,high in tree[1:-1]],.00038,'9A714D',4)
        for s in (-1,1):
            for j in range(39):
                yy=-.135+j*.0069
                pts=[]
                for v in [yy,yy+.0034]:
                    c=skin(v,0)[0]-shape(v)[0]
                    pts.append((c+s*(shape(v)[0]+.0037),v,bottom(v)+.0022))
                tube('웰트 땀',pts,.00072,'AB8765',4)
    basis=Matrix.Identity(4)

# Continuous warm-lit shelves and flush lower doors from the reopening image.
def cabinets():
    global batch
    batch='BerwickCabinetry'
    slab('호박색 벽감',0,.203,.02,4.72,.12,2.83,.045,'B78F72')
    # Warm pools on the backboard below each linear light, sampled in linear RGB.
    for h in [.62,1.06,1.51,1.96]:
        levels=[(0,'CCA88A'),(.11,'EBD2B8'),(.23,'F4DDC1'),(.34,'FFE8CC'),(.44,'FFF1D8')]
        vs=[(sx,.097,h+t) for t,col in levels for sx in (-2.30,2.30)]
        ob=part('선반 뒤 간접광',vs,[(i,i+1,i+3,i+2) for i in range(0,8,2)],'EBD2B8')
        attr=ob.data.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for i,(_,col) in enumerate(levels):
            for j in [0,1]:attr.data[i*2+j].color=rgba(col)
    slab('진열장 받침',0,-.01,.035,4.55,.46,.12,.025,'695141')
    for i in range(6):
        slab('하부 수납장 문',-1.92+i*.77,-.035,.15,.761,.48,.47,.018,'C5A084')
    for h in [.62,1.06,1.51,1.96]:
        slab('연속 진열 선반',0,-.027,h,4.68,.51,.041,.021,'A88062',.004)
        slab('선반 상판',0,-.027,h+.041,4.68,.51,.011,.017,'E7CEAE')
        slab('선반 하부 조명',0,-.22,h-.009,4.57,.042,.009,.004,'FFE9BD')
    slab('둥근 상인방',0,-.01,2.29,4.72,.43,.56,.108,'B48B6F',.045)
    lettering('Berwick',0,-.229,2.52,.225,'FFF1D4')
    lettering('1707',0,-.229,2.45,.079,'FFF1D4')

cabinets()
# Two short returns retain the U-shaped display without blocking the side aisles.
for side in (-1,1):
    basis=place(side*2.32,-1.27,0,side*-90)
    slab('측면 진열장',0,.065,.12,1.95,.14,2.49,.035,'C4A184')
    slab('측면 수납장',0,-.058,.12,1.93,.38,.60,.047,'C7A588')
    for h in (.72,1.32,1.92):
        slab('측면 진열 선반',0,-.078,h,1.95,.42,.047,.026,'E1C6A8')
    basis=Matrix.Identity(4)
for row,h in enumerate([.672,1.112,1.562,2.012]):
    for i in range(6):
        tone=['432D29','252528','70432E','49312F'][(i//2+row)%4]
        footwear(-1.79+(i//2)*1.64+(i%2)*.32,-.086,h,(-33,-32,-49,-46)[(i+2*row)%4],tone)

for side in (-1,1):
    for h in (.767,1.367,1.967):
        for depth in (.74,1.74):
            footwear(side*2.17,-depth,h,side*96+20,'49312F' if depth<1 else '252528')

# Rounded upholstered exhibition blocks, raised shoe saddles, polishing tools.
batch='BerwickCabinetry'
for cx,cy,w,d,h in [(-.33,-1.58,1.42,.73,.83),(.46,-1.12,1.04,.63,1.03)]:
    slab('진열대 걸레받이',cx,cy,.014,w-.22,d-.18,.12,.077,'503C30')
    slab('진열대 가죽 몸체',cx,cy,.11,w-.12,d-.10,h-.20,.10,'9D785A',.035)
    slab('둥근 가죽 테두리',cx,cy,h-.115,w,d,.115,.12,'B88F69',.045)
    slab('진열대 윗면',cx,cy,h-.008,w-.072,d-.07,.014,.09,'D1A882')
footwear(-.71,-1.65,.838,-45,'462D2B',True)
footwear(-.48,-1.64,.838,-36,'462D2B',True)
footwear(.20,-1.10,1.041,38,'252528',True)
# Raised dark-brown sample at an angle, as in the branch presentation.
batch='BerwickFittings'
oval('받침 발',.66,-1.14,1.042,.091,.072,.012,'836447')
tube('받침 기둥',[(.66,-1.14,1.05),(.66,-1.14,1.19)],.009,'B59B69')
slab('구두 받침',.66,-1.14,1.18,.13,.18,.018,.026,'8C725B')
footwear(.66,-1.14,1.205,-42,'673D2B',True,12)
batch='BerwickFittings'
# Natural beechwood split tree shown loose, so the joint is visible.
basis=place(-.23,-1.59,.841,-72)
profiles=[(-.132,.007,.017),(-.12,.029,.031),(-.095,.042,.043),(-.056,.048,.054),(-.021,.045,.073),(.007,.038,.083),(.026,.032,.058)]
for side in (-1,1):
    rings=[]
    for yy,w,h in profiles:
        slit=.007+.005*sin(yy*18)
        rings.append([(slit+side*(w-side*slit)*cos(j*pi/18)+side*.0014,yy,.004+h*sin(j*pi/18)) for j in range(10)]+[(slit+side*.0014,yy,.004)])
    loft('너도밤나무 분할 앞꿈치',rings,'D6B996' if side==1 else 'DCC5A7',True)
for xx in (-.014,.014):
    tube('슈트리 황동 연결관',[(xx,.024,.039),(xx,.068,.042)],.005,'B39554',10)
slab('슈트리 뒤꿈치',0,.093,.006,.064,.072,.049,.022,'D2B795',.007)
slab('슈트리 손잡이 기둥',0,.102,.050,.042,.037,.032,.014,'CBAE8E',.004)
slab('슈트리 손잡이',0,.091,.077,.060,.058,.017,.012,'E0C9AC',.005)
basis=Matrix.Identity(4)
basis=place(-.13,-1.77,.839,-16)
slab('광택 솔 나무 손잡이',0,0,0,.164,.059,.018,.025,'9B6946',.005)
for i in range(16):
    for j in range(5):
        if i in (0,15) and j in (0,4):continue
        xx=(i-7.5)*.009;yy=(j-2)*.009
        tube('말털 다발',[(xx,yy,.016),(xx*1.035,yy*1.09,.041+.002*sin(i*7+j))],.0043,
             ['795638','947152','664930'][(i+j)%3],5)
basis=Matrix.Identity(4)
for i in range(2):
    cx=.075+i*.099
    oval('구두 크림 단지',cx,-1.65,.838,.041,.041,.032,'483834')
    oval('크림 띠',cx,-1.65,.85,.042,.042,.014,'C4AB7D')
    oval('단지 뚜껑',cx,-1.65,.87,.043,.043,.009,'302C2A')
slab('명패',-.19,-1.388,.838,.33,.039,.113,.012,'EADAC3')
lettering('Berwick',-.19,-1.409,.872,.064,'483A2F')

# The olive grey carpet and crossed ivory bands are visible in the shop overview.
# Repeat a small, deterministically generated heathered pile rather than tessellating it.
import numpy as np
batch='BerwickWool'
rug=part('격자 카펫',[(-2.44,-4.33,.033),(2.44,-4.33,.033),(2.44,.28,.033),(-2.44,.28,.033)],[(0,1,2,3)],'B8B29B')
uv=rug.data.uv_layers.new(name='직조')
for loop in rug.data.loops:
    x,y,_=rug.data.vertices[loop.vertex_index].co
    uv.data[loop.index].uv=(x/.98,y/.98)
N=160
yy,xx=np.mgrid[0:N,0:N]
rng=np.random.default_rng(1707)
noise=rng.normal(0,.026,(N,N))+.017*np.sin(yy*2.75+np.sin(xx*.16))+.012*np.sin(xx*.41+yy*.03)
stripe=(np.minimum(xx,N-xx)<3)|(np.minimum(yy,N-yy)<3)|((xx>31)&(xx<35))
rgb=np.where(stripe[:,:,None],np.array([.90,.86,.74]),np.array([.63,.63,.54]))+noise[:,:,None]
pixels=np.ones((N,N,4),dtype=np.float32)
pixels[:,:,:3]=np.clip(rgb,0,1)
carpet=bpy.data.images.new('버윅 격자 직조',width=N,height=N,alpha=False)
carpet.pixels.foreach_set(pixels.flatten());carpet.pack()
def carpet_texture(mat):
    tex=mat.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=carpet
    mat.node_tree.links.new(tex.outputs['Color'],mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
carpet_texture(rug.data.materials[0])

bpy.context.scene.unit_settings.system='METRIC'
bpy.context.preferences.filepaths.save_version=0
print('Editable pieces',sum(map(len,groups.values())))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Mesh normals and per-part finishes survive joining. A single PBR material
# per batch keeps polished uppers distinct from cabinetry at runtime.
for batch,objects in groups.items():
    mat=bpy.data.materials.new(batch);mat.use_nodes=True
    bs=mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Roughness'].default_value=roughness()
    vc=mat.node_tree.nodes.new('ShaderNodeVertexColor');vc.layer_name='Finish'
    mat.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color'])
    if batch=='BerwickWool':carpet_texture(mat)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        mesh=ob.data
        if not mesh.color_attributes.get('Finish'):
            attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
            for item in attr.data:item.color=mesh.materials[0].diffuse_color
        mesh.materials.clear();mesh.materials.append(mat);ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join();bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
