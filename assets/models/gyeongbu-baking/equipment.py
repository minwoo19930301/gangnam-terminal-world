"""Open steel bowls, tilt-head mixers, scalloped and financier moulds and pastry tips."""
import math
from mathutils import Vector
from garments import tube

TAU=math.tau


class Pose:
    def __init__(self,x,d,h,angle,scale=1):
        self.origin=Vector((x,d,h));self.scale=scale
        self.right=Vector((math.cos(angle),-math.sin(angle),0))
        self.front=Vector((math.sin(angle),math.cos(angle),0))
    def p(self,x,d,h):return self.origin+self.scale*self.n(x,d,h)
    def n(self,x,d,h):return self.right*x+self.front*d+Vector((0,0,h))


def rings(part,at,profile,sw,n,tone=1,metal=False):
    # z, radius across, radius front, centre across, centre forward.
    built=[]
    for z,rx,ry,x,d in profile:
        built.append([at.p(x+rx*math.sin(k*TAU/n),d+ry*math.cos(k*TAU/n),z) for k in range(n)])
    for j,(a,b) in enumerate(zip(built,built[1:])):
        z,rx,ry,x,d=profile[j];zz,xx,yy,xc,dc=profile[j+1]
        inside=zz<z
        normals=[]
        for k in range(n):
            ang=k*TAU/n
            radial=at.n(math.sin(ang),math.cos(ang),0)
            tangent=at.n(rx*math.cos(ang),-ry*math.sin(ang),0)
            rise=at.n((xx-rx)*math.sin(ang)+xc-x,(yy-ry)*math.cos(ang)+dc-d,zz-z)
            nn=tangent.cross(rise)
            target=-radial if inside else radial
            if nn.dot(target)<0:nn.negate()
            normals.append(nn.normalized())
        for k in range(n):
            kk=(k+1)%n;pts=[a[k],a[kk],b[kk],b[k]];tint=tone
            if metal:
                tones={}
                for pt,theta,h in zip(pts,[k,kk,kk,k],[z,z,zz,zz]):
                    φ=theta*TAU/n
                    stripe=.69+.17*math.cos(φ*2-.23)+.105*math.cos(φ*5+.75)+.09*math.cos(φ*9-.14)
                    brightness=min(.99,max(.38,stripe*(.83 if inside else 1)+.05*math.cos(h*14)))
                    tones[tuple(pt)]=(brightness*.99,brightness,brightness*1.02)
                tint=lambda x,d,h:tones[(x,d,h)]
            uv=[(k/n,j/(len(built)-1)),((k+1)/n,j/(len(built)-1)),((k+1)/n,(j+1)/(len(built)-1)),(k/n,(j+1)/(len(built)-1))]
            part.curved(pts,sw,[normals[k],normals[kk],normals[kk],normals[k]],tint,uv)
    return built


def mixer(part,steel,at,sw,low=False):
    count=8 if low else 22
    for profile,colour,tone in [
         ([(.008,.088,.154,0,.017),(.017,.104,.176,0,.019)],13,.80),
         ([(.015,.105,.177,0,.018),(.027,.114,.186,0,.014),(.043,.112,.18,0,.011),
           (.054,.102,.169,0,.006)],sw,.98),
         ([(.046,.071,.066,0,-.106),(.105,.077,.069,0,-.10),(.22,.055,.055,0,-.102),
           (.262,.061,.064,0,-.104),(.304,.075,.077,0,-.111)],sw,.95)]:
        rr=rings(part,at,profile,colour,count,tone);part.face(rr[-1],colour,at.n(0,0,1),tone)
    bowl=[(.049,.047,.047,0,.065),(.060,.060,.060,0,.065),(.093,.078,.078,0,.065),
          (.146,.109,.109,0,.065),(.204,.122,.122,0,.065),(.222,.123,.123,0,.065),
          (.225,.117,.117,0,.065),(.204,.115,.115,0,.065),(.148,.101,.101,0,.065),
          (.098,.073,.073,0,.065),(.068,.032,.032,0,.065)]
    if low:bowl=[bowl[i] for i in [0,2,4,6,10]]
    rr=rings(steel,at,bowl,5,10 if low else 28,.97,not low)
    steel.face(rr[-1],5,at.n(0,0,1),.64)
    # The long, smoothly domed enamel head overhangs the open mixing bowl.
    profile=[(-.181,.021,.028,.318),(-.164,.067,.058,.319),(-.124,.088,.069,.323),
             (-.056,.092,.071,.325),(.049,.092,.067,.324),(.104,.079,.057,.319),
             (.132,.055,.043,.317),(.138,.036,.031,.317)]
    if low:profile=[profile[i] for i in [0,2,5,7]]
    head=[]
    for d,rx,rh,h in profile:
        head.append([at.p(rx*math.sin(k*TAU/count),d,h+rh*math.cos(k*TAU/count)) for k in range(count)])
    for j,(r0,r1) in enumerate(zip(head,head[1:])):
        for k in range(count):
            kk=(k+1)%count
            ns=[at.n(math.sin(i*TAU/count),-.58 if j==0 else .64 if j==len(head)-2 else 0,math.cos(i*TAU/count)) for i in [k,kk,kk,k]]
            part.curved([r0[k],r0[kk],r1[kk],r1[k]],sw,ns,1,
                        [(k/count,j/len(head)),((k+1)/count,j/len(head)),((k+1)/count,(j+1)/len(head)),(k/count,(j+1)/len(head))])
    steel.face(head[-1],5,at.n(0,1,0),.89);part.face(head[0],sw,at.n(0,-1,0),.92)
    if low:return
    # A polished domed attachment cap, its screw and the continuous name band
    # identify the tilt head even when the mixing bowl hides most of the stand.
    cap=[]
    for q,r in [(.138,.035),(.144,.032),(.151,.026),(.154,.014)]:
        cap.append([at.p(r*math.cos(k*TAU/20),q,.317+r*.83*math.sin(k*TAU/20)) for k in range(20)])
    for j,(aa,bb) in enumerate(zip(cap,cap[1:])):
        for k in range(20):
            l=(k+1)%20;nn=at.n(.32*math.cos(k*TAU/20),1,.32*math.sin(k*TAU/20))
            steel.face([aa[k],aa[l],bb[l],bb[k]],5,nn,.92+.07*math.cos(k*.72))
    steel.face(cap[-1],5,at.n(0,1,0),.95)
    tube(steel,[at.p(-.007,.155,.313),at.p(.007,.155,.321)],.0017,13,.83,4)
    for j,sign in enumerate([-1,1]):
        across=[]
        for delta in [-.023,-.011]:
            row=[]
            for q,rx,rh,zc in profile[1:-1]:
                f=delta/rh;xx=sign*(rx*math.sqrt(1-f*f)+.0019)
                row.append(at.p(xx,q,zc+delta))
            across.append(row)
        for k in range(len(across[0])-1):
            steel.face([across[0][k],across[0][k+1],across[1][k+1],across[1][k]],6,at.n(sign,0,0),.98)

    for side in [-1,1]:
        pts=[at.p(side*.085,-.119,.301),at.p(side*.093,-.056,.299),at.p(side*.091,.047,.298),
             at.p(side*.077,.102,.300),at.p(side*.078,.102,.311),at.p(side*.092,.047,.310),
             at.p(side*.093,-.056,.309),at.p(side*.086,-.119,.309)]
        steel.face(pts,6,at.n(side,0,0),.93)
        tube(steel,[at.p(side*.041,-.139,.255),at.p(side*.083,-.146,.252)],.006,5,.90,6)
    for ang in [0,TAU/6,TAU/3]:
        samples=[at.p(.046*math.sin(t)*math.cos(ang),.060+.046*math.sin(t)*math.sin(ang),
                      .231-.085*math.sin(t*.5)**1.3) for t in [i*TAU/16 for i in range(17)]]
        tube(steel,samples,.0019,5,.95,4)
    tube(steel,[at.p(0,.060,.267),at.p(0,.060,.228)],.008,5,.92,7)
    handle=[at.p(.115,.081,.201),at.p(.147,.084,.198),at.p(.155,.087,.170),
            at.p(.148,.088,.138),at.p(.118,.088,.129),at.p(.104,.088,.145)]
    tube(steel,handle,.0062,5,.96,7)
    for q in [-.09,-.055,-.020,.015]:
        tube(steel,[at.p(-.089,q,.304),at.p(-.090,q+.007,.305)],.00165,13,.87,4)


class Panel:
    """An inclined baking sheet with horizontal a and rising b axes."""
    def __init__(self,x,d,h,heading,tilt):
        self.center=Vector((x,d,h))
        self.a=Vector((math.cos(heading),-math.sin(heading),0))
        normal=Vector((math.sin(heading),math.cos(heading),0))
        self.b=Vector((0,0,1))*math.sin(tilt)-normal*math.cos(tilt)
        self.out=normal*math.sin(tilt)+Vector((0,0,1))*math.cos(tilt)
    def p(self,a,b,depth):return self.center+a*self.a+b*self.b+depth*self.out


def baking_sheet(part,panel,w,h,columns,rows,kind,low=False):
    sw=4 if kind=='shell' else 6 if kind=='lemon' else 8
    # Ring per pocket joins directly to the square cell boundary, leaving a
    # genuinely recessed cavity instead of a disc drawn on top of a solid tray.
    steps=16 if low else 32 if kind=='shell' else 24
    border=.010;usable_w=w-2*border;usable_h=h-2*border
    for row in range(rows):
        for col in range(columns):
            cw=usable_w/columns;ch=usable_h/rows
            cx=-usable_w/2+cw*(col+.5);cy=-usable_h/2+ch*(row+.5)
            def vertex(k,r,depth,square=False):
                ang=k*TAU/steps;c=math.cos(ang);s=math.sin(ang)
                if square:
                    norm=max(abs(c),abs(s));xx=.5*cw*c/norm;yy=.5*ch*s/norm
                elif kind=='shell':
                    xx=.419*cw*c*(.84+.31*s);yy=.439*ch*s
                elif kind=='lemon':
                    xx=.422*cw*c*(.89+.11*c*c);yy=.43*ch*s*(.88+.17*s*s)
                elif kind=='financier':
                    xx=.385*cw*math.copysign(abs(c)**.30,c);yy=.407*ch*math.copysign(abs(s)**.30,s)
                else:xx=.402*cw*c;yy=.421*ch*s
                rib=0
                if kind=='shell' and not square and r<1:
                    rib=.0027*r*math.sin(10*ang+.55*(1-r))**2
                return panel.p(cx+xx*r,cy+yy*r,depth+rib)
            rims=[[(vertex(k,1,0,True)) for k in range(steps)]]
            profile=[(1,0),(.954,-.003),(.85,-.012),(.78,-.021),(.71,-.024)] if kind=='financier' else [(1,0),(.91,-.004),(.72,-.015),(.45,-.022),(.12,-.028)]
            for r,z in profile:rims.append([vertex(k,r,z) for k in range(steps)])
            if low:rims=[rims[i] for i in [0,1,3,5]]
            for j,(outer,inner) in enumerate(zip(rims,rims[1:])):
                for k in range(steps):
                    kk=(k+1)%steps;p=[outer[k],outer[kk],inner[kk],inner[k]]
                    v=(p[1]-p[0]).cross(p[3]-p[0])
                    if v.dot(panel.out)<0:v.negate()
                    gleam=(.71+.22*(.5+.5*math.cos(k*TAU/steps*2-.26))) if j else .95
                    if kind=='shell' and j>=2:gleam*=.82+.19*math.cos(k*TAU/steps*10)**2
                    part.face(p,sw,v,gleam)
            part.face(rims[-1],sw,panel.out,.53)
    rim=[(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)]
    inner=[(-usable_w/2,-usable_h/2),(usable_w/2,-usable_h/2),(usable_w/2,usable_h/2),(-usable_w/2,usable_h/2)]
    for k in range(4):
        kk=(k+1)%4
        part.face([panel.p(*rim[k],.006),panel.p(*rim[kk],.006),panel.p(*inner[kk],0),panel.p(*inner[k],0)],sw,panel.out,.99)
        part.face([panel.p(*rim[k],-.022),panel.p(*rim[kk],-.022),panel.p(*rim[kk],.006),panel.p(*rim[k],.006)],
                  sw,panel.a*(1 if k==1 else -1) if k%2 else panel.b*(1 if k==2 else -1),.79)
    if not low:tube(part,[panel.p(a,b,.0065) for a,b in rim+[rim[0]]],.0025,6,.95,5)


def nozzle(part,at,r,h,style,low=False):
    n=8 if low else 16
    bottom=[at.p(r*math.cos(k*TAU/n),r*math.sin(k*TAU/n),0) for k in range(n)]
    shoulder=[at.p(r*.83*math.cos(k*TAU/n),r*.83*math.sin(k*TAU/n),h*.33) for k in range(n)]
    top=[]
    for k in range(n):
        m=(.155 if k%2 else .342) if style=='star' else .208
        hh=h+(h*.12 if style=='petal' else 0)*math.cos(k*TAU/n)
        top.append(at.p(r*m*math.cos(k*TAU/n),r*(.135 if style=='petal' else m)*math.sin(k*TAU/n),hh))
    for j,(a,b) in enumerate([(bottom,shoulder),(shoulder,top)]):
        for k in range(n):
            kk=(k+1)%n;normal=at.n(math.cos((k+.5)*TAU/n),math.sin((k+.5)*TAU/n),.21)
            tone=.64+.30*(.5+.5*math.cos(k*TAU/n*3-.36))
            part.face([a[k],a[kk],b[kk],b[k]],5,normal,tone)
    inner=[p-at.n(0,0,h*.11) for p in top]
    for k in range(n):
        kk=(k+1)%n
        part.face([top[k],top[kk],inner[kk],inner[k]],6,at.n(-math.cos(k*TAU/n),-math.sin(k*TAU/n),.12),.54)
    part.face(inner,13,at.n(0,0,1),.46)
