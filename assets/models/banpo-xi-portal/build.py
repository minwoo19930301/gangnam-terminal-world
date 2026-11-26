"""Build the public street elevation, in metres, in its editable local frame."""
import json
import math
import runpy
from pathlib import Path

import bpy

HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
group = bpy.data.collections.new('BanpoCentralXiStreetPortal')
bpy.context.scene.collection.children.link(group)
group['export_model'] = 'xi-portal'
group['preview_origin'] = (0, 0, 0)


def finish(name, color, metallic=0, roughness=.53):
    mat = bpy.data.materials.new(name)
    rgb = bytes.fromhex(color)
    mat.diffuse_color = [((v / 255 + .055) / 1.055) ** 2.4 for v in rgb] + [1]
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = mat.diffuse_color
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat


silver = [finish('Silver folded sheet ' + str(i), color, .82, .34) for i, color in enumerate(
    ['c5cbd0', 'e1e4e6', 'f1f0ed', 'dfe0de', 'b8bbbb', 'a1a4a3', '858987', '757971'])]
joint = finish('Recessed brushed metal joints', '797f80', .65, .43)
blade = finish('Sky-facing cross blades', 'd6d9d7', .74, .39)
slate = finish('Raised graphite wordmark', '343b3e', .44, .38)
teal = finish('Legacy turquoise Xi emblem', '007d81')
stone = finish('Pale street paving', 'bbb9b2')
base = finish('Paving joints', '85847e')

# The March 2025 street photograph shows the name and Xi symbol individually lit.
# Keep their unlit daylight pigments and the brushed arch's existing finish.
scene = bpy.context.scene
scene['Seoul apartment night'] = 0.0
for minute, factor in [(0,1),(375,1),(445,0),(1000,0),(1065,1),(1439,1)]:
    scene['Seoul apartment night'] = factor
    scene.keyframe_insert(data_path='["Seoul apartment night"]', frame=minute)
scene.frame_start, scene.frame_end = 0, 1439
scene.frame_set(750)
def night_source(socket):
    driver = socket.driver_add('default_value').driver
    variable = driver.variables.new()
    variable.name, variable.type = 'night', 'CONTEXT_PROP'
    target = variable.targets[0]
    target.context_property, target.data_path = 'ACTIVE_SCENE', '["Seoul apartment night"]'
    driver.expression = 'night'


for mat, mask, glow in [(slate,0.0,(1,.95,.86)), (teal,.5,(.28,.74,1))]:
    mat['portal_light_id'] = mask
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Emission Color'].default_value = (*glow, 1)
    night_source(bsdf.inputs['Emission Strength'])


def soffit_wash(base):
    # The inner fascia picks up separate warm pools. Object coordinates keep the
    # light pattern on the metal when a city instance moves or rotates.
    mat = base.copy()
    mat.name = base.name + ' · reflected soffit light'
    mat['portal_light_id'] = .75
    tree = mat.node_tree
    bsdf = tree.nodes.get('Principled BSDF')
    bsdf.inputs['Emission Color'].default_value = (1,.67,.30,1)
    coords = tree.nodes.new('ShaderNodeTexCoord')
    separate = tree.nodes.new('ShaderNodeSeparateXYZ')
    tree.links.new(coords.outputs['Object'], separate.inputs[0])
    output = separate.outputs['X']
    for op, constants in [('MULTIPLY',[3.65]),('COSINE',[]),('MULTIPLY_ADD',[.5,.5]),
                          ('POWER',[3]),('MULTIPLY_ADD',[.48,.08])]:
        node = tree.nodes.new('ShaderNodeMath')
        node.operation = op
        tree.links.new(output, node.inputs[0])
        for i,value in enumerate(constants,1):
            node.inputs[i].default_value = value
        output = node.outputs[0]
    gated = tree.nodes.new('ShaderNodeMath')
    gated.operation = 'MULTIPLY'
    tree.links.new(output, gated.inputs[0])
    night_source(gated.inputs[1])
    tree.links.new(gated.outputs[0], bsdf.inputs['Emission Strength'])
    return mat


def mesh(name, verts, faces, materials, slots=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(x, -z, y) for x, y, z in verts], [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    group.objects.link(obj)
    for mat in materials:
        data.materials.append(mat)
    if slots:
        for face, slot in zip(data.polygons, slots):
            face.material_index = slot
    return obj


def box(name, x, y, z, w, h, d, mat):
    verts = [(x + i*w/2, y + j*h/2, z + k*d/2)
             for i, j, k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),
                             (-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    return mesh(name, verts, [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)], [mat])


segments = [
    [(-11.5,-.45),(-10.88,1.7),(-10.41,5.05),(-8.45,5.29)],
    [(-8.45,5.29),(-4.2,5.73),(4.15,5.82),(8.13,5.42)],
    [(8.13,5.42),(10.18,5.19),(10.61,2.72),(11.55,-.46)]]
profile = [(0,.76),(.32,.65),(.48,.39),(.51,-.32),(.30,-.69),
           (-.28,-.68),(-.48,-.38),(-.49,.31),(-.35,.64),(-.15,.75)]
face_colors = [0,1,2,3,4,5,6,5,4,0]


def frame(t):
    i = min(int(t), 2)
    u = t-i
    p = segments[i]
    pos = [sum(k*v[a] for k,v in zip([(1-u)**3,3*(1-u)**2*u,3*(1-u)*u*u,u**3],p)) for a in (0,1)]
    dx, dy = [3*sum(k*(p[j+1][a]-p[j][a]) for j,k in enumerate([(1-u)**2,2*(1-u)*u,u*u])) for a in (0,1)]
    mag = math.hypot(dx,dy)
    return *pos, -dy/mag, dx/mag


def sweep(name, times, offset=0, scale=1, seam=False):
    pts, faces, slots = [], [], []
    for t in times:
        x,y,nx,ny = frame(t)
        # Behind the crown, the secondary eave blends back into the curved
        # sides. Its ends have no exposed hovering caps above the pavement.
        spread = max(0,min(1,(t-.5)*2.6,(2.5-t)*2.6)) if offset else 0
        for radial, depth in profile:
            pts.append((x+nx*radial*scale,y+ny*radial*scale-.38*spread,
                        offset*spread+depth*scale))
    n = len(profile)
    for j in range(len(times)-1):
        for k in range(n):
            m = (k+1)%n
            faces.append((j*n+k,j*n+m,(j+1)*n+m,(j+1)*n+k))
            slots.append(0 if seam else face_colors[k])
    faces.extend([tuple(reversed(range(n))),tuple(range(len(pts)-n,len(pts)))])
    obj = mesh(name,pts,faces,[joint] if seam else silver,slots+[0,0])
    if not seam:
        for face in list(obj.data.polygons)[:-2]:
            face.use_smooth = True
    return obj


times = [i/16 for i in range(49)]
sweep('01 · Bent front silver shell', times)
rear = sweep('02 · Receding silver header', [i/16 for i in range(8,41)], -2.85, .59)
wash_slots = {}
for face in list(rear.data.polygons)[:-2]:
    # Only the central viewer-facing strip below the open blades catches the light.
    if face.index % len(profile) not in (8,9,0) or abs(face.center.x) > 7.0:
        continue
    base_slot = face.material_index
    if base_slot not in wash_slots:
        wash_slots[base_slot] = len(rear.data.materials)
        rear.data.materials.append(soffit_wash(silver[base_slot]))
    face.material_index = wash_slots[base_slot]
for i,t in enumerate([.2,.4,.62,.85]+[1+i/12 for i in range(13)]+[2.19,2.42,2.65,2.84]):
    # Cap joints follow the folded cross section. The dark line is 18–28 mm wide.
    sweep('Front panel joint %02d'%i,[t-.0009,t+.0009],scale=1.007,seam=True)
for i in range(27):
    t = .87+i*1.26/26
    x,y,_,_ = frame(t)
    box('Open soffit blade %02d'%i,x,y-.23,-1.55,.13,.44,2.60,blade)
for side in [-1,1]:
    x = 11.5*side
    y = -.0065*x
    box('Pavement mortar bed',x,y+.071,0,2.35,.085,2.55,base)
    for i in range(4):
        for j in range(3):
            box('Flush pale paver',x+(i-1.5)*.58,y+.122,(j-1)*.83,.569,.025,.818,stone)

data = json.loads((HERE.parent/'banpo-apartments/xi-legacy-mark.json').read_text())
verts = [(x*1.08-2.48,6.23+y*.94,.18) for x,y in data['vertices']]
mesh('Historical Xi emblem',verts,data['triangles'],[teal])
font = bpy.data.curves.new('Raised Korean lettering','FONT')
font.font = bpy.data.fonts.load('/System/Library/Fonts/Supplemental/AppleGothic.ttf')
font.body = '반포센트럴자이'
font.extrude = .017
font.resolution_u = 2
font.fill_mode = 'FRONT'
obj = bpy.data.objects.new('Raised name · 반포센트럴자이',font)
group.objects.link(obj)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.convert(target='MESH')
coords = [v.co.copy() for v in obj.data.vertices]
xmin,xmax = min(v.x for v in coords),max(v.x for v in coords)
ymin,ymax = min(v.y for v in coords),max(v.y for v in coords)
for v,raw in zip(obj.data.vertices,coords):
    v.co = ((raw.x-xmin)/(xmax-xmin)*3.9-1.21,-.17-raw.z,6.23+(raw.y-ymin)/(ymax-ymin)*.55)
obj.data.materials.append(slate)
for x in [-2.02,-.98,.16,1.36,2.48]:
    box('Letter standoff',x,6.17,0,.042,.22,.1,joint)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'silver-portal.blend'),compress=True)
runpy.run_path(str(HERE/'export.py'),run_name='__main__')
