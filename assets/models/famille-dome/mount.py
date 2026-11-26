"""Open the roof of the OSM drum below the pavilion and glaze its outer skin."""
import bmesh
import bpy


def open_pavilion(parent, skin):
    # The imported OSM footprint has a flat roof directly below the glass dome.
    bm=bmesh.new()
    try:
        bm.from_mesh(parent.data)
        cap=[f for f in bm.faces if f.normal.z>.99 and
             all(abs(v.co.z-11.7)<.003 for v in f.verts)]
        if cap:
            bmesh.ops.delete(bm,geom=cap,context='FACES')
            bm.to_mesh(parent.data)
            parent.data.update()
    finally:
        bm.free()

    old='LANDMARK · mint'
    pane=next((m for m in skin.data.materials if m.name==old),None)
    if pane is None:return
    glass=bpy.data.materials.get('파미에 돔 · 녹색 외측 유리')
    if glass is None:
        glass=bpy.data.materials.new('파미에 돔 · 녹색 외측 유리')
        # The distant game envelope retains the original colour.
        glass.diffuse_color=pane.diffuse_color
        glass.use_nodes=True
        graph=glass.node_tree
        output=graph.nodes['Material Output']
        diffuse=graph.nodes['Principled BSDF']
        diffuse.inputs['Base Color'].default_value=glass.diffuse_color
        diffuse.inputs['Roughness'].default_value=.21
        clear=graph.nodes.new('ShaderNodeBsdfTransparent')
        clear.inputs[0].default_value=(.94,.98,.97,1)
        mix=graph.nodes.new('ShaderNodeMixShader')
        mix.inputs[0].default_value=.85
        graph.links.new(diffuse.outputs[0],mix.inputs[1])
        graph.links.new(clear.outputs[0],mix.inputs[2])
        graph.links.new(mix.outputs[0],output.inputs['Surface'])
    index=skin.data.materials.find(old)
    skin.data.materials[index]=glass
