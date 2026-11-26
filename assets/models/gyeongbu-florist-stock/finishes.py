"""Satin and grosgrain fibres, paper wraps, shelf strips, brass and cut glass."""
import math
import numpy as np
from atlas import png

N=128
Y,X=np.mgrid[0:N,0:N]
PALETTE=[(179,182,168),(210,212,198),(191,175,144),(221,214,178),
         (246,242,229),(238,237,223),(230,232,220),(225,218,199),
         (210,179,108),(205,217,210),(109,135,87),(225,219,200),
         (178,142,96),(208,164,64),(229,228,211),(248,241,215)]


def maps(folder):
    sheets=[np.empty((4*N,4*N,3),np.uint8) for _ in range(4)]
    rng=np.random.default_rng(37806)
    for i in range(16):
        rgb=np.broadcast_to(np.array(PALETTE[i],float),(N,N,3)).copy();h=np.zeros((N,N))
        rough=[.40,.35,.72,.80,.38,.83,.63,.69,.25,.14,.80,.67,.57,.79,.55,.31][i]
        metal=[.53,.46,0,0,.055,0,0,0,.78,.04,0,0,0,0,0,0][i]
        noise=rng.normal(0,.48,(N,N))
        if i in [0,1]:rgb+=(1.12*np.cos(Y*1.42)+.87*np.cos(X*.29))[:,:,None]
        elif i==2:
            h=.6*np.sin(Y*2.15)+.45*rng.normal(size=(N,N));rgb+=(2.55*h)[:,:,None]
        elif i==3:
            h=.61*np.cos(X*.67)+.57*np.cos(Y*.49)*np.sin(X*.57);rgb+=(h*2)[:,:,None]
        elif i in [4,5,6]:
            warp=np.cos(X*1.54+np.sin(Y*.94)*.37);weft=np.cos(Y*1.28)
            if i==4:h=.48*warp+.27*weft;rgb+=(h*2.6+.64*np.sin(Y*.26))[:,:,None]
            elif i==5:h=1.35*np.cos(X*1.51)+.31*weft;rgb+=(h*4.8)[:,:,None]
            else:h=1.5*np.cos(X*.55)*np.cos(Y*.59);rgb+=(h*3.55)[:,:,None]
        elif i in [8,9]:
            bands=-15*np.exp(-((X-14)/6.0)**2)+10*np.exp(-((X-28)/3.6)**2)-9*np.exp(-((X-86)/5.3)**2)
            rgb+=(.6*np.cos(Y*1.4)+bands)[:,:,None]
        elif i==10:
            rgb+=(2.2*np.sin(X*.22+np.sin(Y*.32)))[:,:,None]
        elif i==11:
            # White edge cards include small colour samples and short print rules.
            rgb[:]=[236,233,216];rgb[12:17,8:113]=[86,91,78];rgb[26:30,8:88]=[123,120,102]
            for k in range(5):rgb[46:73,9+22*k:25+22*k]=[[195,143,134],[203,184,134],[136,162,142],[144,159,170],[173,146,162]][k]
            for k in range(25):
                if k%4!=1:rgb[91:114,9+k*4:11+k*4]=[66,73,62]
        elif i==12:
            h=.65*np.cos(Y*.22+np.sin(X*.043)*2);rgb+=(h*4.9)[:,:,None]
        elif i==14:
            rgb+=np.mod(X+Y,18)[:,:,None]*.12
        rgb+=noise[:,:,None]
        du=(np.roll(h,-1,1)-np.roll(h,1,1))*.11;dv=(np.roll(h,-1,0)-np.roll(h,1,0))*.11
        s=np.sqrt(1+du*du+dv*dv)
        norm=np.stack([(-du/s+1)*127.5,(dv/s+1)*127.5,(1/s+1)*127.5],axis=-1)
        orm=np.full_like(rgb,[255,rough*255,metal*255])
        emit=np.full_like(rgb,[177,170,141] if i==15 else [0,0,0])
        y=(3-i//4)*N;x=(i%4)*N
        for sheet,tile in zip(sheets,[rgb,orm,emit,norm]):sheet[y:y+N,x:x+N]=np.uint8(np.clip(tile,0,255))
    for key,sheet,stride in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if stride>1:sheet=np.uint8(sheet.reshape(512//stride,stride,512//stride,stride,3).mean(axis=(1,3)))
        png(folder/(key+'.png'),sheet)
