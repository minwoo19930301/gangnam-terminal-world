"""Blender background authoring and --export-current for the park bench and arch."""
import bpy
import json
import math
import sys
from mathutils import Vector
from pathlib import Path

OUT=Path(__file__).resolve().parent
WOOD=[0x926A45,0xA57950,0x8B6546,0xA77D55]
METAL=0x42504D
BRICK=[0x9E6048,0xA5654C,0x925C49,0xAA6951,0x8E5645]
FRAME=0x35413F


def collection(name, origin):
    g=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(g)
    g["model"]=name;g["origin"]=origin
    return g


def mesh(group,name,points,faces,color):
    mat=bpy.data.materials.get(f"{color:06x}")
    if not mat:
        mat=bpy.data.materials.new(f"{color:06x}")
        mat.diffuse_color=[((color>>s&255)/255)**2.2 for s in (16,8,0)]+[1.]
    data=bpy.data.meshes.new(name)
    data.from_pydata([(x,-z,y) for x,y,z in points],[],faces)
    data.materials.append(mat);data.update()
    obj=bpy.data.objects.new(name,data);obj.location=group["origin"];group.objects.link(obj)
    return obj


def board(g,name,x,y,z,width,height,depth,color,bevel=0,tilt=0):
    # Chamfer the edges a hand meets, with the long timber grain parallel to X.
    w,h,d=width/2,height/2,depth/2
    b=min(bevel,h*.85,d*.85)
    cross=[(-h,-d+b),(-h+b,-d),(h-b,-d),(h,-d+b),(h,d-b),(h-b,d),(-h+b,d),(-h,d-b)]
    if not b: cross=[(-h,-d),(h,-d),(h,d),(-h,d)]
    coords=[];c,s=math.cos(tilt),math.sin(tilt)
    for dx in [-w,w]:
        coords.extend((x+dx,y+dy*c-dz*s,z+dy*s+dz*c) for dy,dz in cross)
    n=len(cross)
    faces=[tuple(reversed(range(n))),tuple(range(n,n*2))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    obj=mesh(g,name,coords,faces,color)
    if "목재" in name: obj["surface"]="timber"
    return obj


def tube(g,name,points,radius,color,segments=6):
    points=[Vector(p) for p in points];vs=[];fs=[]
    for i,p in enumerate(points):
        axis=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
        u=axis.cross(Vector((1,0,0)) if abs(axis.x)<.95 else Vector((0,0,1))).normalized()
        v=axis.cross(u)
        for j in range(segments):
            a=math.tau*j/segments;vs.append(p+radius*(math.cos(a)*u+math.sin(a)*v))
    for i in range(len(points)-1):
        for j in range(segments):
            a=i*segments+j;b=i*segments+(j+1)%segments
            fs.append((a,b,b+segments,a+segments))
    return mesh(g,name,vs,fs,color)


def bench(g):
    for i in range(4):
        board(g,"좌판 목재 "+str(i+1),0,.46,(i-1.5)*.126,1.90,.072,.105,WOOD[i],.012)
    for i in range(3):
        board(g,"등받이 목재 "+str(i+1),0,.63+i*.13,.228+i*.020,1.90,.105,.055,WOOD[(i+1)%4],.009,.15)
    for side in [-1,1]:
        x=side*.68
        tube(g,"도장 강관 다리",[(x,.035,-.21),(x,.37,-.16),(x,.407,-.12),
            (x,.407,.14),(x,.375,.185),(x,.035,.24)],.027,METAL,8)
        tube(g,"등받이 지지대",[(x,.34,.14),(x,.49,.225),(x,.92,.292)],.025,METAL,6)
        for z in [-.21,.24]:
            board(g,"고정용 받침",x,.019,z,.13,.032,.10,0x444D48,.007)
        # Curved side handholds; clear seat width stays over 1.6 m between the end arms.
        x=side*.81
        tube(g,"곡선 팔걸이",[(x,.405,-.15),(x,.61,-.13),(x,.67,-.08),
            (x,.684,.12),(x,.63,.19),(x,.42,.205)],.019,0x52625F,7)
    board(g,"좌판 하부 연결대",0,.378,.020,1.43,.052,.059,METAL,.005)


def wedge(g,name,r0,r1,lo,hi,back,front,color):
    xy=[(r0*math.cos(lo),3+r0*math.sin(lo)),(r1*math.cos(lo),3+r1*math.sin(lo)),
        (r1*math.cos(hi),3+r1*math.sin(hi)),(r0*math.cos(hi),3+r0*math.sin(hi))]
    coords=[(x,y,z) for z in (back,front) for x,y in xy]
    faces=[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    mesh(g,name,coords,faces,color)


def arch(g):
    r=1.075
    for i in range(21):
        a,b=math.pi*i/21,math.pi*(i+1)/21
        wedge(g,"아치 벽돌 %02d"%(i+1),r+.020,r+.210,a+.006,b-.006,.111,.193,BRICK[(i*7+i//3)%len(BRICK)])
    for i in range(18):
        a,b=math.pi*i/18,math.pi*(i+1)/18
        wedge(g,"주철 아치 프레임",r-.055,r+.018,a,b,.012,.099,FRAME)
    for side in [-1,1]:
        x=side*(r+.075)
        for j in range(15):
            board(g,"벽돌 측면 턱",x,.102+j*.2,.149,.143,.188,.069,BRICK[(j+(2 if side<0 else 0))%5])
    for x,width in [(-r,.084),(0,.053),(r,.084)]:
        board(g,"세로 창살",x,1.50,.048,width,3,.09,FRAME)
    for y in [.035,2.15,3.0]:
        board(g,"가로 창살",0,y,.052,2.15,.060,.093,FRAME,.006)
    for a in [math.pi*.25,math.pi*.5,math.pi*.75]:
        tube(g,"방사형 쇠창살",[(0,3,.051),(r*math.cos(a),3+r*math.sin(a),.051)],.025,FRAME,6)
    for i in range(3):
        board(g,"석재 창대", (i-1)*.83,-.055,.128,.821,.118,.31,0x8A8174,.014)


def export():
    out={}
    graph=bpy.context.evaluated_depsgraph_get()
    for g in bpy.data.collections:
        if not g.get("model"): continue
        vs=[];parts=[];slots=[];timber=set()
        for obj in sorted((o for o in g.objects if o.type=="MESH"),key=lambda o:o.name):
            evaluated=obj.evaluated_get(graph);m=evaluated.to_mesh()
            try:
                off=len(vs)//3
                for v in m.vertices:
                    x,y,z=evaluated.matrix_world@v.co-Vector(g["origin"])
                    vs.extend(round(n*1000) for n in (x,z,-y))
                m.calc_loop_triangles()
                for t in m.loop_triangles:
                    rgb=m.materials[t.material_index].diffuse_color[:3]
                    color=sum(round(min(1,max(0,v))**(1/2.2)*255)<<s for v,s in zip(rgb,(16,8,0)))
                    if color not in slots: slots.append(color)
                    index=slots.index(color)
                    if obj.get("surface")=="timber": timber.add(index)
                    parts.extend([*(i+off for i in t.vertices),index])
            finally: evaluated.to_mesh_clear()
        out[g["model"]]=[slots,vs,parts,sorted(timber)]
    (OUT/"meshes.js").write_text("// Blender export. XYZ millimetres, face records [a,b,c,slot].\nexport const furniture = "+
        json.dumps(out,separators=(",",":"))+";\n")


if "--export-current" not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bench(collection("bench",(0,0,0)));arch(collection("arch",(4,0,0)))
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"riverside-furniture.blend"),compress=True)
export()
