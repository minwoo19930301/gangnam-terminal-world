"""Blender background authoring and export. See README for reproduction."""
import math
import random
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
from mathutils import Vector

sys.dont_write_bytecode=True
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from atlas import atlas, SWATCHES
from distant import make_proxy

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene['site']='Seoul Express Bus Terminal Gyeongbu 1F, between the ticket windows and the baggage counter'
scene['registration']='Origin u57, v29 in the existing public concourse. Surface sizes and colours interpreted from the photographs.'
scene['finish']='One packed original 1024x512 texture. Vertex-colour light bake includes wall washers, recess shadows and local floor contact.'
bpy.context.preferences.filepaths.save_version=0
source=bpy.data.collections.new('Editable public concourse finishes')
scene.collection.children.link(source)

def srgb(c):
    return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4

def uv_patch(swatch,x,y):
    if swatch==8:return ((2+.992)/4,(1+.992)/2)
    return ((swatch%4+.018+.964*x)/4,(swatch//4+.018+.964*y)/2)

class Part:
    def __init__(self,name):
        self.name=name
        self.vertices=[]
        self.faces=[]
        self.loops=[]

    def face(self,points,swatch,normal,shade=1.,uv=None):
        # Drawing coordinates are the u,v,height axes of the existing photo survey.
        positions=[Vector((u-57,29-v,h)) for u,v,h in points]
        normal3=Vector((normal[0],-normal[1],normal[2]))
        order=list(range(len(points)))
        if (positions[1]-positions[0]).cross(positions[2]-positions[0]).dot(normal3)<0:
            order.reverse()
        if uv is None:
            # Map the fixed finishes continuously in room coordinates. Restarting
            # an entire swatch on each narrow wall-wash patch caused moiré.
            nx,nv,nh=map(abs,normal)
            if nh>=max(nx,nv):
                uv=[(.04+.069*(u-50),.04+.06*(v-21)) for u,v,h in points]
            else:
                uv=[(.04+(.06*(v-21) if nx>=nv else .069*(u-50)),.04+.17*h) for u,v,h in points]
        first=len(self.vertices)
        self.vertices.extend(positions)
        self.faces.append([first+i for i in order])
        for i in order:
            light=shade(*points[i]) if callable(shade) else shade
            if isinstance(light,(int,float)):
                light=(light,light,light)
            self.loops.append((uv_patch(swatch,*uv[i]),tuple(srgb(max(0,min(1,c))) for c in light)+(1,)))

    def rect(self,a,b,c,d,h,swatch,shade=1.,down=False,uv=None):
        self.face([(a,b,h),(c,b,h),(c,d,h),(a,d,h)],swatch,(0,0,-1 if down else 1),shade,uv)

    def object(self,mat):
        mesh=bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.vertices,[],self.faces)
        mesh.materials.append(mat)
        mesh.uv_layers.new(name='Shared swatch atlas')
        mesh.color_attributes.new(name='Baked light',type='BYTE_COLOR',domain='CORNER')
        # Adding a corner attribute may reallocate Blender custom data.
        mesh.uv_layers['Shared swatch atlas'].uv.foreach_set('vector',[t for uv,_ in self.loops for t in uv])
        mesh.color_attributes['Baked light'].data.foreach_set('color',[c for _,light in self.loops for c in light])
        obj=bpy.data.objects.new(self.name,mesh)
        source.objects.link(obj)
        return obj

def material(image):
    mat=bpy.data.materials.new('Original mineral and plaster atlas · baked public lighting')
    mat.use_nodes=True
    nodes=mat.node_tree.nodes
    nodes.clear()
    texture=nodes.new('ShaderNodeTexImage')
    texture.image=image
    texture.location=(-600,140)
    colour=nodes.new('ShaderNodeVertexColor')
    colour.layer_name='Baked light'
    colour.location=(-600,-130)
    mix=nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1
    mix.location=(-285,45)
    shader=nodes.new('ShaderNodeEmission')
    # Match the prelit runtime atlas in both Eevee and Cycles.
    shader.location=(-10,45)
    out=nodes.new('ShaderNodeOutputMaterial')
    out.location=(200,45)
    for a,b in [(texture.outputs['Color'],mix.inputs[1]),(colour.outputs['Color'],mix.inputs[2]),
                (mix.outputs[0],shader.inputs['Color']),(shader.outputs[0],out.inputs['Surface'])]:
        mat.node_tree.links.new(a,b)
    return mat

def shade_floor(u,v,h):
    # Local contact of the real modelled objects: rounded information desk and
    # columns. Soft light spills out from the booth / lit coffer, never a black blob.
    desk=math.hypot(max(abs(u-56)-1.27,0),v-29)-.50
    col=math.hypot(u-53.5,v-34)-.45
    wall=math.hypot(max(52.77-u,0,u-52.80),max(30.4-v,0,v-35))
    bags=math.hypot(max(abs(u-52.1)-1.93,0),max(abs(v-28.7)-.55,0))
    dist=max(0,min(desk,col,wall,bags))
    light=.934-.26*math.exp(-dist/.38)+.027*math.exp(-((u-58.6)/2.2)**2-((v-30.2)/3.5)**2)
    return light*1.008,light*.999,light*.985

def tile_uv(rand):
    # Rotation and offset prevent a four-swatch repeat in the long lines of grout.
    width=rand.uniform(.62,.94)
    x=rand.uniform(0,1-width)
    y=rand.uniform(0,1-width)
    q=[(x,y),(x+width,y),(x+width,y+width),(x,y+width)]
    k=rand.randrange(4)
    return q[k:]+q[:k]

def stone_band(i,j):
    return ((1<=j<=3 and 1<=i<=7) or (j==6 and 3<=i<=12) or
            (13<=j<=15 and 2<=i<=12) or (j==18 and 9<=i<=17))

def stone_floor():
    p=Part('01 · Limestone grid, charcoal inserts and graphite joints')
    rand=random.Random(322)
    for j in range(23):
        for i in range(20):
            a,b=50.2+i*.6,21.9+j*.6
            c,d=a+.6,b+.6
            dark=stone_band(i,j)
            swatch=4 if dark else rand.randrange(4)
            tint=rand.uniform(.966,1.015)
            def light(u,v,h):
                return tuple(min(1,k*tint) for k in shade_floor(u,v,h))
            p.rect(a,b,c,d,.0605,7,.97)
            joint=.0021
            p.rect(a+joint,b+joint,c-joint,d-joint,.063,swatch,light,uv=tile_uv(rand))
    return p

def paving():
    p=Part('02 · Tactile tiles and raised linear bars')
    unit=.30
    tiles=[]
    for i in range(30):
        tiles.append((58.40,26.85+i*unit,'v'))
    for i in range(40):
        tiles.append((50.35+i*unit,26.85,'u'))
    for u,v,direction in tiles:
        if abs(u-58.40)<.15 and abs(v-26.85)<.04:
            continue
        p.rect(u-.149,v-.149,u+.149,v+.149,.067,5,(.81,.641,.352))
        for offset in [-.096,-.032,.032,.096]:
            a,b,c,d=(u-.127,v+offset-.011,u+.127,v+offset+.011) if direction=='u' else (u+offset-.011,v-.127,u+offset+.011,v+.127)
            p.rect(a-.002,b-.002,c+.002,d+.002,.068,5,(.63,.485,.25))
            p.rect(a,b,c,d,.073,5,(.90,.735,.412))
    p.rect(58.247,26.696,58.553,27.001,.069,5,(.81,.641,.352))
    for i in range(5):
        for j in range(5):
            cx,cy=58.28+i*.06,26.73+j*.06
            circle(p,cx,cy,.019,.077,5,(.91,.74,.43),False,10)
    return p

def circle(p,u,v,r,h,swatch,tone,down=False,n=20):
    for i in range(n):
        a,b=i*math.tau/n,(i+1)*math.tau/n
        p.face([(u,v,h),(u+r*math.cos(a),v+r*math.sin(a),h),(u+r*math.cos(b),v+r*math.sin(b),h)],
               swatch,(0,0,-1 if down else 1),tone)

def ring(p,u,v,r0,r1,h,swatch,tone,n=24):
    for i in range(n):
        a,b=i*math.tau/n,(i+1)*math.tau/n
        p.face([(u+r0*math.cos(a),v+r0*math.sin(a),h),(u+r1*math.cos(a),v+r1*math.sin(a),h),
                (u+r1*math.cos(b),v+r1*math.sin(b),h),(u+r0*math.cos(b),v+r0*math.sin(b),h)],swatch,(0,0,-1),tone)

def arc_edge(t):
    # The documented S-shaped lip, softened into two long tangent turns.
    return 58.0+1.73*math.sin(t*math.tau+.09)

def ceiling():
    p=Part('03 · Sculpted ceiling cove / continuous diffuser / return fascia')
    samples=60
    sections=[
        (None,0,4.61,5,(.823,.813,.804)),(-.61,0,4.61,5,(.91,.89,.86)),
        (-.20,0,4.61,5,(.95,.938,.915)),(-.13,0,4.61,7,(.50,.477,.442)),
        (-.108,0,4.61,6,(1,1,1)),(.050,0,4.61,6,(1,1,1)),
        (.095,0,4.72,6,(.97,.978,.989)),(.16,0,4.750,6,(.93,.929,.934)),
        (.49,0,4.757,6,(.95,.950,.953)),(.95,0,4.762,6,(.985,.984,.981)),(None,1,4.762,6,(.979,.978,.974))]
    for k in range(samples):
        va,vb=27+6*k/samples,27+6*(k+1)/samples
        def pos(s,v):
            off,side,h,swatch,tint=s
            return (62.0 if side else 54.0,v,h) if off is None else (arc_edge((v-27)/6)+off,v,h)
        for j in range(len(sections)-1):
            a,b=sections[j:j+2]
            # Each shared boundary has its own light level; the lip wall is
            # genuine geometry and gives a different silhouette in reverse.
            swatch=8 if j==4 else a[3]
            def level(u,v,h):
                if j==4:return (1,1,1)
                xa,xb=pos(a,v)[0],pos(b,v)[0]
                mix=max(0,min(1,(u-xa)/max(.0001,xb-xa)))
                return tuple(a[4][i]*(1-mix)+b[4][i]*mix for i in range(3))
            p.face([pos(a,va),pos(b,va),pos(b,vb),pos(a,vb)],swatch,(0,0,-1),level)
    # Plaster soffit faces toward the adjoining tall atrium; preserve its void.
    for i in range(28):
        a=54+i*8/28
        b=a+8/28
        y=4.61 if (a+b)/2<arc_edge(1) else 4.762
        p.face([(a,33,y),(b,33,y),(b,33,4.80),(a,33,4.80)],5,(0,1,0),(.83,.817,.79))
    return p

def fixtures():
    p=Part('04 · Recessed pin spots and concentric air diffuser blades')
    for u,v in [(54.62,27.55),(54.65,29.1),(54.71,30.68),(54.7,32.25),(56.1,27.65),(56.2,32.61),(57.58,31.6)]:
        ring(p,u,v,.052,.079,4.589,5,(.61,.59,.56),14)
        ring(p,u,v,.040,.052,4.587,6,(.91,.91,.89),14)
        circle(p,u,v,.040,4.588,8,(1,1,.98),True,14)
    for u,v in [(56.56,28.55),(55.45,31.92)]:
        ring(p,u,v,.168,.192,4.584,5,(.63,.62,.60))
        circle(p,u,v,.167,4.590,5,(.42,.415,.39),True)
        for radius in [.055,.085,.115,.144,.166]:
            ring(p,u,v,radius-.009,radius,4.581,5,(.78,.773,.751))
    return p

def wall_wash(point,lights):
    u,v,h=point
    reach=max(.035,3.22-h)
    glow=0.
    for x,z in lights:
        across=math.hypot(u-x,v-z)
        spread=.050+.305*reach
        glow+=math.exp(-(across/spread)**2.5)*.43/(1+.88*reach**1.45)
    base=.69-.11*math.exp(-max(0,h-.1)/.18)
    return min(1,base+glow),min(1,base+.94*glow),min(1,base+.80*glow)

def kiosk_skin():
    p=Part('05 · Existing return wall, rounded cladding, wall-washer bake, dark plinth')
    # Face the passenger aisle on the existing ticket-office partition. Wrap
    # around its end into the back of the baggage office, never across its window.
    path=[(52.782,34.90-i*(34.90-30.64)/68) for i in range(69)]
    for i in range(1,15):
        a=math.pi*i/28
        path.append((52.566+.216*math.cos(a),30.64-.216*math.sin(a)))
    path += [(52.566-i*.046,30.424) for i in range(1,31)]
    spots=[(52.783,v) for v in [30.82,31.75,32.69,33.63,34.56]]
    spots.extend([(52.22,30.424),(51.39,30.424)])
    rows=[.066,.13,.15,.175,.202,.27,.36,.50,.70,.95,1.2,1.48,1.72,1.99,2.22,2.43,2.62,2.78,2.91,3.02,3.10,3.16,3.20,3.218,3.24]
    for a,b in zip(path,path[1:]):
        normal=(a[1]-b[1],b[0]-a[0],0)
        for low,high in zip(rows,rows[1:]):
            swatch,tone=(7,(.38,.379,.372)) if low<.13 else (7,(.69,.68,.65)) if low<.15 else (6,lambda u,v,h:wall_wash((u,v,h),spots))
            if low>=3.218:swatch,tone=7,(.44,.438,.42)
            p.face([(*a,low),(*b,low),(*b,high),(*a,high)],swatch,normal,tone)
    return p

def column():
    p=Part('06 · Atrium column with satin kick collar and vertical joint')
    u,v=53.5,34.
    for h0,h1,r,swatch in [(0.066,.137,.465,7),(.137,.159,.468,7),(.159,.33,.458,7),(.33,.341,.459,7),(.341,3.57,.454,6)]:
        for i in range(40):
            t0,t1=i*math.tau/40,(i+1)*math.tau/40
            def pt(t,h):return (u+r*math.cos(t),v+r*math.sin(t),h)
            def light(x,z,h):
                angle=math.atan2(z-v,x-u)
                diffuse=.87+.085*math.cos(angle+.47)
                if swatch==7:
                    diffuse=.44+.37*math.cos(angle+.7)**6+.12*math.sin(angle*2-.4)**2
                    if h0==.137:diffuse=min(1,diffuse+.14)
                if i==18:diffuse*=.94
                return diffuse,diffuse*.998,diffuse*.991
            p.face([pt(t0,h0),pt(t1,h0),pt(t1,h1),pt(t0,h1)],swatch,(math.cos(t0),math.sin(t0),0),light)
    return p

def kiosk_portal():
    p=Part('07 · Rounded refund-kiosk surround, recessed graphite lining and washed return')
    stations=[(54.28,27.702),(54.34,27.702),(54.40,27.702)]
    for i in range(1,15):
        a=-math.pi/2+i*math.pi/28
        stations.append((54.40+.232*math.cos(a),27.934+.232*math.sin(a)))
    stations += [(54.632,27.934+i*(30.034-27.934)/47) for i in range(1,48)]
    for i in range(1,11):
        a=i*math.pi/20
        stations.append((54.449+.183*math.cos(a),30.034+.183*math.sin(a)))
    stations += [(54.40,30.217),(54.28,30.217)]
    lights=[(54.52,27.706),(54.632,28.1),(54.632,28.8),(54.632,29.48),(54.632,30.06)]
    levels=[.064,.128,.150,.177,.235,.44,.70,.98,1.28,1.58,1.86,2.03,2.12,2.21,2.29,2.42,2.55,2.68,2.80,2.91,3.02,3.10,3.17,3.21,3.23,3.29,3.31]
    for a,b in zip(stations,stations[1:]):
        n=(b[1]-a[1],a[0]-b[0],0)
        for low,high in zip(levels,levels[1:]):
            in_recess=28.015<(a[1]+b[1])/2<29.95 and low<2.12 and a[0]>54.61
            if in_recess:swatch,light=7,(.32,.333,.34)
            elif low<.128:swatch,light=7,(.35,.35,.35)
            elif low<.15:swatch,light=7,(.67,.68,.67)
            elif 3.21<=low<3.23:swatch,light=7,(.50,.49,.47)
            else:swatch,light=6,lambda u,v,h:wall_wash((u,v,h),lights)
            p.face([(*a,low),(*b,low),(*b,high),(*a,high)],swatch,n,light)
    # The original installed machines remain accessible in the aisle.
    # The small overhead head returns make their row read as an alcove.
    for i in range(37):
        v0=27.87+i*.061
        v1=v0+.061
        def width(v):
            return .055+.235*min(1,max(0,(v-27.87)/.28),max(0,(30.127-v)/.28))
        a,b=54.632+width(v0),54.632+width(v1)
        p.face([(54.631,v0,2.165),(a,v0,2.165),(b,v1,2.165),(54.631,v1,2.165)],5,(0,0,-1),(.72,.717,.697))
        p.face([(a,v0,2.165),(b,v1,2.165),(b,v1,2.295),(a,v0,2.295)],6,(1,0,0),(.90,.889,.87))
        p.face([(a,v0,2.295),(b,v1,2.295),(54.632,v1,2.43),(54.632,v0,2.43)],5,(1,0,1),(.94,.934,.91))
    for v in [28.4,28.8,29.2,29.6]:
        circle(p,54.80,v,.033,2.153,8,(1,1,.97),True,12)
    return p

def information_desk():
    p=Part('08 · Solid-surface information island, bonded rim and recessed-looking kick plate')
    def perimeter(r):
        pts=[]
        for centre,sign in [(57.3,1),(54.7,-1)]:
            start=-math.pi/2 if sign>0 else math.pi/2
            for i in range(25):
                a=start+i*math.pi/24
                pts.append((centre+r*math.cos(a),29+r*math.sin(a)))
        return pts
    rows=[(.064,.509,7,.47),(.128,.509,7,.67),(.141,.510,7,.78),(.150,.511,6,.81),
          (.175,.512,6,.83),(.975,.512,6,.90),(1.003,.513,5,.74),(1.011,.517,6,.94),(1.049,.519,6,.965),(1.066,.510,6,.94)]
    for lo,hi in zip(rows,rows[1:]):
        a,b=perimeter(lo[1]),perimeter(hi[1])
        for i in range(len(a)):
            j=(i+1)%len(a)
            nx,nz=a[j][1]-a[i][1],a[i][0]-a[j][0]
            length=math.hypot(nx,nz)
            nx,nz=nx/length,nz/length
            factor=.92+.07*nx-.025*nz
            def light(x,z,h):
                t=lo[3] if h==lo[0] else hi[3]
                k=t*factor
                return k,k*.998,k*.985
            p.face([(*a[i],lo[0]),(*a[j],lo[0]),(*b[j],hi[0]),(*b[i],hi[0])],lo[2],(nx,nz,0),light)
    outline=perimeter(.510)
    for i,a in enumerate(outline):
        b=outline[(i+1)%len(outline)]
        p.face([(56,29,1.066),(*a,1.066),(*b,1.066)],6,(0,0,1),(.935,.933,.918))
    return p

def entry_soffit():
    p=Part('09 · Low entrance soffit and rounded luminous ceiling panel')
    def edge(u):
        return 24.98+1.13*math.exp(-((u-58.80)/2.25)**4)
    sections=[('front',3.272,6,.975),(-.31,3.272,6,.976),(-.12,3.267,6,.96),
              (-.044,3.228,6,.93),(.005,3.177,8,1),(.117,3.177,6,1),
              (.130,3.175,7,.57),(.147,3.175,5,.83),(.35,3.175,5,.858),('back',3.175,5,.886)]
    for i in range(56):
        a,b=54+i*8/56,54+(i+1)*8/56
        def pos(u,section):
            k,h,_,_=section
            return (u,23.04 if k=='front' else 26.998 if k=='back' else edge(u)+k,h)
        for k, (lo,hi) in enumerate(zip(sections,sections[1:])):
            def tint(u,v,h):
                av,bv=pos(u,lo)[1],pos(u,hi)[1]
                t=max(0,min(1,(v-av)/(bv-av)))
                light=lo[3]*(1-t)+hi[3]*t
                return light,light*.997,light*.99
            p.face([pos(a,lo),pos(b,lo),pos(b,hi),pos(a,hi)],lo[2],(0,0,-1),tint)
        p.face([(a,26.998,3.175),(b,26.998,3.175),(b,26.998,3.30),(a,26.998,3.30)],5,(0,1,0),(.82,.81,.78))
    for u,v in [(54.61,26.4),(56.05,26.49),(57.51,26.66),(60.65,26.60),(61.51,26.13)]:
        ring(p,u,v,.039,.056,3.165,5,(.67,.64,.61),12)
        circle(p,u,v,.038,3.166,8,(1,1,.98),True,12)
    ring(p,60.4,26.46,.110,.136,3.158,5,(.64,.63,.60),22)
    circle(p,60.4,26.46,.109,3.162,5,(.40,.40,.38),True,22)
    for r in [.044,.069,.091,.110]:
        ring(p,60.4,26.46,r-.006,r,3.154,5,(.81,.80,.779),22)
    return p

def return_soffit():
    p=Part('10 · Continuous low bulkhead over the rounded kiosk and washer apertures')
    # Carry the lower entrance ceiling above the wall return, stopping in
    # advance of the documented high nave. The main 8 m aisle stays open.
    rim=[(52.26,26.87),(54.51,26.87)]
    for i in range(1,21):
        a=-math.pi/2+i*math.pi/40
        rim.append((54.51+.54*math.cos(a),27.41+.54*math.sin(a)))
    rim += [(55.05,30.06)]
    for i in range(1,21):
        a=i*math.pi/40
        rim.append((54.51+.54*math.cos(a),30.06+.54*math.sin(a)))
    rim += [(53.43,30.60),(53.43,32.97),(52.26,32.97)]
    # Use triangle fan in the projecting convex section and one rectangular
    # strip for the rear return; no face spans the re-entrant corner.
    convex=rim[:43]+[(52.26,30.60)]
    for i,a in enumerate(convex):
        b=convex[(i+1)%len(convex)]
        p.face([(53.65,29.03,3.314),(*a,3.314),(*b,3.314)],5,(0,0,-1),(.925,.916,.888))
    p.rect(52.26,30.60,53.43,32.97,3.314,5,(.925,.916,.888),down=True)
    for i,a in enumerate(rim):
        b=rim[(i+1)%len(rim)]
        n=(b[1]-a[1],a[0]-b[0],0)
        p.face([(*a,3.314),(*b,3.314),(*b,3.332),(*a,3.332)],6,n,(.925,.912,.88))
        p.face([(*a,3.332),(*b,3.332),(*b,3.354),(*a,3.354)],7,n,(.53,.525,.51))
        p.face([(*a,3.354),(*b,3.354),(*b,3.512),(*a,3.512)],5,n,(.86,.854,.833))
    for u,v in [(54.50,27.53),(54.86,28.10),(54.86,28.80),(54.86,29.48),(54.84,30.06),
                (53.04,30.84),(53.04,31.75),(53.04,32.69)]:
        ring(p,u,v,.035,.054,3.306,5,(.59,.585,.566),12)
        circle(p,u,v,.034,3.307,8,(1,1,.973),True,12)
    return p

def export(joined,material,staging):
    bpy.ops.object.select_all(action='DESELECT')
    for obj in joined:obj.select_set(True)
    bpy.context.view_layer.objects.active=joined[0]
    bpy.ops.object.join()
    obj=joined[0]
    obj.name='PassengerHallFinish'
    # Export material references straightforwardly so the one atlas retains
    # TEXCOORD_0, and export the vertex light independently as COLOR_0.
    tree=material.node_tree
    tree.nodes.clear()
    tex=tree.nodes.new('ShaderNodeTexImage')
    tex.image=bpy.data.images['Public concourse · original swatch atlas']
    surf=tree.nodes.new('ShaderNodeBsdfPrincipled')
    surf.inputs['Roughness'].default_value=.67
    out=tree.nodes.new('ShaderNodeOutputMaterial')
    tree.links.new(tex.outputs['Color'],surf.inputs['Base Color'])
    tree.links.new(surf.outputs[0],out.inputs['Surface'])
    bpy.ops.export_scene.gltf(filepath=str(staging),export_format='GLB',use_selection=True,export_texcoords=True,
                              export_materials='EXPORT',export_vertex_color='ACTIVE',export_all_vertex_colors=False,
                              export_image_format='WEBP',export_image_quality=85,export_cameras=False,export_lights=False,
                              export_yup=True,export_normals=False,export_animations=False)

with TemporaryDirectory(prefix='gyeongbu-hall-') as tmp:
    texture=Path(tmp)/'surfaces.png'
    atlas(texture)
    image=bpy.data.images.load(str(texture))
    image.name='Public concourse · original swatch atlas'
    image.pack()
    image.filepath='//surfaces.png'
    mat=material(image)
    groups=[stone_floor(),paving(),ceiling(),fixtures(),kiosk_skin(),column(),kiosk_portal(),information_desk(),entry_soffit(),return_soffit()]
    objects=[group.object(mat) for group in groups]
    proxy=make_proxy(Part,arc_edge,SWATCHES,srgb,HERE).object(mat)
    far=bpy.data.collections.new('Distant · texture-free silhouette')
    scene.collection.children.link(far)
    source.objects.unlink(proxy)
    far.objects.link(proxy)
    far.hide_viewport=True
    far.hide_render=True
    scene.view_settings.view_transform='Standard'
    camera=bpy.data.objects.new('Passenger eye · ticket hall approach',bpy.data.cameras.new('Walkthrough 24mm equivalent'))
    scene.collection.objects.link(camera)
    camera.location=(3.20,3.20,1.62)
    camera.rotation_euler=(Vector((-1.35,-5.6,2.29))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens=24
    scene.camera=camera
    for window in bpy.context.screen.areas:
        if window.type=='VIEW_3D':
            window.spaces.active.region_3d.view_perspective='CAMERA'
            window.spaces.active.shading.type='MATERIAL'
            window.spaces.active.shading.color_type='TEXTURE'
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'concourse-finish.blend'),compress=True)
    export(objects,mat,HERE/'concourse-finish.glb')
