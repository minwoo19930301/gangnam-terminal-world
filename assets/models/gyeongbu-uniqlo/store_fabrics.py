"""Cotton knit, twill and brushed oak samples with hand-drawn merchandising cards."""
import numpy as np
from atlas import png

PALETTE=[(193,149,103),(232,230,222),(175,180,177),(226,225,219),
         (239,238,228),(222,226,221),(235,227,205),(105,102,91),
         (219,214,194),(64,63,59),(241,239,227),(244,241,231),
         (206,23,33),(42,135,172),(195,151,97),(247,241,221)]
N=256
Y,X=np.mgrid[0:N,0:N]
LETTERS={
 'U':['101','101','101','101','111'],'N':['1001','1101','1101','1011','1001'],
 'I':['1','1','1','1','1'],'Q':['1110','1010','1010','1110','0011'],
 'L':['100','100','100','100','111'],'O':['111','101','101','101','111'],
 'A':['010','101','111','101','101'],'R':['110','101','110','101','101'],
 'S':['111','100','111','001','111'],'M':['10001','11011','10101','10001','10001'],
 'C':['111','100','100','100','111'],'T':['111','010','010','010','010'],
 'E':['111','100','110','100','111'],'P':['110','101','110','100','100'],
 'F':['111','100','110','100','100'],'H':['101','101','111','101','101'],
 'W':['10001','10001','10101','11011','10001'],'V':['101','101','101','101','010'],
 'B':['110','101','110','101','110'],'D':['110','101','101','101','110'],
 'K':['101','110','100','110','101'],'G':['111','100','101','101','111'],
 'X':['101','101','010','101','101']}

def word(tile,txt,x,y,size,colour):
    for ch in txt:
        if ch==' ':
            x+=size*2
            continue
        rows=LETTERS[ch]
        for j,row in enumerate(rows):
            for k,c in enumerate(row):
                if c=='1':tile[y+j*size:y+(j+1)*size,x+k*size:x+(k+1)*size]=colour
        x+=(len(rows[0])+1)*size

def maps(folder):
    rng=np.random.default_rng(19435)
    sheets=[np.empty((1024,1024,3),np.uint8) for _ in range(4)]
    for i,col in enumerate(PALETTE):
        tile=np.broadcast_to(np.array(col,float),(N,N,3)).copy()
        height=np.zeros((N,N))
        rough=[.54,.51,.30,.38,.88,.85,.87,.65,.83,.61,.64,.58,.42,.52,.53,.31][i]
        metal=.56 if i==2 else 0
        if i in [0,14]:
            wood=2.5*np.sin(Y*.118+2.1*np.cos(X*.016))+1.3*np.cos(Y*.339+.8*np.sin(X*.033))
            tile+=wood[:,:,None];height=wood*.22
        if i in [4,5,6,8]:
            knit=(np.cos(X*1.29+np.sin(Y*.73)*1.25)+np.cos(X*1.29-np.sin(Y*.73)*1.25))*.5
            twill=np.cos((X-Y*.64)*.86)+.56*np.sin(X*.61)*np.cos(Y*.22)
            height=(knit if i==4 else twill if i in [5,6] else np.cos(X*.57))+.21*rng.normal(size=(N,N))
            tile+=((2.7 if i in [4,8] else 5.2)*height)[:,:,None]
            if i==5:
                # Irregular broken warp produces the pale worn view down a denim fold.
                tile+=(np.sin(X*.19+Y*.051)*.62+rng.normal(0,1.5,(N,N)))[:,:,None]
        if i==2:tile+=(1.6*np.sin(Y*2.28)+1.3*np.cos(X*.043))[:,:,None]
        if i==10:
            tile[22:80,13:72]=[204,26,38]
            word(tile,'UNI',21,29,4,[253,247,229]);word(tile,'QLO',18,51,4,[253,247,229])
            word(tile,'M',97,22,10,[48,48,46])
            for yy,ww in [(95,221),(109,181),(124,201),(141,119)]:
                tile[yy:yy+3,19:ww]=[107,108,100]
            for j in range(55):
                if j%5!=3:tile[168:214,17+j*4:18+j*4+(j%2)]=[57,58,55]
        if i==11:
            tile[12:18,:]=[40,127,171];word(tile,'AIRISM',13,36,6,[41,118,153])
            word(tile,'COTTON',14,101,4,[52,51,48]);word(tile,'CREW NECK',14,132,3,[66,66,63])
            for yy,ww in [(172,226),(186,183),(202,146)]:tile[yy:yy+4,16:ww]=[130,131,124]
        if i==12:
            word(tile,'UNI',42,38,16,[255,250,237]);word(tile,'QLO',27,139,16,[255,250,237])
        if i==13:
            tile+=np.linspace(-10,14,N)[:,None,None]
            word(tile,'AIRISM',20,96,8,[250,248,229])
        tile+=rng.normal(0,.35,(N,N,1))
        orm=np.empty_like(tile);orm[:]=[255,rough*255,metal*255]
        du=(np.roll(height,-1,1)-np.roll(height,1,1))*.075
        dv=(np.roll(height,-1,0)-np.roll(height,1,0))*.075
        factor=np.sqrt(1+du*du+dv*dv)
        normal=np.stack([(-du/factor+1)*127.5,(dv/factor+1)*127.5,(1/factor+1)*127.5],axis=-1)
        lum=np.full_like(tile,[168,159,130]) if i==15 else np.zeros_like(tile)
        if i in [1,3]:lum[:]=[43,42,40]
        yy=(3-i//4)*N;xx=(i%4)*N
        for sheet,patch in zip(sheets,[tile,orm,lum,normal]):sheet[yy:yy+N,xx:xx+N]=np.uint8(np.clip(patch,0,255))
    for key,sheet,scale in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if scale>1:sheet=np.uint8(sheet.reshape(1024//scale,scale,1024//scale,scale,3).mean(axis=(1,3)))
        png(folder/(key+'.png'),sheet)
