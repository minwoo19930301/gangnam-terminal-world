"""Build the four garments, two open visors and retail furniture for the 5F NewCore branch."""
from pathlib import Path
import sys,json,subprocess
import bpy
from mathutils import Vector

here=Path(__file__).resolve().parent
sys.dont_write_bytecode=True;sys.path[:0]=[str(here),str(here.parents[2]/'tools')]
import blender_shop_mesh as m
from blender_display_export import bake_collection
import knit,visors,sweater,puffer,fixtures,room,bake
import export as golf_export

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene;scene.name='뉴코아 2관 5층 · 아디다스골프';scene.unit_settings.system='METRIC'
scene['operator_floor']='https://www.elandretail.com/upload/20261111151159_0.jpg'
scene['branch_products']='https://map.naver.com/p/entry/place/1661537645'
scene['display_dimensions']='Estimated from the game bay. Local Naver store listings identify the 4 garments, visitor photos the visors.'
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {rows,catalog,prefix} from './layout.js';console.log(JSON.stringify({rows,catalog,prefix}));"],cwd=here))
tones={'white':'f3f2ea','ivoryMesh':'ebe9e2','sweat':'d0cdc0','ivoryEdge':'e2dfd7','thread':'cac9c1',
       'navy':'171e33','navyDark':'161b29','navyEdge':'30374b','tonalStripe':'d0cfca','pearlLilac':'bca9c0',
       'pearlMint':'b1c4b8','pearlAmber':'c1aca1','edgeInk':'626173','steel':'a7a8a6','ink':'222324',
       'seam':'545251','blackKnit':'222323','nylon':'292a2c','nylonLight':'2c2d2e','nylonSeam':'202224',
       'lining':'191b1a','labelGreen':'397f4f','zipper':'5a5a54','oak':'b28c67','stoneA':'d1cfca',
       'stoneB':'dcdad4','warmLight':'fff3d5','grout':'a8a6a0','tileWarm':'cecac1','tileCool':'c5c5bf',
       'tilePlain':'c9c6be','paint':'ebe9e2','trim':'b7b7af','curtain':'737570','hook':'6c6e6b'}
for key,hexcode in tones.items():
    metal={'steel':.74,'zipper':.63,'pearlLilac':.38,'pearlMint':.38,'pearlAmber':.38}.get(key,0)
    mat=m.palette[key]=m.material(key,hexcode,metal)
    nodes=mat.node_tree.nodes;shader=nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value=.28 if metal else .43 if key in ['nylon','nylonLight'] else .66
    if key.startswith('pearl'):shader.inputs['Thin Film Thickness'].default_value=468
    if key in ['ivoryMesh','navy','sweat','blackKnit','nylon','nylonLight','lining']:
        noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=370 if 'nylon' in key else 520
        bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.14
        bump.inputs['Distance'].default_value=.00036
        mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);mat.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    if key.startswith('tile') or key in ['paint','curtain']:
        noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=95 if key!='curtain' else 270
        noise.inputs['Detail'].default_value=2.4
        bump=nodes.new('ShaderNodeBump');bump.inputs['Distance'].default_value=.00062;bump.inputs['Strength'].default_value=.17
        mat.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);mat.node_tree.links.new(bump.outputs['Normal'],shader.inputs['Normal'])
    if key=='warmLight':
        shader.inputs['Emission Color'].default_value=(*mat.diffuse_color[:3],1);shader.inputs['Emission Strength'].default_value=2
for key in knit.VARIANTS:knit.native(m,key,knit.atlas(here,key))
groups={}
for key,(label,*_) in data['catalog'].items():
    name=data['prefix']+label;coll=bpy.data.collections.new(name);groups[key]=coll;m.group=coll
    scene.collection.children.link(coll);coll['preview_origin']=[0,0,0]
    if key=='envelope':room.envelope()
    elif key=='shelf':room.size_shelf()
    elif key=='bench':room.folding_bench()
    elif key.startswith('fold'):room.fold(key[4:].lower())
    elif key in knit.VARIANTS:sweater.pullover(key);fixtures.hanger()
    elif key=='puffer':puffer.jacket();fixtures.hanger()
    elif key in ['bow','navy']:visors.visor(key=='navy')
    elif key=='fascia':fixtures.fascia()
    elif key=='table':fixtures.accesstable()
    elif key=='back':
        fixtures.backwall()
        for i,sku in enumerate(['KR5437','KH4086','KR5424','KR5425']):
            before=set(coll.objects);fixtures.tag(sku)
            for ob in set(coll.objects)-before:ob.location=((i-1.5)*.98,.252,.251)
    bpy.context.view_layer.update()
    if key in ['wine','foldWine']:golf_export.sweater(here,coll,'sweater' if key=='wine' else 'folded')
    elif key not in knit.VARIANTS and not key.startswith('fold') and key not in bake.SIZES:
        bake_collection(coll,key,here/(key+'.glb'),simplification=(.82,.00022),preserve_smoothing=True)
# One cut pattern and one folded shape serve the three yarn colours in both renderers.
for canonical,variants in [('wine',['black','ice']),('foldWine',['foldBlack','foldIce'])]:
    reference=list(groups[canonical].objects)
    for variant in variants:
        originals=list(groups[variant].objects);assert len(originals)==len(reference)
        for master,ob in zip(reference,originals):
            old=ob.data;paint=ob.material_slots[0].material
            assert len(old.vertices)==len(master.data.vertices)
            ob.data=master.data;ob.material_slots[0].link='OBJECT';ob.material_slots[0].material=paint
            if not old.users:bpy.data.meshes.remove(old)
source=bpy.data.scenes.new('편집 가능한 제품 · 원형')
for group in groups.values():
    scene.collection.children.unlink(group);source.collection.children.link(group)
arranged=bpy.data.collections.new('판매 공간 실배치');scene.collection.children.link(arranged)
for row in data['rows']:
    group=groups[row['key']];ob=bpy.data.objects.new(group.name,None);ob.instance_type='COLLECTION';ob.instance_collection=group
    ob.location=(row['x'],-row['d'],row['h']);ob.rotation_euler.z=row.get('angle',0);ob.empty_display_size=.035
    arranged.objects.link(ob)
studio=bpy.data.collections.new('촬영 조명과 카메라');scene.collection.children.link(studio)
def point(obj,location,target):
    obj.location=(location[0],-location[1],location[2]);v=Vector((target[0],-target[1],target[2]))-obj.location
    obj.rotation_euler=v.to_track_quat('-Z','Y').to_euler()
def light(name,location,target,power,size,tint):
    lamp=bpy.data.lights.new(name,'AREA');lamp.energy=power;lamp.shape='DISK';lamp.size=size;lamp.color=tint
    ob=bpy.data.objects.new(name,lamp);studio.objects.link(ob);point(ob,location,target)
light('판매장 입구 조명',(1.16,.64,3.28),(0,2.4,.39),109,1.1,(1,.95,.89))
light('선반 위 직물 조명',(1.25,5.14,3.28),(2.55,5.22,.86),97,1.0,(1,.96,.90))
light('벤치 위 간접등',(-1.4,5.05,3.24),(-2.4,6.2,.97),89,.88,(1,.96,.90))
light('니트 왼쪽 확산 조명',(-2.6,6.1,3.6),(-.2,8.1,1.6),160,2.0,(1,.94,.88))
light('패딩 오른쪽 림 조명',(2.6,7.0,3.2),(.1,8.0,1.5),140,1.35,(.88,.95,1))
light('매장 천장등',(0,4.3,4.4),(0,5,0),160,3.2,(1,.98,.92))
light('바이저 옆광',(-1.3,2.8,2.1),(0,3.75,1.04),62,1.2,(1,.96,.90))
light('바이저 뒤 조명',(1,4.9,2.3),(0,3.75,1.04),63,1.1,(.90,.94,1))
world=bpy.data.worlds.new('유백색 세일즈 플로어 반사광');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.60,.64,.69,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.38;scene.world=world
def camera(name,xyz,target,lens):
    cam=bpy.data.cameras.new(name);cam.lens=lens;cam.clip_start=.006;ob=bpy.data.objects.new(name,cam);studio.objects.link(ob)
    point(ob,xyz,target);return ob
cams=[
    camera('네 가지 상품과 진열 벽',(.1,4.20,1.73),(0,8.10,1.57),39),
    camera('자카드 세 벌',(-.59,5.50,1.71),(.43,8.08,1.59),40),
    camera('패딩 퀼팅과 지퍼',(-1.41,6.99,1.75),(-1.48,8.07,1.66),42),
    camera('흰 리본 바이저',(-.69,3.42,1.34),(-.52,3.75,1.091),48),
    camera('남색 챙의 삼선 자수',(.10,3.39,1.16),(0,3.73,1.015),56),
    camera('선반 위 접은 니트',(1.68,5.05,1.55),(2.54,5.45,1.30),48),
    camera('매장 전체와 트랙 조명',(1.55,.85,1.61),(.1,6.4,1.28),23),
    camera('리본을 묶은 뒷면',(.50,3.37,1.51),(.52,3.8,1.087),48),
]
scene.camera=cams[0];scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.2
scene.render.resolution_x=840;scene.render.resolution_y=560;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=92
bpy.context.preferences.filepaths.save_version=0
for area in bpy.context.screen.areas:
    if area.type=='VIEW_3D':area.spaces.active.region_3d.view_perspective='CAMERA'
bpy.ops.wm.save_as_mainfile(filepath=str(here/'golf-shop.blend'),compress=True)
print('NewCore Golf',len(groups),'editable collections',sum(len(c.objects) for c in groups.values()),'editable components')
if '--studio-dir' in sys.argv:
    target=Path(sys.argv[sys.argv.index('--studio-dir')+1]);target.mkdir(parents=True,exist_ok=True)
    for i,cam in enumerate(cams):scene.camera=cam;scene.render.filepath=str(target/(str(i)+'.jpg'));bpy.ops.render.render(write_still=True)

if '--skip-bake' not in sys.argv:bake.sales_floor(here,groups)
