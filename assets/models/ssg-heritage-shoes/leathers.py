"""Deterministic macro material samples for the ankle boots and folded belt case."""

from math import pi
import bpy
import numpy as np

SIZE=192
W,H=768,576
SWATCHES={
    "plain":(0,0,.22,0), "suede":(1,0,.89,.0),"elastic":(2,0,.79,0),"leather":(3,0,.30,0),
    "lining":(0,1,.62,0),"edge":(1,1,.43,0),"rubber":(2,1,.66,0),"thread":(3,1,.73,0),
    "box":(0,2,.76,0),"metal":(1,2,.23,.73),"lacquer":(2,2,.20,.05),"foil":(3,2,.36,.23),
}
NAMES=("Berwick · brushed suede and dress leather","Berwick · nap and woven elastic","Berwick · product surface response")


def image(name,pixels,data):
    img=bpy.data.images.new(name,width=W,height=H,alpha=False)
    if data:img.colorspace_settings.name="Non-Color"
    rgba=np.ones((H,W,4),np.float32);rgba[:,:,:3]=pixels
    img.pixels.foreach_set(rgba.ravel());img.pack()
    return img


def generate():
    yy,xx=np.mgrid[:SIZE,:SIZE];x=xx/SIZE;y=yy/SIZE
    rng=np.random.default_rng(81556)
    c=np.ones((H,W,3));normal=np.empty_like(c);normal[:]=(.5,.5,1)
    orm=np.empty_like(c)
    for name,(col,row,r,m) in SWATCHES.items():
        grain=rng.normal(0,1,x.shape)
        h=np.zeros_like(x);v=np.ones_like(x)
        if name=="suede":
            # Short irregular fibres share a local sweep direction. The
            # underlying nap has broad brushed patches instead of shoe polish.
            for i in range(5200):
                px,py=rng.uniform(0,SIZE,2);a=-.65+.39*sinfield(px,py)+rng.normal(0,.45)
                dx,dy=np.cos(a)*rng.uniform(1.0,3.1),np.sin(a)*rng.uniform(1.1,3)
                left,right=max(0,int(min(px,px+dx)-2)),min(SIZE,int(max(px,px+dx)+3))
                bot,top=max(0,int(min(py,py+dy)-2)),min(SIZE,int(max(py,py+dy)+3))
                gx=xx[bot:top,left:right]-px;gy=yy[bot:top,left:right]-py
                u=np.clip((gx*dx+gy*dy)/(dx*dx+dy*dy),0,1)
                h[bot:top,left:right]+=rng.uniform(.12,.65)*np.exp(-((gx-u*dx)**2+(gy-u*dy)**2)/.43)
            broad=np.sin(2*pi*(2*x+y+.20*np.sin(8*y)))+.58*np.cos(2*pi*(x-2*y))
            v=.91+.064*broad+.085*h+.016*grain
            h+=grain*.055
        elif name=="elastic":
            # Alternating diagonals connect the vertical ribs into a knitted
            # web, especially visible between the Chelsea's two suede quarters.
            rib=(.5+.5*np.cos(2*pi*(x*27+.095*np.sin(y*2*pi*24))))
            stitch=(.5+.5*np.cos(2*pi*(y*24+.35*np.sin(2*pi*x*27))))
            v=.69+.19*rib+.10*stitch+.013*grain;h=.50*rib+.26*stitch+.045*grain
        elif name=="leather":
            furrows=np.minimum(abs(np.sin(2*pi*(x*9+.16*np.sin(13*y)))),
                               abs(np.sin(2*pi*(y*13+.23*np.sin(17*x)))))
            h=.16*np.clip(furrows*3,0,1)+.075*grain
            v=.95+.024*grain+.025*furrows+.016*np.sin(x*24+y*8)
        elif name=="rubber":
            h=.095*grain;v=.97+.012*grain
        elif name=="box":
            h=.14*grain+.045*np.sin(x*190+y*14)
            v=.94+.027*grain+.025*np.sin(2*pi*(2*x-y))
        elif name in ("lining","edge","thread"):
            h=.10*grain+.07*np.sin(2*pi*(28*y+.16*np.sin(13*x)))
            v=.96+.017*grain
        elif name=="metal":
            h=.038*grain+.026*np.sin(y*540);v=.989+.005*grain
        dy,dx=np.gradient(h);n=np.stack((-.52*dx,-.52*dy,np.ones_like(x)),axis=2)
        n/=np.linalg.norm(n,axis=2)[:,:,None]
        ys=slice(row*SIZE,(row+1)*SIZE);xs=slice(col*SIZE,(col+1)*SIZE)
        c[ys,xs]=np.clip(v,0,1)[:,:,None];normal[ys,xs]=.5+n*.5
        orm[ys,xs,0]=1;orm[ys,xs,1]=np.clip(r+.028*h+.009*grain,0,1);orm[ys,xs,2]=m
    return image(NAMES[0],c,False),image(NAMES[1],normal,True),image(NAMES[2],orm,True)


def sinfield(x,y):
    return np.sin(x/41)+.6*np.cos(y/49)


def sample_uv(label,u,v):
    col,row,_,_=SWATCHES[label]
    return ((col*SIZE+2.5+(SIZE-5)*u)/W,(row*SIZE+2.5+(SIZE-5)*v)/H)


def map_object(obj,label):
    mesh=obj.data
    layer=mesh.uv_layers.active or mesh.uv_layers.new(name="Product surface")
    layer.name="Product surface"
    if obj.get("mappedSurface"):
        for loop in layer.data:
            u,v=loop.uv
            loop.uv=sample_uv(label,u,v)
        return
    if label=="plain":
        uv=sample_uv("plain",.5,.5)
        for loop in layer.data:loop.uv=uv
        return
    points=np.array([v.co[:] for v in mesh.vertices])
    low=points.min(axis=0);size=np.maximum(points.max(axis=0)-low,.0001)
    # Parts with dimensional profiles keep a planar projection per face.
    for face in mesh.polygons:
        drop=int(np.argmax(abs(np.array(face.normal[:]))))
        a,b=[axis for axis in range(3) if axis!=drop]
        for k in face.loop_indices:
            p=points[mesh.loops[k].vertex_index]
            layer.data[k].uv=sample_uv(label,(p[a]-low[a])/size[a],(p[b]-low[b])/size[b])


def shader(mat,imgs):
    nodes,links=mat.node_tree.nodes,mat.node_tree.links
    p=nodes["Principled BSDF"];tex=[]
    for img in imgs:
        node=nodes.new("ShaderNodeTexImage");node.image=img;tex.append(node)
    vc=nodes.new("ShaderNodeVertexColor");vc.layer_name="Finish"
    mix=nodes.new("ShaderNodeMixRGB");mix.blend_type="MULTIPLY";mix.inputs[0].default_value=1
    links.new(tex[0].outputs["Color"],mix.inputs[1]);links.new(vc.outputs["Color"],mix.inputs[2])
    links.new(mix.outputs[0],p.inputs["Base Color"])
    n=nodes.new("ShaderNodeNormalMap");links.new(tex[1].outputs["Color"],n.inputs["Color"]);links.new(n.outputs["Normal"],p.inputs["Normal"])
    sep=nodes.new("ShaderNodeSeparateRGB");links.new(tex[2].outputs["Color"],sep.inputs[0])
    links.new(sep.outputs["G"],p.inputs["Roughness"]);links.new(sep.outputs["B"],p.inputs["Metallic"])


def vertex_tint(obj):
    mesh=obj.data
    if not mesh.color_attributes.get("Finish"):
        tint=mesh.color_attributes.new(name="Finish",type="BYTE_COLOR",domain="POINT")
        color=mesh.materials[0].diffuse_color[:]
        for item in tint.data:item.color=color


def author(objects):
    imgs=generate();shaders={}
    for obj in objects:
        label=obj.get("finishSwatch","plain")
        map_object(obj,label)
        if label=="plain":continue
        vertex_tint(obj)
        mat=obj.data.materials[0];rgb=tuple(mat.diffuse_color)
        if (label,rgb) not in shaders:
            native=mat.copy();native.name="Berwick · "+label+" · "+mat.name
            shader(native,imgs);shaders[label,rgb]=native
        obj.data.materials[0]=shaders[label,rgb]
