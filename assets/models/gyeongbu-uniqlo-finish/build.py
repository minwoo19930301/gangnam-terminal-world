"""Public wood flooring and ceiling tracks, independent of apparel loading."""
import sys
from pathlib import Path
import numpy as np

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),str(directory.parent/'gyeongbu-childrens-aisle'),
              str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from atlas import png
from garments import Detail
from market_authoring import save_display
from selling_floor import floor,ceiling

PALETTE=[(193,149,103),(232,230,222),(175,180,177)]+[(0,0,0)]*12+[(247,241,221)]

def maps(folder):
    n=128
    sheets=[np.zeros((4*n,4*n,3),np.uint8) for _ in range(4)]
    rng=np.random.default_rng(19435)
    yr,xr=np.mgrid[0:n,0:n]*2
    for i in [0,1,2,15]:
        y=(3-i//4)*n;x=(i%4)*n
        rgb=np.broadcast_to(np.array(PALETTE[i],float),(n,n,3)).copy()
        height=np.zeros((n,n))
        if i==0:
            grain=2.5*np.sin(yr*.118+2.1*np.cos(xr*.016))+1.3*np.cos(yr*.339+.8*np.sin(xr*.033))
            rgb+=grain[:,:,None];height=grain*.22
        elif i==2:rgb+=(1.6*np.sin(yr*2.28)+1.3*np.cos(xr*.043))[:,:,None]
        rgb+=rng.normal(0,.28,(n,n,1))
        du=(np.roll(height,-1,1)-np.roll(height,1,1))*.055
        dv=(np.roll(height,-1,0)-np.roll(height,1,0))*.055
        scale=np.sqrt(1+du*du+dv*dv)
        norm=np.stack([(-du/scale+1)*127.5,(dv/scale+1)*127.5,(1/scale+1)*127.5],axis=-1)
        orm=np.full_like(rgb,[255,{0:138,1:130,2:76,15:79}[i],143 if i==2 else 0])
        emit=np.full_like(rgb,[168,159,130] if i==15 else [43,42,40] if i==1 else [0,0,0])
        for sheet,tile in zip(sheets,[rgb,orm,emit,norm]):sheet[y:y+n,x:x+n]=np.uint8(np.clip(tile,0,255))
    for key,sheet,stride in zip(['surface','metal-rough','lamp','weave-normal'],sheets,[1,4,4,4]):
        png(folder/(key+'.png'),sheet[::stride,::stride])

def sections(low=False):
    planks=Detail('엇갈린 참나무 판재와 집기 아래 음영')
    lights=Detail('노출 흰 천장 보·트랙과 스폿 조명')
    floor(planks,low);ceiling(lights,low)
    return [planks,lights]

save_display(directory,'oak-and-lighting','본관 1층 유니클로 · 참나무 바닥과 노출 천장','UniqloSalesFloor',{
    'subject':'Wood floor and visible white ceiling over the public ground-floor sales area',
    'references':'Customer branch photographs, May–June 2025. Interpreted materials, plank lengths and heights.'
},maps,PALETTE,sections)
