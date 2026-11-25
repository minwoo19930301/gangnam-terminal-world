"""blender -b --python build.py, or reopen streetscape.blend and add -- --export-current."""
import base64
import json
import math
import random
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

HERE = Path(__file__).resolve().parent
SPECIES = {
    # crown width at an 8 m tree; the game's narrow roadside pine/ginkgo keep a fixed spread.
    "zelkova": (2.62, "느티나무", 0x65824A, 0x574C40),
    "ginkgo": (1.53, "은행나무", 0x94A944, 0x635745),
    "pine": (1.60, "소나무", 0x436744, 0x765240),
    "cherry": (2.58, "벚나무", 0x799853, 0x675244),
    "maple": (2.49, "단풍나무", 0x9B7943, 0x5F5147),
}
MATERIALS = {}


def canopy_image():
    # A tile of overlapping leaflets. Wrap each stroke over the tile seam and pack
    # it into the .blend so an edited image can be re-exported without a source file.
    rng = random.Random(38291)
    n = 64
    ys,xs = np.mgrid[:n,:n]
    values = np.full((n,n), .89)
    for _ in range(195):
        cx,cy=rng.uniform(0,n),rng.uniform(0,n)
        ang=rng.uniform(0,math.tau)
        dx,dy=(xs-cx+n/2)%n-n/2,(ys-cy+n/2)%n-n/2
        u,v=dx*math.cos(ang)+dy*math.sin(ang),-dx*math.sin(ang)+dy*math.cos(ang)
        length,width=rng.uniform(2,6.3),rng.uniform(.9,2.0)
        leaf=(u/length)**2+(v/width)**2<1
        values[leaf] = rng.uniform(.72,1.0)
        values[leaf & (v < -.4)] *= .95
    image=bpy.data.images.new("수관 잎 무늬",n,n,alpha=True)
    image.colorspace_settings.name="Non-Color"
    rgba=np.ones((n,n,4),dtype=np.float32)
    rgba[:,:,:3] = values[:,:,None]
    image.pixels.foreach_set(rgba.flatten())
    image.pack()
    return image



def material(color):
    name = f"paint-{color:06x}"
    if name not in MATERIALS:
        m = bpy.data.materials.new(name)
        m.diffuse_color = [((color >> n & 255) / 255) ** 2.2 for n in (16, 8, 0)] + [1]
        MATERIALS[name] = m
    return MATERIALS[name]


def tinted(color, factor):
    return sum(min(255, round((color >> n & 255) * factor)) << n for n in (16, 8, 0))


def part(group, name, coords, polys, colors, *, smooth=True, role="body"):
    # Author in world-local X/Y-up/Z; Blender shows Z up and positive Y north.
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(x, -z, y) for x, y, z in coords], [], polys)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    group.objects.link(obj)
    obj.location = group["origin"]
    obj["role"] = role
    for color in dict.fromkeys(colors):
        mesh.materials.append(material(color))
    slots = list(dict.fromkeys(colors))
    for face, color in zip(mesh.polygons, colors):
        face.material_index = slots.index(color)
        face.use_smooth = smooth
    return obj


def tube(group, name, nodes, radii, sides, color, angle=0):
    pts = [Vector(p) for p in nodes]
    verts, polys = [], []
    for i, (centre, r) in enumerate(zip(pts, radii)):
        axis = (pts[min(i + 1, len(pts)-1)] - pts[max(0, i-1)]).normalized()
        u = axis.cross(Vector((0, 0, 1)) if abs(axis.z) < .95 else Vector((1, 0, 0))).normalized()
        v = axis.cross(u)
        for j in range(sides):
            a = angle + math.tau*j/sides
            verts.append(centre + r * (math.cos(a)*u + math.sin(a)*v))
    for i in range(len(pts)-1):
        for j in range(sides):
            a = i*sides+j; b = i*sides+(j+1)%sides
            polys.append((a,b,b+sides,a+sides))
    # End rings meet another component or taper into the canopy.
    return part(group, name, verts, polys, [color]*len(polys))


def foliage(group, name, x, z, rings, sides, rot, color, seed, low_tip=False):
    rng = random.Random(seed)
    jitter = [rng.uniform(.85, 1.10) for _ in range(sides)]
    pts, polys, shades = [], [], []
    if low_tip:
        # A flattened, off-centre lower rim arching up to a soft shoulder. The
        # blunt irregular top avoids both spherical clumps and triangular tips.
        (lo, _, _), (mid, rx, rz), (hi, _, _) = rings
        rings=[(lo+(mid-lo)*.37,rx*.70,rz*.70),(mid,rx,rz),
               (hi-(hi-mid)*.32,rx*.69,rz*.74)]
    for row, (height, rx, rz) in enumerate(rings):
        twist = (.12 if row % 2 else 0)
        for i in range(sides):
            ang = rot + math.tau*i/sides + twist
            sway = .075*math.cos(rot + row)
            pts.append((x + rx*jitter[i]*math.cos(ang)+sway, height + .13*math.sin(2*ang+row),
                        z + rz*jitter[i]*math.sin(ang)-sway*.5))
    for row in range(len(rings)-1):
        for j in range(sides):
            a = row*sides+j; b = row*sides+(j+1)%sides
            polys.append((b,a,a+sides,b+sides))
            shades.append(tinted(color, (.93 if row == 0 else 1.02)*rng.uniform(.95,1.045)))
    if low_tip:
        bottom,top=len(pts),len(pts)+1
        pts += [(x+rx*.23,lo,z-rz*.18),(x-rx*.23,hi,z+rz*.20)]
        for j in range(sides):
            a,b=j,(j+1)%sides
            polys.extend([(bottom,a,b),(top,2*sides+b,2*sides+a)])
            shades.extend([tinted(color,.83),tinted(color,1.06)])
    else:
        polys += [tuple(range(sides)),tuple(reversed(range((len(rings)-1)*sides,len(rings)*sides)))]
        shades += [tinted(color,.83),tinted(color,1.06)]
    canopy=part(group,name,pts,polys,shades)
    if low_tip:
        reduce=canopy.modifiers.new("실시간 수관 단순화","DECIMATE")
        reduce.ratio=.68
        reduce.use_collapse_triangulate=True
    return canopy


def tree(group, kind, far):
    width, label, leaf, bark = SPECIES[kind]
    narrow = kind in ("ginkgo", "pine")
    if far:
        tube(group, label+" 줄기", [(0,0,0),(.06,3.7,0)], [.17,.085], 3, bark)
        crown = {"ginkgo":[(2.9,.30),(4.6,.96),(7.96,.12)],
                 "pine":[(3.5,.85),(4.05,.99),(7.94,.10)],
                 "cherry":[(3.0,.48),(4.65,1.0),(7.6,.39)],
                 "maple":[(3.05,.40),(4.8,1.0),(7.86,.36)],
                 "zelkova":[(3.4,.38),(5.65,1.0),(7.82,.56)]}[kind]
        foliage(group,label+" 먼 수관",0,0,[(y,w*width,w*width*.91) for y,w in crown],5,.24,leaf,81)
        return
    fork = 2.65 if not narrow else 3.02
    tube(group,label+" 주간",[(0,0,0),(.075,1.15,.035),(-.04,fork,0),(.09,5.1,.08),(-.025,6.78,.04)],
         [.18,.14,.11,.063,.025],5,bark)
    # Height, distance from the trunk, radius and thickness of each branch's crown.
    whorls = {
        "zelkova":[(5.7,.57,.49,1.20),(5.3,.55,.48,1.13),(5.65,.60,.46,1.2),(5.78,.57,.43,1.1)],
        "cherry":[(4.8,.58,.50,1.22),(5.14,.56,.52,1.21),(5.4,.58,.47,1.17),(5.15,.54,.49,1.23)],
        "maple":[(5.4,.53,.54,1.25),(5.0,.50,.54,1.21),(5.53,.55,.53,1.28),(5.4,.54,.52,1.21)],
        "ginkgo":[(4.33,.45,.56,.99),(4.27,.47,.54,.92),(5.15,.44,.54,1.03),(5.62,.39,.53,1.12)],
        "pine":[(4.03,.54,.56,.50),(4.64,.50,.53,.48),(5.31,.48,.51,.48),(6.0,.33,.50,.47)],
    }[kind]
    for i, (h, offset, size, depth) in enumerate(whorls):
        a=(.42 if kind=="zelkova" else 1.15)+math.tau*i/len(whorls)+[0,.12,-.09,.19][i]; x=math.cos(a)*width*offset; z=math.sin(a)*width*offset
        tube(group,label+f" 곁가지 {i+1}",[(.01,fork+.19*i,0),(.52*x,h-depth*.76,.52*z),(x,h,z)],
             [.105 if i<2 else .09,.063,.035],3,bark,i)
        # Off-centre crowns keep sky visible around each branch rather than making a solid ball.
        foliage(group,label+f" 가지 잎 {i+1}",x,z,
                [(h-depth,.35*size*width,.37*size*width),
                 (h-.07,size*width,.93*size*width),
                 (h+depth,.34*size*width,.41*size*width)],5,a+.2,tinted(leaf,[.94,1.01,1.06,.98][i]),31+i,True)
    top = {"pine":(6.85,.64,.99),"ginkgo":(6.17,.81,1.67),
           "cherry":(6.28,.76,1.36),"maple":(6.46,.74,1.39),"zelkova":(6.46,.76,1.45)}[kind]
    h,w,d=top
    foliage(group,label+" 정수리",.1,-.08,[(h-d,.27*w*width,.23*w*width),
            (h-.1,w*width,w*width*.92),(h+d,.29*w*width,.25*w*width)],6,.61,tinted(leaf,1.035),41,True)


def lamp(group):
    steel, alloy, trim = 0x8B9293, 0x7A8586, 0x414A4E
    tube(group,"테이퍼 지주",[(0,0,0),(0,.4,0),(0,7.65,0),(0,8.45,.07),(0,8.79,.35),
         (0,8.9,.69),(0,8.91,1.61)],[.135,.115,.077,.072,.066,.061,.052],7,steel)
    tube(group,"하부 보호칼라",[(0,.025,0),(0,.065,0),(0,.35,0),(0,.40,0)],
         [.19,.18,.156,.122],7,alloy)
    # Octagonal sealed housing in side profile, with a separate downward luminous face.
    outline=[(-.1,1.48),(-.18,1.65),(-.195,2.03),(-.108,2.35),(.108,2.35),(.195,2.03),(.18,1.65),(.1,1.48)]
    verts=[(x*.85,9.025,z) for x,z in outline]+[(x,8.895,z) for x,z in outline]+[(x*.88,8.829,z) for x,z in outline]
    polys=[tuple(range(8)),tuple(reversed(range(16,24)))]
    for row in range(2):
        for i in range(8):
            a=row*8+i; b=row*8+(i+1)%8; polys.append((b,a,a+8,b+8))
    part(group,"주물 등기구",verts,polys,[alloy,trim]+[alloy]*8+[trim]*8,smooth=False)
    ln=[(-.108,1.68),(-.134,1.75),(-.114,2.13),(-.062,2.26),(.062,2.26),(.114,2.13),(.134,1.75),(.108,1.68)]
    part(group,"야간 발광 유리",[(x,8.827,z) for x,z in ln],[tuple(reversed(range(8)))],[0xD8E2E2],
         smooth=False,role="lens")


def surface_uv(x, y, z, n, wood):
    if abs(n.y)>max(abs(n.x),abs(n.z)): return (x*.94,z*.94)
    return ((z if abs(n.x)>abs(n.z) else x)*(.99 if wood else .94),y*(.105 if wood else .94))


def author_uvs(group, image):
    for obj in group.objects:
        mesh=obj.data
        uvs=mesh.uv_layers.new(name="잎·수피")
        wood = "주간" in obj.name or "가지" in obj.name and "잎" not in obj.name or "줄기" in obj.name
        obj["wood"] = wood
        for poly in mesh.polygons:
            nx,ny,nz=poly.normal
            normal=Vector((nx,nz,-ny))
            for li in poly.loop_indices:
                x,y,z=mesh.vertices[mesh.loops[li].vertex_index].co
                uvs.data[li].uv=surface_uv(x,z,-y,normal,wood)
        for mat in mesh.materials:
            if mat.use_nodes: continue
            mat.use_nodes=True
            nodes=mat.node_tree.nodes; links=mat.node_tree.links
            tex=nodes.new("ShaderNodeTexImage"); tex.image=image
            mul=nodes.new("ShaderNodeMixRGB"); mul.blend_type="MULTIPLY"
            mul.inputs[0].default_value=1
            mul.inputs[1].default_value=mat.diffuse_color
            links.new(tex.outputs["Color"],mul.inputs[2])
            links.new(mul.outputs[0],nodes.get("Principled BSDF").inputs["Base Color"])


def export():
    graph=bpy.context.evaluated_depsgraph_get()
    meshes, palette = {}, []
    for group in sorted((g for g in bpy.data.collections if g.get("model")), key=lambda g:g.name):
        coords, faces, uvs=[], [], []
        for obj in sorted((o for o in group.objects if o.type=="MESH"),key=lambda o:o.name):
            evaluated=obj.evaluated_get(graph); mesh=evaluated.to_mesh()
            try:
                mesh.calc_loop_triangles()
                offset=len(coords)//3
                for vertex in mesh.vertices:
                    x,y,z=evaluated.matrix_world @ vertex.co-Vector(group["origin"])
                    coords.extend(round(v*1000) for v in (x,z,-y))
                for tri in mesh.loop_triangles:
                    mat=mesh.materials[tri.material_index]; rgb=mat.diffuse_color
                    color=sum(min(255,round(max(0,v)**(1/2.2)*255))<<b for v,b in zip(rgb,(16,8,0)))
                    if color not in palette: palette.append(color)
                    # Sign encodes whether artists marked this face smooth in Blender.
                    idx=palette.index(color)+1
                    faces.extend([*(offset+v for v in tri.vertices),idx if tri.use_smooth else -idx])
                    if mesh.uv_layers.active:
                        for j in tri.loops:
                            uvs.extend(round(v*256) for v in mesh.uv_layers.active.data[j].uv)
            finally: evaluated.to_mesh_clear()
        meshes[group["model"]]={"mm":coords,"faces":faces}
        if uvs:
            if len(uvs) != len(faces)//4*6: raise ValueError("All tree faces need UVs")
            meshes[group["model"]]["uv256"]=base64.b64encode(np.asarray(uvs,dtype="<i2").tobytes()).decode()
    with (HERE/"meshes.js").open("w") as f:
        f.write("// Blender export, millimetres, triangles [a,b,c,signed one-based palette index].\n")
        f.write("export const palette = "+json.dumps(palette,separators=(",",":"))+";\n")
        image=bpy.data.images["수관 잎 무늬"]
        values=np.empty(len(image.pixels),dtype=np.float32)
        image.pixels.foreach_get(values)
        gray=base64.b64encode(np.rint(values[::4]*255).astype("uint8").tobytes()).decode()
        f.write("export const foliageTile = "+json.dumps(gray)+";\n")
        f.write("export const shapes = {\n")
        for k,v in meshes.items(): f.write("  "+json.dumps(k)+":"+json.dumps(v,separators=(",",":"))+",\n")
        f.write("};\n")


if "--export-current" not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    def group(key, x, y):
        g=bpy.data.collections.new(key)
        bpy.context.scene.collection.children.link(g)
        g["origin"]=(x,y,0.); g["model"]=key
        return g
    image=canopy_image()
    for i,kind in enumerate(SPECIES):
        tree(group(kind, (i-2)*7,0),kind,False)
        tree(group(kind+"Far",(i-2)*7,8),kind,True)
    for g in bpy.data.collections: author_uvs(g,image)
    light=group("roadLamp",18,0); lamp(light)
    lens=group("roadLampLens",18,0)
    for o in list(light.objects):
        if o.get("role")=="lens": light.objects.unlink(o); lens.objects.link(o)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/"streetscape.blend"),compress=True)
export()
