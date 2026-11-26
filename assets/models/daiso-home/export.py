"""Bake the editable home-decor and wood houseware shelves separately."""
from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
sys.dont_write_bytecode = True
sys.path.insert(0, str(here.parents[2] / 'tools'))
from blender_display_export import bake_collection

for title, key, ratio in [('달항아리와 압화 액자 진열','jars',.51),('나무 소반과 컵받침·카드꽂이','wood',.49)]:
    collection = bpy.data.collections['다이소 · ' + title]
    # Retain the round openings and silhouettes while reducing small curled petals and felt beads in the browser.
    mods = []
    for ob in collection.all_objects:
        label = ob.name
        ratio_for_part = None
        if label.startswith(('윗줄 유백색','가운데 크고 작은','아래 선반의 목이 열린')):
            ratio_for_part = .45
        elif label.startswith(('수제 느낌의 펠트','연분홍 매화','짙은 수술','꽃받침의 노란','천공 주위')):
            ratio_for_part = .24
        elif label.startswith(('고무나무 원형','고무나무 사각','물결 가장자리의 낮은','벌어진 소반 다리')):
            ratio_for_part = .35
        if ratio_for_part:
            mod=ob.modifiers.new('매대 거리에서 보이는 곡률','DECIMATE')
            mod.ratio=ratio_for_part
            mods.append((ob,mod))
    bpy.context.view_layer.update()
    try:
        bake_collection(collection, 'Daiso_'+key, here/(key+'.glb'), simplification=(ratio,.0012),
                    color_attribute='매장 조명',preserve_smoothing=True)
    finally:
        for ob,mod in mods:
            ob.modifiers.remove(mod)
