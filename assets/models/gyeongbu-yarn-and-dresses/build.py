"""Create the editable shop finish, wound stock and children's party dresses from the public 6F photograph."""
from pathlib import Path
import sys

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),str(directory.parent/'gyeongbu-childrens-aisle'),
              str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from market_authoring import save_display
from finishes import maps,PALETTE
from yarn import shelf_stock,stock_wrap
from dresses import dress_stock
from shop import booth

def film(material):
    shader=next(n for n in material.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Alpha'].default_value=.14
    shader.inputs['Coat Weight'].default_value=.56
    material.surface_render_method='BLENDED'

collection_names={'booth':'진열장과 표지','yarn':'실타래와 종이띠','wrap':'도매용 투명 묶음','dresses':'아동 드레스와 저지'}

for key,label,model,parts,view in [
    ('booth','상점 마감과 면사 울사 전문도매 표지','CottonWoolShop',booth,((0,-5.1,1.62),(.02,0,1.50),31)),
    ('yarn','종이띠를 두른 면사와 울사 실타래','CottonWoolSkeins',shelf_stock,((1.27,-3.27,1.45),(1.25,.15,1.26),34)),
    ('wrap','도매 묶음의 투명 봉투와 접힌 이음매','WrappedWholesaleYarn',stock_wrap,((.67,-2.80,1.47),(1.25,-.62,1.25),38)),
    ('dresses','새틴 허리띠와 자수 주름 아동 드레스','ChildrensPleatedDresses',dress_stock,((-1.27,-3.25,1.48),(-1.29,.51,1.40),32))]:
    dest=directory/key;dest.mkdir(exist_ok=True)
    save_display(dest,key,'6층 면사·울사 · '+collection_names[key],model,{
        'subject':label,
        'reference':'Terminal operator 6F public photograph, https://exterminal.co.kr/images/floor06.jpg',
        'registration':'Reference confirms the assortment and category sign. Shop unit, dimensions, item colours and quantities are interpreted.'
    },maps,PALETTE,parts,configure_material=film if key=='wrap' else None,camera_view=view)
