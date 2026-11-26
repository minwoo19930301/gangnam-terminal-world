"""Check actual evaluated furniture in a saved world. Changes made by this test stay in memory."""
import json
from pathlib import Path
import runpy
import subprocess
import sys

import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
layout=runpy.run_path(str(here/'indoor-layout.py'))
key,component=layout['KEY'],layout['COMPONENT']
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
rows=json.loads(Path(args[args.index('--manifest')+1]).read_text()) if '--manifest' in args else json.loads(
    subprocess.check_output(['node',str(here/'indoor-layout.mjs')]))
scene=bpy.data.scenes[layout['SCENE']]
bpy.context.window.scene=scene
bpy.context.view_layer.update()
dg=bpy.context.evaluated_depsgraph_get()
anchors={o[key]:o for o in scene.objects if key in o}
assert set(anchors)=={r['id'] for r in rows},'Saved instances must cover the live game placements'


def expected(row,point):
    # Evaluate the native local point in the game frame independently of the importer's matrix conversion.
    a,b,c=point;x,y,z=a,c,-b;m=row['matrix']
    e=[m[i]*x+m[4+i]*y+m[8+i]*z+m[12+i] for i in range(3)]
    return Vector((e[0],-e[2],e[1]+row['terrain']))


worst=0
for row in rows:
    anchor=anchors[row['id']]
    evaluated=anchor.evaluated_get(dg).matrix_world
    for native in [(0,0,0),(.91,.13,0),(.12,.92,.06),(0,.08,1.03)]:
        error=(evaluated@Vector(native)-expected(row,native)).length
        worst=max(worst,error)
        assert error<.00019,(row['id'],'frame',error)
    children={o[component]:o for o in anchor.children if component in o}
    assert set(children)==set(row['collections'])
    primary=children[row['collections'][0]].instance_collection
    fallback=Vector(primary.get('preview_origin',primary.get('origin',[0,0,0])))
    for name in row['collections']:
        ob=children[name]
        c=ob.instance_collection
        assert c.name==name and c.library.filepath=='//../'+row['library'],(name,c.library.filepath)
        sampling=next((o for o in c.all_objects if o.type=='MESH' and o.data.vertices),None)
        if sampling:
            part=sampling.evaluated_get(dg)
            vertices=part.data.vertices
            samples=[v.co for v in (vertices[0],vertices[len(vertices)//2],vertices[-1])]
        else:
            # Validate the location and both local axes of an editable rectangular luminaire.
            part=next(o for o in c.all_objects if o.type=='LIGHT' and o.data.type=='AREA').evaluated_get(dg)
            samples=[Vector((0,0,0)),Vector((part.data.size/2,0,0)),Vector((0,part.data.size_y/2,0))]
        origin=(Vector((c['display_offset_x'],c['display_offset_y'],0)) if 'display_offset_x' in c
                else Vector(c.get('preview_origin',c.get('origin',fallback))))
        for point in samples:
            vertex=part.matrix_world@point
            observed=ob.evaluated_get(dg).matrix_world@(vertex-c.instance_offset)
            error=(observed-expected(row,vertex-origin)).length
            worst=max(worst,error)
            assert error<.00022,(row['id'],name,'native vertex',error)
# Validate that updates re-use existing objects, preserve an artist pose and respect an intentional deletion.
pointers={o.as_pointer() for o in scene.objects}
sync=layout['sync_layout']
sync(here,rows)
assert pointers=={o.as_pointer() for o in scene.objects}
sample=next(iter(anchors.values()))
# Blender limits ID names by byte length; a long Korean source name must still exercise renaming.
sample.name='실내 배치 편집 검증'
sample.location.x+=.738
sample.scale.z*=1.067
sample['artist_note']='편집 검증'
personal=bpy.data.objects.new('사용자 실내 작업',None);scene.collection.objects.link(personal)
personal.parent=sample
bpy.context.view_layer.update()
edited=sample.matrix_world.copy()
other=next(o for o in anchors.values() if o!=sample)
for ob in [*other.children,other]:
    for owner in list(ob.users_collection):
        owner.objects.unlink(ob)
sync(here,rows);bpy.context.view_layer.update()
assert sample['artist_note']=='편집 검증' and personal.parent==sample and sample.name.endswith('검증')
assert layout['same'](layout['flat'](sample.matrix_world),layout['flat'](edited))
assert not any(o.get(key)==other[key] for o in scene.objects)
print(f'{len(rows)} surveyed placements, {len({r["library"] for r in rows})} linked native libraries, '
      f'maximum world error {worst*1000:.4f} mm; repeat import, edits and deletions preserved')
