// Sample the normal street scene. Run with the local server open:
// node tools/profile_garden_drive.mjs http://127.0.0.1:8794/ > garden-drive.csv
// Add --vehicle to follow the parking aisles through to the valet drop-off.
import { chromium } from 'playwright';

const vehicle = process.argv.includes('--vehicle');
const url = new URL(process.argv.slice(2).find(arg => arg !== '--vehicle') || 'http://127.0.0.1:8794/');
url.hash = '/street?p=425.78,0,-47.58,240';
const browser = await chromium.launch({ channel: process.env.PROFILE_BROWSER || 'chrome' });
try {
  const page = await browser.newPage();
  const renderErrors = [];
  page.on('pageerror', error => renderErrors.push(error.message));
  page.on('console', message => {
    if (message.type()==='error') renderErrors.push(message.text());
  });
  await page.goto(url.href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__world?.ready || window.__world?.errors?.length, null, { timeout: 180000 });
  const rows = await page.evaluate(async vehicle => {
    const { K, phys, ready, errors } = window.__world;
    if (!ready || errors.length) throw new Error(errors.join('\n') || 'Street scene failed to load');
    const { relief, surveyElevation } = await import(new URL('js/banpo_relief.js', document.baseURI));
    const { terminalSurveyHeight } = await import(new URL('js/banpo_dem.js', document.baseURI));
    const { gardenPoint } = await import(new URL('js/places/_gardenGrade.js', document.baseURI));
    const way = id => K.osm.roads.find(road => road.id === id).pts;
    const hotelPoint = (along, across) => {
      const length = Math.hypot(62, 24);
      return [29 + (-62 * along + 24 * across) / length, 144 + (24 * along + 62 * across) / length];
    };
    // The lower through-aisle, eastern fork and upper collector are separate
    // roads. Enter the pub lot through its mapped driveway and retrace it.
    const lower = [[425.78,-47.58],[434.4,-47.3],[443.4,-50],[449.9,-48.6],way(498559929)[0],
      [444.8,-39.2],[443,-32],[442.5,-21.2]];
    const collector = [...way(907930149), ...way(830683723).slice(1), way(816395055)[1]];
    const driveway = [...way(921681575), gardenPoint(328,32), gardenPoint(327.7,29), [374.73,17.67], [373.17,14.53]];
    const forkIndex = collector.findIndex(p => p[0] === driveway[0][0] && p[1] === driveway[0][1]);
    if (forkIndex < 0) throw new Error('Missing restaurant driveway junction in OSM');
    const approach = [...way(301889794).slice(1,5), [40,150],[36,151.6],[35,153],
      hotelPoint(3,15.7),hotelPoint(18,15.7),hotelPoint(28,15.7)];
    const walk = [...lower, ...collector.slice(0, forkIndex), ...driveway, ...driveway.slice(0,-1).reverse(),
      ...collector.slice(forkIndex + 1), ...approach];
    const arrival = lower.length + forkIndex + driveway.length - 1;
    const walkLabels = new Map([[0,'버스 주차장 사잇길'],[4,'오르막 시작점'],[lower.length,'동측 갈림길'],
      [arrival - driveway.length + 1,'식당 주차장 진입'],[arrival,'데빌스도어 문턱'],
      [arrival + driveway.length - 1,'주차장 진입로 복귀'],[walk.length - approach.length - 1,'호텔 방면 회전'],
      [walk.length - 1,'JW 발레 승하차점']]);
    const drive = [], driveLabels = new Map();
    function addRoad(points, station) {
      for (const point of points) {
        const previous = drive.at(-1);
        if (!previous || point[0] !== previous[0] || point[1] !== previous[1]) drive.push(point);
      }
      if (station) driveLabels.set(drive.length - 1, station);
    }
    if (vehicle) {
      addRoad(way(921681575).slice(0,1), '데빌스도어 방면 차로');
      addRoad(way(921681575).slice(1), '식당 앞 주차 통로');
      addRoad([way(593858544)[0]]);
      addRoad(way(593858542).slice().reverse());
      addRoad(way(356129686).slice(3));
      addRoad(way(593858541).slice(0,3), '서측 주차 열 진입');
      addRoad(way(1232132207).slice(1), '서측 주차 열 끝');
      addRoad(way(593858541).slice(5));
      addRoad([way(816395055)[1]], '호텔 방면 회전');
      addRoad(approach, 'JW 발레 승하차점');
    }
    const route = vehicle ? drive : walk;
    const labels = vehicle ? driveLabels : walkLabels;
    let distance = 0, support = vehicle ? phys.support(...route[0],14).y : 0;
    let lastHeight;
    const samples = [];
    for (let i = 0; i < route.length; i++) {
      const [x0,z0] = route[Math.max(0, i-1)], [x1,z1] = route[i];
      const length = Math.hypot(x1-x0,z1-z0);
      const steps = Math.max(1,Math.ceil(length/.25));
      for (let j = 1; j <= steps; j++) {
        const x = x0 + (x1-x0)*j/steps, z = z0 + (z1-z0)*j/steps;
        // Follow the surface reachable from the previous point, including
        // underpasses. A ray from the sky would select roofs over the aisle.
        const foundation = relief(x,z), terrain = surveyElevation(x,z);
        const reachable = lastHeight === undefined ? support + .5 : lastHeight - foundation + .5;
        const next = phys.support(x,z,reachable).y;
        if (!Number.isFinite(next) || (lastHeight !== undefined && Math.abs(lastHeight-next-foundation) > .5)) throw new Error('Discontinuous surface at '+[x,z]);
        support = next;
        const height = next+foundation;
        if (vehicle && length) {
          if (lastHeight !== undefined && Math.abs(height-lastHeight) > .18) throw new Error('Vehicle hits a step at '+[x,z]);
          for (const offset of [-.77,.77]) {
            const wx = x + offset*(z1-z0)/length, wz = z - offset*(x1-x0)/length;
            const wheelDatum = relief(wx,wz);
            const wheelHeight = phys.support(wx,wz,height-wheelDatum+.35).y + wheelDatum;
            if (Math.abs(wheelHeight-height) > .24) throw new Error('Wheel leaves roadway at '+[wx,wz]);
          }
          const position = { x, z };
          phys.resolve(position,.93,next+.08,next+1.6,.14);
          if (Math.hypot(position.x-x,position.z-z) > .04) throw new Error('Vehicle obstructed at '+[x,z]);
        }
        lastHeight = height;
        samples.push([distance + length*j/steps,x,z,terrain,foundation+next,foundation,next,foundation+next+terminalSurveyHeight].map(n=>n.toFixed(4))
          .concat(j===steps ? labels.get(i) || '' : ''));
      }
      distance += length;
    }
    return samples;
  }, vehicle);
  if (renderErrors.length) throw new Error(renderErrors.join('\n'));
  console.log('distance_m,x_m,z_m,terrain_y_m,surface_y_m,authored_zero_y_m,local_support_m,surface_elevation_m,station');
  console.log(rows.map(row=>row.join(',')).join('\n'));
} finally {
  await browser.close();
}
