"""Woven, knitted and napped surfaces for the Gangnam boutique, drawn in NumPy."""
from math import ceil, exp, sin
import bpy
import numpy as np

CELL_W, CELL_H = 160, 192
Y,X = np.mgrid[0:CELL_H,0:CELL_W]
x, y = X/CELL_W, Y/CELL_H


def pack_image(name, colors, data=False):
    height,width,_ = colors.shape
    img = bpy.data.images.new(name,width,height,alpha=False)
    if data: img.colorspace_settings.name='Non-Color'
    rgba = np.ones((height,width,4),np.float32)
    rgba[:,:,:3] = np.clip(colors,0,1)
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    return img


def swatches():
    gen=np.random.default_rng(655)
    silk=np.ones((CELL_H*2,CELL_W*3,3))
    normal=np.zeros_like(silk)+[.5,.5,1.]
    # Canvas-space samples cover one visible front, with finer repeats on a cuff.
    for index in [0,1,2,4,5]:
        row,col=divmod(index,3)
        dst=np.s_[row*CELL_H:(row+1)*CELL_H,col*CELL_W:(col+1)*CELL_W]
        fleck=gen.standard_normal(x.shape)
        if index==0:
            # Over-two, under-two basket weave with irregular linen slubs.
            warp=(.5+.5*np.cos(2*np.pi*(x*44+.08*np.sin(2*np.pi*y*5))))**.6
            weft=(.5+.5*np.cos(2*np.pi*(y*57+.04*np.cos(2*np.pi*x*4))))**.6
            over=((np.floor(x*44/2)+np.floor(y*57/2))%2).astype(bool)
            h=np.where(over,.65*warp+.12*weft,.64*weft+.15*warp)
            mottling=np.cos(2*np.pi*(x*3-y*1.25))*.012
            value=.92+.055*h+fleck*.008+mottling*.35
        elif index==1:
            # Staggered V-shaped stitches sit in pairs of English-rib wales.
            u=x*50
            phase=np.abs((u%1)-.5)*1.45
            ribs=(.5+.5*np.cos(2*np.pi*u))**.50
            loops=(.5+.5*np.cos(2*np.pi*(y*66-phase+(np.floor(u)%2)*.5)))**1.8
            h=.57*ribs+.36*loops*ribs
            value=.72+.25*h+fleck*.025
        elif index==2:
            # Nap changes direction over broad regions; fine speckle supplies the pile.
            h=np.clip(.48+.16*np.sin(8*x+3*np.sin(7*y))+.14*np.cos(7*y-2*x)+fleck*.095,0,1)
            value=.80+.19*h+fleck*.012
        elif index==4:
            # Linen upholstery: alternating groups of pale warp and weft yarn.
            warp=(.5+.5*np.cos(2*np.pi*(x*48+.13*np.sin(12*y))))**.6
            weft=(.5+.5*np.cos(2*np.pi*(y*58+.12*np.cos(14*x))))**.6
            above=((np.floor(x*48)+np.floor(y*58))%2).astype(bool)
            h=np.where(above,.70*warp+.18*weft,.66*weft+.19*warp)
            value=.75+.22*h+.018*fleck
        else:
            # Quarter-sawn timber grain and narrow pores follow each rail's length.
            phase=16*y+.30*np.sin(2*np.pi*x)+.19*np.sin(11*x+13*y)
            rings=(.5+.5*np.cos(2*np.pi*phase))**3
            h=.48+.27*rings+.08*np.sin(2*np.pi*y*54+3*x)
            value=.81+.15*rings+.022*fleck
        silk[dst]=np.repeat(value[:,:,None],3,axis=2)
        dy,dx=np.gradient(h)
        relief=.22 if index==0 else .43
        n=np.stack((-relief*dx,-relief*dy,np.ones_like(h)),axis=2)
        normal[dst]=.5+.5*n/np.linalg.norm(n,axis=2)[:,:,None]
    return pack_image('실과 가죽 · 원단',silk),pack_image('실과 가죽 · 요철',normal,True)


def response(name, images, roughness):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    tree=mat.node_tree
    shader=tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=roughness
    base,normal=[tree.nodes.new('ShaderNodeTexImage') for _ in images]
    base.image,normal.image=images
    color=tree.nodes.new('ShaderNodeVertexColor')
    color.layer_name='Finish'
    mix=tree.nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1
    tree.links.new(base.outputs[0],mix.inputs[1])
    tree.links.new(color.outputs[0],mix.inputs[2])
    tree.links.new(mix.outputs[0],shader.inputs['Base Color'])
    bump=tree.nodes.new('ShaderNodeNormalMap')
    tree.links.new(normal.outputs[0],bump.inputs['Color'])
    tree.links.new(bump.outputs[0],shader.inputs['Normal'])
    return mat


def map_piece(ob, original, mat):
    mesh=ob.data
    name=original.name.split(' ')[0]
    tile={'sand':0,'lapel':0,'navy':1,'rib':1,'hood':1,'suede':2,'linen':4,'upholstery':4,'piping':4,'oak':5,'walnut':5}.get(name,3)
    for cached in list(mesh.uv_layers):mesh.uv_layers.remove(cached)
    uv=mesh.uv_layers.new(name='원단 결')
    uv.active_render=True
    row,col=divmod(tile,3)
    coords=[v.co for v in mesh.vertices]
    lo=[min(p[k] for p in coords) for k in range(3)] if coords else [0]*3
    span=[max(max(p[k] for p in coords)-lo[k],.0001) for k in range(3)] if coords else [1]*3
    for f in mesh.polygons:
        use_xz=abs(f.normal.y)>=abs(f.normal.x)
        for index in f.loop_indices:
            p=mesh.vertices[mesh.loops[index].vertex_index].co
            # Separate vertical projections on sling/sleeve sides keep the grain upright.
            u=(p.x+.40)/.8 if use_xz else (p.y+.15)/.30
            v=(p.z-1.04)/.94
            if tile in (4,5):
                # The top, front and side panels each have a conventional cut of cloth.
                face_axis=max(range(3),key=lambda k:abs(f.normal[k]))
                u_axis,v_axis=[k for k in range(3) if k!=face_axis]
                if tile==5 and span[v_axis]>span[u_axis]:u_axis,v_axis=v_axis,u_axis
                u=(p[u_axis]-lo[u_axis])/span[u_axis]
                v=(p[v_axis]-lo[v_axis])/span[v_axis]
            u=.5 if tile==3 else min(1,max(0,u))
            v=.5 if tile==3 else min(1,max(0,v))
            uv.data[index].uv=((col*CELL_W+2+u*(CELL_W-4))/(3*CELL_W),
                               (row*CELL_H+2+v*(CELL_H-4))/(2*CELL_H))
    attr=mesh.color_attributes.get('Finish')
    if attr is None:
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for v in attr.data:v.color=original.diffuse_color
    ob['원래 마감']=original.name
    mesh.materials.clear()
    mesh.materials.append(mat)


def densify(levels, max_step):
    dense=[levels[0]]
    for a,b in zip(levels,levels[1:]):
        count=max(1,ceil(abs(b[2]-a[2])/max_step))
        for j in range(1,count+1):
            dense.append(tuple(v+(w-v)*j/count for v,w in zip(a,b)))
    return dense


def drape(ob, kind, floor):
    # Broad folds hang from the hanger; narrower paired creases gather at
    # a relaxed elbow. Trimmings use the same field as their surrounding cloth.
    if '옷걸이' in ob.name:return
    strength=(.72,1.0,.89)[kind]
    for vert in ob.data.vertices:
        p=vert.co
        x,y,z=p
        side=abs(x)
        front=-1 if y<0 else 1
        if side<.237:
            hem=max(0,1-(z-floor)/.41)
            low=(.009*sin(38*x+.6)+.004*sin(71*x-1))*hem
            tension=.0045*sin(57*(z-1.57)-14*side)*exp(-((z-(1.62+.48*side))/.105)**2)
            p.y+=front*(low+tension)*strength
            p.z+=hem*.008*sin(22*x+1.1)*strength
        else:
            crease=z-1.50-(side-.285)*.62-y*.42
            bend=.013*sin(64*crease)*exp(-(crease/.103)**2)
            p.y+=front*bend*strength
            p.x+=(1 if x>0 else -1)*.34*bend*strength
            drop=max(0.,min(1.,(1.70-z)/.45))
            p.z-=drop*(.013 if x>0 else .004)
            p.y+=drop*(.013 if x>0 else -.003)
