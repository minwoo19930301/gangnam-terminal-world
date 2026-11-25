"""Create the public architectural details and export the editable scene."""
from pathlib import Path
from math import sin, cos, pi
import bpy
import runpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name,hexval):
    out=bpy.data.materials.new(name)
    components=[((hexval>>s)&255)/255 for s in [16,8,0]]
    out.diffuse_color=[n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4 for n in components]+[1]
    return out

def collection(name,origin,bundle):
    global group,offset
    group=bpy.data.collections.new(name)
    group['origin']=origin;group['bundle']=bundle
    bpy.context.scene.collection.children.link(group)
    offset=Vector(origin)

def mesh(name,verts,faces,material):
    data=bpy.data.meshes.new(name)
    data.from_pydata(verts,[],faces);data.update()
    obj=bpy.data.objects.new(name,data);group.objects.link(obj);obj.location=offset.copy()
    obj.data.materials.append(material)
    return obj

def box(name,xyz,size,m,bevel=0):
    x,y,z=xyz;a,b,c=[s*.5 for s in size]
    verts=[(x+i*a,y+j*b,z+k*c) for k in [-1,1] for j in [-1,1] for i in [-1,1]]
    faces=[(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)]
    o=mesh(name,verts,faces,m)
    if bevel:
        mod=o.modifiers.new('Rounded edge','BEVEL');mod.width=bevel;mod.segments=3
    return o

def closed_strip(name,rings,m):
    n=len(rings[0]);faces=[]
    for i in range(len(rings)-1):
        for j in range(n):
            jj=(j+1)%n;faces.append((i*n+j,i*n+jj,(i+1)*n+jj,(i+1)*n+j))
    faces.extend([tuple(reversed(range(n))),tuple((len(rings)-1)*n+j for j in range(n))])
    # Recalculate with bmesh; the profile sweep may be right- or left-handed.
    obj=mesh(name,[p for ring in rings for p in ring],faces,m)
    import bmesh
    bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(obj.data);bm.free()
    return obj

timber=[mat('Walnut '+str(i),v) for i,v in enumerate([0x844d31,0x79442d,0x865238,0x7e4b32,0x895339])]
grain=mat('Quarter-sawn grain',0x77432c);reveal=mat('Dark joint',0x4a342b);brass=mat('Bronze toe',0x756650)
collection('RectoWall',(0,0,0),'shinsegae-walls')
# Broad camera-visible curves and vertical veneers follow the archival fit-out.
# Individual board spacing, milling and joints are model-scale approximations.
def front(x):return .065+.38*sin(2*pi*(x+4)/8)**2
def veneer(name,a,b,z0,z1,m,depth=.050,offset_y=0):
    rings=[]
    for i in range(5):
        x=a+(b-a)*i/4;f=front(x)+offset_y
        rings.append([(x,f,z0),(x,f,z1),(x,f-depth,z1),(x,f-depth,z0)])
    return closed_strip(name,rings,m)
for j in range(24):
    a=-4+j/3
    veneer('Book-matched curved veneer',a+.006,a+1/3-.006,.11,3.0,timber[j%5])
    veneer('Vertical board joint',a-.005,a+.005,.11,3.0,reveal,.015,-.008)
    for start in [.11,.22]:
        veneer('Natural fine-grain ribbon',a+start,a+start+.0045,.13,2.97,grain,.002,.0015)
veneer('Inset bronze toe kick',-4,4,.012,.094,brass,.028,-.025)
for j in range(8):
    veneer('Lower curved rail',j-4,j-3,.083,.117,timber[1],.058)
    veneer('Crown return',j-4,j-3,2.979,3.06,timber[2],.10,.005)

collection('CaseGallery',(0,9,0),'shinsegae-walls')
# Archive branch photographs show broad timber panels and aluminium display fittings.
# The three bays retain the project's existing span, case arrangement and sill height.
maple=[mat('Oiled oak '+str(i),v) for i,v in enumerate([0xc9aa88,0xd4b795,0xcdb090])]
metal=mat('Brushed aluminium edge',0xaba598); recess=mat('Satin display backing',0xd8c9b7)
seal=mat('Recess shadow',0x766b5f);light=mat('Warm linear diffuser',0xffe9bb)
for i in range(15):
    x=-3.5+(i+.5)*7/15
    box('Book-matched wall panel',(x,0,1.468),(7/15-.006,.106,2.79),maple[i%3])
box('Bronze wordmark fascia',(0,.102,2.463),(6.94,.084,.565),seal,.015)
box('Inset head trim',(0,.145,2.749),(6.93,.021,.025),metal,.005)
for i in range(3):
    x=-3.5+(i+.5)*7/3
    box('Raised oak display plinth',(x,.47,.175),(2.185,.81,.23),maple[1],.018)
    box('Recessed metal kickplate',(x,.855,.103),(2.16,.030,.073),metal,.003)
    box('Inset satin case backing',(x,.126,1.211),(2.095,.088,1.847),recess,.009)
    for sign in [-1,1]:
        xx=x+sign*1.066
        box('Aluminium reveal',(xx,.137,1.20),(.042,.146,1.84),metal,.007)
        box('Edge shadow',(xx+sign*.030,.121,1.20),(.015,.048,1.84),seal)
    box('Brushed-metal canopy',(x,.245,2.10),(2.16,.423,.088),metal,.019)
    box('Warm diffuser in canopy',(x,.410,2.054),(2.055,.045,.016),light,.003)

collection('NewcoreArch',(13,0,0),'newcore-arch')
stone=[mat('Limestone '+str(i),v) for i,v in enumerate([0xd9cbb1,0xdfd1b9,0xe4d8c0])]
edge=mat('Cream moulding',0xe9ddc8);shade=mat('Recessed stone',0xb2a58d)
steel=mat('Glazing stop',0x545b55);keystone=mat('Crown stone',0xe6d9bc)
# Radius 3 m, +Y faces the pedestrian; actual width is fitted to each existing bay.
def arch(name,lo,hi,profile,m,steps):
    rings=[]
    for i in range(steps+1):
        a=lo+(hi-lo)*i/steps
        rings.append([(cos(a)*(3+r),y,sin(a)*(3+r)) for r,y in profile])
    return closed_strip(name,rings,m)
arch('Splayed inner window stop',0,pi,[(-.025,.04),(.005,.17),(.06,.14),(.065,0)],steel,48)
arch('Continuous shadow reveal',0,pi,[(.06,0),(.07,.22),(.15,.24),(.185,.12),(.18,.02)],shade,48)
for i in range(21):
    a=i*pi/21;b=(i+1)*pi/21
    profile=[(.13,.11),(.15,.25),(.22,.30),(.41,.30),(.45,.19),(.44,.06)]
    arch('Radial cut limestone',a+.0024,b-.0024,profile,stone[i%3],4)
arch('Outer stepped moulding',0,pi,[(.435,.08),(.455,.27),(.47,.315),(.49,.33),(.53,.322),(.56,.287),(.59,.20),(.605,.09)],edge,64)
arch('Crown keystone',pi/2-.059,pi/2+.059,[(.125,.20),(.14,.355),(.235,.405),(.53,.38),(.64,.30),(.62,.075)],keystone,7)
for s in [-1,1]:
    box('Springing cap',(s*3.26,.15,-.065),(.69,.38,.13),edge,.018)
    box('Impost shadow line',(s*3.26,.11,-.154),(.68,.31,.043),shade,.008)

collection('BoutiqueWindow',(14,8,0),'newcore-arch')
alloy=mat('Black anodized aluminium',0x373c3b)
bronze=mat('Warm brushed threshold',0x837c6a)
backing=mat('Linen display backing',0xbeb5a6)
plaster=mat('Warm plaster',0xe3dbca)
# The existing fashion concessions retain an open centre. Two fixed side
# vitrines, symmetrical in the reconstruction, face the shared retail aisle.
for side in [-1,1]:
    centre=side*2.64
    box('Recessed back panel',(centre,.48,1.34),(1.60,.06,2.40),backing)
    for x in [centre-.825,centre+.825]:
        box('Anodized display post',(x,.17,1.33),(.085,.56,2.59),alloy,.012)
        box('Glazing bead',(x,-.12,1.35),(.023,.036,2.46),bronze,.004)
    box('Stone display sill',(centre,.20,.17),(1.76,.61,.26),plaster,.026)
    box('Metal sole trim',(centre,-.105,.11),(1.74,.029,.068),bronze)
    box('Display soffit',(centre,.20,2.56),(1.75,.60,.14),alloy,.014)
    for x in [centre-.4,centre+.4]:
        box('Window pin light',(x,.06,2.48),(.17,.10,.022),edge,.009)
    box('Display pedestal',(centre,.26,.45),(.70,.33,.35),plaster,.015)
    if side<0:
        cloth=mat('Ink linen',0x494746); neck=mat('Natural display form',0xc5a989)
        box('Bust riser',(centre,.26,.81),(.042,.042,.46),bronze)
        # A plain linen torso on a stand, with a tapered waist and shoulder seam.
        rings=[]
        for height,width,depth in [(.88,.21,.085),(1.06,.17,.075),(1.34,.27,.115),(1.48,.31,.080),(1.55,.087,.065)]:
            rings.append([(centre+width*cos(i*pi/6),.28+depth*sin(i*pi/6),height) for i in range(12)])
        closed_strip('Linen torso silhouette',rings,cloth)
        box('Neck cap',(centre,.27,1.59),(.13,.10,.13),neck,.035)
    else:
        bag=mat('Cognac leather',0x8f5b39)
        box('Leather display tote',(centre,.19,.825),(.56,.20,.39),bag,.040)
        for dx in [-.126,.126]:
            box('Loop attachment',(centre+dx,.115,1.064),(.032,.037,.168),bag,.008)
        box('Top handle',(centre,.115,1.145),(.28,.038,.037),bag,.012)
        box('Small clasp',(centre,.081,.90),(.064,.012,.037),bronze,.005)
box('Continuous shop transom',(0,.08,2.72),(7.0,.31,.20),alloy,.018)
box('Narrow cap moulding',(0,-.086,2.81),(7.03,.041,.030),bronze,.008)

graphite=mat('Graphite fabric',0x464948);darkcloth=mat('Graphite piping',0x323534)
orange=mat('Tangerine upholstery',0xdc742f);piping=mat('Tangerine piping',0xb7612b)
for i,(name,cloth,seam) in enumerate([('HallSeatOrange',orange,piping),('HallSeatCharcoal',graphite,darkcloth)]):
    collection(name,(24+i*7,0,0),'terminal-seating')
    # Project seat envelope and headroom are preserved by the place module.
    for x in [-2.05,0,2.05]:
        box('Recessed pedestal',(x,0,.145),(.34,.64,.28),graphite,.05)
    box('Upholstered underframe',(0,0,.30),(5.70,.90,.21),seam,.09)
    for n in range(4):
        x=-2.10+n*1.40
        box('Seat cushion',(x,0,.465),(1.386,.98,.175),cloth,.080)
        # Upholstered back is slightly raked and inset above the continuous dark plinth.
        rings=[]
        for xx in [x-.68,x-.59,x+.59,x+.68]:
            end=abs(xx-x)>.64;low=.48;top=.805 if end else .865
            rings.append([(xx,-.31,low),(xx,-.353,top-.045),(xx,-.396,top),(xx,-.50,top-.012),
                          (xx,-.535,top-.055),(xx,-.47,low+.012)])
        closed_strip('Upholstered back bolster',rings,cloth)
        box('Back cushion piping',(x,-.394,.842),(1.13,.018,.018),seam,.007)
    for s in [-1,1]:
        box('Rounded upholstered end',(s*2.79,-.010,.39),(.20,.89,.30),cloth,.085)

bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'retail-architecture.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'))
