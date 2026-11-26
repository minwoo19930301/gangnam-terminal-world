"""Editable reconstruction of the public dining room shown in the G010 directory photograph."""
from pathlib import Path
from math import sin,cos,tau,pi,sqrt
from random import Random
from mathutils import Vector
import bpy,sys,os,runpy,subprocess,json
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
source=bpy.context.scene;source.name='마당 G-010 · 편집 집기';source.unit_settings.system='METRIC'
spec=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import * as l from './layout.js';console.log(JSON.stringify(l))"],cwd=here))
parts=spec['parts'];tables=spec['tables'];subjects={}
palette={'red':'b75b4c','brick':'a95045','wall':'eeeee5','stone':'d5d6ce','grout':'adada6','floor':'74777a','tile':'797c7c','tile2':'72777a','white':'f6f3e8','cream':'e9d9b7','ledge':'af9475','oak':'c8a569','wood':'b78754','edge':'a27e52','grain':'bb935a','black':'303338','steel':'b3bab8','bright':'d5dcda','darksteel':'768080','inside':'545e60','gold':'b39450','cushion':'a44945','piping':'963a38','screen':'696d62','blue':'6b889b','dish':'e4dfc9','rice':'ece0ba','toast':'d2bb8e','batter':'e7cd77','fry':'c6a255','yolk':'e4ad32','green':'628359','leaves':'829356','stalk':'b2aa71','carrot':'d48d46','pepper':'984c3d','miso':'805341','soil':'685241','porcelain':'ebe9d9','ink':'3e4649','sienna':'a36645'}
for k,v in palette.items():m.palette[k]=m.material(k,v,.66 if k in ('bright','steel') else .43 if k=='gold' else 0)
B,C=m.block,m.profile
def part(key):
    c=bpy.data.collections.new(parts[key][0]);source.collection.children.link(c);subjects[key]=c
    c['preview_origin']=((len(subjects)-1)%4*8,(len(subjects)-1)//4*8,0);m.group=c;return c
def section(c,label):s=bpy.data.collections.new(label);c.children.link(s);m.group=s
def smooth(o):
    for f in o.data.polygons:
        if len(f.vertices)<=4:f.use_smooth=True
    return o
def tube(n,v,r,c,k=7):return smooth(m.rod(n,v,r,c,k))
def sphere(name,x,d,z,rx,rd,rz,c,n=16,k=8):
    vs=[];fs=[]
    for j in range(k+1):
        a=pi*(j/k-.5)
        for i in range(n):
            b=tau*i/n;vs.append((x+rx*cos(a)*cos(b),d+rd*cos(a)*sin(b),z+rz*sin(a)))
        if j:
            for i in range(n):
                v=(j-1)*n;fs.append((v+i,v+(i+1)%n,v+n+(i+1)%n,v+n+i))
    return smooth(m.piece(name,vs,fs,c))
def panel(label,x,d,z,pts,c,face='front',dep=.005):
    n=len(pts)
    def pt(a,h,f):return (x+a,d+f,z+h) if face=='front' else (x+f,d+a,z+h)
    v=[pt(a,b,f) for f in (0,dep) for a,b in pts]
    return m.piece(label,v,[tuple(range(n)),tuple(range(2*n-1,n-1,-1))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],c)
def text(label,body,x,d,z,size,c,side='front',font=None):
    a=bpy.data.curves.new(label,'FONT');a.body=body;a.size=size;a.align_x='CENTER';a.align_y='CENTER';a.resolution_u=3;a.extrude=.0006
    if font:a.font=font
    ob=bpy.data.objects.new(label,a);m.group.objects.link(ob);a.materials.append(m.palette[c]);ob.location=(x,-d,z);ob.rotation_euler=(pi/2,0,pi if side=='front' else -pi/2 if side=='left' else pi/2)
    ob.select_set(True);bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH');ob.select_set(False)
fp=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).exists()),None)
if not fp:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean TTF or OTC')
font=bpy.data.fonts.load(fp)
for file in ['dining.py','service.py','food.py']:runpy.run_path(str(here/file),init_globals=dict(globals()))
bpy.data.fonts.remove(font);bpy.context.view_layer.update()
for c in subjects.values():
    for ob in c.all_objects:ob.location+=Vector(c['preview_origin']);ob.select_set(False)
bpy.context.view_layer.update();runpy.run_path(str(here/'assembly.py'),init_globals=dict(globals()))
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(here/'madang.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
