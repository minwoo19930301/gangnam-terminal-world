"""Create the original paper arcade displayed on the media panel."""
import bpy
from math import pi, sin, cos
from mathutils import Vector


def render_poster(path):
    previous = bpy.context.scene
    scene = bpy.data.scenes.new('전광판 원화 · 종이 아케이드')
    art = bpy.data.collections.new('전광판 원화 · 종이 아케이드')
    scene.collection.children.link(art)
    bpy.context.window.scene = scene
    scene.unit_settings.system = 'METRIC'
    scene.world = bpy.data.worlds.new('종이 모형 스튜디오')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.62,.65,.7,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = .35

    def ink(name, rgb):
        mat = bpy.data.materials.new(name)
        mat.diffuse_color = (*rgb,1)
        mat.use_nodes = True
        shader = mat.node_tree.nodes['Principled BSDF']
        shader.inputs['Base Color'].default_value = (*rgb,1)
        shader.inputs['Roughness'].default_value = .74
        return mat

    teal = ink('종이 · 소나무', (.028,.145,.126))
    moss = ink('종이 · 쑥빛', (.17,.32,.22))
    pale = ink('종이 · 라임', (.52,.64,.30))
    cream = ink('종이 · 귀리', (.84,.71,.50))
    apricot = ink('종이 · 살구', (.78,.33,.17))
    rust = ink('종이 · 테라코타', (.54,.16,.075))

    def shape(name, points, y, thick, mat):
        n=len(points)
        v=[(x,y+dy,z) for dy in (0,thick) for x,z in points]
        f=[tuple(range(n)),tuple(reversed(range(n,2*n)))]
        f.extend((j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n))
        data=bpy.data.meshes.new(name)
        data.from_pydata(v,[],f)
        data.update()
        ob=bpy.data.objects.new(name,data)
        art.objects.link(ob)
        data.materials.append(mat)
        return ob

    def rectangle(name,x,z,w,h,y,mat):
        return shape(name,[(x-w/2,z-h/2),(x+w/2,z-h/2),(x+w/2,z+h/2),(x-w/2,z+h/2)],y,.025,mat)

    def arch(name,x,z,r,y,mat):
        pts=[(x-r,-2),(x+r,-2),(x+r,z)]
        pts.extend((x+r*cos(pi*i/48), z+r*sin(pi*i/48)) for i in range(1,49))
        return shape(name,pts,y,.045,mat)

    def label(text,x,y,z,size,spacing):
        font=bpy.data.curves.new(text,'FONT')
        font.body=text
        font.size=size
        font.space_character=spacing
        font.align_x='CENTER'
        font.extrude=.001
        ob=bpy.data.objects.new(text,font)
        art.objects.link(ob)
        ob.location=(x,y,z)
        ob.rotation_euler.x=pi/2
        font.materials.append(cream)

    rectangle('짙은 바탕',0,0,2.8,4.2,.07,teal)
    arch('바깥 아치',-.42,-.67,1.11,-.02,moss)
    arch('밝은 아치',-.42,-.67,.93,-.09,pale)
    arch('아이보리 아치',-.42,-.67,.76,-.16,cream)
    arch('살구색 아치',-.42,-.67,.62,-.23,apricot)
    arch('안쪽 아치',-.42,-.67,.46,-.3,rust)
    # Radial fanlight rises above the paper arch. Cast shadows disclose the folds.
    for i in range(11):
        a=.08+(pi-.16)*i/10
        ex,ez=-.42+1.07*cos(a),-.67+1.07*sin(a)
        sx,sz=-.42+.95*cos(a),-.67+.95*sin(a)
        dw,dh=.009*sin(a),-.009*cos(a)
        shape('부채창의 가는 살',[(sx-dw,sz-dh),(ex-dw,ez-dh),(ex+dw,ez+dh),(sx+dw,sz+dh)],-.105,.02,cream)
    # Two folded birds echo the suspended flock without copying a photograph.
    for x,z,k in [( .58,.40,.28),(.29,.13,.18)]:
        shape('종이 새 · 왼 날개',[(x-k,z+k*.30),(x-.15*k,z-.2*k),(x+.03*k,z)],-.15,.015,cream)
        shape('종이 새 · 오른 날개',[(x+.03*k,z),(x-.15*k,z-.2*k),(x+k,z+k*.6)],-.18,.015,pale)
    label('FAMILLE',0,-.16,1.24,.281,1.19)
    label('S T A T I O N',0,-.16,1.00,.114,1)
    camera_data=bpy.data.cameras.new('원화 카메라')
    camera_data.type='ORTHO'
    camera_data.ortho_scale=3.58
    cam=bpy.data.objects.new('원화 카메라',camera_data)
    scene.collection.objects.link(cam)
    cam.location=(0,-7,0)
    cam.rotation_euler=(pi/2,0,0)
    scene.camera=cam
    light_data=bpy.data.lights.new('종이 창 측광','AREA')
    light_data.energy=380
    light_data.shape='DISK'
    light_data.size=2.15
    light=bpy.data.objects.new('종이 창 측광',light_data)
    scene.collection.objects.link(light)
    light.location=(-2.8,-3.5,3.1)
    light.rotation_euler=(-light.location).to_track_quat('-Z','Y').to_euler()
    scene.render.engine='CYCLES'
    scene.cycles.samples=32
    scene.cycles.use_denoising=True
    scene.render.resolution_x=480
    scene.render.resolution_y=864
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='WEBP'
    scene.render.image_settings.quality=87
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    bpy.context.window.scene=previous
