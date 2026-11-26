"""Build the public eighth-floor knitwear and outerwear display without opening Blender."""
import sys
from pathlib import Path

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),
              str(directory.parent/'gyeongbu-childrens-aisle'),str(directory.parent/'gyeongbu'),
              str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from textiles import maps,PALETTE
from boutique import sections
save_display(directory,'womens-aisle','8층 여성복 · 식물무늬 니트와 외투 마네킹','WomensAisle',{
    'subject':"Public Gyeongbu 8F women's knitwear and outerwear aisle",
    'references':'Operator photograph https://exterminal.co.kr/images/floor08.jpg; Korea Tourism Organization clothing market',
    'registration':"An interpreted retail pair in the game's existing eighth-floor bays. Original textile motifs. Exact units, quantities and dimensions are illustrative."
},maps,PALETTE,sections)
