"""Build editable upper-floor shop displays. Run in Blender's Python interpreter."""
import bpy, math, runpy
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
DARK = 0x323638
STEEL = 0xc5c8c5
WOOD = 0xb67c55
BONE = 0xf2ead9
materials = {}
origins = {}

def start(key, label):
    global collection, offset
    offset = (len(origins) % 3 * 2.8, len(origins) // 3 * 2.8, 0)
    origins[key] = offset
    collection = bpy.data.collections.new(label)
    collection['display_key'] = key
    collection['export_origin'] = offset
    bpy.context.scene.collection.children.link(collection)

def part(name, color):
    obj = bpy.context.object
    obj.name = name
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)
    obj.location += Vector(offset)
    if color not in materials:
        mat = bpy.data.materials.new(f'Finish {color:06x}')
        def linear(v):
            s = v / 255
            return s / 12.92 if s < .04045 else ((s + .055) / 1.055) ** 2.4
        mat.diffuse_color = [linear((color >> shift) & 255) for shift in (16,8,0)] + [1]
        materials[color] = mat
    obj.data.materials.append(materials[color])
    return obj

def block(name, center, size, color, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = part(name, color)
    for v in obj.data.vertices:
        for i in range(3): v.co[i] *= size[i]
    if bevel:
        mod = obj.modifiers.new('Rounded edges','BEVEL')
        mod.width,mod.segments = bevel,2
    return obj

def rod(name, a, b, r, color, n=8, top=None):
    delta = Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r if top is None else top,
                                   depth=delta.length, location=(Vector(a)+Vector(b)) / 2)
    obj = part(name,color)
    obj.rotation_euler = delta.to_track_quat('Z','Y').to_euler()
    return obj

def shell(name, rows, color):
    vertices = [p for row in rows for p in row]
    n = len(rows[0])
    faces = [tuple(reversed(range(n)))]
    for j in range(len(rows)-1):
        for i in range(n):
            k=(i+1)%n
            faces.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
    faces.append(tuple(range(len(vertices)-n,len(vertices))))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active=obj
    part(name,color)
    return obj

start('case','6F · Aluminium luggage')
block('Ribbed cabin case', (0,0,.40), (.44,.29,.64),STEEL,.065)
for x in [-.16,-.12,-.08,-.04,0,.04,.08,.12,.16]:
    block('Raised aluminium rib',(x,-.145,.40),(.012,.014,.51),0xe2e3dd,.005)
for x in [-.15,.15]:
    for y in [-.105,.105]: rod('Twin wheel',(x-.027,y,.055),(x+.027,y,.055),.052,DARK,12)
for x in [-.083,.083]:
    rod('Telescope',(x,.078,.70),(x,.078,.94),.012,0x828c91)
block('Pull handle',(0,.078,.944),(.19,.035,.031),DARK,.013)
for x in [-.205,.205]: block('Corner protector',(x,-.13,.63),(.025,.028,.095),0xafb7bc,.009)

# The 6F shop displays ribbed cases and compact crossbody bags on timber shelving.
for side in [-1,1]:
    block('Side seam edging',(side*.220,0,.40),(.009,.018,.505),0x8c9290)
    for z in [.22,.55]:
        block('Recessed catch',(side*.224,-.017,z),(.011,.066,.068),0x929b99,.004)
    block('Upper corner cap',(side*.196,.01,.704),(.042,.22,.022),0xb5bdbb,.008)
for x in [-.08,.08]: rod('Carry handle mount',(x,-.022,.708),(x,-.022,.751),.012,DARK)
block('Leather carry handle',(0,-.022,.755),(.17,.033,.025),DARK,.01)

start('golf','7F · Golf bag and irons')
def ovalrow(rx,ry,z,y=0,n=12):
    return [(rx*math.cos(i*2*math.pi/n), y+ry*math.sin(i*2*math.pi/n),z) for i in range(n)]
shell('Golf bag body',[ovalrow(.125,.14,.045),ovalrow(.14,.145,.16),ovalrow(.12,.13,.69,.015),ovalrow(.145,.15,.84,.028)],0x454f51)
shell('Light piping',[ovalrow(.146,.151,.812,.028),ovalrow(.148,.152,.845,.028)],BONE)
block('Accessories pocket',(0,-.122,.38),(.21,.10,.36),0x788883,.035)
for i in range(5):
    x= -.094 + .045*i; z=1.13+.035*(i%3)
    rod('Club shaft',(x*.55,.015,.78),(x,.037*(i%2),z),.007,STEEL)
    rod('Iron head',(x-.01,.037*(i%2),z),(x+.065,.042*(i%2),z+.018),.019,0x606b6f)
for x in [-.10,.10]: rod('Bag stand',(x,0,.63),(x*1.55,.22,.025),.010,DARK)

start('shoe','8F · Trail shoe')
outline=[(-.042,-.16),(.042,-.16),(.058,-.11),(.058,-.035),(.042,.07),(.046,.12),(.034,.15),(-.034,.15),(-.046,.12),(-.042,.07),(-.058,-.035),(-.058,-.11)]
shell('Layered outsole', [[(x,y,.007) for x,y in outline],[(x*1.03,y,.029) for x,y in outline],[(x,y,.045) for x,y in outline]],0xe2d6bc)
shell('Woven upper',[[(x*.97,y*.98,.044) for x,y in outline],[(x*.91,y*.93,.062+.03*(y+.16)/.31) for x,y in outline],[(x*.50,y*.65+.026,.076+.031*(y+.16)/.31) for x,y in outline]],0x53675a)
for i in range(4):
    y=-.061+i*.022; z=.082+i*.002
    rod('Lacing',(-.027,y,z),(.027,y+.013,z+.004),.0028,BONE,6)
    rod('Lacing',(.027,y,z),(-.027,y+.013,z+.004),.0028,BONE,6)
for side in [-1,1]:
    for i in range(4): block('Side tread',(side*.047,-.082+i*.048,.018),(.019,.023,.024),DARK,.003)

start('speaker','9F · Hi-fi listening room')
block('Plinth',(0,0,.03),(.37,.38,.055),DARK,.013)
block('Veneered cabinet',(0,0,.55),(.285,.335,1.0),WOOD,.028)
block('Front baffle',(0,-.169,.55),(.26,.024,.96),0x343c3f,.012)
for z,r in [(.28,.095),(.53,.095),(.77,.083),(.934,.032)]:
    rod('Driver surround',(0,-.186,z),(0,-.199,z),r,0x5b6264,20)
    rod('Concentric cone',(0,-.20,z),(0,-.216,z),r*.82,0xcbb489,16,r*.37)
    rod('Dust cap',(0,-.216,z),(0,-.221,z),r*.32,DARK,12,r*.13)

start('stroller','10F · Pram')
for x in [-.24,.24]:
    for y,r in [(-.28,.095),(.29,.135)]:
        rod('Rubber tyre',(x-.025,y,r),(x+.025,y,r),r,DARK,16)
        rod('Wheel hub',(x-.028,y,r),(x+.028,y,r),r*.48,0x969b98,12)
    for a,b in [((x,-.28,.105),(x,.23,.78)),((x,.29,.145),(x,-.19,.60)),((x,.12,.56),(x,.36,1.04))]:
        rod('Folding chassis',a,b,.016,0x808b8a)
rod('Padded handle',(-.245,.36,1.04),(.245,.36,1.04),.019,0x79583f)
block('Basket',(0,.015,.27),(.39,.42,.12),DARK,.03)
block('Seat',(0,.015,.55),(.43,.43,.09),0x947f69,.027)
block('Seat back',(0,.18,.68),(.43,.07,.30),0x947f69,.028).rotation_euler.x=-.20
rows=[]
for i in range(6):
    a=.05+1.92*i/5
    # Cross sections follow the hoop from the back of the seat to the visor.
    y=.14+.20*math.cos(a); z=.70+.26*math.sin(a)
    rows.append([(-.237,y,z-.06),(-.217,y,z),(.217,y,z),(.237,y,z-.06),(.23,y,z-.065),(-.23,y,z-.065)])
shell('Folded fabric canopy',rows,0x766957)
for x in [-.197,.197]: rod('Safety bar',(x,-.14,.55),(x,-.19,.70),.012,DARK)
rod('Padded safety rail',(-.197,-.19,.70),(.197,-.19,.70),.015,0x79583f)

start('oven','11F · Pizza restaurant')
block('Hearth slab',(0,0,.055),(1.18,.92,.11),0x746251,.035)
n=16
rows=[[(.55*math.cos(i*math.tau/n),.42*math.sin(i*math.tau/n),.10) for i in range(n)]]
for a in [.30,.62,.94,1.25,1.53]:
    rows.append([(.55*math.cos(a)*math.cos(i*math.tau/n),.42*math.cos(a)*math.sin(i*math.tau/n),.10+.52*math.sin(a)) for i in range(n)])
shell('Clay dome',rows,0xbb7853)
# Arched oven mouth and brick arch at the front of the dome.
for i in range(12):
    a=math.pi*i/12;b=math.pi*(i+1)/12
    inner=.20; outer=.275
    coords=[(inner*math.cos(a),.12+inner*math.sin(a)),(outer*math.cos(a),.12+outer*math.sin(a)),
            (outer*math.cos(b),.12+outer*math.sin(b)),(inner*math.cos(b),.12+inner*math.sin(b))]
    shell('Arch brick',[[(x,-.386,z) for x,z in coords],[(x,-.438,z) for x,z in coords]],0xcda381 if i%2 else 0xb99172)
mouth=[(-.2,.101),(.2,.101)]+[(.20*math.cos(math.pi*i/14),.12+.20*math.sin(math.pi*i/14)) for i in range(15)]
shell('Oven mouth',[[(x,-.428,z) for x,z in mouth],[(x,-.432,z) for x,z in mouth]],0x302c27)
rod('Flue',(0,-.13,.50),(0,-.13,.78),.064,0x5e6463,12)
rod('Chimney cap',(0,-.13,.78),(0,-.13,.81),.083,0x404542,12)

# Raised grooves and the long strap distinguish this accessory from the adjoining bags.
start('crossbody','6F · Small ridged crossbody case')
block('Crossbody shell',(0,0,.135),(.32,.13,.235),0xaab0ae,.027)
for x in [-.12,-.08,-.04,0,.04,.08,.12]:
    block('Groove bead',(x,-.066,.13),(.010,.009,.16),0xd9dbd1,.003)
for x in [-.127,.127]:
    rod('Swivel mount',(x,0,.233),(x,0,.271),.009,0xb4a07d,8)
for a,b in [((-.129,0,.261),(-.094,.04,.453)),((-.094,.04,.453),(.061,.04,.463)),((.061,.04,.463),(.130,0,.261))]:
    rod('Leather shoulder strap',a,b,.012,0x6d4e3b,8)
block('Central clasp',(0,-.070,.225),(.053,.014,.030),0x727c78,.005)

# The 2024 Gangnam opening used bent aluminium tubes around its display shelves.
start('pipeShelf','6F · Curved tube accessory shelving')
for y in [-.23,.23]:
    radius = .21
    path = [(-.88,y,.09),(-.88,y,1.47)]
    for j in range(1,9):
        angle = math.pi - j*math.pi/16
        path.append((-.67 + radius*math.cos(angle), y, 1.47 + radius*math.sin(angle)))
    path.append((.67,y,1.68))
    for j in range(1,9):
        angle = math.pi/2 - j*math.pi/16
        path.append((.67 + radius*math.cos(angle), y, 1.47 + radius*math.sin(angle)))
    path.append((.88,y,.09))
    for first,second in zip(path,path[1:]):
        rod('Bent aluminium frame',first,second,.027,0xb9c2c2,8)
block('Timber plinth',(0,0,.115),(1.83,.55,.19),0xb49b7e,.018)
for z in [.68,1.27]:
    block('Timber shelf',(0,0,z+.032),(1.72,.52,.064),0xc4ad91,.012)
    for x in [-.85,.85]:
        rod('Transverse support',(x,-.23,z-.018),(x,.23,z-.018),.021,STEEL)

# Stand inside the existing department-store golf shop. The arrangement and hardware
# are representative; different blade and mallet profiles read from the aisle.
start('putterRail', '7F · Putter comparison rack')
block('Honed plinth', (0,0,.075), (1.48,.57,.15),0x333838)
block('Inset oak tray', (0,-.025,.155),(1.43,.49,.034),0xbda384)
block('Putting felt', (0,-.05,.178),(1.37,.39,.018),0x557269)
for x in [-.664,.664]:
    rod('Steel rack upright',(x,.174,.151),(x,.174,.975),.024,0x4e5a5d,8)
    block('Rubber foot',(x,.174,.164),(.094,.086,.027),0x272e31)
block('Upper rail', (0,.171,.96),(1.39,.078,.056),0xa89a83)
for i,x in enumerate([-.498,-.17,.164,.496]):
    # Each club has a stepped hosel, brushed shaft, dark rubber grip and coloured end plug.
    hx=x-.04
    rod('Grip cradle left',(hx,.137,.966),(hx,.083,.991),.01,DARK,6)
    rod('Grip cradle right',(hx+.075,.137,.966),(hx+.075,.083,.991),.01,DARK,6)
    rod('Offset hosel',(hx,-.105,.214),(hx-.021,-.095,.271),.01,STEEL,7)
    rod('Bent neck',(hx-.021,-.095,.271),(x-.024,-.071,.306),.009,STEEL,7)
    rod('Stepped steel shaft',(x-.024,-.071,.306),(x,.090,.883),.0072,STEEL,7)
    rod('Graphite grip',(x,.090,.883),(x+.01,.145,1.088),.014,0x353b3d,9,.017)
    rod('Grip end cap',(x+.01,.144,1.084),(x+.01,.145,1.092),.017,[0xb97951,0xaab7a3,0xc4cdd2,0xb3846e][i],9)
    if i<2:
        outline=[(-.075,-.033),(.073,-.033),(.08,-.02),(.071,.026),(.043,.035),(.036,.009),(-.039,.009),(-.047,.030),(-.072,.023)]
        finish=0xb0b4b2 if i==0 else 0xad8165
    else:
        outline=[(-.076,-.035),(.076,-.035),(.078,.025),(.062,.084),(.034,.084),(.022,.033),(-.021,.033),(-.034,.084),(-.064,.081),(-.078,.024)]
        finish=0x475154 if i==2 else 0x686d70
    def head_row(z, scale):
        return [(x+a*scale,-.117+b*scale,z) for a,b in outline]
    shell('Heel-toe blade' if i<2 else 'Twin-wing mallet',
          [head_row(.188,.92),head_row(.196,1),head_row(.22,1),head_row(.226,.92)],finish)
    block('Milled face insert',(x,-.151,.207),(.123,.004,.017),0x50595b if i<2 else 0xc4c5bd)
    block('Alignment mark',(x,-.119,.227),(.003,.027,.002),BONE)
    if i>=2:
        for side in [-1,1]:
            block('Wing sightline',(x+.053*side,-.069,.227),(.003,.054,.002),BONE)

# Preserve the named, selectable parts in Blender. Bake only the evaluated mesh for the game.
bpy.context.view_layer.update()
for obj in bpy.context.selected_objects: obj.select_set(False)
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':
        area.spaces.active.shading.color_type='MATERIAL'
        area.spaces.active.region_3d.view_distance=10
        area.spaces.active.region_3d.view_location=(2.8,1.4,.4)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'upper-floor-displays.blend'),compress=True)
runpy.run_path(str(OUT / 'export_displays.py'))
