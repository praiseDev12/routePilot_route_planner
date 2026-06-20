import { useEffect, useState } from "react";
import type { LngLat } from "../types/route";

interface GeolocationState {
  location?: LngLat;
  loading: boolean;
  error?: string;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation is not available in this browser." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          location: [position.coords.longitude, position.coords.latitude]
        });
      },
      (error) => {
        setState({
          loading: false,
          error: error.message || "Unable to retrieve current location."
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000
      }
    );
  }, []);

  return state;
}
