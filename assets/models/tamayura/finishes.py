"""Original surface swatches shared by the editable studio and the close-up game meshes."""
from pathlib import Path
from tempfile import TemporaryDirectory
import struct
import subprocess
import zlib

import bpy
import numpy as np

# Tile position is stable in the packed .blend and in the browser's single WebP.
SWATCHES = {
    'hinoki': ('e4c79c','wood'), 'hinoki_edge': ('ceac7f','endgrain'), 'ash': ('b6926a','wood'),
    'walnut': ('62452e','wood'), 'blackwood': ('3d322a','wood'), 'tea_wood': ('bc8d56','wood'),
    'oak': ('927147','wood'), 'ivory': ('e1d6c3','fabric'), 'ivory_edge': ('b8a891','fabric'),
    'charcoal': ('353533','plain'), 'granite': ('303136','granite'), 'dark_tile': ('514b46','stone'),
    'light_tile': ('b8aa9a','stone'), 'grout': ('71665c','plain'), 'shadow': ('36332e','plain'),
    'iron': ('454847','granite'), 'brass': ('ac8557','brush'), 'bronze': ('b58b62','brush'),
    'steel': ('a6a5a1','brush'), 'hood_inner': ('4a4238','brush'), 'mural': ('b19d86','mural'),
    'cream': ('e8dfd3','plaster'), 'cream2': ('e1d6c8','plaster'), 'cove': ('ffe2a8','plain'),
    'linen': ('eee9d9','fabric'), 'porcelain': ('eee9de','glaze'), 'blueware': ('687c96','glaze'),
    'celadon': ('8ca99a','glaze'), 'glaze_dark': ('494c48','glaze'), 'copper': ('b97543','brush'),
    'lacquer': ('8e3f2e','glaze'), 'rice': ('f1e9d0','rice'), 'tuna': ('b74142','fish'),
    'salmon': ('e28668','fish'), 'whitefish': ('e5cbb8','fish'), 'vein': ('f5cfad','plain'),
    'seaweed': ('383d2c','granite'), 'ikura': ('de6d27','glaze'), 'ginger': ('e7c29d','plain'),
    'wasabi': ('9ba966','stone'), 'tea': ('7a8253','glaze'), 'bamboo': ('d6b384','wood'),
    'matcha': ('899c55','rice'), 'steak': ('6e3c2d','food'), 'cut_beef': ('aa514e','food'),
    'grill': ('483a31','granite'), 'asparagus': ('829552','food'), 'stem': ('687742','plain'),
    'flower': ('e9d3d0','fabric'), 'shoji': ('e2d5bd','plaster'), 'tile_edge': ('8d7e6f','stone'),
    'cream_gold': ('c2a46f','brush'), 'salt': ('ded2bc','rice'), 'black': ('302c26','plain'),
}
COLS,ROWS,TW,TH=8,7,208,112

def new_atlas(here):
    width,height=COLS*TW,ROWS*TH
    out=np.zeros((height,width,3),dtype=np.uint8)
    yy,xx=np.mgrid[0:TH,0:TW];x=xx/TW;y=yy/TH
    for index,(key,(tone,finish)) in enumerate(SWATCHES.items()):
        rng=np.random.default_rng(5531+index)
        noise=rng.normal(0,1,x.shape); row=rng.normal(0,1,(TH,1))
        if finish=='wood':
            wave=28*y+1.23*np.sin(5.3*x+5*y)+.40*np.sin(15*x-7*y)
            value=2.8*np.sin(wave*6.283)-12*(.5+.5*np.cos(wave*6.283))**14+2.1*noise+1.4*row
        elif finish=='endgrain':
            radius=np.hypot(.73*(x+.15),.41*(y-.55))
            value=5*np.sin(radius*310+2*np.sin(11*y))+2*noise
        elif finish in ('granite','stone'):
            value=4.1*noise+2.3*np.sin(7*x+5*y)*np.cos(9*y-11*x)+rng.choice([0,17,-10],x.shape,p=[.95,.025,.025])
        elif finish=='mural':
            # Original clouded metal study. No pixels or traced contours from the artwork.
            flow=np.sin(13*y+3*np.sin(6*x)+np.sin(9*y-12*x))+.53*np.cos(33*y+8*x)+.27*np.sin(71*y-27*x)
            value=29*np.tanh(flow*2.8)+8*noise+5*np.cos(x*8+y*5)
        elif finish=='brush':value=3.8*row+1.4*noise+5*np.sin(x*3.8-1)
        elif finish=='fabric':value=3.3*np.cos(xx*np.pi)+2.9*np.cos(yy*np.pi)+1.9*noise
        elif finish=='fish':value=4*np.sin(12*y+6*x)+5*np.maximum(0,np.cos(48*x-27*y))**15+2*noise
        elif finish in ('food','rice'):value=3.3*noise+2.2*np.cos(15*y+13*x)
        elif finish=='glaze':value=1.3*noise+2.6*np.sin(5*x+2*y)
        else:value=noise*(2.1 if finish=='plaster' else .7)
        rgb=np.array([int(tone[i:i+2],16) for i in (0,2,4)])
        tile=np.clip(rgb[None,None,:]+value[:,:,None],0,255).astype(np.uint8)
        col=index%COLS;rowid=index//COLS;out[rowid*TH:(rowid+1)*TH,col*TW:(col+1)*TW]=tile
    def chunk(k,d):
        return struct.pack('>I',len(d))+k+d+struct.pack('>I',zlib.crc32(k+d)&0xffffffff)
    raw=b''.join(b'\0'+row.tobytes() for row in out)
    with TemporaryDirectory() as temp:
        png=Path(temp)/'tamayura-finishes.png'
        png.write_bytes(bytes.fromhex('89504e470d0a1a0a')+chunk(b'IHDR',struct.pack('>2I5B',width,height,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,8))+chunk(b'IEND',b''))
        image=bpy.data.images.load(str(png));image.name='타마유라 · 나뭇결과 직물, 금속, 도자기';image.pack();image.filepath='//finishes.webp'
        subprocess.run(['node','--input-type=module','-e',"import sharp from 'sharp'; await sharp(process.argv[1]).webp({quality:86,effort:6}).toFile(process.argv[2]);",str(png),str(here/'finishes.webp')],cwd=here.parents[2],check=True)
    return image

def prepare_native(materials,image):
    for key,(tone,finish) in SWATCHES.items():
        metallic=.70 if finish=='brush' else .35 if finish=='mural' else .03
        mat=materials.material(key,tone,metallic)
        shader=mat.node_tree.nodes.get('Principled BSDF')
        shader.inputs['Roughness'].default_value={'brush':.33,'glaze':.21,'granite':.29,'mural':.46,'wood':.42,'fabric':.83,'fish':.31}.get(finish,.58)
        tx=mat.node_tree.nodes.new('ShaderNodeTexImage');tx.image=image
        mat.node_tree.links.new(tx.outputs['Color'],shader.inputs['Base Color'])
        if key=='cove':
            shader.inputs['Emission Color'].default_value=(1,.79,.44,1);shader.inputs['Emission Strength'].default_value=2
        materials.palette[key]=mat

def project_uvs(collection):
    indices={name:i for i,name in enumerate(SWATCHES)}
    for ob in collection.objects:
        if ob.type!='MESH':continue
        mesh=ob.data
        if mesh.uv_layers:continue
        uv=mesh.uv_layers.new(name='마감과 재료')
        pts=np.array([v.co[:] for v in mesh.vertices]);low=pts.min(axis=0);ext=np.maximum(np.ptp(pts,axis=0),.000001)
        norm=(pts-low)/ext
        for poly in mesh.polygons:
            name=mesh.materials[poly.material_index].name;index=indices[name]
            axis=int(np.argmax(np.abs(poly.normal[:])))
            a,b=((1,2),(0,2),(0,1))[axis]
            # Put the grain along the longest dimension on every broad visible face.
            if SWATCHES[name][1]=='wood' and ext[a]<ext[b]:a,b=b,a
            for vi,li in zip(poly.vertices,poly.loop_indices):
                pos=norm[vi]
                u=(index%COLS+.026+.948*pos[a])/COLS
                v=1-(index//COLS+.026+.948*(1-pos[b]))/ROWS
                uv.data[li].uv=(u,v)
