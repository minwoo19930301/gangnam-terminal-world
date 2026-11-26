"""Editable 16×16 service panels for the lit brick portrait, in metres."""
from math import pi
from pathlib import Path
import bpy
import numpy as np
from mathutils import Matrix
from mosaic_pattern import draw,PALETTE,W,H
OUT=Path(__file__).resolve().parent
FRAME=Matrix.Translation((-1.43,-4.52,0))@Matrix.Rotation(pi/2,4,'Z')
WIDTH,HEIGHT=1.28,2.048
SILL=.217
NAME='GangnamLegoRiverWall'
FAMILIES=('Mosaic ABS','Mosaic glowing ABS')
TRIM={'black frame':('26282a',.28),'brass edge':('8e7754',.32),'warm plaster':('dfd8c9',.66),
      'shadow gap':('504e4b',.74),'oak edge':('bdab8e',.51),'backing':('29323b',.65)}
def as_linear(value):
    v=int(value,16)/255
    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
def colour(h):return tuple(as_linear(h[i:i+2])for i in(0,2,4))+(1,)
def part(col,name,verts,faces,frame):
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);col.objects.link(ob);ob.matrix_world=frame.copy()
    ob['retailPackage']='LegoRiverWall';return ob
def book(col):
    mats={}
    for key,(hexcode,rough) in TRIM.items():
        m=bpy.data.materials.new('Mosaic · '+key);m.diffuse_color=colour(hexcode);m.use_nodes=True
        bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Roughness'].default_value=rough
        if key in ('black frame','brass edge'):bs.inputs['Metallic'].default_value=.38
        mats[key]=m
    for name in FAMILIES:
        m=bpy.data.materials.new(name);m.use_nodes=True;nodes=m.node_tree;sh=nodes.nodes['Principled BSDF']
        tx=nodes.nodes.new('ShaderNodeVertexColor');tx.layer_name='Brick colour';nodes.links.new(tx.outputs['Color'],sh.inputs['Base Color'])
        sh.inputs['Roughness'].default_value=.24 if name==FAMILIES[1]else .32
        if name==FAMILIES[1]:
            nodes.links.new(tx.outputs['Color'],sh.inputs['Emission']);sh.inputs['Emission Strength'].default_value=.44
        mats[name]=m
    return mats
def frame_pieces(col,frame,mats):
    def box(n,x,y,z,w,d,h,key):
        v=[(x+sx*w/2,y+sy*d/2,z+sz*h/2)for sz in(-1,1)for sy in(-1,1)for sx in(-1,1)]
        ob=part(col,n,v,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],frame)
        ob.data.materials.append(mats[key]);ob['frameFinish']=key
        return ob
    box('무지개분수 · 밝은 전시 벽',0,.060,1.32,2.24,.14,2.64,'warm plaster')
    box('전시 판 뒤의 음영',0,-.017,SILL+HEIGHT/2,WIDTH+.095,.035,HEIGHT+.098,'shadow gap')
    for k in (-1,1):
        box('세로 검은 알루미늄 액자',k*(WIDTH/2+.014),-.040,SILL+HEIGHT/2,.028,.037,HEIGHT+.054,'black frame')
        box('세로 안쪽 광택 선',k*(WIDTH/2+.0024),-.058,SILL+HEIGHT/2,.0048,.0045,HEIGHT,'brass edge')
        box('수평 검은 알루미늄 액자',0,-.040,SILL+HEIGHT/2+k*(HEIGHT/2+.0135),WIDTH,.037,.027,'black frame')
        box('수평 안쪽 광택 선',0,-.058,SILL+HEIGHT/2+k*(HEIGHT/2+.0024),WIDTH,.0045,.0048,'brass edge')
    for i in range(6):
        box('오른쪽 홈 패널',.826+i*.050,-.031,1.32,.025,.044,2.64,'oak edge')
    box('바닥 쪽 후퇴한 걸레받이',0,-.010,.044,2.24,.026,.088,'shadow gap')
    box('액자 상단 밝은 목재 턱',0,-.030,2.51,2.24,.076,.054,'oak edge')
def make(col,frame=FRAME):
    field,lit=draw();mats=book(col);frame_pieces(col,frame,mats)
    colours=[colour(h)for h in PALETTE];pitch=.008
    for py in range(H//16):
        for px in range(W//16):
            vs=[];fs=[];shades=[];lights=[]
            for j in range(16):
                gy=py*16+j
                for i in range(16):
                    gx=px*16+i;x=-WIDTH/2+(gx+.5)*pitch;z=SILL+(gy+.5)*pitch
                    colid=field[gy][gx];light=lit[gy][gx];front=-.0517-.00022*light
                    base=len(vs);gap=.00013 if i%8 and j%8 else .00024
                    for radius,y in [(pitch/2-gap,-.0508),(pitch/2-gap-.00040,front)]:
                        for dx,dz in [(-1,-1),(1,-1),(1,1),(-1,1)]:vs.append((x+dx*radius,y,z+dz*radius))
                    for u in range(4):
                        nxt=(u+1)%4;fs.append((base+u,base+nxt,base+nxt+4,base+u+4))
                    fs.append((base+4,base+5,base+6,base+7));shades.append(colours[colid]);lights.append(light)
            ob=part(col,'빛나는 브릭 모듈 %02d-%02d'%(px+1,py+1),vs,fs,frame)
            ob['moduleGrid']=[px,py];ob['tilePitchMm']=8;ob['tileCount']=256
            m=ob.data
            for name in FAMILIES:m.materials.append(mats[name])
            rgba=m.color_attributes.new(name='Brick colour',type='BYTE_COLOR',domain='POINT')
            v=np.repeat(np.array(shades,np.float32),8,axis=0);rgba.data.foreach_set('color',v.ravel())
            back=m.attributes.new(name='Backlight',type='INT',domain='FACE')
            back.data.foreach_set('value',np.repeat(np.asarray(lights,np.int32),5))
            for idx,l in enumerate(lights):
                if l:
                    for p in range(5):m.polygons[idx*5+p].material_index=1
    col['mosaicSizeMm']=[1280,2048];col['mosaicStudField']=[W,H]
