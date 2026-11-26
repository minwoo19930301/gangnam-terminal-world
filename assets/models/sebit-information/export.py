"""Bake the independent public visitor-room sight lines."""
from pathlib import Path
import bpy,sys,json
from mathutils import Vector
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
from blender_display_export import bake_collection
for file,name in [('shelf','흰 다섯 단 서가와 여행 책자'),('reader','다국어 책장과 세로 열람 화면'),
                  ('desk','곡면 방문 안내대와 상담 집기'),('sign','삼색 상호와 은색 안내 벽'),('arrival','천장 매입등과 입구 문턱')]:
    c=bpy.data.collections['세빛 안내 · '+name]
    # The repeating holes are flat native quads. A small filtered tile reproduces the plate as two
    # runtime triangles and avoids shimmering when the individual holes occupy less than one pixel.
    linked=[]
    if file=='sign':
        holes=next(o for o in c.all_objects if o.name.startswith('금속 타공판의 어두운 구멍'))
        origin=Vector(c['preview_origin']);mesh=holes.data
        pts=[holes.matrix_world@v.co-origin for v in mesh.vertices]
        centres=[sum((pts[i] for i in poly.vertices),Vector())/len(poly.vertices) for poly in mesh.polygons]
        xs=sorted({round(p.x,4) for p in centres});zs=sorted({round(p.z,4) for p in centres})
        pitch_x=xs[1]-xs[0];pitch_z=zs[1]-zs[0]
        assert len(xs)*len(zs)==len(centres)
        data={'x':round((xs[0]+xs[-1])/2,5),'y':round((zs[0]+zs[-1])/2,5),'z':round(-centres[0].y,5),
              'w':round(len(xs)*pitch_x,5),'h':round(len(zs)*pitch_z,5),'repeat':[len(xs),len(zs)],
              'fill':[round((max(p.x for p in pts[:4])-min(p.x for p in pts[:4]))/pitch_x,5),
                      round((max(p.z for p in pts[:4])-min(p.z for p in pts[:4]))/pitch_z,5)]}
        (here/'perforations.js').write_text('// Baked from the editable metal plate in visitor-desk.blend.\nexport const plate='+json.dumps(data,separators=(',',':'))+';\n')
        linked=list(holes.users_collection)
        for owner in linked:owner.objects.unlink(holes)
    try:
        bake_collection(c,'SebitInformation_'+file,here/(file+'.glb'),(.63,.00065) if file in ['shelf','reader'] else None)
    finally:
        for owner in linked:owner.objects.link(holes)
