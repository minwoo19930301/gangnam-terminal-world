// The Blender exporter stores signed deltas as base64 varints. Dimensions and
// wheel contacts remain available without unpacking the vertex or face arrays.
function unpack(encoded, positions) {
  const bytes = atob(encoded);
  const values = [];
  let previousFace = 0;
  for (let i = 0; i < bytes.length;) {
    let zigzag = 0, scale = 1, byte;
    do {
      byte = bytes.charCodeAt(i++);
      zigzag += (byte & 127) * scale;
      scale *= 128;
    } while (byte & 128);
    let value = zigzag % 2 ? -(zigzag + 1) / 2 : zigzag / 2;
    const index = values.length;
    if (positions) {
      value += index < 3 ? 0 : values[index - 3];
    } else {
      const column = index % 4;
      if (column === 0) previousFace = value += previousFace;
      else if (column < 3) value += previousFace;
    }
    values.push(value);
  }
  return values;
}

export function vehicleMesh(size, contacts, wheels, vertices, triangles) {
  let mm, faces;
  return {size, contacts, wheels,
    get mm() { return mm ??= unpack(vertices, true); },
    get faces() { return faces ??= unpack(triangles, false); }
  };
}
