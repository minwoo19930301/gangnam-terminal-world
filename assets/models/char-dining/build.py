"""Native public dining fixtures and dishes for the upper Famille Cha R restaurant."""
from pathlib import Path
from math import sin,cos,tau,pi,sqrt
from random import Random
from mathutils import Vector
import bpy,sys,os,runpy,subprocess,json
here=Path(__file__).resolve().parent;sys.dont_write_bytecode=True;sys.path.insert(0,str(here.parents[2]/'tools'))
import blender_shop_mesh as m
bpy.ops.wm.read_factory_settings(use_empty=True)
source=bpy.context.scene;source.name='차알 FP218 · 편집 집기';source.unit_settings.system='METRIC'
spec=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import * as l from './layout.js';console.log(JSON.stringify(l))"],cwd=here))
parts=spec['parts'];tables=spec['tables'];subjects={}
palette={'black':'262725','oak':'844d31','lightwood':'b68452','wood':'6c3b2d','walnut':'553124','ledge':'574437','panel':'ad7546','cushion':'a44c38','red':'ad503e','darkred':'79362b','cream':'e9d6ae','white':'f1eada','porcelain':'eee5d2','tile':'282e2e','yellow':'d6ac5d','sage':'63766b','ink':'3d403c','metal':'959694','steel':'c0bab0','gold':'bab08a','brass':'a6874d','glass':'bcae88','paper':'ebe2c9','blue':'344b72','blue2':'587195','grain':'847962','granite':'c8b89c','warm':'ffedc7','blacktea':'775b38','pickles':'d28c38','pickles2':'dfa847','stock':'a34627','oil':'bd622b','chili':'983d27','noodle':'d9ac51','pork':'b49175','fat':'e0ccb3','beef':'a68a76','onion':'5b8747','leaf':'597640','rice':'dbbf89','egg':'e4b653','carrot':'c9844e','peas':'789459','sesame':'e5c38d','shrimp':'d99867','batter':'b77b3a','aubergine':'4d424a','sauce':'764b31','earth':'6f543c','pink':'be8d87'}
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
fp=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if p and Path(p).exists()),None)
if not fp:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean TTF or OTC')
font=bpy.data.fonts.load(fp)
for file in ['hall.py','seats.py','food.py','menu.py']:runpy.run_path(str(here/file),init_globals=dict(globals()))
bpy.data.fonts.remove(font);bpy.context.view_layer.update()
for c in subjects.values():
    for ob in c.all_objects:ob.location+=Vector(c['preview_origin']);ob.select_set(False)
bpy.context.view_layer.update();runpy.run_path(str(here/'assembly.py'),init_globals=dict(globals()))
bpy.context.preferences.filepaths.save_version=0;bpy.ops.wm.save_as_mainfile(filepath=str(here/'restaurant.blend'),compress=True)
runpy.run_path(str(here/'export.py'),run_name='__main__')
