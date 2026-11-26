"""The charcoal slanted portal under the Gyeongbu end wall."""
import math
from geometry import Part


def silhouette(low=False):
    body=Part('01 · Canted stone jambs and deep fascia')
    rim=Part('02 · Door-head metalwork and soffit trim','Metal')
    soffit=Part('03 · Vestibule ceiling and panel joints')
    glass=Part('04 · Vestibule clerestory','Glass')
    lamps=Part('05 · Recessed entrance luminaires','Lamps')
    height=7.22
    shift=lambda h:1.01*h/height
    front,back=2.56,-3.97
    for left,right in [(-7.05,-5.05),(4.92,6.83)]:
        outline=[(left,0),(right,0),(right+shift(height),height),(left+shift(height),height)]
        body.prism(outline,back,front,0,.94,1)
        if low:continue
        # Well-jointed stone strips follow the lean, rather than upright boxes
        # cutting through a sloped silhouette. Subtle alternating slab shades.
        for j in range(7):
            z0,z1=.12+j*1.015,.12+(j+1)*1.015-.012
            for i in range(2):
                a=left+i*(right-left)/2+.007;b=left+(i+1)*(right-left)/2-.007
                fill=.954 + ((j*11+i*17)%5)*.009
                body.face([(a+shift(z0),front+.012,z0),(b+shift(z0),front+.012,z0),
                           (b+shift(z1),front+.012,z1),(a+shift(z1),front+.012,z1)],0,(0,1,0),fill)
        for edge,inward in [(left,-1),(right,1)]:
            for j in range(6):
                h0,h1=.11+j*.92,.11+(j+1)*.92-.012
                for bay in range(5):
                    d0=back+bay*1.305+.008;d1=d0+1.289
                    body.face([(edge+shift(h0)+inward*.008,d0,h0),(edge+shift(h0)+inward*.008,d1,h0),
                               (edge+shift(h1)+inward*.008,d1,h1),(edge+shift(h1)+inward*.008,d0,h1)],
                              1,(inward,0,.02),.90+bay*.020)
        lower=[(left,0),(right,0),(right+shift(.095),.095),(left+shift(.095),.095)]
        rim.prism(lower,back-.01,front+.025,1,.78)
    floor_h=5.52
    # Full-depth stone lintel. The front and soffit meet with a narrow
    # shadow return and drip, as seen from beneath the real nameplate.
    outline=[(-7.05+shift(floor_h),floor_h),(6.83+shift(floor_h),floor_h),
             (6.83+shift(height),height),(-7.05+shift(height),height)]
    body.prism(outline,back,front+.016,0,.97,1)
    if not low:
        for i in range(10):
            a=-7.05+13.88*i/10;b=-7.05+13.88*(i+1)/10
            d=front+.027
            body.face([(a+shift(floor_h)+.006,d,floor_h+.017),(b+shift(floor_h)-.006,d,floor_h+.017),
                       (b+shift(height)-.006,d,height-.016),(a+shift(height)+.006,d,height-.016)],
                      0,(0,1,0),.944+((i*7)%6)*.011)
        rim.box(.86,front+.013,height-.045,13.87,.087,.04,1,.85)
        rim.box(.71,front+.010,floor_h+.006,13.85,.096,.039,1,.77)
        # Genuine shadow inside the undercroft, layered above the public door.
        for i in range(8):
            for j in range(5):
                a=-5.05+shift(floor_h)+i*9.97/8;b=a+9.97/8
                d0=back+j*(front-back)/5;d1=d0+(front-back)/5
                soffit.top(a+.007,d0+.007,b-.007,d1-.007,floor_h-.014,1,.76+.043*j,True)
        for x in [-3.53,-.77,1.98,4.62]:
            for d in [1.68,-1.42]:
                for inner,outer,h,sw,tint in [(.050,.083,5.491,5,.56),(.035,.050,5.493,6,.85),(.004,.036,5.494,4,1)]:
                    target=lamps if sw==4 else rim
                    for i in range(16):
                        t,b=i*math.tau/16,(i+1)*math.tau/16
                        ring=[(x+inner*math.cos(t),d+inner*math.sin(t),h),(x+outer*math.cos(t),d+outer*math.sin(t),h),
                              (x+outer*math.cos(b),d+outer*math.sin(b),h),(x+inner*math.cos(b),d+inner*math.sin(b),h)]
                        target.face(ring,sw,(0,0,-1),tint)
        # Tinted upper glass lives above the clear existing door. All public
        # ground-level paths remain defined by the terminal's original frame.
        for i in range(6):
            x=-3.45+i*1.216
            rim.box(x,-4.055,3.49,.041,.072,1.99,5,.70)
        for z in [3.50,4.49,5.43]:rim.box(.19,-4.05,z,7.28,.07,.039,5,.76)
        # Small oblique bevels on the back sills catch direct daylight.
        rim.box(.19,-4.01,3.465,7.29,.105,.038,6,.70)
    if not low:
        # Feather the portal's shade into the existing public glass vestibule.
        # The skin stays above and beside the 4 m door, leaving its approach open.
        for i in range(6):
            a=-3.46+i*1.216
            for j,level in enumerate([3.50,4.02,4.53,5.04]):
                tone=(.55+.052*(3-j),.64+.037*(3-j),.70+.027*(3-j))
                glass.front(a+.023,level+.018,a+1.19,level+.495,-4.11,5,tone)
    windows=Part('07 · Four inset windows above the public entrance')
    panes=Part('08 · Glazing and sloped awning sashes','Metal')
    centers=[-3.42,-1.19,1.04,3.27]
    # The building face is set behind the lintel. Four short hopper windows
    # can be counted above its name in both public exterior photographs.
    windows.front(-5.96,7.22,6.73,8.66,1.6,4,.91)
    for cx in centers:
        windows.front(cx-.57,7.38,cx+.57,8.31,1.63,5,.51)
        if low:continue
        windows.front(cx-.528,7.43,cx+.528,8.26,1.644,5,(.81,.88,.94))
        windows.front(cx-.503,7.44,cx+.502,7.80,1.659,5,(.56,.63,.68))
        panes.box(cx,1.682,7.80,1.075,.055,.034,6,.77)
        panes.box(cx,1.664,7.402,1.11,.11,.035,6,.84)
        panes.face([(cx-.527,1.648,8.245),(cx+.527,1.648,8.245),(cx+.527,1.724,7.85),(cx-.527,1.724,7.85)],5,(0,1,.13),(.84,.92,.97))
    floor=Part('09 · Granite threshold and the shaded paving below the canopy')
    spans=[(-7.02,-3.15),(-2.96,-.035),(.433,2.848),(3.04,7.50)]
    def ambient(x,d,z):
        outside=max(0,d-front)
        distance=min(max(0,4.92-x),max(0,x+5.05))
        base=.86-.14*min(1,max(0,(front+.10-d)/3.00))
        contact=.15*math.exp(-distance/.52)*math.exp(-outside/.46)
        return base-contact,(base-contact)*.997,(base-contact)*.982
    for a,b in spans:
        if low:
            floor.top(a,back,b,3.28,.070,4,.78)
            continue
        columns=max(1,round((b-a)/.72))
        for i in range(columns):
            x0=a+(b-a)*i/columns;x1=a+(b-a)*(i+1)/columns
            for j in range(10):
                d0=back+j*(3.28-back)/10;d1=back+(j+1)*(3.28-back)/10
                floor.top(x0,d0,x1,d1,.069,0,.99)
                floor.top(x0+.0026,d0+.0026,x1-.0026,d1-.0026,.072,4,ambient)
    return [p for p in [body,rim,soffit,glass,lamps,windows,panes,floor] if p.faces]
