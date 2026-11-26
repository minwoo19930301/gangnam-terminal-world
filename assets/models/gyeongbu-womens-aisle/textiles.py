"""Original embroidered knits, scrolling paisley and botanical silk for the eighth-floor display."""
import math
import numpy as np
from atlas import png
from wool import swatch as base_swatch

N=256
Y,X=np.mgrid[0:N,0:N]/N
Y=1-Y
PALETTE=[(62,66,62),(62,99,81),(203,175,126),(203,199,181),(187,190,185),(161,120,72),
         (48,62,78),(238,227,204),(145,160,99),(91,50,118),(225,111,47),(125,54,150),
         (224,222,197),(155,149,143),(166,62,71),(249,243,219)]
BASE=[(60,65,61),(40,93,80),(150,143,133),(204,202,185),(187,190,185),(129,99,67),
      (48,56,70),(230,225,211),(111,112,112),(73,88,104),(185,137,78),(155,144,149),
      (115,98,84),(79,84,69),(153,63,71),(249,243,219)]


def stamp(image,mask,colour,alpha=1):
    coverage=np.clip(mask*alpha,0,1)[:,:,None]
    image[:]=image*(1-coverage)+np.asarray(colour)*coverage


def disc(x,y,rx,ry,angle=0):
    dx=X-x;dy=Y-y;c=math.cos(angle);s=math.sin(angle)
    f=((c*dx+s*dy)/rx)**2+((-s*dx+c*dy)/ry)**2
    return np.clip((1.03-f)*10,0,1)


def segment(a,b,r):
    dx=b[0]-a[0];dy=b[1]-a[1]
    t=np.clip(((X-a[0])*dx+(Y-a[1])*dy)/(dx*dx+dy*dy+1.e-9),0,1)
    return np.clip((r+.0024-np.hypot(X-(a[0]+t*dx),Y-(a[1]+t*dy)))/.003,0,1)


def stroke(image,points,width,colour):
    mask=np.zeros_like(X)
    for a,b in zip(points,points[1:]):mask=np.maximum(mask,segment(a,b,width))
    stamp(image,mask,colour)


def leaf(image,cx,cy,size,angle,colour,vein):
    # Two tapered sides meet at the tip, with a fine central vein stitched on top.
    c,s=math.cos(angle),math.sin(angle)
    xx=X-cx;yy=Y-cy
    along=(xx*c+yy*s)/size;cross=(-xx*s+yy*c)/size
    envelope=np.maximum(0,1-along*along)*.32
    mask=np.clip((envelope-np.abs(cross))/.035,0,1)*(abs(along)<1)
    stamp(image,mask,colour)
    stroke(image,[(cx-.83*size*c,cy-.83*size*s),(cx+.82*size*c,cy+.82*size*s)],size*.026,vein)


def flower(image,x,y,scale,petal,centre,rotation=0):
    for j in range(6):
        t=j*math.tau/6+rotation
        stamp(image,disc(x+.45*scale*math.cos(t),y+.45*scale*math.sin(t),.48*scale,.23*scale,t),petal)
        stamp(image,disc(x+.47*scale*math.cos(t),y+.47*scale*math.sin(t),.27*scale,.064*scale,t),centre,.58)
    stamp(image,disc(x,y,scale*.17,scale*.16),centre)


def botanical(image,sage):
    stems=[(.15,.16,.39,.77),(.50,.02,.72,.59),(.75,.42,.91,.95)] if not sage else [(.47,.42,.55,.74),(.47,.42,.40,.63),(.47,.45,.64,.64)]
    for i,(a,b,c,d) in enumerate(stems):
        pts=[(a+(c-a)*t+.052*math.sin(t*2.7+i),b+(d-b)*t) for t in np.linspace(0,1,12)]
        stalk=(110,97,50) if sage else (65,95,78)
        stroke(image,pts,.005 if sage else .007,stalk)
        for j in range(2,10,2):
            x,y=pts[j];ang=(.48 if j%4==0 else 2.61)+i*.12
            size=.037 if sage else .073
            tone=([125,123,55] if j%4 else [181,157,82]) if sage else ([79,132,98] if j%4 else [101,153,129])
            leaf(image,x+size*.87*math.cos(ang),y+size*.87*math.sin(ang),size,ang,tone,stalk)
        x,y=pts[-1]
        petal=([219,179,100] if i%2==0 else [190,143,99]) if sage else ([87,129,168] if i%2==0 else [198,104,111])
        flower(image,x,y,.039 if sage else .09,petal,(229,203,142),i*.43)


def paisley(image):
    # A teardrop with an inward curling tip, echoed by smaller block-print stems and rosettes.
    for cx,cy,scale,angle in [(.22,.32,.25,-.18),(.69,.72,.23,.65),(.83,.18,.12,-.45),(.14,.89,.12,.73)]:
        def point(x,y):
            c,s=math.cos(angle),math.sin(angle)
            return (cx+scale*(x*c-y*s),cy+scale*(x*s+y*c))
        loop=[]
        for t in np.linspace(0,math.tau,47):
            a=.64*math.cos(t);b=math.sin(t)
            a*=.76+.26*(1-b)
            if b>0:a+=.61*b*b
            loop.append(point(a,b))
        stroke(image,loop,.009,(203,164,78));stroke(image,[(cx+(a-cx)*.82,cy+(b-cy)*.82) for a,b in loop],.0045,(133,177,151))
        for t in np.linspace(0,math.tau,15,endpoint=False):
            i=round((t/math.tau)*(len(loop)-1));x,y=loop[i]
            stamp(image,disc(x,y,.008,.009),[236,205,114])
        spiral=[point(.02+.45*(1-j/24)*math.cos(j*.23),.19+.54*(1-j/24)*math.sin(j*.23)) for j in range(25)]
        stroke(image,spiral,.007,(218,142,107))
        flower(image,cx,cy,scale*.36,(166,107,148),(225,195,101),angle)
    for x,y in [(.47,.35),(.48,.98),(.94,.48),(.16,.68),(.59,.08)]:
        flower(image,x,y,.053,(137,144,119),(224,178,86),.2)


def maps(folder):
    rng=np.random.default_rng(80221)
    sheets=[np.empty((1024,1024,3),np.uint8) for _ in range(4)]
    for i in range(16):
        rgb,params,emit,norm=base_swatch(i,rng)
        if i in [8,9,10,11,12,13,14]:
            result=np.broadcast_to(np.array(PALETTE[i],float),(N,N,3)).copy()
            if i==8:botanical(result,True)
            if i==9:paisley(result)
            if i==12:
                botanical(result,False)
                for x,y in [(.15,.47),(.40,.27),(.58,.88),(.86,.41),(.93,.73),(.31,.91)]:
                    leaf(result,x,y,.058,.86 if x>.52 else 2.42,(123,150,106),(82,109,91))
                    flower(result,x-.036,y+.041,.042,(166,129,148),(235,201,142),x*4)
            if i in [9,12]:
                quarter=result.reshape(N//2,2,N//2,2,3).mean(axis=(1,3))
                result=np.tile(quarter,(2,2,1))

            ix=X*N;iy=Y*N
            weave=1.5*np.cos((ix+iy*.65)*2.15)+1.0*np.cos(iy*2.91)+rng.normal(0,.67,(N,N))
            if i in [8,10,11]:
                stitches=np.cos(ix*.80+.42*np.sin(iy*.65))*(1+np.cos(iy*1.15))*.9
                weave+=stitches
            if i==13:weave+=1.08*np.cos((iy-ix)*1.21)
            rgb=np.uint8(np.clip(result+weave[:,:,None],0,255))
            rough={8:.91,9:.79,10:.92,11:.89,12:.57,13:.88,14:.87}[i]
            params[:,:,1]=round(255*rough);params[:,:,2]=0
        else:
            delta=np.array(PALETTE[i])-np.array(BASE[i])
            rgb=np.uint8(np.clip(rgb.astype(float)+delta,0,255))
        if i==13:
            fur=fur_patch(rng)
            rows=int(N*.42)
            rgb[:rows]=fur[np.linspace(0,N-1,rows).astype(int)]
            params[:rows,:,1]=218
        x=(i%4)*N;y=(3-i//4)*N
        for sheet,tile in zip(sheets,[rgb,params,emit,norm]):sheet[y:y+N,x:x+N]=tile
    for key,sheet,step in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if step>1:
            h,w,_=sheet.shape;sheet=sheet.reshape(h//step,step,w//step,step,3).mean(axis=(1,3))
            if key=='weave-normal':
                v=sheet/127.5-1;v/=np.maximum(1.e-7,np.linalg.norm(v,axis=2,keepdims=True));sheet=(v+1)*127.5
            sheet=np.uint8(np.clip(sheet,0,255))
        png(folder/(key+'.png'),sheet)

def fur_patch(rng):
    # Fine overlaid curved fibres. The upper part of the taupe swatch is reserved for this trim.
    bg=40+4*np.sin(X*31+Y*9)+3*np.cos(X*51-Y*7)+rng.normal(0,2,(N,N))
    fur=np.stack([bg+5,bg+3,bg+2],axis=-1)
    for i in range(700):
        x,y=rng.uniform(-.14,1.12),rng.uniform(-.17,1.04)
        lean=.024+.083*math.sin(x*8+y*5)+rng.uniform(-.036,.036)
        rise=rng.uniform(.065,.240)
        bend=rng.uniform(-.023,.044)
        points=[(x,y),(x+lean*.34+bend,y+rise*.43),(x+lean*.76+bend*.60,y+rise*.78),(x+lean,y+rise)]
        colour=rng.uniform(45,124) if i%5 else rng.uniform(130,171)
        for j,(a,b) in enumerate(zip(points,points[1:])):
            mask=segment(a,b,(.0028 if i%5 else .0020)*(1-.25*j))
            stamp(fur,mask,(colour*1.045,colour*1.01,colour*.97),.44+.17*j)
    return np.uint8(np.clip(fur,0,255))
