"""Public Berluti Gangnam storefront, read from the brand's exterior photograph."""
from math import cos,pi,radians,sin
from pathlib import Path
from random import Random
import bpy
import bmesh
import numpy as np
import radiance
from mathutils import Vector

LEFT,RIGHT=-5.15,-.55
FRONT=-7.96
SILL,HEAD=.085,2.815
POST=3.48
SCREEN='BerlutiFrontGlass'
JOINERY='BerlutiFrontJoinery'
TINT='Shopfront'

def linear(value):
    return value/12.92 if value<=.04045 else ((value+.055)/1.055)**2.4

def colour(s):
    return tuple(linear(int(s[i:i+2],16)/255) for i in (0,2,4))

def material(name,roughness,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    n=m.node_tree.nodes;bs=n.get('Principled BSDF');vc=n.new('ShaderNodeVertexColor');vc.layer_name=TINT
    m.node_tree.links.new(vc.outputs['Color'],bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value=roughness;bs.inputs['Metallic'].default_value=metal
    return m

def make(collection):
    random=Random(1895)
    solid=material(JOINERY,.34,.22);glass=material(SCREEN,.13)
    glass.node_tree.nodes['Principled BSDF'].inputs['Transmission'].default_value=.88
    glass.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value=1.49
    # A tiny seamless shared normal gives the moulded faces slight waviness in addition to their raised rims.
    n=128;yy,xx=np.mgrid[0:n,0:n]*2*pi/n
    dx=.049*np.cos(3*xx+.6*np.sin(yy*2))+.035*np.cos(2*xx+3*yy)+.023*np.cos(8*xx+2*yy)
    dy=.051*np.cos(2*yy+np.sin(xx))+.043*np.cos(2*xx+3*yy)+.019*np.cos(5*yy-xx)
    norm=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1);norm/=np.linalg.norm(norm,axis=-1,keepdims=True)
    rgba=np.ones((n,n,4),np.float32);rgba[:,:,:3]=norm*.5+.5
    im=bpy.data.images.new('Berluti · pressed glass ripples',width=n,height=n,alpha=False);im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(rgba.ravel());im.pack()
    tx=glass.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im
    nm=glass.node_tree.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.36
    glass.node_tree.links.new(tx.outputs['Color'],nm.inputs['Color']);glass.node_tree.links.new(nm.outputs['Normal'],glass.node_tree.nodes['Principled BSDF'].inputs['Normal'])
    def obj(name,pts,faces,mat,colors,uv=None):
        me=bpy.data.meshes.new(name);me.from_pydata(pts,[],faces);me.update()
        o=bpy.data.objects.new(name,me);collection.objects.link(o);me.materials.append(mat);o['retailPackage']='frontage'
        a=me.color_attributes.new(name=TINT,type='BYTE_COLOR',domain='POINT')
        for i,c in enumerate(colors):a.data[i].color=c
        if uv:
            layer=me.uv_layers.new(name='Mould')
            for poly in me.polygons:
                for k in poly.loop_indices:layer.data[k].uv=uv[me.loops[k].vertex_index]
        return o
    def box(name,c,size,base,grain=False):
        x,y,z=c;w,d,h=(s/2 for s in size)
        if grain:
            # Use a few slender strips of variegated walnut, all part of the photographed sign pier.
            for i in range(30):
                shade=random.uniform(.91,1.07);v=tuple(min(1,b*shade) for b in colour(base))
                bx=x-w+(i+.5)*w/15
                pts=[(bx+a*w/30,y+b*d,z+c*h) for c in (-1,1) for b in (-1,1) for a in (-1,1)]
                obj(name,pts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],solid,[(*v,1)]*8)
            return
        pts=[(x+a*w,y+b*d,z+c*h) for c in (-1,1) for b in (-1,1) for a in (-1,1)]
        rgba=(*colour(base),1)
        return obj(name,pts,[(0,2,3,1),(4,5,7,6),(0,1,5,4),(1,3,7,5),(3,2,6,7),(2,0,4,6)],solid,[rgba]*8)
    def lettering(word,x,y,z,size,font):
        curve=bpy.data.curves.new(word,'FONT');curve.body=word;curve.size=size;curve.align_x='CENTER';curve.align_y='CENTER';curve.space_character=1.02
        if font:curve.font=font
        curve.extrude=.0018;curve.bevel_depth=.0005;curve.bevel_resolution=1;curve.resolution_u=6
        o=bpy.data.objects.new(word,curve);collection.objects.link(o);o.location=(x,y,z);o.rotation_euler.x=pi/2
        bpy.context.view_layer.update()
        me=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        new=bpy.data.objects.new('입구 레터링 · '+word,me);collection.objects.link(new);new.matrix_world=o.matrix_world.copy();new['retailPackage']='frontage';me.materials.append(solid)
        a=me.color_attributes.new(name=TINT,type='BYTE_COLOR',domain='POINT')
        for val in a.data:val.color=(*colour('f8f6ed'),1)
        bpy.data.objects.remove(o,do_unlink=True);bpy.data.curves.remove(curve)
    dark='2b292a'; warm='5c5048'
    center=(LEFT+RIGHT)/2;w=RIGHT-LEFT
    box('유리 쇼윈도 낮은 금속 문턱',(center,FRONT,.041),(w+.12,.153,.082),dark)
    for x in (LEFT-.027,RIGHT+.027):
        box('유리 쇼윈도 흑색 세로틀',(x,FRONT,1.455),(.060,.155,2.91),dark)
        box('반사광이 드는 안쪽 금속 모서리',(x,FRONT-.078,1.455),(.012,.010,2.91),warm)
    box('출입구 오른쪽 문설주',(POST,FRONT,1.47),(.115,.165,2.94),dark)
    box('검은 매장 간판 띠',((LEFT+POST)/2,FRONT,2.993),(POST-LEFT+.125,.174,.36),dark)
    box('목재 상부 촉과 금속 몰딩',((LEFT+POST)/2,FRONT-.034,3.192),(POST-LEFT+.125,.143,.054),warm)
    box('상부 몰딩 하단 음각선',((LEFT+POST)/2,FRONT-.111,3.177),(POST-LEFT+.12,.013,.013),dark)
    box('브랜드 표지의 목재 기둥',(2.906,FRONT+.34,1.408),(1.048,.169,2.816),'614738',True)
    fontpath=Path('/System/Library/Fonts/Supplemental/Arial Narrow Bold.ttf')
    font=bpy.data.fonts.load(str(fontpath)) if fontpath.is_file() else None
    lettering('BERLUTI',1.18,FRONT-.091,2.982,.238,font)
    for word,h,sz in [('1895',1.662,.085),('BERLUTI',1.486,.158),('PARIS',1.316,.085)]:
        lettering(word,2.90,FRONT+.252,h,sz,font)
    # Each relief is broad at the shoulders and narrows toward its rounded foot.
    # The branch photo shows staggered rows, subtle green glass edges and handmade variations.
    outline=[(-.224,.978),(-.286,.934),(-.364,.798),(-.447,.612),(-.485,.457),(-.478,.297),
        (-.431,.174),(-.330,.075),(-.189,.004),(-.058,-.026),(.052,-.022),(.194,.006),
        (.339,.089),(.437,.202),(.484,.349),(.484,.505),(.434,.656),(.355,.825),(.283,.946),(.225,.984),(.055,.996),(-.093,.991)]
    columns=23;tile_w=w/columns;rows=12;step=(HEAD-SILL)/(rows-.05);tile_h=step*1.23
    for j in range(rows):
        cx=LEFT+(.5 if j%2==0 else 0)*tile_w
        for i in range(columns+(j%2)):
            x=cx+i*tile_w;z=SILL+j*step-.025
            depth=FRONT-.017+(j%2)*.006+random.uniform(-.004,.004)
            amplitude=random.uniform(.91,1.11);phase=random.uniform(0,2*pi)
            tint=random.uniform(.965,1.01)
            points=[];cs=[];uv=[];faces=[];n=len(outline)
            for scale,disp,rgba in [(1,.009,(.79,.88,.84,.43)),(1,-.0006,(.84,.91,.88,.56)),
                                    (.936,-.0095,(.94,.95,.88,.73)),(.838,-.012,(.86,.92,.89,.39)),
                                    (.54,-.021,(.90,.93,.90,.19)),(.15,-.024,(.92,.94,.91,.17))]:
                for q,(u,v) in enumerate(outline):
                    ux=u*scale;vz=.47+(v-.47)*scale
                    px=x+ux*tile_w;pz=z+vz*tile_h
                    py=depth+disp*amplitude+.0017*sin(phase+q*.43)*scale+.0011*cos(phase+v*5)
                    points.append((px,py,pz));cs.append((rgba[0]*tint,rgba[1],rgba[2]*tint,rgba[3]))
                    uv.append(((ux+.5)*.86+.06,vz*.80+.09))
            # Front rings and the thin edge are opaque enough to catch a highlight.
            for k in range(5):
                for n0 in range(n):
                    n1=(n0+1)%n;faces.append((k*n+n0,k*n+n1,(k+1)*n+n1,(k+1)*n+n0))
            faces.extend([tuple(range(n-1,-1,-1)),tuple(range(5*n,6*n))])
            ob=obj('성형 유리 · %02d열 %02d번'%(j+1,i+1),points,faces,glass,cs,uv)
            bm=bmesh.new();bm.from_mesh(ob.data)
            # Clip the edge pieces at the real frame, preserving loop UVs and corner colours.
            for point,no in [((LEFT,0,0),(1,0,0)),((RIGHT,0,0),(-1,0,0)),((0,0,SILL),(0,0,1)),((0,0,HEAD),(0,0,-1))]:
                if any((v.co-Vector(point)).dot(Vector(no))<0 for v in bm.verts):
                    bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=point,plane_no=no,dist=.000005,clear_inner=True)
            bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(ob.data);bm.free()
            for poly in ob.data.polygons:poly.use_smooth=len(poly.vertices)==4
    environment=glass.node_tree.nodes.new('ShaderNodeTexImage');environment.image=radiance.bake(collection)
    bs=glass.node_tree.nodes['Principled BSDF'];glass.node_tree.links.new(environment.outputs['Color'],bs.inputs['Emission'])
    bs.inputs['Emission Strength'].default_value=.001
    return solid,glass
