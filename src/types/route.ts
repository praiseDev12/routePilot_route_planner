export type LngLat = [number, number];
export type LatLng = [number, number];

export interface PlaceResult {
  label: string;
  coordinates: LngLat;
}

export interface RouteWaypoint {
  name: string;
  location: LngLat;
  lat_lng: LatLng;
}

export interface RouteLeg {
  distance_km: number;
  duration_minutes: number;
  summary: string;
}

export interface RouteData {
  geometry: {
    type: "LineString";
    coordinates: LngLat[];
  };
  polyline: LatLng[];
  distance_km: number;
  distance_miles: number;
  duration_minutes: number;
  waypoints: RouteWaypoint[];
  legs: RouteLeg[];
}

export interface FuelStop {
  mile_marker: number;
  location: LngLat | null;
  start_time: string;
  duration_hours: number;
  note: string;
}

export interface RestStop {
  type: "break" | "daily_reset";
  start_time: string;
  end_time: string;
  duration_hours: number;
  note: string;
}

export type EldStatus = "DRIVING" | "OFF_DUTY" | "ON_DUTY_NOT_DRIVING" | "SLEEPER_BERTH";

export interface EldEvent {
  status: EldStatus;
  start_time: string;
  end_time: string;
  duration_hours: number;
  note: string;
}

export interface DailyLog {
  day: number;
  date: string;
  totals: Record<EldStatus, number>;
}

export interface HosSummary {
  assumptions: {
    driver_type: string;
    cycle_rule: string;
    adverse_driving_conditions: boolean;
    fuel_interval_miles: number;
    pickup_loading_hours: number;
    dropoff_unloading_hours: number;
  };
  current_cycle_used: number;
  remaining_cycle_hours: number;
  cycle_limit_hours: number;
  total_driving_hours: number;
  total_on_duty_hours: number;
  total_off_duty_hours: number;
  total_sleeper_berth_hours: number;
  fuel_stop_count: number;
  rest_stop_count: number;
}

export interface RoutePlanResponse {
  summary: HosSummary;
  route: RouteData;
  fuel_stops: FuelStop[];
  rest_stops: RestStop[];
  eld_events: EldEvent[];
  daily_logs: DailyLog[];
}
