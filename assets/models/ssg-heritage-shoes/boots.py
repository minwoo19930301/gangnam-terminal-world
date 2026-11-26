"""Suede Chelsea and two-eyelet chukka samples, shaped over different ankle lasts."""

from bisect import bisect_right
from math import cos, exp, pi, sin, sqrt
from mathutils import Vector

# Section height, longitudinal centre, half-length and half-width in metres.
LAST = [
    (.019, -.001, .145, .050), (.027, -.001, .146, .0518),
    (.034, .000, .145, .0525), (.044, .002, .143, .0527),
    (.054, .007, .137, .0518), (.062, .014, .129, .0503),
    (.072, .026, .117, .0482), (.083, .040, .103, .0456),
    (.099, .051, .092, .0429), (.116, .060, .0816, .0407),
    (.135, .066, .0753, .0396), (.153, .070, .0708, .0390),
    (.175, .072, .0682, .0398), (.195, .073, .0661, .041),
    (.211, .074, .0645, .042),
]
H = [r[0] for r in LAST]


def blend(h):
    i=min(len(H)-2,max(0,bisect_right(H,h)-1))
    t=(h-H[i])/(H[i+1]-H[i])
    return tuple(a+(b-a)*t for a,b in zip(LAST[i][1:],LAST[i+1][1:]))


def rounded(v,p):
    return (1 if v>=0 else -1)*abs(v)**p


def upper(h,a,style,offset=0):
    cy,ry,rx=blend(h);t=(h-H[0])/(H[-1]-H[0])
    st=sin(a);ct=cos(a)
    # A real ankle shaft is shorter fore-to-aft than the lower vamp.
    cy+=.0076*t**1.72;ry-=.0106*t**1.70;rx-=.0045*t**2
    y=cy+ry*rounded(st,.91)
    # A narrowing waist and offset ball make the two sides of a shoe distinct.
    ball=(.0031*exp(-((y+.060)/.043)**2))*(1-t)
    w=rx*(.94+.08*exp(-((y+.090)/.052)**2)-.060*exp(-((y-.026)/.036)**2))
    x=ball+(w+offset)*rounded(ct,.91)
    y+=offset*st
    toe_spring=.0054*max(0,-st)**3*(1-t)**4
    z=h+toe_spring
    if style=="chelsea":
        z=.019+.855*(z-.019)+t**3*(.0042*st+.0046*(1-ct*ct))-.0034*t**6*abs(ct)**3
    else:
        z=.017+.686*(z-.017)+.0055*t*t*st
    return Vector((x,y,z))


def section(name,rows,surface,color,work,uv=None,closed=False,skip=None):
    part=work["part"]
    n=len(rows[0]);faces=[]
    for j in range(len(rows)-1):
        for i in range(n if closed else n-1):
            if skip and skip(j,i):continue
            k=(i+1)%n
            faces.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
    obj=part(name,[p for row in rows for p in row],faces,color,True)
    obj["finishSwatch"]=surface
    if uv:
        obj["mappedSurface"]=True
        layer=obj.data.uv_layers.new(name="Product surface")
        for loop in obj.data.loops:
            j,i=divmod(loop.vertex_index,n)
            layer.data[loop.index].uv=uv(i/(n-1),j/(len(rows)-1))
    return obj


def tag(obj,surface):
    obj["finishSwatch"]=surface
    return obj


def tube_rows(path,radius,n):
    pts=list(map(Vector,path));rows=[]
    for i,p in enumerate(pts):
        tangent=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        ref=Vector((0,0,1)) if abs(tangent.z)<.85 else Vector((0,1,0))
        u=tangent.cross(ref).normalized();v=tangent.cross(u)
        rows.append([p+radius*(u*cos(j*2*pi/n)+v*sin(j*2*pi/n)) for j in range(n)])
    return rows


def thread(path,color,name,work,radius=.00038,spacing=.0043):
    pts=list(map(Vector,path))
    if len(pts)<2:return
    lengths=[0.]
    for a,b in zip(pts,pts[1:]):lengths.append(lengths[-1]+(b-a).length)
    def sample(distance):
        i=min(len(pts)-2,max(0,bisect_right(lengths,distance)-1))
        if lengths[i+1]==lengths[i]:return pts[i]
        return pts[i].lerp(pts[i+1],(distance-lengths[i])/(lengths[i+1]-lengths[i]))
    verts=[];faces=[];n=5
    for j in range(int(lengths[-1]/spacing)):
        a=sample(j*spacing+.00045);b=sample(j*spacing+spacing*.80)
        a.z-=radius*.16;b.z-=radius*.16
        mid=(a+b)*.5;mid.z+=radius*.28
        ix=len(verts);rows=tube_rows([a,mid,b],radius,n)
        verts.extend(p for row in rows for p in row)
        for k in range(2):
            for i in range(n):
                m=(i+1)%n;faces.append((ix+k*n+i,ix+k*n+m,ix+(k+1)*n+m,ix+(k+1)*n+i))
    if faces:
        obj=tag(work["part"](name,verts,faces,color,True),"thread")
        obj["stitchSection"]=n


def sole(style,work,outsole):
    rows=[];n=72
    for dz,spread in [(0,-.0008),(.0014,.0013),(.0044,.0021),(.014,.0026),
                       (.016,.0029),(.0173,.0020),(.0194,.0015),(.020,-.0001)]:
        row=[]
        for i in range(n+1):
            a=2*pi*i/n
            p=upper(H[0],a,style,spread)
            toe=.0055*max(0,-sin(a))**3
            arch=.0068*exp(-((p.y-.035)/.038)**2)
            p.z=dz+toe+arch*(1-dz/.023)
            row.append(p)
        rows.append(row)
    section("Rubber foxing with recessed waist",rows,"rubber",outsole,work)
    rings=[]
    for scale in [.002,.28,.56,.81,.98,1]:
        ring=[]
        for p in reversed(rows[0][:-1]):
            ring.append((p.x*scale,p.y*scale,p.z-.0005))
        rings.append(ring)
    section("Moulded rubber underside",rings,"rubber",outsole,work,closed=True)
    # Small diamonds leave genuine channels on the raised sample's bottom.
    verts=[];faces=[]
    for ix in range(-4,5):
        for iy in range(-12,13):
            x=ix*.010;y=iy*.0104
            if (x/.044)**2+(y/.133)**2>1 or .035<y<.058:continue
            z=.0055*max(0,-y/.145)**3+.0065*exp(-((y-.035)/.038)**2)
            k=len(verts)
            for level,rad in [(z+.0006,.00483),(z-.0008,.00438)]:
                verts.extend([(x+rad,y,level),(x,y+rad*1.05,level),(x-rad,y,level),(x,y-rad*1.05,level)])
            for j in range(4):faces.append((k+j,k+(j+1)%4,k+4+(j+1)%4,k+4+j))
            faces.append((k+7,k+6,k+5,k+4))
    tread=tag(work["part"]("Recessed diamond tread blocks",verts,faces,outsole),"rubber")
    tread["flatTread"]=True


def bounds(h):
    # Side gores widen from a curved bottom corner into the straight upper
    # edge. The leather panels terminate against them, leaving a true inlay.
    s=max(0,min(1,(h-.075)/(.211-.075)))
    width=(.83+.15*s)*(1-(1-s)**7)**.65
    center=-.16+.23*s
    return center-width,center+width


def wrist_lining(style,work):
    n=72
    rows=[]
    for h,inset,drop in [(.2097,0,0),(.2114,0,0),(.2114,-.0015,.0002),(.207,-.0021,.003),
                          (.18,-.0034,.004),(.13,-.004,.008),(.093,-.005,.009)]:
        row=[]
        for j in range(n+1):
            a=2*pi*j/n;p=upper(h,a,style,inset);p.z-=drop;row.append(p)
        rows.append(row)
    section("Folded collar edge and recessed leather lining",rows,"lining","6B5240",work)
    opening=[upper(.096,2*pi*j/n,style,-.0051) for j in range(n)]
    floor=[(p.x,p.y,.044) for p in opening]
    p=work["part"]("Heel cup below the ankle opening",floor,[tuple(range(n))],"423329")
    tag(p,"lining")


def pull_tab(work):
    rows=[];n=36
    # A broad woven tape forms an open loop at the rear of the top line.
    for i in range(n+1):
        a=2*pi*i/n
        anchor=upper(.209,pi/2,"chelsea")
        y=anchor.y+.0047*(1-cos(a))+.006*sin(a)
        z=anchor.z-.001+.0155*(1-cos(a))+.0009*sin(a)
        rows.append([(-.007,y,z),(-.006,y-.0015,z),(.006,y-.0015,z),(.007,y,z)])
    section("Folded black heel pull with a finger opening",rows,"elastic","302C29",work)
    for x in [-.0048,.0048]:
        thread([Vector((x,row[1][1],row[1][2]+.00038)) for row in rows],"62584A","Fine selvedge on the pull loop",work,.00028,.0027)


def boot(style,tone,gore,outsole,work):
    sole(style,work,outsole)
    tagname="Brushed suede Chelsea" if style=="chelsea" else "Suede two-eyelet chukka"
    if style=="chelsea":
        hs=sorted(set(H+[.075,.078,.082,.088,.105,.145,.167,.203]))
        # Positive and negative flanks, toe, heel; same boundary samples.
        for sector,count in [('right',22),('back',26),('left',22),('toe',30)]:
            rows=[]
            for h in hs:
                lo,hi=bounds(h)
                aa,bb={'right':(lo,hi),'back':(hi,pi-hi),'left':(pi-hi,pi-lo),'toe':(pi-lo,2*pi+lo)}[sector]
                rows.append([upper(h,aa+(bb-aa)*j/count,style, -.00028 if sector in ('left','right') else 0) for j in range(count+1)])
            panel=sector in ('left','right')
            section(tagname+(" · elastic gore" if panel else " · leather panel"),rows,"elastic" if panel else "suede",gore if panel else tone,work,lambda u,v:(u,v))
        for side in (0,1):
            border=[]
            for h in reversed(hs):
                if h<.075:continue
                a=bounds(h)[0];border.append(upper(h,a if not side else pi-a,style,.0007))
            for h in hs:
                if h<.078:continue
                a=bounds(h)[1];border.append(upper(h,a if not side else pi-a,style,.0007))
            seam=work["tube"]("Suede piping around inset gore",border,.00073,tone,6);tag(seam,"suede")
            thread(border,"A89A7F" if tone=="D0C3AB" else "6D6558","Matched thread around the elastic",work)
        for a in [0,pi]:
            thread([upper(h,a,style,.00085) for h in [.022,.03,.04,.05,.06,.074]],"9B8C72","Quarter heel seam",work)
        pull_tab(work)
    else:
        hs=sorted(set(H+[.085,.155,.202]))
        rows=[[upper(h,-pi/2+2*pi*j/80,style) for j in range(81)] for h in hs]
        def throat(j,i):
            delta=min(i+.5,80-i-.5)*2*pi/80
            h=hs[j]
            if h>=.116 and delta<(.10+.13*(h-.116)/.095):return True
            a=-pi/2+(i+.5)*2*pi/80
            if cos(a)<0:a=pi-a
            a=(a+pi)%(2*pi)-pi
            facing_start=-.99-.28*min(1,max(0,(h-.07)/.14))
            return .102<h<.204 and facing_start+.11<a<facing_start+1.76
        section(tagname+" · vamp and quarters",rows,"suede",tone,work,lambda u,v:(u,v),skip=throat)
        tongue=[]
        for j in range(13):
            h=.106+.108*j/12
            row=[]
            for i in range(13):
                a=-pi/2-.335+.67*i/12
                p=upper(h,a,style,-.0018)
                p.z+=.0016*j/12*(1-abs(i-6)/6)
                row.append(p)
            tongue.append(row)
        section("Recessed suede tongue under open lacing",tongue,"suede",tone,work,lambda u,v:(u,v))
        thread(tongue[-1],"AF9878","Visible tongue hem",work)

        for side in (1,-1):
            rows=[]
            for j in range(12):
                h=.070+j*.140/11
                front=-.99-.28*j/11
                row=[upper(h+.017*(i/17)*(1-j/11),front+1.88*i/17 if side==1 else pi-(front+1.88*i/17),style,.0019) for i in range(18)]
                if side==-1:row.reverse()
                rows.append(row)
            section("Raised suede lacing quarter",rows,"suede",tone,work,lambda u,v:(u,v))
            edge=[row[0 if side==1 else -1] for row in rows]
            seam=edge[::-1]+(rows[0][1:] if side==1 else rows[0][-2::-1])
            thread(seam,"BFAB82","Twin-row quarter stitching",work,.00044)
        for k,h in enumerate([.147,.183]):
            pts=[]
            for i in range(17):
                a=-pi/2-.38+.76*i/16
                p=upper(h+.0018*sin(i*pi/16),a,style,.0022);p.z+=.0017*sin(i*pi/16);pts.append(p)
            lace=work["tube"]("Two round waxed laces",pts,.00140,"695137",8);tag(lace,"thread")
            for p in [pts[0],pts[-1]]:
                eye=work["tube"]("Punched eyelet shadow",[(p.x,p.y+.0014,p.z),(p.x,p.y-.0002,p.z+.0004)],.00235,"382A20",10);tag(eye,"lining")
    wrist_lining(style,work)
    collar=[upper(.2085,2*pi*j/120,style,.0007) for j in range(121)]
    thread(collar,"B49D7A" if style=="chukka" else "9B8A72","Fine top-line stitching",work,.00036,.0042)
    # Raised apron and discrete thread follow the low vamp around the toe.
    for offset in ([0,.0042] if style=="chukka" else [0]):
        path=[]
        for i in range(85):
            a=-pi+.29+(pi-.58)*i/84
            h=.044+offset+.018*abs(cos(a))**2
            p=upper(h,a,style,.00063);p.z+=.00065;path.append(p)
        if not offset:tag(work["tube"]("Raised apron seam",path,.00077,tone,6),"suede")
        thread(path,"C4AE84" if style=="chukka" else ("A99A80" if tone=="D0C3AB" else "6B675A"),
               "Sewn apron · individual saddle stitches",work,.00047,.0039)
