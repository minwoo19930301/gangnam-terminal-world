"""Export the edited home-gardening display, omitting enclosed surfaces from nested stock."""
from collections import defaultdict
from pathlib import Path
import sys
import bmesh
import bpy
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection


def export_pots():
    group=bpy.data.collections['다이소 · 홈가드닝 화분 진열']
    stacks=defaultdict(list)
    for obj in group.all_objects:
        if 'stack_profile' not in obj or obj.type!='MESH':
            continue
        # Only co-axial copies on the same shelf can hide one another. A moved or
        # tipped pot is exported whole even if the artist left its stock label intact.
        m=obj.matrix_world
        axis=m.to_3x3() @ Vector((0,0,1))
        if axis.normalized().z<.9999:
            continue
        bounds=[m @ Vector(pt) for pt in obj.bound_box]
        key=(obj['stack_profile'],round(m.translation.x,3),round(m.translation.y,3),
             tuple(round(v,3) for row in m.to_3x3() for v in row))
        stacks[key].append((min(p.z for p in bounds),max(p.z for p in bounds),obj))
    changes=[];modifiers=[]
    try:
        for pile in stacks.values():
            pile.sort(key=lambda row:row[0])
            for i,(bottom,top,obj) in enumerate(pile):
                lower=pile[i-1][1] if i and pile[i-1][1]>bottom else None
                upper=i+1<len(pile) and pile[i+1][0]<top
                if (lower is not None or upper) and obj.data.attributes.get('inside_well') is not None:
                    source=obj.data
                    obj.data=source.copy()
                    changes.append((obj,source))
                    well=source.attributes['inside_well'].data
                    bm=bmesh.new()
                    try:
                        bm.from_mesh(obj.data)
                        remove=[]
                        for f in bm.faces:
                            inside=well[f.index].value
                            if (upper and inside) or (lower is not None and not inside and
                                    max((obj.matrix_world @ v.co).z for v in f.verts)<lower-.001):
                                remove.append(f)
                        if remove:bmesh.ops.delete(bm,geom=remove,context='FACES')
                        bm.to_mesh(obj.data)
                    finally:bm.free()
                if not obj['stack_profile'].startswith('tray '):
                    mod=obj.modifiers.new('웹 진열용 곡면 단순화','DECIMATE')
                    mod.ratio=.49
                    modifiers.append((obj,mod))
        bpy.context.view_layer.update()
        bake_collection(group,'DaisoGardenPots',here/'pots.glb')
    finally:
        for obj,mod in modifiers:obj.modifiers.remove(mod)
        for obj,source in changes:
            temp=obj.data;obj.data=source;bpy.data.meshes.remove(temp)
export_pots()

bake_collection(bpy.data.collections['다이소 · 화분 옆 조화 진열'],'DaisoFlowerStand',here/'bouquets.glb')
