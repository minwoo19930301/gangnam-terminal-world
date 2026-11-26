"""Build the editable plaque and pack its print. Pass the PNG path after --."""
import math
from pathlib import Path
import sys
import bpy

here = Path(__file__).resolve().parent
image_path = Path(sys.argv[sys.argv.index('--')+1])
bpy.ops.wm.read_factory_settings(use_empty=True)
collection = bpy.data.collections.new('GangnamMainLiftDirectory')
bpy.context.scene.collection.children.link(collection)
image = bpy.data.images.load(str(image_path))
image.name = '강남점 · 8F 층별 안내 인쇄'
image.pack()
mat = bpy.data.materials.new('무광 인쇄판 · 테두리와 고정대')
mat.use_nodes = True
shader = mat.node_tree.nodes.get('Principled BSDF')
tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = image
mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
shader.inputs['Roughness'].default_value = .68

def plate(name, width, height, radius, back, front, uv, x=0, z=0):
    outline = []
    for cx,cz,angle in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(5):
            a=math.radians(angle+22.5*i)
            outline.append((x+cx*(width/2-radius)+radius*math.cos(a),z+cz*(height/2-radius)+radius*math.sin(a)))
    n=len(outline)
    verts=[(vx,-depth,vz) for depth in (back,front) for vx,vz in outline]
    faces=[list(reversed(range(n))),list(range(n,n*2))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);collection.objects.link(obj);mesh.materials.append(mat)
    layer=mesh.uv_layers.new(name='Directory print')
    for poly in mesh.polygons:
        for idx in poly.loop_indices:
            v=mesh.vertices[mesh.loops[idx].vertex_index].co
            value=((v.x/width+.5)*.953,1-(.5-v.z/height)*.944) if uv is None and poly.index==1 else (uv or .995,.5)
            layer.data[idx].uv=value

# The clear seam between the two game shafts is bridged by two hidden backing straps.
for h in [-.29,.29]:
    plate('벽 고정대',.76,.06,.012,-.065,-.012,.985,z=h)
plate('짙은 뒤판',.910,1.012,.053,-.015,.013,.985)
plate('새틴 테두리',.898,1.000,.048,.013,.022,.995)
plate('아이보리 층별 인쇄판',.884,.986,.044,.021,.026,None)
# The photographed bank has two folded reveals on every public storey.
# Preserve the original inner jamb, sill and raised call plates in the game.
def frame(cx):
    sections=[(.716,2.503,-.118),(.716,2.503,-.040),(.705,2.492,-.027),
              (.694,2.481,-.027),(.694,2.481,-.008),(.678,2.465,.002),
              (.671,2.458,-.007),(.671,2.458,-.078)]
    verts=[];faces=[]
    for radius,top,depth in sections:
        verts.extend((cx+dx,-depth,height-1.69) for dx,height in
                     [(-radius,.014),(-radius,top),(radius,top),(radius,.014)])
    for k in range(len(sections)-1):
        for i in range(3):
            start=k*4+i
            faces.append((start,start+4,start+5,start+1))
    mesh=bpy.data.meshes.new('ㄱ자 단면 머리틀과 선틀')
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new('두 단으로 접은 외부 문틀',mesh);collection.objects.link(obj)
    mesh.materials.append(mat);layer=mesh.uv_layers.new(name='Fold finish')
    shades=[0,1,4,2,3,4,0]
    for poly in mesh.polygons:
        for idx in poly.loop_indices:layer.data[idx].uv=((984+7*shades[poly.index//3])/1024,.5)
    # The generic floor label sat partly behind its lintel. This flush fascia
    # sits just above that head and shows the current public level at eye distance.
    plate('층 표시기 케이스',.55,.29,.014,-.030,.040,.985,x=cx,z=2.46-1.69)
    coords=[(cx+dx,-.041,2.46-1.69+dz) for dx,dz in [(-.259,-.128),(.259,-.128),(.259,.128),(-.259,.128)]]
    face=bpy.data.meshes.new('층 표시창');face.from_pydata(coords,[],[(0,1,2,3)]);face.update()
    obj=bpy.data.objects.new('8층 위치 표시',face);collection.objects.link(obj);face.materials.append(mat)
    layer=face.uv_layers.new(name='Floor figure')
    for i,(u,v) in enumerate([(776,1020),(890,1020),(890,972),(776,972)]):layer.data[i].uv=(u/1024,1-v/1024)

for centre in [-1.35,1.35]:
    frame(centre)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'directory.blend'),compress=True)
