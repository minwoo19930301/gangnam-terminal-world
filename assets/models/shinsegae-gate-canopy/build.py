"""Build the brushed frames and quarter-elliptical glazed hood over Gangnam Gate 1."""
import bpy
from math import cos, sin, pi
from pathlib import Path

ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
collection = bpy.data.collections.new("GangnamNorthGateCanopy")
bpy.context.scene.collection.children.link(collection)
collection["export_model"]="gate-canopy"
collection["preview_origin"]=(0,0,0)
materials = {}


def colour(name, rgb):
    key = (name, rgb)
    if key not in materials:
        mat = bpy.data.materials.new(name+" %02x%02x%02x"%rgb)
        mat.diffuse_color=(*[v/255/12.92 if v<=10 else ((v/255+.055)/1.055)**2.4 for v in rgb],1)
        if name=="Laminated glass":
            mat["skylight"]=True  # Exporter tags glass with zero vertex alpha.
        materials[key]=mat
    return materials[key]


def object_mesh(name, verts, faces, palette):
    data=bpy.data.meshes.new(name)
    data.from_pydata([(x,-z,y) for x,y,z in verts],[],faces)
    data.update()
    for mat in dict.fromkeys(palette):
        data.materials.append(mat)
    slots={mat.name:i for i,mat in enumerate(data.materials)}
    for face,mat in zip(data.polygons,palette):
        face.material_index=slots[mat.name]
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    return obj


# Local z points towards the recessed curtain wall. The outer lip is the origin.
widths=[-10.4,-8.58,-5.15,-1.72,1.72,5.15,8.58,10.4]
steps=16


def surface(x,t,offset=0):
    a=t*pi/2
    # Offset along the outward normal of the depthwise elliptical section.
    ny,nz=8.45*cos(a),-5.85*sin(a)
    length=(ny*ny+nz*nz)**.5
    return (x,5.55+5.85*cos(a)+offset*ny/length,8.45*(1-sin(a))+offset*nz/length)


def glass_color(column,t,underside):
    stops=[(0,(107,129,143)),(.25,(92,116,128)),(.47,(132,159,173)),
           (.58,(169,189,197)),(.72,(130,159,175)),(1,(161,185,196))]
    for (a,ca),(b,cb) in zip(stops,stops[1:]):
        if t<=b:
            mix=(t-a)/(b-a)
            tone=[ca[k]*(1-mix)+cb[k]*mix for k in range(3)]
            break
    factor=(.83 if column in (0,6) else 1.+[0,-.016,.013,-.007,.02,-.01,0][column])*(.87 if underside else 1.)
    edge=column in (0,6)
    mat=colour("Smoke edge glass" if edge else "Laminated glass",tuple(min(255,round(c*factor)) for c in tone))
    if edge:
        mat.diffuse_color[3]=.48
    return mat


for below in (False,True):
    verts=[surface(x,i/steps,-.09 if below else 0) for i in range(steps+1) for x in widths]
    faces=[]; palette=[]
    for i in range(steps):
        for j in range(len(widths)-1):
            k=i*len(widths)+j
            quad=[k,k+1,k+len(widths)+1,k+len(widths)]
            faces.append(quad[::-1] if below else quad)
            palette.append(glass_color(j,(i+.5)/steps,below))
    obj=object_mesh("Glazing · soffit" if below else "Glazing · outer skin",verts,faces,palette)
    if not below:
        obj["canopy_columns"]=len(widths)
        obj["canopy_steps"]=steps

metal=colour("Brushed aluminium",(188,199,202))
bright=colour("Edge highlight",(225,233,234))
dark=colour("Glazing rebate",(67,80,84))
sill=colour("Soffit channel",(89,102,106))


def longitudinal(name,x,width,top,bottom):
    verts=[]
    for i in range(steps+1):
        t=i/steps
        verts.extend([surface(x-width/2,t,top),surface(x+width/2,t,top),
                      surface(x+width/2,t,bottom),surface(x-width/2,t,bottom)])
    faces=[];palette=[]
    for i in range(steps):
        for j,mat in enumerate([bright,metal,sill,dark]):
            k=i*4; n=(j+1)%4
            faces.append((k+j,k+n,k+4+n,k+4+j))
            palette.append(mat)
    for k in (0,steps*4):
        faces.append(tuple(k+j for j in range(4)));palette.append(metal)
    object_mesh(name,verts,faces,palette)


for j,x in enumerate(widths):
    end=j in (0, len(widths)-1)
    longitudinal("Rolled side channel" if end else "Longitudinal glazing bar",x,.20 if end else .10,
                 .047 if end else .025,-.22 if end else -.155)


def transom(name,t,half_span,top,bottom):
    verts=[]
    for x in (widths[0]-.045,widths[-1]+.045):
        for tt,depth in [(max(0,t-half_span),top),(min(1,t+half_span),top),
                         (min(1,t+half_span),bottom),(max(0,t-half_span),bottom)]:
            verts.append(surface(x,tt,depth))
    faces=[(j,(j+1)%4,4+(j+1)%4,4+j) for j in range(4)]
    object_mesh(name,verts,faces+[(0,1,2,3),(4,5,6,7)],[metal,bright,sill,dark,dark,dark])


for t in (0,.25,.5,.75,1):
    transom("Leading edge flashing" if t==1 else "Transverse glazing joint",t,.011 if t==1 else .003,
            .052 if t==1 else .028,-.19 if t in (0,1) else -.125)
# Fixed, dark sidelights beneath the hood, outside the existing pair of open doors.
def fixed_face(name,x0,x1,y0,y1,z,mat):
    return object_mesh(name,[(x0,y0,z),(x0,y1,z),(x1,y1,z),(x1,y0,z)],[(0,1,2,3)],[mat])

door_bar=colour("Bronze glazing rail",(74,68,58))
plinth=colour("Sill stone",(66,64,58))
for x0,x1,panes in [(-10.30,-3.84,4),(6.04,10.28,3)]:
    for i in range(panes):
        a=x0+(x1-x0)*i/panes
        b=x0+(x1-x0)*(i+1)/panes
        for band,(y0,y1,rgb) in enumerate([(-.25,2.74,(53,55,54)),(2.74,3.62,(66,67,63)),(3.62,5.7,(83,77,63))]):
            tone=tuple(c+(i%3-1)*3 for c in rgb)
            mat=colour("Sidelight reflected glass",tone)
            mat.diffuse_color[3]=.78
            fixed_face("Fixed sidelight pane",a,b,y0,y1,.35,mat)
        fixed_face("Sidelight mullion",a-.028,a+.028,-.25,5.7,.31,door_bar)
    for y in (2.74,3.62,5.68):
        fixed_face("Sidelight transom",x0,x1,y-.035,y+.035,.295,door_bar)
    fixed_face("Sidelight sill",x0,x1,-.35,.24,.30,plinth)

# The public forecourt slopes across the canopy. These native supports match
# the two terrain-following cylinders which also supply the game collision.
supports = bpy.data.collections.new("GangnamNorthGateSupports")
bpy.context.scene.collection.children.link(supports)
steel = colour("Brushed entrance post", (121, 131, 132))
for side, foot in [(-1, 0.08379735), (1, -0.05106440)]:
    top = 5.61
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=.17, depth=top-foot,
        location=(side*9.62, -.08, (top+foot)/2))
    post = bpy.context.object
    post.name = "정문 캐노피 · 보도 기둥"
    post.data.materials.append(steel)
    for link in list(post.users_collection):
        link.objects.unlink(post)
    supports.objects.link(post)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"north-gate.blend"),compress=True)
