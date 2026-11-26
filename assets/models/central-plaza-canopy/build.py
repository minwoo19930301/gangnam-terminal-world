"""Edit the original collection, then run with --export-current to refresh the game mesh and outline."""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import bpy

HERE = Path(__file__).resolve().parent
COLLECTION = 'CentralCityCourtCanopy'
# Native X runs along the front, positive Y faces the street, Z is up.
CENTER_S, CENTER_T = -32.2, 26.85
corners = [(x,y) for x in (-2.28,2.28) for y in (-1,1)]
bench_points = [(x,y) for y in (-.61,.61) for x in (-.70,.70)]
support_points = corners + bench_points + [(0,0)]


def floor_at_supports():
    js="""import{terminalPoint as P}from'./js/places/sweet-park-plan.js';
import{relief}from'./js/banpo_relief.js';const [s,t,points]=JSON.parse(process.argv[1]);
const mid=relief(...P(s,t));console.log(JSON.stringify(points.map(([x,y])=>.018+relief(...P(s-y,t+x))-mid)));"""
    args = json.dumps([CENTER_S,CENTER_T,support_points])
    data = subprocess.check_output(['node','--input-type=module','-e',js,args],cwd=HERE.parents[2],text=True)
    return dict(zip(support_points,json.loads(data)))


def material(name, hex_color, metal=0):
    rgb = [int(hex_color[i:i+2],16)/255 for i in (0,2,4)]
    color = tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)+(1,)
    m = bpy.data.materials.new(name)
    m.diffuse_color = color
    m.use_nodes = True
    shader=m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value=color
    shader.inputs['Roughness'].default_value=.55 if metal else .73
    shader.inputs['Metallic'].default_value=metal
    return m


def box(name,x,y,low,w,d,high,mat,proxy=None,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,(low+high)/2))
    o=bpy.context.object
    o.name=name
    o.dimensions=(w,d,high-low)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    bpy.context.collection.objects.unlink(o)
    group.objects.link(o)
    o.data.materials.append(mat)
    if bevel:
        mod=o.modifiers.new('가장자리 모따기','BEVEL')
        mod.width=bevel;mod.segments=1
        mod=o.modifiers.new('평면 법선','WEIGHTED_NORMAL')
    if proxy:
        o['shelter_outline']=proxy
    return o


def build():
    grade=floor_at_supports()
    steel=material('무광 금속 모서리','555753',.32)
    charcoal=material('검은 섀시와 분리 줄눈','454541',.25)
    pale=material('밝은 회백색 처마판','ccc9b9')
    roof=material('지붕과 처마 하부','aaa99c')
    oak=material('황갈색 기둥 마감','be814a')
    oak_dark=material('목재 수직 결','9b663d')
    orange=material('지붕 루버의 적갈색 날개','ae6740')
    seat=material('담회색 좌판과 받침','c8c8b9')
    mid=material('중앙 기둥 마감','a7aaa4')
    for i,(x,y) in enumerate(corners,1):
        foot=grade[x,y]
        box(f'기둥 {i} · 바닥 금속 받침',x,y,foot-.020,.28,.29,foot+.065,steel)
        box(f'기둥 {i} · 목재색 각재',x,y,foot+.045,.235,.245,2.37,oak,'post',.012)
        # Two metal edge trims border each post in the close public photograph.
        for sign in (-1,1):
            box(f'기둥 {i} · 세로 테두리 {sign}',x+sign*.113,y,foot+.065,.018,.248,2.37,steel)
        box(f'기둥 {i} · 패널 이음',x,y,1.12,.239,.249,1.134,oak_dark)
    box('처마 · 짙은 아랫단',0,0,2.345,4.99,2.39,2.402,charcoal)
    trim=box('처마 · 테두리 몸체',0,0,2.39,5.0,2.40,2.728,steel,'roof')
    trim['distant_color']=pale.name
    for sign in (-1,1):
        for i in range(6):
            box(f'긴 처마 {sign} · 분할 패널 {i+1}',-2.5+(i+.5)*5/6,sign*1.205,2.43,5/6-.031,.024,2.691,pale)
        for i in range(3):
            box(f'짧은 처마 {sign} · 분할 패널 {i+1}',sign*2.505,-1.2+(i+.5)*.8,2.43,.024,.77,2.691,pale)
    box('상부 얇은 덮개',0,0,2.725,5.02,2.42,2.757,roof)
    # The reference shows three reddish horizontal blades around a darker rooftop box.
    vent=box('지붕 · 루버 뒤 어두운 면',0,-.04,2.753,2.65,1.12,3.006,charcoal,'louver')
    vent['distant_color']=orange.name
    for row in range(3):
        z=2.774+.083*row
        for side in (-1,1):
            box(f'루버 가로 날 {row+1} · {side}',0,-.04+side*.58,z,2.70,.045,z+.045,orange)
            box(f'루버 옆 날 {row+1} · {side}',side*1.33,-.04,z,.045,1.13,z+.045,orange)
    box('루버 위 단차 덮개',0,-.04,3.011,2.76,1.23,3.059,steel)
    box('작은 지붕 꼭지',0,-.04,3.055,.11,.12,3.226,roof,bevel=.012)
    for y,label in ((-.61,'건물쪽'),(.61,'광장쪽')):
        top=max(grade[x,y] for x in (-.70,.70))+.47
        for x in (-.70,.70):
            box(f'{label} 의자 · 받침 {x}',x,y,grade[x,y]-.018,.15,.415,top-.075,seat)
        box(f'{label} 의자 · 얇은 좌판',0,y,top-.087,1.56,.435,top,seat,'bench',.017)
    box('중앙의 회색 세로판',0,0,grade[0,0]-.014,.61,.195,2.36,mid,'panel')
    box('중앙 선반 · 받침',-.13,0,.72,.74,.20,.82,mid)
    box('중앙 선반 · 밝은 상판',-.13,0,.82,1.47,.47,.88,seat,'shelf',.014)
    for side in (-1,1):
        box(f'세로판 · 짙은 삽입면 {side}',.125,side*.102,1.01,.15,.016,1.69,charcoal)
    bpy.context.view_layer.update()


def export():
    group=bpy.data.collections[COLLECTION]
    objects=list(group.objects)
    coords=[]
    for o in objects:
        role=o.get('shelter_outline')
        if not role:continue
        from mathutils import Vector
        vs=[o.matrix_world@Vector(c) for c in o.bound_box]
        lo=[min(v[i] for v in vs) for i in range(3)]
        hi=[max(v[i] for v in vs) for i in range(3)]
        m=(bpy.data.materials[o['distant_color']] if 'distant_color' in o else o.data.materials[0]).diffuse_color
        rgb=''.join(f'{round(255*(12.92*c if c<=.0031308 else 1.055*c**(1/2.4)-.055)):02x}' for c in m[:3])
        coords.append([role,*[round(v,4) for v in [*lo,*hi]],rgb])
    if len(coords)!=10:raise ValueError('Check the four posts, two benches, panel, shelf, canopy and rooftop outline')
    runtime=HERE.parents[2]/'js/places/centralcity.js'
    code=runtime.read_text()
    begin='    // BEGIN COURT CANOPY OUTLINE\n';end='    // END COURT CANOPY OUTLINE'
    replacement=code[:code.index(begin)+len(begin)]+'    const courtCanopyOutline=[\n'
    replacement+=''.join('      '+json.dumps(row,separators=(',',':'))+',\n' for row in coords)
    replacement+='    ];\n'+code[code.index(end):]
    if replacement!=code:runtime.write_text(replacement)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        bpy.context.view_layer.objects.active=o
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
        attr=o.data.color_attributes.new(name='COLOR_0',type='BYTE_COLOR',domain='CORNER')
        for v in attr.data:v.color=o.data.materials[0].diffuse_color
        o.data.materials.clear()
        o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    bpy.context.object.name='Surface'
    with tempfile.TemporaryDirectory() as tmp:
        raw=Path(tmp)/'canopy.glb'
        bpy.ops.export_scene.gltf(filepath=str(raw),use_selection=True,export_materials='NONE',export_vertex_color='ACTIVE')
        subprocess.run(['node',str(HERE.parent/'sinbanpo-plaza-planters/pack.mjs'),str(raw),str(HERE/'canopy.glb')],check=True)


if '--export-current' not in sys.argv:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    group=bpy.data.collections.new(COLLECTION)
    bpy.context.scene.collection.children.link(group)
    build()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'canopy.blend'),compress=True)
export()
