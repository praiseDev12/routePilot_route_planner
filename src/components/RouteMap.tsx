import L from 'leaflet';
import { CircleDot, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import type { LngLat, RouteData } from '../types/route';
import { lngLatToLatLng, latLngToLngLat } from '../utils/coordinates';

// ─── Custom SVG markers ───────────────────────────────────────────────────────

function svgMarker(fill: string, ring: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <filter id="s" x="-30%" y="-10%" width="160%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
      <path filter="url(#s)"
        d="M14 2C7.373 2 2 7.373 2 14c0 8.5 12 20 12 20S26 22.5 26 14C26 7.373 20.627 2 14 2z"
        fill="${fill}" stroke="${ring}" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="${ring}"/>
    </svg>
  `.trim();

  return new L.DivIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

const currentIcon = svgMarker('#111111', '#C9A84C'); // black pin, gold ring
const pickupIcon = svgMarker('#C9A84C', '#111111'); // gold pin, black ring
const dropoffIcon = svgMarker('#ffffff', '#111111'); // white pin, black ring + border

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RouteMapProps {
  currentLocation?: LngLat;
  pickupLocation?: LngLat;
  dropoffLocation?: LngLat;
  route?: RouteData;
  clickMode: 'pickup' | 'dropoff';
  onMapSelect: (mode: 'pickup' | 'dropoff', location: LngLat) => void;
}

function MapClickHandler({
  clickMode,
  onMapSelect,
}: {
  clickMode: 'pickup' | 'dropoff';
  onMapSelect: RouteMapProps['onMapSelect'];
}) {
  useMapEvents({
    click(event) {
      onMapSelect(
        clickMode,
        latLngToLngLat([event.latlng.lat, event.latlng.lng]),
      );
    },
  });
  return null;
}

function FitRoute({
  route,
  locations,
}: {
  route?: RouteData;
  locations: LngLat[];
}) {
  const map = useMap();

  useEffect(() => {
    if (route?.polyline.length) {
      map.fitBounds(route.polyline, { padding: [48, 48] });
      return;
    }
    if (locations.length) {
      map.fitBounds(locations.map(lngLatToLatLng), {
        padding: [48, 48],
        maxZoom: 14,
      });
    }
  }, [locations, map, route]);

  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RouteMap({
  currentLocation,
  pickupLocation,
  dropoffLocation,
  route,
  clickMode,
  onMapSelect,
}: RouteMapProps) {
  const defaultCenter: LatLngExpression = currentLocation
    ? lngLatToLatLng(currentLocation)
    : [40.7128, -74.006];

  const knownLocations = [
    currentLocation,
    pickupLocation,
    dropoffLocation,
  ].filter(Boolean) as LngLat[];

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        minHeight: 520,
        overflow: 'hidden',
        borderRadius: 10,
        background: '#f7f7f5',
      }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        {/* Muted map tiles — CartoDB Positron for a clean, desaturated look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />

        <MapClickHandler clickMode={clickMode} onMapSelect={onMapSelect} />
        <FitRoute route={route} locations={knownLocations} />

        {currentLocation && (
          <Marker icon={currentIcon} position={lngLatToLatLng(currentLocation)}>
            <Popup>
              <strong style={{ color: '#111' }}>Current location</strong>
            </Popup>
          </Marker>
        )}

        {pickupLocation && (
          <Marker icon={pickupIcon} position={lngLatToLatLng(pickupLocation)}>
            <Popup>
              <strong style={{ color: '#C9A84C' }}>Pickup</strong>
            </Popup>
          </Marker>
        )}

        {dropoffLocation && (
          <Marker icon={dropoffIcon} position={lngLatToLatLng(dropoffLocation)}>
            <Popup>
              <strong style={{ color: '#111' }}>Dropoff</strong>
            </Popup>
          </Marker>
        )}

        {route?.polyline.length ? (
          <>
            {/* Shadow stroke underneath for depth */}
            <Polyline
              positions={route.polyline}
              pathOptions={{ color: '#000', weight: 10, opacity: 0.15 }}
            />
            {/* Gold route line */}
            <Polyline
              positions={route.polyline}
              pathOptions={{ color: '#C9A84C', weight: 5, opacity: 1 }}
            />
          </>
        ) : null}
      </MapContainer>

      {/* Click-mode badge */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          background: '#111',
          border: '1px solid #333',
          borderLeft: '3px solid #C9A84C',
          borderRadius: 8,
          padding: '7px 12px',
          fontSize: 12,
          fontWeight: 700,
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          pointerEvents: 'none',
        }}
      >
        {clickMode === 'pickup' ? (
          <CircleDot size={14} style={{ color: '#C9A84C' }} />
        ) : (
          <MapPin size={14} style={{ color: '#C9A84C' }} />
        )}
        <span>
          Click to set <span style={{ color: '#C9A84C' }}>{clickMode}</span>
        </span>
      </div>

      {/* Marker legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 400,
          background: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {[
          { color: '#111', ring: '#C9A84C', label: 'Current' },
          { color: '#C9A84C', ring: '#111', label: 'Pickup' },
          { color: '#fff', ring: '#111', label: 'Dropoff' },
        ].map(({ color, ring, label }) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <svg width='12' height='12' viewBox='0 0 12 12'>
              <circle
                cx='6'
                cy='6'
                r='5'
                fill={color}
                stroke={ring}
                strokeWidth='1.5'
              />
            </svg>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#aaa' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
