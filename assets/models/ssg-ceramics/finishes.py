"""Kwangjuyo showroom craft finishes. All surface samples are original."""

from math import pi
import bpy
import numpy as np

NAMES=("광주요 · 옻칠과 태토","광주요 · 미세 요철","광주요 · 광택과 금속성")
W,H=768,640
TILES={
    'lacquer':(0,0,512,256), 'mouth':(512,0,256,128), 'foot':(512,128,256,128),
    'walnut':(0,256,384,128), 'ebony':(384,256,384,128), 'clay':(0,384,192,128),
    'celadon':(192,384,192,128), 'ivory':(384,384,192,128), 'stone':(576,384,192,128),
    'frame':(0,512,192,128), 'linen':(192,512,192,128), 'leaf':(384,512,192,128),
    'spoonsteel':(576,512,192,128)}


def uv(key,u,v):
    x,y,w,h=TILES[key];return ((x+1.5+(w-3)*u)/W,(y+1.5+(h-3)*v)/H)


def mix(a,b,t):
    return np.array(a)+(np.array(b)-np.array(a))*t[:,:,None]


def paint(key,u,v,rng):
    n=rng.normal(0,1,u.shape);w=.34*np.sin(9*u+2*v)+.31*np.cos(6*v-5*u)+.21*np.sin(24*u+9*v)
    h=.02*n;metal=0*u
    if key=='lacquer':
        # Brown lacquer over the upper body meets a narrow cloudy petrol-blue
        # boundary. The foot deepens to navy. The boundary changes around the pot.
        height=v+.013*np.sin(2*pi*u)+.010*np.cos(4*pi*u)+.003*np.sin(16*pi*u)
        knots=[(0,[14,23,43]),(.19,[20,34,63]),(.34,[26,46,83]),(.408,[48,75,97]),
               (.45,[89,99,98]),(.49,[129,108,94]),(.56,[158,118,92]),(.76,[183,136,109]),(1,[151,103,82])]
        c=np.stack([np.interp(height,[a for a,_ in knots],[col[ch] for _,col in knots]) for ch in range(3)],axis=2)
        brush=np.sin(2*pi*(26*v+.24*w));c+=np.stack((2.5*w+brush,2.3*w+.7*brush,2*w+.6*brush),axis=2)
        h+=.045*brush+.022*w;rough=.232+.018*w+.016*brush
    elif key in {'mouth','foot'}:
        ring=.5+.5*np.sin(v*48*pi+.52*np.sin(u*13))
        c=mix([53,41,36],[105,76,57],.45+.19*w+.10*ring) if key=='mouth' else mix([165,144,118],[210,186,151],.53+.16*w+.14*ring)
        h+=.20*ring;rough=(.27 if key=='mouth' else .66)+.04*ring
    elif key in {'walnut','ebony'}:
        # Slender longitudinal fibres continue over the handle into the scooped
        # spoon bowl. The grain lines narrow toward the hand-finished rim.
        phase=2*pi*(v*15+.23*np.sin(u*5+v*7)+.11*np.sin(13*u+3*v))
        grain=.5+.5*np.cos(phase);pores=np.clip((np.sin(phase+.6)+.6*np.sin(phase*2.3)-.56)*1.7,0,1)
        c=mix([70,36,20] if key=='walnut' else [38,31,28],
              [151,83,45] if key=='walnut' else [81,58,42],.39+.35*grain+.1*w)
        c-=pores[:,:,None]*np.array([15,11,6]);h+=.24*grain+.1*pores;rough=.38+.09*pores
    elif key in {'clay','celadon','ivory','stone'}:
        tones={'clay':([132,105,88],[160,138,120]),'celadon':([112,151,125],[146,174,148]),
               'ivory':([222,212,193],[244,233,214]),'stone':([86,86,79],[144,144,125])}
        turn=.5+.5*np.sin(2*pi*(37*v+.19*np.sin(u*8+v*3)))
        aa,bb=tones[key];c=mix(aa,bb,.52+.12*w+.08*turn)
        if key=='stone': 
            mineral=np.sin(14*v+3*np.sin(u*7)+3*w);c+=mineral[:,:,None]*np.array([11,12,11])
        for i in range(139):
            px,py=rng.uniform(0,1,2);rx,ry=rng.uniform(.001,.005,2)
            mark=np.exp(-((u-px)/rx)**2-((v-py)/ry)**2)
            c-=mark[:,:,None]*np.array([33,29,25]);h-=mark*.19
        h+=.072*turn+.046*w;rough={'clay':.66,'celadon':.245,'ivory':.34,'stone':.49}[key]+.033*w
    elif key in {'frame','spoonsteel'}:
        stripe=np.sin(2*pi*(u*59+.11*np.sin(v*5)))
        c=mix([132,99,77] if key=='frame' else [146,142,132],
              [180,144,111] if key=='frame' else [213,205,182],.54+.11*w+.095*stripe)
        h+=.08*stripe;rough=.33+.047*stripe if key=='frame' else .25+.055*stripe
        metal=0*u+(.64 if key=='frame' else .80)
    elif key=='leaf':
        k=.5+.5*np.cos(2*pi*(2*v+.8*abs(u-.5)));c=mix([77,79,51],[145,144,90],.44+.27*k+.10*w)
        h+=.23*k;rough=.56+.03*w
    else:
        warp=.5+.5*np.cos(2*pi*u*58);weft=.5+.5*np.cos(2*pi*v*42)
        c=mix([190,177,155],[232,217,192],.53+.11*warp+.11*weft+.07*w)
        h+=.21*(warp+weft);rough=.77+.04*warp
    c+=n[:,:,None]*(1.3 if key not in {'frame','spoonsteel'} else .65)
    dy,dx=np.gradient(h)
    nrm=np.stack((-.72*dx,-.72*dy,np.ones_like(dx)),axis=2)
    nrm/=np.linalg.norm(nrm,axis=2)[:,:,None]
    return np.clip(c/255,0,1),(nrm+1)*.5,np.stack((np.ones_like(u),np.clip(rough+.007*n,.13,.82),metal),axis=2)


def generate():
    planes=[np.ones((H,W,3)),np.zeros((H,W,3)),np.zeros((H,W,3))]
    planes[1][:]=(.5,.5,1);planes[2][:]=(1,.39,0)
    for idx,(key,(x,y,w,h)) in enumerate(TILES.items()):
        yy,xx=np.mgrid[:h,:w];samples=paint(key,xx/(w-1),yy/(h-1),np.random.default_rng(1963+idx))
        for p,s in zip(planes,samples):p[y:y+h,x:x+w]=s
    out=[]
    for i,(name,p) in enumerate(zip(NAMES,planes)):
        img=bpy.data.images.new(name,width=W,height=H,alpha=False)
        if i:img.colorspace_settings.name='Non-Color'
        rgba=np.ones((H,W,4),np.float32);rgba[:,:,:3]=p
        img.pixels.foreach_set(rgba.ravel());img.pack();out.append(img)
    return out


def shader(mat,images):
    ns,lk=mat.node_tree.nodes,mat.node_tree.links
    p=ns['Principled BSDF'];t=[]
    for im in images:
        n=ns.new('ShaderNodeTexImage');n.image=im;t.append(n)
    lk.new(t[0].outputs['Color'],p.inputs['Base Color'])
    normal=ns.new('ShaderNodeNormalMap');lk.new(t[1].outputs['Color'],normal.inputs['Color']);lk.new(normal.outputs['Normal'],p.inputs['Normal'])
    orm=ns.new('ShaderNodeSeparateRGB');lk.new(t[2].outputs['Color'],orm.inputs[0]);lk.new(orm.outputs['G'],p.inputs['Roughness']);lk.new(orm.outputs['B'],p.inputs['Metallic'])


def assign(ob,sample,coords):
    layer=ob.data.uv_layers.get('Craft') or ob.data.uv_layers.new(name='Craft')
    for loop in ob.data.loops:
        k,u,v=coords(loop.vertex_index,ob.data.vertices[loop.vertex_index].co)
        layer.data[loop.index].uv=uv(k,u,v)
    ob.data.materials.clear();ob.data.materials.append(sample)
