"""Rebuild the editable plaza lantern, or export the saved source with --export-current."""
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
COLLECTION = "CentralCityTwinLantern"
TAU = math.tau


def new_material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*[int(color[i:i+2], 16)/255 for i in (0, 2, 4)], 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    for channel, value in enumerate(mat.diffuse_color[:3]):
        mat.diffuse_color[channel] = value/12.92 if value<.04045 else ((value+.055)/1.055)**2.4
    shader.inputs['Base Color'].default_value=mat.diffuse_color
    shader.inputs['Metallic'].default_value=.5
    shader.inputs['Roughness'].default_value=.52
    return mat


def mesh(name, vertices, faces, mat):
    data=bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.update()
    data.materials.append(mat)
    obj=bpy.data.objects.new(name,data)
    group.objects.link(obj)
    return obj


def shaft(name, cx, profile, segments, mat, smooth=True):
    # Source rings start on the native Y axis, as on the game glass cylinder.
    vertices=[(cx+r*math.sin(i*TAU/segments), -r*math.cos(i*TAU/segments), z)
              for z,r in profile for i in range(segments)]
    faces=[]
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            faces.append((a,b,b+segments,a+segments))
    faces.append(tuple(reversed(range(segments))))
    faces.append(tuple(range(len(vertices)-segments,len(vertices))))
    obj=mesh(name,vertices,faces,mat)
    for poly in obj.data.polygons[:-2]:
        poly.use_smooth=smooth
    return obj


def rod(name, a, b, r, mat):
    a,b=Vector(a),Vector(b)
    axis=(b-a).normalized()
    u=axis.cross(Vector((1,0,0))).normalized()
    v=axis.cross(u)
    verts=[c+r*(math.cos(i*TAU/5)*u+math.sin(i*TAU/5)*v) for c in (a,b) for i in range(5)]
    return mesh(name,verts,[(i,(i+1)%5,5+(i+1)%5,5+i) for i in range(5)],mat)


def build():
    metal=new_material('어두운 주물', '303638')
    rim=new_material('처마와 주철 테두리', '363e40')
    glazing=new_material('처마 밑 확산판', 'a5aca6')
    # The city keys this view-layer attribute from Seoul's solar altitude.
    # Linked lenses follow its timeline without adding a third lamp or a local sunset clock.
    nodes=glazing.node_tree.nodes
    shade=nodes.get('Principled BSDF')
    shade.inputs['Metallic'].default_value=.10
    shade.inputs['Emission Color'].default_value=(1,.81,.60,1)
    night=nodes.new('ShaderNodeAttribute')
    night.attribute_type='VIEW_LAYER';night.attribute_name='Seoul apartment night'
    level=nodes.new('ShaderNodeMath')
    level.operation='MULTIPLY';level.inputs[1].default_value=2.8
    glazing.node_tree.links.new(night.outputs['Fac'],level.inputs[0])
    glazing.node_tree.links.new(level.outputs[0],shade.inputs['Emission Strength'])
    # Base ring, tapered mast, then two shallow wing-shaped cantilevers.
    shaft('원형 단턱과 기둥',0,[(0,.235),(.032,.235),(.054,.202),(.081,.194),(.11,.13),
         (.18,.103),(.26,.090),(.29,.084),(3.59,.057),(3.72,.071),(3.78,.056)],12,metal)
    for side,code in [(-1,'왼쪽'),(1,'오른쪽')]:
        x=.67*side
        shape=[(.015,3.77),(.22,3.762),(.42,3.735),(.58,3.69),(.67,3.672),
               (.67,3.62),(.51,3.643),(.31,3.655),(.015,3.64)]
        verts=[(u*side,v,z) for v in (-.038,.038) for u,z in shape]
        n=len(shape)
        faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
        faces += [(i,n+i,n+(i+1)%n,(i+1)%n) for i in range(n)]
        if side>0:faces=[tuple(reversed(f)) for f in faces]
        mesh(code+' · 완만한 주물 팔',verts,faces,metal)
        shaft(code+' · 등받침과 소켓',x,[(3.60,.041),(3.67,.051),(3.71,.042),(3.78,.061),
              (3.82,.052),(3.855,.10),(3.90,.132),(3.925,.136)],12,metal)
        shaft(code+' · 처마 밑 확산판',x,[(4.225,.145),(4.265,.166)],8,glazing,False)
        for k in range(6):
            a=k*TAU/6
            bottom=(x+.109*math.sin(a),-.109*math.cos(a),3.902)
            top=(x+.218*math.sin(a),-.218*math.cos(a),4.275)
            rod(code+f' · 유리 세로살 {k+1}',bottom,top,.014,metal)
        shaft(code+' · 가로살',x,[(4.029,.151),(4.043,.154)],6,metal,False)
        shaft(code+' · 겹처마 지붕',x,[(4.252,.216),(4.265,.246),(4.287,.264),(4.309,.259),
              (4.32,.235),(4.348,.223),(4.383,.184),(4.407,.13),(4.427,.065)],12,rim)
        shaft(code+' · 꼭지',x,[(4.421,.05),(4.443,.035),(4.465,.019),(4.472,.008)],8,metal)
    bpy.context.view_layer.update()


def export():
    # The opaque frame streams separately; the same two game lenses remain at every LOD.
    group=bpy.data.collections[COLLECTION]
    metal=[]
    glass=[]
    for obj in group.objects:
        if '처마 밑 확산판' in obj.data.materials[0].name:
            glass.append(obj)
        else:metal.append(obj)
    if len(glass)!=2:raise ValueError("Expected two separately editable lenses")
    lenses=[]
    for obj in sorted(glass,key=lambda obj:obj.name):
        pts=[obj.matrix_world@v.co for v in obj.data.vertices]
        cx=sum(p.x for p in pts)/len(pts);cy=sum(p.y for p in pts)/len(pts)
        heights=sorted(set(round(p.z,4) for p in pts))
        radii=[sum(math.hypot(p.x-cx,p.y-cy) for p in pts if abs(p.z-h)<.0001)/8 for h in heights]
        if len(heights)!=2 or len(pts)!=16:raise ValueError('The diffuser needs two eight-sided rings')
        lenses.append([round(cx,4),round(-cy,4),*heights,*[round(r,4) for r in radii]])
    path=HERE.parents[2]/'js/places/centralcity.js'
    start='    // BEGIN CENTRAL LANTERN GLASS\n';end='    // END CENTRAL LANTERN GLASS'
    source=path.read_text()
    if source.count(start)!=1 or source.count(end)!=1:raise ValueError('Missing lens layout markers')
    import json
    replacement=source[:source.index(start)+len(start)]+'    const plazaLenses='+json.dumps(lenses,separators=(',',':'))+';\n'+source[source.index(end):]
    if replacement!=source:path.write_text(replacement)
    # Collapse the independently editable castings into one vertex-painted Web draw.
    bpy.ops.object.select_all(action='DESELECT')
    for o in metal:
        c=o.data.materials[0].diffuse_color
        attr=o.data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
        for corner in attr.data:corner.color=(*c[:3],1)
        o.data.materials.clear();o.select_set(True)
    bpy.context.view_layer.objects.active=metal[0]
    bpy.ops.object.join()
    bpy.context.object.name='Surface'
    with tempfile.TemporaryDirectory() as tmp:
        raw=Path(tmp)/'lantern.glb'
        bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE')
        subprocess.run(['node',str(HERE.parent/'sinbanpo-plaza-planters/pack.mjs'),str(raw),str(HERE/'lantern.glb')],check=True)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    group=bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(group)
    build()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'lantern.blend'),compress=True)
export()
