"""Build a reusable painted bridge railing bay. Reopen rail.blend and pass -- --export-current to bake edits."""
import bpy
import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bay=bpy.data.collections.new('BanpoStreamRail')
    bpy.context.scene.collection.children.link(bay)
    def finish(name, color):
        mat=bpy.data.materials.new(name)
        rgba=tuple(((int(color[i:i+2],16)/255+.055)/1.055)**2.4 for i in (0,2,4))+(1,)
        mat.diffuse_color=rgba
        mat.use_nodes=True
        mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=rgba
        return mat
    metal=finish('은회색 도장', 'c2c4be')
    shoe=finish('앵커와 모서리', '858e8b')
    def box(name, position, size, mat, tilt=0):
        bpy.ops.mesh.primitive_cube_add(size=1, location=position)
        o=bpy.context.object
        o.name=name; o.scale=size; o.rotation_euler.y=tilt
        for c in list(o.users_collection): c.objects.unlink(o)
        bay.objects.link(o);o.data.materials.append(mat)
    box('상부 손스침',(1,0,.95),(2,.085,.065),metal)
    box('아래 가로대',(1,0,.27),(2,.055,.045),metal)
    box('기둥',(.055,0,.48),(.075,.085,.96),metal)
    box('기둥 받침',(.055,0,.025),(.13,.135,.05),shoe)
    for i in range(1,7):
        box('도장 세로살',(.13+i*.26,0,.60),(.036,.039,.66),metal)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(here/'rail.blend'),compress=True)

bay=bpy.data.collections['BanpoStreamRail']
parts=[]
for obj in sorted(bay.all_objects,key=lambda o:o.name):
    if obj.type!='MESH':continue
    evaluated=obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=evaluated.to_mesh()
    try:
        pts=[]
        for v in mesh.vertices:
            x,y,z=evaluated.matrix_world@v.co
            pts.append([round(k*1000) for k in (x,z,-y)])
        per_color={}
        for poly in mesh.polygons:
            mat=mesh.materials[poly.material_index]
            rgb=[max(0,min(255,round(255*(1.055*v**(1/2.4)-.055)))) for v in mat.diffuse_color[:3]]
            matid=(rgb[0]<<16)+(rgb[1]<<8)+rgb[2]
            for i in range(1,len(poly.vertices)-1):
                per_color.setdefault(matid,[]).append([poly.vertices[0],poly.vertices[i],poly.vertices[i+1]])
        for color,faces in per_color.items(): parts.append([color,pts,faces])
    finally: evaluated.to_mesh_clear()
(here/'rail.js').write_text('// Blender export in millimetres. The source bay is two metres long.\nexport const bay='+json.dumps(parts,separators=(',',':'))+';\n')
