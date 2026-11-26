"""Curved leaf blades, palm pinnae, silver air-plant rosettes and beadlike hanging vines."""
import math
import random
from mathutils import Vector
from garments import tube

TAU=math.tau


def leaf(part,base,angle,reach,rise,drop,width,sw,tone,low=False,kind='blade',twist=0):
    base=Vector(base);out=Vector((math.cos(angle),math.sin(angle),0));side=Vector((-out.y,out.x,0));up=Vector((0,0,1))
    count=4 if low else 9 if kind in ['broad','sword'] else 6
    spans=[-1,0,1] if low else [-1,-.50,0,.50,1]
    def point(t,s):
        arc=out*(reach*(.24*t+.76*t**1.4))+up*(rise*t-drop*t*t)+side*(reach*.10*math.sin(t*math.pi*.96+twist)*t)
        if kind=='sword':
            width_profile=.19+.81*max(0,math.sin(t**.62*math.pi))**.39
            if t>.82:width_profile*=max(.035,(1-t)/.18)
        elif kind=='broad':width_profile=.035+.965*math.sin(math.pi*t**.83)**.66
        else:width_profile=.035+.965*max(0,math.sin(math.pi*t**.60))**.72
        half=width*width_profile*(1+.036*math.sin(t*18+angle))
        roll=.17*math.sin(t*3.8+angle)+twist*t
        # The light-catching midrib sits above each half of the folded blade.
        fold=half*(.24*(1-abs(s))-.12*s*s+.08*math.sin(7*t+angle)*abs(s))
        return base+arc+side*(half*s*math.cos(roll))+up*(half*s*math.sin(roll)+fold)
    if low:
        outline=[(0,0),(.30,-.83),(.60,-.75),(1,0),(.61,.75),(.28,.84)]
        part.face([point(t,s) for t,s in outline],sw,(out.x*.28,out.y*.28,.82),tone,[(.5+.5*s,t) for t,s in outline]);return
    for i in range(count):
        t0=i/count;t1=(i+1)/count
        for j,(a,b) in enumerate(zip(spans,spans[1:])):
            st=[(t0,a),(t0,b),(t1,b),(t1,a)];corners=[point(t,s) for t,s in st];norms=[];colours={}
            for p,(t,s) in zip(corners,st):
                du=point(min(1,t+.012),s)-point(max(0,t-.012),s)
                dv=point(t,min(1,s+.022))-point(t,max(-1,s-.022))
                n=du.cross(dv).normalized();norms.append(n)
                shade=.75+.21*t+.043*(1-abs(s))+.04*math.cos(angle+t*3.6)
                if kind=='sword':shade+=.042*abs(s)
                colours[tuple(p)]=tuple(min(1,c*shade) for c in tone)
            part.curved(corners,sw,norms,lambda x,d,z:colours[(x,d,z)],[(.5+.5*s,t) for t,s in st])


def rosette(part,x,d,z,scale,seed,style,low):
    rng=random.Random(seed)
    options={
        'agave':(11,.47,.37,.21,.083,6,(.62,.82,.75),'blade'),
        'fernleaf':(10,.42,.33,.39,.106,4,(.43,.74,.48),'broad'),
        'snake':(8,.10,.78,.11,.065,7,(.54,.76,.45),'sword'),
        'flame':(10,.28,.61,.22,.075,4,(.46,.75,.44),'sword'),
        'silver':(14,.25,.19,.21,.020,6,(.87,.93,.83),'blade'),
        'calathea':(8,.34,.43,.29,.098,7,(.48,.76,.44),'broad'),
    }
    count,extent,rise,drop,width,sw,tone,kind=options[style]
    if low:count=3 if style!='silver' else 4
    for i in range(count):
        t=(i+.5)/count;a=i*TAU*.61803399+rng.uniform(-.19,.19);s=scale*rng.uniform(.80,1.04)
        rr=extent*s*(1.12-.61*t);up=rise*s*(.76+.65*t);down=drop*s*(1.25-.91*t)
        dye=tuple(min(1,c*rng.uniform(.88,1.08)) for c in tone)
        leaf(part,(x+.012*math.cos(a)*s,d+.012*math.sin(a)*s,z),a,rr,up,down,width*s,sw,dye,low,kind,rng.uniform(-.43,.43))


def palm(part,x,d,z,scale,seed,low):
    rng=random.Random(seed);count=3 if low else 7
    for i in range(count):
        ang=i*TAU/count+rng.uniform(-.13,.13);direction=Vector((math.cos(ang),math.sin(ang),0));side=Vector((-direction.y,direction.x,0))
        top=Vector((x,d,z));length=scale*rng.uniform(.39,.59);rise=scale*rng.uniform(.44,.66)
        def frond(t):return top+direction*(length*t**1.4)+Vector((0,0,rise*(1.57*t-.72*t*t)))
        tube(part,[frond(t/6) for t in range(7)],scale*.005,12,(.50,.66,.38),4)
        n=4 if low else 13
        for k in range(1,n+1):
            t=.13+.80*k/n;origin=frond(t)
            for sign in [-1,1]:
                a=ang+sign*(1.11+.26*t);l=scale*(.018+.125*math.sin(t*math.pi)**.73)
                p=origin+direction*l*.2+side*sign*l
                p.z-=l*(.30+.65*t)
                mid=origin.lerp(p,.54)+Vector((0,0,l*.19));w=direction*(l*.108)
                part.face([origin,mid-w,p,mid+w],12,(direction.x*.26,direction.y*.26,.94),(.51,.79-.18*t,.44),[(.5,0),(0,.5),(.5,1),(1,.5)])


def hanging_vine(part,x,d,z,scale,seed,low):
    rng=random.Random(seed);count=4 if low else 12
    for i in range(count):
        a=i*TAU/count;reach=scale*(.11+.033*rng.random());h=scale*(.21+.44*rng.random());base=Vector((x,d,z))
        def stem(t):return base+Vector((reach*(.68+.32*math.cos(t*3.3))*math.cos(a+.24*t),reach*(.68+.42*math.sin(t*3.7))*math.sin(a+.24*t),-h*t))
        tube(part,[stem(j/5) for j in range(6)],scale*.0035,12,(.47,.67,.39),4)
        for k in range(3 if low else 9):
            t=(k+.45)/(3 if low else 9);v=stem(t);az=a+(1 if k%2 else -1)*.76
            leaf(part,v,az,.051*scale,.013*scale,.038*scale,.021*scale,4,(.61,.83,.48),True,'broad')


def spanish_moss(part,x,d,z,scale,seed,low):
    rng=random.Random(seed);count=7 if low else 34
    for i in range(count):
        a=i*TAU*.618;length=scale*rng.uniform(.25,.52);r=scale*rng.uniform(.018,.066);width=scale*rng.uniform(.0024,.0052)
        last=None
        for k in range(5 if low else 11):
            t=k/(4 if low else 10);turn=t*TAU*(1.04+i%3*.27)+a
            p=Vector((x+r*math.cos(a)+.015*scale*math.sin(turn),d+r*math.sin(a)+.018*scale*math.cos(turn*1.12),z-length*t))
            edge=Vector((math.cos(turn)*width,math.sin(turn)*width,.0003));current=(p-edge,p+edge)
            if last:
                norm=Vector((-math.sin(turn),math.cos(turn),.12));part.face([*last,current[1],current[0]],6,norm,(.74+.09*math.cos(a),.82,.72),[(0,0),(1,0),(1,1),(0,1)])
            last=current


def shield_clump(part,x,d,z,scale,seed,low):
    """Spread individual petioles below notched, shield-shaped leaves with pale veins."""
    rng=random.Random(seed)
    outline=[(0,-1),(-.34,-.70),(-.59,-.39),(-.79,.02),(-.87,.38),(-.79,.69),(-.53,.86),(-.26,.76),(0,.39),(.28,.73),(.55,.86),(.80,.66),(.86,.34),(.78,-.02),(.57,-.42),(.32,-.72)]
    for i in range(4 if low else 8):
        a=i*TAU*.618+.25;out=Vector((math.cos(a),math.sin(a),0));side=Vector((-out.y,out.x,0));up=Vector((0,0,1))
        reach=scale*rng.uniform(.11,.28);height=scale*rng.uniform(.29,.52);base=Vector((x,d,z));tip=base+reach*out+height*up
        tube(part,[base,base+.37*reach*out+.55*height*up,tip],.0054*scale,12,(.56,.74,.47),4 if low else 6)
        center=tip+.023*scale*out-.076*scale*up;span=scale*rng.uniform(.105,.154);long=scale*rng.uniform(.14,.21)
        vertical=up*.86-out*.48;normal=out*.86+up*.48
        def surface(w,h):return center+side*span*w+vertical*long*h+normal*span*(.12*(1-abs(w))-.18*w*w+.063*math.sin(w*9+h*4)*abs(w))
        if low:
            shape=[outline[j] for j in [0,2,4,6,8,10,12,14]]
            part.face([surface(w,h) for w,h in shape],5,normal,(.54,.73,.55),[(.5+w*.51,.51+h*.49) for w,h in shape]);continue
        rings=[0,.34,.70,1]
        for j in range(len(rings)-1):
            for q,(w,h) in enumerate(outline):
                ww,hh=outline[(q+1)%len(outline)];s0,s1=rings[j:j+2]
                p=[(s0*w,s0*h),(s1*w,s1*h),(s1*ww,s1*hh),(s0*ww,s0*hh)] if j else [(0,0),(s1*w,s1*h),(s1*ww,s1*hh)]
                pts=[surface(cx,cy) for cx,cy in p];dye=(.50+.04*(i%3),.73,.54 if i%2 else .49)
                part.face(pts,5,normal,dye,[(.5+cx*.51,.51+cy*.49) for cx,cy in p])
        if low:continue
        # Pale structural veins fork from the central ridge toward both upper lobes.
        for sign in [-1,1]:
            for w,h,by in [(.65,.52,.10),(.76,.14,-.11),(.64,-.20,-.38),(.37,-.49,-.59)]:
                path=[(0,by),(w*.42*sign,by+.57*(h-by)),(w*sign,h)]
                for (a0,b0),(a1,b1) in zip(path,path[1:]):
                    eps=.0062
                    part.face([surface(a0-eps,b0)+normal*.0008,surface(a0+eps,b0)+normal*.0008,surface(a1+eps,b1)+normal*.0008,surface(a1-eps,b1)+normal*.0008],6,normal,(.76,.88,.72))


def succulent(part,x,d,z,scale,seed,low):
    """Overlapping fleshy leaves in a low nursery pot, green inside and mauve at the tips."""
    if low:
        top=(x,d,z+.022*scale)
        for k in range(8):
            a=k*TAU/8+seed;b=(k+1)*TAU/8+seed
            part.face([top,(x+.041*scale*math.cos(a),d+.041*scale*math.sin(a),z+.01*scale),
                       (x+.041*scale*math.cos(b),d+.041*scale*math.sin(b),z+.01*scale)],6,(0,0,1),(.70,.78,.72))
        return
    count=17
    for i in range(count):
        t=i/(count-1);a=i*TAU*.618+seed;out=Vector((math.cos(a),math.sin(a),0));right=Vector((-out.y,out.x,0));up=Vector((0,0,1))
        anchor=Vector((x,d,z))+.012*scale*t*up;reach=scale*(.047-.024*t);height=scale*(.021+.026*t);width=scale*(.018-.007*t)
        p=[anchor,anchor+out*reach*.41-right*width*.65+up*height*.33,anchor+out*reach*.82-right*width+up*height*.60,
           anchor+out*reach+up*height,anchor+out*reach*.82+right*width+up*height*.62,anchor+out*reach*.42+right*width*.72+up*height*.32]
        mid=anchor+out*reach*.63+up*(height*.60+width*.18)
        for j in range(6):
            k=(j+1)%6;col=(.77,.69,.66) if j in [2,3] and i<9 else (.61+.07*t,.81,.72)
            part.face([p[j],p[k],mid],6,(out.x*.26,out.y*.26,.9),col)
