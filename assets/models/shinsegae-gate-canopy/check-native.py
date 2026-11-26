"""Verify the editable city entrance with three actual ray intersections."""


def check_north_entrance(city):
    from mathutils import Vector

    root = next(obj for obj in city.objects if obj.get("shell_key") == "159117108")
    facade = next(
        obj for obj in root.children if obj.type == "MESH" and obj.get("shell_part")
    )

    def at(u, v, h):
        a, f = u / 67, v / 84.7
        return Vector(
            (
                -107.07 + 62.61 * a + 30.43 * f - 0.32 * a * f,
                24.31 + 23.77 * a - 79.03 * f - 0.13 * a * f,
                root.location.z + h,
            )
        )

    for height, expected in [(2.0, 5.0), (14.0, 7.9), (30.0, 2.0)]:
        start = at(34.0, -12.0, height)
        direction = (at(34.0, 0.0, height) - start).normalized()
        distances = []
        for obj in [root, facade]:
            inverse = obj.matrix_world.inverted()
            hit, point, _, _ = obj.ray_cast(
                inverse @ start, (inverse.to_3x3() @ direction).normalized()
            )
            if hit:
                distances.append((obj.matrix_world @ point - start).length)
        assert (
            distances
            and abs(min(distances) - (at(34.0, expected, height) - start).length) < 0.22
        ), (height, distances)
    canopy = next(
        obj
        for obj in city.objects
        if obj.get("indoor_placement_id")
        == "shinsegae/신세계 강남점 정문 · 곡면 유리 캐노피/1"
    )
    assert {
        c.instance_collection.name for c in canopy.children if c.instance_collection
    } == {"GangnamNorthGateCanopy", "GangnamNorthGateSupports"}
    print(
        "Verified recessed entrance, planar lower glazing, upper bay and both canopy posts",
        flush=True,
    )
