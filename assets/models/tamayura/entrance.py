"""Bronze entrance panel, restrained wordmark, timber jamb and seasonal vase."""
from math import sin,cos,pi,tau
from pathlib import Path
import bpy
from mathutils import Matrix
import blender_shop_mesh as m
from tableware import pebble

def build():
    B,R,V=m.block,m.rod,m.profile
    B('왼쪽 황동색 이동 판넬',-2.26,-.172,.056,2.25,.13,2.74,'bronze',.006)
    B('황동색 문 아래 짙은 침대목',-2.26,-.132,.011,2.29,.095,.046,'blackwood')
    B('출입구 틀 · 따뜻한 상부',-.19,-.112,2.82,6.38,.136,.24,'tea_wood',.005)
    B('모서리 천장 간접광',-.19,-.202,2.978,6.18,.031,.019,'cove',.003)
    B('출입구 왼쪽의 검은 문선',-1.119,-.13,.023,.045,.145,2.79,'blackwood')
    B('출입구 오른쪽의 검은 문선',1.119,-.13,.023,.045,.145,2.79,'blackwood')
    for j in range(29):
        B('현관 오른쪽 빗살 목재',1.17+j*.064,-.163,.037,.036,.105,2.76,'walnut',.006)
    B('돌 화병을 놓은 벽감',1.66,.40,.017,1.02,.07,2.63,'blackwood')
    # Blender font converted to editable extruded letters so the game receives the exact same silhouette.
    curve=bpy.data.curves.new('TAMAYURA 서체','FONT');curve.body='T A M A Y U R A'
    for font in [Path('/System/Library/Fonts/Supplemental/Baskerville.ttc'),Path('/System/Library/Fonts/Times.ttc')]:
        if font.exists():curve.font=bpy.data.fonts.load(str(font));break
    curve.align_x='CENTER';curve.align_y='CENTER';curve.size=.113;curve.extrude=.003
    ob=bpy.data.objects.new('TAMAYURA 금속 문자 원형',curve);m.group.objects.link(ob)
    bpy.context.view_layer.update();evaluated=ob.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh=bpy.data.meshes.new_from_object(evaluated)
    mesh.transform(Matrix.Translation((-2.12,.241,1.52))@Matrix.Rotation(pi,4,'Z')@Matrix.Rotation(pi/2,4,'X'))
    letters=bpy.data.objects.new('TAMAYURA · 개별 입체 글자',mesh);m.group.objects.link(letters);mesh.materials.append(m.palette['blackwood'])
    bpy.data.objects.remove(ob,do_unlink=True);bpy.data.curves.remove(curve)
    x=1.34;d=-.40
    V('현관의 돌결 화병',x,d,.024,[(.086,0),(.107,.01),(.110,.09),(.142,.39),(.153,.49),(.143,.51),(.115,.505),(.109,.39)],'light_tile',30)
    for j in range(10):
        a=tau*j/10;dx=.18*cos(a);dd=.11*sin(a);h=.37+.28*(.5+.5*sin(j*2.37))
        pts=[(x,d,.48),(x+dx*.28,d+dd*.35,.57),(x+dx*.62,d+dd*.65,.57+h*.45),(x+dx,d+dd,.58+h)]
        R('화병의 가는 계절 가지',pts,.0034,'walnut',6)
        for k in range(3):
            f=.59+.12*k;bx=x+f*dx;bd=d+f*dd;bz=.58+h*f
            ex=bx+.048*cos(a+.9);ed=bd+.035*sin(a+.9)
            R('옆가지',[(bx,bd,bz),(ex,ed,bz+.044)],.0019,'walnut',5)
            for i in range(5):
                t=tau*i/5
                pebble('옅은 꽃잎',ex+.008*cos(t),ed+.008*sin(t),bz+.045,.006,.0045,.003,'flower',8)
