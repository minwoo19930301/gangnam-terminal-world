// Engine self-test place (not in PLACES). Load with ?places=_demo
export const meta = { id: '_demo', name: '데모', claims: [] };
export function build(K) {
  const x0 = 400, z0 = 150; // empty-ish lot east of the terminal
  const poly = [[x0, z0], [x0 + 40, z0], [x0 + 40, z0 + 30], [x0, z0 + 30]];
  const H = 5;
  for (let f = 0; f < 3; f++) {
    const y = f * H;
    K.slab(poly, y, { mat: f ? 'marble' : 'tile', holes: f ? [[[x0 + 10, z0 + 10], [x0 + 22, z0 + 10], [x0 + 22, z0 + 14], [x0 + 10, z0 + 14]]] : null });
    K.zone({ name: '데모 빌딩', floor: `${f + 1}F`, sub: ['화장품', '여성패션', '식당가'][f], poly, y0: y, y1: y + H });
    for (let i = 0; i < 6; i++) { K.box({ x: x0 + 5 + i * 6, y, z: z0 + 25, w: 4, h: 2.6, d: 3, mat: 0xf0ece4 }); K.sign(['CHANEL', 'DIOR', '설화수', 'MAC', 'LANCOME', 'SK-II'][i], { x: x0 + 5 + i * 6, y: y + 2.9, z: z0 + 23.4, w: 3.4, h: 0.5, bg: '#111', fg: '#fff' }); }
    K.crowd([[x0 + 3, z0 + 3], [x0 + 37, z0 + 3], [x0 + 37, z0 + 20], [x0 + 3, z0 + 20]], y, 12, { seed: f + 1 });
  }
  K.slab(poly, 3 * H, { mat: 'roofgravel', under: 'ceiling' });
  K.polyWalls(poly, 0, 3 * H, { mat: { tex: 'blank', color: 0xd8d0c4 }, inner: 0xf2efe8, floorH: H, openings: [{ x: x0 + 20, z: z0 + 30, w: 6, y0: 0, y1: 3.2 }] });
  K.escalator(x0 + 11, z0 + 12, x0 + 21, z0 + 12, { ya: 0, yb: 5, dir: 'up' });
  K.escalator(x0 + 21, z0 + 12, x0 + 31, z0 + 12, { ya: 5, yb: 10, dir: 'up' });
  K.stairs(x0 + 34, z0 + 2, x0 + 34, z0 + 12, { w: 2, ya: 0, yb: 5 });
  K.elevator({ name: '데모 엘리베이터', x: x0 + 3, z: z0 + 15, rotY: Math.PI / 2, floors: [{ label: '1F', y: 0, name: '화장품' }, { label: '2F', y: 5, name: '여성' }, { label: '3F', y: 10, name: '식당가' }] });
  K.sign('DEMO 백화점', { x: x0 + 20, y: 12, z: z0 + 30.3, w: 20, h: 3, bg: null, fg: '#a01020' });
  K.spawn({ name: '데모 정문', x: x0 + 20, y: 0, z: z0 + 34, yaw: 0 });
}
