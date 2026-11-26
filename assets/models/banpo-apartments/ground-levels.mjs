// Match the public game facade at each mesh vertex, including multi-building sites.
import {readFileSync} from 'node:fs';
import {estateLevels, footprintLevel} from '../../../js/remodels.js';

const catalog = JSON.parse(readFileSync(new URL('../../../js/places/_re_models.json', import.meta.url))).models;
const osm = JSON.parse(readFileSync(new URL('../../../data/osm.json', import.meta.url)));
const buildings = new Map(osm.buildings.map(row => [row.id, row]));
const points = JSON.parse(readFileSync(0, 'utf8'));
const levels = {};
for (const [id, coordinates] of Object.entries(points)) {
  const row = catalog.find(model => model.id === id);
  const sites = row.claims.map(key => buildings.get(key)).filter(Boolean)
    .map(({poly}) => ({poly, level: footprintLevel(poly)}));
  const ground = estateLevels(sites);
  levels[id] = coordinates.map(([x, north]) => ground(row.x + x, row.z - north));
}
process.stdout.write(JSON.stringify(levels));
