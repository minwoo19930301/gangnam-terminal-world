"""Scene-driven native glazing. Coordinates follow the game's 3.5 × 3 m household grid."""
import bpy

NIGHT = "Seoul apartment night"


def window_group():
    tree = bpy.data.node_groups.new("서울 · 입주 창문", "ShaderNodeTree")
    tree.interface.new_socket(name="Window light", in_out="OUTPUT", socket_type="NodeSocketShader")
    def node(kind, label, x, y):
        n = tree.nodes.new(kind)
        n.label = label
        n.location = (x, y)
        return n
    def plug(value, dest):
        if isinstance(value, bpy.types.NodeSocket):
            tree.links.new(value, dest)
        else:
            dest.default_value = value
    def math(op, a, b, x, y, label=""):
        n = node("ShaderNodeMath", label, x, y)
        n.operation = op
        plug(a, n.inputs[0])
        plug(b, n.inputs[1])
        return n.outputs[0]
    def axes(socket, y):
        n = node("ShaderNodeSeparateXYZ", "", -1450, y)
        plug(socket, n.inputs[0])
        return n.outputs
    geo = node("ShaderNodeNewGeometry", "World coordinates", -1680, 300)
    p, n = axes(geo.outputs["Position"], 360), axes(geo.outputs["True Normal"], -80)
    # The horizontal tangent follows each facade, including diagonal towers.
    along = math("SUBTRACT", math("MULTIPLY", p[1], n[0], -1250, 410),
                 math("MULTIPLY", p[0], n[1], -1250, 260), -1070, 410)
    unit = math("DIVIDE", along, 3.5, -880, 410)
    col = math("FLOOR", unit, 0, -690, 410)
    height = math("ADD", p[2], .15, -1250, 65)
    row = math("FLOOR", math("DIVIDE", height, 3, -1060, 65), 0, -880, 65)
    side = math("ADD", math("MULTIPLY", p[0], n[0], -1250, -110),
                math("MULTIPLY", p[1], n[1], -1250, -260), -1060, -120)
    face = math("FLOOR", math("MULTIPLY", side, .5, -880, -125), 0, -690, -125)
    def modulo(value, limit, x, y):
        return math("FLOORED_MODULO", value, limit, x, y)
    cx = math("ADD", col, math("MULTIPLY", face, 3, -510, 240), -320, 430)
    cy = math("ADD", row, face, -320, 85)
    hx = math("MULTIPLY", modulo(cx, 71, -130, 430), 17, 50, 430)
    hy = math("MULTIPLY", modulo(cy, 97, -130, 85), 31, 50, 85)
    seed = modulo(math("ADD", hx, hy, 230, 360), 101, 410, 360)
    seed = modulo(math("MULTIPLY", seed, math("ADD", seed, 7, 590, 360), 770, 360), 101, 950, 360)
    palette = node("ShaderNodeValToRGB", "Warm, neutral, amber and dark households", 1320, 400)
    palette.color_ramp.interpolation = "CONSTANT"
    entries = [(0, (1,.81,.59,1)), (.19,(.85,.85,.77,1)), (.31,(1,.65,.36,1)), (.46,(0,0,0,1))]
    palette.color_ramp.elements.remove(palette.color_ramp.elements[1])
    for i,(at,color) in enumerate(entries):
        stop = palette.color_ramp.elements.new(at) if i else palette.color_ramp.elements[0]
        stop.color = color
    plug(math("DIVIDE", seed, 100, 1130, 400), palette.inputs[0])
    varying = math("FRACT", math("MULTIPLY", seed, .137, 1130, 170), 0, 1310, 155)
    strength = math("ADD", math("MULTIPLY", varying, .4, 1500, 150), .33, 1680, 150)
    fraction = math("FRACT", unit, 0, -670, 625)
    edge = math("MINIMUM", fraction, math("SUBTRACT", 1, fraction, -475, 770), -290, 635)
    pane = math("GREATER_THAN", edge, .028, -90, 635, "Edge of each household pane")
    night = node("ShaderNodeAttribute", "Scene · Seoul solar altitude", 1660, -100)
    night.attribute_type = "VIEW_LAYER"
    night.attribute_name = NIGHT
    level = math("MULTIPLY", night.outputs["Fac"], strength, 1860, 155)
    upright = math("LESS_THAN", math("ABSOLUTE", n[2], 0, -1070, -450), .25, -875, -450)
    mask = math("MULTIPLY", pane, upright, 1670, 650)
    lamp = node("ShaderNodeEmission", "Occupied apartment", 2260, 360)
    plug(palette.outputs["Color"], lamp.inputs["Color"])
    plug(math("MULTIPLY", level, mask, 2050, 160), lamp.inputs["Strength"])
    out = node("NodeGroupOutput", "", 2460, 360)
    plug(lamp.outputs[0], out.inputs[0])
    return tree


def install_windows(material, group):
    tree = material.node_tree
    output = next(n for n in tree.nodes if n.type == "OUTPUT_MATERIAL" and n.is_active_output)
    surface = output.inputs["Surface"]
    shader = surface.links[0].from_socket
    add = tree.nodes.new("ShaderNodeAddShader")
    add.name = "Native apartment night overlay"
    add.location = (output.location.x, output.location.y)
    output.location.x += 200
    lamps = tree.nodes.new("ShaderNodeGroup")
    lamps.node_tree = group
    lamps.location = (add.location.x - 220, add.location.y - 220)
    tree.links.new(shader, add.inputs[0])
    atlas = tree.nodes.get("Storey glazing")
    emission = lamps.outputs[0]
    if atlas:
        # The game discards these pixels via glTF alphaMask before lighting.
        # Apply the same window opening to the native additive emission.
        cutout = tree.nodes.new("ShaderNodeMixShader")
        cutout.name = "Exterior window cutout"
        tree.links.new(atlas.outputs["Alpha"], cutout.inputs[0])
        tree.links.new(emission, cutout.inputs[2])
        emission = cutout.outputs[0]
    tree.links.new(emission, add.inputs[1])
    tree.links.new(add.outputs[0], surface)
