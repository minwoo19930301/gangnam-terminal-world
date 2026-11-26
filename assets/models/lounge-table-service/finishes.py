"""Original food, bamboo, glaze and metal swatches for the editable setting and its one shared game atlas."""
from pathlib import Path
from tempfile import TemporaryDirectory
import struct,zlib,subprocess
import bpy
import numpy as np
import math

# RGB, family. Ranges of gloss stay editable as material properties in the .blend.
SURFACES={
 'ivory':('ece7df','glaze'),'milk':('f5ece0','glaze'),'blueChina':('7587a3','blueglaze'),'bluePale':('aab6c7','glaze'),
 'bluePrint':('e6e6e3','cobalt'),'gold':('bc9854','metal'),'darkGold':('8e763c','metal'),
 'silver':('c3c4c4','metal'),'mintTin':('a9b6a4','metal'),'bamboo':('bf975f','bamboo'),
 'bambooPale':('dbbc85','bamboo'),'bambooEdge':('c9a56f','bamboo'),'bambooMark':('8c663e','bamboo'),
 'berry':('ca3c41','fruit'),'berryGame':('c83941','fruit'),'cutBerry':('ef656b','fruit'),'berryVein':('f2b9a1','food'),
 'pannaRed':('e55c63','velvet'),'vanilla':('eee2c4','cream'),'jam':('9c263d','glaze'),
 'yogurt':('e7b1ae','cream'),'cream':('f3e5c4','cream'),'roseCream':('dc9aa1','cream'),
 'seed':('d9b077','food'),'choux':('b07a48','crumb'),'pistachio':('95a85d','crumb'),
 'financier':('ca866b','crumb'),'darkCocoa':('482e2e','velvet'),'velvet':('b72c47','velvet'),
 'blackBun':('514c47','crumb'),'lettuce':('789650','food'),'green':('627d45','food'),
 'sear':('7d3f2c','grill'),'cheddar':('cf9951','cream'),'taco':('ce9d48','crumb'),
 'lobster':('d99677','food'),'caviar':('363a37','glaze'),'tea':('ad8045','glaze'),
 'glass':('e2e9e8','glass'),'ice':('dce5de','glaze'),'clearGlaze':('c7ccc7','glaze'),
 'scone':('cda171','crumb'),'crumb':('e3c8a3','crumb'),'sconeCrust':('ae7849','crumb'),
 'marmalade':('d8a54d','fruit'),'twig':('6f5b40','bamboo'),'pine':('54744e','food'),
 'coneScale':('946b48','bamboo'),'siumai':('e5c76a','food'),'shrimp':('d4a18c','food'),
 'scallop':('e8dab9','cream'),'roe':('dd8345','glaze'),'shrimpWrap':('debea3','wrapper'),
 'dumplingIvory':('e9dfc8','wrapper'),'redWrap':('cb353f','wrapper'),'goldWrap':('e1ba5a','wrapper'),
 'cucumber':('8b9d57','food'),'leaf':('708554','food'),'crisp':('c89757','crumb'),
 'radish':('e3beab','food'),'soy':('573d30','glaze'),'char':('563c32','grill'),
 'bone':('d5b497','food'),'lacquer':('292a29','glaze'),
}
for j in range(15):
    t=max(0,min(1,(j/14-.13)/.82));t=t*t*(3-2*t)
    rgb=np.rint(np.array([182,47,57])*(1-t)+np.array([246,224,208])*t).astype(int)
    SURFACES['drink'+str(j)]=(''.join(f'{v:02x}' for v in rgb),'glaze')
COLS=9;SIZE=112;ROWS=math.ceil(len(SURFACES)/COLS)
reflect={'glaze':.49,'blueglaze':.54,'cobalt':.48,'metal':.86,'bamboo':.12,'fruit':.31,'food':.11,'velvet':.04,
         'cream':.16,'crumb':.045,'grill':.31,'glass':.94,'wrapper':.27}

def rgb(code):return np.array([int(code[i:i+2],16) for i in (0,2,4)],dtype=float)
def write_png(path,pixels):
    h,w=pixels.shape[:2]
    def chunk(k,data):return struct.pack('>I',len(data))+k+data+struct.pack('>I',zlib.crc32(k+data)&0xffffffff)
    path.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',w,h,8,2,0,0,0))+
                     chunk(b'IDAT',zlib.compress(b''.join(b'\0'+row.tobytes() for row in pixels),8))+chunk(b'IEND',b''))

def atlas(here):
    image=np.full((ROWS*SIZE,COLS*SIZE,3),178,dtype=np.uint8)
    yy,xx=np.mgrid[:SIZE,:SIZE];u=(xx+.5)/SIZE;v=(yy+.5)/SIZE;rng=np.random.default_rng(701)
    for i,(key,(hexcode,kind)) in enumerate(SURFACES.items()):
        base=rgb(hexcode);low=rng.normal(0,1,(14,14));coarse=low.repeat(8,0).repeat(8,1)
        noise=rng.normal(0,1,xx.shape)
        if kind=='bamboo':delta=1.5*noise+4.4*np.cos(yy*1.6+.68*np.sin(u*7))+2*np.cos(yy*.31+1.3*np.sin(u*4))
        elif kind=='metal':delta=1.6*noise+1.8*np.cos(yy*2.1+u)
        elif kind=='crumb':delta=6*noise+9*coarse+5.8*np.sin(31*u+7*np.sin(20*v))
        elif kind in ('fruit','wrapper'):delta=2.8*noise+2.5*coarse+2.6*np.cos(22*u+5*np.sin(12*v))
        elif kind=='grill':delta=4.8*noise+7*np.sin(23*v+2.5*np.cos(18*u))+4*coarse
        elif kind=='velvet':delta=3.6*noise+1.5*coarse
        elif kind=='blueglaze':delta=1.8*noise+4*np.sin(8*u+3*np.sin(5*v))+.8*np.cos(yy*.85)
        else:delta=noise*1.15+.75*np.sin(17*v+7*u)
        paint=base[None,None,:]+delta[:,:,None]
        if key=='berryGame':
            # The studio keeps individual achene meshes. Their recesses and tiny gold
            # glints are baked into this latitudinal swatch for the lighter game berry.
            for row,(height,count) in enumerate([(.14,9),(.27,12),(.40,15),(.54,15),(.68,14),(.80,11),(.89,8)]):
                for col in range(count):
                    x=(col+(row%2)*.5)/count
                    dx=((u-x+.5)%1)-.5;dy=(1-v)-height
                    rr=(dx/.011)**2+(dy/.032)**2
                    paint-=np.exp(-rr*1.3)[:,:,None]*np.array([40,23,21])
                    inside=(dx/.0059)**2+((dy+.003)/.014)**2<1
                    paint[inside]=np.array([224,171,94])+noise[inside,None]*3
        if kind=='cobalt':
            x=u*4-.5;y=v*5-.5;dx=x-np.rint(x);dy=y-np.rint(y);r=np.hypot(dx,dy);a=np.arctan2(dy,dx)
            printline=(np.abs(r-.18-.075*np.cos(5*a))<.031)|(r<.06)|(np.abs(np.sin((x+y)*np.pi))<.097)
            paint[printline]=rgb('40638f')+noise[printline,None]*2
        if key=='scone' or key=='financier':
            for k in range(83):
                cx,cy=rng.uniform(0,SIZE,2);rad=rng.uniform(.45,1.7)
                paint[(xx-cx)**2+(yy-cy)**2<rad**2]*=rng.uniform(.55,.83)
        tile=np.clip(paint,0,255).astype(np.uint8);oy=(i//COLS)*SIZE;ox=(i%COLS)*SIZE
        image[oy:oy+SIZE,ox:ox+SIZE]=tile
    with TemporaryDirectory() as tmp:
        png=Path(tmp)/'surfaces.png';write_png(png,image)
        native=bpy.data.images.load(str(png));native.name='라운지 상차림 · 재료 아틀라스';native.pack();native.filepath='//surfaces.webp'
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:92,effort:6}).toFile(process.argv[2]);",
                        str(png),str(here/'surfaces.webp')],cwd=here.parents[2],check=True)
    return native

def materials(m,image):
    for key,(base,kind) in SURFACES.items():
        mat=m.material(key,base,.82 if kind=='metal' else 0);m.palette[key]=mat
        mat['browser_reflectance']=reflect[kind];mat['swatch']=key
        nt=mat.node_tree;shader=nt.nodes.get('Principled BSDF');tx=nt.nodes.new('ShaderNodeTexImage');tx.image=image
        nt.links.new(tx.outputs['Color'],shader.inputs['Base Color']);shader.inputs['Roughness'].default_value=1-reflect[kind]*.81
        if kind in ['glaze','blueglaze','cobalt']:shader.inputs['Roughness'].default_value=.26
        if kind=='blueglaze':shader.inputs['Metallic'].default_value=.055
        if kind in ['glaze','blueglaze','cobalt','fruit','grill','wrapper']:
            shader.inputs['Coat Weight'].default_value=.28 if kind in ['glaze','blueglaze','cobalt'] else .12
            shader.inputs['Coat Roughness'].default_value=.18
        if kind=='glass':
            shader.inputs['Roughness'].default_value=.10;shader.inputs['Transmission Weight'].default_value=.92;shader.inputs['IOR'].default_value=1.46
        if kind in ['cream','wrapper','fruit']:
            shader.inputs['Subsurface Weight'].default_value=.10;shader.inputs['Subsurface Scale'].default_value=.00085

def uvs(coll):
    ind={name:i for i,name in enumerate(SURFACES)}
    for ob in coll.objects:
        mesh=ob.data
        if mesh.uv_layers:continue
        uv=mesh.uv_layers.new(name='마감과 재료')
        pts=np.array([v.co[:] for v in mesh.vertices]);ext=np.maximum(np.ptp(pts,axis=0),.000001);norm=(pts-pts.min(axis=0))/ext
        for poly in mesh.polygons:
            key=mesh.materials[poly.material_index]['swatch'];i=ind[key]
            axis=int(np.argmax(np.abs(poly.normal[:])));a,b=((1,2),(0,2),(0,1))[axis]
            if SURFACES[key][1]=='bamboo' and ext[a]<ext[b]:a,b=b,a
            for vi,li in zip(poly.vertices,poly.loop_indices):
                p=norm[vi];uv.data[li].uv=((i%COLS+.025+.95*p[a])/COLS,1-(i//COLS+.025+.95*(1-p[b]))/ROWS)
