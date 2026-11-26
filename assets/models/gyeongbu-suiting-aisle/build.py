"""Edit and export the public 7F clothiers' corridor in background Blender."""
from pathlib import Path
import sys

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-childrens-aisle'),
               str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from wool import maps,PALETTE
from showroom import sections

save_display(directory,'suiting-aisle','7층 신사복 · 모직 재킷과 이단 봉',
             'SuitingAisle', {
                 'subject':'Public Gyeongbu 7F wholesale clothing display',
                 'references':'Operator photograph https://exterminal.co.kr/images/floor07.jpg and KTO gallery image 1920593',
                 'registration':'Interpretation in two existing model bays. Individual businesses, current fashion and physical measurements are unverified.'
             },maps,PALETTE,sections)
