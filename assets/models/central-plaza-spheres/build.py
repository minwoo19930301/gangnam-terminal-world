"""Edit the original sphere and bevelled circular bands, then export the material layout."""
import json
import math
from pathlib import Path
import random
import sys

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
COLLECTION = "CentralCityPatinatedSphere"
RADIUS = 1.02
CENTRE = Vector((0, 0, RADIUS))


def material(name, color, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = mat.diffuse_color
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = .38
    return mat


def linear_rgb(hex_color):
    channels = [int(hex_color[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4 for c in channels)


def s_rgb(color):
    channels = [12.92*c if c <= .0031308 else 1.055*c**(1/2.4)-.055 for c in color[:3]]
    return '#' + ''.join(f'{round(min(max(c,0),1)*255):02x}' for c in channels)


def patina_finish(mat):
    nodes, link = mat.node_tree.nodes, mat.node_tree.links.new
    base = nodes.new('ShaderNodeTexNoise')
    base.inputs['Scale'].default_value = 9
    base.inputs['Detail'].default_value = 4
    palette = nodes.new('ShaderNodeValToRGB')
    palette.name = '녹청 색상'
    stops = palette.color_ramp.elements
    stops[0].color = (*linear_rgb('#446052'),1)
    stops[1].color = (*linear_rgb('#96947b'),1)
    stops.new(.49).color = (*linear_rgb('#687368'),1)
    link(base.outputs['Fac'],palette.inputs[0])
    link(palette.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
    grain = nodes.new('ShaderNodeTexNoise')
    grain.inputs['Scale'].default_value = 142
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .36
    bump.inputs['Distance'].default_value = .012
    link(grain.outputs['Fac'],bump.inputs['Height'])
    link(bump.outputs['Normal'],nodes['Principled BSDF'].inputs['Normal'])


def build():
    scene = bpy.context.scene
    group = bpy.data.collections.new(COLLECTION)
    scene.collection.children.link(group)
    core = material("녹청 · 구체 바탕", (.105, .141, .113), .75)
    patina_finish(core)
    edge = material("녹청 · 마모된 띠", (.19, .215, .158), .61)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=20, radius=RADIUS, location=CENTRE)
    sphere = bpy.context.object
    sphere.name = "녹청 구체 · 지름 2.04m"
    for c in list(sphere.users_collection):
        c.objects.unlink(sphere)
    group.objects.link(sphere)
    sphere.data.materials.append(core)
    for face in sphere.data.polygons:
        face.use_smooth = True
    # Several related angles, off-centre arcs and crossing long bands occur on the photographed surface.
    rng = random.Random(173)
    for i in range(23):
        theta = math.radians(rng.uniform(-25, 25) + [28, 75, 126, 161][i % 4])
        tilt = math.radians(rng.uniform(-54, 54))
        normal = Vector((math.cos(theta)*math.cos(tilt), math.sin(theta)*math.cos(tilt), math.sin(tilt)))
        offset = rng.uniform(-.55, .55)
        span = math.sqrt(1-offset**2)
        a = normal.cross(Vector((0, 0, 1))).normalized()
        b = normal.cross(a)
        shape = bpy.data.curves.new(f"띠 중심선 {i+1:02}", "CURVE")
        shape.dimensions = "3D"
        shape.bevel_depth = rng.uniform(.005, .012)
        shape.bevel_resolution = 1
        path = shape.splines.new("POLY")
        path.points.add(95)
        for j, point in enumerate(path.points):
            angle = math.tau*j/len(path.points)
            pos = (normal*offset + span*(a*math.cos(angle) + b*math.sin(angle)))*RADIUS
            point.co = (*pos, 1)
        path.use_cyclic_u = True
        obj = bpy.data.objects.new(f"녹청 돌출 띠 {i+1:02}", shape)
        obj.location = CENTRE
        group.objects.link(obj)
        shape.materials.append(edge)
    shoe = material("짙은 받침", (.026, .030, .025), .78)
    def add_shoe(collection, offset):
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=.31, depth=.10, location=(offset,0,-.015))
        foot = bpy.context.object
        foot.name = "낮은 원형 받침"
        for parent in list(foot.users_collection):
            parent.objects.unlink(foot)
        collection.objects.link(foot)
        foot.data.materials.append(shoe)

    add_shoe(group, 0)
    for name, label, dx, hues, scale in [
        ("CentralCityRippledSphere", "동쪽 · 잔물결 녹청", 3, ['#30463e','#566860','#778177'], (10,10,50)),
        ("CentralCityBronzeSphere", "가운데 · 세로 결 갈색", 6, ['#46392f','#745347','#9a7561'], (25,25,4)),
    ]:
        other = bpy.data.collections.new(name)
        scene.collection.children.link(other)
        other.instance_offset = (dx,0,0)
        other['preview_origin'] = [dx,0,0]
        replacement = material(label, linear_rgb(hues[1]), .66)
        nodes, link = replacement.node_tree.nodes, replacement.node_tree.links.new
        coords = nodes.new('ShaderNodeTexCoord')
        mapping = nodes.new('ShaderNodeVectorMath')
        mapping.operation = 'MULTIPLY'
        mapping.inputs[1].default_value = scale
        link(coords.outputs['Generated'],mapping.inputs[0])
        grain = nodes.new('ShaderNodeTexNoise')
        grain.inputs['Scale'].default_value = 1
        grain.inputs['Detail'].default_value = 3
        link(mapping.outputs['Vector'], grain.inputs['Vector'])
        palette = nodes.new('ShaderNodeValToRGB')
        palette.name = '표면 색상'
        stops = palette.color_ramp.elements
        stops[0].color = (*linear_rgb(hues[0]),1)
        stops[1].color = (*linear_rgb(hues[2]),1)
        stops.new(.5).color = (*linear_rgb(hues[1]),1)
        link(grain.outputs['Fac'],palette.inputs[0])
        link(palette.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .52
        bump.inputs['Distance'].default_value = .018
        link(grain.outputs['Fac'],bump.inputs['Height'])
        link(bump.outputs['Normal'],nodes['Principled BSDF'].inputs['Normal'])
        body = sphere.copy()
        body.name = label
        body.data = sphere.data.copy()
        body.data.materials.clear()
        body.data.materials.append(replacement)
        body.location.x = dx
        other.objects.link(body)
        add_shoe(other, dx)
    bpy.context.view_layer.update()


def export_bands():
    group = bpy.data.collections[COLLECTION]
    bands = []
    for obj in sorted(group.objects, key=lambda ob: ob.name):
        if obj.type != "CURVE":
            continue
        points = [(obj.matrix_world @ p.co.to_3d()-CENTRE)/RADIUS for p in obj.data.splines[0].points]
        p, q, r = (points[k*len(points)//3] for k in range(3))
        normal = (q-p).cross(r-p).normalized()
        distance = normal.dot(p)
        if any(abs(normal.dot(v)-distance)>.001 or abs(v.length-1)>.003 for v in points):
            raise ValueError(f"{obj.name}: the circular band must lie on the sculpture surface")
        bands.append([round(v*1000) for v in (*normal, distance, obj.data.bevel_depth*2)])
    if not bands:
        raise ValueError("Missing editable surface bands")
    target = HERE.parents[2]/"js/places/centralcity.js"
    source = target.read_text()
    before = "    // BEGIN PATINATED SPHERE BANDS\n"
    after = "    // END PATINATED SPHERE BANDS"
    if source.count(before)!=1 or source.count(after)!=1:
        raise ValueError("Missing sphere material export markers")
    content = source[:source.index(before)+len(before)]
    ramp = bpy.data.materials['녹청 · 구체 바탕'].node_tree.nodes['녹청 색상'].color_ramp
    colors = [s_rgb(stop.color) for stop in ramp.elements]
    if len(colors)!=3:
        raise ValueError('Keep the three weathering tones in the game swatch')
    for key,label in [('rippleTones','동쪽 · 잔물결 녹청'),('bronzeTones','가운데 · 세로 결 갈색')]:
        finish = bpy.data.materials[label].node_tree.nodes['표면 색상'].color_ramp
        colors2 = [s_rgb(stop.color) for stop in finish.elements]
        content += "    const "+key+"="+json.dumps(colors2,separators=(',',':'))+";\n"
    content += "    const patinaTones="+json.dumps(colors,separators=(',',':'))+";\n"
    content += "    const patinaBands=[\n"+''.join("      "+json.dumps(band,separators=(',',':'))+",\n" for band in bands)+"    ];\n"
    content += source[source.index(after):]
    if content != source:
        target.write_text(content)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build()
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'spheres.blend'), compress=True)
export_bands()
