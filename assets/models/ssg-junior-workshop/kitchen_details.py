"""The small household toys visible in IQBOX's Gangnam kitchen photograph."""
from math import cos,sin,pi
def make(kx,ky,part,box,rings,tube,printed):
    def turned(name,c,profile,color,n=40):
        x,y,z=c
        obj=rings(name,[[(x+r*cos(i*2*pi/n),y+r*sin(i*2*pi/n),z+dz) for i in range(n)] for dz,r in profile],color)
        for f in obj.data.polygons:f.use_smooth=len(f.vertices)==4
        return obj
    # The blue lidded pot rests on the right hob. Two open handles and a red knob remain visible from above.
    x,y=kx+.25,ky-.055;z=.658
    turned('Aqua Hape cooking pot',(x,y,z),[(0,.039),(.002,.049),(.009,.052),(.047,.057),(.050,.055)],'turquoise')
    turned('Enamel lid and rim',(x,y,z+.048),[(0,.057),(.003,.059),(.006,.056),(.009,.045),(.012,.019)],'enamel')
    turned('Red lid knob',(x,y,z+.059),[(0,.006),(.003,.007),(.004,.011),(.010,.012),(.012,.009)],'softRed',28)
    for side in (-1,1):
        tube('Loop handle on play pot',[(x+side*.052,y-.017,z+.040),(x+side*.069,y-.017,z+.043),
          (x+side*.071,y-.009,z+.044),(x+side*.071,y+.011,z+.044),(x+side*.068,y+.017,z+.043),(x+side*.052,y+.017,z+.040)],.0034,'turquoise',10)
    # Blender base, translucent jug wall, red lid, pour spout and open handle.
    x,y,z=kx+.153,ky+.09,1.129
    turned('Toy blender foot',(x,y,z),[(0,.035),(.004,.040),(.017,.040),(.024,.030)],'enamel',32)
    turned('Blender red centre boss',(x,y,z+.022),[(0,.026),(.008,.022),(.011,.025)],'softRed',32)
    turned('Translucent toy blender jug',(x,y,z+.032),[(0,.022),(.006,.028),(.063,.033),(.072,.036)],'kitchenGlass',36)
    for side in (-1,1):
        tube('Jug side mould seam',[(x+side*.023,y-.011,z+.035),(x+side*.030,y-.013,z+.100)],.0013,'enamel',8)
    tube('Open jug handle',[(x+.030,y,z+.096),(x+.045,y,z+.096),(x+.047,y,z+.091),(x+.045,y,z+.060),(x+.032,y,z+.050)],.0027,'kitchenGlass',9)
    turned('Red blender lid',(x,y,z+.104),[(0,.036),(.003,.037),(.006,.035),(.008,.022)],'softRed',32)
    turned('Lid cap',(x,y,z+.112),[(0,.010),(.004,.010)],'enamel',20)
    box('Blender pulse switch',x,y-.039,z+.011,.014,.005,.011,'softRed',.002)
    # The branch photo shows a black extractor beneath the upper shelf.
    x,y,z=kx+.204,ky+.054,.953
    box('Range hood canopy',x,y,z,.313,.151,.019,'black',.004)
    rows=[]
    for h,w,d in [(0,.310,.150),(.067,.115,.076),(.075,.100,.070)]:
        rows.append([(x+sx*w/2,y+sy*d/2,z+.018+h) for sx,sy in [(-1,-1),(1,-1),(1,1),(-1,1)]])
    rings('Pyramidal extractor hood',rows,'black')
    box('Range hood flue',x,y+.012,z+.088,.087,.065,.061,'black',.002)
    for i in range(3):
        tube('Extractor control key',[(x-.029+i*.022,y-.075,z+.009),(x-.029+i*.022,y-.077,z+.009)],.003,'hub',12)
    cardx=kx+.22
    printed('Kitchen clock and heat indicators',(cardx,ky-.2295,.573),(1,0,0),(0,0,1),.142,.034,'clock',part)
