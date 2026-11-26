"""Seoul Gyeongbu waiting-room ceiling in metres. Blender X=east in plan, -Y=south."""
import math
from pathlib import Path
import bpy
from mathutils import Vector

out = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
parts = bpy.data.collections.new('1F waiting lounge · editable ceiling sections')
scene.collection.children.link(parts)
material = bpy.data.materials.new('Oak, aluminium, diffuser · shared finish')
material.use_nodes = True
shader = material.node_tree.nodes.get('Principled BSDF')
tint = material.node_tree.nodes.new('ShaderNodeVertexColor')
tint.layer_name = 'Finish'
material.node_tree.links.new(tint.outputs['Color'], shader.inputs['Base Color'])
shader.inputs['Roughness'].default_value = .84
# The lens is luminous independently of the outdoor sky. All other surfaces
# sample the black half, allowing the complete assembly to share a draw.
mask = bpy.data.images.new('Diffuser mask', width=2, height=1)
mask.pixels[:] = [0,0,0,1,1,.97,.9,1]
mask.pack()
tex = material.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = mask
tex.interpolation = 'Closest'
material.node_tree.links.new(tex.outputs['Color'], shader.inputs['Emission Color'])
shader.inputs['Emission Strength'].default_value = .85

vertices, faces, colors, luminous = [], [], [], []
def face(points, color, light=False):
    start = len(vertices)
    vertices.extend([(x,-v,z) for x,v,z in points])
    faces.append(tuple(range(start,len(vertices))))
    colors.extend([color] * len(points))
    luminous.append(light)

def underside(x0,v0,x1,v1,z,color,light=False):
    face([(x0,v0,z),(x1,v0,z),(x1,v1,z),(x0,v1,z)],color,light)

def finish(name):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
    for dst,rgb in zip(attr.data,colors):
        dst.color_srgb=(*[c/255 for c in rgb],1)
    uv=mesh.uv_layers.new(name='Lens mask')
    for poly,light in zip(mesh.polygons,luminous):
        for i in poly.loop_indices:
            uv.data[i].uv=(.75 if light else .25,.5)
    mesh.materials.append(material)
    obj=bpy.data.objects.new(name,mesh)
    parts.objects.link(obj)
    vertices.clear(); faces.clear(); colors.clear(); luminous.clear()

def rib(x, width, profile, color):
    # The three faces visible below a suspended blade. The sides extend up to
    # the backing, including the return where a column meets the ceiling.
    for (v0,z0),(v1,z1) in zip(profile,profile[1:]):
        l,r=x-width/2,x+width/2
        underside_color=tuple(c+8 for c in color)
        face([(l,v0,z0),(r,v0,z0),(r,v1,z1),(l,v1,z1)],underside_color)
        face([(l,v1,z1),(l,v1,3.977),(l,v0,3.977),(l,v0,z0)],color)
        face([(r,v0,z0),(r,v0,3.977),(r,v1,3.977),(r,v1,z1)],color)

underside(-6.35,-9,6.35,9,3.978,(82,70,60))
finish('01 · shadow backing above oak blades')
# Column centres follow the two planted pillars already in the gameplay model.
columns=[(-1.465,-4.909),(4.396,4.091)]
pitch=.145
for i in range(87):
    x=(i-43)*pitch
    tone=(i*7)%11-5
    col=tuple(v+tone for v in (135,111,88))
    profile=[(-9,3.79)]
    for cx,cv in columns:
        if abs(x-cx)>.52: continue
        # A radiused return on both sides of the column head.
        for side,angles in [(-1,range(0,91,15)),(1,range(90,-1,-15))]:
            for angle in angles:
                a=math.radians(angle)
                profile.append((cv+side*(.48+.59*(1-math.sin(a))),3.79-.59*(1-math.cos(a))))
    profile.append((9,3.79))
    rib(x,.054,profile,col)
    if i%11==10 or i==86: finish('02 · oak blade bank %02d' % (i//11+1))

for row,idx in enumerate([-39,-27,-14,-2,11,24,37]):
    x=(idx+.5)*pitch
    for v in [-6.0,-.4,5.2]:
        v+=.6 if row%2 else -.6
        if any(abs(x-cx)<.67 and abs(v-cv)<2.35 for cx,cv in columns): continue
        underside(x-.058,v-1.67,x+.058,v+1.67,3.784,(94,90,82))
        underside(x-.036,v-1.62,x+.036,v+1.62,3.781,(232,229,216),True)
    finish('03 · recessed linear fittings %02d' % (row+1))
for idx,(x,v) in enumerate([(-3.4,-1.6),(2.3,1.8)]):
    underside(x-.48,v-.48,x+.48,v+.48,3.778,(203,201,187))
    for k in range(18):
        z=v-.38+k*.044
        underside(x-.37,z,x+.37,z+.016,3.774,(144,143,132))
    finish('04 · square ventilation cassette %d' % (idx+1))
bpy.ops.wm.save_as_mainfile(filepath=str(out/'waiting-ceiling.blend'),compress=True)
for obj in parts.objects: obj.select_set(True)
bpy.context.view_layer.objects.active=next(iter(parts.objects))
bpy.ops.object.join()
bpy.ops.export_scene.gltf(filepath=str(out/'waiting-ceiling.glb'),export_format='GLB',use_selection=True,export_yup=True)
