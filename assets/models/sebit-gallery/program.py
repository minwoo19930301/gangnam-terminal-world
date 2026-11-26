"""Editable illustrations for a three-card fictional Goto Mall programme."""
from math import cos,sin,pi,tau
from pathlib import Path
from tempfile import TemporaryDirectory
import os,subprocess
import bpy

PROGRAM='고투몰 홍보 화면 · 세 장의 자체 그림'
def render_program(here):
    scene=bpy.data.scenes[PROGRAM]
    with TemporaryDirectory() as tmp:
        filename=Path(tmp)/'screen.png';scene.render.filepath=str(filename)
        bpy.ops.render.render(write_still=True,scene=scene.name)
        subprocess.run(['node','--input-type=module','-e',
            "import sharp from 'sharp';await sharp(process.argv[1]).webp({quality:89}).toFile(process.argv[2]);",
            str(filename),str(here/'program.webp')],cwd=here.parents[2],check=True)
    scene.render.filepath='//'
    return here/'program.webp'

def make_program(here,main,screen):
    scene=bpy.data.scenes.new(PROGRAM);bpy.context.window.scene=scene
    scene.render.engine='CYCLES';scene.cycles.samples=16
    scene.render.resolution_x=960;scene.render.resolution_y=518;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.film_transparent=False
    scene.view_settings.view_transform='Standard';scene.view_settings.look='None'
    palette={'night':'252453','ink':'322d62','teal':'275d70','ice':'c6e9e5','cream':'fff0ce','yellow':'e9bc66','peach':'e8a581','rose':'c66b80','navy':'293a5b','river':'699ab9','lilac':'b1a5dc','blue':'386ba2','blue2':'548dc0','sage':'8fb098','sand':'d5c3a0','white':'f5efe6','rust':'a4575a','purple':'817ea9'}
    colors={}
    for k,hex_code in palette.items():
        mat=bpy.data.materials.new('화면 잉크 · '+k);mat.use_nodes=True
        rgb=tuple(int(hex_code[j:j+2],16)/255 for j in (0,2,4))
        rgb=tuple(n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4 for n in rgb)+(1,)
        mat.diffuse_color=rgb
        nodes=mat.node_tree.nodes;nodes.clear();em=nodes.new('ShaderNodeEmission');em.inputs['Color'].default_value=rgb
        out=nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(em.outputs[0],out.inputs['Surface']);colors[k]=mat
    font_path=next((p for p in [os.getenv('GTW_KOREAN_FONT'),'/System/Library/Fonts/Supplemental/AppleGothic.ttf',
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc','/usr/share/fonts/truetype/nanum/NanumGothic.ttf'] if p and Path(p).is_file()),None)
    if not font_path:raise RuntimeError('Set GTW_KOREAN_FONT to a Korean font')
    font=bpy.data.fonts.load(font_path);w,h=1.48,2.397
    def art(name,points,z,tone):
        mesh=bpy.data.meshes.new(name);mesh.from_pydata([(cx+x,y,z) for x,y in points],[],[tuple(range(len(points)))]);mesh.update()
        ob=bpy.data.objects.new(name,mesh);group.objects.link(ob);mesh.materials.append(colors[tone]);return ob
    def rect(name,x,y,ww,hh,z,tone):
        return art(name,[(x-ww/2,y-hh/2),(x+ww/2,y-hh/2),(x+ww/2,y+hh/2),(x-ww/2,y+hh/2)],z,tone)
    def disc(name,x,y,r,z,tone,sy=1):
        return art(name,[(x+cos(j*tau/48)*r,y+sin(j*tau/48)*r*sy) for j in range(48)],z,tone)
    def stroke(name,pts,width,z,tone):
        verts=[];faces=[]
        for i,(x,y) in enumerate(pts):
            a=pts[max(0,i-1)];b=pts[min(len(pts)-1,i+1)];dx,dy=b[0]-a[0],b[1]-a[1];length=(dx*dx+dy*dy)**.5 or 1
            verts.extend([(cx+x-dy*width/(2*length),y+dx*width/(2*length),z),(cx+x+dy*width/(2*length),y-dx*width/(2*length),z)])
            if i:faces.append((i*2-2,i*2-1,i*2+1,i*2))
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
        ob=bpy.data.objects.new(name,mesh);group.objects.link(ob);mesh.materials.append(colors[tone])
    def label(name,x,y,size,tone,ko=False):
        cu=bpy.data.curves.new(name,'FONT');cu.body=name;cu.size=size;cu.align_x='CENTER';cu.align_y='CENTER'
        if ko:cu.font=font
        cu.resolution_u=4;obj=bpy.data.objects.new(name,cu);group.objects.link(obj)
        obj.location=(cx+x,y,.12);obj.data.materials.append(colors[tone])
        bpy.context.view_layer.update();dep=bpy.context.evaluated_depsgraph_get()
        mesh=bpy.data.meshes.new_from_object(obj.evaluated_get(dep));out=bpy.data.objects.new(name+' 글자',mesh)
        out.location=obj.location;group.objects.link(out);bpy.data.objects.remove(obj,do_unlink=True);bpy.data.curves.remove(cu)
    for j,name in enumerate(['01 · 가방과 쇼핑','02 · 반포의 저녁','03 · 벽화길에 앉아']):
        group=bpy.data.collections.new(name);scene.collection.children.link(group);cx=(j-1)*w
        rect('바탕',0,0,w,h,0,['ink','night','teal'][j])
        # Thin masthead, issue bars and bottom imprint unify the three changing posters.
        rect('상단 선',0,.966,1.22,.009,.01,'cream');rect('하단 선',0,-.95,1.22,.006,.01,'cream')
        label('GOTO MALL',0,1.077,.126,'cream');label('고터·세빛 관광특구',0,-1.062,.090,'cream',True)
        if j==0:
            label('SHOPPING',0,.77,.202,'cream')
            rect('매장 진열 바탕',0,-.04,1.18,1.14,.015,'lilac')
            disc('매장 창의 원형 빛',.29,.18,.24,.022,'peach')
            art('핑크 종이 백',[(.07,-.36),(.43,-.36),(.42,.002),(.08,.002)],.031,'rose')
            stroke('종이 백 끈',[(.16,.002),(.16,.10),(.19,.14),(.30,.14),(.34,.10),(.34,.002)],.014,.035,'cream')
            art('가죽 토트백',[(-.44,-.34),(-.42,.075),(-.35,.16),(-.19,.153),(-.097,.07),(-.065,-.34)],.045,'ink')
            stroke('가방의 손잡이',[(-.362,.08),(-.354,.22),(-.319,.295),(-.259,.313),(-.207,.28),(-.172,.20),(-.163,.078)],.029,.049,'cream')
            stroke('가죽 플랩',[(-.397,.045),(-.341,-.045),(-.248,-.078),(-.137,-.04)],.012,.052,'peach')
            rect('잠금장치',-.263,-.076,.041,.049,.057,'yellow')
            for x in [-.44,-.30,-.16,.12,.24,.36]:rect('매장 전시대 루버',x,-.48,.031,.04,.03,'purple')
            label('지하상가에서 만나요',0,-.74,.118,'cream',True)
        elif j==1:
            label('THE RIVER',0,.77,.181,'cream')
            rect('한강 공기의 보라빛',0,-.028,1.18,1.15,.015,'purple')
            disc('해 질 무렵',.24,.209,.195,.023,'yellow')
            for k,(yy,tone) in enumerate([(-.035,'lilac'),(-.15,'peach'),(-.28,'river')]):
                pts=[(-.59,-.60),(.59,-.60),(.59,yy+.05)]+[(x,yy+.054*sin(x*6+k*1.2)) for x in [.48,.34,.17,0,-.17,-.34,-.48,-.59]]
                art('겹쳐진 한강 윤곽',pts,.03+k*.005,tone)
            for x in [-.38,0,.38]:
                rect('상판을 받치는 교각',x,-.242,.023,.13,.054,'navy')
                stroke('반포 다리 아치',[(x-.18+i*.36/14,-.185+.077*sin(pi*i/14)) for i in range(15)],.013,.058,'cream')
            rect('긴 교량 상판',0,-.189,1.18,.02,.061,'navy')
            for k in range(12):rect('잔물결',-.475+(k*.227)%1,-.38-(k%3)*.044,.042+(k%4)*.02,.007,.067,'ice')
            label('반포의 저녁',0,-.74,.132,'cream',True)
        else:
            label('GALLERY',0,.77,.207,'cream')
            rect('전시 공간',0,-.025,1.17,1.15,.015,'sand')
            for k,tone in enumerate(['blue','blue2','ice','rose','rust','sage']):
                pts=[(-.53+i*.06,-.33+k*.11+.12*sin(i*.31+k*.64)) for i in range(19)]
                stroke('새로 그린 벽면 색띠',pts,.030+k*.004,.032+k*.002,tone)
            rect('짙은 바닥',0,-.455,1.17,.25,.051,'blue')
            for x in [-.38,.29]:rect('벤치의 절곡 다리',x,-.404,.045,.205,.07,'cream')
            rect('파랑 벤치 상판',-.045,-.275,.715,.067,.07,'cream')
            label('벽화길에서 쉬어가요',0,-.74,.114,'cream',True)
    bpy.data.fonts.remove(font)
    cam_data=bpy.data.cameras.new('화면 세 장 정투영');cam_data.type='ORTHO';cam_data.ortho_scale=w*3
    cam=bpy.data.objects.new('홍보 화면 원고 카메라',cam_data);scene.collection.objects.link(cam);cam.location=(0,0,4);cam.rotation_euler=(0,0,0);scene.camera=cam
    path=render_program(here)
    image=bpy.data.images.load(str(path));image.pack();image.filepath='//program.webp'
    mat=bpy.data.materials.new('첫 번째 고투몰 홍보 화면');mat.use_nodes=True;nodes=mat.node_tree.nodes;nodes.clear()
    out=nodes.new('ShaderNodeOutputMaterial');em=nodes.new('ShaderNodeEmission');tex=nodes.new('ShaderNodeTexImage');tex.image=image
    uv=nodes.new('ShaderNodeTexCoord');mapping=nodes.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(1/3,1,1)
    for a,b in [(uv.outputs['UV'],mapping.inputs['Vector']),(mapping.outputs[0],tex.inputs[0]),(tex.outputs['Color'],em.inputs['Color']),(em.outputs[0],out.inputs['Surface'])]:mat.node_tree.links.new(a,b)
    screen.data.materials.clear();screen.data.materials.append(mat)
    bpy.context.window.scene=main
