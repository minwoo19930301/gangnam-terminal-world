"""Rebuild the fourth-floor public hanbok showroom and its distant mesh."""
import sys
from pathlib import Path

sys.dont_write_bytecode = True
directory = Path(__file__).resolve().parent
sys.path[:0] = [str(directory), str(directory.parent/'gyeongbu-suiting-aisle'),
                str(directory.parent/'gyeongbu-childrens-aisle'), str(directory.parent/'gyeongbu'),
                str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from silk import maps, PALETTE
from showroom_hanbok import sections

save_display(directory, 'hanbok-showroom', '4층 고명재한복 · 금직 치마와 저고리 진열', 'HanbokShowroom', {
    'subject': 'Public Gyeongbu fourth-floor hanbok retail display',
    'references': 'Naver Place 31248200, official operator 4F guide, and on-site photographs https://artsynyc.tistory.com/61',
    'registration': 'Naver lists unit 22 on floor 4. The game position and dimensions are inferred. Original woven motifs and embroidery.'
}, maps, PALETTE, sections)
