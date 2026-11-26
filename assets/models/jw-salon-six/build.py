"""Editable hotel meeting set. Local X is the room width, local +game Z faces the screen."""
import math
import runpy
from pathlib import Path
import bpy

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
coll = bpy.data.collections.new('JWSeoulSalonSixMeeting')
bpy.context.scene.collection.children.link(coll)
coll['export_model'] = 'salon-six'
coll['preview_origin'] = (0,0,0)


def color(name, hexcode):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = [((v/255+.055)/1.055)**2.4 for v in bytes.fromhex(hexcode)] + [1]
    mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=mat.diffuse_color
    bsdf.inputs['Roughness'].default_value=.84 if any(s in name for s in ('linen','upholstery','lining')) else .40
    if 'metal' in name or 'copper' in name or 'tubular' in name:
        bsdf.inputs['Metallic'].default_value=.66
    if 'diffuser' in name.lower():
        bsdf.inputs['Emission Color'].default_value=mat.diffuse_color
        bsdf.inputs['Emission Strength'].default_value=.6
    return mat


cloth = color('Black plum table linen','30292f')
fold = color('Table linen hem','211c23')
cloth_top = color('Pressed linen tops','40383e')
cloth_side = color('Soft skirt folds','3a3036')
seat = color('Cinnamon woven upholstery','a17055')
piping = color('Chair edge binding','755340')
steel = color('Dark lacquered tubular legs','403a39')
glass = color('Smoked glass edge','a1acb0')
gleam = color('Glass rim highlight','e6e5df')
white = color('Meeting stationery','eae5dc')
pen = color('Graphite pens','5b5751')
glaze = color('Glazing · daylight reflection','648ca3')
glaze_low = color('Glazing · lower reflection','4c7982')
glaze_high = color('Glazing · sky reflection','81acbf')
bronze = color('Window head and transom','665447')
cove_glow = color('Reflected cove light','f0cc9f')
brass = color('Satin copper light frames','b47f49')
seam = color('Warm dark panel reveals','70564f')
oak = color('Rose beige wall panels','bd9686')
ivory = color('Ceiling plaster','e8e3d9')
recess = color('Ceiling recess shadow','a58a72')
diffuser = color('Warm ivory diffuser','fff0da')
screen = color('Screen projection white','e8e7e5')
ink = color('Projection charcoal','555151')


class Part:
    def __init__(self,name):
        self.name=name
        self.v,self.faces,self.slots,self.mats=[],[],[],[]

    def add(self,verts,faces,mat):
        if mat not in self.mats:self.mats.append(mat)
        base=len(self.v)
        self.v.extend((x,-z,y) for x,y,z in verts)
        self.faces.extend(tuple(base+i for i in f) for f in faces)
        self.slots.extend([self.mats.index(mat)]*len(faces))

    def solid(self,bottom,top,mat):
        n=len(bottom)
        self.add(bottom+top,[tuple(reversed(range(n))),tuple(range(n,2*n))]+
                 [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],mat)

    def box(self,x,y,z,w,h,d,mat):
        base=[(x+i*w/2,y,z+j*d/2) for i,j in [(-1,-1),(-1,1),(1,1),(1,-1)]]
        self.solid(base,[(a,b+h,c) for a,b,c in base],mat)

    def finish(self):
        data=bpy.data.meshes.new(self.name)
        data.from_pydata(self.v,[],self.faces)
        data.update()
        obj=bpy.data.objects.new(self.name,data)
        coll.objects.link(obj)
        for m in self.mats:data.materials.append(m)
        for f,i in zip(data.polygons,self.slots):f.material_index=i
        return obj


# The table arms terminate separately in front of the projection screen.
for label,x,z,w,d in [('Left',-2.1,.0,1.0,6.5),('Right',2.1,.0,1.0,6.5),
                       ('Return',0,-2.75,3.2,1.0)]:
    m=Part('Black linen · '+label)
    m.box(x,.055,z,w,.70,d,cloth)
    m.box(x,.744,z,w+.009,.015,d+.009,cloth_top)
    m.box(x,.023,z,w-.025,.032,d-.025,fold)
    count=max(2,round(max(w,d)/1.4))
    for i in range(1,count):
        if d>w:m.box(x,.05,z-d/2+i*d/count,w+.001,.704,.009,fold)
        else:m.box(x-w/2+i*w/count,.05,z,.009,.704,d+.001,fold)
    for i in range(1,count):
        if d>w:
            edge=x + math.copysign(w/2+.002,x);at=z-d/2+i*d/count
            m.add([(edge,.055,at-.022),(edge,.055,at+.039),(edge,.71,at+.006)],
                  [(0,1,2)],cloth_side)
        else:
            at=x-w/2+i*w/count;edge=z-d/2-.002
            m.add([(at-.032,.055,edge),(at+.023,.055,edge),(at,.71,edge)],
                  [(0,1,2)],cloth_side)
    m.finish()


def chair(x,z,yaw,num):
    m=Part('Upholstered chair %02d'%num)
    cs,sn=math.cos(yaw),math.sin(yaw)
    def p(i,j,k):return x+i*cs+k*sn,j,z-i*sn+k*cs
    def slab(width,front,back,y,h,r,mat):
        outline=[(-width/2+r,front),(width/2-r,front),(width/2,front+r),
                 (width/2,back-r),(width/2-r,back),(-width/2+r,back),(-width/2,back-r),(-width/2,front+r)]
        m.solid([p(i,y,k) for i,k in outline],[p(i,y+h,k) for i,k in outline],mat)
    slab(.48,-.255,.24,.43,.073,.055,seat)
    slab(.466,-.244,.235,.409,.021,.05,piping)
    # Upper upholstery rolls into the side binding, leaving a softer front edge.
    ring=[(-.18,-.244),(.18,-.244),(.23,-.20),(.23,.18),(.19,.222),
          (-.19,.222),(-.23,.18),(-.23,-.20)]
    m.solid([p(i,.501,k) for i,k in ring],[p(i*.92,.518,k*.92) for i,k in ring],seat)
    # Splayed rectangular steel legs. Both back legs continue into the curved back.
    for side in [-1,1]:
        for fore in [-1,1]:
            foot=(side*.216,fore*.245)
            shoulder=(side*.196,fore*.191)
            m.solid([p(foot[0]+i*.014,.014,foot[1]+k*.014) for i,k in [(-1,-1),(-1,1),(1,1),(1,-1)]],
                    [p(shoulder[0]+i*.016,.445,shoulder[1]+k*.016) for i,k in [(-1,-1),(-1,1),(1,1),(1,-1)]],steel)
    profile=[(-.195,.495),(.195,.495),(.233,.542),(.236,.86),(.203,.915),
             (.135,.932),(-.135,.932),(-.203,.915),(-.236,.86),(-.233,.542)]
    def back(i,j,offset):return p(i,j,.174+.17*(j-.49)+offset-.042*(i/.236)**2)
    m.solid([back(i,j,0) for i,j in profile],[back(i,j,.047) for i,j in profile],seat)
    # A narrow stitched border outlines the padded back visible from the aisle.
    for i in range(len(profile)):
        a,b=profile[i],profile[(i+1)%len(profile)]
        def inset(pt):return (pt[0]*.94,.708+(pt[1]-.708)*.95)
        aa,bb=inset(a),inset(b)
        m.add([back(*a,.049),back(*b,.049),back(*bb,.049),back(*aa,.049)],[(0,1,2,3)],piping)
    m.finish()


def settings(x,z,yaw,num):
    m=Part('Place setting %02d'%num)
    cs,sn=math.cos(yaw),math.sin(yaw)
    def p(i,j,k):return x+i*cs+k*sn,j,z-i*sn+k*cs
    def tray(i,k,w,d,h,mat):
        ring=[p(i+a*w/2,.759,k+b*d/2) for a,b in [(-1,-1),(-1,1),(1,1),(1,-1)]]
        m.solid(ring,[(a,b+h,c) for a,b,c in ring],mat)
    tray(0,0,.253,.195,.005,white)
    tray(.118,0,.009,.149,.009,pen)
    # Alternating facets give the clear water carafes and glasses a dark edge
    # and a narrow highlight without a second transparent rendering pass.
    for dx,dz,profile in [(-.24,-.09,[(0,.043),(.013,.048),(.16,.041),(.21,.022),(.265,.019),(.274,.024)]),
                          (-.35,-.04,[(0,.028),(.008,.032),(.089,.039),(.095,.038)])]:
        rings=[[p(dx+r*math.cos(i*math.tau/8),.758+h,dz+r*math.sin(i*math.tau/8)) for i in range(8)] for h,r in profile]
        for n,(a,b) in enumerate(zip(rings,rings[1:])):
            for i in range(8):
                j=(i+1)%8
                m.add([a[i],a[j],b[j],b[i]],[(0,1,2,3)],gleam if i==1 or n==len(rings)-2 else glass)
    m.finish()


num=0
for side in [-1,1]:
    yaw=side*math.pi/2
    for i in range(6):
        z=-2.60+i*1.05
        num+=1;chair(side*2.86,z,yaw,num);settings(side*2.21,z,yaw,num)
for i in range(4):
    x=(i-1.5)*.94
    num+=1;chair(x,-3.55,math.pi,num);settings(x,-2.91,math.pi,num)

m=Part('Rectangular cove · lowered perimeter and ceiling insert')
m.box(0,4.49,0,11.2,.065,19.5,ivory)
for x in [-4.75,4.75]:
    m.box(x,4.30,0,1.7,.19,19.5,ivory)
    m.box(x-math.copysign(.80,x),4.31,0,.105,.10,14.55,diffuser)
for z in [-8.37,8.37]:
    m.box(0,4.30,z,7.8,.19,2.76,ivory)
    m.box(0,4.32,z-math.copysign(1.33,z),7.87,.10,.09,diffuser)
m.finish()
m=Part('Segmented rectangular ceiling lantern · brushed warm metal')
for x in [-2.95,2.95]:
    m.box(x,4.056,0,1.14,.18,11.0,brass)
    for j in range(7):
        m.box(x,4.048,(j-3)*1.56,1.06,.012,1.51,diffuser)
for z in [-4.95,4.95]:
    m.box(0,4.055,z,4.78,.179,1.1,brass)
    for i in range(4):m.box((i-1.5)*1.19,4.047,z,1.155,.012,1.025,diffuser)
m.finish()

m=Part('Rose panelled presentation wall and retractable screen')
for i in range(4):
    x=-5.68+(i+.5)*1.55
    for j,(y,height) in enumerate([(0.09,2.63),(2.74,1.55)]):
        m.box(x,y,9.82,1.54,height,.076,oak)
m.box(-2.58,.055,9.85,6.20,.063,.126,seam)
m.box(-2.58,.08,9.89,6.20,4.30,.04,seam)
m.box(-2.51,1.12,9.74,4.07,2.57,.085,steel)
m.box(-2.51,1.163,9.682,3.97,2.48,.024,screen)
m.box(-2.51,3.684,9.735,4.18,.10,.13,ivory)
m.finish()

# The pictured sill and transoms read from inside. The game's adjacent salon
# remains separated by the original opaque partition. Reflect sky and foliage
# colours on the glass without opening a fictional view through the neighbour.
m=Part('Window wall · three recessed bays with bronze transoms')
x=-5.525
m.box(x-.052,0,0,.055,4.30,19.30,seam)
for center,width in [(-6.68,5.88),(-2.38,.85),(.61,1.10),(3.90,1.05),(7.65,3.52)]:
    m.box(x,.08,center,.10,4.20,width,oak)
for center,width in [(-3.25,.92),(-.91,1.83),(2.25,2.15),(5.17,1.47)]:
    m.box(x+.005,.075,center,.10,.63,width,oak)
    m.box(x+.01,3.68,center,.11,.56,width,oak)
    m.box(x-.012,.72,center,.03,2.96,width,bronze)
    for h,height,mat in [(.76,1.1,glaze_low),(1.86,.91,glaze),(2.83,.78,glaze_high)]:
        m.box(x+.026,h,center,.016,height,width-.075,mat)
    m.box(x+.045,2.765,center,.068,.072,width,bronze)
    m.box(x+.05,.69,center,.15,.055,width+.1,ivory)
m.finish()
m=Part('Wall panels · warm acoustic lining')
for i in range(10):
    for y,h in [(.08,2.65),(2.747,1.54)]:
        m.box(5.54,y,-8.68+i*1.93,.083,h,1.92,oak)
m.box(5.60,.05,0,.024,4.25,19.3,seam)
m.finish()
m=Part('Reflected perimeter light')
for side in [-1,1]:
    m.box(side*3.878,4.322,0,.082,.075,14.05,cove_glow)
    m.box(0,4.322,side*6.965,7.78,.075,.074,cove_glow)
m.finish()

# Griffin silhouette traced from the projected brand mark in the operator photograph.
outline = [(0,9),(7,2),(30,3),(32,18),(38,23),(47,11),(55,9),(83,15),
           (97,13),(104,10),(100,21),(83,35),(59,52),(63,68),(69,83),
           (70,66),(76,59),(83,58),(88,64),(82,68),(78,65),(73,71),
           (74,87),(68,99),(60,101),(26,101),(24,97),(33,94),(30,76),
           (24,68),(22,91),(18,99),(4,100),(3,96),(12,91),(11,67),
           (6,50),(9,31),(19,18),(17,11)]
m=Part('Projection · JW griffin silhouette')
m.add([(-2.51-((i/104)-.5)*.32,2.78+(.5-j/101)*.30,9.632) for i,j in outline],
      [tuple(range(len(outline)))],ink)
m.finish()

# Native vector text follows the two visible lines of the projection.
for body,cy,width,height in [('JW MARRIOTT',2.49,1.84,.22),('S E O U L',2.27,.55,.074)]:
    curve=bpy.data.curves.new(body,'FONT')
    curve.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Georgia Bold.ttf')
    curve.body=body;curve.resolution_u=2;curve.fill_mode='FRONT'
    text=bpy.data.objects.new(body,curve);coll.objects.link(text)
    bpy.ops.object.select_all(action='DESELECT')
    text.select_set(True);bpy.context.view_layer.objects.active=text;bpy.ops.object.convert(target='MESH')
    vertices=text.data.vertices;raw=[v.co.copy() for v in vertices]
    x0,x1=min(v.x for v in raw),max(v.x for v in raw);y0,y1=min(v.y for v in raw),max(v.y for v in raw)
    for vert,point in zip(vertices,raw):
        vert.co=(-2.51-((point.x-x0)/(x1-x0)-.5)*width,-9.636,cy+((point.y-y0)/(y1-y0)-.5)*height)
    text.data.materials.append(ink)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'salon-six.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'),run_name='__main__')
