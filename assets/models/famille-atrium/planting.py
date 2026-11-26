"""Olive-coloured atrium planting in a spun stone pot, drawn from the court photo."""
from math import cos, sin, tau
from random import Random
from mathutils import Vector


def build_planter(group, colour, object_for, profile):
    random=Random(3814)
    pot=colour('연마석 화분', 'AB9D83')
    lip=colour('화분 입술 · 밝은 석재', 'C3B399')
    soil=colour('표면 흙', '514437')
    bark=colour('가지 · 짙은 회갈색', '756B56')
    shoots=colour('가는 잎자루', '8B866A')
    leaves=[colour('잎 · '+str(i),c) for i,c in enumerate(
        ['637C5F','79906D','566B51','84967B','A0AD91','516A53'])]
    profile(group,'등이 불룩한 테라스 화분',[(.24,0),(.261,.01),(.318,.19),(.345,.425),
            (.347,.474),(.333,.49),(.315,.48),(.313,.42)],pot,48)
    profile(group,'정리한 화분 테',[(.346,.45),(.35,.467),(.345,.481),(.334,.49)],lip,48)
    profile(group,'분갈이 흙',[(.001,.452),(.29,.449),(.319,.437)],soil,32)
    def twig(name,points,radii,mat):
        n=7
        verts=[]
        for i,p in enumerate(points):
            axis=(points[min(i+1,len(points)-1)]-points[max(0,i-1)]).normalized()
            right=axis.cross(Vector((0,1,0))).normalized()
            up=axis.cross(right)
            verts.extend(p+radii[i]*(cos(tau*k/n)*right+sin(tau*k/n)*up) for k in range(n))
        faces=[(i*n+k,i*n+(k+1)%n,(i+1)*n+(k+1)%n,(i+1)*n+k)
               for i in range(len(points)-1) for k in range(n)]
        object_for(group,name,verts,faces,mat,True)

    # Leaves are grouped by finish, but keep a modelled midrib and a paler underside.
    leaf_v=[[] for _ in leaves]; leaf_f=[[] for _ in leaves]
    def leaf(origin,angle,scale,variant):
        along=Vector((cos(angle),sin(angle),random.uniform(-.30,.25)))
        across=Vector((-sin(angle),cos(angle),random.uniform(-.4,.4)))
        pts=[origin,origin+scale*(along*.043+across*.020),origin+scale*(along*.061+Vector((0,0,.009))),
             origin+scale*(along*.124+Vector((0,0,.003))),origin+scale*(along*.084-across*.018)]
        dest=leaf_v[variant]; start=len(dest); dest.extend(pts)
        leaf_f[variant].extend(tuple(start+i for i in ids) for ids in [(0,1,2),(1,3,2),(2,3,4),(0,2,4)])
    for stem in range(3):
        a=tau*stem/3+.2
        axis=Vector((cos(a),sin(a),0))
        trunk=[Vector((0,0,.44)),axis*.04+Vector((0,0,.64)),axis*.10+Vector((0,0,1.03)),
               axis*.18+Vector((0,0,1.42)),axis*.28+Vector((0,0,1.79+stem*.06))]
        twig('갈라지는 줄기',trunk,[.032,.031,.022,.015,.006],bark)
        for i in range(10):
            level=.81+i*.104+random.uniform(-.035,.035)
            a=stem*2.21+i*2.398+random.uniform(-.45,.45)
            out=Vector((cos(a),sin(a),0))
            root=axis*(.10+(level-1)*.19)+Vector((0,0,level))
            length=.27+.32*(1-abs(i-4)/7)+random.uniform(-.07,.09)
            mid=root+out*length*.47+Vector((0,0,.13))
            end=root+out*length+Vector((0,0,.24+random.uniform(-.08,.08)))
            twig('옆가지',[root,mid,end],[.012,.008,.003],bark)
            for k in range(4):
                fork_angle=a+(-1 if k%2 else 1)*(.6+random.random()*.72)
                direction=Vector((cos(fork_angle),sin(fork_angle),0))
                base=mid.lerp(end,k/4)
                tip=base+direction*(.105+.085*random.random())+Vector((0,0,.07+random.random()*.11))
                twig('올해 자란 새가지',[base,tip],[.0038,.0016],shoots)
                for n in range(5):
                    for side in (-1,1):
                        leaf(base.lerp(tip,(n+1)/6),fork_angle+side*(.67+.45*random.random()),
                             .58+random.random()*.53,random.randrange(len(leaves)))
    for mat,v,f in zip(leaves,leaf_v,leaf_f):
        object_for(group,'창가의 길쭉한 잎',v,f,mat)
