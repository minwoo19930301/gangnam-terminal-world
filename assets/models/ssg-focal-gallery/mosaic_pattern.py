"""An original brick drawing of the Han River. Cell coordinates use a 160×256 stud field."""
import math,random
from math import cos,sin,exp,pi,sqrt
W,H=160,256
# ABS and translucent shades used in the drawing, expressed as sRGB.
PALETTE=['091421','10233b','193653','2d4966','324467','715374','ab747f','d88d8a','e9ad86',
         '233743','3b5055','59756c','927e71','e6cb8c','fbe5aa','fcf2d7','fabe4f','f59b36','c45a44',
         'bb567a','e287a8','8a65a3','7480b2','6696bd','6bc5c8','9edcbd','4c8b85','2b6571','254a66',
         '425779','1a324e','845247','e6af44','83b2d8','d3e6ef','bcb785','546c7a','212937','363340']
def draw():
    rng=random.Random(170501);field=[[0]*W for _ in range(H)];lit=[[0]*W for _ in range(H)]
    def put(x,y,col,glow=0):
        ix,iy=int(round(x)),int(round(y))
        if 0<=ix<W and 0<=iy<H:field[iy][ix]=col;lit[iy][ix]=glow
    def line(x1,y1,x2,y2,col,light=0,density=1,width=1):
        steps=math.ceil(max(abs(x2-x1),abs(y2-y1))*1.65)
        for i in range(steps+1):
            if density<1 and rng.random()>density:continue
            t=i/max(1,steps);x=x1+(x2-x1)*t;y=y1+(y2-y1)*t
            for w in range(width):put(x,y+w,col,light)
    # Early evening sky above the north bank and a dark rippled water foreground.
    for y in range(H):
        for x in range(W):
            n=rng.random();wave=sin(x*.10+sin(y*.46)*3.4)+.74*sin(x*.041-y*.83)
            if y<92:
                grad=y/92
                col=0 if wave<-.6 else 1 if wave<.36 else 2 if grad>.4 else 30
                if n>.972 and wave>.70:col=27 if grad<.8 else 36
            else:
                sky=min(1,(y-92)/145);band=sky*6+sin(x*.022+y*.013)*.55+n*.79
                col=[7,6,5,4,3,2,1,0][max(0,min(7,int(band)))]
            put(x,y,col)
    # A traced silhouette with gaps for the riverbank, distinct apartment blocks and a radio mast.
    for x in range(W):
        horizon=94+4*sin(x*.044)+2.2*sin(x*.103+.8)
        for y in range(89,int(horizon)):put(x,y,9 if y%5 else 10)
    for i in range(39):
        x=rng.randrange(-2,W);w=rng.randrange(2,7);base=95+4*sin(x*.04)
        high=rng.choice([4,5,7,8,9,12,14])
        for j in range(w):
            for k in range(high):
                put(x+j,base+k,3 if j==0 else 9)
                if j%2==0 and k%3==1 and rng.random()<.4:put(x+j,base+k,12 if rng.random()<.65 else 13,1)
    line(120,102,120,119,10);line(119,116,121,116,11);put(120,120,18,2)
    # The bridge retreats toward the far right. Parallel edges and pier caps
    # follow the same perspective construction, including recesses between piers.
    def deck(x):return 110+22*(x/(W-1))
    piers=[(-6,10),(23,8),(51,6),(75,5),(97,4),(115,3),(130,2),(143,2),(154,1)]
    for x,width in piers:
        y=deck(x);foot=60+30*x/W
        for j in range(width):
            ix=x+j
            for k in range(int(foot),int(y-4)):
                mat=13 if j==0 else 12 if j<=1 else 10 if j<width-1 else 9
                put(ix,k,mat,1 if j==0 and (k+ix)%7!=0 else 0)
        line(x-2,foot,x+width,foot,10,width=2)
        line(x-2,y-4,x+width+2,y-4,12,0,1,2)
    for x in range(W):
        y=deck(x);thick=max(1,round(5-3*x/W))
        for j in range(thick):put(x,y+j-2,9 if j<thick-1 else 10)
        put(x,y+thick-1,13 if (x+3)%7 else 17,1)
        if x%4==1:put(x,y+thick,14,2)
    shades=[(20,19),(19,21),(22,23),(23,24),(24,25),(25,26),(16,17),(17,18)]
    # Parabolic fans cross the span; lower translucent pixels catch fragments
    # of pink and green rather than painting the water with solid bands.
    for i in range(93):
        x=i*W/91-2;y=deck(x)+2.;u=x/W
        col,shadow=shades[min(7,max(0,int((.15+u*.82)*8)))]
        span=14-6*u;rise=8.7-3.5*u;drop=23-9*u
        prev=(x,y)
        for k in range(1,23):
            t=k/22;cur=(x-span*t-.8*sin(pi*t),y+rise*4*t*(1-t)-drop*t*t)
            key=col if (i%3!=0 or t<.5)else shadow
            line(*prev,*cur,key,2 if (i+k)%5==0 else 1,.54 if t>.54 else .81);prev=cur
            if t>.85 and rng.random()<.5:put(cur[0]-rng.randrange(3),cur[1]-rng.randrange(3),shadow)
    # Short reflected fragments preserve the Han River's horizontally broken highlights.
    for x0,width in piers:
        top=60+30*x0/W
        for k in range(182):
            y=rng.uniform(2,top);fade=1-y/max(1,top);cx=x0+rng.gauss(0,1.6+5.1*fade)+sin(y*.63)
            if rng.random()<.72-fade*.32:
                line(cx,y,cx+rng.uniform(.3,2.7),y,32 if rng.random()<.44 else 12,1 if rng.random()<.32 else 0)
    for i in range(1150):
        x=rng.uniform(0,W);y=rng.uniform(7,89);wave=sin(y*.42+x*.051)+sin(y*.28-x*.21)
        if wave<.72 or rng.random()<(86-y)*.006:continue
        col=shades[min(7,int(x/W*8))][0];line(x,y,x+rng.uniform(1,4),y,col,1)
    def fire(cx,cy,rad,inner,bright,shadow,arms,bend):
        for k in range(arms):
            a=tau*k/arms+rng.uniform(-.064,.064);reach=rad*rng.uniform(.61,1.08);prev=(cx,cy)
            for j in range(1,24):
                t=j/23;rr=reach*t;xx=cx+cos(a+bend*t)*rr;yy=cy+sin(a+bend*t)*rr-.17*reach*t*t
                if (t>.16 or k%3==0) and rng.random()<.88-.18*t:
                    color=inner if t<.24 else bright if t<.69 and k%4 else shadow
                    line(*prev,xx,yy,color,3 if color==bright else 2,.90 if t<.72 else .71)
                prev=(xx,yy)
        put(cx,cy,15,3)
    tau=2*pi
    fire(43,203,26.5,15,23,21,30,.16)
    fire(113,221,20,16,14,17,27,-.21)
    for i in range(85):
        x,y=rng.randrange(W),rng.randrange(160,H)
        if rng.random()>.55:put(x,y,rng.choice([23,13,33]),1)
    return field,lit
