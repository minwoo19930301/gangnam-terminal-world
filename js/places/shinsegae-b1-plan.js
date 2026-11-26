// The B1 customer guide is traced on a 1823 × 1367 display of the 2000 × 1500 plan.
export function b1Plan(px, py) {
  return [33.163950553 - .133 * (py * 1500 / 1367 - 548),
    58.979162098 + .133 * (px * 2000 / 1823 - 860)];
}

export const departmentWidth = 67;
export const departmentDepth = 84.7;

export function departmentPoint(u, v) {
  const a = u / departmentWidth, b = v / departmentDepth;
  return [-107.07 + 62.61 * a + 30.43 * b - .32 * a * b,
    -24.31 - 23.77 * a + 79.03 * b + .13 * a * b];
}

export const marketOutline = [
  [498,491], [693,491], [753,530], [753,556], [819,556], [819,776],
  [724,776], [724,752], [498,752],
];

// Both basement owners follow this return. The building above keeps its straight wall.
const west = marketOutline.slice(5).map(([x,y]) => b1Plan(x,y));
export const marketWestReturn = [[0,west[0][1]], ...west, [0,west.at(-1)[1]]]
  .map(([u,v]) => departmentPoint(u,v));

// The public aisle between the market and BO&MIE crosses the shared mall
// boundary at u=0. Both builders need the same opening in their B1 wall.
export const cinemaAisleSides = [820,840].map(px => b1Plan(px,700)[1]);
const [start,end] = cinemaAisleSides.map(v => departmentPoint(0,v));
export const cinemaAisleMouth = {
  x:(start[0]+end[0])/2, z:(start[1]+end[1])/2,
  width:Math.hypot(end[0]-start[0],end[1]-start[1]),
};
