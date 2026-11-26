"""Original texture atlas for the three demonstration cameras. One material at runtime."""
from math import pi
import bpy
import numpy as np

SIZE = 96
COLUMNS = 4
TILES = ('matte', 'satin', 'pebble', 'diamond', 'M', 'Q', 'SL', 'glass')
Y, X = np.mgrid[0:SIZE, 0:SIZE] / (SIZE - 1)
rng = np.random.default_rng(1103)


def leather_height():
    # Nearest/second-nearest distances form the shallow channels between grains.
    close = np.full_like(X, 10.0)
    second = close.copy()
    n = 34
    for row in range(n):
        for col in range(n):
            x, y = (col + rng.uniform(.12, .88)) / n, (row + rng.uniform(.12, .88)) / n
            dx, dy = abs(X - x), abs(Y - y)
            distance = np.hypot(np.minimum(dx, 1-dx), np.minimum(dy, 1-dy))
            second = np.minimum(second, np.maximum(close, distance))
            close = np.minimum(close, distance)
    return np.tanh((second-close)*n*4)


def make_image(name, rgb, data=False):
    rgba = np.ones((2*SIZE, COLUMNS*SIZE, 4), dtype=np.float32)
    rgba[:,:,:3] = np.clip(rgb, 0, 1)
    image = bpy.data.images.new(name, COLUMNS*SIZE, 2*SIZE, alpha=False)
    if data:
        image.colorspace_settings.name = 'Non-Color'
    image.pixels.foreach_set(rgba.ravel())
    image.pack()
    return image


def atlas():
    shape = (2*SIZE, COLUMNS*SIZE, 3)
    color = np.ones(shape)
    surface = np.ones(shape)
    normals = np.zeros(shape) + [.5,.5,1.]
    for index, name in enumerate(TILES):
        row, col = divmod(index, COLUMNS)
        area = np.s_[row*SIZE:(row+1)*SIZE, col*SIZE:(col+1)*SIZE]
        base, orm, normal = color[area], surface[area], normals[area]
        rough, metal = .57, .02
        if name == 'satin':
            rough, metal = .34, .20
            brush = rng.uniform(.91, 1., (SIZE,1,1))
            base[:] = brush
        elif name in ('pebble','diamond'):
            rough = .72
            if name == 'pebble':
                height = leather_height()
            else:
                pitch = 31
                a = (np.cos(2*pi*pitch*(X+Y*.78))+1)*.5
                b = (np.cos(2*pi*pitch*(X-Y*.78))+1)*.5
                height = np.minimum(a,b)**.55
            base[:] = (.72 + .26*height + rng.uniform(0,.02,X.shape))[:,:,None]
            dy, dx = np.gradient(height)
            v = np.stack((-dx*.42,-dy*.42,np.ones_like(X)),axis=2)
            normal[:] = v/np.linalg.norm(v,axis=2)[:,:,None]*.5 + .5
        elif name in ('M','Q','SL','glass'):
            # Curved, off-axis reflections and overlapping optical elements,
            # painted directly in the model's own UVs. No product photo is used.
            u, v = 2*X-1, 2*Y-1
            r, angle = np.hypot(u,v), np.arctan2(v,u)
            rr = np.hypot(u+.12,v-.16)
            ring = np.exp(-((rr-.67)/.065)**2)
            crescent = ring*np.clip(.56+.48*np.cos(angle-2.25),0,1)
            core = np.exp(-((u+.10)**2/.29+(v-.44)**2/.035))
            aperture = .30*np.cos(pi/9)/np.cos((angle+pi/9)%(2*pi/9)-pi/9)
            blade = (r>aperture)*(r<.50)*(.016+.013*np.cos(9*(angle+1.3*r)))
            fine = np.exp(-((r-.82)/.018)**2) + .65*np.exp(-((r-.88)/.012)**2)
            tint = {'M':[.54,.62,.36],'Q':[.42,.43,.62],'SL':[.38,.62,.47],'glass':[.35,.46,.55]}[name]
            for k in range(3):
                base[:,:,k] = (.034 + .075*(1-r).clip(0) + blade + .105*fine
                    + tint[k]*(.60*crescent + .55*core) + .37*np.exp(-((rr-.54)/.019)**2)*np.clip(np.sin(angle+.6),0,1))
            rough, metal = .19, .12
        orm[:,:,1] = rough
        orm[:,:,2] = metal
    return (make_image('라이카 · 가죽과 곡면 코팅',color),
            make_image('라이카 · 표면 거칠기와 금속',surface,True),
            make_image('라이카 · 압인 무늬',normals,True))


def assign_uv(obj, tile, optic=None):
    me = obj.data
    for existing in list(me.uv_layers):me.uv_layers.remove(existing)
    uv = me.uv_layers.new(name='제품 표면')
    uv.active_render = True
    row, col = divmod(TILES.index(tile), COLUMNS)
    for face in me.polygons:
        nx, ny, nz = map(abs,face.normal)
        for i in face.loop_indices:
            p = me.vertices[me.loops[i].vertex_index].co
            if optic:
                x,z,r = optic
                a,b = .5 + (p.x-x)/(2*r), .5 + (p.z-z)/(2*r)
            elif tile in ('pebble','diamond'):
                # Unwrap the front and sides separately so the grain stays
                # upright on the shoulders and thumb grip of a camera body.
                a = (p.x+.08)/.16 if ny>=nx else (p.y+.05)/.10
                b = p.z/.09 if nz<.8 else (p.y+.05)/.10
            else:
                a,b = .5, .5
            # Leave a texel margin around every atlas patch for linear filtering.
            uv.data[i].uv = ((col*SIZE+2+max(0,min(1,a))*(SIZE-4))/(COLUMNS*SIZE),
                             (row*SIZE+2+max(0,min(1,b))*(SIZE-4))/(2*SIZE))


def material(name, images):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    tree=m.node_tree
    bsdf=tree.nodes.get('Principled BSDF')
    color, orm, normal = [tree.nodes.new('ShaderNodeTexImage') for _ in images]
    for node, image in zip((color,orm,normal),images): node.image=image
    mix=tree.nodes.new('ShaderNodeMixRGB')
    mix.blend_type='MULTIPLY'
    mix.inputs[0].default_value=1
    tint=tree.nodes.new('ShaderNodeVertexColor')
    tint.layer_name='Finish'
    tree.links.new(color.outputs['Color'],mix.inputs[1])
    tree.links.new(tint.outputs['Color'],mix.inputs[2])
    tree.links.new(mix.outputs[0],bsdf.inputs['Base Color'])
    split=tree.nodes.new('ShaderNodeSeparateRGB')
    tree.links.new(orm.outputs['Color'],split.inputs[0])
    tree.links.new(split.outputs['G'],bsdf.inputs['Roughness'])
    tree.links.new(split.outputs['B'],bsdf.inputs['Metallic'])
    bump=tree.nodes.new('ShaderNodeNormalMap')
    tree.links.new(normal.outputs['Color'],bump.inputs['Color'])
    tree.links.new(bump.outputs['Normal'],bsdf.inputs['Normal'])
    return m
