"""Blue number-three Velocita Lorenzo display car, modelled in published millimetres."""
from math import cos,sin,pi,sqrt
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import bpy
import print_surfaces as sheet

def make(origin,part,materials):
    org=Vector(origin)
    def pos(v):return org+Vector(v)*.001
    def piece(name,verts,faces,col,smooth=False):
        obj=part(name,[pos(v) for v in verts],faces,col);obj['modelPart']='Velocita Lorenzo'
        if smooth:
            for p in obj.data.polygons:p.use_smooth=True
        return obj
    def sweep(name,rows,col,smooth=True,cap=True):
        n=len(rows[0]);nf=len(rows)
        faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(nf-1) for i in range(n)]
        if cap:faces.extend([tuple(range(n-1,-1,-1)),tuple(range((nf-1)*n,nf*n))])
        return piece(name,[p for row in rows for p in row],faces,col,smooth)
    def slab(name,outline,z0,z1,col,lip=.10):
        cx=sum(x for x,y in outline)/len(outline);cy=sum(y for x,y in outline)/len(outline)
        rows=[]
        for z,s in [(z0,.985),(z0+lip,1),(z1-lip,1),(z1,.985)]:
            rows.append([(cx+(x-cx)*s,cy+(y-cy)*s,z) for x,y in outline])
        return sweep(name,rows,col)
    def loft(name,sections,col,power=.63):
        rows=[]
        for x,half,low,high in sections:
            cy=(low+high)*.5;rz=(high-low)*.5
            rows.append([(x,half*(1 if cos(a)>=0 else -1)*abs(cos(a))**power,
                          cy+rz*(1 if sin(a)>=0 else -1)*abs(sin(a))**power)
                         for a in [2*pi*i/32 for i in range(32)]])
        return sweep(name,rows,col)
    def box_patch(name,c,right,up,w,h,key):
        o=sheet.board(name,pos(c),right,up,w*.001,h*.001,key,part);o['modelPart']='Velocita Lorenzo';return o
    def circular_patch(name,c,r,right,up,key,col='print',segments=56):
        c=Vector(c);a=Vector(right).normalized();b=Vector(up).normalized()
        angles=[2*pi*i/segments for i in range(segments)]
        plane=[c+a*(cos(t)*r)+b*(sin(t)*r) for t in angles]
        obj=piece(name,plane,[tuple(range(segments))],col)
        sheet.unwrap(obj,key,[(.5+.5*cos(t),.5+.5*sin(t)) for t in angles])
    def tube_y(name,x,z,rows,col):
        return sweep(name,[[(x+r*cos(i*pi/32),y,z+r*sin(i*pi/32)) for i in range(64)] for y,r in rows],col)
    def surface_lookup(objects):
        verts=[];faces=[]
        for ob in objects:
            base=len(verts);verts.extend(v.co.copy() for v in ob.data.vertices)
            faces.extend(tuple(base+i for i in p.vertices) for p in ob.data.polygons)
        return BVHTree.FromPolygons(verts,faces)
    def hit(tree,origin,dirn):
        pt,normal,_,_=tree.ray_cast(pos(origin),Vector(dirn),.25)
        if pt is None:raise ValueError('Car decal left its painted shell')
        # A tenth of a millimetre survives web coordinate quantisation.
        return ((pt-org)*1000 - Vector(dirn)*.125)
    # The leading wing and central bonnet are moulded separately from the wide side pods.
    wing=[(-75,-33.1),(-74,-36.0),(-70,-37.2),(-55,-34.8),(-48,-25),(-50,-13),
          (-46,0),(-50,13),(-48,25),(-55,34.8),(-70,37.2),(-74,36),(-75,33.1)]
    wing_part=slab('Blue wing with rolled leading radius',wing,4,11,'lorenzoBlue',1.2)
    for sign in (-1,1):
        # The two narrow black slots on the blue nose are visible head-on.
        cy=sign*23.8
        ends=[(cy-7.1,5.8),(cy+7.1,5.8),(cy+7.9,6.3),(cy+7.9,8.3),
              (cy+7.1,8.8),(cy-7.1,8.8),(cy-7.9,8.3),(cy-7.9,6.3)]
        piece('Dark intake slot on the front wing',[(-75.10,y,z) for y,z in ends],[tuple(range(8))],'air')
    blue=loft('Blue moulded body and side pods',[
      (-71,11.6,5.0,11.1),(-65,13,4.2,13.3),(-55,12.3,3.4,15.3),(-43,11.9,3.4,17.9),
      (-32,12.6,3.5,20.6),(-26,15.5,3.25,23.0),(-23,24.8,3.15,24.1),(-21,29.7,3.1,24.7),
      (-17,31.4,3.0,26.1),(-9,32,3.0,26.8),(0,31.9,3.1,26.7),(9,31.5,3.1,26.7),
      (13,30.1,3.2,26.4)],'lorenzoBlue',.56)
    loft('White rear cowling and underside',[(13,30.1,3.2,26.4),(15,29.1,3.2,26.3),(20,24,3.4,25.5),
       (25,19.3,3.9,24.4),(37,17.7,4.7,23.8),(47,18.1,7.0,23.9),(51,18.7,10,23.5)],'paintWhite',.60)
    bonnet=loft('Raised blue cockpit fairing',[(-57,3.0,12,14),(-50,6.5,13,17),
       (-38,8.2,16,21.8),(-31,9.7,18,23.9),(-25,10.4,21,28.1),(-22,11.5,22,30.7),
       (-18,12.35,23.0,32.4),(-9,13.1,23.3,33.3),(0,12.3,23.4,32.2),(4,10,23.4,29.4)],'lorenzoBlue')
    # A white tail rises behind the axle. Its top is a broad spoiler rather than an elevated flat board.
    tail_part=loft('Sculpted white upswept tail',[(15,14.3,13.6,23.9),(23,18.6,14.4,27.5),
       (38,19.4,17.0,31.0),(49,19.3,19.8,34.0),(58,27,23.1,36.0),
       (67,31.3,27.1,38.0),(73,31.5,31.1,39.0),(75,30.6,34.5,39.1)],'paintWhite',.53)
    tail_tree=surface_lookup([tail_part])
    cols,rows=12,4;verts=[];coords=[]
    for j in range(rows+1):
        for i in range(cols+1):
            u,v=i/cols,j/rows
            verts.append(hit(tail_tree,(68.0+(v-.5)*8.4,(.5-u)*36,80),(0,0,-1)));coords.append((u,v))
    quads=[(j*(cols+1)+i,j*(cols+1)+i+1,(j+1)*(cols+1)+i+1,(j+1)*(cols+1)+i) for j in range(rows) for i in range(cols)]
    ink=piece('VELOCITA stamp on the curved tail',verts,quads,'print')
    sheet.unwrap(ink,'tail',coords)
    nose_tree=surface_lookup([blue,bonnet,wing_part])
    coords=[(.5,.5)];verts=[hit(nose_tree,(-56.8,0,80),(0,0,-1))]
    segments=52;faces=[]
    for j in range(1,7):
        r=j/6
        for k in range(segments):
            a=2*pi*k/segments;u=r*cos(a);v=r*sin(a)
            verts.append(hit(nose_tree,(-56.8+v*8.15,-u*8.15,80),(0,0,-1)));coords.append((.5+.5*u,.5+.5*v))
            if j==1:faces.append((0,1+k,1+(k+1)%segments))
            else:
                a0=1+(j-2)*segments+k;a1=1+(j-2)*segments+(k+1)%segments
                faces.append((a0,a0+segments,a1+segments,a1))
    ink=piece('Number three roundel wrapped over bonnet',verts,faces,'print',True)
    sheet.unwrap(ink,'nose',coords)
    side_tree=surface_lookup([blue])
    # Four white stripes follow each curved blue sill. They have their own rounded upper and lower edges.
    for side in (-1,1):
        for i in range(4):
            a=-3.4+i*3.15
            verts=[]
            for j in range(33):
                t=j/32;z=7.2+t*16.5;bx=a+2.3*t
                for offset in (-.63,.63):verts.append(hit(side_tree,(bx+offset,side*60,z),(0,-side,0)))
            piece('Four white side-pod stripes',verts,[(j*2,j*2+1,j*2+3,j*2+2) for j in range(32)],'paintWhite')
    # The central vane has a blue frontal strip, white side cheeks, and a round top corner.
    outline=[(-2.3,25),(-2.0,51),(-1.1,64.8),(.1,68.2),(2.1,69.8),(5,70),(14.4,70),(17.2,69.4),
             (18.7,67.2),(19.5,55),(20.1,41),(21.2,34),(24.2,29),(29.2,26),(31.5,24)]
    rows=[]
    for s in (-1,1):
        rows.append([(x,6.5*s,z) for x,z in outline])
    n=len(outline);vs=rows[0]+rows[1]
    fin=piece('Moulded vertical number vane',vs,[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],'paintWhite')
    fin.data.materials.append(materials['lorenzoBlue'])
    for edge in [0,1,2,3,4]:fin.data.polygons[2+edge].material_index=1
    bevel=fin.modifiers.new('Round mould edge','BEVEL');bevel.width=.00055;bevel.segments=3;bevel.affect='EDGES'
    bpy.context.view_layer.objects.active=fin;bpy.ops.object.modifier_apply(modifier=bevel.name)
    for side in (-1,1):
        box_patch('Lorenzo blue three on the central vane',(8.7,side*6.54,53.0),(1 if side==-1 else -1,0,0),(0,0,1),17,23.7,'fin')
    # Soft slicks wrap a moulded silver hub. The recessed face leaves a narrow rubber bead around the tyre lettering.
    for cx,r,outer,wide in [(-48,13.9,44.0,13.8),(36.9,18.1,46.8,20.0)]:
        h=r
        tube_y('Recessed painted axle',cx,h,[(-outer+2,1.48),(outer-2,1.48)],'air')
        for side in (-1,1):
            y=side*outer
            profile=[(outer-wide, .85*r),(outer-wide+.7,.94*r),(outer-wide+1.8,.990*r),
                     (outer-wide+3.1,r),(outer-2.2,r),(outer-1.1,.979*r),(outer-.42,.940*r),(outer,.855*r)]
            tube_y('Soft black racing slick',cx,h,[(side*ay,ar) for ay,ar in profile],'rubber')
            circular_patch('SUNRAY lettering on rubber sidewall',(cx,y+side*.05,h),r*.858,
                           (1 if side==-1 else -1,0,0),(0,0,1),'tyre')
            tube_y('Inset silver hubcap',cx,h,[(side*(outer+.10),r*.499),(side*(outer+.42),r*.515),
                   (side*(outer+.64),r*.468),(side*(outer+.72),r*.411)],'hub')
    hx,hy,hz=-10.5,0,38.8;rx,ry,rz=11.1,12.25,11.2
    def helmet(a,b,offset=0):
        return (hx-(rx+offset)*cos(b)*cos(a),hy+(ry+offset)*cos(b)*sin(a),hz+(rz+offset)*sin(b))
    rows=[[helmet(i*2*pi/52,j) for i in range(52)] for j in [-1.43,-1.19,-.92,-.62,-.36,-.12,.12,.36,.60,.82,1.03,1.22,1.42,1.545]]
    sweep('Chrome helmet shell',rows,'chrome')
    def visor(name,limit,top,bottom,outer,col):
        cols,rows=32,7
        verts=[]
        for j in range(rows+1):
            for i in range(cols+1):
                a=(-1+2*i/cols)*limit*(1-.075*abs(2*j/rows-1)**3);edge=(abs(a)/limit)**3
                b=bottom+(.08*edge)+(top-bottom-.18*edge)*j/rows
                verts.append(helmet(a,b,outer))
        piece(name,verts,[(j*(cols+1)+i,j*(cols+1)+i+1,(j+1)*(cols+1)+i+1,(j+1)*(cols+1)+i) for j in range(rows) for i in range(cols)],col,True)
    visor('Silver edge around wraparound visor',1.31,.29,-.29,.12,'hub')
    visor('Gloss black racing visor',1.25,.26,-.24,.24,'visor')
    for side in (-1,1):
        tube_y('Helmet side fixing',hx+4.9,hz-.55,[(side*10.45,1.75),(side*11.28,1.7)],'visor')
        tube_y('Fixing cap',hx+4.9,hz-.55,[(side*11.29,.75),(side*11.46,.68)],'hub')
