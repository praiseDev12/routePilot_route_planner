import type { LngLat, PlaceResult, RoutePlanResponse } from "../types/route";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const NOMINATIM_BASE_URL =
  import.meta.env.VITE_NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Login failed. Check your email and password.");
  }

  return response.json() as Promise<{ token: string; user: { email: string; name: string } }>;
}

export async function geocodeAddress(query: string): Promise<PlaceResult[]> {
  const url = new URL("/search", NOMINATIM_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to search for that address.");
  }

  const results = (await response.json()) as Array<{
    display_name: string;
    lon: string;
    lat: string;
  }>;

  return results.map((result) => ({
    label: result.display_name,
    coordinates: [Number(result.lon), Number(result.lat)]
  }));
}

export async function requestRoute(payload: {
  current_location: LngLat;
  pickup_location: LngLat;
  dropoff_location: LngLat;
  current_cycle_used: number;
}): Promise<RoutePlanResponse> {
  const response = await fetch(`${API_BASE_URL}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to generate route.");
  }

  return data as RoutePlanResponse;
}
