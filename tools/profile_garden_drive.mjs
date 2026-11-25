// Sample the normal street scene. Run with the local server open:
// node tools/profile_garden_drive.mjs http://127.0.0.1:8794/ > garden-drive.csv
import { chromium } from 'playwright';

const url = new URL(process.argv[2] || 'http://127.0.0.1:8794/');
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
  const rows = await page.evaluate(async () => {
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
    const route = [...lower, ...collector.slice(0, forkIndex), ...driveway, ...driveway.slice(0,-1).reverse(),
      ...collector.slice(forkIndex + 1), ...approach];
    const arrival = lower.length + forkIndex + driveway.length - 1;
    const labels = new Map([[0,'버스 주차장 사잇길'],[4,'오르막 시작점'],[lower.length,'동측 갈림길'],
      [arrival - driveway.length + 1,'식당 주차장 진입'],[arrival,'데빌스도어 문턱'],
      [arrival + driveway.length - 1,'주차장 진입로 복귀'],[route.length - approach.length - 1,'호텔 방면 회전'],
      [route.length - 1,'JW 발레 승하차점']]);
    let distance = 0, support = 0;
    const samples = [];
    for (let i = 0; i < route.length; i++) {
      const [x0,z0] = route[Math.max(0, i-1)], [x1,z1] = route[i];
      const length = Math.hypot(x1-x0,z1-z0);
      const steps = Math.max(1,Math.ceil(length/.25));
      for (let j = 1; j <= steps; j++) {
        const x = x0 + (x1-x0)*j/steps, z = z0 + (z1-z0)*j/steps;
        // Follow the surface reachable from the previous point, including
        // underpasses. A ray from the sky would select roofs over the aisle.
        const next = phys.support(x,z,support+.5).y;
        if (!Number.isFinite(next) || Math.abs(support-next) > .5) throw new Error('Discontinuous surface at '+[x,z]);
        support = next;
        const foundation = relief(x,z), terrain = surveyElevation(x,z);
        samples.push([distance + length*j/steps,x,z,terrain,foundation+next,foundation,next,foundation+next+terminalSurveyHeight].map(n=>n.toFixed(4))
          .concat(j===steps ? labels.get(i) || '' : ''));
      }
      distance += length;
    }
    return samples;
  });
  if (renderErrors.length) throw new Error(renderErrors.join('\n'));
  console.log('distance_m,x_m,z_m,terrain_y_m,surface_y_m,authored_zero_y_m,local_support_m,surface_elevation_m,station');
  console.log(rows.map(row=>row.join(',')).join('\n'));
} finally {
  await browser.close();
}
