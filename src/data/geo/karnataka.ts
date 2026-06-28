import type { FeatureCollection } from "geojson";

/**
 * Karnataka district GeoJSON overlay.
 *
 * Drop a real district FeatureCollection here later (each feature's
 * `properties.name` must match a district name in db.ts) and the
 * HeatMapPanel will automatically render a choropleth instead of the
 * circle-heat fallback — no component changes required.
 */
export const karnatakaDistricts: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export const hasGeometry = karnatakaDistricts.features.length > 0;
