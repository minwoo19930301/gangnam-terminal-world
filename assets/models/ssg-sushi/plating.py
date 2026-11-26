"""Editable nigiri, vegetables and garnish from the restaurant's guest photographs."""

from math import cos, sin, pi, sqrt
from random import Random

TAU=pi*2
# Widths and drape differ along each restaurant cut. Values are half widths.
# The blunt rear corners of the white fish and scalloped octopus are conspicuous.
CUTS={
    '흰살':(8,.092,.038,(.65,.97,1,.88,.61,.36),.010,.004),
    '껍질 흰살':(3,.092,.034,(.76,.96,1,.83,.62,.18),.012,.005),
    '분홍살':(7,.098,.043,(.72,1,.98,.70,.43,.16),.012,.005),
    '끝 흰살':(3,.093,.035,(.58,.96,1,.90,.58,.26),.011,.006),
    '연어':(1,.100,.041,(.78,1,.96,.82,.58,.18),.014,.009),
    '참치':(2,.098,.042,(.41,.87,.98,1,.79,.46),.015,.009),
    '문어':(9,.095,.041,(.37,.83,1,.88,.63,.14),.019,.012),
    '새우':(6,.084,.040,(.53,.95,1,.81,.53,.29),.016,.003),
    '그을린 흰살':(4,.080,.043,(.62,.93,.98,1,.88,.69),.021,.003),
    '김으로 감싼 와규':(10,.088,.037,(.84,1,.79,.77,1,.72),.019,.012),
}


def curve(values,t):
    p=max(0,min(.999999,t))*(len(values)-1);i=int(p);f=p-i
    return values[i]*(1-f)+values[i+1]*f


def grid(nx,ny):
    return [(i*ny+j,(i+1)*ny+j,(i+1)*ny+j+1,i*ny+j+1)
            for i in range(nx-1) for j in range(ny-1)]


def closed_cut(mesh,mat,name,fn,index,nx=22,ny=11):
    coords=[];uv=[];faces=grid(nx,ny);count=nx*ny
    for level in [0,1]:
        for i in range(nx):
            for j in range(ny):
                u=i/(nx-1);v=j/(ny-1)
                coords.append(fn(u,v,level));uv.append((u,v))
    sides=[tuple(i+count for i in f) for f in faces]
    sides.extend(tuple(reversed(f)) for f in faces)
    edge=list(range(0,count,ny))+list(range(count-ny+1,count))+list(range(count-ny-1,ny-2,-ny))+list(range(ny-2,0,-1))
    sides.extend((a,b,b+count,a+count) for a,b in zip(edge,edge[1:]+edge[:1]))
    return mesh(name,coords,sides,mat,True,index,uv)


def grains(mesh,rice,at,seed):
    rng=Random(seed)
    def signed_pow(a,p):return (1 if a>=0 else -1)*abs(a)**p
    # A soft body supports the individual grains. The lower face touches
    # the serving dish; only its exposed outer walls need separate kernels.
    rows=[]
    for height,scale in [(0,.56),(.002,.82),(.007,.97),(.015,1),(.021,.94),(.025,.77),(.027,.30)]:
        rows.append([at(scale*.033*signed_pow(cos(TAU*j/24),.76),
                        scale*.014*signed_pow(sin(TAU*j/24),.77),height) for j in range(24)])
    vs=sum(rows,[])
    fs=[(i*24+j,i*24+(j+1)%24,(i+1)*24+(j+1)%24,(i+1)*24+j)
        for i in range(len(rows)-1) for j in range(24)]
    fs.extend([tuple(range(23,-1,-1)),tuple(range(len(vs)-24,len(vs)))])
    mesh('쥔 샤리 · 밥심',vs,fs,rice[0],True)
    vs=[];fs=[]
    for layer,(count,z,radius) in enumerate([(32,.004,.83),(35,.0095,.96),(36,.015,1),(32,.020,.91)]):
        for i in range(count):
            a=TAU*((i+.47*(layer%2)+rng.uniform(-.16,.16))/count)
            dx,dy=signed_pow(cos(a),.76),signed_pow(sin(a),.77)
            cx=.033*radius*dx;cy=.014*radius*dy
            cz=z+rng.uniform(-.0015,.0015)
            theta=a+pi/2+rng.uniform(-.67,.67)
            tilt=rng.uniform(-.6,.6)
            lx,ly=rng.uniform(.0027,.0037),rng.uniform(.00135,.00186)
            start=len(vs);n=6
            # Three elliptical sections along the grain's long axis, pinched
            # asymmetrically at its two ends and pitched into adjacent rows.
            for p,rad in [(-1,.17),(-.52,.94),(.32,1),(1,.31)]:
                for k in range(n):
                    aa=TAU*k/n;l=p*lx;w=ly*rad*cos(aa);h=.00165*rad*sin(aa)
                    vs.append(at(cx+l*cos(theta)-w*sin(theta),cy+l*sin(theta)+w*cos(theta),
                                 cz+h+l*tilt))
            for j in range(3):
                for k in range(n):
                    m=start+j*n+k;nn=start+j*n+(k+1)%n
                    fs.append((m,nn,nn+n,m+n))
            fs.append(tuple(start+k for k in reversed(range(n))))
            fs.append(tuple(start+3*n+k for k in range(n)))
    mesh('쌀알 · 네 겹의 결',vs,fs,rice[1+seed%3],True)


def nigiri(mesh,skin,rice,orange,at,kind,seed):
    idx,length,width,widths,thickness,sweep=CUTS[kind]
    grains(mesh,rice,at,seed)
    phase=(seed%7)*.42
    def fn(u,v,layer):
        t=2*u-1;s=2*v-1;outer=abs(s);end=abs(t)
        # Free ends sag past the rice, and the outside of each cut curves
        # independently. Slice thickness survives in the side silhouette.
        a=t*length*.5+.0025*s+.0032*s*(1-u)-.003*t*outer*outer*(.65+.35*u)
        b=s*width*.5*curve(widths,u)+sweep*sin(pi*u)+.0013*sin(11*u+phase)*s
        h=.020+.0097*(1-t*t)+thickness*(1-.57*s*s)-.0128*end**3-.0077*outer**2
        if kind in ('그을린 흰살','김으로 감싼 와규'):
            b+=.0017*sin(u*32+v*6)*outer
        if kind=='문어':
            wav=.0017*sin(u*37+phase)*max(s,0)**3
            b+=wav;h+=.0021*cos(4*u)*max(s,0)**2
        elif kind=='새우':
            h+=.00185*sin(2*pi*(6*u+.45*outer))-.0030*(1-outer)**5
        elif kind in ('그을린 흰살','김으로 감싼 와규'):
            h+=.0024*sin(20*u+.9*v)*(.7+.3*cos(8*v))+.0015*cos(13*v+u*7)+.00085*sin(40*u+17*v)
        elif kind=='분홍살':a+=.006*s*u*u
        if not layer:
            h-=thickness*(.21+.66*(1-outer**2))*(.61+.39*(1-t*t))+.0014
        return at(a,b,h)
    closed_cut(mesh,skin,kind+' · 네타',fn,idx)
    if kind=='김으로 감싼 와규':
        vs=[];uv=[];lengths=[(-.019,.007),(-.0192,.022),(-.0170,.039),(-.012,.045),
                              (-.005,.0475),(.003,.0488),(.010,.0478),(.018,.042),
                              (.022,.033),(.019,.016),(.016,.005)]
        for i,(b,h) in enumerate(lengths):
            for j in range(5):
                u=j/4;off=(u-.5)*.015+.004*(i/10-.5)
                vs.append(at(off,b+.004,h+.00045*sin(j*2+i*.51)))
                uv.append((u,i/(len(lengths)-1)))
        mesh('볶은 소고기를 두른 김 띠',vs,list(reversed(grid(len(lengths),5))),skin,True,11,uv)
    if kind=='새우':
        for side in [-1,1]:
            # Split tail fans have a narrow proximal joint and blunt ruffled
            # ends. Both lobes share the orange cuticle, with raised radial ribs.
            def tail(u,v,layer):
                radius=curve([.0013,.0026,.0051,.0058,.0037],u)
                a=.036+.029*u-.004*(2*v-1)**2*u
                b=side*(.001+.0063*u)+(2*v-1)*radius
                h=.024-.015*u+.0027*(2*v-1)**2+.00075*cos(13*v)*u
                return at(a,b,h-(1-layer)*.0009)
            closed_cut(mesh,skin,'익힌 새우 · 꼬리날',tail,16,11,8)
            for k in [-1,0,1]:
                v=.5+.36*k
                coords=[tail(u,v,1) for u in [.12,.38,.71,.97]]
                orange('꼬리날의 주황색 결',coords,.00045)


def garnish(mesh,skin,wasabi,x,y,z,seed):
    rng=Random(seed)
    for i in range(7):
        angle=i*2.39;cx=x+.0075*sin(i*2.2);cy=y+.0061*cos(i*2.17)
        def leaf(u,v,layer):
            a=(2*u-1)*(.016+.0016*(i%3))
            b=(2*v-1)*(.009+.003*(i%2))*curve((.06,.81,1,.91,.13),u)
            h=.00185*i+.004*(2*v-1)**2+.0038*sin(i*.75+u*pi*1.45)*v+.0014*cos(13*u)*v
            return (cx+a*cos(angle)-b*sin(angle),cy+a*sin(angle)+b*cos(angle),z+h+.00055*layer)
        closed_cut(mesh,skin,'결 따라 접힌 초생강',leaf,12,12,7)
    cx=x+.012;cy=y-.035;vs=[];fs=[];n=30
    for j,(r,h) in enumerate([(.0145,0),(.0155,.004),(.012,.009),(.0082,.014),(.0041,.018),(.0007,.0205)]):
        for k in range(n):
            a=TAU*k/n+.043*(j%2);f=r*(1+rng.uniform(-.15,.15))
            vs.append((cx+f*cos(a),cy+f*.83*sin(a),z+h+rng.uniform(-.0015,.0015)))
            if j:fs.append(((j-1)*n+k,(j-1)*n+(k+1)%n,j*n+(k+1)%n,j*n+k))
    fs.append(tuple(range(len(vs)-n,len(vs))))
    mesh('내린 고추냉이 · 거친 단면',vs,fs,wasabi,False)


def accompaniments(mesh,skin,oval,seed,x,y,z):
    rng=Random(seed)
    for i,(px,py,angle,index) in enumerate([(-.014,.011,-.6,14),(-.008,.016,.25,14),
                                           (-.021,.001,-.2,14),(.017,-.012,1.0,15),
                                           (.020,-.003,.45,15),(.016,.008,.15,15)]):
        def squash(u,v,layer):
            a=(2*u-1)*(.023 if index==14 else .017)
            b=(2*v-1)*(.011 if index==14 else .008)*curve((.55,1,.89,.92,.35),u)
            h=.003*(i%3)+.0025*sin(pi*v)+.003*cos(u*7+.5*i)
            return (x+px+a*cos(angle)-b*sin(angle),y+py+a*sin(angle)+b*cos(angle),z+h+.0042*layer)
        closed_cut(mesh,skin,'단무지 얇은 조각' if index==14 else '가지 절임 조각',squash,index,9,6)
    for i in range(2):
        oval('마늘 장아찌',x-.006+i*.011,y-.016+i*.002,z+.004+i*.002,.010,.007,.0055,16)
    for i in range(8):
        oval('참깨',x+.018+rng.uniform(-.010,.012),y+rng.uniform(-.007,.010),z+.016,.0016,.0008,.00072,16)
