"""Blender -b --python build.py; to re-export edits open the .blend and append -- --export-current."""
import json
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
ox, oz = -360, 72
materials = {}
def material(hexcode):
    if hexcode not in materials:
        m = bpy.data.materials.new(f'{hexcode:06x}')
        m.diffuse_color=[((hexcode>>n&255)/255)**2.2 for n in (16,8,0)]+[1]
        m['srgb']=hexcode
        materials[hexcode]=m
    return materials[hexcode]

def panel(name, x, z, bottom, width, height, depth, rot, color):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x-ox,oz-z,bottom+height/2))
    o=bpy.context.object
    o.name=name
    o.rotation_euler.z=rot
    o.scale=(width,depth,height)
    o.data.materials.append(material(color))
    o['part']='panel'
    return o

def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    osm=json.loads((ROOT/'data/osm.json').read_text())
    poly=next(b['poly'] for b in osm['buildings'] if b['id']==412970176)
    height=19.5
    verts=[(x-ox,oz-z,y) for y in (0,height) for x,z in poly]
    n=len(poly)
    faces=[tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new('OSM roof and walls');mesh.from_pydata(verts,[],faces)
    shell=bpy.data.objects.new('Five-storey stone shell',mesh);bpy.context.collection.objects.link(shell)
    mesh.materials.append(material(0x797681));shell['part']='shell'
    for edge,(a,b) in enumerate(zip(poly,poly[1:]+poly[:1])):
        length=math.dist(a,b);ux,uz=(b[0]-a[0])/length,(b[1]-a[1])/length
        nx,nz=-uz,ux
        rot=math.atan2(nx,nz)
        def place(name,s,bottom,w,h,d,offset,col):
            return panel(name,a[0]+ux*s+nx*offset,a[1]+uz*s+nz*offset,bottom,w,h,d,rot,col)
        place('Roof coping',length/2,height,length+.05,.19,.26,.07,0x4e505a)
        front=edge in (4,5,6)
        bays=max(1,round(length/(7.6 if front else 9.4)))
        span=length/bays
        for i in range(bays):
            mid=(i+.5)*span
            # The hollow-feeling glazed vertical recess and its lintel are visible
            # on the north frontage to the west of the clinic window stack.
            if edge==6 and i==0:
                place('Recess surround',mid,1.0,span-.42,17.66,.12,.11,0x484852)
                place('Recess glazing',mid,1.16,span-.95,16.75,.14,.22,0x51778b)
                for row in range(1,12):
                    place('Atrium transom',mid,1.16+row*1.38,span-.90,.090,.14,.27,0x424856)
                for j in [-1,0,1]:
                    place('Atrium mullion',mid+j*span/4,1.16,.068,16.75,.15,.28,0x646f79)
                continue
            for f in range(5):
                base=f*3.78
                width=span*(.88 if f==0 else .69)
                glass_h=2.86 if f==0 else 1.6
                y=base+(.28 if f==0 else .90)
                place('Window reveal',mid,y-.09,width+.18,glass_h+.18,.12,.055,0x393d49)
                place('Glazing',mid,y,width,glass_h,.10,.13,[0x405867,0x567984,0x617e8b][(i+f)%3])
                for j in [-1,1]:
                    place('Aluminium glazing bar',mid+j*width/6,y,.045,glass_h,.085,.205,0x788592)
                place('Sill',mid,y-.04,width+.25,.09,.24,.17,0x9ca1a7)
        for f in range(1,6):
            place('Cladding horizontal joint',length/2,f*3.77-.09,length,.035,.036,.032,0x555561)
        if edge==5:
            # Repeated metal rings around the narrow glazed column on the clipped corner.
            for t in range(8):
                ang=-math.pi/2+(t+.5)*math.pi/8
                cx=a[0]+ux*length*.72; cz=a[1]+uz*length*.72
                dx,dz=(ux*math.sin(ang)+nx*math.cos(ang),uz*math.sin(ang)+nz*math.cos(ang))
                yaw=math.atan2(dx,dz)
                panel('Curved bay glass',cx+1.0*dx,cz+1.0*dz,.84,.41,17.1,.14,yaw,0x466475)
                for y in range(2,18):
                    panel('Curved transom',cx+1.08*dx,cz+1.08*dz,y,.44,.11,.12,yaw,0x4b505b)
    scene=bpy.context.scene;scene.unit_settings.system='METRIC'
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'centre.blend'),compress=True)

def export():
    boxes=[]
    for o in sorted(bpy.context.scene.objects,key=lambda o:o.name):
        if o.get('part')!='panel': continue
        center=o.matrix_world @ (sum((Vector(p) for p in o.bound_box),Vector())/8)
        size=Vector(o.bound_box[6])-Vector(o.bound_box[0]);size=Vector([abs(a*b) for a,b in zip(size,o.scale)])
        boxes.append([round(ox+center.x,3),round(oz-center.y,3),round(center.z-size.z/2,3),
                      round(size.x,3),round(size.z,3),round(size.y,3),round(o.rotation_euler.z,5),o.data.materials[0]['srgb']])
    shell=next(o for o in bpy.context.scene.objects if o.get('part')=='shell')
    height=round(max((shell.matrix_world@v.co).z for v in shell.data.vertices),3)
    with (OUT/'panels.js').open('w') as f:
        f.write('// Exported from centre.blend: x, z, bottom, width, height, depth, yaw, sRGB.\n')
        f.write(f'export const height = {height};\nexport const panels = [\n')
        for box in boxes: f.write('  '+json.dumps(box,separators=(',',':'))+',\n')
        f.write('];\n')

if '--export-current' not in sys.argv: build()
export()
