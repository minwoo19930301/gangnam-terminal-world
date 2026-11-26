"""Model the public entrance merchandise at the Seoul Express Bus Terminal UNIQLO."""
import sys
from pathlib import Path

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-hanbok'),str(directory.parent/'gyeongbu-suiting-aisle'),
              str(directory.parent/'gyeongbu-childrens-aisle'),str(directory.parent/'gyeongbu'),
              str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from store_fabrics import maps,PALETTE
from display_island import sections

save_display(directory,'entrance-fashion','본관 1층 유니클로 · 에어리즘 진열과 토르소','UniqloEntrance',{
    'subject':'Public first-floor apparel island at the Seoul Express Bus Terminal UNIQLO',
    'references':'Naver Place 2066282793 and visitor photography at blog.naver.com/hmnnowk/223877461403 and blog.naver.com/sorbet-/223884572476',
    'registration':'Photo-inspired selection on two fixtures in the existing simulated first floor. Styles refer to the May 2025 photographs.'
},maps,PALETTE,sections)
