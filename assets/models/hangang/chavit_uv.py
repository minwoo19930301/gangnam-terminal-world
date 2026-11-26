"""Pack, apply and verify the Chavit crown's second UV set.

Blender includes NumPy. Repacking and auditing also need xatlas 0.0.11,
Trimesh 5.2.2 and Shapely 2.2 installed for Blender's Python. Set
CHAVIT_UV_DEPS to their site-packages directory, then run from this directory:
  blender -b chavit-crown.blend --python-exit-code 1 -P chavit_uv.py -- repack
  blender -b chavit-crown.blend --python-exit-code 1 -P chavit_uv.py -- check
The ordinary model builder uses the verified cached UVs and only needs Blender.
"""
import hashlib
import json
import os
import sys
from pathlib import Path

import bpy
import numpy as np

HERE=Path(__file__).resolve().parent
CACHE=HERE/'chavit-lightmap.npz'
LAYER='LightmapUV'


def extract(obj):
    mesh=obj.data
    mesh.calc_loop_triangles()
    vertices=np.array([obj.matrix_world @ vertex.co for vertex in mesh.vertices],dtype=np.float32)
    faces=np.array([triangle.vertices[:] for triangle in mesh.loop_triangles],dtype=np.uint32)
    loops=np.array([triangle.loops[:] for triangle in mesh.loop_triangles],dtype=np.int32)
    return vertices,faces,loops


def signature(vertices,faces,loops):
    h=hashlib.sha256()
    for data in [vertices,faces,loops]:
        h.update(data.tobytes())
    return h.hexdigest()


def objects():
    return sorted((obj for obj in bpy.context.scene.objects if obj.type=='MESH'),key=lambda obj:obj.name)


def uv_data(layer):
    values=np.empty(len(layer.data)*2,dtype=np.float32)
    layer.data.foreach_get('uv',values)
    return values.reshape(-1,2)


def material_layer(mesh):
    if mesh.uv_layers:
        return mesh.uv_layers[0]
    # The original diffuse-colour meshes had zero UV maps. Give each rectangular
    # beam side material coordinates in metres, reserving slot 2 for lightmaps.
    layer=mesh.uv_layers.new(name='UVMap')
    values=np.zeros((len(mesh.loops),2),dtype=np.float32)
    for face in mesh.polygons:
        corners=[mesh.vertices[i].co for i in face.vertices]
        along=(corners[-1]-corners[0]).normalized()
        across=face.normal.cross(along).normalized()
        for key,corner in zip(face.loop_indices,corners):
            delta=corner-corners[0]
            values[key]=(delta.dot(along),delta.dot(across))
    layer.data.foreach_set('uv',values.ravel())
    return layer


def apply_saved_layout():
    with np.load(CACHE,allow_pickle=False) as data:
        for i,obj in enumerate(objects()):
            mesh=obj.data
            if str(data[f'name{i}'])!=obj.name or str(data[f'sig{i}'])!=signature(*extract(obj)):
                raise ValueError('Crown geometry has changed; regenerate its xatlas layout.')
            material=material_layer(mesh)
            old=uv_data(material)
            active=mesh.uv_layers.active_index
            rendered=next((uv.name for uv in mesh.uv_layers if uv.active_render),material.name)
            layer=mesh.uv_layers.get(LAYER) or mesh.uv_layers.new(name=LAYER)
            if mesh.uv_layers.find(LAYER)!=1:
                raise ValueError('LightmapUV must be the second UV channel.')
            layer.data.foreach_set('uv',data[f'uv{i}'].ravel())
            mesh.uv_layers.active_index=active
            mesh.uv_layers[rendered].active_render=True
            if not np.array_equal(old,uv_data(material)):
                raise ValueError('Primary material UVs changed.')


def repack():
    import xatlas
    atlas=xatlas.Atlas()
    items=[extract(obj) for obj in objects()]
    for vertices,faces,_ in items:
        atlas.add_mesh(vertices,faces)
    pack=xatlas.PackOptions()
    pack.resolution=2048
    pack.texels_per_unit=29
    pack.padding=4
    pack.bilinear=True
    atlas.generate(pack_options=pack)
    if atlas.atlas_count!=1:
        raise ValueError(f'Expected one shared page; received {atlas.atlas_count}')
    cache={'width':atlas.width,'height':atlas.height,'charts':atlas.chart_count,'padding':pack.padding}
    for i,(obj,(vertices,faces,loops)) in enumerate(zip(objects(),items)):
        remap,indices,uv=atlas[i]
        if not np.array_equal(remap[indices],faces):
            raise ValueError('xatlas changed input triangle order or winding.')
        values=np.full((len(obj.data.loops),2),np.nan,dtype=np.float32)
        values[loops]=uv[indices]
        if not np.all(np.isfinite(values)) or not np.allclose(values[loops],uv[indices],rtol=0,atol=1e-6):
            raise ValueError('A chart seam split a quad internally; cannot preserve the original topology.')
        cache.update({f'name{i}':obj.name,f'sig{i}':signature(vertices,faces,loops),f'uv{i}':values})
    np.savez_compressed(CACHE,**cache)
    apply_saved_layout()


def audit():
    import shapely
    import trimesh
    import xatlas
    from shapely.strtree import STRtree
    triangles=[]
    records=[]
    runtime_source=(HERE/'chavit-crown.js').read_text()
    runtime=json.loads(runtime_source.split('export const chavitCrown=',1)[1].rstrip().removesuffix(';'))
    with np.load(CACHE,allow_pickle=False) as cache:
        for i,obj in enumerate(objects()):
            v,faces,loops=extract(obj)
            key={'외피 교차 트러스':'ribs','은색 지붕 테두리':'rims'}[obj.name]
            live=runtime[key]
            world=np.column_stack((v[:,0],v[:,2],-v[:,1]))
            if not np.array_equal(faces.ravel(),live['i']) or not np.allclose(world.ravel(),live['p'],rtol=0,atol=.000501):
                raise ValueError('Blender geometry differs from the published millimetre-rounded runtime mesh')
            layers=obj.data.uv_layers
            if len(layers)<2 or layers[1].name!=LAYER:
                raise ValueError(f'{obj.name} does not have {LAYER} in UV slot 2')
            uv=uv_data(layers[1])
            if not np.array_equal(cache[f'uv{i}'],uv) or str(cache[f'sig{i}'])!=signature(v,faces,loops):
                raise ValueError('Saved layout or geometry differs from the verified pack')
            piece=trimesh.Trimesh(vertices=v,faces=faces,process=False)
            if not np.isfinite(v).all() or not np.isfinite(piece.area_faces).all() or piece.area_faces.min()<=1e-10:
                raise ValueError(f'{obj.name} contains a degenerate 3D face')
            tri=uv[loops].astype(np.float64)
            corners=np.column_stack((tri.reshape(-1,2),np.zeros(len(tri)*3))).reshape(-1,3,3)
            areas=trimesh.triangles.area(corners)
            if not np.isfinite(uv).all() or uv.min()<0 or uv.max()>1 or areas.min()<=1e-12:
                raise ValueError(f'{obj.name} contains degenerate or out-of-page UVs')
            records.append({'object':obj.name,'vertices':len(v),'polygons':len(obj.data.polygons),'triangles':len(faces),
                'surface_m2':round(float(piece.area),6),'uv_area_fraction':round(float(areas.sum()),9),
                'min_uv_triangle_area':float(areas.min()),'geometry_sha256':signature(v,faces,loops),
                'primary_uv':layers[0].name,'primary_uv_sha256':hashlib.sha256(uv_data(layers[0]).tobytes()).hexdigest()})
            triangles.append(tri)
        report={key:int(cache[key]) for key in ['width','height','charts','padding']}
    # Continuous polygon intersections catch sub-pixel overlaps. Check every
    # touching pair across both objects too; a shared edge may have zero area.
    polygons=shapely.polygons(np.concatenate(triangles))
    pairs=STRtree(polygons).query(polygons,predicate='intersects')
    left,right=pairs[:,pairs[0]<pairs[1]]
    intersections=shapely.area(shapely.intersection(polygons[left],polygons[right]))
    tolerance=1e-12
    failures=int(np.count_nonzero(intersections>tolerance))
    report.update({'libraries':{'xatlas':xatlas.__version__,'trimesh':trimesh.__version__,'numpy':np.__version__,
        'shapely':shapely.__version__},'layers':['UVMap',LAYER],'objects':records,'total_triangles':len(polygons),
        'shared_atlas_fraction':round(sum(rec['uv_area_fraction'] for rec in records),9),
        'touching_triangle_pairs_checked':len(left),'max_uv_intersection_area':float(intersections.max(initial=0)),
        'positive_area_overlap_pairs':failures,'uv_area_tolerance':tolerance,
        'runtime_geometry_sha256':hashlib.sha256((HERE/'chavit-crown.js').read_bytes()).hexdigest()})
    if failures:
        raise ValueError(f'{failures} UV triangle pairs overlap')
    return report


if __name__=='__main__':
    if path:=os.environ.get('CHAVIT_UV_DEPS'):
        sys.path.append(path)
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    if args==['repack']:
        repack()
    elif args!=['check']:
        raise SystemExit('Expected -- repack or -- check')
    report=audit()
    if args==['repack']:
        bpy.context.preferences.filepaths.save_version=0
        bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath,compress=True)
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if args==['repack']:
        (HERE/'chavit-uv-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
