"""Model a real conifer spray once. The shop's trees instance this editable needle mesh."""
from math import cos,sin,tau,pi
from random import Random
from mathutils import Vector
import bpy
import blender_shop_mesh as m
from botany import col

bough=None
sizes={'pineHigh':(1.94,.48,111),'pineMid':(1.58,.38,222),'pineLow':(1.23,.305,333)}
origins={'pineHigh':(.60,.015),'pineMid':(-.61,.14),'pineLow':(-.01,-.11)}
def shoot_mesh():
    verts=[];faces=[];colors=[]
    def add(p,c):verts.append(tuple(p));colors.extend([*c,1]);return len(verts)-1
    rnd=Random(4817)
    def twig(a,b,rad,rows):
        direction=b-a;length=direction.length;forward=direction.normalized()
        side=forward.cross(Vector((0,0,1))).normalized();up=side.cross(forward).normalized()
        woody=col('665d3b');off=len(verts)
        for p,r in [(a,rad),(b,rad*.17)]:
            for k in range(5):add(p+r*(side*cos(k*tau/5)+up*sin(k*tau/5)),woody)
        faces.extend((off+i,off+(i+1)%5,off+5+(i+1)%5,off+5+i) for i in range(5))
        for j in range(rows):
            t=(j+.4)/rows
            for k in range(4):
                ang=(k*.25+.04*j+rnd.uniform(-.07,.07))*tau
                root=a+direction*t;rise=side*cos(ang)+up*sin(ang)*.70
                axis=(rise+forward*rnd.uniform(.34,.82)).normalized()
                reach=(.013+.010*sin(pi*t))*rnd.uniform(.77,1.12)
                wide=axis.cross(forward).normalized()*.0015
                tip=root+axis*reach;middle=root+axis*(reach*.56)+up*.0017
                tint=col(rnd.choice(['365b39','46653e','55764c','416340','587a4e','2e5037','67815a']))
                i=add(root,tint*.68);a1=add(middle+wide,tint);a2=add(middle-wide,tint*.86);c=add(middle+up*.001,tint*1.06);d=add(tip,tint*1.17)
                faces.extend([(i,a1,c),(i,c,a2),(a1,d,c),(c,d,a2)])
    start=Vector((0,0,0));end=Vector((.388,0,.014));twig(start,end,.0038,33)
    for j in range(10):
        t=(j+.54)/11
        for sign in [-1,1]:
            a=start.lerp(end,t);size=(1-.68*t)*rnd.uniform(.085,.116)
            b=a+Vector((.048+(.025*t),sign*size,.014+.019*t));twig(a,b,.0016,12)
            for h in [.54,.78]:
                p=a.lerp(b,h);q=p+Vector((.026,sign*.018,.017));twig(p,q,.0009,4)
    ob=m.piece('전나무 한 가지 · 목질축과 개별 침엽',verts,faces,'pigment')
    me=ob.data;me.name='납작한 침엽과 짧은 곁가지'
    attr=me.color_attributes.new(name='Petal pigment',type='BYTE_COLOR',domain='POINT');attr.data.foreach_set('color',colors)
    me.color_attributes.active_color=attr;bpy.data.objects.remove(ob,do_unlink=True);return me

def rings(key):
    height,rmax,seed=sizes[key];rnd=Random(seed);base=.17;rows=19 if key=='pineHigh' else 17
    for j in range(rows):
        t=j/rows;z=base+(height-base)*t
        r=rmax*(1-t)**.71*(.91+.10*sin(t*pi));count=round(6+(1-t)*8)
        for k in range(count):
            a=tau*(k+.39*j)/count+rnd.uniform(-.085,.085)
            yield a,r*rnd.uniform(.88,1.09),z+rnd.uniform(-.024,.021),t,rnd.uniform(-.11,.11)
def make(key):
    global bough
    if not bough:bough=shoot_mesh()
    h,rmax,seed=sizes[key]
    m.profile('작은 가문비 받침',0,0,0,[(.14,0),(.15,.018),(.126,.16),(.128,.18)],'brown',18)
    m.profile('나무 중심축',0,0,.12,[(.028,0),(.019,h*.6),(.003,h-.105)],'twig',9)
    for a,r,z,t,fall in rings(key):
        ob=bpy.data.objects.new('겨울 전나무 · 겹가지',bough);m.group.objects.link(ob)
        ob.location=(.010*cos(a),-.010*sin(a),z)
        ob.rotation_euler=(fall,-.02-.72*t*t,-a)
        sx=r/.39;ob.scale=(sx,max(.33,sx*1.16),max(.40,sx));ob['web_flower']='pineBough'
def packages():
    for ix,(x,d,z,w) in enumerate([(.70,-.37,.0,.30),(.65,-.39,.252,.205),(-.74,-.23,0,.29),(-.77,-.20,.242,.186),(-.04,-.42,.0,.238),(.01,-.42,.19,.155)]):
        h=w*.84;m.block('트리 앞의 벨벳 포장 상자',x,d,z,w,w*.74,h,'velvet',.006)
        m.block('세로 빨간 리본',x,d,z-.001,w*.117,w*.75,h+.004,'ribbon')
        m.block('가로 빨간 리본',x,d,z+h*.62,w+.002,w*.75,w*.072,'ribbon')
        for sign in [-1,1]:
            m.rod('접힌 새틴 나비 매듭',[(x,d,z+h),(x+sign*w*.16,d-.014,z+h+.039),(x+sign*w*.19,d+.010,z+h+.043),(x+.008*sign,d,z+h+.004)],.010,'ribbon',5)
def lights():
    verts=[];faces=[];values=[];tones=[col('ffe4a0'),col('ffdc88'),col('fff1ba'),col('fff3d3')]
    rnd=Random(202611)
    for key,(ox,od) in origins.items():
        for a,r,z,t,fall in rings(key):
            for j in range(5 if t<.88 else 2):
                f=rnd.uniform(.52,.99);offset=rnd.uniform(-.055,.055)*r/.47
                x=ox+r*f*cos(a)-offset*sin(a);d=od+r*f*sin(a)+offset*cos(a)
                zz=z+.011+r*f*.5*t*t+rnd.uniform(-.004,.017);rr=rnd.uniform(.0039,.0070)
                pts=[(x+rr,d,zz),(x,d+rr,zz),(x-rr,d,zz),(x,d-rr,zz),(x,d,zz+rr),(x,d,zz-rr)]
                i=len(verts);verts.extend(pts);tint=rnd.choice(tones)
                for k in range(6):values.extend([*tint,1])
                for k in range(4):faces.extend([(i+k,i+(k+1)%4,i+4),(i+(k+1)%4,i+k,i+5)])
    ob=m.piece('세 나무의 따뜻한 미니 전구 알',verts,faces,'glow')
    me=ob.data;attr=me.color_attributes.new(name='Petal pigment',type='BYTE_COLOR',domain='POINT')
    attr.data.foreach_set('color',values);me.color_attributes.active_color=attr;ob['emissive_bulbs']=True
