"""Recreate the editable stair tread, riser, nosing and handrail source."""
from pathlib import Path
import runpy
import bpy

here=Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='일반 계단 · 디딤코와 손스침'
scene.unit_settings.system='METRIC'

def surface(name,role,colour):
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*colour,1);mat['surface_role']=role
    return mat

stone=surface('디딤판과 챌판','step',(.38,.39,.40))
edge=surface('디딤코 마감','edge',(.78,.68,.43))
metal=surface('손스침','rail',(.56,.59,.61))

def shape(name,key,verts,faces,materials,slots,location):
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    for mat in materials:mesh.materials.append(mat)
    for p,i in zip(mesh.polygons,slots):p.material_index=i
    obj=bpy.data.objects.new(name,mesh);scene.collection.objects.link(obj)
    obj['stair_profile']=key;obj.location=location
    return obj

# Positive local Y runs uphill. The bevel remains inside each existing tread.
# Separate surfaces let callers retain contrast strips and their chosen finishes.
section=[(0,-.17),(0,-.009),(.009,0),(.029,0),(.30,0)]
verts=[(x,y,z) for y,z in section for x in [-.5,.5]]
faces=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(section)-1)]
step=shape('디딤판 · 챌판 · 모따기','step',verts,faces,[stone,edge],[0,1,1,0],(0,0,.17))
step['reference_run']=.30;step['reference_rise']=.17;step['edge_depth']=.029;step['edge_height']=.009

# Horizontal nominal metre of handrail; the game shears it along each incline.
profile=[(-.021,-.050),(.021,-.050),(.032,-.027),(.032,.025),(.020,.050),(-.020,.050),(-.032,.025),(-.032,-.027)]
verts=[(x,y,z) for y in [0,1] for x,z in profile];num=len(profile)
faces=[(i,i+num,(i+1)%num+num,(i+1)%num) for i in range(num)]
faces.extend([tuple(range(num)),tuple(reversed(range(num,2*num)))])
rail=shape('손스침 · 둥근 모서리와 양단 마개','rail',verts,faces,[metal],[0]*len(faces),(1,0,.95))
rail['reference_length']=1.0;rail['centre_height']=.95
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'staircase.blend'),compress=True)
runpy.run_path(str(here/'export.py'))
