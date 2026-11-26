"""Run with blender -b -P build.py to recreate the editable stock and web bundles."""
from math import cos, pi, sin
from pathlib import Path
import runpy
import subprocess

import bpy
from mathutils import Vector

directory = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.preferences.filepaths.save_version = 0
palette = {
    'ivory': '#F3F0E6', 'steel': '#ACBAB7', 'wire': '#67787B', 'shadow': '#464B48',
    'paper': '#FFFEF5', 'fern': '#4C7768', 'aqua': '#8BBEB2', 'ink': '#3D5158',
    'clay': '#C77E66', 'petal': '#DFAFAA', 'oak': '#BD916E', 'grain': '#A77855',
    'mat': '#606E70', 'grid': '#BBC8BE', 'ice': '#C2D8D8', 'berry': '#94556B',
    'blue': '#7696A7', 'rose': '#C18F9B', 'cream': '#E2CB9D', 'salmon': '#D77C68',
}


def linear(value):
    return value / 12.92 if value <= .04045 else ((value + .055) / 1.055) ** 2.4


materials = {}
for name, hex_code in palette.items():
    rgb = [linear(int(hex_code[k:k + 2], 16) / 255) for k in (1, 3, 5)]
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*rgb, 1)
    materials[name] = mat


class Part:
    """Coordinates are right, forward toward the shopper, and height, in metres."""
    def __init__(self, collection, name):
        self.collection, self.name = collection, name
        self.vertices, self.faces, self.colors = [], [], []

    def shape(self, verts, faces, color):
        start = len(self.vertices)
        self.vertices.extend((x, -d, z) for x, d, z in verts)
        for face in faces:
            self.faces.append(tuple(start + i for i in reversed(face)))
            self.colors.append(color)

    def plate(self, poly, d, depth, color):
        """Extrude a counter-clockwise front outline toward the customer."""
        n = len(poly)
        if depth <= .003:
            # The hidden back and side walls of printed ink add no visible relief.
            self.shape([(x,d+depth,z) for x,z in poly],[tuple(reversed(range(n)))],color)
            return
        vertices = [(x, d, z) for x, z in poly] + [(x, d + depth, z) for x, z in poly]
        faces = [tuple(range(n)), tuple(reversed(range(n, 2*n)))]
        faces.extend((i, n+i, n+(i+1)%n, (i+1)%n) for i in range(n))
        self.shape(vertices, faces, color)

    def box(self, x, d, z, w, depth, h, color):
        a,b = w/2,h/2
        self.plate([(x-a,z-b),(x+a,z-b),(x+a,z+b),(x-a,z+b)],d-depth/2,depth,color)

    def rounded(self, x, d, z, w, h, r, depth, color):
        a,b=w/2-r,h/2-r
        contour = []
        for i, (cx,cz) in enumerate([(a,b),(-a,b),(-a,-b),(a,-b)]):
            for step in range(4):
                t=(i+step/3)*pi/2
                contour.append((x+cx+r*cos(t),z+cz+r*sin(t)))
        self.plate(contour,d,depth,color)

    def line(self, p0, p1, r, color, n=6, end_radius=None):
        a,b=Vector(p0),Vector(p1)
        axis=(b-a).normalized()
        tangent=axis.cross(Vector((1,0,0)) if abs(axis.x)<.9 else Vector((0,1,0))).normalized()
        bitangent=axis.cross(tangent)
        verts=[]
        for centre,radius in ((a,r),(b,end_radius if end_radius is not None else r)):
            for step in range(n):
                t=2*pi*step/n
                verts.append(centre+radius*(cos(t)*tangent+sin(t)*bitangent))
        faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]
        faces.extend((i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n))
        self.shape(verts,faces,color)

    def oval(self, x, d, z, a, b, depth, color, n=12):
        poly=[(x+a*cos(i*2*pi/n), z+b*sin(i*2*pi/n)) for i in range(n)]
        self.plate(poly,d,depth,color)

    def save(self):
        mesh=bpy.data.meshes.new(self.name)
        mesh.from_pydata(self.vertices,[],self.faces)
        matnames=list(dict.fromkeys(self.colors))
        for matname in matnames:
            mesh.materials.append(materials[matname])
        for poly,color in zip(mesh.polygons,self.colors):
            poly.material_index=matnames.index(color)
        mesh.update()
        obj=bpy.data.objects.new(self.name,mesh)
        self.collection.objects.link(obj)
        obj.location=self.collection['origin']
        return obj


def make_collection(name, bundle, x):
    c=bpy.data.collections.new(name)
    c['bundle'], c['origin'] = bundle, [x,0.,0.]
    bpy.context.scene.collection.children.link(c)
    return c


def gondola(c,accent,rail_heights):
    p=Part(c,'Powder-coated pegboard and shelf channels')
    p.box(0,.014,1.025,1.02,.034,1.81,'ivory')
    for side in [-1,1]:
        p.box(side*.525,.033,.985,.029,.088,1.96,'steel')
        p.box(side*.525,.082,1.005,.012,.009,1.89,'paper')
    p.box(0,.062,.10,1.07,.16,.15,'steel')
    p.box(0,.108,.16,1.065,.24,.042,'ivory')
    p.box(0,.057,1.865,1.04,.082,.142,accent)
    p.box(0,.102,1.805,1.04,.009,.012,'ivory')
    # Visible slots down both perforated edge bands and between the columns of stock.
    for i in range(13):
        for j in range(19):
            if j%2==0 and i%2: continue
            p.oval((i-6)*.078,.0315,.31+j*.079,.0065,.009,.001,'wire',8)
    for h in rail_heights:
        p.box(0,.141,h,1.06,.265,.025,'ivory')
        p.box(0,.265,h-.008,1.06,.022,.045,accent)
        for col in range(4):
            x=(col-1.5)*.243
            p.box(x,.279,h-.008,.148,.004,.031,'paper')
            p.box(x-.041,.282,h-.008,.047,.0015,.009,'ink')
            for j in range(6):
                p.box(x+.014+j*.006,.282,h-.009,.0018,.0015,.014,'wire')
    p.save()


def hanger(p,x,z,card,ink,w=.11,h=.083):
    p.line((x,.032,z+.024),(x,.15,z+.024),.004,'wire')
    p.line((x,.15,z+.02),(x,.15,z+.044),.004,'steel')
    p.rounded(x,.119,z,w,h,.010,.004,card)
    p.oval(x,.124,z+.025,.008,.005,.001,'shadow',8)
    p.box(x,.125,z-.010,w*.68,.002,.0035,ink)
    p.box(x-.012,.125,z-.019,w*.45,.002,.003,ink)


def scoop(p,x,z,col):
    # A continuous concave bowl catches light inside the ladle as the viewer walks past.
    n=18
    rings=[(.002,.129),(.42,.136),(.75,.152),(.94,.175),(1,.179),(.96,.17),(.72,.143),(.38,.128),(.002,.123)]
    points=[(x+.051*r*cos(i*2*pi/n),d,z+.062*r*sin(i*2*pi/n)) for r,d in rings for i in range(n)]
    faces=[(j*n+i,j*n+(i+1)%n,(j+1)*n+(i+1)%n,(j+1)*n+i) for j in range(len(rings)-1) for i in range(n)]
    p.shape(points,faces,col)


def hanging_utensil(c,name,x,top,kind,color):
    p=Part(c,name)
    hanger(p,x,top,'paper','fern')
    d=.144
    p.rounded(x,d,top-.092,.031,.132,.012,.015,'oak')
    p.line((x,d+.016,top-.055),(x+.002,d+.016,top-.128),.0015,'grain',5)
    p.oval(x,d+.016,top-.047,.005,.007,.001,'shadow',8)
    p.line((x,d+.006,top-.15),(x,d+.012,top-.231),.007,color,8,.010)
    z=top-.286
    if kind=='turner':
        # Two webs and four ribs leave three real slots open through the blade.
        p.plate([(x-.04,z+.027),(x+.04,z+.027),(x+.033,z+.049),(x+.012,z+.062),(x-.012,z+.062),(x-.033,z+.049)],d,.011,color)
        p.rounded(x,d,z-.041,.098,.024,.01,.011,color)
        for i in [-1.5,-.5,.5,1.5]:
            p.line((x+i*.021,d+.004,z+.035),(x+i*.027,d+.004,z-.043),.006,color,6)
    else:
        scoop(p,x,z,color)
    p.save()


def mitt(c,name,x,z,col,edge):
    p=Part(c,name)
    hanger(p,x,z+.166,'paper','fern')
    # Model the thumb and cuff into the outline rather than painting a rectangular carton.
    points=[(-.068,-.128),(.062,-.128),(.075,-.025),(.099,.022),(.108,.047),(.099,.063),(.080,.065),(.060,.043),(.041,.024),(.048,.08),(.041,.111),(.025,.131),(.005,.138),(-.026,.136),(-.048,.121),(-.06,.097),(-.066,.059)]
    p.plate([(x+a,z+b) for a,b in points],.145,.026,col)
    p.box(x,.173,z-.111,.139,.007,.029,edge)
    for j in range(4):
        cx=x-.043+j*.026
        p.line((cx-.009,.172,z-.074),(cx+.026,.172,z+.066),.0016,edge,5)
        p.line((cx+.024,.173,z-.067),(cx-.011,.173,z+.056),.0016,edge,5)
    p.save()


def folded_fabric(c,name,x,z,cols):
    p=Part(c,name)
    for i,col in enumerate(cols):
        h=z+.031*i
        p.rounded(x,.066,h,.225,.041,.014,.152,col)
        p.line((x-.095,.219,h+.006),(x+.087,.219,h+.006),.0026,'ivory',5)
        p.box(x+.048,.221,h,.041,.005,.028,'paper')
    p.save()


k=make_collection('DaisoKitchenEndcap','kitchen',-1.1)
gondola(k,'fern',[.29,.71])
for row,top in enumerate([1.67,1.22]):
    for i in range(6):
        kind='turner' if i%2==0 else 'ladle'
        hanging_utensil(k,f'{kind} · row {row+1}, hook {i+1}',(i-2.5)*.164,top,kind,
                        (['fern','steel','clay','ink','aqua','fern'] if row==0 else ['ink','clay','fern','steel','ink','aqua'])[i])
for i,col in enumerate(['aqua','clay','fern','cream']):
    mitt(k,'Quilted oven mitt '+str(i+1),(i-1.5)*.244,.54,col,'ivory')
    folded_fabric(k,'Folded kitchen textiles '+str(i+1),(i-1.5)*.247,.184,[col,'ivory',col])
    roll = Part(k,'Rolled cotton table mats '+str(i+1))
    cx=(i-1.5)*.247
    for j in range(2):
        x=cx+(j-.5)*.092
        roll.line((x,.065,.773),(x,.245,.773),.046,col,14)
        roll.line((x,.12,.773),(x,.17,.773),.048,'paper',14)
        for r,thread in [(.036,'ivory'),(.030,col),(.021,'ivory'),(.015,col),(.006,'ivory')]:
            roll.oval(x,.245+(0.045-r)*.08,.773,r,r,.001,thread)
    roll.save()


def cutting_mat(c,name,x,z):
    p=Part(c,name)
    hanger(p,x,z+.126,'paper','blue',.197,.06)
    p.rounded(x,.126,z,.21,.262,.012,.006,'mat')
    # Mark the grid and angle guides only within the printed part of the mat.
    for j in range(-4,5):
        p.box(x+j*.019,.134,z,.0018,.001,.222,'grid')
    for j in range(-5,6):
        p.box(x,.134,z+j*.020,.16,.001,.0018,'grid')
    for a,b in [((-.076,-.099),(.076,.053)),((-.076,-.099),(.004,.100))]:
        p.line((x+a[0],.136,z+a[1]),(x+b[0],.136,z+b[1]),.0013,'grid',4)
    for j in range(15):
        p.box(x-.084+j*.011,.134,z-.117,.0015,.001,.003+(j%5==0)*.005,'grid')
    p.save()


def writing_pack(c,name,x,z,colors):
    p=Part(c,name)
    hanger(p,x,z+.145,'paper','berry',.133,.061)
    p.rounded(x,.115,z,.127,.253,.009,.004,'ice')
    p.box(x,.121,z-.11,.12,.004,.027,'paper')
    for j,color in enumerate(colors):
        cx=x+(j-1)*.032
        p.line((cx,.132,z-.073),(cx,.132,z+.088),.0078,color,8)
        p.line((cx,.132,z-.075),(cx,.132,z-.093),.0052,'wire',8,.0013)
        p.line((cx,.132,z+.012),(cx,.132,z+.021),.0084,'steel',8)
        p.line((cx+.007,.138,z+.066),(cx+.014,.145,z+.062),.0026,'wire',5)
        p.line((cx+.014,.145,z+.062),(cx+.014,.145,z+.029),.0026,'wire',5)
    p.save()


def stapler(c,name,x,z,color):
    p=Part(c,name)
    # Front-facing cutaway packaging keeps the gap between driver arm and anvil visible.
    hanger(p,x,z+.092,'paper','berry',.133,.056)
    p.rounded(x,.116,z,.153,.14,.007,.004,'paper')
    p.box(x,.124,z+.045,.145,.007,.016,color)
    p.rounded(x,.128,z-.023,.124,.017,.007,.029,'ink')
    p.box(x+.035,.144,z-.011,.036,.019,.005,'steel')
    p.plate([(x-.052,z-.014),(x+.046,z+.001),(x+.045,z+.008),(x-.052,z-.006)],.13,.022,'wire')
    p.plate([(x-.059,z-.009),(x-.048,z+.008),(x+.051,z+.029),(x+.061,z+.026),(x+.061,z+.016),(x+.051,z+.01),(x-.04,z-.006)],.132,.028,color)
    p.line((x-.053,.128,z-.011),(x-.053,.164,z-.011),.008,'steel',10)
    p.line((x-.038,.163,z+.002),(x+.047,.163,z+.021),.002,'ice',5)
    p.save()


def pocket_notebooks(c,name,x,z,colors):
    p=Part(c,name)
    for i,col in enumerate(colors):
        cx=x+.003*(i%2)
        base=z+i*.029
        p.rounded(cx,.067,base,.209,.028,.009,.152,col)
        p.box(cx+.005,.218,base,.192,.007,.014,'paper')
        p.box(cx-.075,.223,base,.018,.006,.027,col)
    p.save()


s=make_collection('DaisoStationeryEndcap','stationery',1.1)
gondola(s,'blue',[.29,.70])
for i in range(4):
    cutting_mat(s,'Cutting mat · column '+str(i+1),(i-1.5)*.242,1.528)
for i in range(6):
    colors=(['ink','rose','blue'],['blue','fern','cream'],['salmon','rose','ink'])[i%3]
    writing_pack(s,'Metal-clip pen assortment '+str(i+1),(i-2.5)*.164,1.065,colors)
for i,col in enumerate(['ice','rose','blue','ice','aqua']):
    stapler(s,'Mini stapler · hook '+str(i+1),(i-2)*.192,.505,col)
for i,col in enumerate(['rose','fern','blue','cream']):
    pocket_notebooks(s,'Stack of pocket notebooks '+str(i+1),(i-1.5)*.247,.182,[col,'ivory',col])
    pocket_notebooks(s,'Memo pads on lower shelf '+str(i+1),(i-1.5)*.247,.320,['ivory',col])
    book=Part(s,'Pocket notebooks with elastic closure '+str(i+1))
    cx=(i-1.5)*.247
    for j in range(2):
        x=cx+(j-.5)*.106
        book.rounded(x,.146,.791,.097,.146,.005,.014,'paper')
        book.rounded(x,.161,.791,.100,.146,.005,.005,col)
        book.box(x-.036,.168,.791,.009,.003,.142,'ivory')
        book.box(x+.028,.169,.791,.006,.002,.146,'ink')
        book.box(x-.002,.17,.819,.041,.002,.019,'paper')
        book.box(x-.002,.172,.819,.023,.001,.003,'ink')
    book.save()
# Leave the native file open on both editable endcaps.
from mathutils import Euler
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type=='VIEW_3D':
            space=area.spaces.active
            space.region_3d.view_distance=4.35
            space.region_3d.view_location=(0,0,.96)
            space.region_3d.view_rotation=Euler((pi/2,0,0)).to_quaternion()
            space.shading.color_type='MATERIAL'
            space.overlay.show_overlays=False
bpy.ops.wm.save_as_mainfile(filepath=str(directory/'merchandise.blend'),compress=True)
runpy.run_path(str(directory.parent/'architectural-retail'/'export.py'),run_name='__main__')

subprocess.run(['node',str(directory/'pack.mjs')],check=True)
