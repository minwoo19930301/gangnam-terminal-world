"""Build a curbside sedan exterior overlay in the original fleet's local metres."""
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parent
bpy.ops.wm.read_factory_settings(use_empty=True)
coll = bpy.data.collections.new("동문 승용차 · 외장")
bpy.context.scene.collection.children.link(coll)
coll["export_model"] = "sedan-curb"
coll["preview_origin"] = (0, 0, 0)


def material(name, rgb, paint=False):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*tuple(((c / 255 + .055) / 1.055)**2.4 for c in rgb), 1)
    if paint:
        mat["skylight"] = True  # Shared exporter uses zero vertex alpha for this channel.
    return mat


paint = material("차체 도장 · 인스턴스별", (230, 232, 231), True)
seal = material("Graphite moulding", (34, 40, 45))
chrome = material("Satin nickel", (164, 180, 185))
glass = material("Rear screen · tinted", (61, 83, 95))
ceramic = material("Ceramic glass edge", (32, 42, 48))
heater = material("Printed heating filament", (99, 95, 91))
red = material("Red combination lens", (135, 19, 34))
ruby = material("Prismatic red", (203, 55, 62))
silver = material("Clear reflector", (189, 207, 208))
plate = material("Reflective plate · no identifying marks", (225, 229, 223))


def panel(name, points, mat):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(x, -z, y) for x, y, z in points], [], [list(range(len(points)))])
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    coll.objects.link(obj)


def end(name, side, depth, outline, mat):
    panel(name, [(side*x, y, depth) for x, y in outline], mat)


def rect(name, depth, x0, x1, y0, y1, mat):
    end(name, 1, depth, [(x0,y0),(x1,y0),(x1,y1),(x0,y1)], mat)


for s in (-1, 1):
    end("Paint return behind tail cluster", s, -2.379,
        [(.405,.545),(.795,.545),(.795,.696),(.405,.696)], paint)
    end("Tail cluster gasket", s, -2.383,
        [(.305,.694),(.72,.716),(.806,.694),(.788,.599),(.50,.608),(.353,.641)], seal)
    end("Wraparound combination lens", s, -2.385,
        [(.323,.686),(.718,.706),(.795,.688),(.779,.609),(.508,.618),(.366,.647)], red)
    end("Stepped red prism", s, -2.387,
        [(.342,.678),(.713,.696),(.78,.679),(.776,.661),(.703,.675),(.367,.657)], ruby)
    end("Reverse lamp prism", s, -2.388,
        [(.47,.647),(.658,.657),(.661,.636),(.505,.630)], silver)
    panel("Lens corner return", [(s*.793,.686,-2.382),(s*.798,.611,-2.382),
          (s*.846,.63,-2.23),(s*.836,.709,-2.23)], red)
    end("Bumper reflector bezel", s, -2.354,
        [(.495,.459),(.707,.468),(.721,.487),(.505,.483)], seal)
    end("Unlit lower reflex", s, -2.357,
        [(.507,.464),(.697,.473),(.704,.482),(.515,.478)], ruby)
    end("Paint return behind headlamp", s, 2.379,
        [(.405,.545),(.795,.545),(.795,.691),(.405,.691)], paint)
    panel("Upper headlamp gasket", [(s*.428,.689,2.329),(s*.791,.689,2.329),
          (s*.791,.689,2.381),(s*.428,.689,2.381)], chrome)
    end("Headlamp dark housing", s, 2.381,
        [(.396,.56),(.785,.553),(.798,.663),(.694,.697),(.47,.661)], seal)
    end("Faceted headlamp", s, 2.383,
        [(.427,.587),(.766,.574),(.779,.651),(.684,.681),(.483,.653)], chrome)
    for cx in (.555,.697):
        end("Projector cup",s,2.385,[(cx-.045,.625),(cx-.025,.65),(cx+.022,.65),
             (cx+.042,.625),(cx+.021,.603),(cx-.023,.604)], glass)
        end("Projector highlight",s,2.387,[(cx-.024,.632),(cx+.018,.638),(cx+.027,.626),(cx-.019,.62)],silver)
    end("Headlamp light guide",s,2.389,
        [(.451,.588),(.767,.577),(.77,.588),(.457,.601)],silver)
    rect("Mirror glass",.84,s*.884,s*.985,.912,.968,glass)

for y in (.467, .493, .521, .548, .575):
    rect("Grille blade",2.382,-.328,.328,y-.003,y+.003,chrome)

for z,y in [(-2.39,.532),(2.394,.484)]:
    dz = .003 if z > 0 else -.003
    rect("Plate holder",z,-.278,.278,y-.058,y+.058,seal)
    rect("Blank plate",z+dz,-.262,.262,y-.048,y+.048,plate)
    for x in (-.23,.23):
        rect("Plate fixing",z+2*dz,x-.006,x+.006,y-.008,y+.002,chrome)
end("Lower bumper shadow",1,-2.353,[(-.716,.434),(-.608,.402),(.608,.402),
    (.716,.434),(.493,.447),(-.493,.447)],seal)
rect("Boot lid handle",-2.359,-.108,.108,.636,.654,chrome)


# Screen lies on the sloping native rear glass, between its two original stations.
def screen(x, t, offset):
    return (x, .842+.55*t+offset, -1.645+.752*t-offset)


def pane(name, corners, mat, offset):
    panel(name, [screen(x,t,offset) for x,t in corners],mat)


pane("Rear screen frit",[(-.807,.015),(.807,.015),(.724,.982),(-.724,.982)],ceramic,.003)
pane("Tinted rear glass",[(-.765,.055),(.765,.055),(.683,.938),(-.683,.938)],glass,.006)
for n in range(8):
    t=.14+n*.088
    width=.728-.074*t
    pane("Rear demister %02d"%n,[(-width,t),(width,t),(width,t+.005),(-width,t+.005)],heater,.009)
pane("High centre stop bezel",[(-.143,.07),(.143,.07),(.13,.14),(-.13,.14)],seal,.012)
pane("High centre stop lens",[(-.121,.086),(.121,.086),(.115,.125),(-.115,.125)],red,.014)
for a,b in [(-.66,-.11),(.02,.62)]:
    def wind(x,t):
        return (x,.842+.55*t+.009,1.504-1.034*t+.009)
    panel("Parked windscreen wiper",[wind(a,.09),wind(b,.19),wind(b,.212),wind(a,.112)],seal)

# Original fleet car is a linked comparison object, outside the exported collection.
with bpy.data.libraries.load(str(ROOT.parent / "fleet/terminal-fleet.blend"),link=True) as (src,dst):
    dst.collections = ["car"]
if dst.collections[0]:
    preview=bpy.data.objects.new("Original car · context",None)
    bpy.context.scene.collection.objects.link(preview)
    preview.instance_type='COLLECTION'
    preview.instance_collection=dst.collections[0]
    preview.location.x=10.8
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/"curb-trim.blend"),compress=True,relative_remap=True)
