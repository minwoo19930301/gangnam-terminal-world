"""Editable cut flowers, petals with raised midribs, and reusable flower heads in metres."""
from math import sin,cos,pi,tau
from random import Random
import bpy
from mathutils import Vector
import blender_shop_mesh as m

# Flower head coordinates are radial; the slight forward tilt is applied to each cut stem.
SPECIES={
 'gerbera':('gerbera','e6a318','ffd655','926b1a'),
 'ranunculus':('ranunculus','ed9842','ffcf76','d59044'),
 'rose':('rose','d65f75','f7aab3','e99992'),
 'creamRose':('rose','dcad89','f6e4d3','e6ba94'),
 'carnation':('carnation','ba5384','f4b4c5','e58da3'),
 'hydrangea':('hydra','7e92bf','c7d8e9','ccd29b'),
 'greenHydra':('hydra','94aa78','dce9b6','d9cb81'),
 'lisianthus':('lis','574691','ab8ac8','e6c370'),
 'whiteLis':('lis','c8c2c1','f1e9df','b0ae60'),
 'pinkMum':('mum','c14b86','f782bb','dfb647'),
 'anthurium':('spathe','a63933','e27668','e6c88b'),
}
masters={}
def col(value):
    v=[int(value[i:i+2],16)/255 for i in (0,2,4)]
    return Vector(tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in v))
class Blossom:
    def __init__(self,key):
        desc,lo,hi,mid=SPECIES[key];self.lo=col(lo);self.hi=col(hi);self.mid=col(mid)
        self.v=[];self.f=[];self.c=[]
    def vert(self,p,c):
        self.v.append(tuple(p));self.c.extend([*c,1]);return len(self.v)-1
    def petal(self,start,angle,length,width,rise,arch,swirl=0,ripple=0,base=.0,fold=.0,layers=6):
        off=len(self.v);n=layers
        for j in range(n+1):
            t=j/n;radius=length*t;half=width*max(.008,sin(pi*(.008+.984*t))**.65)
            direction=angle+swirl*t
            for k,s in enumerate((-1,-.5,0,.5,1)):
                wr=ripple*sin((t*15+s*1.6)*pi)*abs(s)**2*t
                dx=radius*cos(direction)-s*half*sin(direction);dd=radius*sin(direction)+s*half*cos(direction)
                z=rise*t+arch*sin(pi*t)+half*fold*abs(s)**1.5+wr
                pigment=min(1,max(0,base+.12+.62*t+.16*abs(s)+.06*cos(13*t+s*8)))
                self.vert((start[0]+dx,start[1]+dd,start[2]+z),self.lo.lerp(self.hi,pigment))
        for j in range(n):
            for k in range(4):
                i=off+j*5+k;self.f.append((i,i+5,i+6,i+1))
    def dots(self,center,radius,n,tint,rnd):
        for i in range(n):
            a=i*2.399963;r=radius*((i+.5)/n)**.5;rv=rnd.uniform(.00065,.00124)
            x=center[0]+r*cos(a);d=center[1]+r*sin(a);z=center[2]+(.0032*(1-r/radius) if radius else 0)
            ix=[self.vert((x+rv*cos(k*tau/5),d+rv*sin(k*tau/5),z),tint) for k in range(5)]
            up=self.vert((x,d,z+.00145),tint*1.08)
            self.f.extend((ix[j],ix[(j+1)%5],up) for j in range(5))
    def mesh(self,key):
        ob=m.piece('절화 꽃송이 · '+key,self.v,self.f,'pigment')
        me=ob.data;me.name='수작업 꽃잎 · '+key
        attr=me.color_attributes.new(name='Petal pigment',type='BYTE_COLOR',domain='POINT');attr.data.foreach_set('color',self.c)
        me.color_attributes.active_color=attr;me.polygons.foreach_set('use_smooth',[True]*len(me.polygons))
        bpy.data.objects.remove(ob,do_unlink=True);return me
def head(key):
    if key in masters:return masters[key]
    kind=SPECIES[key][0];b=Blossom(key);rnd=Random(1603+list(SPECIES).index(key));center=(0,0,0)
    if kind in ['gerbera','mum']:
        for row,(num,rad,w,h) in enumerate([(32,.041,.005,.001),(28,.035,.005,.006),(24,.026,.0048,.009),(17,.017,.0033,.008)]):
            if kind=='mum':w*=.69;h+=.009;rad*=.91
            for i in range(num):
                a=tau*(i+.46*row)/num+rnd.uniform(-.04,.04)
                b.petal((.004*cos(a),.004*sin(a),row*.0019),a,rad*rnd.uniform(.89,1.07),w,h,.003,.08,0,row*.035,.36,4)
        b.dots((0,0,.010),.009,39,b.mid,rnd)
    elif kind in ['rose','ranunculus','carnation']:
        for row,(num,rad,w,h) in enumerate([(8,.031,.016,.011),(8,.027,.016,.019),(7,.021,.016,.024),(6,.014,.014,.028),(4,.009,.010,.03)]):
            if kind=='ranunculus':num+=4;w*=.81
            if kind=='carnation':num+=2;h*=1.03;w*=.93
            for i in range(num):
                a=tau*(i+.43*row)/num+rnd.uniform(-.10,.10);r=(4-row)*.0018
                b.petal((r*cos(a),r*sin(a),-.003+row*.0009),a,rad,w,h*rnd.uniform(.91,1.07),-.008,.70 if kind=='rose' else .19,.0024 if kind=='carnation' else .0004,.013*row,.66,8 if kind=='carnation' else 6)
    elif kind=='hydra':
        for j in range(33):
            a=j*2.399963;r=.046*((j+.45)/33)**.51
            x=r*cos(a);d=r*sin(a);z=.016+.028*max(0,1-(r/.049)**2)**.5
            for k in range(4):b.petal((x,d,z),a+k*tau/4,.012*rnd.uniform(.8,1.08),.0065,.003,.002,.20,0,rnd.uniform(-.13,.12),.48,3)
            b.dots((x,d,z+.002),.0015,2,b.mid,rnd)
    elif kind=='lis':
        for row in range(2):
            for i in range(5):
                a=(i+.5*row)*tau/5;b.petal(center,a,.034-row*.01,.019,.033+row*.0005,-.013,.24,.001,.04,.68,6)
        b.dots((0,0,.013),.005,15,b.mid,rnd)
    else:
        b.petal(center,.3,.066,.033,.016,.012,.19,0,-.08,.8,9)
        for i in range(11):b.dots((.006+i*.002,.001,.009+i*.0011),.0025,3,b.mid,rnd)
    masters[key]=b.mesh(key);return masters[key]

def sprig(key,top,normal,size):
    ob=bpy.data.objects.new('상품 꽃송이 · '+key,head(key));m.group.objects.link(ob)
    x,d,z=top;ob.location=(x,-d,z);n=Vector((normal[0],-normal[1],normal[2])).normalized()
    ob.rotation_mode='QUATERNION';ob.rotation_quaternion=Vector((0,0,1)).rotation_difference(n)
    ob.scale=(size,)*3;ob['web_flower']=key;return ob

def leaf(start,angle,length,width,up,color):
    x,d,z=start;pts=[]
    for j in range(7):
        t=j/6;r=length*t;w=width*max(.003,sin(pi*t)**.79)
        for q in (-1,0,1):
            pts.append((x+cos(angle)*r-sin(angle)*w*q,d+sin(angle)*r+cos(angle)*w*q,z+up*t+.02*sin(pi*t)-.30*w*abs(q)))
    faces=[(j*3+k,j*3+k+3,j*3+k+4,j*3+k+1) for j in range(6) for k in range(2)]
    m.piece('잎맥을 접은 절엽',pts,faces,color)
def stem(base,top,key,rnd,size=1):
    x,d,z=base;tx,td,tz=top
    mid=(x*.52+tx*.48+.010,d*.52+td*.48,tz*.53+z*.47)
    m.rod('화병 속까지 연결되는 절화 줄기',[base,mid,top],.0021 if key!='hydrangea' else .0032,'stem',5)
    for j in range(2 if key in ['hydrangea','greenHydra'] else 3):
        t=.38+j*.17;start=(x*(1-t)+tx*t,d*(1-t)+td*t,z*(1-t)+tz*t)
        leaf(start,rnd.uniform(0,tau),rnd.uniform(.048,.099),rnd.uniform(.013,.025),rnd.uniform(.012,.068),rnd.choice(['leaf','sage','leafDark']))
    sprig(key,top,(rnd.uniform(-.5,.5),rnd.uniform(-.85,.12),rnd.uniform(.60,1.01)),size)
COLORS={'gold':[['gerbera','ranunculus'],['greenHydra','whiteLis'],['gerbera','creamRose']],
        'pink':[['rose','creamRose'],['carnation','pinkMum'],['rose','carnation']],
        'lilac':[['creamRose','lisianthus'],['hydrangea','lisianthus'],['whiteLis','hydrangea']]}
def bank(key):
    rnd=Random(77+list(COLORS).index(key)*131)
    for row in range(3):
        for i,x in enumerate([-.292,0,.292]):
            species=COLORS[key][2-row][i%2];base=row*.505
            for k in range(8 if species in ['gerbera','hydrangea','greenHydra'] else 11):
                a=k*2.399963+row*.7;r=.081*(((k+.4)/(8 if species in ['gerbera','hydrangea','greenHydra'] else 11))**.5)
                height=.313+rnd.uniform(-.025,.08)+(1-min(1,r/.078))*.053
                stem((x+r*.36*cos(a),-.007+r*.35*sin(a),base+.016),
                    (x+r*cos(a)*1.8,-.017+r*sin(a)*1.63,base+height),species,rnd,rnd.uniform(.96,1.26))
