"""Position editors for the generic city streetscape in the master Blender scene."""

import json
from pathlib import Path
from tempfile import NamedTemporaryFile

import bpy
from mathutils import Vector


MANIFEST = "street-layout · 원본 좌표"
POINT_ID = "street_id"
KINDS = {
    "zelkova": "느티나무",
    "pine": "소나무",
    "ginkgo": "은행나무",
    "cherry": "벚나무",
    "maple": "단풍나무",
    "roadLamp": "가로등",
}
TOLERANCE = 0.001


def linked_shapes(world_dir, kinds):
    path = (Path(world_dir).parent / "streetscape/streetscape.blend").resolve()
    required = set(kinds)
    if "roadLamp" in kinds:
        required.add("roadLampLens")

    def matched():
        return {
            c.get("model"): c
            for c in bpy.data.collections
            if c.library
            and Path(bpy.path.abspath(c.library.filepath)).resolve() == path
            and c.get("model") in required
        }

    groups = matched()
    if required - groups.keys():
        with bpy.data.libraries.load(str(path), link=True, relative=True) as (
            available,
            load,
        ):
            load.collections = sorted(required - groups.keys())
    groups = matched()
    if required - groups.keys():
        raise ValueError(
            f"Missing linked source collections: {required - groups.keys()}"
        )
    return groups


def named_vector(nodes, name):
    n = nodes.new("GeometryNodeInputNamedAttribute")
    n.data_type = "FLOAT_VECTOR"
    n.inputs["Name"].default_value = name
    return n.outputs["Attribute"]


def instance_points(obj, groups):
    tree = bpy.data.node_groups.new(obj.name, "GeometryNodeTree")
    tree.interface.new_socket(
        name="Geometry", in_out="INPUT", socket_type="NodeSocketGeometry"
    )
    tree.interface.new_socket(
        name="Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry"
    )
    nodes, join = tree.nodes, tree.links.new
    points = nodes.new("NodeGroupInput")
    finish = nodes.new("NodeGroupOutput")
    merge = nodes.new("GeometryNodeJoinGeometry")
    for source in groups:
        library = nodes.new("GeometryNodeCollectionInfo")
        library.inputs["Collection"].default_value = source
        # The artist arranged the source specimens in rows. Undo that gallery
        # position while keeping the actual linked meshes, not copied geometry.
        local = nodes.new("GeometryNodeTransform")
        local.inputs["Translation"].default_value = source.instance_offset - Vector(
            source["origin"]
        )
        join(library.outputs["Instances"], local.inputs["Geometry"])
        join(local.outputs["Geometry"], merge.inputs["Geometry"])
    instance = nodes.new("GeometryNodeInstanceOnPoints")
    join(points.outputs["Geometry"], instance.inputs["Points"])
    # Realize each source specimen once. Thousands of points then share one
    # evaluated mesh instead of nesting its dozen individual branch objects.
    specimen = nodes.new("GeometryNodeRealizeInstances")
    join(merge.outputs["Geometry"], specimen.inputs["Geometry"])
    join(specimen.outputs["Geometry"], instance.inputs["Instance"])
    join(named_vector(nodes, "street_rotation"), instance.inputs["Rotation"])
    join(named_vector(nodes, "street_scale"), instance.inputs["Scale"])
    join(instance.outputs["Instances"], finish.inputs["Geometry"])
    modifier = obj.modifiers.new("원본 수형·등기구 인스턴스", "NODES")
    modifier.node_group = tree


def build_street_layout(scene, seed_dir, world_dir):
    rows = json.loads((Path(seed_dir) / "street-layout.json").read_text())
    if bpy.data.texts.get(MANIFEST):
        raise ValueError("Street layout already exists in this file")
    manifest = bpy.data.texts.new(MANIFEST)
    manifest.write("\n".join(json.dumps(r, separators=(",", ":")) for r in rows))
    coll = bpy.data.collections.new("가로수 · 가로등 배치")
    scene.collection.children.link(coll)
    kinds = sorted({row["kind"] for row in rows})
    source = linked_shapes(world_dir, kinds)
    for kind in kinds:
        indices = [
            i
            for i, r in enumerate(rows)
            if r["kind"] == kind and r.get("edited", r["xyz"]) is not None
        ]
        active = [rows[i] for i in indices]
        mesh = bpy.data.meshes.new(KINDS[kind] + " 배치점")
        mesh.from_pydata([r.get("edited", r["xyz"]) for r in active], [], [])
        mesh.update()
        mesh.attributes.new(POINT_ID, "INT", "POINT").data.foreach_set("value", indices)
        mesh.attributes.new(
            "street_rotation", "FLOAT_VECTOR", "POINT"
        ).data.foreach_set("vector", [v for r in active for v in (0, 0, r["yaw"])])
        scales = []
        for r in active:
            height = 1 if kind == "roadLamp" else r["h"] / 8
            width = 1 if kind in ("roadLamp", "ginkgo", "pine") else height
            scales.extend((width, width, height))
        mesh.attributes.new("street_scale", "FLOAT_VECTOR", "POINT").data.foreach_set(
            "vector", scales
        )
        obj = bpy.data.objects.new(KINDS[kind] + " · 배치점", mesh)
        obj["street_layout_kind"] = kind
        coll.objects.link(obj)
        instance_points(
            obj,
            [source[kind]] + ([source["roadLampLens"]] if kind == "roadLamp" else []),
        )
    return coll


def export_street_layout(world_dir, target=None):
    manifest = bpy.data.texts.get(MANIFEST)
    if not manifest:
        raise ValueError(
            "Master scene has no street layout; build the current master before exporting"
        )
    rows = [json.loads(line.body) for line in manifest.lines if line.body]
    groups = [
        obj
        for obj in bpy.data.objects
        if obj.get("street_layout_kind") and obj.library is None
    ]
    expected = {r["kind"] for r in rows}
    if {o["street_layout_kind"] for o in groups} != expected:
        raise ValueError(
            "Missing street layout object; delete vertices in Edit Mode to remove individual assets"
        )
    bpy.context.view_layer.update()
    edits, found = {}, set()
    for obj in groups:
        obj.update_from_editmode()
        attr = obj.data.attributes.get(POINT_ID)
        if attr is None:
            raise ValueError(f"No original point ID on {obj.name}")
        for vertex, slot in zip(obj.data.vertices, attr.data, strict=True):
            index = slot.value
            if (
                not 0 <= index < len(rows)
                or index in found
                or rows[index]["kind"] != obj["street_layout_kind"]
            ):
                raise ValueError(
                    f"Invalid or duplicated original point ID {index} on {obj.name}"
                )
            found.add(index)
            row = rows[index]
            xyz = obj.matrix_world @ vertex.co
            base = Vector(row["xyz"])
            initial = Vector(row.get("edited") or row["xyz"])
            if (xyz - base).length < TOLERANCE:
                continue
            prior = row.get("override")
            if prior and (xyz - initial).length < TOLERANCE:
                edits[row["key"]] = prior
                continue
            # Horizontal edits follow the grade; a deliberate vertical edit fixes the Blender elevation.
            altitude = (
                round(xyz.z, 4)
                if abs(xyz.z - initial.z) >= TOLERANCE
                else (prior[2] if prior else None)
            )
            edits[row["key"]] = [round(xyz.x, 4), round(-xyz.y, 4), altitude]
    for i, row in enumerate(rows):
        if i not in found:
            edits[row["key"]] = None
    output = Path(target) if target is not None else Path(world_dir) / "street-edits.js"
    data = (
        "// Blender point edits. Values are [east, south, absolute elevation or null to follow grade]; null removes a point.\n"
        + "export const streetEdits = "
        + json.dumps(edits, sort_keys=True, separators=(",", ":"))
        + ";\n"
    )
    if not output.exists() or output.read_text() != data:
        output.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=output.parent, delete=False
        ) as tmp:
            tmp.write(data)
        Path(tmp.name).replace(output)
    return len(edits)
