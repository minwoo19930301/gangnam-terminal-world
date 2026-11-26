"""Public-facing jackets on densely spaced rails, with individual wool cuts and cuff tickets."""
import math
from mathutils import Vector
from garments import Detail, tube

TAU = math.tau


class TailoredPart(Detail):
    """Rounded cloth panels keep continuous lighting while lapels and cuffs retain crisp edges."""
    def __init__(self,name):
        super().__init__(name)
        self.corner_normals={}

    def curved(self,points,swatch,normals,tint,uv):
        first=len(self.verts);index=len(self.faces)
        normal=sum(normals,Vector((0,0,0))).normalized()
        self.face(points,swatch,normal,tint,uv)
        if len(self.faces)>index:
            self.corner_normals[index]=[normals[v-first].normalized() for v in self.faces[index]]

    def mesh(self,collection,materials):
        obj=super().mesh(collection,materials)
        if self.corner_normals:
            data=obj.data
            corners=[(0,0,0)]*len(data.loops)
            for face_index,normals in self.corner_normals.items():
                polygon=data.polygons[face_index];polygon.use_smooth=True
                for corner,n in zip(polygon.loop_indices,normals):corners[corner]=(n.x,-n.y,n.z)
            data.normals_split_custom_set(corners)
        return obj


def jacket(part, trim, at, height, cloth, number, *, detailed=False, coat=False, shirt=False, low=False):
    width = (.215 if not coat else .238) * (1 + .035*math.sin(number*1.71))
    length = height
    if low:
        # At the opposite end of the passage only the shoulder line, cuffs and
        # overlapping colours need to survive. A full sleeve loft is near art.
        half_depth=.049
        for direction in [-1,1]:
            q=direction*half_depth
            profile=[(-.95,0),(.95,.006),(1.06,.82),(.82,.93),(.26,1),(-.26,1),(-.83,.93),(-1.06,.82)]
            part.face([at.p(t*width,q,z*length) for t,z in profile],cloth,at.n(0,direction,0),.92 if direction>0 else .79)
            if direction>0:
                part.face([at.p(-.40*width,q+.003,.91*length),at.p(-.10*width,q+.003,.994*length),
                           at.p(.14*width,q+.003,.994*length),at.p(.40*width,q+.003,.91*length),
                           at.p(0,q+.004,.52*length)],7 if shirt else 6,at.n(0,1,0),.91)
        for sign in [-1,1]:
            ring=[(sign*.86,.89),(sign*1.14,.78),(sign*1.27,.19),(sign*1.04,.19)]
            part.face([at.p(t*width,.067,z*length) for t,z in ring],cloth,at.n(0,1,0),.86)
            edge=[(sign*1.11,.84),(sign*1.25,.19)]
            part.face([at.p(edge[0][0]*width,-.042,edge[0][1]*length),
                       at.p(edge[1][0]*width,-.042,edge[1][1]*length),
                       at.p(edge[1][0]*width,.065,edge[1][1]*length),
                       at.p(edge[0][0]*width,.065,edge[0][1]*length)],cloth,at.n(sign,0,0),.83)
        return
    # Hem sweep, narrowed waist, chest and shoulder line; the high points are the collar tips.
    profile = [(0,1.00,.057),(.075,1.014,.059),(.43,.84,.065),
               (.70,.99,.080),(.86,1.085,.078),(.94,.78,.063),(1,.29,.046)]
    if low or not detailed: profile = [profile[i] for i in [0,2,4,5,6]]
    sides = 6 if low else 12 if detailed else 8
    def surface(t,z,xscale,depth):
        width_point=width*xscale*math.cos(t)
        y=depth*math.sin(t) + .013*math.cos(t*3+number+z)*(.92-z*.55)+.003*math.sin(t*7+z*3.3)
        h=z*length + .012*math.sin(t+number)*max(0,1-z*4)
        return at.p(width_point,y,h)
    for (h,w,d),(hh,ww,dd) in zip(profile,profile[1:]):
        for i in range(sides):
            t,tt=i*TAU/sides,(i+1)*TAU/sides
            xy=[(t,h,w,d),(tt,h,w,d),(tt,hh,ww,dd),(t,hh,ww,dd)]
            normal=at.n(math.cos((t+tt)/2),math.sin((t+tt)/2),0)
            uv=[(.07+.86*(i/sides),.03+.94*h),(.07+.86*((i+1)/sides),.03+.94*h),
                (.07+.86*((i+1)/sides),.03+.94*hh),(.07+.86*(i/sides),.03+.94*hh)]
            tint=(.92+.053*math.sin((t+tt)*1.5+number)) if math.sin((t+tt)/2)>0 else .85
            normals=[at.n(math.cos(aa)/max(.03,width*ww),math.sin(aa)/dd,.24 if zz>.85 else .025)
                     for aa,zz,ww,dd in xy]
            part.curved([surface(*p) for p in xy],cloth,normals,tint,uv)
    neck=[surface(i*TAU/sides,*profile[-1]) for i in range(sides)]
    part.face(neck,7 if shirt else 6,at.n(0,0,1),.87)
    # A front opening at the hem and two leaf-like lapels read both in individual suits and the long rows.
    def face(xz,sw,shade,depth=.082):
        uv=[(.50+.40*x,.055+.89*z) for x,z in xz]
        part.face([at.p(x*width,depth-.027*x*x,length*z) for x,z in xz],sw,at.n(0,1,.02),shade,uv)
    if not low:
        face([(-.39,.89),(-.13,.983),(.15,.983),(.42,.86),(.028,.53 if shirt else .65)],7 if shirt else 6,.95,.083)
        for s in [-1,1]:
            face([(s*.16,.984),(s*.59,.876),(s*.43,.857),(s*.53,.823),(s*.03,.53)],cloth,1.06,.091)
        if shirt:
            face([(-.073,.947),(.091,.947),(.053,.886),(.13,.61),(.015,.55),(-.088,.617),(-.031,.886)],14,.96,.094)
            for s in [-1,1]:face([(s*.15,.974),(s*.41,.906),(s*.17,.849),(s*.045,.927)],7,.96,.095)
    else:
        face([(-.43,.896),(-.14,.99),(.17,.99),(.39,.90),(.01,.54)],7 if shirt else 6,.90,.085)
    near_side=1 if at.width.x * (-1 if at.origin.x>0 else 1)>0 else -1
    for s in [-1,1]:
        rings=[]
        arm=[(.88,.86,.074,-.006),(.71,1.05,.069,-.001),(.47,1.14,.061,.013),(.20,1.18,.053,.039)]
        if coat:arm[-1]=(.13,1.18,.058,.043)
        if low or not detailed:arm=[arm[i] for i in [0,1,3]]
        n=4 if low else 8 if detailed else 5
        for h,wx,r,q in arm:
            rings.append([at.p(s*wx*width+r*math.cos(k*TAU/n),q+r*.88*math.sin(k*TAU/n),h*length) for k in range(n)])
        for j in range(len(rings)-1):
            for k in range(n):
                kk=(k+1)%n
                norm=at.n(math.cos((k+.5)*TAU/n),math.sin((k+.5)*TAU/n),.01)
                normals=[at.n(math.cos(i*TAU/n),math.sin(i*TAU/n),.02) for i in [k,kk,kk,k]]
                part.curved([rings[j][k],rings[j][kk],rings[j+1][kk],rings[j+1][k]],cloth,normals,.93+.030*math.cos(k+number),
                          [(.07+.76*k/n,.84-j*.25),(.07+.76*(k+1)/n,.84-j*.25),
                           (.07+.76*(k+1)/n,.59-j*.25),(.07+.76*k/n,.59-j*.25)])
        part.face(rings[-1],6,at.n(0,0,-1),.65)
        if not low and s==near_side and (detailed or number%3!=1):
            cuff=arm[-1]
            ticket(trim,at,s*width*cuff[1],cuff[3],length*cuff[0],s,number)
        if detailed:
            for j in range(3):
                disk(trim,at,s*(width*arm[-1][1]+.039),arm[-1][3]+.037,
                     length*arm[-1][0]+.029+j*.019,.0065,6)
    if low:return
    for z in ([.45,.54,.63] if coat else [.43,.53]):
        disk(trim,at,.007,.091,z*length,.009 if coat else .008,6)
    if detailed:
        for s in [-1,1]:
            face([(s*.31,.38),(s*.80,.394),(s*.79,.34),(s*.32,.329)],cloth,.79,.086)
            face([(s*.13,.041),(s*.022,.018),(s*.033,.225)],6,.75,.073)
        face([(.37,.726),(.78,.751),(.79,.731),(.39,.707)],cloth,.74,.091)
        if shirt and number%3==0:face([(.40,.731),(.48,.759),(.57,.75),(.66,.77),(.73,.745)],7,.95,.092)
    if detailed and coat:
        face([(-.79,.477),(.75,.477),(.74,.443),(-.79,.443)],cloth,.76,.098)
        face([(-.11,.483),(.13,.483),(.13,.438),(-.11,.438)],4,.85,.101)


def disk(part,at,t,q,h,r,sw):
    points=[at.p(t+r*math.cos(i*TAU/8),q,h+r*math.sin(i*TAU/8)) for i in range(8)]
    part.face(points,sw,at.n(0,1,0),.89)


def ticket(part,at,t,q,h,s,number):
    # Stock card hung through the outer cuff with a short loop. Two printed rules, no fictitious price.
    p=at.p(t+s*.052,q+.006,h+.067)
    direction=1 if at.origin.x<0 else -1
    d=p.y;z=p.z
    width=.041 if number%2 else .053
    def point(v,h,offset=0):
        return (p.x+direction*(.007+.008*(1-h)+offset),d+v+.007*(1-h)*math.sin(number),z-.094*(1-h))
    part.face([point(-width*.5,1),point(width*.5,1),point(width*.57,.0),point(-width*.55,0)],7,(direction,0,0),.93)
    for y in [.52,.69]:
        part.face([point(-width*.35,y,.0006),point(width*.27,y,.0006),
                   point(width*.27,y+.023,.0006),point(-width*.35,y+.023,.0006)],6,(direction,0,0),.76)
    if number%3==0:
        tube(part,[point(0,1),at.p(t+s*.038,q+.018,h+.09),at.p(t+s*.026,q+.016,h+.10)],.0019,4,n=3)
