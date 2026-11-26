"""Street-side glazing lettering, an appliance counter and three merchandise displays."""
import math
import bpy
from garments import Detail,tube
from tailoring import TailoredPart
from equipment import Panel,Pose,baking_sheet,mixer,nozzle

TAU=math.tau
FRONT=5.047


class LightingPart(Detail):
    def face(self,points,swatch,normal,tint=1.,uv=None):
        if swatch>=15:
            uv=uv or [(.5,.5)]*len(points)
            if swatch==15:uv=[(.04+.91*u,.04+.40*v) for u,v in uv]
            elif swatch==16:uv=[(.04+.40*u,.56+.40*v) for u,v in uv]
            else:uv=[(.56+.40*u,.56+.40*v) for u,v in uv]
            swatch=15
        super().face(points,swatch,normal,tint,uv)


def font(part,words,x,d,h,w,height,sw,italic,low=False):
    curve=bpy.data.curves.new(words,'FONT');curve.body=words
    curve.size=1;curve.resolution_u=2 if low else 5;curve.shear=.14 if italic else 0
    curve.extrude=0 if low else .012;curve.offset=.018 if italic else .005
    obj=bpy.data.objects.new(words,curve);bpy.context.scene.collection.objects.link(obj)
    bpy.context.view_layer.update()
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get());mesh=evaluated.to_mesh();mesh.calc_loop_triangles()
    xs=[v.co.x for v in mesh.vertices];ys=[v.co.y for v in mesh.vertices]
    lo,hi=min(xs),max(xs);bottom,top=min(ys),max(ys)
    for tri in mesh.loop_triangles:
        n=tri.normal
        if n.z<-.10:continue
        points=[]
        for j in tri.vertices:
            u,v,z=mesh.vertices[j].co
            points.append((x+((u-lo)/(hi-lo)-.5)*w,d+z*height,h+((v-bottom)/(top-bottom)-.5)*height))
        part.face(points,sw,(n.x,n.z,n.y),.99 if n.z>.8 else .66)
    evaluated.to_mesh_clear();bpy.data.objects.remove(obj,do_unlink=True);bpy.data.curves.remove(curve)


def graphics(part):
    def line(points,diam=.016):
        tube(part,[(x,FRONT+.032,h) for x,h in points],diam,7,.97,5)
    # White linework is visible on the fixed glass panels at this particular
    # branch. Keep the central pedestrian opening free of both decal and glass.
    line([(-2.08,.91),(-1.99,1.10),(-1.76,1.45),(-1.49,1.84),(-1.34,2.12)],.026)
    for spread in [.08,.17,.25,.33]:
        pts=[]
        for j in range(29):
            t=j/28;x=-1.78-.30*t-spread*math.sin(t*math.pi)
            h=1.53-.72*t-.15*math.sin(t*math.pi)
            pts.append((x,h))
        line(pts,.012)
    line([(-2.07,.81),(-2.18,.82),(-2.27,.91),(-2.25,1.01),(-2.16,1.19),(-1.78,1.54)])
    line([(-2.20,.66),(-2.33,.57),(-2.19,.45),(-2.18,.31),(-1.53,.14),(-1.47,.18),(-1.89,.70),(-2.04,.74),(-2.20,.66)])
    # A pair of iced gingerbread figures and the round dial of a kitchen scale.
    def cookie(cx,z,s):
        outline=[(-.14,.84),(-.11,.97),(-.02,1.03),(.09,1),(.15,.9),(.12,.79),(.28,.81),(.35,.76),(.33,.70),
                 (.13,.69),(.12,.49),(.27,.36),(.23,.29),(.15,.32),(0,.46),(-.11,.29),(-.21,.29),(-.24,.36),
                 (-.11,.52),(-.11,.66),(-.27,.60),(-.32,.67),(-.26,.74),(-.12,.79),(-.14,.84)]
        line([(cx+s*x,z+s*y) for x,y in outline],.017)
        for dx in [-.05,.05]:line([(cx+dx*s,z+.904*s),(cx+dx*s+.004,z+.904*s+.004)],.013)
    cookie(1.41,1.03,.94);cookie(1.94,1.33,.90)
    line([(1.23,1.05),(1.12,1.16),(1.10,1.23),(2.24,1.23),(2.27,1.17),(2.18,1.09),(1.23,1.05)],.019)
    line([(1.58,1.04),(1.68,.91),(1.73,.91),(1.81,1.06)],.014)
    line([(1.63+.48*math.cos(j*TAU/44),.58+.32*math.sin(j*TAU/44)) for j in range(45)],.021)
    line([(1.63+.38*math.cos(j*TAU/44),.58+.24*math.sin(j*TAU/44)) for j in range(45)],.012)
    line([(1.61,.58),(1.86,.68)],.015)


def entrance(shell,identity,low):
    for x in [-2.52,2.52]:shell.box(x,FRONT,.043,.104,.122,3.20,2,.94)
    shell.box(0,FRONT,3.125,5.10,.126,.134,2,.97)
    shell.box(0,FRONT-.049,2.740,4.97,.059,.390,13,.86)
    for x in [-2.45,-.82,.82,2.45]:shell.box(x,FRONT-.039,.052,.053,.059,2.70,4,.83)
    for x in [-1.624,1.624]:shell.box(x,FRONT-.035,.055,1.60,.076,.027,5,.85)
    if low:
        identity.front(-.88,2.80,.073,3.08,FRONT+.027,2);identity.front(.12,2.81,.85,2.96,FRONT+.027,2)
    else:
        font(identity,'B&C',-.39,FRONT+.045,2.954,.95,.414,16,True)
        font(identity,'MARKET',.52,FRONT+.045,2.889,.85,.19,16,True)
        for line in [[(.11,3.03),(.86,3.03),(.90,3.09),(.985,3.10)],[(.19,2.746),(.84,2.746)]]:
            tube(identity,[(x,FRONT+.052,z) for x,z in line],.010,17,.98,6)
        for x in [.25,.78]:
            tube(identity,[(x+.023*math.cos(k*TAU/14),FRONT+.052,2.725+.023*math.sin(k*TAU/14)) for k in range(15)],.006,17,.97,5)
        graphics(identity)
    for x in [-.95,1.12]:
        shell.box(x,FRONT-.027,.93,.018,.054,.17,5,.94)


def shop_shell(deck,shell,low):
    deck.box(0,-.49,.007,5.19,10.90,.040,0,.77)
    if not low:
        for i in range(22):
            x=-2.59+i*.2355
            for j in range(-1,8):
                d=-5.94+j*1.72+(i%3)*.55
                lo=max(-5.94,d);hi=min(4.96,d+1.716)
                if hi>lo+.018:deck.top(x+.001,lo+.001,x+.234,hi,.050,0,.91+.024*math.cos(i*8+j*3))
    shell.box(0,-5.89,.052,5.16,.089,3.45,13,.90)
    for x in [-2.547,2.547]:
        shell.box(x,-.47,.052,.082,10.82,3.43,1,.91)
        shell.box(x,-.47,.054,.102,10.83,.101,9,.76)
    shell.box(0,-.48,3.493,5.17,10.82,.082,13,.84)
    for d in [-4.14,-1.43,1.26,3.70]:
        shell.box(0,d,3.452,4.76,.037,.051,4,.85)
        for x in [-1.72,.16,1.76]:
            tube(shell,[(x,d,3.452),(x,d,3.365)],.023,4,.79,5)
            tube(shell,[(x,d,3.37),(x-.032,d+.015,3.283)],.058,4,.89,6 if low else 10)
            shell.top(x-.074,d-.03,x+.015,d+.063,3.279,15,.99,down=True)


def display_table(furniture,items,metal,low):
    x=-1.78;d=1.36
    furniture.box(x,d,.062,1.18,3.31,.80,9,.94)
    furniture.box(x,d,.854,1.23,3.35,.064,9,.98)
    furniture.box(x+.580,d,.211,.045,3.20,.054,4,.80)
    furniture.box(x+.595,d,.704,.04,3.20,.052,4,.80)
    for j in range(5):
        d0=.12+j*.593
        furniture.box(x+.617,d0,.253,.036,.52,.409,10,.91)
        if not low:
            # Shelf-edge cartons and retail cards below the machines.
            furniture.face([(x+.638,d0-.225,.28),(x+.638,d0+.225,.28),(x+.638,d0+.225,.55),(x+.638,d0-.225,.55)],
                           14,(1,0,0),.92,[(0,0),(1,0),(1,1),(0,1)])
    for i,(offset,sw) in enumerate([(-1.09,8),(-.36,2),(.39,3),(1.10,7)]):
        pose=Pose(x,d+offset,.920,1.14-.17*math.sin(i),1.14)
        mixer(items,metal,pose,sw,low)
        if not low:
            dx=x+.39;dv=d+offset
            furniture.face([(dx,dv-.107,.926),(dx,dv+.107,.926),(dx-.034,dv+.107,1.025),(dx-.034,dv-.107,1.025)],11,
                           (1,0,.34),.96,[(0,0),(1,0),(1,1),(0,1)])


def pan_wall(stand,pans,low):
    x=2.19;start=-2.98;end=3.37
    for d in [start,-.32,end]:
        for xx in [x-.34,x+.23]:
            tube(stand,[(xx,d,.065),(xx,d,2.35)],.019,5,.87,5 if low else 8)
    for h in [.33,.82,1.27,1.74,2.18]:
        stand.box(x,(start+end)*.5,h,.54,end-start,.033,6,.73)
        tube(stand,[(x-.28,start,h+.038),(x-.28,end,h+.038)],.012,5,.92,7)
        if not low:
            for j in range(11):
                d=start+.24+j*.59
                stand.face([(x-.287,d-.072,h+.021),(x-.287,d+.072,h+.021),(x-.287,d+.072,h+.087),(x-.287,d-.072,h+.087)],
                           11,(-1,0,0),.89,[(0,0),(1,0),(1,1),(0,1)])
    sets=[(.12,1.48,.47,.34,4,3,'shell'),(.77,1.48,.41,.31,3,3,'shell'),
          (-.65,1.50,.41,.31,3,2,'lemon'),(-1.31,1.50,.42,.29,3,2,'financier'),
          (1.49,.99,.42,.31,3,2,'lemon'),(2.20,1.0,.46,.32,4,2,'financier'),
          (-1.94,.985,.42,.30,3,2,'lemon'),(2.69,1.49,.44,.32,3,3,'shell')]
    for j,(d,h,w,high,cols,rows,kind) in enumerate(sets):
        panel=Panel(x-.138,d,h,-math.pi/2,math.radians(59 if j%2==0 else 52))
        baking_sheet(pans,panel,w,high,cols,rows,kind,low=low or j in [1,4,6,7])
        if j in [1,5,7] and not low:
            # A cardboard sleeve covers the centre strip of packaged baking tins.
            label=[panel.p(-w*.12,-high*.48,.008),panel.p(w*.12,-high*.48,.008),
                   panel.p(w*.12,high*.48,.008),panel.p(-w*.12,high*.48,.008)]
            pans.face(label,13,panel.out,.91)
            pans.face([panel.p(-w*.103,high*.01,.009),panel.p(w*.102,high*.01,.009),
                       panel.p(w*.102,high*.19,.009),panel.p(-w*.103,high*.19,.009)],11,panel.out,.96,
                      [(0,0),(1,0),(1,1),(0,1)])
    for j in range(9 if not low else 5):
        d=start+.37+j*((end-start-.77)/(8 if not low else 4))
        for h in [.38,.865,1.803]:
            if .8<h<1 and d>1 or d<-.3 and h<.8:continue
            for n in range(2 if low else 4):
                stand.box(x,d,h+n*.025,.36,.36+.06*(j%3),.019,4 if j%2==0 else 6,.75+.035*n)
            if not low:
                stand.top(x-.19,d-.14,x-.09,d+.13,h+.104,11,.93)


def tips_and_packs(stand,gear,low):
    # The photographed back display places bagged tubes on hooks above the
    # unbagged, upright examples on its lower shelf.
    stand.box(0,-5.68,.052,4.31,.38,.69,9,.88);stand.box(0,-5.65,.719,4.47,.61,.065,6,.89)
    stand.box(0,-5.806,.765,4.32,.080,1.87,13,.91)
    for row in range(3):
        for col in range(10 if not low else 6):
            x=-1.97+col*(3.95/(9 if not low else 5));z=.96+.445*row
            stand.front(x-.118,z+.171,x+.118,z+.238,-5.600,11,.97)
            # White carrier strips and folded cellophane edges leave the metal
            # tip itself visible through the middle of each hanging packet.
            for side in [-1,1]:
                points=[(x+side*.115,-5.597,z+.171),(x+side*.108,-5.594,z+.012),
                        (x+side*.075,-5.585,z+.021),(x+side*.095,-5.594,z+.086)]
                stand.face(points,7,(0,1,0),(.74,.77,.73))
            stand.front(x-.105,z+.008,x+.106,z+.014,-5.591,6,.90)
            if not low:
                tube(stand,[(x,-5.79,z+.32),(x,-5.59,z+.30)],.006,5,.91,5)
                nozzle(gear,Pose(x-.027,-5.567,z+.024,0),.040,.125,['star','petal','round'][(row+col)%3])
                if col%3==0:nozzle(gear,Pose(x+.048,-5.578,z+.039,.2),.030,.099,'round')
                tube(stand,[(x-.106,-5.593,z+.004),(x-.100,-5.594,z+.158),(x-.091,-5.593,z+.186)],.0026,6,.96,4)
    for j in range(25 if not low else 11):
        x=-2.02+j*(4.04/(24 if not low else 10))
        nozzle(gear,Pose(x,-5.435,.786,0),.030+(j%4)*.0035,.093+(j%4)*.011,['star','round','petal'][j%3],low)
    for h in [.87,1.32,1.78,2.22]:
        tube(stand,[(-2.10,-5.637,h),(2.10,-5.637,h)],.010,5,.86,6)


def packed_goods(stand,goods,low):
    start=-5.02;end=-1.03;x=-2.25
    for d in [start,end]:
        for xx in [x-.20,x+.26]:tube(stand,[(xx,d,.06),(xx,d,2.21)],.015,6,.84,6)
    for h in [.38,.84,1.31,1.78]:
        stand.box(x,(start+end)/2,h,.52,end-start,.048,9,.94)
        for j in range(9 if not low else 4):
            d=start+.23+j*(end-start-.46)/(8 if not low else 3)
            w=.234+.032*(j%3);hh=.245+.037*(j%2)
            at=Pose(x+.02,d,h+.053,math.pi/2+.09*math.cos(j+h))
            profiles=[(0,w*.47,.057),(.037,w*.54,.079),(.49*hh,w*.52,.096),(.81*hh,w*.50,.061),
                      (.97*hh,w*.47,.022),(hh,w*.50,.015)]
            surface=10 if j%3==0 else 7
            sub=[]
            for z,half,deep in profiles:
                corners=[(-half,-deep*.70),(-half*.85,-deep),(half*.85,-deep),(half,-deep*.70),
                         (half,deep*.51),(half*.80,deep),(-half*.80,deep),(-half,deep*.51)]
                sub.append([at.p(a,b,z) for a,b in corners])
            for il,(lo,up) in enumerate(zip(sub,sub[1:])):
                for k in range(8):
                    kk=(k+1)%8;v=(lo[k]+lo[kk])*.5-at.origin;v.z=0
                    if il==len(sub)-2:shade=.85
                    else:shade=.91+.052*math.cos(k*1.3+j)
                    goods.face([lo[k],lo[kk],up[kk],up[k]],surface,v,shade)
            goods.face(sub[-1],surface,at.n(0,0,1),.98)
            for k in [1,2]:
                lo,_,front=profiles[k];hi,_,back=profiles[k+1]
                v0=(lo-profiles[1][0])/(profiles[3][0]-profiles[1][0])
                v1=(hi-profiles[1][0])/(profiles[3][0]-profiles[1][0])
                label=[at.p(-w*.32,front+.0027,lo),at.p(w*.32,front+.0027,lo),
                       at.p(w*.32,back+.0027,hi),at.p(-w*.32,back+.0027,hi)]
                goods.face(label,14,at.n(0,1,0),.98,[(0,v0),(1,v0),(1,v1),(0,v1)])


def distant_shop():
    shell=Detail('Distant shop glazing and wooden counters')
    goods=Detail('Distant ingredient rows and baking trays')
    powder=TailoredPart('Distant enamel mixers and bright open bowls')
    shell.top(-2.59,-5.93,2.59,5.0,.046,0,.91);shell.front(-2.53,.061,2.53,3.48,-5.87,13,.88)
    shell.top(-2.55,-5.90,2.55,4.99,3.49,13,.86,down=True)
    for x,normal in [(-2.54,1),(2.54,-1)]:
        shell.face([(x,-5.87,.055),(x,5.0,.055),(x,5.0,3.49),(x,-5.87,3.49)],1,(normal,0,0),.90)
        shell.box(x,FRONT,.05,.10,.09,3.20,2,.96)
    shell.box(0,FRONT,3.14,5.12,.095,.12,2,.96)
    shell.front(-2.48,2.74,2.48,3.13,FRONT-.02,13,.86)
    for x in [-.82,.82]:shell.front(x-.025,.055,x+.025,2.75,FRONT,4,.83)
    shell.front(-.88,2.80,.10,3.07,FRONT+.016,2,.99);shell.front(.14,2.80,.88,2.96,FRONT+.016,2,.99)
    shell.box(-1.78,1.36,.06,1.18,3.31,.84,9,.91)
    for d,colour in [(.27,8),(1.0,2),(1.75,3),(2.46,7)]:
        at=Pose(-1.78,d,.91,1.14,1.14)
        def profile(outline,side,sw):
            goods.face([at.p(side*.047,q,z) for q,z in outline],sw,at.n(side,0,0),.95)
        shape=[(-.17,.016),(.173,.016),(.174,.055),(-.040,.069),(-.059,.267),(.104,.267),
               (.145,.302),(.125,.352),(.062,.385),(-.129,.381),(-.17,.339),(-.15,.277),(-.136,.106)]
        for side in [-1,1]:profile(shape,side,colour)
        for j,(a,z) in enumerate(shape):
            b,zz=shape[(j+1)%len(shape)]
            if z<.06 and zz<.06:continue
            goods.face([at.p(-.047,a,z),at.p(.047,a,z),at.p(.047,b,zz),at.p(-.047,b,zz)],colour,
                       at.n(0,zz-z,a-b),.89)
        rings=[(h,r) for h,r in [(.065,.05),(.125,.092),(.213,.119),(.213,.093)]]
        for j,((h,r),(hh,rr)) in enumerate(zip(rings,rings[1:])):
            for k in range(7):
                a=k*TAU/7;b=(k+1)*TAU/7
                pts=[at.p(r*math.cos(a),.061+r*math.sin(a),h),at.p(r*math.cos(b),.061+r*math.sin(b),h),
                     at.p(rr*math.cos(b),.061+rr*math.sin(b),hh),at.p(rr*math.cos(a),.061+rr*math.sin(a),hh)]
                powder.face(pts,5,at.n(math.cos(a),math.sin(a),.14 if j<2 else 1),.88)
    for h in [.34,.83,1.28,1.75,2.19]:
        shell.top(1.91,-2.98,2.46,3.37,h,6,.86)
    for d in [-2.98,.18,3.37]:shell.box(1.92,d,.065,.03,.03,2.28,6,.87)
    for j in range(8):
        d=-2.50+j*.77;pp=Panel(2.05,d,1.49,-math.pi/2,.93)
        goods.face([pp.p(-.22,-.157,0),pp.p(.22,-.157,0),pp.p(.22,.157,0),pp.p(-.22,.157,0)],4 if j%3 else 8,pp.out,.88)
        for a in [-.091,.091]:
            for b in [-.067,.067]:
                goods.face([pp.p(a+.048*math.cos(k*TAU/7),b+.041*math.sin(k*TAU/7),.002) for k in range(7)],13,pp.out,.79)
    shell.box(0,-5.66,.056,4.34,.41,.71,9,.88)
    for j in range(6):
        for h in [.99,1.45,1.91]:goods.front(-2+j*.73,h,-1.76+j*.73,h+.19,-5.60,7,.85)
    for h in [.38,.84,1.31,1.78]:
        shell.top(-2.50,-5.02,-1.99,-1.03,h,9,.93)
        for d in [-4.67,-3.82,-2.93,-2.06,-1.37]:
            goods.face([(-2.08,d-.11,h+.045),(-2.08,d+.11,h+.045),(-2.11,d+.10,h+.32),(-2.11,d-.10,h+.32)],7,(1,0,0),.92)
    return [shell,goods,powder]


def sections(low=False):
    if low:return distant_shop()
    deck=Detail('01 · Shop floor and entrance')
    shell=LightingPart('02 · Red door surround, steel mullions, ceiling and track lights')
    word=LightingPart('03 · Illuminated B&C wordmark and public glass graphics')
    benches=Detail('04 · Appliance table and retail cards')
    bodies=TailoredPart('05 · Tilt-head stand mixers in four colours')
    steel=TailoredPart('06 · Open mixer bowls, handles and wire whisks')
    racks=Detail('07 · Wire kitchenware shelves')
    pans=Detail('08 · Recessed madeleine, financier and lemon baking trays')
    tips=Detail('09 · Star, round and petal piping tips')
    food=Detail('10 · Paper ingredient packs')
    shop_shell(deck,shell,low);entrance(shell,word,low);display_table(benches,bodies,steel,low)
    pan_wall(racks,pans,low);tips_and_packs(racks,tips,low);packed_goods(racks,food,low)
    return [p for p in [deck,shell,word,benches,bodies,steel,racks,pans,tips,food] if p.faces]
