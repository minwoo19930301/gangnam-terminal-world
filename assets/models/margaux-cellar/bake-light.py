"""Bake direct and bounced cellar light into the vault and slate vertex colours with Cycles."""
import math
from pathlib import Path
import subprocess
import runpy
import tempfile
import bpy
from mathutils import Matrix,Vector
from mathutils.kdtree import KDTree

here=Path(__file__).resolve().parent
root=here.parents[2]
native=bpy.context.scene
vault=bpy.data.collections['더 마고 그릴 · 벽돌 궁륭과 석재 바닥']
origin=Vector(vault['preview_origin'])
scene=bpy.data.scenes.new('셀러 · 조명 베이크')
bpy.context.window.scene=scene
scene.render.engine='CYCLES'
scene.cycles.samples=40
scene.cycles.max_bounces=4
scene.cycles.diffuse_bounces=3
world=bpy.data.worlds.new('셀러 간접광')
world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.45,.39,.37,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.105
scene.world=world

# Use one temporary mesh for all the editable masonry and tile pieces. The
# native material remains available while Cycles calculates colour bleeding.
vertices,faces,mat_ids,materials,source_tags=[],[],[],[],[]
for ob in sorted(vault.all_objects,key=lambda o:o.name):
    if ob.type!='MESH':continue
    idx=len(vertices)
    vertices.extend(ob.matrix_world@v.co-origin for v in ob.data.vertices)
    for face in ob.data.polygons:
        mat=ob.data.materials[face.material_index]
        if mat not in materials:materials.append(mat)
        mat_ids.append(materials.index(mat))
        source_tags.append(ob.name)
        faces.append(tuple(idx+v for v in face.vertices))
mesh=bpy.data.meshes.new('Cellar masonry and slate')
mesh.from_pydata(vertices,[],faces);mesh.update()
for mat in materials:mesh.materials.append(mat)
for face,i in zip(mesh.polygons,mat_ids):face.material_index=i
target=bpy.data.objects.new('Surface',mesh)
scene.collection.objects.link(target)
data=mesh.color_attributes.new(name='Cycles diffuse lighting',type='FLOAT_COLOR',domain='CORNER')
mesh.color_attributes.active_color=data

# Block bounce and cast shelf-shaped shadows at the actual in-game rack positions.
def occluder(name,x,y,w,d,h):
    cube=bpy.data.meshes.new(name)
    cube.from_pydata([(x+i*w/2,y+j*d/2,k*h) for k in (0,1) for j in (-1,1) for i in (-1,1)],[],
                     [(0,2,3,1),(4,5,7,6),(0,1,5,4),(2,6,7,3),(0,4,6,2),(1,3,7,5)])
    cube.update();cube.materials.append(bpy.data.materials['검은 물푸레나무'])
    ob=bpy.data.objects.new(name,cube);scene.collection.objects.link(ob)
for v in [25.40,27.44,29.48,31.52,33.56,35.60]:
    occluder('West rack shadow',-3.01,31-v,.52,1.96,2.43)
for v in [25.34,27.40,34.53,36.60]:
    occluder('East rack shadow',3.01,31-v,.52,1.96,2.43)
for x in [-1.05,1.05]:
    for yy in [-6.46,6.45]:occluder('End cabinet shadow',x,yy,1.96,.52,2.43)

def light(name,pos,at,size,energy,color,roll=0):
    lamp=bpy.data.lights.new(name,'AREA')
    lamp.shape='RECTANGLE';lamp.size,lamp.size_y=size
    lamp.energy=energy;lamp.color=color
    ob=bpy.data.objects.new(name,lamp);scene.collection.objects.link(ob)
    ob.location=pos
    rot=(Vector(at)-ob.location).to_track_quat('-Z','Y').to_matrix().to_4x4()
    ob.rotation_euler=(rot@Matrix.Rotation(roll,4,'Z')).to_euler()

for side in (-1,1):
    for yy in [-5.7,-3.42,-1.14,1.14,3.42,5.7]:
        # The two concealed strips illuminate upwards from behind the shelf cornices.
        light('따뜻한 코니스 조명',(side*3.04,yy,2.54),(side*2.12,yy,3.34),(2.20,.07),38,(1,.73,.58))
for yy in [-4.65,-.60,3.44]:
    light('진열 조명',(.0,yy,3.57),(.0,yy,.15),(.62,.36),68,(1,.89,.76))
light('유리 출입구로 들어오는 홀 조명',(3.27,-.02,1.97),(.3,-.02,1.05),(1.2,1.4),48,(1,.91,.81))
bpy.ops.object.select_all(action='DESELECT')
target.select_set(True);bpy.context.view_layer.objects.active=target
bpy.context.view_layer.update()
bpy.ops.object.bake(type='DIFFUSE',pass_filter={'DIRECT','INDIRECT','COLOR'},target='VERTEX_COLORS',margin=0)

# The scene is enclosed. Baked artificial light is stable as the sky moves.
# Preserve highlights when converting the linear Cycles result to compact glTF colours.
values=[tuple(loop.color[:3]) for loop in mesh.color_attributes['Cycles diffuse lighting'].data]
# Long mortared strips lie just behind the bricks. A bake at a hidden corner
# of a backing polygon is black even though the narrow exposed seam beside
# it receives light. Interpolate irradiance measured on the adjacent brick faces.
brick_samples=[]
for face in mesh.polygons:
    material=materials[face.material_index]
    if not material.name.startswith('곡면 벽돌'):continue
    for i in face.loop_indices:
        albedo=material.diffuse_color
        irradiance=tuple(values[i][c]/max(.006,albedo[c]) for c in range(3))
        brick_samples.append((mesh.vertices[mesh.loops[i].vertex_index].co.copy(),irradiance))
tree=KDTree(len(brick_samples))
for i,(point,irradiance) in enumerate(brick_samples):tree.insert(point,i)
tree.balance()
for face in mesh.polygons:
    if materials[face.material_index].name!='석회 줄눈':continue
    albedo=materials[face.material_index].diffuse_color
    for i in face.loop_indices:
        point=mesh.vertices[mesh.loops[i].vertex_index].co
        near=tree.find_n(point,5)
        weights=[1/(.016+distance) for _,_,distance in near]
        values[i]=tuple(.82*albedo[c]*sum(w*brick_samples[index][1][c] for w,(_,index,_) in zip(weights,near))/sum(weights) for c in range(3))
mesh.color_attributes.remove(mesh.color_attributes['Cycles diffuse lighting'])
def rolloff(c):
    c=max(0,c)*1.13
    return c if c<.60 else .60+.40*(1-math.exp(-((c-.60)/.40)))
cooked=[tuple(map(rolloff,src)) for src in values]
atlas_room=runpy.run_path(str(here/'bake-atlas.py'))['atlas_room']
with tempfile.TemporaryDirectory() as folder:
    temp=Path(folder)
    geometry,texture=atlas_room(mesh,source_tags,cooked,temp)
    target.data=geometry
    raw=temp/'geometry.glb'
    textured=temp/'room.glb'
    bpy.ops.export_scene.gltf(filepath=str(raw),export_format='GLB',use_selection=True,
        export_materials='NONE',export_texcoords=True,export_vertex_color='ACTIVE',export_yup=True)
    subprocess.run(['node',str(here/'embed-light.mjs'),str(raw),str(texture),str(textured)],check=True)
    subprocess.run(['node',str(root/'tools/optimize_model.mjs'),str(textured),str(here/'vault.glb')],check=True)
subprocess.run(['node',str(root/'tools/pack_display.mjs'),str(here/'vault.glb')],check=True)
lumas=sorted(sum(a*b for a,b in zip(rgb,(.2126,.7152,.0722))) for rgb in values)
print('Baked',len(lumas),'corners. Linear luminance p10, p50, p90:',[round(lumas[int(len(lumas)*q)],4) for q in [.1,.5,.9]])
bpy.context.window.scene=native
