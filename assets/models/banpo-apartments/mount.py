"""Show the editable apartment exteriors at their reference positions in the city scene."""
from pathlib import Path
import bpy


def mount_apartments(city):
    path = Path(__file__).resolve().with_name("banpo-apartments.blend")
    linked = [coll for coll in bpy.data.collections if coll.library and coll.get("estate_id")
              and Path(bpy.path.abspath(coll.library.filepath)).resolve() == path]
    if not linked:
        with bpy.data.libraries.load(str(path), link=True, relative=True) as (source, target):
            target.collections = [name for name in source.collections if name.endswith(" · 외관")]
        linked = target.collections
    exterior = city.collection.children["건축 · 외관"]
    shelf = exterior.children.get("신반포로 · 아파트 원본")
    if not shelf:
        shelf = bpy.data.collections.new("신반포로 · 아파트 원본")
        exterior.children.link(shelf)
    with bpy.data.libraries.load(str(path), link=True, relative=True) as (source, target):
        target.objects = [name for name in source.objects if name.endswith(" · 보도 카메라")]
    for camera in target.objects:
        if camera.name not in city.objects:
            shelf.objects.link(camera)
    visible_ids = set()
    for coll in linked:
        model = next(obj for obj in coll.objects if "estate_id" in obj)
        visible_ids.update(map(str, model["claimed_footprints"]))
        if any(obj.instance_collection == coll for obj in shelf.objects):
            continue
        instance = bpy.data.objects.new(model.name, None)
        instance.instance_type = "COLLECTION"
        instance.instance_collection = coll
        instance.empty_display_size = .2
        shelf.objects.link(instance)
    # The streamed game retains the low-detail shells for distant views.
    # Hide these overlapping meshes only in the native city view and render.
    for obj in city.objects:
        if obj.get("osm_id") in visible_ids:
            obj.hide_render = True
            for layer in city.view_layers:
                obj.hide_set(True, view_layer=layer)
