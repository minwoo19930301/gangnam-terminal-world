"""Position native collections in the surveyed Blender world using the game’s authored frames."""
import json
from pathlib import Path
import subprocess
import sys

import bpy
from mathutils import Matrix, Vector

SCENE = "시설 · 실내 배치"
KEY = "indoor_placement_id"
BASE = "indoor_source_matrix"
COMPONENT = "indoor_source_collection"
GROUP = "indoor_group"
Y_UP_TO_Z_UP = Matrix(((1,0,0,0), (0,0,-1,0), (0,1,0,0), (0,0,0,1)))


def game_frame(row):
    # THREE stores columns consecutively. Native meshes already use Blender's Z-up frame.
    m = Matrix([row['matrix'][i:i+4] for i in range(0,16,4)]).transposed()
    m.translation += Vector((0,row['terrain'],0))
    return Y_UP_TO_Z_UP @ m @ Y_UP_TO_Z_UP.transposed()


def flat(matrix):
    return [v for row in matrix for v in row]


def same(a,b,tolerance=1e-4):
    return len(a)==len(b) and all(abs(x-y)<=tolerance for x,y in zip(a,b))


def branch(scene, parent, key, label):
    for c in scene.collection.children_recursive:
        if c.get(GROUP)==key:
            return c
    c=bpy.data.collections.new(label)
    c[GROUP]=key
    parent.children.link(c)
    return c


def source_collections(model_dir, rows):
    requests={}
    for row in rows:
        requests.setdefault(row['library'],set()).update(row['collections'])
    output={}
    for file,names in requests.items():
        path=model_dir/file
        def resolved():
            return {c.name:c for c in bpy.data.collections if c.library and c.name in names
                    and Path(bpy.path.abspath(c.library.filepath)).resolve()==path.resolve()}
        sources=resolved()
        missing=names-sources.keys()
        if missing:
            with bpy.data.libraries.load(str(path),link=True,relative=True) as (available,load):
                if not missing.issubset(available.collections):
                    raise ValueError(f"Missing native collections in {file}: {sorted(missing-set(available.collections))}")
                load.collections=sorted(missing)
            sources=resolved()
        for name in names:
            group=sources[name]
            if not group.library.filepath.startswith('//'):
                raise ValueError(f"Expected a relative native library for {file}")
            output[(file,name)]=group
    return output


def source_origin(collection, fallback):
    if 'display_offset_x' in collection:
        return Vector((collection['display_offset_x'],collection['display_offset_y'],0))
    return Vector(collection.get('preview_origin',collection.get('origin',fallback)))


def sync_layout(here, rows=None):
    if rows is None:
        raw=subprocess.check_output(['node',str(Path(here)/'indoor-layout.mjs')],text=True)
        rows=json.loads(raw)
    if not bpy.data.filepath:
        raise ValueError("Save the world Blender file beside its sibling model libraries first")
    if not rows or len({r['id'] for r in rows})!=len(rows):
        raise ValueError("The game returned empty or duplicate indoor placement identities")
    # Resolve and validate every native source before changing an existing arrangement.
    linked=source_collections(Path(bpy.data.filepath).parent.parent,rows)
    scene=bpy.data.scenes.get(SCENE)
    if scene is None:
        scene=bpy.data.scenes.new(SCENE)
        scene.unit_settings.system='METRIC'
        scene.world=bpy.context.scene.world
        scene['안내']='시설과 층별로 실제 게임 좌표에 배치했습니다. 배치 원점을 선택한 뒤 숫자패드의 마침표로 확대할 수 있습니다.'
    # A common untransformed parent allows matrix_parent_inverse to retain shear in non-orthogonal shop frames.
    origin=next((o for o in scene.objects if o.get('indoor_world_datum')),None)
    if origin is None:
        origin=bpy.data.objects.new('터미널 월드 좌표',None)
        origin['indoor_world_datum']=True
        origin.empty_display_size=.01
        origin.hide_select=True
        scene.collection.objects.link(origin)
    current={}
    for ob in sorted(scene.objects,key=lambda o:o.name):
        if KEY in ob:
            current.setdefault(ob[KEY],ob)
    previous=set(json.loads(scene.get('indoor_seen_ids','[]')))
    seen=set()
    for row in rows:
        key=row['id'];seen.add(key)
        anchor=current.get(key)
        if anchor is None and key in previous:
            # Respect an instance the artist removed from this scene.
            continue
        b=branch(scene,scene.collection,row['place'],row['placeName'])
        layer=branch(scene,b,row['place']+'/'+row['floor'],row['floor']+' · '+row['placeName'])
        matrix=game_frame(row)
        if anchor is None:
            label=row['subject'].replace('Daiso stationery','다이소 문구').replace('Daiso kitchen','다이소 조리도구')
            anchor=bpy.data.objects.new(label+' '+key.rsplit('/',1)[1],None)
            anchor.empty_display_type='PLAIN_AXES'
            anchor.empty_display_size=.17
            anchor[KEY]=key
            anchor.parent=origin
            layer.objects.link(anchor)
        old_floor=anchor.get('game_floor')
        if old_floor and old_floor!=row['floor']:
            old_group=row['place']+'/'+old_floor
            for ob in [anchor,*[o for o in anchor.children if COMPONENT in o]]:
                for c in list(ob.users_collection):
                    if c.get(GROUP)==old_group:
                        layer.objects.link(ob)
                        c.objects.unlink(ob)
        previous_matrix=anchor.get(BASE)
        # Keep transform edits, renaming, custom children and moves between collections on subsequent imports.
        # In the unedited case pick up the live frame if the game moved its source.
        effective=anchor.matrix_parent_inverse @ anchor.matrix_basis
        if previous_matrix is None or (anchor.parent==origin and same(flat(effective),previous_matrix)):
            # Blender stores a single object's basis as TRS; leave the residual affine transform in its parent inverse.
            pos,rot,scale=matrix.decompose()
            basis=Matrix.LocRotScale(pos,rot,scale)
            anchor.matrix_basis=basis
            anchor.matrix_parent_inverse=matrix @ basis.inverted()
        anchor[BASE]=flat(matrix)
        anchor['game_floor']=row['floor']
        anchor['game_terrain_m']=row.get('ground',row['terrain'])
        anchor['game_source_present']=True
        components={o[COMPONENT]:o for o in anchor.children if COMPONENT in o}
        old_components=set(json.loads(anchor.get('indoor_seen_components','[]')))
        primary=linked[(row['library'],row['collections'][0])]
        fallback=source_origin(primary,(0,0,0))
        for name in row['collections']:
            child=components.get(name)
            if child is None and name in old_components:
                continue
            source=linked[(row['library'],name)]
            offset=source.instance_offset-source_origin(source,fallback)
            if child is None:
                child=bpy.data.objects.new(name+' · 연결 원본',None)
                child.empty_display_size=.06
                child.instance_type='COLLECTION'
                child.instance_collection=source
                child.parent=anchor
                child[COMPONENT]=name
                layer.objects.link(child)
            old_offset=child.get('indoor_source_offset')
            if old_offset is None or same(child.location,old_offset):
                child.location=offset
            child['indoor_source_offset']=list(offset)
        anchor['indoor_seen_components']=json.dumps(row['collections'],ensure_ascii=False)
    # A source removed in a future game revision remains recoverable in the artist's scene.
    for key in current.keys()-seen:
        current[key]['game_source_present']=False
    scene['indoor_seen_ids']=json.dumps(sorted(seen),ensure_ascii=False)
    return scene


if __name__=='__main__':
    here=Path(__file__).resolve().parent
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    rows=json.loads(Path(args[args.index('--manifest')+1]).read_text()) if '--manifest' in args else None
    scene=sync_layout(here,rows)
    if '--save' in args:
        bpy.context.preferences.filepaths.save_version=0
        bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,compress=True)
    print(SCENE,len([o for o in scene.objects if KEY in o]),'placements')
