"""Procedural swatches for the suiting aisle. Cloth colours are chosen from the operator's 7F overview."""
import math
import numpy as np
from atlas import png

PALETTE = [
    (60,65,61), (40,93,80), (150,143,133), (204,202,185),
    (187,190,185), (129,99,67), (48,56,70), (230,225,211),
    (111,112,112), (73,88,104), (185,137,78), (155,144,149),
    (115,98,84), (79,84,69), (153,63,71), (249,243,219),
]
N=256
Y,X=np.mgrid[0:N,0:N]


def line(a, repeat, width):
    pos=np.mod(a+repeat*.5,repeat)-repeat*.5
    return np.clip(width+.5-np.abs(pos),0,1)


def swatch(i,rng):
    wave=lambda phase: np.cos(phase)*.5+.5
    twill=wave((X+Y*.72)*math.pi*.76)
    weft=wave(Y*math.pi*.94)*wave(X*math.pi*.64)
    grain=rng.normal(0,.90,(N,N))
    relief=1.4*twill+.9*weft
    finish=grain+1.55*twill+weft
    tint=np.empty((N,N,3))
    tint[:]=PALETTE[i]
    if i<2:
        noise=1.85*np.sin(X*.13+np.cos(Y*.096))+1.6*np.cos((X+Y)*.041)+grain*1.6
        finish=noise;relief=.44*noise;rough=.46+.022*np.sin(Y*.137)
        metal=.01
    elif i==3:
        pits=rng.random((N,N))>.965
        finish=grain*.80-pits*11;relief=grain*.30-pits;rough=.91;metal=0
    elif i==4:
        finish=1.5*np.sin(Y*.63)+grain*.40;relief=.19*np.sin(Y*.63)
        rough=.31;metal=.75
    elif i==5:
        finish=3.8*np.sin((Y+3*np.sin(X*.032))*.18)+grain
        rough=.53;metal=.01
    elif i==7:
        finish=1.0*twill+grain*.34;rough=.86;metal=0
    elif i==15:
        finish=np.minimum(3,np.abs(Y-128)*.021)+np.cos(X*.12)*1.4
        rough=.44;metal=0
    else:
        rough=.89+.04*twill;metal=0
        if i==2:
            chevron=wave((X+np.abs((Y%28)-14))*.88)
            finish+=chevron*9-3
        elif i==6:
            finish+=1.55*wave((X-Y)*1.02)
        elif i==8:
            # Fine glen check with a restrained oxide-blue windowpane overcheck.
            band=((X%32<9).astype(float)+(Y%32<9).astype(float))*.48
            finish+=np.where(((X//2+Y//2)%2)==0,6.5,-4.5)*band
            finish+=5.*line(X,64,1.4)+5.*line(Y,64,1.4)-7.*line(X-4,32,1)-7.*line(Y-4,32,1)
            wire=np.maximum(line(X-15,64,.59),line(Y-15,64,.59))
            tint+=wire[:,:,None]*np.array([-11,-2,7])
        elif i==9:
            stripe=line(X,20,.66)*(.52+.48*wave(Y*.85))
            finish+=stripe*23+2.*wave((X+Y)*.77)
        elif i==10:
            fleck=(rng.random((N,N))>.84)
            finish+=fleck*4.5+2.*wave((X+(.5*(Y%24)))*.58)
        elif i==11:
            eye=wave((X+Y)*.81)*wave((X-Y)*.81)
            finish+=eye*11-3.6;relief+=eye
        elif i==12:
            herr=wave((Y+np.abs((X%14)-7))*.92)
            finish+=herr*7.0-2.4;relief+=1.7*herr
        elif i==13:finish+=4.8*line(X,5.5,.76)+2.1*weft
        elif i==14:
            band=line(X-Y*.56,51,3.1)
            gold=line(X-Y*.56-6,51,.85)
            tint+=band[:,:,None]*np.array([-93,14,34])+gold[:,:,None]*np.array([74,99,60])
            finish+=twill*3.5
    rgb=np.uint8(np.clip(tint+finish[:,:,None],0,255))
    packed=np.empty((N,N,3),np.uint8)
    packed[:,:,0]=255;packed[:,:,1]=np.clip(np.asarray(rough)*255,0,255).astype(np.uint8);packed[:,:,2]=round(metal*255)
    du=(np.roll(relief,-1,axis=1)-np.roll(relief,1,axis=1))*.060
    dv=(np.roll(relief,-1,axis=0)-np.roll(relief,1,axis=0))*.060
    norm=np.sqrt(1+du*du+dv*dv)
    normal=np.uint8(np.stack([(-du/norm*.5+.5)*255,(dv/norm*.5+.5)*255,(1/norm*.5+.5)*255],axis=-1))
    emissive=np.zeros_like(rgb)
    if i==15:emissive[:]=[178,172,141]
    return rgb,packed,emissive,normal


def maps(folder):
    rng=np.random.default_rng(70312)
    sheets=[np.empty((N*4,N*4,3),np.uint8) for _ in range(4)]
    for i in range(16):
        x=(i%4)*N;y=(3-i//4)*N
        for sheet,tile in zip(sheets,swatch(i,rng)):sheet[y:y+N,x:x+N]=tile
    for name,sheet in zip(['surface','metal-rough','lamp','weave-normal'],sheets):
        factor={'surface':1,'metal-rough':4,'lamp':4,'weave-normal':2}[name]
        if factor>1:
            # Keep the original weave colour at full resolution; finer normal detail can be mip-filtered.
            h,w,_=sheet.shape
            sheet=sheet.reshape(h//factor,factor,w//factor,factor,3).mean(axis=(1,3))
            if name=='weave-normal':
                values=sheet/127.5-1
                values/=np.maximum(1.e-6,np.linalg.norm(values,axis=2,keepdims=True))
                sheet=(values+1)*127.5
            sheet=np.uint8(np.clip(sheet,0,255))
        png(folder/(name+'.png'),sheet)
