"""Jacquard, ribbing, puffer nylon and stitching swatches drawn for the three documented colourways."""
import bpy
import numpy as np
import struct,zlib,subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

VARIANTS={'wine':('622439','dcd9ce','3a2330'),'ice':('b4cddc','f3eee7','824759'),'black':('28292a','e8e5dc','5f615e')}
# UVs are set by each cloth panel. Keep a full pattern repeat independent of shoulder and sleeve widths.
def rgb(code):return np.array([int(code[i:i+2],16) for i in (0,2,4)])
def inside_leaf(x,y,angle,x0,y0,l,w):
    dx=x-x0;dy=y-y0;c=np.cos(angle);s=np.sin(angle)
    a=(c*dx+s*dy)/w;b=(-s*dx+c*dy)/l
    return (np.abs(b)<1)&(np.abs(a)<np.maximum(0,1-np.abs(b)**1.38)**1.12)
def leafmark(x,y):
    mask=inside_leaf(x,y,0,0,.020,.131,.053)
    mask|=inside_leaf(x,y,-.86,.075,-.012,.12,.048)
    mask|=inside_leaf(x,y,.86,-.075,-.012,.12,.048)
    # Woven separations in the off-white trefoil leave the fabric beneath visible.
    for yy in [-.062,-.042,-.022]:mask&=np.abs(y-yy)>.0068
    return mask

def atlas(here,key):
    w=h=768;yy,xx=np.mgrid[:h,:w];u=(xx+.5)/w;v=1-(yy+.5)/h;rng=np.random.default_rng(931)
    main,pale,outline=[rgb(s) for s in VARIANTS[key]]
    # Left three quarters carry six lozenges around the body and four along the panel height.
    tx=u/.75*8;ty=v*3.12
    dx=tx-np.round(tx);dy=ty-np.round(ty)
    distance=np.abs(np.abs(dx)*2+np.abs(dy)*2-1)
    pattern=np.broadcast_to(main,(h,w,3)).astype(float).copy()
    pattern[distance<.102]=pale if key=='ice' else outline
    pattern[distance<(.034 if key=='ice' else .072)]=outline if key=='ice' else pale
    mask=leafmark(dx,dy);pattern[mask]=pale
    # The alternating stacks share a lattice but their woven leaves face the same direction.
    ox=tx-.5-np.round(tx-.5);oy=ty-.5-np.round(ty-.5)
    pattern[leafmark(ox,oy)]=pale
    right=u>=.75
    # Three plain sample columns are reserved for rib, stripes and uncoloured hardware.
    pattern[right]=main
    band=(u>=.86)&(u<.95)
    pattern[band]=pale
    pattern[u>=.95]=252
    stitch=(2.9*np.cos(xx*2.2+.8*np.cos(yy*1.5))+2.1*np.cos(yy*2.35)+rng.normal(0,1.1,(h,w)))
    stitch+=np.where((u>=.75)&(u<.95),4.2*np.sin(2*np.pi*xx/5),0)
    stitch[u>=.95]=0
    img=np.clip(pattern+stitch[:,:,None],0,255).astype(np.uint8)
    def chunk(k,d):return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
    with TemporaryDirectory() as tmp:
        p=Path(tmp)/'knit.png'
        p.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(b''.join(b'\0'+row.tobytes() for row in img),6))+chunk(b'IEND',b''))
        image=bpy.data.images.load(str(p));image.name='트레포일 니트 · '+key;image.pack();image.filepath='//knit-'+key+'.webp'
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:90,effort:6}).toFile(process.argv[2]);",str(p),str(here/('knit-'+key+'.webp'))],cwd=here.parents[2],check=True)
    return image

def native(library,key,image):
    for group in ['jacquard','rib','stripe']:
        mat=library.material(group+' · '+key,VARIANTS[key][1 if group=='stripe' else 0])
        nt=mat.node_tree;shader=nt.nodes.get('Principled BSDF');tx=nt.nodes.new('ShaderNodeTexImage');tx.image=image
        nt.links.new(tx.outputs['Color'],shader.inputs['Base Color']);shader.inputs['Roughness'].default_value=.83
        shader.inputs['Sheen Weight'].default_value=.15;library.palette[group+key]=mat
