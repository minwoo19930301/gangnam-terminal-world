"""Sample a small Blender-built booth and shelf-light reflection probe without a runtime capture."""
import bpy
import math
import numpy as np
from mathutils import Vector


def reflection(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    def panel(x,y,z,w,d,h,colour):
        bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z));obj=bpy.context.object
        obj.dimensions=(w,d,h);obj['probe_colour']=colour
    panel(0,0,-1.02,10,12,.1,[.12,.21,.15]);panel(0,0,2.2,10,12,.1,[.39,.41,.38])
    for sign in [-1,1]:
        panel(0,sign*5,0,10,.1,8,[.54,.51,.44]);panel(sign*4.3,0,0,.1,12,8,[.28,.30,.27])
    for y in [-3,2.1]:
        for x in [-1.2,1.7]:panel(x,y,2.12,2.9,.24,.04,[1.75,1.72,1.55])
    for y in [-2.9,3]:
        for level in [-.63,.11,.87,1.66]:
            panel(0,y,level,4.92,.49,.094,[.70,.67,.56]);panel(0,y+(1 if y<0 else -1)*.25,level-.011,4.87,.022,.047,[1.22,1.21,1.16]);
        for x in [-2.4,-.55,2.4]:panel(x,y,.5,.072,.46,2.65,[.50,.44,.34])
    bpy.context.view_layer.update()
    deps=bpy.context.evaluated_depsgraph_get();n=40
    output=np.ones((2*n,3*n,4),dtype=np.float32)
    for i in range(6):
        for row in range(n):
            for col in range(n):
                x=2*(col+.5)/n-1;y=2*(row+.5)/n-1
                direction=[(1,-y,-x),(-1,-y,x),(x,1,y),(x,-1,-y),(x,-y,1),(-x,-y,-1)][i]
                v=Vector((direction[0],-direction[2],direction[1])).normalized()
                hit,loc,norm,ident,obj,mat=scene.ray_cast(deps,Vector((0,0,0)),v)
                colour=list(obj['probe_colour']) if hit else [.59,.62,.59]
                bright=.79+.21*(-norm.dot(v)) if hit else 1
                output[2*n-1-(i//3*n+row),i%3*n+col,:3]=np.array(colour)*bright
    im=bpy.data.images.new('Florist shelf and ceiling reflection',width=3*n,height=2*n,alpha=False,float_buffer=False)
    im.pixels.foreach_set(output.ravel());im.filepath_raw=str(path);im.file_format='WEBP';im.save()
