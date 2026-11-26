"""Build the editable Shinbanpo-ro topiary and export its close-view mesh in Blender."""
import math
import random
import subprocess
import sys
import tempfile
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
COLLECTION = "SinbanpoPlazaPlanter"
rng = random.Random(410)
tau = 2 * math.pi


def object_mesh(name, vertices, faces, colors, smooth=False):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    paint = mesh.color_attributes.new(name="COLOR_0", type="BYTE_COLOR", domain="CORNER")
    for face, rgb in zip(mesh.polygons, colors):
        face.use_smooth = smooth
        for i in face.loop_indices:
            paint.data[i].color_srgb = (*rgb, 1)
    uv=mesh.uv_layers.new(name="석재 골재")
    for polygon in mesh.polygons:
        n=polygon.normal
        for loop in polygon.loop_indices:
            x,y,z=mesh.vertices[mesh.loops[loop].vertex_index].co
            if "석재" in name:
                u,v=(x,y) if abs(n.z)>.7 else ((x if abs(n.y)>abs(n.x) else y),z)
                uv.data[loop].uv=(u*3.5,v*3.5)
            else:
                uv.data[loop].uv=(.5/48,.5/48)
    mesh.materials.append(material)
    obj = bpy.data.objects.new(name, mesh)
    group.objects.link(obj)


def tone(hex_color, multiplier=1):
    return tuple(min(1, ((hex_color >> n) & 255) * multiplier / 255) for n in (16, 8, 0))


def ring_mesh(name, rings, paint):
    verts = [p for ring in rings for p in ring]
    n = len(rings[0])
    faces, colors = [], []
    for j in range(len(rings)-1):
        for i in range(n):
            a, b = j*n+i, j*n+(i+1)%n
            faces.append((a, b, b+n, a+n))
            colors.append(tone(paint[j], [1, .97, 1.02, .95][i%4]))
    object_mesh(name, verts, faces, colors)


def square(radius, height):
    bevel = .028
    outline = [(-radius+bevel,-radius),(radius-bevel,-radius),(radius,-radius+bevel),
               (radius,radius-bevel),(radius-bevel,radius),(-radius+bevel,radius),
               (-radius,radius-bevel),(-radius,-radius+bevel)]
    return [(x,y,height) for x,y in outline]


def bough(name, points, radii, sides=6):
    rings = []
    for j, point in enumerate(points):
        axis = (Vector(points[min(j+1,len(points)-1)])-Vector(points[max(0,j-1)])).normalized()
        u = axis.cross(Vector((0,1,0))).normalized()
        v = axis.cross(u)
        rings.append([Vector(point) + radii[j]*(math.cos(i*tau/sides)*u+math.sin(i*tau/sides)*v) for i in range(sides)])
    ring_mesh(name, rings, [0x4e4435,0x544a38,0x5a4d38][:len(rings)-1])


def tuft(name, x, y, z, width, depth, height, angle, tint):
    # A pinched underside and lobed growing tips leave the forks visible from the pavement.
    points = [(x,y,z-height*.65)]
    count = 9
    for j in range(3):
        for i in range(count):
            a = angle+i*tau/count+.12*j
            radi = [.57,1,.68][j]*rng.uniform(.85,1.11)
            px,py = width*radi*math.cos(a), depth*radi*math.sin(a)
            points.append((x+px,y+py,z+height*[-.38,.11,.56][j]+rng.uniform(-.045,.052)))
    points.append((x-.035,y+.022,z+height*.94))
    faces, colors = [], []
    for i in range(count):
        k = (i+1)%count
        faces.append((0,1+k,1+i)); colors.append(tone(0x32452d,tint*rng.uniform(.93,1.07)))
        for j,c in enumerate([0x465d35,0x566d3e]):
            first = 1+j*count
            faces.append((first+i,first+k,first+k+count,first+i+count))
            colors.append(tone(c,tint*rng.uniform(.92,1.09)))
        faces.append((1+2*count+i,1+2*count+k,len(points)-1))
        colors.append(tone(0x607845,tint*rng.uniform(.94,1.08)))
    # Slim, pointed shoots break the outer edge of each clipped pad.
    for i in range(count):
        a=angle+i*tau/count
        px,py=x+.89*width*math.cos(a),y+.89*depth*math.sin(a)
        base_z=z+rng.uniform(.01,.065)
        w=rng.uniform(.013,.024)
        tip_z=base_z+rng.uniform(.055,.102)
        j=len(points)
        points.extend([(px-w*math.sin(a),py+w*math.cos(a),base_z),
                       (px+w*math.sin(a),py-w*math.cos(a),base_z),
                       (px+.05*math.cos(a),py+.05*math.sin(a),tip_z),
                       (px-.018*math.cos(a),py-.018*math.sin(a),base_z+.027)])
        faces.extend([(j,j+1,j+2),(j+1,j+3,j+2),(j+3,j,j+2)])
        colors.extend([tone(0x607746,tint),tone(0x6b8250,tint),tone(0x4c683b,tint)])
    object_mesh(name, points, faces, colors, True)


def model():
    ring_mesh("회색 석재 화분과 돌출 테두리",
              [square(r,z) for r,z in [(.385,0),(.402,.056),(.414,.61),(.431,.625),
                                         (.431,.683),(.350,.683),(.350,.625)]],
              [0x595955,0x787773,0x61615d,0x85837f,0x96938c,0x62615a])
    soil=square(.351,.626)
    object_mesh("흙이 드러난 식재면", soil, [tuple(range(8))], [tone(0x403a2d)])
    bough("낮게 전정한 중심 줄기", [(0,0,.625),(-.018,.013,.79),(.035,.025,.96),(.012,.012,1.15)],
          [.074,.080,.065,.036],8)
    for i in range(7):
        a=i*tau/7+.14
        unit=Vector((math.cos(a),math.sin(a),0))
        side=Vector((-unit.y,unit.x,0))
        distance=[.41,.51,.39,.56,.44,.51,.47][i]
        h=1.18+.05*math.sin(2*a)
        fork=unit*.20+Vector((.015,.02,h-.16))
        tip=unit*distance+Vector((0,0,h+.09))
        bough(f"굵은 곁가지 {i+1}",[(.018,.018,.83+.019*i),fork,tip],[.048,.036,.014],5)
        for j, shift in enumerate([-.12,.13]):
            end=tip+side*shift+unit*(.035 if j==0 else -.07)
            end.z+=.07+.022*j
            bough(f"끝가지 {i+1}.{j+1}",[fork,tip*.45+end*.55,end],[.022,.014,.006],4)
            tuft(f"전정된 잎 묶음 {i+1}.{j+1}",end.x,end.y,end.z,.25,.19,.20,a+.29*j,.93+.09*math.sin(i+j))
    tuft("가운데의 낮은 잎",.02,.01,1.43,.37,.29,.23,.33,1.04)


def export_surface():
    objects=list(bpy.data.collections[COLLECTION].objects)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name="Surface"
    # The native material previews vertex paint × aggregate. glTF combines
    # COLOR_0 with the base texture intrinsically, including in the Web renderer.
    tree=bpy.context.object.data.materials[0].node_tree
    tree.links.new(tree.nodes.get('StoneGrain').outputs['Color'],tree.nodes.get('Principled BSDF').inputs['Base Color'])
    with tempfile.TemporaryDirectory() as tmp:
        raw=Path(tmp)/"raw.glb"
        bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='EXPORT',export_vertex_color='ACTIVE')
        subprocess.run(['node',str(HERE/'pack.mjs'),str(raw),str(HERE/'planter.glb')],check=True)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    group=bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(group)
    material=bpy.data.materials.new("화강석·수피·잎 정점색")
    material.use_nodes=True
    color=material.node_tree.nodes.new('ShaderNodeVertexColor')
    color.layer_name='COLOR_0'
    shader=material.node_tree.nodes.get('Principled BSDF')
    grain=bpy.data.images.new('회색 석재 잔골재',48,48,alpha=False)
    grain.colorspace_settings.name='Non-Color'
    pixels=[]
    texture_rng=random.Random(92)
    for i in range(48*48):
        g=1.0 if i==0 else texture_rng.choices([.44,.64,.76,.90,.96,1.0],[1,2,6,26,43,22])[0]
        pixels.extend((g,g,g,1.0))
    grain.pixels.foreach_set(pixels)
    grain.pack()
    texture=material.node_tree.nodes.new('ShaderNodeTexImage')
    texture.name='StoneGrain'
    texture.image=grain
    mix=material.node_tree.nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1
    material.node_tree.links.new(color.outputs['Color'],mix.inputs[1])
    material.node_tree.links.new(texture.outputs['Color'],mix.inputs[2])
    material.node_tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.82
    model()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'planter.blend'),compress=True)
export_surface()
