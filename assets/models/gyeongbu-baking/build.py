"""Build the publicly visible baking display in the second-floor terminal annex."""
import sys
from pathlib import Path

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),
              str(directory.parent/'gyeongbu-childrens-aisle'),str(directory.parent/'gyeongbu'),
              str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from baking_finish import maps,PALETTE
from shop import sections

save_display(directory,'baking-shop','부속상가 2층 비앤씨마켓 · 반죽기와 제과 도구','BakingShop',{
    'subject':'B&C Market Banpo public baking supply store',
    'references':'Naver Place 11595041, terminal annex floor map 16 and Bread Garden official Banpo listing; on-site photographs at chordq0539.tistory.com/1052 and ovo0605.tistory.com/39',
    'registration':'Selected public displays occupy the existing simulated annex unit. Merchandise quantities and aisle measurements are approximate.'
},maps,PALETTE,sections)
