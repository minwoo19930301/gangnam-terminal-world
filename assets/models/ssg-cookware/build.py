"""Mauviel 1830, Gangnam. Metres, local +Y away from the viewer."""
import bpy
import numpy as np
from math import cos, sin, pi, tau, exp
from mathutils import Vector
from pathlib import Path
import runpy

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.context.scene.unit_settings.system = 'METRIC'
room = bpy.data.collections.new('SSG_9F_Mauviel')
bpy.context.scene.collection.children.link(room)

def material(name, hexcode, finish):
    rgb = tuple((int(hexcode[i:i+2], 16)/255)**2.2 for i in (0,2,4))
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Metallic'].default_value = .34 if finish=='Metal' else 0
    shader.inputs['Roughness'].default_value = .22 if finish=='Metal' else .54
    m['finish'] = finish
    return m

oak = material('Honey ash', 'c5a782', 'Veneer')
edge = material('End grain', 'ad9068', 'Fixture')
ivory = material('Ivory shelf inlay', 'f3eee5', 'Fixture')
taupe = material('Champagne backing', 'b8ab99', 'Fixture')
ink = material('Dark enamel', '332d29', 'Fixture')
steel = material('Hammered stainless', 'e5e4df', 'Metal')
bright = material('Rolled polished steel', 'f0f1ee', 'Metal')
copper = material('Polished copper', 'f2ae88', 'Metal')
brass = material('Cast brass', 'edc17e', 'Metal')

# Seamless ash veneer. Use long, wandering earlywood lines on the board faces.
v,u=np.mgrid[0:128,0:512]
u=u/512*tau
v=v/128*tau
phase=21*v+1.2*np.sin(u+.4*np.sin(v))+.48*np.sin(3*u-v)
grain=.92+.035*np.cos(phase)-.095*np.maximum(np.cos(phase),0)**12+.027*np.sin(39*v+np.sin(2*u))
pixels=np.ones((128,512,4),dtype=np.float32)
for channel,value in enumerate((.80,.70,.57)):
    pixels[:,:,channel]=value*grain
veneer=bpy.data.images.new('Ash veneer',width=512,height=128,alpha=False)
veneer.pixels.foreach_set(pixels.ravel())
veneer.pack()
tex=oak.node_tree.nodes.new('ShaderNodeTexImage')
tex.image=veneer
oak.node_tree.links.new(tex.outputs['Color'],oak.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])

def mesh(name, verts, faces, mat, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.materials.append(mat)
    obj = bpy.data.objects.new(name,data)
    room.objects.link(obj)
    if smooth:
        for f in data.polygons: f.use_smooth=True
    return obj

def shelf(name,x,y,z,w,d,h,r,mat):
    points=[]
    for cx,cy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(6):
            a=(start+i*18)*pi/180
            points.append((x+cx*(w/2-r)+r*cos(a),y+cy*(d/2-r)+r*sin(a)))
    n=len(points)
    verts=[(a,b,Z) for Z in [z,z+h] for a,b in points]
    faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    obj=mesh(name,verts,faces,mat)
    if mat==oak:
        uv=obj.data.uv_layers.new(name='Grain')
        for face in obj.data.polygons:
            for idx in face.loop_indices:
                px,py,pz=obj.data.vertices[obj.data.loops[idx].vertex_index].co
                if abs(face.normal.z)>.7:
                    coords=(px/1.5,py/.35)
                elif h>.6:
                    coords=(pz/1.5,(py+px)/.35)
                else:
                    coords=((px+py)/1.5,pz/.35)
                uv.data[idx].uv=coords
    return obj

def text(name,body,x,y,z,size,mat):
    data=bpy.data.curves.new(name,'FONT')
    data.body=body
    data.align_x='CENTER'
    data.size=size
    data.resolution_u=4
    obj=bpy.data.objects.new(name,data)
    room.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    data.materials.append(mat)
    bpy.context.view_layer.objects.active=obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)

def sweep(name,path,mat,n=8):
    # Elliptical sections along a cast handle or escutcheon.
    verts=[]
    for i,(point,w,h) in enumerate(path):
        direction=(Vector(path[min(i+1,len(path)-1)][0])-Vector(path[max(0,i-1)][0])).normalized()
        across=Vector((0,0,1)).cross(direction).normalized()
        up=direction.cross(across)
        for j in range(n):
            a=tau*j/n
            verts.append(Vector(point)+across*(w*cos(a))+up*(h*sin(a)))
    faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j)
           for k in range(len(path)-1) for j in range(n)]
    faces.extend([tuple(reversed(range(n))),tuple(range(len(verts)-n,len(verts)))])
    return mesh(name,verts,faces,mat,True)

def rolled(name,cx,cy,base,profile,mat,hammer=False):
    # Bake broad bands of reflected cabinetry into vertex colour for the game lighting.
    n=56 if hammer else 48
    verts=[]; shades=[]
    for row,(r,z) in enumerate(profile):
        for j in range(n):
            a=tau*j/n
            rr=r
            beating=1
            if hammer and 0<row<len(profile)-2:
                beat=cos(18*a+(row%2)*pi)*cos(.23*row+.18*sin(3*a))
                rr+=.00065*beat
                beating=.83+.17*beat
            verts.append((cx+rr*cos(a),cy+rr*sin(a),base+z))
            stripe=(.54+.28*cos(2*a+.22)+.12*sin(5*a-.4)+.20*exp(-(cos(3*a+.34)/.29)**2))
            shade=min(1,.11+stripe*beating+.14*sin(row*.73)+.22*exp(-((a-4.7)/.17)**2))
            shades.append(shade)
    faces=[(k*n+j,k*n+(j+1)%n,(k+1)*n+(j+1)%n,(k+1)*n+j)
           for k in range(len(profile)-1) for j in range(n)]
    obj=mesh(name,verts,faces,mat,True)
    tint=obj.data.color_attributes.new(name='Tint',type='BYTE_COLOR',domain='POINT')
    for item,f in zip(tint.data,shades):
        item.color=tuple(c*f for c in mat.diffuse_color[:3])+(1,)
    return obj

def pot(label,x,y,z,r,h,kind,angle,cu=False,lid=False):
    metal=copper if cu else steel
    grip=brass if cu else bright
    foot={'braiser':.68,'pan':.68,'sauce':.89}[kind]
    # Outer wall, tiny flange rolled over into the interior, and dished cooking floor.
    profile=[(.001,0),(foot*r,0)]
    for k in range(1,9):
        t=k/8
        profile.append((r*(foot+(1-foot)*t**.65),h*t))
    profile += [(r+.002,h+.0025),(r+.003,h+.004),(r-.001,h+.0045)]
    rolled(label+' exterior',x,y,z,profile,metal,not cu)
    rolled(label+' lining',x,y,z,[(r-.001,h+.0045),(r-.002,h-.001),
           (r*(foot+(1-foot)*.72)-.003,h*.7),(r*foot,.009),(foot*r,.005),(.0002,.005)],bright)
    def point(dx,dy,dz):
        return (x+dx*cos(angle)-dy*sin(angle),y+dx*sin(angle)+dy*cos(angle),z+dz)
    def handle(name,coords,m=grip):
        sweep(label+' '+name,[(point(a,b,c),w,t) for a,b,c,w,t in coords],m)
    for side in ([1,-1] if kind=='braiser' else [1]):
        H=h*.7
        # The plate hugs the curved wall and secures both ends with domed rivets.
        wall=r*(foot+(1-foot)*.7**.65)
        coords=[(side*((wall*wall-q*q)**.5+.002),q,H,.004,.008+.010*(1-abs(q)/.036)) for q in [-.036,-.030,-.014,0,.014,.030,.036]]
        handle('cast lug',coords)
        for q in [-.026,.026]:
            for face in [-1,1]:
                start=(wall*wall-q*q)**.5+.002+face*.003
                handle('rivet',[(side*(start+face*l),q,H,w,w) for l,w in [(0,.0048),(.002,.005),(.004,.002)]],bright)
        if kind=='braiser':
            coords=[]
            for k in range(13):
                a=pi*k/12
                coords.append((side*(wall-.002+.054*sin(a)),.032*cos(a),H+.031*sin(a),.0055,.0048))
            handle('cast ear',coords)
        else:
            length=r*1.48
            handle('shank',[(wall+.002+t*(length+r-wall),0,H+lift,w,thick) for t,lift,w,thick in
                 [(0,0,.016,.011),(.10,.014,.013,.009),(.19,.033,.009,.006),(.50,.047,.010,.005),
                  (.82,.056,.013,.005),(1,.066,.013,.005)]])
            # Cast hanging eye, outside the solid grip tip.
            coords=[]
            for k in range(17):
                a=tau*k/16
                coords.append((r+length+.007+.011*cos(a),.008*sin(a),H+.066,.003,.0035))
            handle('hanging eye',coords)
    if lid:
        dome=.48*r if kind=='braiser' else .12*r
        prof=[(r*1.025,h+.003),(r*1.036,h+.006),(r*1.01,h+.008),(r*.94,h+.007)]
        for k in range(1,11):
            a=k*pi/20
            prof.append((max(.0003,r*.94*cos(a)),h+.007+dome*sin(a)))
        rolled(label+' lid',x,y,z,prof,metal)
        H=h+.006+dome
        handle('lid bridge',[(a,0,H+b,w,t) for a,b,w,t in
            [(-.036,-.003,.009,.003),(-.026,.001,.008,.004),(-.019,.020,.006,.004),
             (-.012,.024,.006,.004),(.012,.024,.006,.004),(.019,.020,.006,.004),
             (.026,.001,.008,.004),(.036,-.003,.009,.003)]])

levels=[.39,.72,1.05,1.38]
for cx in [-.475,.475]:
    shelf('Recessed foot',cx,0,.0,.87,.45,.055,.04,ink)
    shelf('Drawer case',cx,0,.055,.93,.50,.32,.045,oak)
    shelf('Champagne rear panel',cx,.225,.36,.91,.036,1.04,.012,taupe)
    for side in [-1,1]:
        shelf('Rounded oak standard',cx+side*.437,0,.35,.055,.43,1.05,.024,oak)
    for H in levels:
        shelf('Rounded bullnose',cx,0,H-.041,.938,.515,.041,.066,oak)
        shelf('Inset ivory tray',cx,-.004,H,.89,.472,.008,.056,ivory)
    shelf('Drawer lip',cx,-.251,.283,.28,.024,.012,.008,edge)

for row,H in enumerate(levels[:3]):
    for i,(off,r) in enumerate([(-.206,.127),(.195,.142)]):
        pot('M ELITE braiser %d-%d'%(row,i),-.475+off,-.022,H+.008,r,.105-row*.008,'braiser',-.20+.12*i,lid=True)
    for i,(off,r) in enumerate([(-.205,.109),(.182,.126)]):
        pot('M ELITE '+('saucepan' if row==2 else 'frying pan')+str((row,i)),
            .475+off,-.045,H+.008,r, (.105 if row==2 else .043+i*.007),
            'sauce' if row==2 else 'pan',.52+.2*i,lid=row==2)

for i,(x,r,covered) in enumerate([(-.68,.121,True),(-.21,.10,False),(.26,.122,True),(.65,.094,False)]):
    pot('M HERITAGE comparison '+str(i+1),x,-.054,1.388,r,r*.92,'sauce',[-.32,.74,-.39,.63][i],True,covered)
shelf('Brand plaque',0,.19,1.39,.50,.028,.26,.008,ink)
text('Maker signature','Mauviel',0,.174,1.554,.083,ivory)
text('Founding year','1 8 3 0',0,.174,1.517,.029,ivory)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'showroom.blend'),compress=True)
runpy.run_path(str(OUT/'export.py'))
