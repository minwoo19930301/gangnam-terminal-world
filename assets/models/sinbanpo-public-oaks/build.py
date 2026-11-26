"""Create the editable public pin oak, or export the saved source with --export-current."""
from datetime import datetime, timedelta, timezone
import json
import math
from pathlib import Path
import random
import subprocess
import sys
import tempfile
import bpy
from mathutils import Vector

HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from foliage import PHASES, write_atlas

COLLECTION='SinbanpoPublicPinOak'
MAT='대왕참나무 · 다섯 시기 잎과 수피'
RELIEF_DATE='Seoul month and day'
TAU=math.tau


def tile_uv(column,u,v):
    # A border around each swatch prevents filtering into the next season.
    return ((column+.02+.96*u)/4,(.02+.96*v)/8)


def normalized(vec):
    v=Vector(vec)
    v.normalize()
    return v


def tone_gray(value):
    return (value,value,value,1)


class Part:
    def __init__(self,name):
        self.name=name
        self.v=[];self.f=[];self.uv=[];self.colors=[];self.smooth=[]

    def face(self,idx,uvs,color,smooth):
        self.f.append(idx);self.uv.extend(uvs)
        self.colors.extend([tone_gray(color)]*len(idx));self.smooth.append(smooth)

    def tube(self,nodes,radii,sides=4,tint=.92):
        p=[Vector(v) for v in nodes];start=len(self.v)
        for j,(point,r) in enumerate(zip(p,radii)):
            d=normalized(p[min(j+1,len(p)-1)]-p[max(0,j-1)])
            cross=normalized(d.cross(Vector((1,0,0)) if abs(d.x)<.85 else Vector((0,1,0))))
            normal=d.cross(cross)
            for k in range(sides):
                a=TAU*k/sides
                self.v.append(point+r*(math.cos(a)*cross+math.sin(a)*normal))
        for j in range(len(p)-1):
            for k in range(sides):
                a=start+j*sides+k;b=start+j*sides+(k+1)%sides
                uv=[tile_uv(0,k/sides,0),tile_uv(0,(k+1)/sides,0),
                    tile_uv(0,(k+1)/sides,1),tile_uv(0,k/sides,1)]
                self.face([a,b,b+sides,a+sides],uv,tint,True)

    def spray(self,origin,direction,w,column,twist,tint):
        # A slightly folded spray keeps its leaves visible as the viewer moves past the crown.
        p=Vector(origin);v=Vector(direction);d=normalized(v)
        tangent=normalized(d.cross(Vector((0,0,1))) if abs(d.z)<.95 else d.cross(Vector((1,0,0))))
        normal=normalized(d.cross(tangent))
        across=tangent*math.cos(twist)+normal*math.sin(twist)
        facing=d.cross(across)
        start=len(self.v)
        for row,half in [(0,.38),(.5,.52),(1,.42)]:
            mid=p+v*row+facing*(.085*w if row==.5 else 0)
            self.v.extend((mid-across*(w*half),mid+across*(w*half)))
        for j in range(2):
            a=start+2*j
            self.face([a,a+1,a+3,a+2],[tile_uv(column,0,j*.5),tile_uv(column,1,j*.5),
                       tile_uv(column,1,(j+1)*.5),tile_uv(column,0,(j+1)*.5)],tint,True)

    def finish(self,group,mat):
        mesh=bpy.data.meshes.new(self.name);mesh.from_pydata(self.v,[],self.f);mesh.update()
        uv=mesh.uv_layers.new(name='잎가지와 수피 위치')
        for entry,value in zip(uv.data,self.uv):entry.uv=value
        col=mesh.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
        for entry,value in zip(col.data,self.colors):entry.color=value
        for poly,smooth in zip(mesh.polygons,self.smooth):poly.use_smooth=smooth
        mesh.materials.append(mat)
        obj=bpy.data.objects.new(self.name,mesh);group.objects.link(obj)
        return obj


def materials():
    mat=bpy.data.materials.new(MAT);mat.use_nodes=True
    mat.diffuse_color=(.18,.26,.11,1);mat.surface_render_method='DITHERED'
    nodes=mat.node_tree.nodes;links=mat.node_tree.links
    shader=nodes.get('Principled BSDF');shader.inputs['Roughness'].default_value=.84
    texture=nodes.new('ShaderNodeTexImage');texture.name='다섯 시기 원본'
    with tempfile.TemporaryDirectory() as tmp:
        path=Path(tmp)/'branches.png';write_atlas(path)
        texture.image=bpy.data.images.load(str(path));texture.image.name='잎가지 · 수피 · 다섯 시기'
        texture.image.pack();texture.image.filepath='//branches.png'
    uv=nodes.new('ShaderNodeTexCoord');uv.name='원본 UV'
    date=nodes.new('ShaderNodeAttribute');date.attribute_type='VIEW_LAYER';date.attribute_name=RELIEF_DATE
    normalize=nodes.new('ShaderNodeMath');normalize.operation='DIVIDE';normalize.inputs[1].default_value=1232
    links.new(date.outputs['Fac'],normalize.inputs[0])
    stops=nodes.new('ShaderNodeValToRGB');stops.name='서울 달력과 거리뷰의 잎빛'
    ramp=stops.color_ramp;ramp.interpolation='CONSTANT'
    ramp.elements.remove(ramp.elements[-1])
    for j,(day,stage) in enumerate(PHASES):
        e=ramp.elements[0] if j==0 else ramp.elements.new(day/1232)
        e.color=(stage/8,stage/8,stage/8,1)
    links.new(normalize.outputs[0],stops.inputs[0])
    offset=nodes.new('ShaderNodeCombineXYZ');links.new(stops.outputs['Color'],offset.inputs['Y'])
    vector=nodes.new('ShaderNodeVectorMath');vector.operation='ADD'
    links.new(uv.outputs['UV'],vector.inputs[0]);links.new(offset.outputs[0],vector.inputs[1])
    links.new(vector.outputs['Vector'],texture.inputs['Vector'])
    paint=nodes.new('ShaderNodeVertexColor');paint.layer_name='COLOR_0'
    multiply=nodes.new('ShaderNodeMixRGB');multiply.blend_type='MULTIPLY';multiply.inputs[0].default_value=1
    links.new(texture.outputs['Color'],multiply.inputs[1]);links.new(paint.outputs['Color'],multiply.inputs[2])
    links.new(multiply.outputs[0],shader.inputs['Base Color'])
    cut=nodes.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.39
    links.new(texture.outputs['Alpha'],cut.inputs[0]);links.new(cut.outputs[0],shader.inputs['Alpha'])
    return mat


def leader(h):
    return Vector((.042*math.sin(h*.84)+h*.008,.035*math.sin(h*1.24+.15),h))


def build(group,mat):
    # Tapered dominant leader remains visible through the retained winter leaves.
    rng=random.Random(3597)
    trunk=Part('01 · 곧은 중심줄기와 밑동')
    heights=[0,.26,1.3,2.65,3.8,5.05,6.28,7.13,7.76]
    trunk.tube([leader(h) for h in heights],[.195,.147,.125,.111,.093,.073,.047,.025,.006],8,.98)
    trunk.finish(group,mat)
    limbs=[
        (2.88,1.69, .15, 19),(3.03,1.72, .05,102),(3.24,1.60, .27,195),(3.42,1.67, .20,286),
        (3.69,1.91, .48, 60),(3.94,1.94, .52,153),(4.19,1.85, .54,245),(4.45,1.91, .56,329),
        (4.72,1.76, .64, 87),(5.00,1.72, .68,182),(5.31,1.53, .75,272),(5.60,1.53, .82,354),
        (5.90,1.22, .91, 47),(6.17,1.10, .87,144),(6.42,.82,.78,236),(6.66,.67,.73,315)]
    for i,(h,length,rise,angle) in enumerate(limbs):
        a=math.radians(angle);out=Vector((math.cos(a),math.sin(a),0));side=Vector((-out.y,out.x,0))
        up=Vector((0,0,1));root=leader(h)
        elbow=root+out*length*.49+up*(rise*.76+(.27 if i<4 else .09))+side*rng.uniform(-.14,.14)
        end=root+out*length+up*rise+side*rng.uniform(-.20,.20)
        main=Part(f'{i+2:02d} · 곁줄기와 갈라진 잔가지')
        main.tube([root,elbow,end],[.067*(1-i*.036),.040*(1-i*.034),.009],4,.91+rng.random()*.07)
        tips=[(end,out)]
        for sign,f in [(-1,.37),(1,.65)]:
            site=root.lerp(elbow,f*2) if f<=.5 else elbow.lerp(end,(f-.5)*2)
            direction=normalized(out*rng.uniform(.52,.81)+side*sign*rng.uniform(.68,.91))
            tip=site+direction*length*(.70 if f<.5 else .46)+up*rise*.67
            bend=site.lerp(tip,.50)+up*(.12 if i<7 else .03)
            main.tube([site,bend,tip],[.039*(1-i*.037),.024,.006],3,.91)
            # Small, irregular persistent spurs remain recognizable on the March crown.
            for j,along in enumerate([.57]):
                branch=site.lerp(tip,along)
                small=branch+direction*.21+side*sign*(-1 if j else 1)*.17+up*(.19+rng.random()*.16)
                main.tube([branch,small],[.014,.003],3,.92)
            tips.append((tip,direction))
        main.finish(group,mat)
        leaves=Part(f'{i+2:02d} · 잎가지 모임')
        for tip,direction in tips:
            for j,(sideways,tall) in enumerate([(-.63,.48),(.57,.62),(.06,.92)]):
                start=tip-direction*((.53 if j==2 else .14)+rng.random()*.21)
                spread=side*sideways*(.71+rng.random()*.40)
                v=direction*(.19+rng.random()*.40)+spread+up*(tall*(.84+rng.random()*.42))
                if i<4 and j==0:v.z*=.34
                width=(1.48 if i<10 else 1.22)*(.78+rng.random()*.39)
                leaves.spray(start,v,width,1+rng.randrange(3),rng.uniform(-1.03,1.03),.87+rng.random()*.13)
        leaves.finish(group,mat)
    upper=Part('18 · 정수리와 곧게 자란 잎가지')
    for i in range(7):
        a=i*2.37;rad=Vector((math.cos(a),math.sin(a),0));up=Vector((0,0,1))
        start=leader(6.9+.085*i)
        tip=start+rad*(.36+.14*math.sin(i))+up*(.31+.05*(i%3))
        upper.tube([start,tip],[.028,.006],4,.93)
        upper.spray(tip,rad*.19+up*.72,.93,1+i%3,math.sin(i)*.91,.98)
    upper.finish(group,mat)
    height=max(v.co.z for o in group.objects for v in o.data.vertices)
    for o in group.objects:
        for v in o.data.vertices:v.co.z*=8/height
        o.data.update()


def build_distant():
    scene=bpy.data.scenes.new('먼 거리 · 대왕참나무')
    group=bpy.data.collections.new('SinbanpoPublicPinOakDistant')
    scene.collection.children.link(group)
    bark=bpy.data.materials.new('먼 수피');bark.diffuse_color=(.12,.10,.08,1)
    leaf=bpy.data.materials.new('먼 잎 무리');leaf.diffuse_color=(.12,.24,.08,1)
    # The principal leader and persistent limbs retain a silhouette after leaf drop.
    trunk=Part('먼 윤곽 · 중심줄기와 가지')
    trunk.tube([(0,0,0),(.015,0,3.2),(.042,.04,7.74)],[.16,.104,.009],4)
    groups=[(-.96,.62,4.42,1.20,1.38,.93),(.89,.82,4.65,1.20,1.36,.97),
            (.69,-1.14,4.53,1.14,1.37,.90),(-.86,-1.01,5.16,1.26,1.28,.99),
            (1.06,-.15,5.79,1.03,1.26,.98),(-.48,.77,6.24,.99,1.26,1.02),
            (-.06,-.22,6.82,.89,1.18,1.07)]
    for i,(x,y,z,r,h,shade) in enumerate(groups):
        base=(0,0,2.85+.405*i)
        trunk.tube([base,(x*1.29,y*1.29,z+.57)],[.060,.007],3)
    trunk.finish(group,bark)['shade']=0
    for i,(x,y,z,r,h,shade) in enumerate(groups):
        # Five uneven shoulders around one tapered clump; the seven clumps leave windows between them.
        vertices=[(x*.93,y*.93,z-h)]
        for j in range(5):
            angle=TAU*j/5+.39*i
            vertices.append((x+r*math.cos(angle),y+r*.93*math.sin(angle),z+.16*math.sin(angle*2+i)))
        vertices.append((x*.84,y*.86,z+h))
        faces=[]
        for j in range(5):
            a=1+j;b=1+(j+1)%5
            faces.extend([(0,b,a),(6,a,b)])
        mesh=bpy.data.meshes.new('먼 잎');mesh.from_pydata(vertices,[],faces);mesh.update()
        o=bpy.data.objects.new(f'먼 윤곽 · 잎 무리 {i+1}',mesh);group.objects.link(o)
        o.data.materials.append(leaf);o['shade']=shade


def export_outline():
    ramp=bpy.data.materials[MAT].node_tree.nodes['서울 달력과 거리뷰의 잎빛'].color_ramp
    calendar=[[round(e.position*1232),round(e.color[0]*8)] for e in ramp.elements]
    group=bpy.data.collections['SinbanpoPublicPinOakDistant']
    rows=[]
    for o in sorted(group.objects,key=lambda o:o.name):
        mesh=o.data;mesh.calc_loop_triangles()
        points=[]
        for v in mesh.vertices:
            p=o.matrix_world@v.co;points.extend(round(c*100) for c in (p.x,p.z,-p.y))
        rows.append([o['shade'],points,[i for t in mesh.loop_triangles for i in t.vertices]])
    path=HERE.parents[2]/'js/places/streets.js';code=path.read_text()
    begin='  // BEGIN PUBLIC PIN OAK OUTLINE\n';end='  // END PUBLIC PIN OAK OUTLINE'
    enc=lambda data:json.dumps(data,separators=(',',':'))
    fill='  const pinOakCalendar='+enc(calendar)+';\n  const pinOakDistant=[\n'
    fill+=''.join('    '+enc(row)+',\n' for row in rows)+'  ];\n'
    output=code[:code.index(begin)+len(begin)]+fill+code[code.index(end):]
    if output!=code:path.write_text(output)


def export():
    export_outline()
    group=bpy.data.collections[COLLECTION]
    mat=bpy.data.materials[MAT]
    tree=mat.node_tree;shader=tree.nodes.get('Principled BSDF');tex=tree.nodes['다섯 시기 원본']
    # Export the green UVs. The game offsets this one atlas when the date changes.
    tree.links.new(tree.nodes['원본 UV'].outputs['UV'],tex.inputs['Vector'])
    tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    objects=list(group.objects)
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();bpy.context.object.name='Surface'
    with tempfile.TemporaryDirectory() as tmp:
        raw=Path(tmp)/'pin-oak.glb'
        bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='EXPORT',
                                  export_vertex_color='ACTIVE',export_image_format='AUTO')
        subprocess.run(['node',str(HERE.parent/'sinbanpo-plaza-planters/pack.mjs'),str(raw),str(HERE/'pin-oak.glb')],check=True)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene;scene.name='신반포로 · 공도 대왕참나무'
    now=datetime.now(timezone(timedelta(hours=9)))
    scene[RELIEF_DATE]=now.month*100+now.day
    group=bpy.data.collections.new(COLLECTION);scene.collection.children.link(group)
    build(group,materials())
    build_distant()
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                space=area.spaces.active
                space.region_3d.view_distance=12.7
                space.region_3d.view_location=(0,0,3.9)
                space.shading.color_type='MATERIAL'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'pin-oak.blend'),compress=True)
export()
