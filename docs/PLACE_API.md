# Place module contract

Every detailed place is one ES module `js/places/<id>.js`:

```js
export const meta = {
  id: 'shinsegae',                 // == file name
  name: '신세계백화점 강남점',
  claims: [159117108],             // OSM building ids this module replaces (city.js will NOT extrude them)
  claimRoads: [],                  // OSM road way ids this module renders itself (optional)
  claimAreas: [],                  // OSM area ids (parks, parking, water…) this module renders itself (optional)
  sources: ['https://…', '…'],     // where the floor guide / tenant info came from
};
export function build(K) { … }    // synchronous, must not throw
```

## World conventions
- Units are meters. `x` = east, `z` = **south**, `y` = up. Origin = 고속터미널역 (station node). North is `-z`.
- Street level is `y = 0` (flat terrain). Every building's 1F floor top is `y = 0`.
- Underground floor tops: `K.LEVELS` = `{B1:-6, B2:-11, B3:-16, B4:-21, B5:-26, B6:-31}`. Use these so B1s line up across modules.
- Above ground, choose real floor-to-floor heights (department store ≈ 5–5.5 m, hotel rooms ≈ 3.3–3.6 m, terminal hall higher). Exterior height MUST equal the sum of your floors (the exterior and interior are the same geometry: you walk in through the doors).
- OSM footprints (meters) come from `K.osmBuilding(id)` → `[{poly:[[x,z],…], holes, levels, height, …}]`. Build on the real footprint.
- `rotY` for boxes/signs: rotation around +y. `rotY = 0` → a sign faces **+z (south)**. `rotY = Math.PI/2` → faces +x (east). Facing direction of an outward wall with outward normal (nx,nz) is `Math.atan2(nx, nz)`.
- `docs/overview*.png` show the OSM map in this exact coordinate system. `data/osm.json` has all footprints, roads, POIs (`osm.pois` with shop names), subway exits (`osm.exits` with `ref`).
- Shared connections are in `js/places/_junctions.js` (`JUNCTIONS`, `WELLS`). Honor every entry that names your module.

## K API (js/kit.js)
Materials (`mat`) can be: a hex number (`0xd8d0c0`), a texture name string, or `{tex, color, scale:[mU,mV]}` (color tints the texture).
Texture names: `asphalt sidewalk tile marble darkstone wood carpet concrete grass water parking ceiling metal brick roofgravel`,
facades (u = one bay, v = one floor, pass `floorH`): `apt office shop oldshop hotel blank school`; plus `'glass'` (transparent) and `'emit'` (unlit, glowing; use for light panels/LED).
Custom: `K.texture(key, w, h, (g,w,h)=>{…canvas 2D drawing…}, [mU,mV], {facade, transparent})` then use `key` as a texture name.

Geometry (all static geometry is merged per material; thousands of calls are fine):
- `K.box({x,y,z,w,h,d,rotY,mat,top,side,bottom,solid=true,skip:['top','bottom','n','s','e','w'],floorH})` — `y` is the bottom. solid → collision walls + walkable top.
- `K.prism(poly, y0, y1, {mat, top, bottom, side, holes, solid=true, walkTop, floorH})` — extruded polygon.
- `K.slab(poly, y, {mat='tile', under='ceiling', thick=0.3, holes, walk=true, ceil=true, edge})` — floor with ceiling underneath; walkable at `y`. Use `holes` for atriums / escalator voids / wells.
- `K.wall(ax,az,bx,bz,y0,y1,{thick=0.2, mat, mat2, openings:[{at,w,y0,y1}], solid})` — straight wall, `at` = distance from A to opening center.
- `K.polyWalls(poly, y0, y1, {mat (outside), inner (inside), thick, openings:[{x,z,w,y0,y1}], floorH})` — walls along a polygon outline; openings snap to the nearest edge. Use for building envelopes (`mat` = facade, `inner` = interior finish). Glass curtain wall: `mat:'glass'`.
- `K.ramp(ax,az,bx,bz,{w,ya,yb,mat,steps,rails})`, `K.stairs(…)` (= ramp with steps), `K.escalator(ax,az,bx,bz,{ya,yb,w,dir:'up'|'down',speed})` — walkable. Escalators carry the player.
- `K.cyl({x,y,z,r,h,mat,seg})` columns, `K.dome({x,y,z,rx,ry,rz,mat})`.
- `K.sign(text|[lines], {x,y,z,w,h,rotY,bg,fg,bold,twoSided,box,offset,sub})` — text panel (Korean OK). `bg:null` → transparent background (letters only). Use real shop/brand names (text only, no logos).
- `K.floorText(text, {x,y,z,w,h,rotY,fg})` — painted floor text (bus bay numbers, 승차홈 numbers…).
- `K.quad(mat, [[x,y,z]×4], normal)`, `K.hpoly(mat, poly, y, up, holes)` — raw faces (no collision).
- `K.vehicle({x,y,z,rotY,kind:'car'|'taxi'|'bus'|'cityBus'|'truck'|'van',color,label})` — static vehicle (bus `label` = destination sign).
- `K.person(x,y,z,{rotY,shirt,pants,sit})`, `K.crowd(poly, y, n)` — instanced people. `K.tree(x,z,{y,h,kind:'zelkova'|'ginkgo'|'pine'|'cherry'})`.

Gameplay:
- `K.zone({name, floor, sub, poly|rect:[x0,z0,x1,z1], y0, y1, priority})` — what the HUD shows (e.g. name `신세계백화점 강남점`, floor `3F`, sub `여성 컨템포러리 · 해외패션`). Register one per floor (and per notable sub-area) with `y0`=floor y, `y1`=next floor y.
- `K.spawn({name, x,y,z,yaw, group, default})` — teleport targets in the map list. `yaw` radians, 0 = facing north (-z). Spawn y must be ON a floor.
- `K.elevator({name, x, z, rotY, w, d, floors:[{label:'B1', y:-6, name:'식품관'}, …]})` — real elevator: builds shaft + car with door openings facing `rotY`, press E to pick a floor. Every listed floor must have a slab under the car and a walkable floor outside the door.
- `K.portal({x,y,z,r,label,to:{x,y,z,yaw}})` — E-to-teleport (use sparingly, e.g. hotel room doors).
- `K.groundHole(poly)` — removes street-level ground inside `poly` (needed above stairwells/sunken plazas going below y=0; the ground plane is otherwise solid at y=0 everywhere).
- `K.onFrame((dt, t, player) => …)` — animation (fountains, moving buses…). `K.onNight(on => …)` — called when the user toggles night (store your emissive meshes to brighten).
- `K.addMesh(threeMesh)` — escape hatch for custom THREE meshes (not merged, no collision). `K.THREE` is three.js r160.
- Helpers: `K.rand(seed)` deterministic RNG, `K.pointInPoly`, `K.polyBBox`, `K.polyArea`, `K.orient(poly)` (outward normal per edge), `K.osmFind(pred)`.

Collision model: player capsule r=0.32, height 1.75, step-up 0.5 m. Walls block within their y-range; anything with a walkable top can be stood on. Floors are only what you register (slab/box tops/ramps) plus the global street ground (y=0 minus ground holes).

## Lazy floor detail — `K.detail`

`K.detail({ floor, y0, y1, rect: [x0, z0, x1, z1] | poly, name }, K => { ...furnishing... })` registers a group that is
built only when the camera comes within ~60 m horizontally and ±8 m of `y0..y1` (screenshots and the tests build all
groups). Use it for the heavy, per-floor furnishing: shop stock, shelves, racks, counters, tables and chairs, fixtures,
light panels, small signage, people (`K.crowd/K.person`), plants. Because each floor only costs memory and frame time
when someone is near it, a floor can be far more detailed than before (budget about 120k quads per detail group).

Keep in the normal build (outside `K.detail`): everything you must be able to stand on or bump into before the group
exists — slabs and their holes, outer walls and room partitions, stairs, escalators, elevators, junction corridors —
plus `K.zone`, `K.spawn`, `K.interact`/`K.elevator` and the exterior. One group per floor (or per large room of a
floor) is the intended granularity; groups may add walls (furniture collision) and signs.

## Addresses

Every place/floor has an address `#/<place>/<floor>?p=x,y,z,yaw` (the floor label of the zone you stand in). Walking into
another place or floor pushes a browser-history entry; opening an address starts there. Name zones' `floor` exactly as
the floor is called on site (B1, 1F, 1M, 2F …).

## Quality bar
- Every real floor exists and is walkable, reachable by stairs/escalators AND an elevator, with zones per floor naming what is sold there.
- Interiors have real tenants/brands/categories from the research file (signs on every shop front), shop partitions, counters/racks/shelves, corridors, toilets/escalator voids where they really are, information desks, columns grid, ceilings with light panels, people.
- Exterior matches road-view look: facade material/colour, signage (big brand letters), entrances at the real sides, canopies.
- Performance: prefer boxes/prisms; avoid > ~150k quads per module. No per-frame allocations in onFrame.
- Never touch files outside your module (+ your research/shots folders). Engine bugs → report them in your final answer.

## Testing
- `node tests/smoke.mjs <id> [other ids…]` — builds with the real kit in node, checks spawns/elevators/junction floors. Must print `OK`.
- `node tests/shot.mjs --places <id> --city 0 --out shots/<id> --views "name:x,y,z,yawDeg,pitchDeg;…"` — headless screenshots (yaw 0 = north, 90 = west, 180 = south, 270 = east). Then look at the PNGs.
- Full world: `node tests/serve.mjs 8765` → http://127.0.0.1:8765/ (URL params: `places=a,b`, `city=0`, `pos=x,y,z`, `yaw`, `pitch`, `fly=1`, `night=1`).
