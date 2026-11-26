"""Original silk weave, gold-on-green brocade and floral chest embroidery."""
import math
import numpy as np
from atlas import png

N=256
Y,X=np.mgrid[0:N,0:N]/(N-1)
Y=1-Y
PALETTE=[(179,170,154),(226,222,211),(29,83,62),(94,109,142),(174,177,174),(104,79,64),
         (36,58,111),(240,234,220),(170,161,94),(240,234,220),(214,151,164),(160,194,184),
         (104,153,176),(201,198,204),(98,45,60),(247,241,222)]


def pen(tile,mask,colour):
    a=np.clip(mask,0,1)[:,:,None]
    tile[:]=tile*(1-a)+a*np.asarray(colour)


def oval(cx,cy,rx,ry,theta):
    dx=X-cx;dy=Y-cy;c=math.cos(theta);s=math.sin(theta)
    return np.clip((1-((dx*c+dy*s)/rx)**2-((-dx*s+dy*c)/ry)**2)*7,0,1)


def vine(tile,start,end,amplitude,tone,accent):
    a,b=start;c,d=end
    for j in range(37):
        t=j/36
        x=a+(c-a)*t+amplitude*math.sin(t*math.tau)
        y=b+(d-b)*t
        pen(tile,oval(x,y,.007,.010,0),tone)
        if j%6==3:
            sign=1 if j%12==3 else -1
            pen(tile,oval(x+.019*sign,y+.006,.025,.009,sign*.52),tone)
            pen(tile,oval(x+.018*sign,y+.006,.018,.002,sign*.52),accent)


def blossom(tile,x,y,r,colour,inner,turn=0):
    for i in range(5):
        a=math.tau*i/5+turn
        pen(tile,oval(x+.50*r*math.cos(a),y+.50*r*math.sin(a),r*.53,r*.29,a),colour)
        pen(tile,oval(x+.52*r*math.cos(a),y+.52*r*math.sin(a),r*.38,r*.065,a),inner)
    pen(tile,oval(x,y,r*.17,r*.17,0),inner)


def maps(folder):
    rng=np.random.default_rng(4222026)
    sheets=[np.empty((N*4,N*4,3),dtype=np.uint8) for _ in range(4)]
    thread=.8*np.cos(X*N*2.53+.28*np.cos(Y*N*1.69))+1.0*np.sin(Y*N*2.52)
    for i,colour in enumerate(PALETTE):
        a=np.broadcast_to(np.array(colour,float),(N,N,3)).copy()
        rough=[.69,.84,.36,.41,.32,.63,.52,.44,.33,.43,.40,.40,.42,.51,.63,.50][i]
        metal=.65 if i==4 else .17 if i==8 else 0
        if i==8:
            a[:]=[87,106,65]
            for xi in range(4):
                for yi in range(4):
                    x=(xi+.5+(yi%2)*.28)/4;y=(yi+.48)/4
                    vine(a,(x-.085,y-.14),(x+.075,y+.12),.021,(178,170,96),(214,196,132))
                    blossom(a,x,y,.043,(198,183,109),(107,119,74),xi*.6)
            quarter=a.reshape(N//2,2,N//2,2,3).mean(axis=(1,3));a=np.tile(quarter,(2,2,1))
        elif i==7:
            for x,y in [(.18,.25),(.49,.63),(.76,.29),(.94,.88)]:
                vine(a,(x-.11,y-.17),(x+.035,y+.045),.017,(233,228,215),(245,239,224))
                blossom(a,x,y,.046,(235,230,217),(245,239,226),x*4)
        elif i==9:
            for x,y,scale in [(.36,.35,.087),(.49,.53,.071),(.57,.74,.096),(.72,.62,.060),
                              (.49,.80,.047),(.73,.87,.055),(.28,.47,.061),(.29,.29,.035)]:
                vine(a,(x-.11,y-.18),(x+.045,y+.045),.018,(155,145,119),(215,202,168))
                blossom(a,x,y,scale,(185,174,147),(123,122,107),x*3)
        elif i==5:
            g=np.sin(X*66+.9*np.sin(Y*5)+1.2*np.sin(X*7))+np.sin(X*212+Y*8)*.45
            a+=g[:,:,None]*4
        elif i==0:
            g=np.sin(X*52+Y*4+np.sin(Y*9))*.8+np.sin(X*114+Y*7)*.6
            a+=g[:,:,None]*3
        elif i==1:
            a+=rng.normal(0,1.8,(N,N,1))
        a+=(thread+rng.normal(0,.60,(N,N)))[:,:,None]*(.32 if i<2 or i==4 else 1.10)
        params=np.empty((N,N,3));params[:]=[255,round(255*rough),round(255*metal)]
        params[:,:,1]+=thread*(.7 if i==4 else 2)
        normal=np.empty_like(a);normal[:,:,0]=127.5+np.sin(X*N*2.1)*3;normal[:,:,1]=127.5+np.cos(Y*N*1.6)*3;normal[:,:,2]=255
        lamp=np.zeros_like(a)
        if i==15:lamp[:]=[194,180,151]
        x=(i%4)*N;y=(3-i//4)*N
        for sheet,tile in zip(sheets,[a,params,lamp,normal]):
            sheet[y:y+N,x:x+N]=np.clip(tile,0,255).astype(np.uint8)
    for name,sheet,step in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if step>1:
            h,w,_=sheet.shape;sheet=np.uint8(sheet.reshape(h//step,step,w//step,step,3).mean(axis=(1,3)))
        png(folder/(name+'.png'),sheet)
