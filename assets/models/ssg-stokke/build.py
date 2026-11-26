"""Build the editable collection in metres. Chair fronts point to Blender -Y."""
from pathlib import Path
from math import sin, cos, pi, radians
import bpy
import bmesh
from mathutils import Matrix, Vector

OUT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
gallery = bpy.data.collections.new('SSG_10F_Stokke')
bpy.context.scene.collection.children.link(gallery)
transform = Matrix.Identity(4)
prefix = ''
pieces = {}
palette = {
    'honey':'CDA575', 'beech':'DDB382', 'endgrain':'AF8357', 'fjord':'577C80',
    'moss':'899778', 'rose':'C68A77', 'cream':'F0E6D2', 'ink':'293D39',
    'walnut':'826448', 'aluminium':'A9AAA4', 'shadow':'535348',
    'glacier':'C9D9CF', 'terracotta':'AB5D46', 'white':'F8F3E8'
}
materials = {}
def linear(c):
    s = int(c,16)/255
    return s/12.92 if s < .04045 else ((s+.055)/1.055)**2.4

def finish(name):
    if name not in materials:
        rgb = palette[name]
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*[linear(rgb[i:i+2]) for i in (0,2,4)],1)
        m.use_nodes = True
        node=m.node_tree.nodes.get('Principled BSDF')
        node.inputs['Base Color'].default_value=m.diffuse_color
        node.inputs['Roughness'].default_value=.49
        materials[name]=m
    return materials[name]

def part(name, vertices, faces, color, bevel=0):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(vertices,[],faces)
    bm=bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    if bevel:
        edges=[e for e in bm.edges if e.is_manifold and e.calc_face_angle()>.4]
        bmesh.ops.bevel(bm,geom=edges,offset=bevel,segments=2,affect='EDGES',clamp_overlap=True)
    bm.to_mesh(mesh)
    bm.free()
    ob=bpy.data.objects.new(prefix+name,mesh)
    gallery.objects.link(ob)
    mesh.materials.append(finish(color))
    ob.matrix_world=transform.copy()
    pieces.setdefault('StokkeChairs' if prefix else 'StokkeDisplay',[]).append(ob)
    return ob

def skins(name, rings, color, bevel=0):
    n=len(rings[0])
    faces=[list(reversed(range(n)))]
    for k in range(len(rings)-1):
        for i in range(n):
            a=k*n+i
            b=k*n+(i+1)%n
            faces.append((a,b,b+n,a+n))
    faces.append([n*(len(rings)-1)+i for i in range(n)])
    return part(name,[p for ring in rings for p in ring],faces,color,bevel)

def outline(w,d,r):
    pts=[]
    for x,y,a in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for j in range(5):
            t=radians(a+22.5*j)
            pts.append((x*(w/2-r)+r*cos(t),y*(d/2-r)+r*sin(t)))
    return pts

def plate(name,x,y,z,w,d,h,r,col):
    loop=outline(w,d,r)
    return skins(name,[[(x+i,y+j,k) for i,j in loop] for k in [z,z+h]],col,min(.004,h*.14))

def rod(name,a,b,r,col):
    a,b=Vector(a),Vector(b)
    q=(b-a).to_track_quat('Z','Y')
    ring=[q@Vector((r*cos(t*pi/8),r*sin(t*pi/8),0)) for t in range(16)]
    return skins(name,[[p+v for v in ring] for p in [a,b]],col)

def bowed(name,w,y,z,h,thick,curve,col):
    rings=[]
    for j in range(17):
        t=j/8-1
        cy=y+curve*(1-t*t)
        rings.append([(t*w/2,cy+dy,z+dz) for dy,dz in
                      [(-thick/2,0),(thick/2,0),(thick/2+.008,h),(-thick/2+.008,h)]])
    return skins(name,rings,col,.003)

def chair(x,y,z,angle,col,baby):
    global transform,prefix
    transform=Matrix.Translation((x,y,z))@Matrix.Rotation(radians(angle),4,'Z')
    prefix=col+' / '
    seat=.565 if baby else .495
    foot=.32 if baby else .215
    # Fourteen routed grooves: only the inside face recedes into each stile.
    def center(h): return -.188+.43*h
    for sign in [-1,1]:
        rows=[(.038,0)]
        for i in range(14):
            h=.565-.035*i
            rows += [(h-.017,0),(h-.015,.006),(h-.001,.006),(h+.001,0)]
        rows.append((.785,0))
        rings=[]
        for h,cut in sorted(rows):
            mid=center(h)
            rings.append([(sign*xx,mid+dy,h) for xx,dy in
                          [(.229,-.044),(.229,.044),(.204+cut,.044),(.204+cut,-.044)]])
        skins('grooved stile',rings,col)
        plate('sled',sign*.216,0,.007,.038,.487,.053,.016,col)
        for gy in [-.209,.209]:
            plate('glider',sign*.216,gy,0,.041,.057,.009,.008,'shadow')
        for h in [.104,.437,.651,.749]:
            yy=center(h)
            rod('fastener',(sign*.228,yy,h),(sign*.231,yy,h),.009,'aluminium')
            rod('socket',(sign*.231,yy,h),(sign*.232,yy,h),.0033,'shadow')
    for h in [.104,.437]:
        rod('steel tie',(-.206,center(h),h),(.206,center(h),h),.009,'shadow')
    bowed('lower wooden crossbar',.414,center(.15),.142,.051,.018,.004,col)
    for h in [.651,.738]:
        bowed('curved back laminate',.416,center(h),h,.049,.013,.046,col)
    for title,h,depth,offset in [('seat',seat,.267,-.043),('footboard',foot,.311,-.023)]:
        plate(title,0,center(h)+offset,h-.015,.422,depth,.015,.034,col)
        if col=='beech':
            # Short tapered fibres run with the board; keep the finish subtle.
            for row in range(7):
                strip=[]
                for j in range(17):
                    t=j/16
                    xx=(t-.5)*(.32+.038*sin(row))+.019*sin(row*3.3)
                    yy=center(h)+offset+(row-3)*.027+.004*sin(t*7+row)
                    radius=.00025+.0008*sin(t*pi)
                    strip.extend([(xx,yy-radius,h+.00008),(xx,yy+radius,h+.00008)])
                part('beech fibre',strip,[(j,j+2,j+3,j+1) for j in range(0,32,2)],'honey')

    if baby:
        # Wraparound shell narrows below the shoulder and opens towards the tray.
        rings=[]
        for j in range(31):
            t=pi*j/30
            xx=.195*cos(t); yy=.038+.134*sin(t); high=.664+.141*sin(t)
            rings.append([(xx*.94,yy-.012,.575),(xx,yy,.575),(xx,yy,high),(xx*.94,yy-.012,high)])
        skins('baby back shell',rings,'glacier',.003)
        rings=[]
        for j in range(33):
            t=pi*j/32
            xx=.189*cos(t); yy=.052-.235*sin(t)
            rings.append([(xx*.92,yy+.009,.654),(xx,yy-.009,.654),
                          (xx,yy-.009,.683),(xx*.92,yy+.009,.683)])
        skins('front rail',rings,'glacier',.003)
        skins('crotch support',[[(-w,yy-.008,h),(w,yy-.008,h),(w,yy+.008,h),(-w,yy+.008,h)]
              for w,yy,h in [(.029,-.083,.565),(.022,-.129,.601),(.032,-.176,.666)]],'glacier',.004)
        # Serving surface with a concave body cutout and continuous raised lip.
        loop=outline(.448,.255,.053)
        loop=[(xx,yy-.174-.062*max(0,1-(xx/.18)**2)*max(0,yy/.1275)) for xx,yy in loop]
        rings=[[(xx*k,-.174+(yy+.174)*k,h) for xx,yy in loop]
               for k,h in [(.974,.682),(1,.696),(1,.710),(.978,.711),(.963,.699)]]
        skins('tray with rim',rings,'white',.001)
    transform=Matrix.Identity(4)
    prefix=''

def lettering(body,x,y,z,size,col,bold=False):
    font=bpy.data.curves.new(body,'FONT')
    font.body=body
    font.size=size
    font.align_x='CENTER'
    font.resolution_u=5
    fontfile='Arial Bold.ttf' if bold else 'AppleGothic.ttf'
    font.font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/'+fontfile,check_existing=True)
    obj=bpy.data.objects.new(body,font)
    gallery.objects.link(obj)
    obj.location=(x,y,z)
    obj.rotation_euler.x=pi/2
    bpy.context.view_layer.update()
    mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    text=bpy.data.objects.new(body,mesh)
    gallery.objects.link(text)
    text.matrix_world=obj.matrix_world.copy()
    mesh.materials.append(finish(col))
    pieces.setdefault('StokkeDisplay',[]).append(text)
    bpy.data.objects.remove(obj,do_unlink=True)

plate('recessed toe kick',0,0,.015,2.84,.88,.075,.12,'ink')
plate('showroom podium',0,0,.09,2.96,1.00,.338,.11,'cream')
plate('birch podium edge',0,0,.428,2.96,1,.024,.11,'beech')
plate('podium surface',0,0,.452,2.952,.992,.012,.11,'cream')
chair(-.90,-.018,.464,-27,'beech',False)
chair(.012,-.015,.464,12,'fjord',True)
# Freestanding finish library with real edge depth and exposed grain edge.
plate('sample stand',.96,.14,.464,.67,.25,.055,.045,'walnut')
plate('finish library',.96,.17,.519,.64,.056,.83,.022,'ink')
lettering('컬러 샘플',.96,.139,1.232,.092,'white')
for i,col in enumerate(['beech','walnut','cream','fjord','moss','terracotta']):
    xx=.76+.20*(i%3); h=1.032-.219*(i//3)
    plate('sample edge',xx,.127,h,.142,.037,.15,.012,'endgrain')
    plate('finish sample',xx,.113,h+.003,.138,.029,.145,.010,col)
lettering('STOKKE',-.89,-.503,.235,.158,'ink',True)
lettering('트립트랩  ·  높이 조절 체험',.405,-.504,.237,.098,'ink')
bpy.context.preferences.filepaths.save_version=0
bpy.context.scene.unit_settings.system='METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'gallery.blend'),compress=True)
# Copy per-part finishes into vertex colours before joining runtime draw batches.
for batch,objects in pieces.items():
    merged=bpy.data.materials.new(batch)
    merged.use_nodes=True
    nodes=merged.node_tree.nodes
    shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.52
    colors=nodes.new('ShaderNodeVertexColor'); colors.layer_name='Finish'
    merged.node_tree.links.new(colors.outputs['Color'],shader.inputs['Base Color'])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:
        mesh=obj.data
        rgba=mesh.materials[0].diffuse_color[:]
        attr=mesh.color_attributes.new(name='Finish',type='BYTE_COLOR',domain='POINT')
        for item in attr.data: item.color=rgba
        mesh.materials.clear(); mesh.materials.append(merged)
        obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name=batch
bpy.ops.export_scene.gltf(filepath=str(OUT/'gallery.glb'),export_format='GLB',export_animations=False)
