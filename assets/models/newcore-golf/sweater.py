"""Hanging turtleneck with curved shoulders, tapered sleeves, long striped cuffs and ribbed waistband."""
from math import sin,cos,tau,pi
import blender_shop_mesh as m

def panel(name,points,faces,tone,texcoords):
    ob=m.piece(name,points,faces,tone)
    uv=ob.data.uv_layers.new(name='섬유와 재단')
    for poly in ob.data.polygons:
        poly.use_smooth=True
        for vi,li in zip(poly.vertices,poly.loop_indices):uv.data[li].uv=texcoords[vi]
    return ob

def lathe_panel(name,rings,vertex,tone,uv_at,slices=48):
    pts=[];uv=[]
    for row,r in enumerate(rings):
        for i in range(slices+1):
            a=tau*i/slices
            p=vertex(r,a);pts.append(p);uv.append(uv_at(r,a,p))
    n=slices+1
    faces=[(j*n+i,j*n+i+1,(j+1)*n+i+1,(j+1)*n+i) for j in range(len(rings)-1) for i in range(slices)]
    return panel(name,pts,faces,tone,uv)

def uv_fabric(a,z,fraction=1):
    # The seam is at the back; the left 75 percent of the atlas contains the whole repeated pattern.
    return .004+.740*(a/tau)*fraction,.020+.962*max(0,min(1,z/.69))
def uv_rib(a,z,stripe=False):return (.865 if stripe else .758)+.085*(a/tau),.035+.91*max(0,min(1,z/.74))

def pullover(key):
    def body(r,a):
        z,w,d=r;waves=.0044*sin(9*a+1.6*z)+.0021*cos(15*a-4*z)
        return (w*sin(a)+waves*sin(a),d*cos(a)+waves*cos(a),z+.0028*cos(2*a)*max(0,1-z/.69))
    rings=[(.084,.205,.060),(.110,.212,.064),(.17,.227,.061),(.27,.231,.067),(.39,.243,.073),
           (.50,.248,.076),(.563,.236,.065),(.598,.205,.056),(.618,.16,.048),(.643,.084,.041)]
    lathe_panel('앞뒤를 이은 다이아몬드 자카드 몸판',rings,body,'jacquard'+key,lambda r,a,p:uv_fabric(a,p[2]))
    base=[(.019,.190,.054),(.025,.199,.061),(.080,.204,.062),(.088,.204,.060)]
    lathe_panel('넓은 골지 밑단',base,body,'rib'+key,lambda r,a,p:uv_rib(a,p[2]),52)
    neck=[(.632,.082,.044),(.641,.087,.047),(.668,.082,.045),(.698,.084,.046),(.704,.082,.044),(.703,.075,.039),(.662,.072,.040)]
    lathe_panel('안으로 접힌 터틀넥의 입구',neck,body,'rib'+key,lambda r,a,p:uv_rib(a,p[2]),44)
    for side in [-1,1]:
        def sleeve(row,a):
            x,d,z,rx,rd,slant=row
            return side*(x+rx*sin(a)),d+rd*cos(a),z+slant*sin(a)+.002*sin(3*a+z*9)
        sleeve_r=[(.279,0,.094,.042,.038,-.005),(.279,0,.18,.050,.043,-.005),
                  (.285,.004,.285,.058,.043,-.009),(.280,.010,.380,.063,.047,-.012),
                  (.266,.012,.467,.069,.054,-.017),(.242,.013,.533,.070,.057,-.022),
                  (.216,.009,.578,.063,.054,-.027),(.183,.011,.596,.040,.043,-.025)]
        lathe_panel('옆선과 어깨가 휘어진 무늬 소매',sleeve_r,sleeve,'jacquard'+key,
                    lambda r,a,p:uv_fabric(a,p[2],.32),36)
        for z0,z1,stripe in [(-.004,.020,False),(.020,.031,True),(.031,.045,False),(.045,.056,True),
                             (.056,.070,False),(.070,.080,True),(.080,.102,False)]:
            uvs=lambda r,a,p,s=stripe:uv_rib(a,max(0,p[2]),s)
            rows=[(.279,0,z0,.035+.015*z0,.034,-.001),(.279,0,z1,.035+.032*z1,.034,-.001)]
            lathe_panel('세 줄 흰 상침' if stripe else '긴 소맷단 골지',rows,sleeve,('stripe' if stripe else 'rib')+key,uvs,30)
    # A few soft elastic gathers break the machine-straight waist edge.
    for j in range(8):
        a=tau*j/8
        m.rod('밑단 봉제 눌림',[(.201*sin(a+t*.035),.061*cos(a+t*.035),.080+.0009*sin(t*pi/5)) for t in range(6)],.00065,'seam',5)
