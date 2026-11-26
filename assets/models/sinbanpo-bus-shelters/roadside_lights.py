"""22-020 roadside poster lamps are off between 03:00 and 04:00 Seoul time."""
import bpy
from mathutils import Vector
from night import bake_lighting


def timed_roadside(prints, lights):
    offset = Vector((0, -4.5, 0))
    def variant(source):
        group = bpy.data.collections.new(source.name + ' 22-020')
        bpy.context.scene.collection.children.link(group)
        group['preview_origin'] = tuple(offset)
        group.instance_offset = offset
        for original in source.objects:
            copy = original.copy()
            copy.data = original.data.copy()
            group.objects.link(copy)
            copy.location += offset
        return group

    def schedule(target, prop):
        # World and source scenes both use one frame per local minute.
        original = getattr(target, prop)
        driver = target.driver_add(prop).driver
        driver.expression = f'{original} * ((frame % 1440 < 180) or (frame % 1440 >= 240))'

    artwork = variant(prints)
    for obj in artwork.objects:
        off = obj.data.materials[0].copy()
        off.name = '22-020 · 차도 방향 인쇄 광고 조명'
        emission = off.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength']
        schedule(emission, 'default_value')
        obj.data.materials.append(off)
        for face in obj.data.polygons:
            if face.normal.y > .5:
                face.material_index = 1
    lighting = variant(lights)
    for lamp in lighting.objects:
        if lamp.name.startswith('광고등 · 뒤 유리'):
            schedule(lamp.data, 'energy')


def bake_roadside_quiet(frame, lights, target):
    rear = [obj.data for obj in lights.objects if obj.name.startswith('광고등 · 뒤 유리')]
    assert len(rear) == 2
    old = [light.energy for light in rear]
    try:
        for light in rear:
            light.energy = 0
        bake_lighting(frame, lights, target)
    finally:
        for light, power in zip(rear, old):
            light.energy = power
