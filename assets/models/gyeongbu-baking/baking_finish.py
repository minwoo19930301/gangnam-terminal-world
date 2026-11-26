"""Original brushed metal, printed baking supply packs and price label holders."""
import numpy as np
from atlas import png

PALETTE=[(158,150,132),(225,225,215),(184,35,36),(143,179,163),(96,89,79),(210,215,211),
         (176,181,177),(230,224,204),(220,177,77),(151,105,62),(171,143,103),(221,218,197),
         (31,102,145),(52,50,44),(216,209,183),(249,238,211)]
N=256
Y,X=np.mgrid[0:N,0:N]/N


def stroke(tile,a,b,size,col):
    dx=b[0]-a[0];dy=b[1]-a[1]
    t=np.clip(((X-a[0])*dx+(Y-a[1])*dy)/(dx*dx+dy*dy+1e-9),0,1)
    mask=np.clip((size-np.hypot(X-a[0]-t*dx,Y-a[1]-t*dy))/.005+.5,0,1)[:,:,None]
    tile[:]=tile*(1-mask)+np.array(col)*mask


def maps(folder):
    rng=np.random.default_rng(1942116)
    sheets=[np.empty((N*4,N*4,3),np.uint8) for _ in range(4)]
    for i,col in enumerate(PALETTE):
        tile=np.broadcast_to(np.array(col,float),(N,N,3)).copy()
        rough=[.68,.41,.27,.32,.53,.22,.40,.66,.32,.63,.83,.59,.37,.56,.73,.50][i]
        metal=[0,0,.14,.12,.20,.21,.23,0,.13,0,0,0,.12,.14,0,0][i]
        if i==0:
            strips=np.floor(X*5)
            tile+=((1.1*np.sin(X*229+Y*6+2*np.cos(strips*2))+.52*np.sin(X*490+Y*2))*2.4)[:,:,None]
        if i in [4,5,6]:
            grain=(np.sin(Y*2700+np.cos(X*19))*.58+np.cos(Y*502)*.79)*1.5
            gradient=3*np.cos(X*11)+6*np.exp(-((X-.28)/.07)**2)
            tile+=(grain+gradient)[:,:,None]
            if i==5:
                # Local shop lights and surrounding rails break up the polished
                # bowl even on the mobile indoor renderer without an HDR panorama.
                mirror=(-56*np.exp(-((X-.12)/.043)**2)+28*np.exp(-((X-.224)/.023)**2)
                       -43*np.exp(-((X-.55)/.056)**2)+26*np.exp(-((X-.616)/.025)**2)
                       -23*np.exp(-((X-.77)/.028)**2)+17*np.cos(X*11+Y*.28))
                tile+=mirror[:,:,None]
        if i==9:
            tile+=(np.sin(X*70+2*np.sin(Y*9))*3+np.sin(X*255+Y*17)*1.65)[:,:,None]
        if i==10:
            tile+=rng.normal(0,2,(N,N,1))
        if i==11:
            # The original fixture photographs show white product cards with
            # short dark lines and printed tool silhouettes. No made-up prices.
            tile[:]=[235,229,207]
            for a,b,c in [((.06,.22),(.83,.22),(95,93,78)),((.06,.30),(.51,.30),(146,141,120)),
                          ((.06,.73),(.38,.73),(91,92,82)),((.06,.82),(.73,.82),(148,145,126))]:
                stroke(tile,a,b,.012,c)
            for j in range(24):
                if j%5!=2:stroke(tile,(.56+j*.014,.56),(.56+j*.014,.76),.0038,[74,73,61])
        if i==14:
            for k in range(10):
                x=.11+.081*k
                stroke(tile,(x,.60),(x+.035,.512),.008,(144,111,63))
                stroke(tile,(x,.60),(x-.021,.535),.006,(183,144,78))
            stroke(tile,(.11,.64),(.89,.64),.011,(122,86,51))
            stroke(tile,(.17,.70),(.59,.70),.008,(122,86,51))
            glyphs={'F':['1111','1000','1110','1000','1000'],'L':['1000','1000','1000','1000','1111'],
                    'O':['0110','1001','1001','1001','0110'],'U':['1001','1001','1001','1001','0110'],
                    'R':['1110','1001','1110','1010','1001']}
            for j,ch in enumerate('FLOUR'):
                for r,row in enumerate(glyphs[ch]):
                    for k,value in enumerate(row):
                        if value=='1':
                            xx=.14+j*.145+k*.027;yy=.22+r*.035
                            tile[(X>xx)&(X<xx+.029)&(Y>yy)&(Y<yy+.037)]=[85,78,65]
        tile+=rng.normal(0,.48,(N,N,1))
        orm=np.empty_like(tile);orm[:]=[255,rough*255,metal*255]
        normal=np.broadcast_to(np.array([127.5,127.5,255]),tile.shape).copy()
        if i in [4,5,6]:normal[:,:,1]+=2.1*np.sin(Y*1450)
        elif i in [0,9]:normal[:,:,0]+=2.4*np.sin(X*198+Y*4)
        emit=np.zeros_like(tile)
        if i==15:
            emit[:]=[200,184,155]
            # The upper two patches belong to the coloured entrance letters;
            # fluorescent lenses use the lower half of this same atlas tile.
            tile[:N//2,:N//2]=[247,77,43];emit[:N//2,:N//2]=[196,34,17]
            tile[:N//2,N//2:]=[62,176,220];emit[:N//2,N//2:]=[30,135,203]
        x=(i%4)*N;y=(3-i//4)*N
        for sheet,data in zip(sheets,[tile,orm,emit,normal]):sheet[y:y+N,x:x+N]=np.uint8(np.clip(data,0,255))
    for key,sheet,step in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if step>1:
            h,w,_=sheet.shape;sheet=np.uint8(sheet.reshape(h//step,step,w//step,step,3).mean(axis=(1,3)))
        png(folder/(key+'.png'),sheet)
