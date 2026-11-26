"""Author TWL's public display in metres. X right, Y toward cabinet, Z up."""
from pathlib import Path
from math import sin, cos, pi, sqrt
from mathutils import Vector
import bpy
import runpy
import numpy as np

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_9F_TWL')
bpy.context.scene.collection.children.link(gallery)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0

def material(name, hexcode, finish, roughness, metallic=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    rgb = tuple(int(hexcode[i:i+2], 16)/255 for i in (0,2,4))
    rgba = tuple(((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb)+(1,)
    m.diffuse_color = rgba
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = rgba
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    m['finish'] = finish
    return m

oak = material('꿀빛 참나무','B57A4B','Oak',.48)
edge = material('목재 단면','97603E','Oak',.48)
cream = material('미색 진열면','EEE4CE','Timber',.48)
ink = material('먹빛 도기','353937','Stoneware',.38)
clay = material('노출된 굽','BA906C','Stoneware',.38)
white = material('분백 유약','E9E5D5','Glaze',.20)
leaf = material('연두 유약','B0BD8C','Glaze',.20)
blue = material('청자 유약','80A8A0','Glaze',.20)
red = material('주칠','98432F','Glaze',.20)
dark = material('흑칠','48352E','Glaze',.20)
gold = material('황동','C4A15C','Metal',.31,.63)
silver = material('스테인리스','BCC5C5','Metal',.31,.63)

def mesh(name, vertices, faces, mat, smooth=False):
    data=bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.materials.append(mat)
    for p in data.polygons:p.use_smooth=smooth
    o=bpy.data.objects.new(name,data)
    gallery.objects.link(o)
    return o

def block(name,x,y,z,w,d,h,mat):
    pts=[(x+a*w/2,y+b*d/2,z+c*h) for c in (0,1) for a,b in ((-1,-1),(1,-1),(1,1),(-1,1))]
    return mesh(name,pts,[(3,2,1,0),(4,5,6,7)]+[(i,(i+1)%4,(i+1)%4+4,i+4) for i in range(4)],mat)

def rings(name,rows,mat,closed=False):
    n=len(rows[0])
    faces=[(k*n+i,k*n+(i+1)%n,(k+1)*n+(i+1)%n,(k+1)*n+i)
           for k in range(len(rows)-1) for i in range(n)]
    if closed:faces.extend([tuple(reversed(range(n))),tuple(range((len(rows)-1)*n,len(rows)*n))])
    return mesh(name,[p for row in rows for p in row],faces,mat,True)

def turn(name,x,y,z,profile,mat,flutes=0,amp=.0,sy=1):
    n=flutes*5 if flutes else 32
    rows=[]
    for r,h in profile:
        row=[]
        for j in range(n):
            a=2*pi*j/n
            radius=max(.00015,r)*(1+amp*cos(flutes*a))
            row.append((x+radius*cos(a),y+sy*radius*sin(a),z+h*(1+.045*cos(flutes*a) if flutes else 1)))
        rows.append(row)
    return rings(name,rows,mat,True)

def tube(name,points,radii,mat,n=10,hollow=False):
    # Moving circular sections, including the inner return of an open spout.
    rows=[]
    for i,pt in enumerate(points):
        tangent=(Vector(points[min(i+1,len(points)-1)])-Vector(points[max(i-1,0)])).normalized()
        axis=Vector((0,1,0)) if abs(tangent.y)<.9 else Vector((1,0,0))
        a=tangent.cross(axis).normalized()
        b=tangent.cross(a).normalized()
        rows.append([Vector(pt)+radii[i]*(a*cos(j*2*pi/n)+b*sin(j*2*pi/n)) for j in range(n)])
    if hollow:
        for row,pt in reversed(list(zip(rows[-3:],points[-3:]))):
            rows.append([Vector(pt)+(v-Vector(pt))*.72 for v in row])
    return rings(name,rows,mat,True)

def bowl(name,x,y,z,r,h,mat,foot=.20,flutes=0):
    # Continuous section from recessed underside over the stem, lip and interior.
    profile=[(.18,.06),(.23,.00),(.37,.00),(.38,.055),(.31,.1),(.22,foot),
             (.25,foot+.05),(.53,foot+.12),(.77,.62),(.94,.83),(1,.98),
             (.99,1),(.955,.995),(.91,.85),(.74,.68),(.49,foot+.21),(.18,foot+.14),(.02,foot+.14)]
    turn(name,x,y,z,[(a*r,b*h) for a,b in profile],mat,flutes,.028 if flutes else 0)

def tray(x,y,z,r,m,sy=.82):
    turn('옻칠 차받침',x,y,z,[(.02*r,0),(.78*r,0),(.96*r,.011),(r,.021),(r,.026),(.94*r,.025),(.81*r,.012),(.02*r,.011)],m,sy=sy)

def pot(x,y,z,k,m,side=False):
    # Globular body, separate recessed lid rim, finger knob and cut spout.
    def lat(name,p,mat):
        turn(name,x,y,z,[(r*k,h*k) for r,h in p],mat)
    lat('다관 몸통',[(.053,0),(.077,.003),(.08,.012),(.115,.042),(.128,.075),(.129,.105),(.12,.14),(.099,.159),(.078,.17),(.073,.177),(.067,.174),(.068,.158)],m)
    lat('다관 뚜껑',[(.077,.167),(.085,.172),(.084,.177),(.071,.185),(.042,.195),(.015,.196),(.012,.201),(.018,.208),(.017,.218),(.009,.224),(.002,.225)],m)
    def pipe(name,pts,rs,hollow=False):
        tube(name,[(x+a*k,y+b*k,z+c*k) for a,b,c in pts],[a*k for a in rs],m,16,hollow)
    pipe('속이 빈 주구',[(-.092,-.010,.066),(-.131,-.019,.080),(-.154,-.024,.108),(-.169,-.028,.145),(-.19,-.032,.17),(-.209,-.035,.178)],[.040,.038,.029,.023,.020,.021],True)
    if side:
        pipe('옆손잡이',[(.097,-.040,.098),(.142,-.071,.106),(.194,-.11,.118),(.223,-.13,.122)],[.031,.024,.022,.026],True)
    else:
        pts=[(.087+.110*cos(a),.006,.100+.072*sin(a)) for a in [pi*.47-i*pi*.94/20 for i in range(21)]]
        pipe('고리 손잡이',pts,[.012]*len(pts))

def sieve(x,y,z):
    # Open basket woven from meridians and hoops. Rest on a matching waste bowl.
    bowl('거름망 받침 그릇',x,y,z,.085,.108,white)
    z+=.115
    for j in range(20):
        a=2*pi*j/20
        path=[(x+.078*sin(t)*cos(a),y+.078*sin(t)*sin(a),z-.049*cos(t)) for t in [.05+i*1.52/8 for i in range(9)]]
        tube('거름망 세로살',path,[.00125]*9,gold,5)
    for i in range(1,8):
        t=i*pi/14
        path=[(x+.078*sin(t)*cos(a*2*pi/36),y+.078*sin(t)*sin(a*2*pi/36),z-.049*cos(t)) for a in range(37)]
        tube('거름망 테두리' if i==7 else '거름망 가로살',path,[.0038 if i==7 else .00125]*37,gold,6)
    path=[(x+.077,y-.013,z),(x+.175,y-.015,z+.012),(x+.223,y-.012,z+.016),(x+.234,y,z+.016),(x+.223,y+.012,z+.016),(x+.175,y+.015,z+.012),(x+.077,y+.013,z)]
    tube('거름망 고리 손잡이',path,[.0035]*len(path),gold)

def text(name,value,x,y,z,size,mat):
    data=bpy.data.curves.new(name,'FONT')
    data.body=value
    data.align_x='CENTER'
    data.size=size
    data.extrude=.0006
    data.materials.append(mat)
    o=bpy.data.objects.new(name,data)
    gallery.objects.link(o)
    o.location=(x,y,z)
    o.rotation_euler.x=pi/2
    bpy.context.view_layer.objects.active=o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o.select_set(False)

# Freestanding joinery. The open lower shelf can be seen through from both ends.
for x in [-1.49,1.49]:
    for y in [-.47,.47]:
        block('진열대 기둥',x,y,.055,.074,.074,.90,oak)
for z in [.18,.87]:
    block('진열대 가로틀',0,0,z,3.07,1.02,.07,oak)
    block('상감 진열면',0,0,z+.069,3.00,.956,.012,cream)
for x in [-1,0,1]:
    for j in range(3):
        tray(x+.09*j,0,.262+j*.023,.28,[red,dark,oak][j])

base=.951
block('다관 다탁',-.83,.07,base,1.21,.68,.064,dark)
pot(-.91,.12,base+.064,1.32,ink)
for x,y in [(-1.24,-.13),(-.80,-.13),(-.48,.16)]:
    tray(x,y,base+.064,.096,red)
    bowl('흑유 찻잔',x,y,base+.076,.071,.082,ink)
sieve(-.30,-.22,base)
block('백자 진열 단',.38,.15,base,.88,.55,.126,oak)
block('백자 진열 단 상판',.38,.15,base+.126,.86,.535,.015,cream)
bowl('백자 꽃굽 높은 그릇',.37,.13,base+.141,.262,.239,white,.33,12)
for x,y in [(.93,.22),(1.31,.02),(1.00,-.25)]:
    tray(x,y,base,.135,dark)
    bowl('청자 꽃잎 찻잔',x,y,base+.014,.092,.087,blue,.18,8)
for x in [-.03,.31,.65]:
    tray(x,-.33,base,.105,oak)
    bowl('연둣빛 찻잔',x,-.33,base+.012,.070,.071,leaf)
# Three-bay cabinet in the opening photographs: timber uprights, light shelves,
# modest upper sign and contrasting families of vessels grouped by shelf.
cy=2.58
block('진열장 뒤판',0,cy+.25,.08,4.94,.075,2.34,oak)
block('진열장 하부',0,cy,.08,4.95,.57,.45,edge)
for j in range(5):
    x=(j-2)*.98
    block('문짝',x,cy-.294,.105,.962,.025,.394,oak)
    block('문손잡이',x+.33,cy-.314,.427,.16,.015,.014,gold)
for x in [-2.44,-.84,.84,2.44]:
    block('진열장 세로틀',x,cy,.10,.07,.61,2.32,oak)
for h in [.535,1.055,1.575,2.375]:
    block('선반 목재틀',0,cy,h,4.96,.63,.053,oak)
    block('선반 밝은 윗면',0,cy,h+.053,4.89,.604,.009,cream)
for row,h in enumerate([.597,1.117,1.637]):
    for j,x in enumerate([-2.04,-1.37,-.47,.42,1.36,2.03]):
        if row==2 and j in (2,3): continue
        m=[white,blue,leaf,red,ink][(j+2*row)%5]
        if (row+j)%4==0:pot(x,cy-.06,h,1.04,m,True)
        elif (row+j)%4==1:
            for k in range(4):tray(x,cy,h+k*.024,.215,m)
        else:bowl('선반 굽그릇',x,cy,h,.19+.013*row,.144+.024*row,m,.27,10 if j%2 else 0)
text('매장 상호','THINGS WE LOVE',0,cy+.203,2.031,.155,cream)
text('매장 부제','CRAFT & LIFE',0,cy+.200,1.89,.072,cream)
block('상호 명패',0,-.525,.825,.49,.014,.116,dark)
text('진열대 상호','TWL',0,-.534,.852,.083,cream)

# Seamless quarter-sawn grain, mapped lengthwise on shelves and vertically on uprights.
gy,gx=np.mgrid[0:256,0:512]
a,b=2*pi*gx/512,2*pi*gy/256
wave=34*b+2.4*np.sin(a+.7*np.sin(2*b))+.85*np.sin(3*a-b)
tone=.93+.025*np.sin(wave)+.023*np.cos(3*b+np.sin(a))-.065*np.maximum(0,np.cos(wave))**8
rgba=np.ones((256,512,4),dtype=np.float32)
rgba[:,:,:3]=tone[:,:,None]
grain=bpy.data.images.new('참나무 결',width=512,height=256)
grain.pixels.foreach_set(rgba.ravel())
grain.pack()
for m in (oak,edge):
    p=m.node_tree.nodes.get('Principled BSDF')
    tex=m.node_tree.nodes.new('ShaderNodeTexImage')
    tex.image=grain
    mix=m.node_tree.nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1
    mix.inputs[1].default_value=m.diffuse_color
    m.node_tree.links.new(tex.outputs['Color'],mix.inputs[2])
    m.node_tree.links.new(mix.outputs[0],p.inputs['Base Color'])
for o in gallery.objects:
    if o.data.materials[0] not in (oak,edge):continue
    uv=o.data.uv_layers.new(name='OakGrain')
    vertical=o.dimensions.z>max(o.dimensions.x,o.dimensions.y)
    for face in o.data.polygons:
        normal=face.normal
        for idx in face.loop_indices:
            x,y,z=o.data.vertices[o.data.loops[idx].vertex_index].co
            if abs(normal.z)>.6: u,v=x,y
            elif abs(normal.x)>.6: u,v=(z,y) if vertical else (y,z)
            else:u,v=(z,x) if vertical else (x,z)
            uv.data[idx].uv=(u/1.21,v/.54)
print('Editable meshes:',len(gallery.objects))
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
