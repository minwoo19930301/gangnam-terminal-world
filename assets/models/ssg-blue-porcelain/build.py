"""Gangnam porcelain boutique. Metres, +Y toward cabinetry, +Z up."""
from pathlib import Path
from math import cos, sin, pi, radians
import random
import bpy
from mathutils import Vector, Matrix

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
gallery = bpy.data.collections.new('SSG_9F_RoyalCopenhagen')
scene.collection.children.link(gallery)
scene.unit_settings.system = 'METRIC'
atlas = bpy.data.images.load(str(out/'paint.png'))
atlas.pack()
rng = random.Random(1775)
batches = {}
def material(name, rough, metal=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    tree = m.node_tree
    p = tree.nodes.get('Principled BSDF')
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    tex = tree.nodes.new('ShaderNodeTexImage')
    tex.image = atlas
    tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
    batches[m]=[]
    return m

glaze=material('RoyalPrincessPorcelain',.21)
timber=material('RoyalOakCabinetry',.48)
metal=material('RoyalBrassDetails',.31,.55)
def swatch(index):
    return ((532+40*index)/1024,1-630/1024)

def piece(name, vertices, faces, mat, uv, smooth=False):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    gallery.objects.link(obj)
    mesh.materials.append(mat)
    layer=mesh.uv_layers.new()
    for poly in mesh.polygons:
        poly.use_smooth=smooth
        for loop in poly.loop_indices:
            i=mesh.loops[loop].vertex_index
            layer.data[loop].uv=uv(i,poly)
    batches[mat].append(obj)
    return obj

def box(name,x,y,z,w,d,h,color=None,mat=timber):
    verts=[(a*w/2,b*d/2,c*h/2) for c in [-1,1] for b in [-1,1] for a in [-1,1]]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    def uv(i,poly):
        if color is not None: return swatch(color)
        # Run the grain along the longest board axis on each face.
        axes=sorted(range(3),key=lambda a:abs(poly.normal[a]))[:2]
        axes.sort(key=lambda a:[w,d,h][a],reverse=True)
        return tuple(.005+(.48 if verts[i][axis]>0 else 0) for axis in axes)
    o=piece(name,verts,faces,mat,uv)
    o.location=(x,y,z)
    return o

def lathe(name,pos,profile,radius,height,*,paint='lace',tilt=0,n=40,flute=.009):
    # Profile samples (relative radius, relative height, print radius).
    verts=[]; uvs=[]; faces=[]
    for rr,zz,ink in profile:
        for j in range(n):
            a=j*2*pi/n
            r=rr*radius*(1+flute*cos(a*min(16,n//3)))
            verts.append((r*cos(a),r*sin(a),zz*height))
            if paint=='fluted':
                uvs.append(((596+.67*(256+253*ink*cos(a)))/1024,1-(665+.67*(256-253*ink*sin(a)))/1024))
            elif isinstance(paint,int): uvs.append(swatch(paint))
            else:
                ox=.75 if paint=='jubilee' else .25
                uvs.append((ox+.248*ink*cos(a),.75+.248*ink*sin(a)))
    for i in range(len(profile)-1):
        for j in range(n):
            k=(j+1)%n
            faces.append((i*n+j,i*n+k,(i+1)*n+k,(i+1)*n+j))
    faces.extend([tuple(reversed(range(n))),tuple(range((len(profile)-1)*n,len(profile)*n))])
    o=piece(name,verts,faces,glaze,lambda i,p:uvs[i],True)
    o.location=pos
    o.rotation_euler.x=radians(tilt)
    return o

plate_profile=[(.43,0,.12),(.46,0,.13),(.48,.12,.16),(.74,.37,.55),(.99,.86,.98),(1,.98,1),(.98,1,.98),(.78,.56,.77),(.59,.34,.59),(.16,.32,.16)]
def plate(x,y,z,r,tilt=0,ann=False,n=40):
    return lathe('블루 플루티드 250주년 접시' if ann=='fluted' else '250주년 기념 접시' if ann else '프린세스 접시',(x,y,z),plate_profile,r,r*.18,paint='fluted' if ann=='fluted' else 'jubilee' if ann else 'lace',tilt=tilt,n=n,flute=0 if ann else .006)

def tube(name,coords,radii,color,mat=glaze,sides=10,open_tip=False):
    # Sweep rings normal to the spine, retaining the join and the hollow spout.
    coords=[Vector(p) for p in coords]
    verts=[]; faces=[]
    for i,(p,r) in enumerate(zip(coords,radii)):
        t=(coords[min(i+1,len(coords)-1)]-coords[max(0,i-1)]).normalized()
        ref=Vector((0,1,0)) if abs(t.y)<.9 else Vector((1,0,0))
        a=t.cross(ref).normalized(); b=t.cross(a).normalized()
        for j in range(sides):
            ang=2*pi*j/sides
            verts.append(p+r*(a*cos(ang)+b*sin(ang)))
    for i in range(len(coords)-1):
        for j in range(sides):
            k=(j+1)%sides
            faces.append((i*sides+j,i*sides+k,(i+1)*sides+k,(i+1)*sides+j))
    faces.append(tuple(reversed(range(sides))))
    if not open_tip: faces.append(tuple(range(len(verts)-sides,len(verts))))
    return piece(name,verts,faces,mat,lambda i,p:swatch(color),True)

def arc_handle(x,y,z,r,h,side=1):
    pts=[(.82,.67),(1.04,.91),(1.26,1.09),(1.44,1.12),(1.56,.98),(1.54,.79),(1.39,.58),(1.13,.39),(.76,.24)]
    tube('높이 솟은 고리 손잡이',[(x+side*a*r,y,z+b*h) for a,b in pts],
         [r*a for a in [.12,.1,.095,.12,.12,.1,.086,.08,.10]],0)

def cup(x,y,z,side=1):
    r=.051; h=.084
    plate(x,y,z,.078,n=32)
    z+=.008
    lathe('프린세스 하이핸들 찻잔',(x,y,z),[(.47,0,.35),(.56,.04,.4),(.74,.23,.45),(.92,.64,.58),(1,.97,.97),(.98,1,.99),(.94,.96,.92),(.84,.5,.45),(.5,.12,.2)],r,h)
    arc_handle(x,y,z,r,h,side)

def bowl(x,y,z,r):
    lathe('프린세스 한식 공기',(x,y,z),[(.38,0,.3),(.47,.06,.3),(.62,.2,.4),(.88,.62,.58),(1,.98,.97),(.97,1,.99),(.89,.72,.77),(.62,.34,.58),(.22,.2,.22)],r,r*.85,n=32)

def teapot(x,y,z,s=1):
    r=.091*s; h=.137*s
    lathe('프린세스 티포트 몸체',(x,y,z),[(.5,0,.25),(.65,.04,.3),(.85,.22,.36),(.98,.55,.55),(1,.69,.63),(.93,.84,.83),(.72,.97,.97),(.57,1,.97)],r,h,n=64)
    lathe('티포트 뚜껑',(x,y,z+h),[(.57,0,.97),(.62,.08,.99),(.56,.29,.89),(.34,.64,.64),(.11,.81,.35)],r,h*.22)
    lathe('코발트 소라 꼭지',(x,y,z+1.16*h),[(.62,0,.3),(1,.27,.4),(.83,.75,.5),(.34,1,.4)],r*.155,h*.105,paint=1,n=20)
    arc_handle(x,y,z,r*1.05,h)
    spine=[(-.71,.3,.32),(-.98,.44,.29),(-1.15,.68,.22),(-1.27,.9,.16),(-1.43,1.06,.14),(-1.57,1.13,.16)]
    coords=[(x+a*r,y,z+b*h) for a,b,c in spine]
    tube('차 주둥이',coords,[c*r for a,b,c in spine],0,open_tip=True)
    tube('주구 안쪽',[coords[-1],coords[-2]],[r*.14,r*.08],7)

def stand(x,y,z,r,ann=False):
    for side in [-1,1]:
        a=x+side*r*.53
        tube('접시 받침 황동선',[(a,y-.057,z+.01),(a,y-.06,z+.035),(a,y-.025,z+.01),(a,y+.05,z+.01),(a,y+.045,z+r*1.12)], [.003]*5,2,metal,6)
    plate(x,y,z+r*.97,r,75,ann)

# Freestanding drawer table from the foreground of the branch photograph.
box('전시대 참나무 상판',0,0,.861,2.46,.92,.058)
box('밝은 상판 인레이',0,0,.893,2.39,.86,.009,0)
for x in [-1.14,0,1.14]:
    for y in [-.395,.395]:
        box('전시대 다리',x,y,.425,.049,.049,.85)
for y in [-.39,.39]:
    box('하부 가로대',0,y,.17,2.3,.038,.045)
    for x in [-.572,.572]:
        box('서랍 앞판',x,y,.648,1.083,.03,.345,0)
for x in [-1.14,1.14]:
    box('서랍 옆판',x,0,.65,.03,.75,.34,0)
    box('측면 가로대',x,0,.17,.04,.79,.04)
# Three bays, with a raised maker's mark over the central display.
box('후면 진열장',0,2.23,1.34,4.56,.085,2.68)
box('걸레받이',0,2.03,.089,4.46,.43,.178,6)
box('하부 수납장',0,2.05,.33,4.54,.47,.46)
for i in range(6):
    x=(i-2.5)*.746
    box('수납장 문',x,1.805,.335,.729,.025,.405)
    box('황동 손잡이',x,1.785,.49,.16,.017,.013,2,metal)
for x in [-2.245,-.74,.74,2.245]:
    box('선반 기둥',x,2.02,1.61,.048,.49,2.14)
for h in [.57,1.12,1.65,2.18,2.67]:
    box('전시 선반',0,2.025,h,4.56,.49,.042)
    box('밝은 선반 가장자리',0,1.797,h-.012,4.49,.012,.011,5)
for row,h in enumerate([.591,1.141,1.671,2.201]):
    for i,x in enumerate([-1.91,-1.44,-.99,.99,1.44,1.91]):
        radius=[.128,.108,.14][(i+row)%3]
        if (i+row)%4==1: bowl(x,1.98,h,radius)
        else: stand(x,2.04,h,radius,'fluted' if (i+row)%3==0 else False)
    if row<3:
        if row==0: teapot(-.18,2.01,h); bowl(.22,2,h,.092)
        elif row==1: stand(0,2.02,h,.096,True)
        else: cup(-.24,1.98,h); cup(.22,1.98,h,-1)
# Freestanding plate column to the left of the table.
box('접시를 건 아이보리 기둥',-2.33,.66,1.41,.77,.58,2.82,0)
for row in range(4):
    for col in range(3):
        r=[.10,.087,.106][(col+row)%3]
        plate(-2.33+(col-1)*.242,.355,1.02+row*.265+col*.019,r,90,'fluted' if (col+row)%3!=1 else False,40)
for row in range(4):
    obj=plate(-1.938,.62,1.1+.275*row,.107,90)
    obj.rotation_euler.z=radians(90)

def lettering(name,body,x,y,z,size,color=5):
    data=bpy.data.curves.new(name,'FONT')
    data.body=body
    data.align_x='CENTER'
    data.size=size
    data.space_character=1.15
    obj=bpy.data.objects.new(name,data)
    gallery.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    obj.data.materials.append(timber)
    layer=obj.data.uv_layers.active or obj.data.uv_layers.new()
    for loop in layer.data:loop.uv=swatch(color)
    batches[timber].append(obj)

lettering('제조사 서명','ROYAL COPENHAGEN',0,2.16,2.395,.118)
# Arching crown and three wave lines above and beneath the signature.
def badge(x,y,z,s):
    for a in [-.64,-.28,.28,.64]:
        pts=[(x+s*(a*(1-i/8)+.42*sin(pi*i/8)*(1 if a>0 else -1)),y,z+s*(.12+.49*sin(pi*i/8)+.46*i/8)) for i in range(9)]
        tube('왕관 아치',pts,[s*.033]*9,2,metal,6)
    for row in range(3):
        pts=[(x+s*(-.65+1.3*i/16),y,z+s*(-.16-.12*row+.05*sin(i*pi/4))) for i in range(17)]
        tube('세 물결',pts,[s*.032]*17,1,glaze,6)
    box('왕관 띠',x,y,z+s*.09,s*1.3,.012,s*.09,2,metal)
    box('왕관 십자',x,y,z+s*.74,s*.055,.014,s*.32,2,metal)
    box('십자 가로대',x,y,z+s*.78,s*.21,.014,s*.055,2,metal)
# Raised date inside the case, just above the lid-mounted plate.
lettering('기념 연도','1775  –  2025',-.73,.183,1.156,.020)
badge(-2.33,.353,2.42,.21)
badge(0,2.159,2.565,.118)
# Tabletop. The giveaway SKU was not specified; the catalogue 18cm edition
# is displayed inside an upright presentation case.
box('기념 접시 케이스',-.73,.115,.921,.36,.25,.045,1)
box('기념 접시 케이스 뚜껑',-.73,.215,1.058,.36,.03,.28,1)
box('케이스 안감',-.73,.193,1.058,.335,.014,.25,9)
stand(-.73,.125,.945,.09,True)
teapot(.45,-.08,.899)
cup(.77,-.21,.899);cup(.53,.217,.899,-1)
for i in range(3):plate(.968,.13,.899+.011*i,.124)
for x,y,r in [(-1.03,-.16,.095),(-.78,-.22,.073),(-.5,-.17,.09)]:bowl(x,y,.899,r)
for i in range(3):plate(-.27,-.23,.899+i*.008,.105)
stand(.12,.22,.899,.135,'fluted')
# Small white bouquet in the shop photograph, kept low enough to see the plate.
lathe('꽃병',(-.19,.13,.899),[(.59,0,.1),(.86,.08,.25),(1,.3,.3),(.93,.65,.4),(.52,.93,.6),(.55,1,.55)],.071,.154,paint=0,n=28)
for i in range(23):
    a=i*2.4; r=.132*(i/23)**.5
    x=-.19+r*cos(a); y=.13+r*sin(a); z=1.25+rng.uniform(-.045,.05)
    tube('꽃줄기',[(-.19,.13,1.025),(x,y,z)], [.003,.002],3,sides=5)
    # Individual folded leaves, only a few facets per petal.
    for k in range(4):
        t=a+k*1.57
        cx=x+.012*cos(t);cy=y+.012*sin(t)
        verts=[(cx,cy,z),(cx+.014,cy+.007,z+.011),(cx+.018,cy,z+.022),(cx,cy-.013,z+.018),(cx-.012,cy,z+.012)]
        piece('흰 꽃잎',verts,[(0,1,2),(0,2,3),(0,3,4),(2,1,0),(3,2,0),(4,3,0)],timber,lambda i,p:swatch(5))
    dx=.048*cos(a);dy=.048*sin(a)
    piece('잎맥이 접힌 잎',[(x,y,z-.065),(x+dx*.5-dy*.34,y+dy*.5+dx*.34,z-.05),(x+dx,y+dy,z-.033),(x+dx*.5+dy*.34,y+dy*.5-dx*.34,z-.053),(x+dx*.5,y+dy*.5,z-.044)],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],timber,lambda i,p:swatch(4))
# Save the independent native pieces before runtime batching.
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='DESELECT')
print('Editable meshes:',len(gallery.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(out/'display.blend'),compress=True)
for mat,objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    obj=bpy.context.object
    obj.name=mat.name
bpy.ops.export_scene.gltf(filepath=str(out/'display.glb'),export_format='GLB',export_yup=True,export_animations=False)
