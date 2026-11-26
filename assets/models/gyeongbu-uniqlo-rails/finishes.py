"""Swatches of lightweight ripstop, puckered seersucker, wood and printed cards."""
import numpy as np
from atlas import png
from store_fabrics import word

N=128
Y,X=np.mgrid[0:N,0:N]
PALETTE=[(188,146,101),(232,230,220),(184,187,182),(105,107,100),
         (225,226,219),(236,235,225),(226,229,224),(224,224,213),
         (224,223,213),(49,49,48),(242,240,231),(242,242,234),
         (199,32,43),(222,229,228),(198,155,100),(245,238,216)]


def maps(folder,style):
    rng=np.random.default_rng(120955)
    sheets=[np.zeros((4*N,4*N,3),np.uint8) for _ in range(4)]
    for i in [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15]:
        rgb=np.broadcast_to(np.array(PALETTE[i],float),(N,N,3)).copy()
        h=np.zeros((N,N))
        rough=.55;metal=0
        if i in [0,14]:
            h=.55*np.sin(Y*.29+1.6*np.cos(X*.046))+.25*np.cos(Y*.74+.71*np.sin(X*.08));rgb+=h[:,:,None]*4.3
        if i==2:
            h=.42*np.sin(Y*2.41)+.25*np.sin(Y*.73);rgb+=h[:,:,None]*2
            rough=.29;metal=.61
        if i==4:
            # Subtle cross-grain reinforcement and diagonal creases catch highlights on a shell jacket.
            grid=(X%15==0).astype(float)+(Y%15==0).astype(float)
            h=.75*grid+.41*np.cos(X*.94+Y*.18)+.42*np.sin((X-Y)*1.39)
            rgb+=(h*2.3+1.4*np.sin(X*.19+1.8*np.sin(Y*.095)))[:,:,None]
            rough=.53
        if i==5:
            # Alternating tight and relaxed yarns make a puckered window. The weave also affects the normal.
            band=np.cos(Y*1.24+1.75*np.sin(X*.37)+.37*np.cos(X*1.1))
            small=np.cos(X*.96+.88*np.sin(Y*.44))
            h=1.40*band+1.02*small+.54*band*small
            rgb+=(h*3.65)[:,:,None]
            rough=.88
        if i in [6,7,8]:
            h=.65*np.cos(X*(.66 if i==7 else 1.38))+.42*np.cos(Y*.99+np.sin(X*.70))
            rgb+=(h*2.8)[:,:,None];rough=.81 if i==6 else .74
        if i==10:
            rgb[8:36,7:36]=[193,22,35];word(rgb,'UNI',12,11,2,[250,246,235]);word(rgb,'QLO',10,23,2,[250,246,235])
            word(rgb,'M',50,5,6,[57,57,52])
            for j in range(25):
                if j%5!=1:rgb[85:111,9+4*j:10+4*j+j%2]=[61,63,58]
            for y,w in [(45,104),(53,93),(67,113)]:rgb[y:y+2,12:w]=[128,128,120]
        if i==11:
            # The photographed fixture uses a white card above the clothes.
            # Keep durable product names instead of copying the 2025 sale prices.
            rgb[3:7]=[166,41,48]
            if style=='parka':
                word(rgb,'UV',8,20,5,[61,66,64]);word(rgb,'PARKA',8,62,4,[64,66,62])
            else:
                word(rgb,'PUFF',8,17,5,[61,66,64]);word(rgb,'BLOUSE',8,65,4,[64,66,62])
            rgb[103:105,9:104]=[144,146,137];rgb[110:112,9:87]=[144,146,137]
        if i==12:word(rgb,'UNI',22,17,8,[252,248,235]);word(rgb,'QLO',16,68,8,[252,248,235])
        if i==13:
            # Printed line illustration of the silhouette on an editable right-angle card.
            def line(ax,ay,bx,by):
                dx=bx-ax;dy=by-ay;t=np.clip(((X-ax)*dx+(Y-ay)*dy)/(dx*dx+dy*dy),0,1)
                width=np.clip(2.25-np.hypot(X-ax-t*dx,Y-ay-t*dy),0,1)[:,:,None]
                rgb[:]=rgb*(1-width)+np.array([74,83,83])*width
            outline=[(46,32),(31,39),(16,88),(26,93),(39,65),(39,106),(87,106),(87,65),(101,94),(111,88),(98,38),(81,32)]
            if style=='parka':outline.extend([(77,21),(66,11),(57,13),(48,23),(46,32)])
            else:outline=[(50,32),(34,39),(21,57),(26,70),(39,67),(39,106),(87,106),(87,67),(101,70),
                          (108,55),(94,38),(77,32),(69,40),(57,40),(50,32)]
            for a,b in zip(outline,outline[1:]):line(*a,*b)
            if style=='parka':line(64,37,64,103)
        rgb+=rng.normal(0,.40,(N,N,1))
        du=(np.roll(h,-1,1)-np.roll(h,1,1))*.13;dv=(np.roll(h,-1,0)-np.roll(h,1,0))*.13
        scale=np.sqrt(1+du*du+dv*dv)
        norm=np.stack([(-du/scale+1)*127.5,(dv/scale+1)*127.5,(1/scale+1)*127.5],axis=-1)
        orm=np.full_like(rgb,[255,rough*255,metal*255])
        emit=np.full_like(rgb,[32,30,28] if i==1 else [0,0,0])
        y=(3-i//4)*N;x=(i%4)*N
        for sheet,tile in zip(sheets,[rgb,orm,emit,norm]):sheet[y:y+N,x:x+N]=np.uint8(np.clip(tile,0,255))
    for key,sheet,stride in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,2]):
        if stride>1:
            sheet=np.uint8(sheet.reshape(512//stride,stride,512//stride,stride,3).mean(axis=(1,3)))
        png(folder/(key+'.png'),sheet)
