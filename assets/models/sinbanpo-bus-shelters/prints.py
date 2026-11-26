"""Editable local visitor artwork. Each poster is typeset and photographed in Blender."""
from math import cos, sin, pi, tau
from random import Random
from pathlib import Path
import bpy

def make_print(scene,name,key,origin,fonts,pal):
    col=bpy.data.collections.new(name)
    scene.collection.children.link(col);col['preview_origin']=origin
    ox,oy,oz=origin
    rng=Random(114 if key=='river' else 87)
    inks={}
    def ink(code):
        if code in inks:return inks[code]
        m=bpy.data.materials.new('인쇄 잉크 · '+code)
        m.use_nodes=True
        sr=[int(code[i:i+2],16)/255 for i in (0,2,4)]
        rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in sr]
        m.diffuse_color=(*rgb,1)
        m.node_tree.nodes.clear();s=m.node_tree.nodes.new('ShaderNodeEmission')
        s.inputs[0].default_value=(*rgb,1);out=m.node_tree.nodes.new('ShaderNodeOutputMaterial')
        m.node_tree.links.new(s.outputs[0],out.inputs[0]);inks[code]=m
        return m
    def polygon(label,coords,color,h):
        mesh=bpy.data.meshes.new(label)
        mesh.from_pydata([(ox+x,oy+y,oz+h) for x,y in coords],[],[tuple(range(len(coords)))])
        mesh.update();o=bpy.data.objects.new(label,mesh);col.objects.link(o);mesh.materials.append(ink(color));return o
    def rect(label,x,y,w,h,color,z):
        return polygon(label,[(x,y),(x+w,y),(x+w,y+h),(x,y+h)],color,z)
    def disk(label,x,y,rx,ry,color,z,n=28):
        return polygon(label,[(x+rx*cos(tau*i/n),y+ry*sin(tau*i/n)) for i in range(n)],color,z)
    def stroke(label,points,width,color,z):
        cr=bpy.data.curves.new(label,'CURVE');cr.dimensions='3D';cr.resolution_u=3
        spline=cr.splines.new('POLY');spline.points.add(len(points)-1)
        for p,(x,y) in zip(spline.points,points):p.co=(ox+x,oy+y,oz+z,1)
        cr.bevel_depth=width*.5;cr.bevel_resolution=1
        obj=bpy.data.objects.new(label,cr);col.objects.link(obj);cr.materials.append(ink(color))
    def words(label,x,y,sz,color,z,font='latin',align='LEFT'):
        cr=bpy.data.curves.new(label,'FONT');cr.body=label;cr.align_x=align;cr.align_y='CENTER';cr.size=sz
        if font in fonts:cr.font=fonts[font]
        cr.resolution_u=5
        obj=bpy.data.objects.new(label,cr);col.objects.link(obj);obj.location=(ox+x,oy+y,oz+z);cr.materials.append(ink(color))
        # The native stores the editable outline for precisely this short sign.
        # A platform font file never needs to travel with the game or source.
        bpy.context.view_layer.update()
        geo=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
        dst=bpy.data.objects.new('활자 · '+label,geo);col.objects.link(dst);dst.matrix_world=obj.matrix_world.copy()
        if not geo.materials:geo.materials.append(ink(color))
        bpy.data.objects.remove(obj,do_unlink=True)
    if key=='river':
        rect('감청색 인쇄지',-.6,-.9,1.2,1.8,'112937',0)
        # Gradated bands reproduce a dusk printing process with editable ink layers.
        for k in range(84):
            t=k/83;lo=(139,93,93);hi=(33,61,82)
            code=''.join(f'{round(lo[j]*(1-t)+hi[j]*t):02x}' for j in range(3))
            rect('강 너머 저녁 하늘',-.6,-.03+k*.0069,1.2,.0072,code,.001)
        disk('달',.332,.346,.088,.088,'ffe5b9',.004,56)
        horizon=[(-.6,-.070)]
        for i in range(39):
            x=-.6+i*.0315;height=.015+rng.random()*.071
            horizon.extend([(x,-.018),(x,height),(x+.019,height),(x+.019,-.018)])
        polygon('강 맞은편 스카이라인',[(-.6,-.090),(.6,-.090)]+horizon[::-1],'364958',.006)
        rect('한강 수면',-.6,-.66,1.2,.65,'163b4a',.008)
        for i in range(65):
            y=rng.uniform(-.605,-.095);x=rng.uniform(-.58,.53)
            rect('수면 위 가는 반사',x,y,min(rng.uniform(.014,.098),.595-x),rng.uniform(.0011,.0038),
                 ['3e7d80','46616b','7b807a','527f85'][i%4],.010)
        rect('반포대교 상판',-.6,-.070,1.2,.033,'d3ad91',.031)
        rect('교량 밑 그림자',-.6,-.086,1.2,.015,'333e47',.032)
        for x in [-.51,-.23,.05,.33,.58]:
            polygon('교각',[(x-.013,-.08),(x+.015,-.08),(x+.010,-.20),(x-.012,-.20)],'5e6265',.025)
        tones=['e0af92','e3ab86','e1c88f','9fbea1','78afb9','9995c7','cb8fa4']
        for j in range(70):
            x=-.595+j*.017
            a=.075+.055*(.5+.5*sin(j*.128));span=.086+.041*sin(j*.15+.28)
            path=[(x+t*span,-.079+a*sin(t*pi*.76)-.274*t*t) for t in [k/18 for k in range(19)]]
            stroke('분수 물줄기',[(min(.598,xx),yy) for xx,yy in path],.0023+j%3*.0005,tones[(j//8)%7],.036+j*.00001)
        words('BANPO   /   SEOUL',-.507,.748,.043,'d1dbc9',.05)
        words('달빛무지개분수',-.515,.597,.123,'f8e7cc',.05,'ko')
        words('The Moonlight Fountain',-.51,-.654,.072,'fae9ce',.05,'serif')
        rect('하단 가는 줄',-.509,-.733,1.016,.0025,'9dbabe',.05)
        words('반포한강공원',-.51,-.790,.043,'d1dbc9',.05,'ko')
        words('HANGANG PARK',.505,-.790,.033,'d1dbc9',.05,'latin','RIGHT')
    else:
        rect('따뜻한 아이보리 인쇄지',-.6,-.9,1.2,1.8,'f5ebc9',0)
        rect('식물 도감의 하단 띠',-.6,-.9,1.2,.22,'264b43',.002)
        disk('아침 햇빛',.318,.259,.168,.168,'e9be61',.004,52)
        for j in range(27):
            rootx=-.59+j*.044+rng.uniform(-.014,.014);rise=rng.uniform(.22,.91)
            lean=rng.uniform(-.16,.16)
            def pt(t):return (rootx+lean*t+.038*sin(t*pi),-.692+rise*t)
            green=['6b8056','67865b','315d4d','537854','819263'][j%5]
            stroke('유채 줄기',[pt(k/12) for k in range(13)],.005+rng.random()*.004,green,.009+j*.0005)
            for k in range(2,7):
                t=k*.117;x,y=pt(t);side=(-1)**(k+j);span=rng.uniform(.020,.047)
                polygon('유채 줄기잎',[(x,y),(x+side*span*.69,y+.015),(x+side*span,y+.051),
                    (x+side*span*.38,y+.040)],green,.012+j*.0005)
            x,y=pt(1)
            for h in range(8):
                xx=x+rng.uniform(-.058,.058);yy=y+rng.uniform(-.033,.045)
                stroke('꽃대',[(x,y-.06),(xx,yy)],.0019,green,.030+j*.00028)
                radius=rng.uniform(.009,.018)
                for q in range(4):
                    a=q*pi/2+.26
                    disk('유채꽃 네 꽃잎',xx+cos(a)*radius*.53,yy+sin(a)*radius*.53,radius*.72,radius*.59,
                         ['edb84b','edc650','ffd769','f6d06c'][h%4],.043+j*.00024,10)
                disk('꽃술',xx,yy,radius*.31,radius*.31,'c68a38',.054+j*.00025,8)
        words('SEOUL RIVER GARDENS',-.505,.758,.044,'436558',.075)
        words('서래섬',-.521,.563,.212,'244b41',.075,'ko')
        words('Canola in Bloom',-.51,.415,.074,'516f5a',.075,'serif')
        words('반포한강공원  서래섬',-.51,-.794,.050,'f5ebc9',.076,'ko')
        words('SEOUL',.51,-.794,.037,'f5ebc9',.076,'latin','RIGHT')
    return col

def render_print(col,target):
    from mathutils import Vector
    old=bpy.context.window.scene
    sc=bpy.data.scenes.new('인쇄 포스터 정사 촬영');sc.collection.children.link(col);bpy.context.window.scene=sc
    sc.render.engine='CYCLES';sc.cycles.samples=7;sc.cycles.use_denoising=False
    sc.render.resolution_x=640;sc.render.resolution_y=960;sc.render.resolution_percentage=100
    sc.render.image_settings.file_format='WEBP';sc.render.image_settings.quality=91
    sc.view_settings.view_transform='Standard';sc.view_settings.look='None'
    cam=bpy.data.cameras.new('포스터 정면');cam.type='ORTHO';cam.ortho_scale=1.8
    obj=bpy.data.objects.new('포스터 촬영',cam);sc.collection.objects.link(obj)
    obj.location=Vector(col['preview_origin'])+Vector((0,0,2.5));obj.rotation_euler=(0,0,0);sc.camera=obj
    sc.render.filepath=str(target);bpy.ops.render.render(write_still=True)
    bpy.context.window.scene=old;bpy.data.scenes.remove(sc)
