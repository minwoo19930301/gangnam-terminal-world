"""Build two independently streamed sales rails from May 2025 customer references."""
from pathlib import Path
import sys

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-uniqlo'),str(directory.parent/'gyeongbu-hanbok'),
              str(directory.parent/'gyeongbu-suiting-aisle'),str(directory.parent/'gyeongbu-childrens-aisle'),
              str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from finishes import maps,PALETTE
from garment_rail import sections

for style,collection,obj in [('parka','유니클로 · 경량 후드 파카 양면 행거','UVParkaRail'),
                             ('blouse','유니클로 · 시어서커 블라우스 양면 행거','SeersuckerRail')]:
    dest=directory/style;dest.mkdir(exist_ok=True)
    save_display(dest,style+'-rail',collection,obj,{
        'subject':'Public customer-facing garment rack, Seoul Express Bus Terminal UNIQLO',
        'references':'On-site photographs: m.blog.naver.com/sorbet-/223884572476 and m.blog.naver.com/hmnnowk/223877461403',
        'registration':'Two photographed styles interpreted on freestanding fixtures in the existing simulated sales area.'
    },lambda folder:maps(folder,style),PALETTE,lambda low=False:sections(style,low))
