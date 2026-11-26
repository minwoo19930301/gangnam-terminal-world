"""Show the editable apartment exteriors at their reference positions in the city scene."""
from pathlib import Path
import bpy


def mount_apartments(city):
    path = Path(__file__).resolve().with_name("banpo-apartments.blend")
    linked = [coll for coll in bpy.data.collections if coll.library and coll.get("estate_id")
              and Path(bpy.path.abspath(coll.library.filepath)).resolve() == path]
    existing = {coll.name for coll in linked}
    with bpy.data.libraries.load(str(path), link=True, relative=True) as (source, target):
        target.collections = [name for name in source.collections if name.endswith(" · 외관") and name not in existing]
    linked.extend(target.collections)
    exterior = city.collection.children["건축 · 외관"]
    shelf = exterior.children.get("신반포로 · 아파트 원본")
    if not shelf:
        shelf = bpy.data.collections.new("신반포로 · 아파트 원본")
        exterior.children.link(shelf)
    cameras = [obj for obj in bpy.data.objects if obj.library and obj.name.endswith(" · 보도 카메라")
               and Path(bpy.path.abspath(obj.library.filepath)).resolve() == path]
    existing = {obj.name for obj in cameras}
    with bpy.data.libraries.load(str(path), link=True, relative=True) as (source, target):
        target.objects = [name for name in source.objects if name.endswith(" · 보도 카메라") and name not in existing]
    cameras.extend(target.objects)
    for camera in cameras:
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
    # Earlier versions hid these unrelated low-rise buildings along with the
    # surrounding tower rectangle. Restore them when remounting an existing city.
    released = {"413354849", "413354836", "413354837", "562507245", "413367427", "413367428"}
    for obj in city.objects:
        osm = obj.get("osm_id")
        if osm in visible_ids or osm in released:
            hidden = osm in visible_ids
            obj.hide_render = hidden
            for layer in city.view_layers:
                obj.hide_set(hidden, view_layer=layer)
