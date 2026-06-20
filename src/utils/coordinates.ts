import type { LatLng, LngLat } from "../types/route";

export function latLngToLngLat([lat, lng]: LatLng): LngLat {
  return [lng, lat];
}

export function lngLatToLatLng([lng, lat]: LngLat): LatLng {
  return [lat, lng];
}

export function formatCoordinate(coordinate?: LngLat) {
  if (!coordinate) {
    return "Not set";
  }

  return `${coordinate[1].toFixed(5)}, ${coordinate[0].toFixed(5)}`;
}
