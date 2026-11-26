// Existing customer passage in the House ground plan. s is along the ramp,
// t across it. The hotel lobby and House floor labels use different datums.
export const liftPassage={
  low:-38.25, high:-14, west:9.40, east:11.40, join:-30.18, lobbyY:8.55, roofY:10.97,
};

export function walnutWalls(){
  const {low,high,west,east,lobbyY,roofY}=liftPassage;
  const walls=[];
  for(const t of [west,east]){
    walls.push([low,t,-25.6,t,7,roofY],[-25.6,t,high,t,7.76,roofY]);
  }
  for(const [a,b,c,d] of [[high,west,-11.9,west],[-11.9,west,-11.9,11.42],
    [-11.9,11.42,-12.31,11.42],[high,east,-13.69,east]]){
    walls.push([a,b,c,d,lobbyY,roofY]);
  }
  for(const [a,b,c,d] of [[-40.35,8.57,-40.35,east],[-40.35,east,low,east],[low,8.57,low,west]]){
    walls.push([a,b,c,d,7,roofY]);
  }
  return walls;
}
