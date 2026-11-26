"""Edit the saved pink-granite seat wall and hedging, then export the merged near view."""
import bpy
import json
import math
from pathlib import Path
import random
import subprocess
import sys
import tempfile
from mathutils import Vector

HERE = Path(__file__).resolve().parent
COLLECTION = "CentralCityEastSeatWall"
W, D = 13.0, 1.8
rng = random.Random(952)
TAU = math.tau


def grade_grid():
    # Original bed axes: native X along the frontage, native Y towards the sculpture court.
    js = """import {terminalPoint as P} from './js/places/sweet-park-plan.js';
import {relief} from './js/banpo_relief.js';
const mid=relief(...P(-27.5,31.5));
console.log(JSON.stringify(Array.from({length:17},(_,j)=>Array.from({length:53},(_,i)=>
 relief(...P(-27.5-(-1+j*.125),31.5-6.5+i*.25))-mid))));"""
    return json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=HERE.parents[2],text=True))


def grade(x,y):
    u=max(0,min(51.99999,(x+6.5)*4));v=max(0,min(15.99999,(y+1)*8))
    a,b=int(u),int(v);u-=a;v-=b
    return ((heights[b][a]*(1-u)+heights[b][a+1]*u)*(1-v)
            +(heights[b+1][a]*(1-u)+heights[b+1][a+1]*u)*v)


def color(rgb, factor=1):
    return tuple(min(1,((rgb>>shift)&255)/255*factor) for shift in (16,8,0))


def mesh(name, points, faces, tones, foliage=False):
    # The sloping planter follows the game's original footprint through each panel joint.
    m=bpy.data.meshes.new(name)
    m.from_pydata([(x,y,z+grade(x,y)) for x,y,z in points],[],faces)
    m.update()
    m.materials.append(paint)
    attr=m.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
    uv=m.uv_layers.new(name="석립과 잎")
    lo=[min(p[i] for p in points) for i in range(3)]
    for poly,tone in zip(m.polygons,tones):
        for j in poly.loop_indices:
            attr.data[j].color_srgb=(*tone,1)
            p=points[m.loops[j].vertex_index]
            axis_u,axis_v=(0,1) if abs(poly.normal.z)>.7 else ((0,2) if abs(poly.normal.y)>.7 else (1,2))
            # Keep the aggregate at one physical size on both the narrow fascia and the wide seat.
            a=(p[axis_u]-lo[axis_u])/1.58
            b=(p[axis_v]-lo[axis_v])/1.58
            if name in ('갈색 줄눈 바탕','안쪽 단의 검은 수평 홈'):a=b=.08
            uv.data[j].uv=((.51 if foliage else .01)+.48*a,.01+.98*b)
    ob=bpy.data.objects.new(name,m);group.objects.link(ob)


def block(name, x0,x1,y0,y1,z0,z1,base,bev=.007):
    # Two bevel rings give the broad exposed stone ledge a small sunlit return.
    verts=[]
    for z,shrink in [(z0,0),(z1-bev,0),(z1,bev)]:
        verts.extend([(x0+shrink,y0+shrink,z),(x1-shrink,y0+shrink,z),
                      (x1-shrink,y1-shrink,z),(x0+shrink,y1-shrink,z)])
    faces=[];tones=[]
    for j in range(2):
        for i in range(4):
            a=4*j+i;b=4*j+(i+1)%4
            faces.append((a,b,b+4,a+4));tones.append(color(base,1.014 if j else 1))
    faces.append((8,9,10,11));tones.append(color(base,1.025))
    mesh(name,verts,faces,tones)


def course(name,span,back,front,z0,z1,count,stagger,tones):
    # Full bed depth at the top exposes a continuous seating ledge, with real joints between stones.
    length=span*2;step=length/count
    ends=[-span]+[x for i in range(count+1) if -span+.1<(x:=-span+(i+stagger)*step)<span-.1]+[span]
    for i,(a,b) in enumerate(zip(ends,ends[1:])):
        block(f'{name} · 판재 {i+1:02}',a+.0025,b-.0025,back,front,z0,z1,tones[i%len(tones)])


def hedge(name,x0,x1):
    verts=[];faces=[];tones=[]
    # Clipped faces give the hedge its outline; only the small leaf tips cross it.
    y0,y1=-.69,.29;bottom=.646;top=.985
    for z,inset in [(bottom,.045),(top-.060,0),(top,.045)]:
        for i,(x,y) in enumerate([(x0,y0),(x1,y0),(x1,y1),(x0,y1)]):
            if x < -6.14:x+=inset
            elif x > 6.14:x-=inset
            else:x+=-.008 if i in (0,3) else .008
            verts.append((x,y+(inset if i<2 else -inset),z+rng.uniform(-.014,.014)))
    for j in range(2):
        for i in range(4):
            a=j*4+i;b=j*4+(i+1)%4;faces.append((a,b,b+4,a+4));tones.append(color([0x405131,0x4d6038][j],rng.uniform(.96,1.03)))
    faces.append((8,9,10,11));tones.append(color(0x536439,rng.uniform(.95,1.04)))
    for j in range(39):
        along=rng.uniform(x0+.012,x1-.012)
        if j%2:
            y=rng.uniform(y0+.03,y1-.03);z=top+rng.uniform(-.014,.030)
        else:
            y=y1+rng.uniform(-.018,.033);z=rng.uniform(bottom+.035,top-.035)
        rad=rng.uniform(.015,.040);angle=rng.uniform(0,TAU)
        dx,dy=rad*math.cos(angle),rad*math.sin(angle)
        n=len(verts)
        if j%2:
            verts.extend([(along-dx,y-dy,z),(along-dy*.46,y+dx*.46,z+.011),
                          (along+dx,y+dy,z+.018),(along+dy*.48,y-dx*.48,z+.005)])
            faces.extend([(n,n+2,n+1),(n,n+3,n+2)])
        else:
            verts.extend([(along-dx,y,z-dy),(along-dy*.46,y+.014,z+dx*.46),
                          (along+dx,y+.010,z+dy),(along+dy*.48,y+.008,z-dx*.48)])
            faces.extend([(n,n+1,n+2),(n,n+2,n+3)])
        tone=rng.choice([0x43572d,0x586d39,0x657946,0x516333,0x6b7749])
        tones.extend([color(tone),color(tone,.91)])
    mesh(name,verts,faces,tones,True)


def model():
    global heights
    heights=grade_grid()
    # A thin recessed backing stays visible through the five-millimetre vertical joints.
    block('갈색 줄눈 바탕',-6.49,6.49,-.892,.892,0,.411,0x796d5f)
    course('하단 기단',6.5,-.90,.90,.007,.142,10,.5,[0x997d6b,0xa18672,0x99806e])
    course('앉음벽 전면',6.5,-.90,.90,.147,.336,9,0,[0xb18f78,0xaa8975,0xb3927d,0xad8b77])
    course('넓은 앉음판',6.5,-.90,.90,.340,.420,10,.5,[0xbc9d87,0xb99b85,0xc0a18b])
    block('안쪽 단의 검은 수평 홈',-6.285,6.285,-.79,.415,.420,.487,0x50483f)
    course('화단의 상단 판석',6.31,-.80,.44,.486,.655,9,0,[0xb99b85,0xb69480,0xbd9c84])
    n=13;length=12.30/n
    for i in range(n):
        hedge(f'낮게 다듬은 생울타리 {i+1:02}',-6.15+i*length,-6.15+(i+1)*length)


def finish():
    mat=bpy.data.materials.new('홍빛 석립과 생울타리 정점색')
    mat.use_nodes=True
    nodes,link=mat.node_tree.nodes,mat.node_tree.links.new
    colors=nodes.new('ShaderNodeVertexColor');colors.layer_name='COLOR_0'
    tex=nodes.new('ShaderNodeTexImage');tex.name='Grain'
    im=bpy.data.images.new('화강석 석립 · 잎의 밝기',128,64,alpha=False)
    im.colorspace_settings.name='Non-Color'
    noise=random.Random(740);px=[]
    for y in range(64):
        for x in range(128):
            if x<64:
                val=noise.choices([.63,.78,.89,.96,1],[1,3,9,26,61])[0]
            else:
                val=noise.choices([.51,.70,.82,.95,1],[9,12,17,29,33])[0]
            px.extend([val,val,val,1])
    im.pixels.foreach_set(px);im.pack();tex.image=im
    mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    link(colors.outputs['Color'],mix.inputs[1]);link(tex.outputs['Color'],mix.inputs[2])
    shader=nodes.get('Principled BSDF');link(mix.outputs[0],shader.inputs['Base Color'])
    shader.inputs['Roughness'].default_value=.83
    return mat


def export():
    objs=list(bpy.data.collections[COLLECTION].objects)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join()
    surface=bpy.context.object;surface.name='Surface'
    nodes=surface.data.materials[0].node_tree
    nodes.links.new(nodes.nodes['Grain'].outputs['Color'],nodes.nodes['Principled BSDF'].inputs['Base Color'])
    with tempfile.TemporaryDirectory() as tmp:
        raw=Path(tmp)/'unpacked.glb'
        bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='EXPORT',export_vertex_color='ACTIVE')
        subprocess.run(['node',str(HERE.parent/'sinbanpo-plaza-planters/pack.mjs'),str(raw),str(HERE/'seatwall.glb')],check=True)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    group=bpy.data.collections.new(COLLECTION);bpy.context.scene.collection.children.link(group)
    paint=finish();model()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'seatwall.blend'),compress=True)
export()
