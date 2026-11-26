"""Wound fibres, spun wool, broderie, satin, foil labels and laminated timber."""
import numpy as np
from atlas import png

P = 192
Y,X = np.mgrid[0:P,0:P]
U,V = (X+.5)/P,(Y+.5)/P
PALETTE = [(232,228,215),(251,249,244),(246,243,237),(226,215,186),
           (178,185,184),(202,177,141),(243,238,227),(194,192,174),
           (252,246,234),(249,243,239),(249,248,243),(240,236,221),
           (239,234,211),(218,218,210),(91,118,139),(245,243,218)]


def maps(folder):
    sheets=[np.empty((4*P,4*P,3),np.uint8) for _ in range(4)]
    rng=np.random.default_rng(6105)
    for sw,c in enumerate(PALETTE):
        rgb=np.broadcast_to(np.array(c,float),(P,P,3)).copy()
        h=np.zeros((P,P));grain=rng.normal(0,1,(P,P))
        if sw in [0,1,2]:
            # Separate winding groups change direction twice on a single skein.
            field=(np.sin(2*np.pi*(U+V*.13))*.27+np.sin(2*np.pi*(U*.32+V))*.27)
            strand1=np.cos(2*np.pi*(15.5*U+8.2*V+.6*np.sin(np.pi*2*V)+.19*np.sin(9*U)))
            strand2=np.cos(2*np.pi*(12.6*U-10.7*V+.46*np.sin(np.pi*2*U)))
            strand=np.where(field+.23*np.sin(8*np.pi*V)>0,strand1,strand2)
            fine=np.cos(2*np.pi*(34*U-29*V)+np.maximum(0,strand)*2.8)
            if sw==2:
                angle=np.arctan2(V-.50,U-.50);r=np.hypot(U-.50,V-.50)
                strand=np.cos(r*148+angle+.83*np.sin(angle*4+r*8))
            h=2.0*strand+.71*fine+grain*(.44 if sw==1 else .21)
            rgb+=(8.2*h+grain*(2.4 if sw==1 else 1.2))[:,:,None]
        elif sw==3:
            # Paper stock labels carry print rules, a tiny yarn illustration and colour-control bars.
            stripe=np.mod(V*7,1)
            rgb[(U>.09)&(U<.91)&((V>.10)&(V<.125)|(V>.86)&(V<.883))]=(98,125,124)
            rgb[(U>.21)&(U<.79)&(V>.37)&(V<.54)&(stripe>.13)&(stripe<.30)]=(131,122,108)
            ball=((U-.5)/.12)**2+((V-.68)/.10)**2
            rgb[(ball<1)&(np.sin(U*114+V*79)>.1)]=(114,139,140)
            h=grain*.2
        elif sw==4:
            h=.4*np.sin(Y*.77)+grain*.18;rgb+=2*h[:,:,None]
        elif sw==5:
            h=.72*np.sin(X*.33+.8*np.sin(Y*.045))+.26*np.cos(X*.87+Y*.07)
            rgb+=h[:,:,None]*6.2
        elif sw in [8,9,10,11]:
            h=.24*np.cos(X*1.44)+.22*np.cos(Y*1.4)+grain*.11
            if sw==9:
                # Embroidered four-petal sprigs spread through the organza.
                xx=(U*5+.26*np.sin(np.pi*2*V*4))%1-.5;yy=(V*5)%1-.5
                a=np.arctan2(yy,xx);r=np.hypot(xx,yy)
                flower=np.clip((.16+.078*np.cos(5*a)-r)*27,0,1)
                ring=np.exp(-((r-.26)/.018)**2)*(.5+.5*np.cos(a*7))
                h+=1.9*flower+ring*.5
                rgb+=(-18*flower-7*ring)[:,:,None]
            if sw==10:
                lines=np.maximum(0,np.cos((U+V)*91))**5+np.maximum(0,np.cos((U-V)*91))**5
                h+=lines;rgb-=((2-lines)*6.1)[:,:,None]
            if sw==11:
                h+=.4*np.cos(2*np.pi*(U*13+V))
        else:h=grain*.19
        rgb+=grain[:,:,None]*.6
        du=(np.roll(h,-1,1)-np.roll(h,1,1))*.19;dv=(np.roll(h,-1,0)-np.roll(h,1,0))*.19
        length=np.sqrt(1+du*du+dv*dv)
        normal=np.stack([(-du/length+1)*127.5,(dv/length+1)*127.5,(1/length+1)*127.5],-1)
        orm=np.zeros_like(rgb);orm[:]=[255,255*[.83,.96,.86,.63,.35,.54,.75,.92,.48,.7,.84,.39,.78,.48,.49,.29][sw],164 if sw==4 else 0]
        lamp=np.full_like(rgb,[196,206,173] if sw==15 else [0,0,0])
        row=(3-sw//4)*P;col=(sw%4)*P
        for sheet,tile in zip(sheets,[rgb,orm,lamp,normal]):
            sheet[row:row+P,col:col+P]=np.uint8(np.clip(tile,0,255))
    for name,sheet,stride in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        size=4*P//stride
        if stride>1:sheet=np.uint8(sheet.reshape(size,stride,size,stride,3).mean(axis=(1,3)))
        png(folder/(name+'.png'),sheet)
