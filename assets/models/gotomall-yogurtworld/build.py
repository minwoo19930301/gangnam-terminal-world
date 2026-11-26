"""Model G-012 in public shop coordinates. Native parts and their assembled metric scene share the game layout."""
from pathlib import Path
from math import pi,tau,sin,cos,sqrt
from random import Random
import bpy,sys,os,subprocess,runpy,json
from mathutils import Vector,Matrix
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='G-012 · 편집할 점포 집기';scene.unit_settings.system='METRIC'
layout=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import * as l from './layout.js';console.log(JSON.stringify(l))"],cwd=here))
names=layout['names'];anchors=layout['anchors']
colors={'white':'f6f5ef','porcelain':'e8ede8','edge':'d7ddd7','cream':'eee7d3','stone':'d5c9ac','floor':'a9aba3','grout':'7e8179','tileAlt':'a3a7a1','wall':'eee8da','warm':'fce3a4','wood':'b29060','oak':'cca56c','end':'977548','pale':'d7c7a4','steel':'b5bcb8','chrome':'d2d6cf','dark':'333a3c','black':'151c23','navy':'172f58','blue':'0875c7','cyan':'4daee9','sky':'80cce2','glass':'c8ddd9','paper':'f0eadd','pink':'d48296','palePink':'f1c4ce','brown':'996a43','coffee':'544437','midnight':'252e49','berry':'434966','bloom':'6b7188','milk':'f0e4c8','yogurt':'f7eed9','oat':'c8aa70','grain':'a68653','seed':'d2ba86','mango':'efb137','mangoLit':'f9cc57','fruit':'d69a23','honey':'a76b25','amber':'d6a041','gold':'cfad60','wax':'b8833d','leaf':'448058','leafB':'326449','vein':'669363','red':'a74449','petal':'c95155','soil':'67523c'}
for k,v in colors.items():m.palette[k]=m.material(k,v,.58 if k in ('steel','chrome') else 0)
g=m.palette['glass'];g.diffuse_color=(*g.diffuse_color[:3],.08)
bsdf=g.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Transmission Weight'].default_value=.85;bsdf.inputs['Roughness'].default_value=.065;bsdf.inputs['Alpha'].default_value=.08
B,C=m.block,m.profile
def smooth(o):
    for f in o.data.polygons:
        if len(f.vertices)<=4:f.use_smooth=True
    return o
def tube(n,points,r,c,segs=8):return smooth(m.rod(n,points,r,c,segs))
def ball(name,x,d,h,rx,rd,rz,c,n=15,k=8):
    verts=[(x+rx*cos(tau*i/n)*cos(-pi/2+pi*j/k),d+rd*sin(tau*i/n)*cos(-pi/2+pi*j/k),h+rz*sin(-pi/2+pi*j/k)) for j in range(k+1) for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(k) for i in range(n)]
    return smooth(m.piece(name,verts,faces,c))
subjects={}
def part(key):
    c=bpy.data.collections.new('요거트월드 · '+names[key]);scene.collection.children.link(c);subjects[key]=c
    c['preview_origin']=(len(subjects)%5*8,len(subjects)//5*8,0);m.group=c;return c
def section(parent,name):
    c=bpy.data.collections.new(name);parent.children.link(c);m.group=c
def text(name,body,x,d,h,size,color,font=None,face='front',depth=.0015):
    fontdata=bpy.data.curves.new(name,'FONT');fontdata.body=body;fontdata.align_x='CENTER';fontdata.align_y='CENTER';fontdata.size=size;fontdata.resolution_u=4;fontdata.extrude=depth
    if font:fontdata.font=font
    o=bpy.data.objects.new(name,fontdata);m.group.objects.link(o);fontdata.materials.append(m.palette[color]);o.location=(x,-d,h)
    o.rotation_euler=(pi/2,0,pi if face=='front' else -pi/2 if face=='right' else 0 if face=='back' else pi/2)
    o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');o.select_set(False);return o
def spin_group(objects,x,d,z,turn):
    bpy.context.view_layer.update();mat=Matrix.Translation((x,-d,z))@Matrix.Rotation(turn,4,'Z')
    for o in objects:o.matrix_world=mat@o.matrix_world
font_path=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).exists()),None)
if not font_path:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean font')
font=bpy.data.fonts.load(font_path)
for script in ['shop.py','seats.py','yogurt.py']:runpy.run_path(str(here/script),init_globals=dict(globals()))
bpy.data.fonts.remove(font);bpy.context.view_layer.update()
for c in subjects.values():
    for o in c.all_objects:o.location+=Vector(c['preview_origin']);o.select_set(False)
    c['근거']='고투몰 상점 사진, 네이버 지점과 방문 사진. 가구 상세 치수·수량은 추정.'
bpy.context.view_layer.update();runpy.run_path(str(here/'assembly.py'),init_globals=dict(globals()))
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(here/'g012.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
