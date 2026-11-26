"""Build the two documented merchandise fronts of a public flower-market florist supplier."""
from pathlib import Path
import sys

sys.dont_write_bytecode=True
directory=Path(__file__).resolve().parent
sys.path[:0]=[str(directory),str(directory.parent/'gyeongbu-suiting-aisle'),str(directory.parent/'gyeongbu-childrens-aisle'),
              str(directory.parent/'gyeongbu'),str(directory.parent/'gyeongbu-front-entrance')]
from tailoring import TailoredPart
from market_authoring import save_display
from finishes import maps,PALETTE
from ribbon import ribbon_bays
from wrapping import accessories
from counter import cabinet,glass
from reflection import reflection


def ribbons(low=False):
    frame=TailoredPart('01 · Twin aluminium bays and eight shelf levels')
    stock=TailoredPart('02 · Colour-sorted satin, grosgrain and organza ribbon reels')
    tails=TailoredPart('03 · Free ribbon and cut selvedges')
    labels=TailoredPart('04 · Shelf tickets with swatch strips')
    wrap=TailoredPart('05 · Wrapping papers, canvas tote and folded bouquet sleeve')
    bouquet=TailoredPart('06 · Small daisies, stems and leaves')
    ribbon_bays(frame,stock,tails,labels,low);accessories(wrap,bouquet,low)
    return [p for p in [frame,stock,tails,labels,wrap,bouquet] if p.faces]


def crystal_material(mat):
    shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    shader.inputs['Alpha'].default_value=.31;shader.inputs['IOR'].default_value=1.52
    shader.inputs['Coat Weight'].default_value=.25
    mat.surface_render_method='BLENDED'

for stem,collection,obj,sections in [
    ('ribbon','현대데코 · 색상별 리본과 꽃 포장 진열','FloristRibbonReels',ribbons),
    ('case','현대데코 · 원목 진열장과 황동 촛대','FloristBrassAndCabinet',cabinet),
    ('crystal','현대데코 · 절삭 유리 화기와 고블릿','FloristCutGlass',glass)]:
    dest=directory/stem;dest.mkdir(exist_ok=True)
    save_display(dest,stem,collection,obj,{
        'subject':'Flower-arranging supplies, Seoul Express Bus Terminal flower market, 3F',
        'reference':'Customer photographs of 현대데코, https://japankoreadiary.tistory.com/64',
        'registration':'Two disclosed assortments interpreted inside the existing stall footprint. Fixture dimensions are inferred.'
    },maps,PALETTE,sections,crystal_material if stem=='crystal' else None)
reflection(directory/'shelf-reflection.webp')
