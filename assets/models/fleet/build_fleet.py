"""Run with Blender --background --python assets/models/fleet/build_fleet.py."""
import json
import math
from pathlib import Path

import bpy
import bmesh

OUT = Path(__file__).resolve().parent
PALETTE = {
    "paint": 0x8799a7, "rubber": 0x292c31, "silver": 0xa9b3bd,
    "glass": 0x456270, "pillar": 0x25353b, "headlamp": 0xffedbd,
    "sky": 0x718996, "trim": 0xc4cac4, "tail": 0xc33f39, "marker": 0xf6ab43, "cargo": 0xdfdfda,
}
DIMS = {
    "car": (1.85, 1.45, 4.7), "taxi": (1.85, 1.5, 4.8),
    "van": (1.95, 1.95, 5.1), "truck": (2.3, 2.8, 7.0),
    "bus": (2.5, 3.4, 12.0), "cityBus": (2.5, 3.1, 11.0),
    "minibus": (2.35, 2.9, 8.4),
}
bpy.ops.wm.read_factory_settings(use_empty=True)
materials = {}
for name, color in PALETTE.items():
    m = bpy.data.materials.new(name)
    m.diffuse_color = [((color >> s & 255) / 255) ** 2.2 for s in (16, 8, 0)] + [1]
    materials[name] = m


def component(name, vertices, faces, material):
    # Author in vehicle axis coordinates (front +z). Blender collections use Z up.
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(x, -z, y) for x, y, z in vertices], [], faces)
    mesh.materials.append(materials[material])
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    return obj


def hull(name, sections, material):
    """Four-corner cross sections: z, lower width/height, upper width/height."""
    vertices = []
    for z, low, y0, high, y1 in sections:
        vertices.extend([(-low/2, y0, z), (low/2, y0, z),
                         (high/2, y1, z), (-high/2, y1, z)])
    faces = [(0, 1, 2, 3)]
    for i in range(len(sections)-1):
        for j in range(4):
            a, b = i*4+j, i*4+(j+1)%4
            faces.append((a, b, b+4, a+4))
    faces.append(tuple(range(len(vertices)-4, len(vertices))))
    return component(name, vertices, faces, material)


def block(name, x, y, z, w, h, d, material):
    obj = hull(name, [(z-d/2, w, y-h/2, w, y+h/2),
                      (z+d/2, w, y-h/2, w, y+h/2)], material)
    obj.location.x = x


def wheel(side, radius, z, w):
    # Single lathed tyre, sidewall and centre cap, with concentric face rings.
    n = 12
    profile = [(-.19, .74), (-.15, .98), (-.035, 1), (.008, .90),
               (.01, .57), (.023, .49), (.03, .20)]
    vertices = [(side*(w/2+x), radius*(1+r*math.sin(j*2*math.pi/n)),
                 z+radius*r*math.cos(j*2*math.pi/n)) for x,r in profile for j in range(n)]
    faces = [(i*n+j, i*n+(j+1)%n, (i+1)*n+(j+1)%n, (i+1)*n+j)
             for i in range(len(profile)-1) for j in range(n)]
    faces.extend([tuple(range(n)), tuple(range(len(vertices)-n, len(vertices)))])
    mesh = component("Tyre and wheel", vertices, faces, "rubber").data
    mesh.materials.append(materials["silver"])
    for p in mesh.polygons:
        if p.index >= 4*n and p.index != len(faces)-2:
            p.material_index = 1


def passenger(kind, w, h, d):
    van = kind == "van"
    belt = .98 if van else .83
    hull("Painted fenders and hood", [
        (-d*.50, w*.81,.4,w*.86,belt-.14), (-d*.44,w*.94,.28,w*.98,belt),
        (-d*.26,w*.95,.27,w,belt+.03), (d*.26,w*.95,.27,w,belt+.02),
        (d*.43,w*.93,.3,w*.95,belt-.06), (d*.50,w*.78,.39,w*.89,belt-.17)], "paint")
    # Waist, pillars and roof are independent objects for editing in Blender.
    roof = h - (.14 if kind == "taxi" else 0)
    rear = -.46 if van else -.35
    roof_rear = -.42 if van else -.19
    roof_front = .19 if van else .10
    hull("Glazed cabin", [(d*rear,w*.90,belt-.04,w*.89,belt+.01),
         (d*roof_rear,w*.94,belt-.04,w*.79,roof-.06),
         (d*roof_front,w*.94,belt-.04,w*.79,roof-.06),
         (d*.32,w*.89,belt-.04,w*.88,belt+.005)], "glass")
    hull("Roof pressing", [(d*(roof_rear-.014),w*.79,roof-.07,w*.75,roof-.026),
         (d*roof_rear,w*.805,roof-.065,w*.74,roof),
         (d*roof_front,w*.805,roof-.065,w*.74,roof),
         (d*(roof_front+.014),w*.79,roof-.07,w*.75,roof-.026)], "paint")
    for at in ([-.24,-.02,.15] if van else [-.07]):
        hull("Window pillar", [(d*at-.035,w*.948,belt-.01,w*.8,roof-.055),
             (d*at+.035,w*.948,belt-.01,w*.8,roof-.055)], "pillar")
    for side in [-1,1]:
        block("Wing mirror",side*w*.506,belt+.11,d*.20,.14,.10,.19,"paint")
        for at in [-.14,.14]:
            block("Door handle",side*w*.5,belt-.07,d*at,.025,.033,.16,"silver")
    if kind == "taxi":
        hull("Taxi roof lantern", [(-.15,.50,roof,.42,h),(.15,.50,roof,.42,h)], "headlamp")


def commercial(kind, w, h, d):
    coach = kind == "bus"
    if kind == "truck":
        hull("Chassis", [(-d*.49,w*.70,.37,w*.7,.65),(d*.48,w*.7,.37,w*.7,.65)], "pillar")
        block("Box body",0,(h+.72)/2,-d*.138,w-.06,h-.72,d*.70,"cargo")
        for side in [-1,1]:
            for t in range(6):
                block("Box rib",side*(w/2-.025),(h+.72)/2,-d*.46+t*d*.127,.04,h-.76,.035,"silver")
        hull("Forward cab",[(d*.22,w*.90,.4,w*.91,h*.81),
             (d*.43,w*.93,.37,w*.88,h*.82),(d*.495,w*.84,.47,w*.86,h*.62)],"paint")
        hull("Cab windscreen",[(d*.433,w*.876,h*.62,w*.872,h*.815),
             (d*.496,w*.85,h*.61,w*.85,h*.625)],"glass")
        for side in [-1,1]:
            block("Cab side glass",side*w*.46,h*.67,d*.33,.025,h*.205,d*.18,"glass")
        return
    hull("Bus body", [(-d*.5,w*.90,.43,w*.91,h-.15),(-d*.477,w,.35,w*.97,h),
         (d*.465,w,.35,w*.97,h),(d*.5,w*.89,.45,w*.92,h-.16)],"paint")
    sill = h*(.49 if coach else .40)
    for side in [-1,1]:
        bays = 8 if coach else 7 if kind == "cityBus" else 5
        spacing = d*.91/bays
        for i in range(bays):
            z = d*.455-(i+.5)*spacing
            door = side == -1 and (i == 0 or (not coach and i == bays//2))
            if door:
                for j in [-1, 1]:
                    block("Passenger door glazing",side*w*.494,(h-.24+.50)/2,z+j*spacing*.235,
                          .033,h-.74,spacing*.435,"pillar")
                    block("Door light",side*w*.504,(h-.30+sill)/2,z+j*spacing*.235,
                          .024,h-.30-sill,spacing*.38,"glass")
            else:
                block("Side window",side*w*.493,(sill+h-.26)/2,z,.035,h-.26-sill,spacing-.085,"glass")
            if coach and 1 < i < bays-2:
                block("Luggage hatch",side*w*.503,1.0,z,.018,.59,spacing-.07,"silver")
                block("Latch",side*w*.51,1.20,z,.025,.05,.17,"pillar")
    block("Windscreen",0,(h-.39+1)/2,d*.5+.006,w*.88,h-.39-1,.036,"glass")
    if not coach:
        block("Windscreen divider",0,(h-.39+1)/2,d*.5+.030,.045,h-.39-1,.018,"pillar")
    for side in [-1,1]:
        block("Mirror bracket",side*w*.50,h*.73,d*.472,.22,.045,.31,"pillar")
        block("Mirror housing",side*w*.535,h*.70,d*.49,.115,.24,.15,"pillar")
        block("Waist moulding",side*w*.5,sill-.08,-d*.05,.022,.064,d*.82,"trim")
        block("Side marker",side*w*.504,.73,-d*.37,.02,.078,.22,"marker")
    block("Windscreen upper tint",0,h-.53,d*.5+.033,w*.84,.105,.018,"sky")
    for side in [-1,1]:
        block("Wiper at rest",side*w*.22,1.11,d*.5+.032,w*.37,.036,.018,"pillar")
    block("Destination case",0,h-.29,d*.5+.01,w*.78,.30,.06,"pillar")
    block("Front bumper insert",0,.47,d*.5+.018,w*.68,.105,.038,"silver")
    for side in [-1,1]:
        block("DRL",side*w*.36,.80,d*.5+.018,w*.13,.065,.045,"headlamp")
    block("Rear windscreen",0,h*.65,-d*.5-.004,w*.85,h*.32,.038,"glass")
    block("Roof climate unit",0,h+.063,-d*.13,w*.62,.126,d*.31,"cargo")


data = {}
for ix, (kind, (w,h,d)) in enumerate(DIMS.items()):
    collection = bpy.data.collections.new(kind)
    bpy.context.scene.collection.children.link(collection)
    if kind in ("car", "taxi", "van"):
        passenger(kind,w,h,d)
    else:
        commercial(kind,w,h,d)
    radius = .34 if kind in ("car","taxi","van") else .45
    for side in [-1,1]:
        for z in [-d*.32,d*.32]:
            wheel(side,radius,z,w)
        for end, mat in [(1,"headlamp"),(-1,"tail")]:
            block("Lamp assembly",side*w*.33,.62,end*(d*.5+.004),w*.19,.135,.045,mat)
    block("Front grille",0,.52,d*.5+.012,w*.37,.15,.035,"pillar")
    bpy.context.view_layer.update()
    vertices, faces = [], []
    for obj in collection.objects:
        mesh = obj.data
        mesh.calc_loop_triangles()
        offset = len(vertices)//3
        for v in mesh.vertices:
            x, y, z = obj.matrix_world @ v.co
            vertices.extend(round(c*1000) for c in (x,z,-y))
        for tri in mesh.loop_triangles:
            material = mesh.materials[tri.material_index].name
            faces.extend([*(i+offset for i in tri.vertices),list(PALETTE).index(material)])
    data[kind] = {"size":[w,h,d],"mm":vertices,"faces":faces}
    for obj in collection.objects:
        obj.location.x += (ix-3)*3.6

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"terminal-fleet.blend"),compress=True)
with (OUT/"meshes.js").open("w") as f:
    f.write("// Blender export. Positions in mm, face records [a,b,c,material].\n")
    f.write("export const palette = "+json.dumps(list(PALETTE.values()))+";\n")
    f.write("export const vehicles = {\n")
    for k, v in data.items():
        f.write('  '+json.dumps(k)+':'+json.dumps(v,separators=(",",":"))+',\n')
    f.write("};\n")
