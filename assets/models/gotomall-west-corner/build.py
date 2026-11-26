"""Blender originals for two photographed storefronts around the G-012 corner."""
from pathlib import Path
from random import Random
from math import cos, sin, pi, tau, sqrt
import bpy, json, os, runpy, subprocess, sys
from mathutils import Vector, Matrix
here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.name='서편 G열 · 진열 편집'
scene.unit_settings.system='METRIC'
parts=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {parts} from './layout.js';console.log(JSON.stringify(parts))"],cwd=here))
colors={'ivory':'ece9df','cream':'e5d9b8','paper':'f1eee0','white':'f7f7f0','wall':'e1ded4','tile':'a9a69e','tile2':'bab6ab','line':'939189','metal':'a6aca9','chrome':'d0d8d2','charcoal':'34383e','ink':'202833','navy':'324965','sea':'71b3c9','cyan':'9bdbde','pool':'a2dfef','blue':'729fcc','purple':'afa3bf','mint':'83a78f','pink':'e5acb7','rose':'cb7176','red':'c43636','lit':'ff7854','inner':'9f3740','yellow':'ead27c','foil':'d2ccba','leaf':'628260','oak':'bb9569','brown':'987453','card':'b79970','edge':'cfb389','bag':'e5e2d3','olive':'899380','slate':'67727a','cloth':'ded7c8','black':'32383e','denim':'596878','lilac':'b2a7b8','peach':'d3a993','screen':'e4e8d8','mirror':'a9b8b8','glass':'d0dcdb','petal':'c48688','gold':'bd9e5b','teal':'4fa5ae','grey':'858484','strip':'dcd4bf','glossPink':'f3e8ef','glossWhite':'faf8f3','pumpkin':'e79959'}
for k,v in colors.items():m.palette[k]=m.material(k,v,.65 if k in ('chrome','metal','mirror','foil') else 0)
B,C=m.block,m.profile
sources={}
def part(key):
    c=bpy.data.collections.new(parts[key][0]);scene.collection.children.link(c);m.group=c;sources[key]=c
    c['preview_origin']=(len(sources)%4*9,len(sources)//4*8,0)
    return c
def sub(c,name):
    child=bpy.data.collections.new(name);c.children.link(child);m.group=child
def smooth(o):
    for f in o.data.polygons:
        if len(f.vertices)<=4:f.use_smooth=True
    return o
def tube(label,points,r,c,n=7):return smooth(m.rod(label,points,r,c,n))
def ellipse(label,x,d,h,rx,rd,rz,color,n=15,k=8):
    verts=[];faces=[]
    for j in range(k+1):
        lat=pi*(j/k-.5)
        for i in range(n):
            t=tau*i/n;verts.append((x+rx*cos(lat)*cos(t),d+rd*cos(lat)*sin(t),h+rz*sin(lat)))
    for j in range(k):
        for i in range(n):faces.append((j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i))
    return smooth(m.piece(label,verts,faces,color))
def front_poly(label,x,d,z,points,color,depth=.005):
    n=len(points)
    verts=[(x+a,d+b,z+v) for b in (0,depth) for a,v in points]
    faces=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    return m.piece(label,verts,faces,color)
def text(label,body,x,d,h,size,c,font=None,rotation=0,depth=.001,scale=1):
    cu=bpy.data.curves.new(label,'FONT');cu.body=body;cu.align_x='CENTER';cu.align_y='CENTER';cu.size=size;cu.extrude=depth;cu.resolution_u=3
    if font:cu.font=font
    ob=bpy.data.objects.new(label,cu);cu.materials.append(m.palette[c]);m.group.objects.link(ob);ob.location=(x,-d,h);ob.rotation_euler=(pi/2,0,pi+rotation);ob.scale.x=scale
    ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');ob.select_set(False);return ob
def rodloop(n,pts,r,c):return tube(n,pts+[pts[0]],r,c,6)
def move(ob,rotation,x,d,h):
    bpy.context.view_layer.update()
    ob.matrix_world=Matrix.Translation((x,-d,h))@Matrix.Rotation(rotation,4,'Z')@ob.matrix_world
fontpath=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).exists()),None)
if not fontpath:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean TTF or OTC.')
font=bpy.data.fonts.load(fontpath)
for filename in ['ban.py','hama.py']:runpy.run_path(str(here/filename),init_globals=dict(globals()))
bpy.data.fonts.remove(font);bpy.context.view_layer.update()
for key,c in sources.items():
    for ob in c.all_objects:ob.location+=Vector(c['preview_origin']);ob.select_set(False)
bpy.context.view_layer.update()
runpy.run_path(str(here/'assembly.py'),init_globals=dict(globals()))
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(here/'west-corner.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
