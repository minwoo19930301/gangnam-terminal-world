// Offline builders and map audits consume the entire city synchronously.
import { buildCityWithCover } from './city-scene.js';
import { parcelCover } from './parcel_cover.js';

export { createTraffic } from './city-scene.js';
export function buildCity(K, osm, options) {
  return buildCityWithCover(K, osm, parcelCover, options);
}
