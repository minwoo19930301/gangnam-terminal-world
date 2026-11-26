"""Editable glass bodies, reflectors and light engines for the photographed displays."""

from math import atan2, cos, exp, pi, sin
import bpy
from mathutils import Vector


def optical_finishes(finish):
    silver = finish("Naturally anodised silver", "dbe0db", "Metal")
    silver.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.32
    dark = finish("Die cast black aluminium", "23282b", "Metal")
    milk = finish("Matt reflector enamel", "f8f6e9")
    gloss = finish("Gloss white reflector enamel", "f6f3e9")
    gloss.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.18
    milk["reflector"] = True
    led = finish("Opal silicone and optical lens", "fff8dd", "Diffuser")
    node = led.node_tree.nodes["Principled BSDF"]
    node.inputs["Emission"].default_value = (1, .87, .68, 1)
    node.inputs["Emission Strength"].default_value = 2.2
    led["ledRing"] = True
    glass = bpy.data.materials.new("Clear blown glass · polished lips")
    glass.diffuse_color = (.89, .96, .95, 1)
    glass.use_nodes = True
    node = glass.node_tree.nodes["Principled BSDF"]
    node.inputs["Base Color"].default_value = (.975, .993, .988, 1)
    node.inputs["Transmission"].default_value = 1
    node.inputs["Roughness"].default_value = .025
    node.inputs["IOR"].default_value = 1.49
    glass["batch"] = "Glass"
    return silver, dark, milk, gloss, led, glass


def shell(collection, name, rows, material, keep=None, paint=None):
    """Join circular rows with open ends. A closed glass profile includes its own inner wall."""
    n = len(rows[0])
    verts = [xyz for row in rows for xyz in row]
    faces = [(j*n+i, j*n+(i+1)%n, (j+1)*n+(i+1)%n, (j+1)*n+i)
             for j in range(len(rows)-1) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    mesh.materials.append(material)
    for face in mesh.polygons:
        face.use_smooth = True
    if keep is not None:
        mask = mesh.attributes.new("outerAndLip", "BOOLEAN", "FACE")
        mask.data.foreach_set("value", [j < keep for j in range(len(rows)-1) for _ in range(n)])
    if paint:
        tint = mesh.color_attributes.new(name="Window", type="BYTE_COLOR", domain="POINT")
        for j, row in enumerate(rows):
            for i, xyz in enumerate(row):
                tint.data[j*n+i].color = paint(j, i*2*pi/n, xyz)
    return obj


def revolve(collection, name, x, y, z, profile, material, n=48):
    rows = [[(r*cos(i*2*pi/n), r*sin(i*2*pi/n), h) for i in range(n)] for r,h in profile]
    obj = shell(collection, name, rows, material)
    obj.location = (x,y,z)
    return obj


def cable(collection, name, points, radius, material, sections=8):
    pts = [Vector(p) for p in points]
    rows = []
    for i,p in enumerate(pts):
        tangent = (pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized()
        up = Vector((0,0,1)) if abs(tangent.z) < .85 else Vector((0,1,0))
        u = tangent.cross(up).normalized()
        v = tangent.cross(u).normalized()
        rows.append([p+radius*(u*cos(j*2*pi/sections)+v*sin(j*2*pi/sections)) for j in range(sections)])
    return shell(collection, name, rows, material)


def window_color(a, z, edge, rounded=False):
    # Thin and broad reflections of the showroom's linear luminaires. The
    # transparent base and single-sided PBR specular still respond in play.
    def band(angle, width):
        delta = atan2(sin(a-angle),cos(a-angle))
        return exp(-((delta/width)**2))
    broad = band(-1.02+.06*sin(z*9), .19) + .65*band(1.89, .24)
    strip = band(-2.78+.025*sin(z*14), .042)+.89*band(-.14-.035*sin(z*12), .051)
    if rounded:
        strip += .33*band(.99+.35*z,.091)
    alpha = min(.76,.068+.19*broad+.45*strip+.37*edge)
    warm = .09*broad
    return (.73+warm, .86+warm*.55, .87+warm*.4, alpha)


def taccia(collection, mats, x, y, z):
    silver,dark,milk,gloss,led,glass=mats
    revolve(collection,"Taccia · nickel-plated foot",x,y,z,
            [(.002,0),(.0665,0),(.071,.0026),(.071,.009),(.069,.012),(.059,.014)], silver)
    revolve(collection,"Taccia · dark inset between the foot and extrusion",x,y,z,
            [(.057,.013),(.060,.014),(.060,.018),(.057,.019)], dark)
    # Rounded faces along the extruded aluminium ribs, with a trough between
    # each pair. Rings are rings in the source too, so artists can edit the relief.
    n=16
    rows=[]
    for h,amp in [(.017,.72),(.019,1),(.023,1),(.178,1),(.181,1),(.183,.64)]:
        row=[]
        for rib in range(n):
            for step,radius in [(0,.054),(.12,.0564),(.22,.064),(.31,.065),
                                (.62,.065),(.73,.0636),(.86,.0554)]:
                a=2*pi*(rib+step)/n
                rr=.054+(radius-.054)*amp
                row.append((rr*cos(a),rr*sin(a),h))
        rows.append(row)
    obj=shell(collection,"Taccia · sixteen fluted aluminium extrusions",rows,silver)
    obj.location=(x,y,z)
    revolve(collection,"Taccia · head cradle",x,y,z,[(.056,.180),(.060,.185),(.064,.188),(.064,.195),(.060,.199),(.049,.200)],silver)
    revolve(collection,"Taccia · warm optical aperture",x,y,z,[(.050,.197),(.051,.201),(.046,.202),(.009,.203),(.001,.203)],led)
    # The borosilicate bowl sits on the cradle. The rolled lip is cut on an
    # oblique plane through the sphere; a tilted hemisphere would lift one side
    # of the foot clear of its socket.
    radius=.1865
    center_z=.376
    tilt=.49
    normal=Vector((-sin(tilt)*.92,sin(tilt)*.39,cos(tilt))).normalized()
    n=112
    sections=[(t,radius) for t in [0,.025,.065,.12,.20,.30,.42,.54,.66,.76,.85,.92,.965,.989,1]]
    sections.extend([(1.004,radius-.0010),(1.001,radius-.0025)])
    visible=len(sections)-1
    sections.extend([(t,radius-.0025) for t in [.986,.96,.91,.84,.72,.58,.43,.29,.16,.07,0]])
    rows=[]
    for t,r in sections:
        row=[]
        for i in range(n):
            a=i*2*pi/n
            rim=atan2(normal.z,normal.x*cos(a)+normal.y*sin(a))
            theta=.284+(rim-.284)*t
            waviness=1+.0016*sin(5*a+.7*t)*sin(t*pi)**2+.0007*sin(11*a-2*t)
            row.append((r*waviness*sin(theta)*cos(a),r*waviness*sin(theta)*sin(a),center_z-r*cos(theta)))
        rows.append(row)
    def paint(j,a,p):
        edge=min(1,max(0,1-abs(j-14)/2.7))+.4*max(0,1-j/2)
        return window_color(a,p[2],edge,True)
    bowl=shell(collection,"Taccia · adjustable transparent hand-blown bowl",rows,glass,visible,paint)
    bowl.location=(x,y,z)
    # The slightly recessed white metal reflector closes the slanted aperture;
    # the lower face receives light emitted upward from the foot.
    u=Vector((1,0,0));u=(u-normal*u.dot(normal)).normalized();v=normal.cross(u)
    center=Vector((0,0,center_z))
    for title,profile,mat in [
        ("Taccia · satin white underside",[(.001,-.033),(.055,-.030),(.106,-.022),(.150,-.011),(.174,-.003),(.1836,.0001)],milk),
        ("Taccia · gloss outside and crimped rim",[(.1836,.0001),(.1842,.0010),(.1834,.0025),(.177,.0032),(.153,-.006),(.108,-.018),(.056,-.026),(.001,-.029)],gloss),
    ]:
        rows=[[center+normal*h+r*(u*cos(i*2*pi/n)+v*sin(i*2*pi/n)) for i in range(n)] for r,h in profile]
        part=shell(collection,title,rows,mat);part.location=(x,y,z)
    pts=[(x+.036,y+.052,z+.014),(x+.056,y+.091,z+.0035),(x+.127,y+.112,z+.0035),
         (x+.211,y+.119,z+.0035),(x+.268,y+.142,z+.0035),(x+.318,y+.153,z+.0035)]
    cable(collection,"Taccia · pale dimmer lead",pts,.0028,silver)
    cable(collection,"Taccia · in-line control sleeve",[pts[-1],(x+.373,y+.164,z+.0075)],.007,silver,12)


def noctambule(collection,mats,x,y,z):
    silver,dark,_milk,_gloss,led,glass=mats
    revolve(collection,"Noctambule · 550 mm die-cast foot",x,y,z,
            [(.001,.001),(.267,.001),(.273,.003),(.275,.008),(.273,.014),(.262,.017),(.125,.022),(.10,.033),(.001,.033)],dark,96)
    floor=.048; pitch=.527; n=88
    for k in range(5):
        h=floor+k*pitch
        revolve(collection,"Noctambule · folded black end casting",x,y,z+h,
                [(.002,-.017),(.083,-.017),(.103,-.012),(.107,-.006),(.106,.012),(.101,.017),(.079,.020),(.002,.020)],dark,64)
        for offset in ([-.003,.010] if k in (1,2,3) else [.003]):
            revolve(collection,"Noctambule · optical silicone ring",x,y,z+h+offset,
                    [(.100,-.0038),(.104,-.0042),(.109,-.002),(.1095,.0015),(.107,.0048),(.103,.0052),(.101,.004)],led,80)
        if k==4: break
        profile=[(.081,.016),(.089,.019),(.100,.025),(.109,.036),(.114,.051),(.116,.076),
                 (.1168,.143),(.117,.267),(.1169,.396),(.115,.456),(.112,.473),(.106,.486),
                 (.097,.495),(.084,.502),(.079,.505)]
        ring=profile+[(r-.0029,h-.001) for r,h in reversed(profile)]
        rows=[[(r*(1+.0014*sin(3*i*2*pi/n+.48*k))*cos(i*2*pi/n),r*sin(i*2*pi/n),h) for i in range(n)] for r,h in ring]
        def paint(j,a,p):
            edge=max(0,1-min(j,abs(j-(len(profile)-1)))/2.5)*.77
            return window_color(a,p[2]+k*.017,edge)
        sleeve=shell(collection,"Noctambule · clear blown cylinder "+str(k+1),rows,glass,len(profile),paint)
        sleeve.location=(x,y,z+h)
        # The front view in the shop reads as a slender, nearly central black
        # line. The return at each collar is visible from an oblique angle.
        cable(collection,"Noctambule · hydroformed internal arm",
              [(x,y+.006,z+h+.012),(x+.018,y+.038,z+h+.023),(x+.020,y+.047,z+h+.044),
               (x+.020,y+.047,z+h+.479),(x+.016,y+.033,z+h+.491),(x,y+.006,z+h+.507)],.0074,dark,12)
    cable(collection,"Noctambule · floor lead",[(x+.118,y+.135,z+.014),(x+.171,y+.205,z+.006),
          (x+.261,y+.258,z+.005),(x+.305,y+.321,z+.005),(x+.321,y+.402,z+.005)],.0032,dark)
