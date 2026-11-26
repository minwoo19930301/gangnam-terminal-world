"""Native soft sources and an export-only, three-bounce Cycles colour bake."""
from math import ceil
import bpy
from mathutils import Vector

def install(scene):
    rig=bpy.data.collections.new('Copper lighting study')
    scene.collection.children.link(rig)
    def place(name,data,location,look):
        obj=bpy.data.objects.new(name,data);rig.objects.link(obj)
        obj.location=location
        obj.rotation_euler=(Vector(look)-obj.location).to_track_quat('-Z','Y').to_euler()
        return obj
    def panel(name,location,look,width,height,energy,color):
        light=bpy.data.lights.new(name,'AREA')
        light.shape='RECTANGLE';light.size=width;light.size_y=height
        light.energy=energy;light.color=color
        place(name,light,location,look)
    scene.camera=place('Customer-side reflection camera',bpy.data.cameras.new('Reflection camera'),
                       (1,-4,1.63),(0,3,1.62))
    scene.world=bpy.data.worlds.new('Soft arcade fill')
    scene.world.color=(.26,.25,.24)
    panel('Diffuse arcade opening',(-2.3,-2.4,2.5),(0,2,.9),3.4,2.4,175,(1,.87,.75))
    panel('Right arcade opening',(3.2,-.8,2.45),(.35,3,.90),1.3,2.4,130,(1,.92,.82))
    panel('Suspended front opal',(.05,1.42,2.82),(0,1.67,.35),5.1,.13,115,(1,.82,.64))
    panel('Suspended side opal',(-2.50,2.8,2.82),(-2.1,2.80,.45),.13,2.8,76,(1,.84,.70))
    panel('Case rail reflection',(0,.90,1.44),(0,4.3,1.70),4.65,.065,19,(1,.85,.75))
    panel('Cabinet soft edge',(-2.65,1.9,2.02),(0,4.1,2.0),.21,2.65,28,(1,.81,.69))
    panel('Reflected left arcade bay',(-2.45,-1.55,1.0),(-1.80,1.1,.58),.32,1.85,47,(1,.79,.63))
    panel('Reflected right arcade bay',(2.1,-2.20,1.32),(1.2,.7,.58),.63,2.05,61,(1,.90,.75))
    # Emissive geometry reflects as a line even when a surface does not face
    # the down-facing area lamp. Keep the wordmark on its existing game layer.
    mat=bpy.data.materials.get('white')
    if mat:
        bs=mat.node_tree.nodes.get('Principled BSDF')
        bs.inputs['Emission Color'].default_value=(1,.86,.68,1)
        bs.inputs['Emission Strength'].default_value=2.2
    targets=[('Continuous curved copper counter',.76,.35),('Rounded copper cabinet',.96,.16),
             ('Blush rear wall',.11,.59),('North wall in copper-coloured plaster',.18,.52),
             ('Warm lining above the glass cases',.30,.44)]
    for name,metal,roughness in targets:
        obj=bpy.data.objects[name]
        m=obj.data.materials[0].copy();m.name=name+' finish'
        obj.data.materials[0]=m
        bs=m.node_tree.nodes.get('Principled BSDF')
        if name=='Rounded copper cabinet':
            m.diffuse_color=(.175,.055,.031,1)
            bs.inputs['Base Color'].default_value=m.diffuse_color
        bs.inputs['Metallic'].default_value=metal
        bs.inputs['Roughness'].default_value=roughness
        if name=='Continuous curved copper counter':
            nodes=m.node_tree.nodes;links=m.node_tree.links
            coord=nodes.new('ShaderNodeTexCoord')
            stretch=nodes.new('ShaderNodeVectorMath');stretch.operation='MULTIPLY'
            stretch.inputs[1].default_value=(11,11,.66)
            links.new(coord.outputs['Object'],stretch.inputs[0])
            grain=nodes.new('ShaderNodeTexNoise');grain.inputs['Scale'].default_value=1
            grain.inputs['Detail'].default_value=1
            links.new(stretch.outputs[0],grain.inputs['Vector'])
            coating=nodes.new('ShaderNodeValToRGB')
            coating.color_ramp.elements[0].color=(.20,.20,.20,1)
            coating.color_ramp.elements[1].color=(.50,.50,.50,1)
            links.new(grain.outputs['Fac'],coating.inputs[0])
            links.new(coating.outputs[0],bs.inputs['Roughness'])
        obj['bake_copper']=True
    scene.render.engine='CYCLES'
    scene.cycles.samples=384
    scene.cycles.max_bounces=3
    scene.cycles.seed=47
    scene.render.bake.view_from='ACTIVE_CAMERA'

def bake_panels(scene):
    # Bake into lightweight quad grids on temporary export copies. Keep the
    # original simple contours and the editable light rig in the saved library.
    objects=[o for o in scene.objects if o.get('bake_copper')]
    baking=[]
    for original in objects:
        mesh=original.data
        vertices=[];faces=[]
        def append(verts):
            base=len(vertices);vertices.extend(verts);faces.append(tuple(range(base,len(vertices))))
        for poly in mesh.polygons:
            corners=[mesh.vertices[i].co.copy() for i in poly.vertices]
            if len(corners)!=4:
                append(corners);continue
            a,b,c,d=corners
            # Subdivide the inward face of each lining; hidden faces keep four corners.
            ignore=(original.name.startswith('Warm lining') and poly.normal.z>-.9 or
                    original.name.startswith('North wall') and poly.normal.x>-.9 or
                    original.name.startswith('Blush rear') and poly.normal.y>-.9)
            if ignore: append(corners);continue
            spacing=.085 if original.name=='Continuous curved copper counter' else .20
            nu=max(1,ceil((a-b).length/spacing));nv=max(1,ceil((a-d).length/spacing))
            off=len(vertices)
            for j in range(nv+1):
                for i in range(nu+1):
                    vertices.append(a.lerp(b,i/nu).lerp(d.lerp(c,i/nu),j/nv))
            for j in range(nv):
                for i in range(nu):
                    k=off+j*(nu+1)+i;faces.append((k,k+1,k+nu+2,k+nu+1))
        dense=bpy.data.meshes.new(original.name+' lighting samples')
        dense.from_pydata(vertices,[],faces);dense.update()
        dense.materials.append(mesh.materials[0])
        original.data=dense
        attr=dense.color_attributes.new(name='Copper radiance',type='FLOAT_COLOR',domain='POINT')
        dense.color_attributes.active_color=attr
        baking.append(original)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in baking:obj.select_set(True)
    bpy.context.view_layer.objects.active=baking[0]
    scene.render.bake.target='VERTEX_COLORS'
    # The clear retail case has separate runtime transparency; it must not
    # cast an opaque silhouette through the baked display.
    glazing=bpy.data.collections['Glass']
    glazing.hide_render=True
    bpy.ops.object.bake(type='COMBINED',target='VERTEX_COLORS')
    glazing.hide_render=False
