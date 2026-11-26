"""Colour-sorted reel stock, hollow cardboard cores and free satin ends."""
import math
import random
from mathutils import Vector
from garments import tube

TAU=math.tau
ROWS=[
 ['ddd0ad','c0a77c','8b8171','4d514a','366174','285375'],
 ['231b56','4e448a','8177b1','96b8d5','69bad1','81c6c3'],
 ['50365d','653766','794778','ad8bb5','aa9fd1','c6bfdf'],
 ['8b1730','aa2944','ad3158','7e2948','713B4D','975d7a'],
 ['a93253','ce5071','d45c85','df8aa6','e9abbc','f0bccc'],
 ['193f39','365949','4f6951','9abca1','b8d6a2','9bb953'],
 ['86845f','a2a079','b3be90','afe0bc','a5cf6b','8fa94c'],
 ['e2a194','efc1b9','deb983','eda93f','e6c334','e7ddba']]
LIGHT=Vector((-.25,.72,.65)).normalized()


def dye(code):
    return tuple(int(code[i:i+2],16)/255 for i in [0,2,4])


def reel(part,cx,d,h,w,r,sw,col,seed,visible_end):
    n=22
    profile=[(-w/2,r*.965),(-w/2+.004,r),(w/2-.004,r),(w/2,r*.965)]
    def p(x,rad,a):return Vector((cx+x,d+rad*math.cos(a),h+rad*math.sin(a)))
    for j,((a,ra),(b,rb)) in enumerate(zip(profile,profile[1:])):
        for k in range(n):
            points=[];normals=[];shades={}
            coords=[(a,ra,k/n),(b,rb,k/n),(b,rb,(k+1)/n),(a,ra,(k+1)/n)]
            for x,rad,t in coords:
                angle=t*TAU;pt=p(x,rad,angle)
                norm=Vector(((-.29 if j==0 else .29 if j==2 else 0),math.cos(angle),math.sin(angle))).normalized()
                # A colour-preserving satin reflection follows the roll along its length.
                bright=.77+.18*max(0,norm.dot(LIGHT))+.075*max(0,math.cos(angle-.45))**10
                if sw==5:bright=.82+.15*max(0,norm.dot(LIGHT))
                points.append(pt);normals.append(norm);shades[tuple(pt)]=tuple(min(1,c*bright) for c in col)
            uv=[((x+w/2)/w,.021+.958*t) for x,rr,t in coords]
            part.curved(points,sw,normals,lambda x,d,z:shades[(x,d,z)],uv)
    core=.032
    for side in [-1,1]:
        if side not in visible_end:continue
        x=side*(w/2+.0004)
        for inner,outer,material,tone in [(core,core+.009,2,.81),(core+.009,r*.80,sw,.78),(r*.80,r*.92,sw,.84),(r*.92,r*.965,sw,.74)]:
            colour=tone if material==2 else tuple(c*tone for c in col)
            for k in range(n):
                a=k*TAU/n;b=(k+1)*TAU/n
                pts=[p(x,inner,a),p(x,outer,a),p(x,outer,b),p(x,inner,b)]
                part.face(pts,material,(side,0,0),colour)
        for k in range(n):
            a=k*TAU/n;b=(k+1)*TAU/n
            part.face([p(x,core,a),p(x,core,b),p(x-side*.028,core,b),p(x-side*.028,core,a)],
                      2,(0,-math.cos((a+b)/2),-math.sin((a+b)/2)),.62)


def loose_end(part,x,d,h,w,r,col,seed,sw):
    # The free strip comes off the round face with a twist. Its two selvedges
    # retain their width down to the oblique cut.
    profile=[(d+r*.88,h+r*.23,0),(d+r+.009,h-.008,.007),
             (d+r+.019,h-.070,.013),(d+r+.012,h-.126,.020),
             (d+r+.028,h-.196,.033)]
    for j in range(len(profile)-1):
        q,z,shift=profile[j];qq,zz,ss=profile[j+1]
        surface=[(x-w*.47+shift,q,z),(x+w*.47+shift,q+.004,z+.003),
                 (x+w*.47+ss,qq+.007,zz+.011),(x-w*.47+ss,qq,zz)]
        part.face(surface,sw,(0,1,.05),col,[(0,1),(1,1),(1,0),(0,0)])


def ribbon_bays(frame,stock,tails,labels,low):
    centers=[-.805,.255]
    for cx in centers:
        for side in [-1,1]:
            frame.box(cx+side*.526,.03,.098,.035,.53,2.06,1,.88)
        frame.box(cx,-.210,.09,1.057,.028,2.08,0,.69)
        for row,palette in enumerate(ROWS):
            bottom=.12+row*.250;r=.105+.004*math.cos(row*.87);h=bottom+r+.021
            frame.box(cx,.035,bottom,1.047,.49,.028,1,.95)
            if not low:
                tube(frame,[(cx-.521,.282,bottom+.042),(cx+.521,.282,bottom+.042)],.0115,0,.93,8)
                for j in range(3):
                    x=cx-.39+j*.33
                    labels.face([(x,.286,bottom-.001),(x+.098,.286,bottom-.001),
                                 (x+.098,.286,bottom+.025),(x,.286,bottom+.025)],
                                11,(0,1,0),.98,[(0,0),(1,0),(1,1),(0,1)])
            rng=random.Random(110+60*row+int(99*cx))
            count=11 if row%3==1 else 13 if row%3==2 else 10
            raw=[rng.uniform(.070,.14) for _ in range(count)]
            widths=[w/sum(raw)*.997 for w in raw]
            edge=cx-.500
            for j,w in enumerate(widths):
                col=dye(palette[min(5,int(6*j/count))]);colour=tuple(min(1,c*(.96+.06*rng.random())) for c in col)
                mid=edge+w/2;edge+=w
                if low:
                    if j%2==0:
                        half=min(w*.95,.0795);center=mid+.025
                        stock.front(center-half,bottom+.028,center+half,bottom+.028+r*1.88,.230,4,colour)
                    continue
                # End caps are visible only at the end of each row or at a radius change.
                radius=r*(.95+.09*rng.random())
                sw=5 if (row+int(cx>0))%4==0 else 6 if row==3 and j%4==0 else 4
                sides=([-1] if j==0 else [])+([1] if j==count-1 or j%5==2 else [])
                reel(stock,mid,.159,h,w-.002,radius,sw,colour,j+row*9,sides)
                if (j==3 and row in [1,4,6] and cx<0) or (j==8 and row in [2,5] and cx>0):
                    loose_end(tails,mid,.160,h,w-.006,radius,colour,j,sw)
