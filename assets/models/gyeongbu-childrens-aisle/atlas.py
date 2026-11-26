"""Original knit graphics, polished dark tiles, shutter and ceiling finishes; no photograph is baked."""
import math
import struct
import zlib
import numpy as np

PALETTE=[(68,69,60),(53,106,89),(155,159,153),(198,196,178),(194,199,192),(150,107,72),(53,60,73),(233,226,213),
         (205,67,64),(53,106,181),(233,189,80),(172,151,200),(120,192,174),(58,65,90),(231,232,218),(245,235,210)]
TERMS=[(.43,.01),(.42,.01),(.60,.24),(.88,0),(.34,.62),(.61,.02),(.92,0),(.90,0),
       (.91,0),(.91,0),(.92,0),(.93,0),(.91,0),(.9,0),(.92,0),(.42,0)]
N=256
Y,X=np.mgrid[0:N,0:N]/(N-1)
# The image writer inverts the tile stack. Make motif y=0 its baseline.
Y=1-Y

def png(file,data):
    h,w,_=data.shape
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d))
    raw=b''.join(b'\0'+row.tobytes() for row in data)
    file.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,8))+chunk(b'IEND',b''))

def circle(cx,cy,rx,ry):return ((X-cx)/rx)**2+((Y-cy)/ry)**2<1

def line(x0,y0,x1,y1,width):
    dx,dy=x1-x0,y1-y0
    t=np.clip(((X-x0)*dx+(Y-y0)*dy)/(dx*dx+dy*dy),0,1)
    return (X-x0-t*dx)**2+(Y-y0-t*dy)**2<width*width

def polygon(points):
    inside=np.zeros_like(X,dtype=bool)
    for i,(a,b) in enumerate(points):
        c,d=points[(i+1)%len(points)]
        if d!=b:inside^=((b>Y)!=(d>Y))&(X<(c-a)*(Y-b)/(d-b)+a)
    return inside

def design(i):
    a=np.broadcast_to(np.array(PALETTE[i],float),(N,N,3)).copy()
    put=lambda mask,rgb:np.copyto(a,np.asarray(rgb,float),where=mask[:,:,None])
    cream=(249,236,195);navy=(44,62,89);coral=(224,102,84);gold=(245,201,88)
    if i==8:
        put(polygon([(.27,.51),(.53,.82),(.53,.51)]),cream)
        put(polygon([(.56,.54),(.56,.74),(.71,.54)]),(234,176,96))
        put(line(.545,.49,.545,.818,.007),navy)
        put(polygon([(.25,.49),(.78,.49),(.66,.39),(.36,.39)]),navy)
        for j in range(3):put((abs(Y-(.33-.036*j+.013*np.sin((X-.26+j*.10)*30)))<.006)&(X>.29+.032*j)&(X<.72-.037*j),cream)
    if i==9:
        put(polygon([(.37,.42),(.43,.61),(.52,.75),(.62,.79),(.65,.65),(.58,.52),(.46,.41)]),cream)
        put(polygon([(.427,.55),(.318,.49),(.33,.40),(.455,.45)]),coral)
        put(polygon([(.505,.45),(.54,.337),(.604,.39),(.584,.53)]),coral)
        put(circle(.552,.653,.055,.045),navy)
        put(polygon([(.412,.431),(.453,.401),(.31,.292)]),gold)
        for cx,cy in [(.25,.70),(.76,.60),(.66,.32),(.34,.83)]:put(line(cx-.019,cy,cx+.019,cy,.008)|line(cx,cy-.022,cx,cy+.022,.006),cream)
    if i==10:
        fur=(165,103,65)
        for x in [.337,.664]:put(circle(x,.719,.078,.075),fur);put(circle(x,.717,.045,.043),(224,161,117))
        put(circle(.50,.585,.215,.177),fur);put(circle(.50,.525,.12,.072),(239,195,144))
        for x in [.414,.584]:put(circle(x,.613,.018,.024),navy)
        put(circle(.5,.547,.029,.019),navy);put(line(.5,.532,.50,.502,.006),navy)
        put(line(.46,.491,.50,.502,.006)|line(.50,.502,.54,.488,.006),navy)
        for cx in [.27,.72]:put(circle(cx,.37,.025,.022),coral)
    if i==11:
        for ix in range(5):
            for iy in range(5):
                cx=.08+ix*.21+.065*(iy%2);cy=.11+iy*.20
                for k in range(5):
                    p=math.tau*k/5
                    put(circle(cx+.024*math.cos(p),cy+.022*math.sin(p),.020,.018),(241,225,229))
                put(circle(cx,cy,.014,.015),gold)
    if i==12:
        for ix in range(4):
            for iy in range(5):
                cx=.10+ix*.26+(.11 if iy%2 else 0);cy=.08+iy*.22
                put(circle(cx,cy,.046,.052),(235,169,78));put(circle(cx+.033,cy+.051,.022,.012),(46,116,96))
                put(line(cx-.017,cy-.026,cx-.010,cy+.018,.004),cream)
    if i==13:
        put(np.mod(Y*9+.09,1)<.27,(214,219,208));put(np.mod(Y*9+.09,1)<.045,(118,153,166))
        put(polygon([(.61,.60),(.76,.60),(.75,.49),(.686,.44),(.62,.49)]),coral)
    if i==14:
        put((Y>.77)&(Y<.791),navy);put((Y>.735)&(Y<.747),(144,170,163))
        put(polygon([(.40,.47),(.54,.70),(.68,.47)]),(64,118,91));put(polygon([(.43,.56),(.54,.766),(.649,.56)]),(86,143,111))
        put(polygon([(.525,.402),(.553,.402),(.553,.49),(.525,.49)]),(119,89,68))
    return a

def maps(folder):
    base=[];rough=[];emit=[]
    for i in range(16):
        rnd=np.random.default_rng(194600+i)
        c=design(i);grain=rnd.normal(0,.9,(N,N))
        if i in [0,1]:
            macro=1.8*np.sin(X*5+Y*13)+1.6*np.cos(X*19-Y*6)+.8*np.cos(Y*43+X*31)
            dust=rnd.random((N,N));grain=grain*1.4+macro+(dust>.973)*rnd.uniform(7,21,(N,N))-(dust<.025)*8
            grain+=3*np.exp(-((Y-.64-.065*X-.02*np.sin(X*8))/.005)**2)
        elif i==2:grain+=.7*np.cos(X*205)+1.3*np.cos(Y*78)
        elif i==3:
            pin=rnd.random((N,N));grain=grain*.64-(pin<.045)*13+1.7*np.sin(X*9+Y*7)
        elif i==4:grain=.64*grain+1.5*np.sin(Y*700)
        elif i==5:grain=.9*grain+2.3*np.cos(Y*69+.8*np.sin(X*13))
        elif 6<=i<=14:
            grain=grain*.59+1.5*np.sin(X*2*math.pi*98)*np.cos(Y*2*math.pi*83)+.8*np.cos(Y*94)
        elif i==15:grain=.28*grain+1.4*np.cos(math.tau*X*28)
        base.append(np.clip(c+grain[:,:,None],0,255).astype(np.uint8))
        r,m=TERMS[i];orm=np.zeros((N,N,3),dtype=np.uint8);orm[:,:,0]=255
        orm[:,:,1]=np.clip(r*255+grain*(.8 if i<=1 else .24),0,255)
        orm[:,:,2]=int(m*255);rough.append(orm)
        e=np.zeros((N,N,3),np.uint8)
        if i==15:e[:]=[234,226,201]
        emit.append(e)
    for n,tiles in [('surface',base),('metal-rough',rough),('lamp',emit)]:
        png(folder/(n+'.png'),np.vstack([np.hstack(tiles[r:r+4]) for r in [12,8,4,0]]))
