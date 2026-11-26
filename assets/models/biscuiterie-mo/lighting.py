"""Retain the photographed fittings in Blender and bake their lighting onto large web surfaces."""
from math import ceil
import bpy
import numpy as np
from mathutils import Vector

def install(scene):
    rig=bpy.data.collections.new('Customer view and shop lights')
    scene.collection.children.link(rig)

    def position(name,data,at,towards):
        obj=bpy.data.objects.new(name,data)
        rig.objects.link(obj);obj.location=at
        obj.rotation_euler=(Vector(towards)-obj.location).to_track_quat('-Z','Y').to_euler()
        return obj

    def area(name,at,towards,size,depth,energy,colour):
        light=bpy.data.lights.new(name,'AREA')
        light.shape='RECTANGLE';light.size=size;light.size_y=depth
        light.energy=energy;light.color=colour
        position(name,light,at,towards)

    cam=bpy.data.cameras.new('Customer eye')
    cam.lens=24
    scene.camera=position('Biscuiterie M.O · 통로에서 본 매장',cam,(.28,-4.35,1.62),(0,2.3,1.59))
    scene.world=bpy.data.worlds.new('Sweet Park arcade fill')
    scene.world.color=(.15,.14,.12)
    area('Arcade daylight',(-.8,-2.1,2.5),(0,2.4,1),5.7,1.8,280,(1,.92,.80))
    for x,w in [(-2.30,2.36),(.22,2.29),(2.64,1.75)]:
        area('Suspended LED',(x,2.55,2.55),(x,2.19,.88),w,.06,43*w,(1,.94,.83))
    for z in (1.16,1.56,1.96):
        area('Shelf strip',(-3.48,3.83,z),(-3.56,3.83,z-.37),.06,2.63,17,(1,.94,.82))
    area('Rear service ceiling',(.7,4.66,3.07),(.7,4.45,.9),3.6,.13,125,(1,.96,.90))
    for key,metal,roughness in [('inox',.67,.29),('steel edge',.73,.22),('orange',.14,.32)]:
        bs=bpy.data.materials[key].node_tree.nodes['Principled BSDF']
        bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=roughness
    scene.render.engine='CYCLES';scene.cycles.samples=144;scene.cycles.max_bounces=4;scene.cycles.seed=17
    scene.cycles.use_denoising=True
    scene.render.resolution_x=1000;scene.render.resolution_y=680;scene.render.resolution_percentage=100

def bake(body,glass,scene):
    # Only subdivide the exposed planes, using the native fittings as occluders.
    # Product lettering and the flutes stay in the separate editable source objects.
    targets={'Orange shop floor':(0,0,1),'Pale shop ceiling':(0,0,-1),'Back plaster':(0,-1,0),
             'Side plaster':None,'Back kitchen stainless facing':(0,-1,0),
             'Steel display deck':(0,0,1),'Cream counter face':(0,-1,0),'Rear lower cabinetry':(0,-1,0),
             'Rear of sales cabinet':(0,-1,0),'Wall-facing bar top':(0,0,1)}
    pts=[];faces=[];materials=[];indices=[];grids=[]
    originals=[obj for obj in list(body.objects) if obj.name.split('.')[0] in targets]
    for obj in originals:
        name=obj.name.split('.')[0]
        normal=targets[name]
        if normal is None:
            normal=(1,0,0) if obj.data.vertices[0].co.x<0 else (-1,0,0)
        material=obj.data.materials[0]
        if material not in materials:materials.append(material)
        mat_index=materials.index(material)
        for poly in obj.data.polygons:
            a,b,c,d=[v.co.copy() for v in (obj.data.vertices[i] for i in poly.vertices)]
            u,v=b-a,d-a
            refine=poly.normal.dot(Vector(normal))>.9
            nx=max(1,ceil(u.length/.18)) if refine else 1
            ny=max(1,ceil(v.length/.18)) if refine else 1
            offset=len(pts)
            grids.append((offset,nx+1,ny+1,mat_index))
            for j in range(ny+1):
                for i in range(nx+1):
                    pts.append(a+u*(i/nx)+v*(j/ny))
            for j in range(ny):
                for i in range(nx):
                    o=offset+j*(nx+1)+i
                    faces.append((o,o+1,o+nx+2,o+nx+1))
                    indices.append(mat_index)
    mesh=bpy.data.meshes.new('Furnished wall, counter and floor samples')
    mesh.from_pydata(pts,[],faces)
    for mat in materials:mesh.materials.append(mat)
    mesh.polygons.foreach_set('material_index',indices);mesh.update()
    samples=mesh.color_attributes.new(name='Showroom radiance',type='FLOAT_COLOR',domain='POINT')
    mesh.color_attributes.active_color=samples
    lit=bpy.data.collections.new('Web surface samples')
    scene.collection.children.link(lit)
    item=bpy.data.objects.new('Baked shop surfaces',mesh);lit.objects.link(item)
    for old in originals:body.objects.unlink(old)
    glass.hide_render=True
    bpy.ops.object.select_all(action='DESELECT');item.select_set(True)
    bpy.context.view_layer.objects.active=item
    scene.render.bake.view_from='ACTIVE_CAMERA'
    scene.render.bake.target='VERTEX_COLORS'
    bpy.ops.object.bake(type='COMBINED',target='VERTEX_COLORS')
    glass.hide_render=False
    # Cycles vertex baking has no image denoiser. Filter each plane independently:
    # adjacent steel, plaster and hidden sides keep their own radiance.
    values=np.empty(len(samples.data)*4,dtype='float32')
    samples.data.foreach_get('color',values)
    values=values.reshape(-1,4)
    for offset,width,height,mi in grids:
        rgb=values[offset:offset+width*height,:3].reshape(height,width,3)
        if width>2 and height>2:
            padded=np.pad(rgb,((1,1),(1,1),(0,0)),mode='edge')
            rgb[:]=np.median(np.stack([padded[dy:dy+height,dx:dx+width] for dy in range(3) for dx in range(3)]),axis=0)
            for _ in range(2):
                padded=np.pad(rgb,((1,1),(1,1),(0,0)),mode='edge')
                rgb[:]=sum(padded[dy:dy+height,dx:dx+width]*w*v for dy,w in enumerate((.25,.5,.25))
                           for dx,v in enumerate((.25,.5,.25)))
        base=np.asarray(materials[mi].diffuse_color[:3]);rgb[:]=np.maximum(rgb,0)
        if materials[mi].name=='orange':
            # Indirect light changes the floor's warmth while retaining its orange finish.
            rgb[:]=base*(.78+.68*rgb/(.26+rgb))
        elif materials[mi].name=='inox':
            rgb[:]=.34*base+.95*rgb/(1+.98*rgb)
        else:
            rgb[:]=.58*base+.62*rgb/(.65+rgb)
    samples.data.foreach_set('color',np.clip(values,0,1).ravel())
    return lit
