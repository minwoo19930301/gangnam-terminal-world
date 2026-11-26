"""Run with Blender --background --python assets/models/fleet/build_fleet.py."""
import base64
import json
import math
import sys
from pathlib import Path

import bpy
import bmesh

OUT = Path(__file__).resolve().parent
PALETTE = {
    "paint": 0x8799a7, "rubber": 0x292c31, "silver": 0xa9b3bd,
    "glass": 0x456270, "pillar": 0x25353b, "headlamp": 0xffedbd,
    "sky": 0x718996, "trim": 0xc4cac4, "tail": 0xc33f39, "marker": 0xf6ab43, "cargo": 0xdfdfda,
    "opal taxi lens": 0xf5edd7, "Seoul lettering": 0x294650, "hire plate": 0xe7b52c,
    "taxi day light": 0xe4f2f3, "taxi rear light": 0xbf2f24,
}
DIMS = {
    "car": (1.85, 1.45, 4.7), "taxi": (1.85, 1.5, 4.8),
    "van": (1.95, 1.95, 5.1), "truck": (2.3, 2.8, 7.0),
    "bus": (2.5, 3.4, 12.0), "cityBus": (2.5, 3.1, 11.0),
    "minibus": (2.35, 2.9, 8.4),
}
materials = {}


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


def wheel(side, radius, z, w, alloy=False):
    # Single lathed tyre, sidewall and centre cap, with concentric face rings.
    n = 12
    profile = [(-.19, .74), (-.15, .98), (-.035, 1), (.008, .90),
               (.01, .57), (.023, .49), (.03, .20)]
    vertices = [(side*(w/2+x), radius*(1+r*math.sin(j*2*math.pi/n)),
                 z+radius*r*math.cos(j*2*math.pi/n)) for x,r in profile for j in range(n)]
    faces = [(i*n+j, i*n+(j+1)%n, (i+1)*n+(j+1)%n, (i+1)*n+j)
             for i in range(len(profile)-1) for j in range(n)]
    faces.extend([tuple(range(n)), tuple(range(len(vertices)-n, len(vertices)))])
    old_count = len(faces)
    if alloy:
        # The dark recess above the grey disc leaves five cast twin spokes.
        # It sits inside the tyre's existing bounds and follows its contact pose.
        for spoke in range(5):
            rot = 2*math.pi*spoke/5
            outer_x = side*(w/2+.031)
            shape = [(.51,-.43),(.47,-.07),(.26,.05),(.19,.05),(.28,-.20)]
            for delta in (0,.50):
                start = len(vertices)
                for r, offset in shape:
                    a=rot+delta+offset
                    vertices.append((outer_x,radius*(1+r*math.sin(a)),z+radius*r*math.cos(a)))
                faces.append(tuple(range(start,start+len(shape))))
    mesh = component("Tyre and wheel", vertices, faces, "rubber").data
    mesh.materials.append(materials["silver"])
    for poly in mesh.polygons:
        if 4*n <= poly.index < old_count and poly.index != old_count-2:
            poly.material_index = 1



def taxi_lantern(roof):
    # A conventional opal taxi lamp with a black weather seal. The nose of the
    # housing kicks back at the top, leaving a vertical face for the city name.
    hull("Roof lamp · rubber gasket", [(-.17,.48,roof-.002,.49,roof+.018),
         (.115,.46,roof-.002,.49,roof+.018)], "rubber")
    hull("Roof lamp · opal diffuser", [(-.155,.39,roof+.017,.33,roof+.075),
         (-.080,.49,roof+.017,.44,roof+.145),(.068,.49,roof+.017,.44,roof+.145),
         (.100,.46,roof+.017,.415,roof+.122)], "opal taxi lens")

    # Draw the strokes of 서울 on the lens itself. Coordinates are in glyph
    # units on the front face. The cut-out in ㅇ stays open when viewed nearby.
    lettering = [
        [(1,4),(2.85,7.4),(4.35,4.65)], [(6.55,2.1),(6.55,7.8)], [(4.55,5.67),(6.55,5.67)],
        [(10.10,6.81),(10.42,7.43),(11.22,7.74),(12.10,7.44),(12.44,6.81),
         (12.10,6.19),(11.22,5.88),(10.42,6.19),(10.10,6.81)],
        [(8.72,5.1),(13.76,5.1)], [(11.23,4.95),(11.23,4.15)],
        [(9.43,3.68),(13.11,3.68),(13.11,2.69),(9.58,2.69),(9.58,1.68),(13.3,1.68)]
    ]
    vertices, faces = [], []
    for stroke in lettering:
        for (x0,y0),(x1,y1) in zip(stroke,stroke[1:]):
            length = math.hypot(x1-x0,y1-y0)
            tx,ty=(x1-x0)/length,(y1-y0)/length
            # Square caps overlap just the ends of consecutive strokes.
            nx,ny=-ty*.29,tx*.29
            corners=[(x0-.17*tx+nx,y0-.17*ty+ny),(x0-.17*tx-nx,y0-.17*ty-ny),
                     (x1+.17*tx-nx,y1+.17*ty-ny),(x1+.17*tx+nx,y1+.17*ty+ny)]
            i=len(vertices)
            vertices.extend([((x-7.38)*.020,roof+.017+y*.013,.1015) for x,y in corners])
            faces.append((i,i+1,i+2,i+3))
    component("Roof lamp · 서울 lettering", vertices, faces, "Seoul lettering")


def taxi_body(width, depth):
    # Ten vertices per station describe the rocker, wheel shoulder and the
    # centre crown of the bonnet/deck. Their ends no longer form square boxes.
    sections = [
        (-.5,.74,.60,.51),(-.473,.91,.71,.595),(-.409,.975,.79,.657),
        (-.317,.998,.815,.688),(-.215,1,.835,.70),(.20,1,.846,.69),
        (.318,.995,.80,.658),(.422,.951,.719,.60),(.482,.875,.66,.55),(.50,.758,.61,.53)
    ]
    vertices=[]
    for pos,span,deck,belt in sections:
        w=width*span/2
        # The front bumper bottom sweeps up into its corners.
        sill=.27+.105*(abs(pos)/.5)**3
        vertices.extend([(x,y,pos*depth) for x,y in [
            (-w*.88,sill),(w*.88,sill),(w,sill+.12),(w,belt),
            (w*.86,deck-.023),(w*.55,deck),(-w*.55,deck),(-w*.86,deck-.023),
            (-w,belt),(-w,sill+.12)
        ]])
    sides=10
    faces=[tuple(range(sides))]
    for i in range(len(sections)-1):
        for j in range(sides):
            k=(j+1)%sides
            faces.append((i*sides+j,i*sides+k,(i+1)*sides+k,(i+1)*sides+j))
    faces.append(tuple(range(len(vertices)-sides,len(vertices))))
    component("Taxi shell · crowned bonnet, fenders and rear deck",vertices,faces,"paint")


def taxi_glass_trim(width, depth, roof):
    for side in (-1,1):
        # The dark frit surrounds each side glazing. A fine bright sill follows
        # the glass edge while the pillars taper towards the painted roof.
        for name,p0,p1 in [("A pillar",(.312,.837),(.104,roof-.048)),
                           ("Rear quarter pillar",(-.343,.837),(-.178,roof-.05))]:
            pos0,h0=p0;pos1,h1=p1
            vertices=[(side*width*.451,h0,depth*(pos0-.008)),(side*width*.451,h0,depth*(pos0+.008)),
                      (side*width*.399,h1,depth*(pos1+.008)),(side*width*.399,h1,depth*(pos1-.008))]
            component(name,vertices,[(0,1,2,3) if side>0 else (3,2,1,0)],"pillar")
        block("Side window lower brightwork",side*width*.47,.831,-.022*depth,.018,.018,depth*.56,"silver")
        # Slightly divergent swing-door seams appear in the near broadside view.
        vertices=[(side*width*.501,.385,-.145),(side*width*.501,.385,-.133),
                  (side*width*.501,.703,-.106),(side*width*.501,.703,-.118)]
        component("Centre door shutline",vertices,[(0,1,2,3) if side>0 else (3,2,1,0)],"pillar")


def taxi_fascia(width, depth):
    # Keep the conventional sedan lamps below the continuous narrow day light.
    z=depth/2+.040
    strip=[(-.44,.625),(-.37,.700),(-.18,.736),(0,.744),(.18,.736),(.37,.700),(.44,.625)]
    verts=[]
    for x,y in strip:
        verts.extend([(x*width,y,z-.044*abs(x)),(x*width,y+.025,z-.044*abs(x))])
    component("Front · continuous running light",verts,[(i,i+2,i+3,i+1) for i in range(0,len(verts)-2,2)],"taxi day light")
    for side in (-1,1):
        block("Lower projector bezel",side*width*.352,.55,z+.010,width*.137,.10,.018,"pillar")
        block("Projector glass",side*width*.352,.552,z+.022,width*.083,.044,.012,"opal taxi lens")
    for a,b in [(-.451,-.303),(-.291,.291),(.303,.451)]:
        vertices=[(a*width,.652,-depth/2-.036),(b*width,.652,-depth/2-.036),
                  (b*width,.687,-depth/2-.036),(a*width,.687,-depth/2-.036)]
        component("Rear pilot light",vertices,[(3,2,1,0)],"taxi rear light")
    # A yellow commercial plate reads at pedestrian distance without assigning
    # an identifiable registration to the cars in the simulation.
    for end,y in [(1,.477),(-1,.515)]:
        block("Commercial registration plate",0,y,end*(depth*.5+.046),.47,.112,.011,"hire plate")


def passenger(kind, w, h, d):
    van = kind == "van"
    belt = .98 if van else .83
    if kind == "taxi":
        taxi_body(w,d)
    else:
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
        taxi_lantern(roof)
        taxi_fascia(w,d)
        taxi_glass_trim(w,d,roof)


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


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for name, color in PALETTE.items():
        m = bpy.data.materials.new(name)
        m.diffuse_color = [((color >> shift & 255) / 255) ** 2.2 for shift in (16, 8, 0)] + [1]
        lamp_strength = {"opal taxi lens": .65, "taxi day light": 1.1, "taxi rear light": .82}.get(name)
        if lamp_strength:
            m.use_nodes = True
            bsdf = m.node_tree.nodes.get("Principled BSDF")
            bsdf.inputs["Base Color"].default_value = m.diffuse_color
            bsdf.inputs["Emission Color"].default_value = m.diffuse_color
            bsdf.inputs["Emission Strength"].default_value = lamp_strength
        materials[name] = m
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
                wheel(side,radius,z,w,alloy=kind=="taxi")
            if kind != "taxi":
                for end, mat in [(1,"headlamp"),(-1,"tail")]:
                    block("Lamp assembly",side*w*.33,.62,end*(d*.5+.004),w*.19,.135,.045,mat)
        block("Front grille",0,.52,d*.5+.012,w*(.66 if kind == "taxi" else .37),.15,.035,"pillar")
        collection['origin_x'] = (ix-3)*3.6
        for obj in collection.objects:
            obj.location.x += collection['origin_x']
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'terminal-fleet.blend'),compress=True)

# Re-export the artist's edited scene (including modifiers) without rebuilding it.
bpy.context.view_layer.update()
graph = bpy.context.evaluated_depsgraph_get()
data, material_names = {}, list(PALETTE)
for ix, (kind, size) in enumerate(DIMS.items()):
    collection = bpy.data.collections[kind]
    origin_x = collection.get('origin_x', (ix-3)*3.6)
    vertices, faces, tyre_parts = [], [], []
    for obj in collection.objects:
        if obj.type != 'MESH':
            continue
        evaluated = obj.evaluated_get(graph)
        mesh = evaluated.to_mesh()
        try:
            mesh.calc_loop_triangles()
            offset = len(vertices)//3
            for v in mesh.vertices:
                x, y, z = evaluated.matrix_world @ v.co
                vertices.extend(round(c*1000) for c in (x-origin_x,z,-y))
            wheel_start = len(faces)//4
            is_wheel = obj.name.startswith("Tyre and wheel")
            if is_wheel:
                shape = [vertices[i:i+3] for i in range(3*offset, len(vertices), 3)]
                lowest = min(y for x,y,z in shape)
                tread = [(x,z) for x,y,z in shape if y == lowest]
                cx, cz = (sum(v[i] for v in tread)/len(tread) for i in range(2))
            for tri in mesh.loop_triangles:
                name = mesh.materials[tri.material_index].name
                if name not in material_names:
                    material_names.append(name)
                faces.extend([*(i+offset for i in tri.vertices),material_names.index(name)])
            if is_wheel:
                tyre_parts.append([wheel_start, len(faces)//4, cx, lowest, cz])
        finally:
            evaluated.to_mesh_clear()
    quadrants = {(cx > 0, cz > 0) for _, _, cx, _, cz in tyre_parts if cx and cz}
    if len(tyre_parts) != 4 or len(quadrants) != 4:
        raise ValueError(f"{kind} requires one wheel in each quadrant for independent road contact")
    # Metres between the centreline/origin and each pair of tyre contact patches.
    contacts = [round(sum(abs(v[i]) for v in tyre_parts)/4000, 4) for i in (2,4)]
    data[kind] = {'size': size, 'contacts': contacts, 'wheels': tyre_parts, 'mm': vertices, 'faces': faces}

colors = []
emission = {}
for index, name in enumerate(material_names):
    rgb = bpy.data.materials[name].diffuse_color[:3]
    r,g,b = (max(0,min(255,round(c**(1/2.2)*255))) for c in rgb)
    colors.append((r<<16) | (g<<8) | b)
    material = bpy.data.materials[name]
    if material.use_nodes:
        bsdf = next((n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf and bsdf.inputs['Emission Strength'].default_value > 0:
            intensity = bsdf.inputs['Emission Strength'].default_value
            radiance = [round(c*intensity, 4) for c in bsdf.inputs['Emission Color'].default_value[:3]]
            if any(radiance):
                emission[index] = radiance
def packed(values):
    output = bytearray()
    for value in values:
        zigzag = 2*value if value >= 0 else -2*value-1
        while zigzag >= 128:
            output.append(128 | (zigzag & 127))
            zigzag >>= 7
        output.append(zigzag)
    return base64.b64encode(output).decode('ascii')


def face_deltas(faces):
    previous = 0
    for i in range(0, len(faces), 4):
        first, second, third, material = faces[i:i+4]
        yield from (first-previous, second-first, third-first, material)
        previous = first


with (OUT/"meshes.js").open("w") as f:
    f.write("// Blender export. Positions in mm, faces [a,b,c,material]; wheels [first triangle, end, contact X/Y/Z in mm].\n")
    f.write("import {vehicleMesh} from './geometry-codec.js';\n")
    f.write("export const palette = "+json.dumps(colors)+";\n")
    f.write("export const emission = "+json.dumps(emission)+";\n")
    f.write("export const vehicles = {\n")
    for kind, mesh in data.items():
        vertices = mesh['mm']
        xyz = packed(v - (vertices[i-3] if i >= 3 else 0) for i, v in enumerate(vertices))
        faces = packed(face_deltas(mesh['faces']))
        args = [mesh['size'], mesh['contacts'], mesh['wheels'], xyz, faces]
        arguments = ','.join(json.dumps(a, separators=(',', ':')) for a in args)
        f.write(f'  {json.dumps(kind)}:vehicleMesh({arguments}),\n')
    f.write("};\n")
