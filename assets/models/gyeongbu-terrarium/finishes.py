"""Original bark, cut grain, leaf veins, mineral substrate and white shop fittings."""
import numpy as np
from atlas import png

N=128
Y,X=np.mgrid[0:N,0:N];U=(X+.5)/N;V=(Y+.5)/N
PALETTE=[(134,111,75),(203,193,166),(199,169,113),(120,138,70),
         (181,197,134),(208,212,147),(175,188,161),(211,212,157),
         (157,125,85),(107,114,98),(213,217,200),(103,89,67),
         (174,192,129),(184,141,110),(225,215,191),(241,239,213)]


def maps(folder):
    sheets=[np.empty((4*N,4*N,3),np.uint8) for _ in range(4)];rng=np.random.default_rng(185)
    for sw,c in enumerate(PALETTE):
        rgb=np.broadcast_to(np.array(c,float),(N,N,3)).copy();h=np.zeros((N,N));grain=rng.normal(0,1,(N,N))
        if sw==0:
            a=X*.43+2*np.sin(Y*.042)+1.2*np.sin(Y*.084+X*.08)+.33*np.sin(Y*.37)
            ridges=np.maximum(0,np.cos(a))**4
            furrows=np.maximum(0,-np.cos(a))**7
            h=3.0*ridges-3.6*furrows+.54*grain+.58*np.sin(X*1.2+Y*.043)
            rgb+=np.stack([3.3*h,2.8*h,2.1*h],-1)
        elif sw==1:
            fleck=np.zeros((N,N));h=.28*np.cos(Y*.72+X*.12)
            for i in range(95):
                cx=rng.integers(0,N);cy=rng.integers(0,N);a=rng.uniform(1,5);b=rng.uniform(.3,1.2)
                fleck=np.maximum(fleck,np.exp(-((X-cx)/a)**2-((Y-cy)/b)**2))
            h-=fleck;rgb-=np.stack([82*fleck,76*fleck,64*fleck],-1)
        elif sw==2:
            x=(U-.47)*2;y=(V-.52)*2;r=np.sqrt(x*x+(y*1.03)**2);a=np.arctan2(y,x)
            rings=np.cos(49*r+.44*np.sin(a*4)+.82*np.sin(r*7))*.58+np.cos(118*r+.4*np.sin(a*4))*.25
            cracks=np.zeros_like(r)
            for ang,cut in [(-2.5,.36),(-1.33,.09),(.03,.5),(.76,.52),(2.30,.29)]:
                swept=ang+.04*np.sin(r*9)+.033*np.cos(r*3.1);diff=np.abs(np.angle(np.exp(1j*(a-swept))))
                cracks=np.maximum(cracks,(r>cut)*np.exp(-(diff/(.010+.017*r))**2))
            h=rings-2.4*cracks;rgb+=(9*rings-78*cracks)[:,:,None]
        elif sw in [3,11]:
            h=grain*.84+np.sin(X*.57+np.cos(Y*.70))*.93+np.cos(Y*1.9+X*.60)*.64
            rgb+=h[:,:,None]*(9.6 if sw==3 else 8.0)
        elif sw in [4,5,6,7,12]:
            # UV width spans the leaf. The narrower side veins meet the pale midrib obliquely.
            centre=np.abs(U-.5);vein=np.maximum(0,np.cos(V*2*np.pi*13+centre*17))**17
            h=.34*vein+.9*np.exp(-(centre/.016)**2)+.18*grain
            light=vein*3.5+np.exp(-(centre/.022)**2)*9+.9*np.cos(X*1.2+Y*.18)
            if sw==5:
                fork=np.cos(V*29+centre*23+.86*np.sin(centre*6))
                light+=-25*np.maximum(0,-fork)**2*(.28+centre)+9*np.maximum(0,fork)**3
                light+=15*np.exp(-(centre/.012)**2)
            if sw==7:
                light+=np.maximum(0,.105-np.minimum(U,1-U))*255
                light+=3.1*np.cos(V*71+np.sin(U*11)*1.1)
            if sw==6:light+=grain*1.4
            rgb+=light[:,:,None]
        elif sw==8:
            h=.8*np.sin(X*.42+1.1*np.sin(Y*.03))+.4*np.cos(X*1.03+Y*.06);rgb+=h[:,:,None]*5.2
        elif sw in [9,10,13]:
            h=.52*np.cos(Y*.91);rgb+=(.71*h+np.sin(X*.11))[:,:,None]
        rgb+=grain[:,:,None]*.52
        du=(np.roll(h,-1,1)-np.roll(h,1,1))*.18;dv=(np.roll(h,-1,0)-np.roll(h,1,0))*.18
        scale=np.sqrt(1+du*du+dv*dv);normal=np.stack([(-du/scale+1)*127.5,(dv/scale+1)*127.5,(1/scale+1)*127.5],-1)
        orm=np.zeros_like(rgb);orm[:]=[255,255*[.90,.85,.75,.94,.61,.53,.83,.51,.72,.52,.42,.94,.69,.77,.67,.38][sw],48 if sw==10 else 0]
        emit=np.full_like(rgb,[212,216,190] if sw==15 else [0,0,0]);yy=(3-sw//4)*N;xx=sw%4*N
        for sh,tile in zip(sheets,[rgb,orm,emit,normal]):sh[yy:yy+N,xx:xx+N]=np.uint8(np.clip(tile,0,255))
    for key,sh,stride in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if stride>1:sh=np.uint8(sh.reshape(512//stride,stride,512//stride,stride,3).mean(axis=(1,3)))
        png(folder/(key+'.png'),sh)
