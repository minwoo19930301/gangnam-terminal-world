"""Original PBR samples for the photographed Kisara Gangnam service."""

import bpy
import numpy as np
from math import pi

WIDTH,HEIGHT=1024,960
TILE_W,TILE_H=256,184
NAMES=("키사라 · 상차림 표면", "키사라 · 결의 요철", "키사라 · 유약과 식재료 거칠기")


def rectangle(index):
    if index==0:return (0,0,WIDTH,220)
    return (((index-1)%4)*TILE_W,224+((index-1)//4)*TILE_H,TILE_W,TILE_H)


def uv(index,u,v):
    x,y,w,h=rectangle(index)
    return ((x+1.6+(w-3.2)*u)/WIDTH,(y+1.6+(h-3.2)*v)/HEIGHT)


def palette(a,b,t):
    return np.array(a)[None,None,:]*(1-t[:,:,None])+np.array(b)[None,None,:]*t[:,:,None]


def paint(k,x,y,rng):
    noise=rng.normal(0,1,x.shape)
    u,v=x,y
    und=.44*np.sin(7*u+3*v)+.39*np.cos(11*v-4*u)+.23*np.sin(17*u+8*v)
    fine=.5+.5*np.sin(2*pi*(u*27+.19*np.sin(v*8)+.09*und))
    h=.018*noise
    if k==0:
        grain=2*pi*(y*21+.24*np.sin(7*x+3*y)+.095*np.sin(17*x+11*y))
        c=palette([119,50,32],[153,69,41],.55+.35*np.sin(grain)+.085*np.sin(4*grain))
        c+=np.stack((2.6*und,1.9*und,1.6*und),axis=2);h+=.09*np.sin(grain);rough=.33+.040*fine
    elif k==1:  # fat chevrons cut across a salmon fillet
        phase=4.35*u+.42*abs((v-.48)*2)**1.24+.12*np.sin(2*pi*u+.8*v)+.031*np.sin(v*15+u*10)
        seam=np.exp(-(np.sin(pi*phase)/(.135+.063*v))**2)
        c=palette([224,95,25],[251,196,118],seam*.83)
        c+=np.stack((4.3*und,5.7*und,3.8*und),axis=2)
        h+=.10*seam+.095*fine;rough=.26+.061*(1-seam)+.018*fine
    elif k in (2,7):
        # The lean centre piece is dark crimson. The lower pink cut has
        # pale flecks and a broad, tapered tail, as in the plate close-up.
        phase=2*pi*(u*8+.63*v+.28*np.sin(4*v+u*3)+.10*np.sin(13*u))
        c=palette([133,24,38] if k==2 else [147,65,79],[178,46,54] if k==2 else [184,99,109],.56+.24*und+.039*np.cos(phase))
        flesh=.5+.5*np.cos(2*pi*(31*u+.7*v+.27*np.sin(3*v+u*2)))
        for _ in range(185 if k==7 else 65):
            cx,cy=rng.uniform(.04,.96,2);sx,sy=rng.uniform(.002,.009),rng.uniform(.004,.017)
            fleck=np.exp(-((u-cx)/sx)**2-((v-cy)/sy)**2)
            c+=fleck[:,:,None]*np.array([22,22,15])
        h+=.048*flesh+.027*np.cos(phase)+.034*noise;rough=.33+.068*(1-flesh)+.038*und
    elif k in (3,8,9):
        # Lean white fish, the dark lateral strip of skin-on white fish, and
        # the softly scalloped burgundy perimeter on the cooked octopus.
        lines=.5+.5*np.cos(2*pi*(11*u+.33*v+.15*np.sin(11*v)))
        if k==9:
            boundary=.84+.035*np.sin(u*13)+.027*np.cos(u*25)
            edge=np.clip((v-boundary)*19+.33,0,1)
            c=palette([236,216,192],[113,51,47],edge)
            c+=np.stack((4*und,3*und,2.6*und),axis=2)
            h+=.036*lines+.23*edge*(.5+.5*np.cos(2*pi*u*17));rough=.27+.025*lines
        else:
            w=.055+.14*np.exp(-((u-.68)/.23)**2)+.035*np.sin(8*u+.3)
            edge=np.clip((v-(1-w)+.023*np.sin(22*u))*18+.43,0,1)
            if k==8:edge*=np.exp(-((u-.31)/.13)**2)*.33
            c=palette([239,220,203],[138,48,62],edge)
            c+=np.stack((3.6*und+2.5*lines,3.2*und,2*und),axis=2)
            h+=.09*lines+.03*und;rough=.27+.064*lines
    elif k in (4,10):
        # Broad caramelisation, grill ridges and blistering stay independent
        # from the stretched striations of the other slices.
        bbq=k==10
        broad=np.clip(.49+.28*und+.18*np.sin(2*pi*(2.5*u+.9*v))+.09*np.cos(19*v),0,1)
        fibres=.5+.5*np.sin(2*pi*(u*(16 if bbq else 27)+.65*v+.73*np.sin(v*8+u*3)))
        c=palette([79,42,26] if bbq else [173,125,79],[157,93,47] if bbq else [232,193,135],broad)
        c+=(fibres[:,:,None]-.50)*np.array([13,13,9])
        h+=.15*und+.12*fibres+.045*noise
        for _ in range(158 if bbq else 250):
            x0,y0=rng.uniform(-.04,1.04,2);sx,sy=rng.uniform(.0015,.019),rng.uniform(.002,.027)
            spot=np.exp(-((x-x0)/sx)**2-((y-y0)/sy)**2)
            c-=spot[:,:,None]*(np.array([38,32,22]) if bbq else np.array([74,68,53]))
            h-=spot*.18
        rough=(.24 if bbq else .40)+.075*broad+.038*fibres
    elif k==5:  # iron specks in warm stoneware; the dark pooled lip is separate
        c=palette([220,211,192],[234,226,209],.56+.19*und)
        for i in range(135):
            x0,y0=rng.uniform(0,1,2);sx,sy=rng.uniform(.0007,.0045),rng.uniform(.001,.0055)
            m=np.exp(-((x-x0)/sx)**2-((y-y0)/sy)**2)
            c-=m[:,:,None]*np.array([95,94,85])
        h+=.035*noise;rough=.32+.032*und
    elif k==6:  # cooked prawn, opened along the belly
        phase=6.1*u+.57*abs(2*v-1)**1.48+.063*np.sin(u*13)
        stripe=np.exp(-(np.sin(pi*phase)/.28)**2)
        spine=np.exp(-((v-.50)/.075)**2)
        edge=abs(2*v-1)**2
        c=palette([245,224,188],[233,144,68],np.clip(.66*stripe+.26*edge+.13*spine,0,.95))
        h+=.23*stripe-.17*spine+.07*fine;rough=.26+.060*stripe
    elif k==11:
        fiber=.5+.5*np.sin(2*pi*(v*31+.37*np.sin(u*31)+.6*np.sin(v*9+u*9)))
        split=np.minimum(abs(np.sin(2*pi*(3*u+v+.07*und))),abs(np.cos(2*pi*(u-4*v+.11*und))))
        c=palette([26,34,29],[55,56,44],.57*fiber+.33*np.exp(-split*12))
        h+=.25*fiber+.31*np.exp(-split*8)+.06*noise;rough=.21+.1*fiber
    elif k==12:
        curl=np.cos(2*pi*(v*15+.18*np.sin(u*12)))*.5+.5
        c=palette([226,195,118],[252,225,162],.54+.17*und+.13*curl)
        h+=.17*curl;rough=.32+.055*curl
    elif k==13:
        ridge=.5+.5*np.sin(2*pi*(2.1*u+.05*np.sin(v*19)))
        c=palette([75,51,33],[150,106,62],.55*ridge+.20+.10*und)
        c+=noise[:,:,None]*4;h+=.09*noise;rough=.24+.08*ridge
    elif k==14:
        seeds=.5+.5*np.cos(2*pi*(v*6+.3*np.sin(9*u)))
        c=palette([225,152,18],[255,197,40],.51+.15*und+.20*seeds)
        h+=.15*seeds+.052*noise;rough=.25+.05*seeds
    elif k==15:
        wr=.5+.5*np.sin(2*pi*(v*8+.41*np.sin(14*u)+.25*np.cos(21*u+5*v)))
        c=palette([75,26,45],[133,51,79],.47+.24*wr+.15*und)
        h+=.48*wr;rough=.25+.07*wr
    elif k==16:
        # Deep yellow-orange cuticle and lengthwise rays of the tail fan.
        rays=.5+.5*np.cos(2*pi*(v*6+.21*np.sin(u*4)))
        c=palette([207,107,22],[251,175,61],.45+.27*rays+.12*und)
        h+=.23*rays;rough=.27+.033*rays
    else:
        c=palette([235,224,198],[255,242,219],.54+.14*und+.18*fine)
        h+=.16*fine;rough=.29+.08*fine
    c+=noise[:,:,None]*1.25
    return c/255,h,np.clip(rough+.01*noise,.13,.84)


def create(name,values,data):
    img=bpy.data.images.new(name,width=WIDTH,height=HEIGHT,alpha=False)
    if data:img.colorspace_settings.name="Non-Color"
    rgba=np.ones((HEIGHT,WIDTH,4),np.float32);rgba[:,:,:3]=values
    img.pixels.foreach_set(rgba.ravel());img.pack();return img


def generate():
    color=np.ones((HEIGHT,WIDTH,3));nor=np.empty_like(color);nor[:]=(.5,.5,1)
    orm=np.empty_like(color);orm[:]=(1,.38,0)
    for k in range(17):
        lx,ly,w,h=rectangle(k);yy,xx=np.mgrid[:h,:w]
        c,relief,r=paint(k,xx/(w-1),yy/(h-1),np.random.default_rng(422+k))
        dy,dx=np.gradient(relief);normal=np.stack((-.72*dx,-.72*dy,np.ones_like(dx)),axis=2)
        normal/=np.linalg.norm(normal,axis=2)[:,:,None];rows=slice(ly,ly+h);cols=slice(lx,lx+w)
        color[rows,cols]=np.clip(c,0,1);nor[rows,cols]=(normal+1)/2;orm[rows,cols,1]=r
    return create(NAMES[0],color,False),create(NAMES[1],nor,True),create(NAMES[2],orm,True)


def set_shader(mat,images):
    nod,links=mat.node_tree.nodes,mat.node_tree.links
    p=nod['Principled BSDF'];tex=[]
    for im in images:
        n=nod.new("ShaderNodeTexImage");n.image=im;tex.append(n)
    links.new(tex[0].outputs['Color'],p.inputs['Base Color'])
    normal=nod.new("ShaderNodeNormalMap");links.new(tex[1].outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],p.inputs['Normal'])
    channel=nod.new("ShaderNodeSeparateRGB");links.new(tex[2].outputs['Color'],channel.inputs[0]);links.new(channel.outputs['G'],p.inputs['Roughness']);links.new(channel.outputs['B'],p.inputs['Metallic'])
