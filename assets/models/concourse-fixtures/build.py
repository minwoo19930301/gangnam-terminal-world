"""Make the editable ticket cabinet and four soft-goods display samples."""
from math import copysign, cos, pi, sin, sqrt
from pathlib import Path
import runpy

import bmesh
import bpy
from mathutils import Vector


HERE = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)


def material(name, rgb):
    mat = bpy.data.materials.new(name)
    channels = [(rgb >> shift & 255) / 255 for shift in (16, 8, 0)]
    mat.diffuse_color = [
        x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4
        for x in channels
    ] + [1]
    return mat


def collection(name, origin):
    group = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(group)
    group["origin"] = origin
    group["bundle"] = "fixtures"
    return group


def mesh(group, name, vertices, faces, mat, bevel=0):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data)
    bm.free()
    data.materials.append(mat)
    obj = bpy.data.objects.new(name, data)
    obj.location = group["origin"]
    group.objects.link(obj)
    if bevel:
        modifier = obj.modifiers.new("Rounded corners", "BEVEL")
        modifier.width = bevel
        modifier.segments = 2
    return obj


def box(group, name, centre, size, mat, bevel=0):
    x, y, z = centre
    w, d, h = (s / 2 for s in size)
    verts = [(x + a*w, y + b*d, z + c*h)
             for c in (-1, 1) for b in (-1, 1) for a in (-1, 1)]
    return mesh(group, name, verts,
                [(0,2,3,1), (4,5,7,6), (0,1,5,4), (2,6,7,3),
                 (0,4,6,2), (1,3,7,5)], mat, bevel)


def extrusion(group, name, half_width, profile, mat, bevel=0):
    """Extrude a custom side elevation along the cabinet's width."""
    count = len(profile)
    verts = [(x,y,z) for x in (-half_width, half_width) for y,z in profile]
    faces = [tuple(range(count)), tuple(range(count, 2*count))]
    faces.extend((i,(i+1)%count,(i+1)%count+count,i+count) for i in range(count))
    return mesh(group, name, verts, faces, mat, bevel)


def tube(group, name, path, radius, mat, closed=False):
    points = list(map(Vector, path))
    vertices, faces = [], []
    count = len(points)
    for index, centre in enumerate(points):
        previous = points[(index-1)%count] if (closed or index) else centre
        following = points[(index+1)%count] if (closed or index+1<count) else centre
        tangent = (following-previous).normalized()
        side = tangent.cross(Vector((0,1,0))).normalized()
        outward = tangent.cross(side)
        for i in range(6):
            angle = i*pi/3
            vertices.append(centre + radius*(side*cos(angle) + outward*sin(angle)))
    for index in range(count if closed else count-1):
        next_index = (index+1)%count
        for i in range(6):
            j = (i+1)%6
            faces.append((6*index+i,6*index+j,6*next_index+j,6*next_index+i))
    if not closed:
        faces.extend([tuple(range(6)), tuple(range(6*(count-1),6*count))])
    return mesh(group, name, vertices, faces, mat)


cabinet = collection("TicketKiosk", (0,0,0))
graphite = material("Graphite trim", 0x333D44)
pearl = material("Powder-coated ivory", 0xE8EBE9)
steel = material("Brushed metal", 0xA6AFB0)
ink = material("Display bezel and recess", 0x1B2D39)
blue = material("Blue glass", 0x90BED6)
screen_light = material("Pale interface", 0xE2EFF2)
teal = material("Accent stripe", 0x258B9A)
amber = material("Reader indicator", 0xEBB856)

box(cabinet, "Plinth with radiused toe", (0,0,.045), (.64,.55,.09), graphite, .021)
profile = [(.23,.09),(-.21,.09),(-.21,.70),(-.245,.84),(-.267,.90),
           (-.267,1.64),(-.231,1.74),(-.19,1.78),(.17,1.78),(.23,1.69)]
extrusion(cabinet, "Folded enamel housing", .28, profile, pearl, .012)
box(cabinet, "Raised oval-corner bezel", (0,-.266,1.255), (.502,.023,.70), graphite, .021)
box(cabinet, "Display glass", (0,-.281,1.255), (.446,.009,.621), blue, .004)
box(cabinet, "Top status strip", (0,-.287,1.529), (.430,.003,.046), ink)
for i in range(3):
    box(cabinet, "Screen selection bar", (0,-.287,1.435-i*.122),
        (.358,.003,.075), screen_light if i!=1 else teal, .001)
    box(cabinet, "Screen caption", (-.043,-.290,1.434-i*.122),
        (.160,.003,.010), graphite if i!=1 else screen_light)
box(cabinet, "Printer escutcheon", (-.062,-.230,.684), (.272,.049,.108), graphite, .012)
box(cabinet, "Ticket slot", (-.062,-.258,.699), (.226,.015,.017), ink, .004)
box(cabinet, "Paper lip", (-.062,-.260,.682), (.225,.016,.010), steel)
box(cabinet, "Reader bezel", (.169,-.242,.716), (.121,.093,.143), graphite, .017)
box(cabinet, "Reader pad", (.168,-.294,.725), (.085,.015,.077), ink, .008)
box(cabinet, "Reader lamp", (.168,-.305,.748), (.057,.005,.010), amber)
for i in range(6):
    box(cabinet, "Lower air slot", (-.15,-.214,.222+i*.024), (.104,.012,.009), graphite)
for side in (-1,1):
    box(cabinet, "Brushed side edge", (side*.275,-.231,1.236), (.010,.041,.754), steel, .003)


def cushion(group, cloth, braid, pattern):
    # Front and back use the same inflated superellipse. A narrow sewn edge
    # follows their junction. Decoration is laid directly on the front face.
    width, height, loft = .256, .204, .174
    exponent = 4.5

    def surface(x, z):
        distance = (abs(x/width)**exponent + abs(z/height)**exponent)**(1/exponent)
        return loft*sqrt(max(0, 1-distance*distance))

    def perimeter(angle):
        return (width*copysign(abs(cos(angle))**(2/exponent),cos(angle)),
                height*copysign(abs(sin(angle))**(2/exponent),sin(angle)))

    vertices = [(0,-loft,height)]
    faces = []
    segments = 40
    slices = 14
    for layer in range(1, slices):
        angle = layer*pi/slices
        for column in range(segments):
            x, z = perimeter(2*pi*column/segments)
            vertices.append((x*sin(angle), -loft*cos(angle), height+z*sin(angle)))
    back = len(vertices)
    vertices.append((0,loft,height))
    for i in range(segments):
        j = (i+1)%segments
        faces.append((0,1+i,1+j))
        for layer in range(slices-2):
            a = 1+segments*layer
            faces.append((a+i,a+j,a+j+segments,a+i+segments))
        start = 1+segments*(slices-2)
        faces.append((start+i,back,start+j))
    mesh(group, "Stuffed fabric shell", vertices, faces, cloth)
    edge = [perimeter(2*pi*i/segments) for i in range(segments)]
    tube(group, "Welt piping", [(x,0,height+z) for x,z in edge], .004, braid, closed=True)

    def embroidery(name, xz, r=.0027):
        tube(group,name,[(x,-surface(x,z)-.001,height+z) for x,z in xz],r,braid)

    def stroke(a,b):
        return [(a[0]+(b[0]-a[0])*t/16, a[1]+(b[1]-a[1])*t/16) for t in range(17)]

    if pattern == "Windowpane":
        for x in (-.146, -.124, .124, .146):
            embroidery("Woven vertical band",stroke((x,-.172),(x,.172)))
        for z in (-.102,.102):
            embroidery("Woven horizontal band",stroke((-.224,z),(.224,z)))
    elif pattern == "Leaf":
        embroidery("Sprig stem",stroke((-.094,-.136),(.088,.139)), .0035)
        for i in range(5):
            h = i/5
            x,z = -.072+.14*h,-.103+.202*h
            direction = 1 if i%2 else -1
            leaf = [(x+direction*.081*sin(t*pi/14),
                     z+.075*t/14+.019*sin(2*t*pi/14)) for t in range(15)]
            embroidery("Stitched leaf",leaf)
    elif pattern == "Chevron":
        for z in (-.090, -.044, .050, .096):
            embroidery("Chevron stitch",stroke((-.211,z+.038),(0,z-.026))[:-1]
                       +stroke((0,z-.026),(.211,z+.038)), .0031)
    else:
        for x in (-.145,-.073,0,.073,.145):
            embroidery("Channel quilting",stroke((x,-.166),(x,.166)),.0026)
    box(group, "Sewn side label", (.246,.006,height*.56), (.027,.035,.029),
        screen_light, .002)


variants = [
    ("Linen", 0xDABF91,0x9C815D,"Windowpane"),
    ("Sage", 0x92AC96,0xE1DFC6,"Leaf"),
    ("Rose", 0xC990A1,0xEFD1C9,"Chevron"),
    ("Ivory", 0xE5E1D3,0xB4A78E,"Quilt"),
]
for i, (name, body, trim, pattern) in enumerate(variants):
    group = collection("Cushion"+name, (.9+i*.75,0,0))
    cushion(group, material(name+" cloth",body),material(name+" embroidery",trim),pattern)

rack = collection("CushionRack", (5.5,0,0))
shelf = material("Ivory enamel shelving", 0xE5E4DD)
upright = material("Pewter steel", 0x999E98)
trim = material("Pale oak shelf lip", 0xBAA387)
for x in (-.932,.932):
    box(rack,"Stamped steel upright",(x,.195,.857),(.037,.052,1.69),upright)
    box(rack,"Levelling foot",(x,.015,.072),(.062,.455,.144),upright,.012)
for tier in range(3):
    height = .254 + tier*.55
    box(rack,"Folded shelf tray",(0,.012,height),(1.946,.48,.052),shelf,.007)
    box(rack,"Oak shelf edge",(0,-.231,height),(1.94,.017,.047),trim,.003)
    box(rack,"Back retaining rail",(0,.205,height+.131),(1.9,.031,.047),shelf)
    for x in (-.931,.931):
        bracket = extrusion(rack,"Triangular shelf standard",.015,
                            [(.185,height-.030),(-.186,height-.030),(.185,height-.195)],
                            upright,.003)
        bracket.location.x += x

bpy.context.preferences.filepaths.save_version = 0
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/"concourse-fixtures.blend"),compress=True)
runpy.run_path(str(HERE/"export.py"))
