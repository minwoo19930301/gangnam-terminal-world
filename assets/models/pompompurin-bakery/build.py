"""Customer-facing bakery display from the July 2026 Shinsegae branch photograph."""
from pathlib import Path
from math import cos, sin, pi
import bpy, subprocess, tempfile
from mathutils import Matrix

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('PompompurinBakery')
bpy.context.scene.collection.children.link(collection)

def finish(obj, name, color):
    obj.name = name
    for parent in list(obj.users_collection):
        parent.objects.unlink(obj)
    collection.objects.link(obj)
    material = bpy.data.materials.get(color)
    if not material:
        material = bpy.data.materials.new(color)
        rgb = [int(color[i:i+2],16)/255 for i in (0,2,4)]
        material.diffuse_color = (*[((v+.055)/1.055)**2.4 if v>.04045 else v/12.92 for v in rgb],1)
    obj.data.materials.append(material)
    return obj

with tempfile.TemporaryDirectory() as tmp:
    texture=Path(tmp)/'Shop print.png'
    subprocess.run(['node',str(directory/'raster.mjs'),str(texture)],check=True)
    image=bpy.data.images.load(str(texture));image.pack()
image.name='박스 · 빵 도장 · 머그 인쇄'
print_material=bpy.data.materials.new('매장 포장 인쇄')
print_material.use_nodes=True
tree=print_material.node_tree
tex=tree.nodes.new('ShaderNodeTexImage');tex.image=image
tree.links.new(tex.outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])

def printed(name,points,region,tint='FFFFFF'):
    ob=mesh(name,points,[tuple(range(4))],tint)
    matte=print_material
    if tint!='FFFFFF':
        key='인쇄 · '+tint
        matte=bpy.data.materials.get(key)
        if not matte:
            matte=print_material.copy();matte.name=key
            nt=matte.node_tree;mix=nt.nodes.new('ShaderNodeMixRGB')
            mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
            mix.inputs[2].default_value=bpy.data.materials[tint].diffuse_color
            nt.links.new(nt.nodes.get('Image Texture').outputs['Color'],mix.inputs[1])
            nt.links.new(mix.outputs[0],nt.nodes.get('Principled BSDF').inputs['Base Color'])
    ob.data.materials.clear();ob.data.materials.append(matte)
    ob['paper_tint']=tint
    uv=ob.data.uv_layers.new(name='Artwork')
    l,t,r,b=region
    for i,(u,v) in enumerate([(l,b),(r,b),(r,t),(l,t)]):
        uv.data[i].uv=((u+.5)/512,1-(v+.5)/512)
    return ob

def paper(name,x,y,z,w,h,region):
    return printed(name,[(x-w/2,y,z),(x+w/2,y,z),(x+w/2,y,z+h),(x-w/2,y,z+h)],region)

def box(name,x,y,z,w,d,h,color,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.dimensions=(w,d,h)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        edge=obj.modifiers.new('Soft edges','BEVEL')
        edge.width,edge.segments=bevel,(2 if bevel>=.02 else 1)
    return obj

from mathutils import Matrix, Vector

def oval(name,x,y,z,w,d,h,color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(x,y,z))
    obj=finish(bpy.context.object,name,color)
    obj.scale=(w/2,d/2,h/2)
    for poly in obj.data.polygons:
        poly.use_smooth=True
    return obj

def mesh(name,points,faces,color):
    data=bpy.data.meshes.new(name)
    data.from_pydata(points,[],faces)
    obj=bpy.data.objects.new(name,data)
    return finish(obj,name,color)

# Printing has a heavy rounded stroke. DejaVu Sans Bold is a portable alternative.
font_paths=[Path('/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf'),
            Path('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')]
rounded_font=next((bpy.data.fonts.load(str(p)) for p in font_paths if p.is_file()),None)

def label(text,x,y,z,height,color):
    bpy.ops.object.text_add(location=(x,y,z),rotation=(pi/2,0,0))
    obj=bpy.context.object
    obj.data.body=text
    if rounded_font and height>=.08:
        obj.data.font=rounded_font
    obj.data.align_x='CENTER'
    obj.data.size=height
    obj.data.extrude=0
    obj.data.resolution_u=2
    bpy.ops.object.convert(target='MESH')
    return finish(obj,text,color)

def rod(name,a,b,r,color):
    v=Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=r,depth=v.length,location=(Vector(a)+Vector(b))/2)
    obj=finish(bpy.context.object,name,color)
    obj.rotation_euler=v.to_track_quat('Z','Y').to_euler()
    return obj

# Blender -Y faces the public aisle. All dimensions are artistic approximations.
wheat, butter, toast, coffee, sugar = 'EDD586','FFDE72','CC914A','593B31','FFF1CE'

def arc(name,x,y,z,rx,rz,a,b,r,color,samples):
    pts=[(x+rx*cos(a+(b-a)*i/samples),y,z+rz*sin(a+(b-a)*i/samples)) for i in range(samples+1)]
    for u,v in zip(pts,pts[1:]):
        rod(name,u,v,r,color)

def face(x,y,z,k):
    for dx in [-.18,.18]:
        oval('Cocoa eye',x+dx*k,y,z+.04*k,.038*k,.025*k,.05*k,coffee)
    oval('Rounded triangular nose',x,y-.012*k,z+.002*k,.078*k,.035*k,.043*k,coffee)
    for dx in [-.047,.047]:
        arc('Piped double smile',x+dx*k,y-.019*k,z-.014*k,.047*k,.045*k,pi,2*pi,.008*k,coffee,5)

def puppy(name,x,y,z,k,color,chef=False):
    # Floppy ears and low cheeks define both the golden retriever and its face buns.
    oval(name+' face',x,y,z, .86*k,.53*k,.63*k,color)
    for side in [-1,1]:
        ear=oval(name+' floppy ear',x+side*.395*k,y-.015*k,z-.025*k,.37*k,.31*k,.205*k,color)
        ear.rotation_euler.y=side*.30
    if chef:
        face(x,y-.248*k,z+.005*k,k)
    else:
        for j in range(6):
            for i in range(3):
                def point(iu,iv):
                    u=-.232+.464*iu/6
                    v=-.101+.216*iv/3
                    depth=.265*(max(0,1-(u/.43)**2-(v/.315)**2)**.5)
                    return (x+u*k,y-depth*k-.0009,z+v*k)
                l=344+155*j/6;r=344+155*(j+1)/6
                t=190+111*(2-i)/3;b=190+111*(3-i)/3
                patch=printed('Glazed cocoa face', [point(j,i),point(j+1,i),point(j+1,i+1),point(j,i+1)],
                              [l,t,r,b],color)

    if chef:
        for side in [-1,1]:
            oval('Pink cheek',x+side*.273*k,y-.205*k,z-.044*k,.102*k,.018*k,.043*k,'EFB3AA')
        for dx,dz,size in [(-.115,.32,.20),(0,.36,.24),(.115,.32,.20)]:
            oval('Bread-coloured chefs toque',x+dx*k,y,z+dz*k,size*k,.23*k,.21*k,'E9AA49')
        box('Toque band',x,y,z+.275*k,.31*k,.22*k,.085*k,'E9AC51',.025)
    else:
        beret=oval('Cocoa beret',x+.045*k,y+.012*k,z+.287*k,.29*k,.25*k,.084*k,'865431')
        beret.rotation_euler.y=.12

def wall_disk(name,x,y,z,w,h,color):
    return oval(name,x,y,z,w,.075,h,color)

# The branch photo shows pale joinery flanking the oven. A shallow rounded opening
# on the left exposes a powder-blue reveal. The opposite wall carries a hanging scroll.
for side in [-1,1]:
    x=side*2.37
    box('Pale honey wall wing',x,1.17,1.55,1.46,.15,3.10,'DFC599',.035)
    for j in range(7):
        box('Upright maple joint',x+(j-3)*.20,1.088,1.56,.008,.009,3.03,'CBB187')
    box('Warm timber head rail',x,1.06,3.065,1.48,.14,.10,'A47951',.025)
# Layered rounded reveal is built as planar silhouettes to preserve the lit niche contour.
def rounded_panel(name,x,y,z,w,h,r,color):
    pts=[]
    for cx,cz,sa in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,pi/2),
                     (-w/2+r,-h/2+r,pi),(w/2-r,-h/2+r,3*pi/2)]:
        for i in range(7):
            a=sa+i*pi/12
            pts.append((x+cx+r*cos(a),y,z+cz+r*sin(a)))
    return mesh(name,pts,[tuple(range(len(pts)))],color)
rounded_panel('Dark timber niche frame',-2.39,1.080,1.72,1.20,2.38,.25,'956D49')
rounded_panel('Powder blue niche',-2.39,1.068,1.72,1.10,2.24,.22,'C9D7DB')
box('Baguette niche shelf',-2.39,.94,1.26,1.07,.29,.052,'A6794C',.01)
for j in range(4):
    lo=oval('Niche loaf',-2.71+j*.16,.96,1.52,.14,.17,.50,'DEA35E')
    lo.rotation_euler.y=-.17+j*.11
box('Cream hanging print',2.41,1.070,2.10,.77,.021,1.13,'E8CE9C',.008)
for zz in [1.53,2.68]:
    rod('Hanging print dowel',(1.97,1.047,zz),(2.85,1.047,zz),.022,'9F7046')
rod('Print hanging cord',(2.04,1.057,2.67),(2.41,1.057,2.84),.008,'916642')
rod('Print hanging cord',(2.41,1.057,2.84),(2.78,1.057,2.67),.008,'916642')
label('BAKERY CAFE',2.41,1.045,2.47,.076,coffee)
label('POMPOMPURIN',2.41,1.045,2.36,.087,coffee)
for j in range(3):
    for i in range(2):
        px,pz=2.24+i*.34,1.74+j*.20
        arc('Printed bun outline',px,1.045,pz,.102,.065,0,2*pi,.006,'B18C5C',12)
        arc('Printed bun scoring',px,1.045,pz,.04,.026,0,pi,.004,'A68050',5)

# Low shop counter and woven front. Vertical/horizontal strips overlap in alternating runs.
box('Woven counter core',0,.15,.48,4.32,1.07,.96,'D3AE79',.095)
box('Warm maple countertop',0,.14,.99,4.45,1.17,.095,'B67B4C',.045)
# The photograph shows woven strips, not individual blocks. Each vertical strip
# bends over alternating horizontal bands. Only its exposed surface needs vertices.
for j in range(11):
    zz=.080+j*.080
    for i in range(33):
        xx=(i-16)*.126
        color=['DFBC87','D1AA76','DBB581','D5AF7C'][(i*7+j*3)%4]
        if (i+j)%2:
            points=[(xx-.052,-.390,zz-.036),(xx+.052,-.390,zz-.036),
                    (xx-.052,-.405,zz),(xx+.052,-.405,zz),
                    (xx-.052,-.390,zz+.036),(xx+.052,-.390,zz+.036)]
        else:
            points=[(xx-.061,-.391,zz-.029),(xx-.061,-.391,zz+.029),
                    (xx,-.404,zz-.029),(xx,-.404,zz+.029),
                    (xx+.061,-.391,zz-.029),(xx+.061,-.391,zz+.029)]
        faces=[(0,1,3,2),(2,3,5,4)] if (i+j)%2 else [(0,2,3,1),(2,4,5,3)]
        mesh('Woven counter strip',points,faces,color)
# Yellow brick oven backdrop. Its elliptical arched mouth is an ornamental recess.
cy=.82
for row in range(12):
    h=.185; z=.88+row*h
    half=1.70 if row<6 else 1.70*(1-((row-5)/8.2)**2)**.5
    n=round(2*half/.42)
    for i in range(n):
        xx=-half+(i+.5)*2*half/n
        box('Honey yellow fired brick',xx,cy,z,2*half/n-.012,.42,h-.012,
            ['EAC457','EDC961','EACA6B','E3BD55','F4D475'][(i*3+row*7)%5],.017)
wall_disk('Dark opening in the bakery oven',0,cy-.24,1.56,2.38,1.28,'796246')
arc('Ochre arched reveal',0,cy-.29,1.53,1.18,.63,0,pi,.055,'C99746',24)
# The photographed badge has stepped shoulders and a double plum/chocolate outline.
badge=[(-.75,-.12),(-.72,-.20),(-.57,-.24),(0,-.18),(.57,-.24),(.72,-.20),(.75,-.12),
       (.75,.015),(.69,.08),(.50,.095),(.46,.16),(.37,.19),(0,.22),
       (-.37,.19),(-.46,.16),(-.50,.095),(-.69,.08),(-.75,.015)]
for name,scale,depth,color in [('Logo edge',1.07,.30,'60474C'),('Caramel line',1.0,.312,'D39666'),
                              ('Plum center',.94,.325,'795865')]:
    mesh(name,[(.67+u*scale,cy-depth,2.65+v*scale) for u,v in badge],[tuple(range(len(badge)))],color)
oval('Logo toque left',.60,cy-.34,2.88,.20,.06,.15,'BA8C68')
oval('Logo toque crown',.69,cy-.34,2.9,.22,.06,.17,'D0A67D')
oval('Logo toque right',.78,cy-.34,2.87,.16,.06,.14,'BB8B66')
label('BAKERY CAFE',.67,cy-.39,2.68,.115,sugar)
label('POMPOMPURIN',.67,cy-.39,2.50,.161,'FFE399')
# Photographed mascot in white jacket, toque and ladle.
mx=-.49
oval('White chef jacket',mx,.21,1.45,.91,.58,.85,'FAEBCD')
oval('Yellow hem',mx,.20,1.13,.86,.55,.22,'EAC75C')
rod('Jacket placket',(mx+.006,-.079,1.17),(mx+.006,-.079,1.76),.012,'815B46')
oval('Golden neckerchief',mx-.075,-.084,1.63,.094,.035,.30,'F4C954')
for j in range(3): oval('Jacket stud',mx+.09,-.073,1.31+j*.12,.037,.025,.037,coffee)
puppy('Oven chef',mx,.20,1.96,1.14,butter,True)
for dx in [-1,1]:
    oval('Golden paw',mx+dx*.445,.08,1.45,.24,.26,.25,butter)
rod('Baking ladle handle',(mx-.39,-.06,1.43),(mx-.67,-.07,1.78),.022,'DEAE53')
oval('Ladle bowl',mx-.69,-.08,1.80,.195,.07,.16,'E2B252')
# Individual goods and a branch-logo carrier. All sit on the counter.
for x in [-1.53,1.37]:
    box('Basket bottom',x,.03,1.073,.84,.62,.05,'C49859',.025)
    for side in [-1,1]:
        box('Wicker basket lip',x,.03+side*.30,1.13,.86,.027,.106,'B78449',.01)
        box('Wicker basket end',x+side*.415,.03,1.13,.025,.61,.106,'BC9154',.01)
    for row in range(2):
        for col in range(2):
            puppy('Stamped face bun',x+(col-.5)*.35,.02+(row-.5)*.27,1.20,.30,
                  ['DB9D53','EABE77','CF8E50','E6AF67'][col+2*row])
bag_start=set(collection.objects)
box('Pastry bag',.52,.045,1.33,.53,.215,.57,'FFF0C2',.018)
paper('Printed cream carrier',.52,-.065,1.059,.51,.546,[6,6,330,428])
# Scale the full printed carrier as a unit; its handle remains editable.
for dx in [-.13,.13]:
    rod('Brown folded bag handle',(.52+dx,-.064,1.58),(.52+dx*.71,-.067,1.66),.006,'946744')
rod('Brown folded bag handle',(.428,-.067,1.66),(.612,-.067,1.66),.006,'946744')
pivot=Vector((.52,.045,1.04))
for item in set(collection.objects)-bag_start:
    item.location=pivot+(item.location-pivot)*1.30
    item.scale*=1.30
# Low square-cut toast with branded crust, baked face buns and an ochre mug are
# in the press photograph. The printed silhouettes are original mesh drawings.
box('Sliced toast heel',.84,-.232,1.194,.28,.15,.27,'CA9459',.037)
box('Pale crumb',.84,-.311,1.194,.25,.012,.235,'F6D8A5',.027)
paper('Chef stamp on toast',.84,-.319,1.097,.219,.199,[351,13,496,155])
# The glazed ceramic mug is open, with a thin rim and visible ochre interior.
x,y,z=.06,-.234,1.052
section=[(.089,0),(.101,.18),(.099,.196),(.086,.196),(.082,.034)]
pts=[];faces=[]
for radius,height in section:
    for j in range(24):
        a=2*pi*j/24;pts.append((x+radius*cos(a),y+radius*sin(a),z+height))
for k in range(len(section)-1):
    for j in range(24):
        i=k*24+j;n=k*24+(j+1)%24;faces.append((i,n,n+24,i+24))
faces.append(tuple(range(4*24,5*24)))
mesh('Golden mug glazed shell',pts,faces,'F1D286')
arc('Ear handle',x+.087,y,z+.108,.071,.061,-pi/2,pi/2,.015,'E8BD72',12)
# Cylinder-conforming printed band. Hue on the white patch is multiplied by the mug glaze.
for j in range(6):
    lo,hi=(-.67+j*1.34/6,-.67+(j+1)*1.34/6)
    coords=[(x+.102*sin(a),y-.102*cos(a),z+h) for a,h in [(lo,.049),(hi,.049),(hi,.160),(lo,.160)]]
    printed('Curved ceramic print',coords,[348+152*j/6,322,348+152*(j+1)/6,423],'F1D286')
for i in range(3):
    baguette=oval('Baguette behind basket',-1.66+i*.135,.32,1.49,.12,.13,.66,'DDA25D')
    baguette.rotation_euler.y=-.21+i*.23
    for j in range(3):
        ox=(-.21+i*.23)*(j-1)*.13
        rod('Baguette slash',(-1.69+i*.135+ox,.25,1.37+j*.11),(-1.64+i*.135+ox,.25,1.40+j*.11),.010,'F1CD8A')
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'display.blend'),compress=True)
