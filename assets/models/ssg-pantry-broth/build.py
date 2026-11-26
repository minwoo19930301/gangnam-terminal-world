"""Build the Gangnam Fermentation Pantry's open ingredient wells in Blender."""
from math import cos, sin, pi
from pathlib import Path
from random import Random
import bpy

out = Path(__file__).resolve().parent
rng = Random(305)
bpy.ops.wm.read_factory_settings(use_empty=True)
bins = bpy.data.collections.new("PantryBrothWells")
bpy.context.scene.collection.children.link(bins)
surface = bpy.data.materials.new("스테인리스 테두리와 건재료")
surface.use_nodes = True
shader = surface.node_tree.nodes.get("Principled BSDF")
shader.inputs["Roughness"].default_value = .62
color = surface.node_tree.nodes.new("ShaderNodeVertexColor")
color.layer_name = "COLOR_0"
surface.node_tree.links.new(color.outputs["Color"], shader.inputs["Base Color"])
verts, faces, tones = [], [], []


def face(points, tone):
    first = len(verts)
    verts.extend(points)
    faces.append(tuple(range(first, len(verts))))
    tones.append(tone)


def object_from_faces(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    attr = mesh.color_attributes.new(name="COLOR_0", type="BYTE_COLOR", domain="CORNER")
    for poly, tone in zip(mesh.polygons, tones):
        rgb = [int(tone[i:i+2], 16) / 255 for i in (0, 2, 4)]
        for index in poly.loop_indices:
            attr.data[index].color_srgb = (*rgb, 1)
    mesh.materials.append(surface)
    bins.objects.link(bpy.data.objects.new(name, mesh))
    verts.clear()
    faces.clear()
    tones.clear()


def border(x, y, width, depth, z, corner=.015):
    w, d = width / 2, depth / 2
    return [(x+a,y+b,z) for a,b in [
        (-w+corner,-d),(w-corner,-d),(w,-d+corner),(w,d-corner),
        (w-corner,d),(-w+corner,d),(-w,d-corner),(-w,-d+corner)]]


def connect(a, b, palette):
    for i in range(len(a)):
        j = (i+1) % len(a)
        face([a[i], a[j], b[j], b[i]], palette[i % len(palette)])


# A raised rear row tilts into view from the public side of the counter.
ingredients = [
    ("건새우", "c57146", ["b45934","ce8151","e29e72","efb593"], "curl"),
    ("건대파", "8b915a", ["bac18c","858b55","6e7844","a9a672"], "flake"),
    ("건표고", "9a7a55", ["8c6a4a","b2936d","c4a780","836247"], "sliver"),
    ("디포리", "a39980", ["8a816c","c4b69a","9d987d","c9c2a9"], "fish"),
    ("멸치", "a69c81", ["d0c5a7","a49a7e","bcb298","857f70"], "fish"),
    ("채소 조각", "cab582", ["e1cf9e","b9a170","c4a974","d3bd90"], "flake"),
    ("건채소", "8b7e5c", ["90815c","ac976f","747c51","b8a070"], "sliver"),
    ("채 썬 버섯", "b49a70", ["cfb78e","a5895f","d7bd93","bda275"], "sliver"),
]
for n,(name,base,palette,kind) in enumerate(ingredients):
    col, row = n % 4, n // 4
    x, y = (col-1.5)*.745, (.5-row)*.397
    height = .082 + row*.055
    rings = [border(x,y,.746,.398,0), border(x,y,.746,.398,height),
             border(x,y,.664,.326,height), border(x,y,.648,.31,height-.014),
             border(x,y,.618,.284,height-.053)]
    connect(rings[0],rings[1],["494b49","555854"])
    connect(rings[1],rings[2],["656761","5b5e59"])
    connect(rings[2],rings[3],["d9dad0","a8aaa3","d6d6c9","b1b2a9"])
    connect(rings[3],rings[4],["92928b","c3c1b5","85877e","b1b2a8"])
    face(rings[4], base)
    object_from_faces(name+" · 스테인리스 팬")
    # Each cut has its own silhouette. The flatter fragments sit partly below the lip.
    # A shallow, irregular bed fills each well between the larger pieces.
    nx, ny = 22, 9
    bed = []
    for j in range(ny+1):
        line = []
        for i in range(nx+1):
            ax, ay = 2*i/nx-1, 2*j/ny-1
            h = height-.048 + .020*max(0,1-ax*ax-ay*ay)
            line.append((x+.308*ax,y+.140*ay,h+rng.uniform(-.001,.0025)))
        bed.append(line)
    for j in range(ny):
        for i in range(nx):
            corners = [bed[j][i],bed[j][i+1],bed[j+1][i+1],bed[j+1][i]]
            for a,b in [(1,2),(2,3)]:
                accent = rng.choice(palette)
                tint = "".join(f"{round(.68*int(base[h:h+2],16)+.32*int(accent[h:h+2],16)):02x}" for h in (0,2,4))
                face([corners[0],corners[a],corners[b]],tint)
    for k in range(126):
        fx = x+rng.uniform(-.291,.291)
        fy = y+rng.uniform(-.127,.127)
        dx,dy=(fx-x)/.31,(fy-y)/.147
        z=height-.046+.022*max(0,1-dx*dx-dy*dy)+rng.uniform(0,.007)
        angle=rng.uniform(0,2*pi)
        length=rng.uniform(.023,.049) if kind in ["sliver","fish"] else rng.uniform(.010,.026)
        width=rng.uniform(.004,.009) if kind=="fish" else rng.uniform(.005,.013)
        def sample(u,v,h):
            return (fx+u*length*cos(angle)-v*width*sin(angle),
                    fy+u*length*sin(angle)+v*width*cos(angle),z+h)
        tone=rng.choice(palette)
        if kind=="curl":
            arc=[sample(cos(t)*.84,sin(t)*1.14,.004*sin(t)) for t in [0,.75,1.5,2.25,3]]
            inner=[sample(cos(t)*.38,sin(t)*.50,.007) for t in [0,.75,1.5,2.25,3]]
            for i in range(4): face([arc[i],arc[i+1],inner[i+1],inner[i]],tone)
        elif kind=="fish":
            face([sample(-1,0,0),sample(-.6,-1,0),sample(.88,0,.006),sample(-.36,.8,.005)],tone)
            face([sample(.62,0,.003),sample(1,-.8,.003),sample(1.03,.65,.003)],tone)
        else:
            ridge=sample(.05,.05,.008)
            ends=[sample(-1,-.3,0),sample(-.17,-1,.001),sample(.94,.48,0),sample(.1,.95,.002)]
            for i in range(4): face([ends[i],ends[(i+1)%4],ridge],tone if i else rng.choice(palette))
    object_from_faces(name+" · 마른 재료")
    px,py=x+.20,y+.132
    basecard=border(px,py,.147,.054,height+.004,.003)
    topcard=border(px,py,.137,.046,height+.007,.002)
    face(basecard,"393c38");face(topcard,"eee8d8")
    # The source shows printed price cards. Individual prices vary.
    for line,width in enumerate([.047,.027]):
        face(border(px-.031,py+.006-.012*line,width,.0035,height+.008,.001),"716d60")
    object_from_faces(name+" · 안내 카드")
for area in bpy.context.screen.areas:
    if area.type=="VIEW_3D":
        area.spaces.active.shading.color_type="VERTEX"
        area.spaces.active.region_3d.view_distance=3.8
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(out/"broth-wells.blend"),compress=True)
