from math import pi
from pathlib import Path
from mathutils import Matrix
import bpy
import blender_shop_mesh as m

def word(text,name,x,d,z,height,tone):
    curve=bpy.data.curves.new(name,'FONT');curve.body=text
    for path in [Path('/System/Library/Fonts/HelveticaNeue.ttc'),Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')]:
        if path.exists():curve.font=bpy.data.fonts.get(path.name) or bpy.data.fonts.load(str(path));break
    curve.align_x='CENTER';curve.align_y='CENTER';curve.size=height;curve.extrude=max(height*.017,.00015);curve.resolution_u=5
    ob=bpy.data.objects.new(name+' 원형',curve);m.group.objects.link(ob);bpy.context.view_layer.update()
    new=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    new.transform(Matrix.Translation((x,-d,z))@Matrix.Rotation(pi,4,'Z')@Matrix.Rotation(pi/2,4,'X'))
    obj=bpy.data.objects.new(name,new);m.group.objects.link(obj);new.materials.append(m.palette[tone])
    bpy.data.objects.remove(ob,do_unlink=True);bpy.data.curves.remove(curve)
    return obj
