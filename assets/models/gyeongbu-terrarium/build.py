"""Editable interpretation of the photographed entrance and public assortment of Park Terrarium."""
from pathlib import Path
import sys

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),str(directory.parent/'gyeongbu-childrens-aisle'),
              str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from finishes import maps,PALETTE
from shop import arch,nursery,timber

def foliage(material):material.use_backface_culling=False

views={
    'arch':((.16,-4.36,1.41),(0,-1.12,1.26),30),
    'stand':((-.31,-3.91,1.54),(.06,.28,.95),26),
    'left':((.18,-2.72,1.52),(-1.18,.20,1.20),29),
    'right':((-.21,-2.78,1.40),(1.12,.07,.97),30),
    'timber':((-.45,-3.16,1.13),(-1.36,-.72,.99),30),
}

for stem,label,name,parts in [('arch','자연목 아치와 걸이 공중식물','AirPlantArch',arch),('stand','백색 철제 선반과 입구 마루','NurseryStand',lambda low=False:nursery('stand',low)),
                             ('left','왼편 산세베리아와 화분','LeftNursery',lambda low=False:nursery('left',low)),
                             ('right','오른편 잎식물과 다육 트레이','RightNursery',lambda low=False:nursery('right',low)),('timber','자작 통나무와 고목 진열','FloristTimber',timber)]:
    dest=directory/stem;dest.mkdir(exist_ok=True)
    save_display(dest,stem,'박테라리움 · '+label,name,{
        'subject':'Park Terrarium, shop 185, third floor of Seoul Express Bus Terminal Flower Market',
        'reference':'Shop photograph credited by Cosmopolitan Korea, 14 March 2023, and visitor material photographs, deepbluecolor.tistory.com/41',
        'registration':'Interpreted merchandise within the existing simulated stall. Dimensions and compositions are approximate.'
    },maps,PALETTE,parts,foliage if stem in ['arch','left','right'] else None,views[stem])
