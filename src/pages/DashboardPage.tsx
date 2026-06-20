import { LogOut, LocateFixed, Loader2, RadioTower } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AddressSearch } from '../components/AddressSearch';
import { EldSection } from '../components/EldSection';
import { RouteMap } from '../components/RouteMap';
import { RouteSummary } from '../components/RouteSummary';
import { requestRoute } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useGeolocation } from '../hooks/useGeolocation';
import type { LngLat, PlaceResult, RoutePlanResponse } from '../types/route';
import { formatCoordinate } from '../utils/coordinates';
import { useNavigate } from 'react-router-dom';

function placeFromMap(label: string, coordinates: LngLat): PlaceResult {
  return { label, coordinates };
}

export function DashboardPage() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();
  const geolocation = useGeolocation();
  const [pickup, setPickup] = useState<PlaceResult>();
  const [dropoff, setDropoff] = useState<PlaceResult>();
  const [clickMode, setClickMode] = useState<'pickup' | 'dropoff'>('pickup');
  const [currentCycleUsed, setCurrentCycleUsed] = useState(0);
  const [routePlan, setRoutePlan] = useState<RoutePlanResponse>();
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState('');

  if (!session) {
    navigate('/login');
  }

  const canRoute = Boolean(
    geolocation.location && pickup?.coordinates && dropoff?.coordinates,
  );

  const statusText = useMemo(() => {
    if (geolocation.loading) return 'Detecting location…';
    if (geolocation.error) return 'Location needs attention';
    return 'Location ready';
  }, [geolocation.error, geolocation.loading]);

  async function handleGenerateRoute() {
    if (
      !geolocation.location ||
      !pickup?.coordinates ||
      !dropoff?.coordinates
    ) {
      setError('Current, pickup, and dropoff locations are required.');
      return;
    }
    setLoadingRoute(true);
    setError('');
    try {
      const nextRoute = await requestRoute({
        current_location: geolocation.location,
        pickup_location: pickup.coordinates,
        dropoff_location: dropoff.coordinates,
        current_cycle_used: currentCycleUsed,
      });
      setRoutePlan(nextRoute);
    } catch (routeError) {
      setError(
        routeError instanceof Error
          ? routeError.message
          : 'Route generation failed.',
      );
    } finally {
      setLoadingRoute(false);
    }
  }

  return (
    <main className='min-h-screen' style={{ background: '#f7f7f5' }}>
      {/* ── Header ── */}
      <header style={{ background: '#111', borderBottom: '2px solid #C9A84C' }}>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-5 py-4'>
          <div className='flex items-center gap-4'>
            {/* Gold accent bar */}
            <div
              style={{
                width: 4,
                height: 36,
                background: '#C9A84C',
                borderRadius: 2,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  color: '#C9A84C',
                  textTransform: 'uppercase',
                }}
              >
                Route Pilot
              </p>
              <h1
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                Dispatch Route Planner
              </h1>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            <div className='hidden text-right sm:block'>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {session?.user.name}
              </p>
              <p style={{ fontSize: 11, color: '#999' }}>
                {session?.user.email}
              </p>
            </div>
            <button
              type='button'
              onClick={logout}
              aria-label='Logout'
              title='Logout'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 38,
                width: 38,
                borderRadius: 8,
                border: '1px solid #333',
                background: 'transparent',
                color: '#999',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  '#C9A84C';
                (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  '#333';
                (e.currentTarget as HTMLButtonElement).style.color = '#999';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className='mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[340px_1fr]'>
        {/* ── Sidebar ── */}
        <aside
          className='space-y-4'
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Location status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: geolocation.error ? '#fff8f0' : '#111',
              border: `1px solid ${geolocation.error ? '#f5c6a0' : '#222'}`,
              borderLeft: `3px solid ${geolocation.error ? '#e07b39' : '#C9A84C'}`,
              borderRadius: 8,
              padding: '10px 12px',
            }}
          >
            <LocateFixed
              size={18}
              style={{
                marginTop: 1,
                flexShrink: 0,
                color: geolocation.error ? '#e07b39' : '#C9A84C',
              }}
            />
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: geolocation.error ? '#b45309' : '#fff',
                }}
              >
                {statusText}
              </p>
              <p
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: geolocation.error ? '#92400e' : '#888',
                }}
              >
                {geolocation.error || formatCoordinate(geolocation.location)}
              </p>
            </div>
          </div>

          {/* Map click target toggle */}
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#111',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Map click target
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: '#f3f3f3',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                padding: 3,
              }}
            >
              {(['pickup', 'dropoff'] as const).map((mode) => (
                <button
                  type='button'
                  key={mode}
                  onClick={() => setClickMode(mode)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    border: 'none',
                    cursor: 'pointer',
                    transition:
                      'background 0.15s, color 0.15s, box-shadow 0.15s',
                    background: clickMode === mode ? '#111' : 'transparent',
                    color: clickMode === mode ? '#C9A84C' : '#666',
                    boxShadow:
                      clickMode === mode ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Address inputs */}
          <AddressSearch
            label='Pickup address'
            placeholder='Search pickup'
            selected={pickup}
            onSelect={setPickup}
          />
          <AddressSearch
            label='Dropoff address'
            placeholder='Search dropoff'
            selected={dropoff}
            onSelect={setDropoff}
          />

          {/* Cycle hours */}
          <div className='space-y-1.5'>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#111',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Current cycle used
            </label>
            <input
              type='number'
              min={0}
              max={70}
              step={0.25}
              value={currentCycleUsed}
              onChange={(e) => setCurrentCycleUsed(Number(e.target.value))}
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                background: '#fff',
                padding: '8px 12px',
                fontSize: 14,
                color: '#111',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#C9A84C';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(201,168,76,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: 11, color: '#888' }}>
              70-hour / 8-day property-carrying cycle.
            </p>
          </div>

          {/* Coordinates display */}
          <div
            style={{
              background: '#f7f7f5',
              border: '1px solid #e5e5e5',
              borderRadius: 8,
              padding: '10px 12px',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#111',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Selected coordinates
            </p>
            <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
              <span style={{ color: '#C9A84C', fontWeight: 700 }}>Pickup</span>{' '}
              {formatCoordinate(pickup?.coordinates)}
            </p>
            <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>
              <span style={{ color: '#C9A84C', fontWeight: 700 }}>Dropoff</span>{' '}
              {formatCoordinate(dropoff?.coordinates)}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                background: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: '#b91c1c',
              }}
            >
              {error}
            </p>
          )}

          {/* Generate button */}
          <button
            type='button'
            onClick={() => void handleGenerateRoute()}
            disabled={!canRoute || loadingRoute}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: canRoute && !loadingRoute ? '#C9A84C' : '#e5e5e5',
              color: canRoute && !loadingRoute ? '#111' : '#aaa',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.02em',
              cursor: canRoute && !loadingRoute ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (canRoute && !loadingRoute) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  '#b8942e';
              }
            }}
            onMouseLeave={(e) => {
              if (canRoute && !loadingRoute) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  '#C9A84C';
              }
            }}
          >
            {loadingRoute ? (
              <Loader2 size={16} className='animate-spin' />
            ) : (
              <RadioTower size={16} />
            )}
            {loadingRoute ? 'Requesting route…' : 'Generate Route'}
          </button>
        </aside>

        {/* ── Map ── */}
        <section
          className='min-h-130'
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #111',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <RouteMap
            currentLocation={geolocation.location}
            pickupLocation={pickup?.coordinates}
            dropoffLocation={dropoff?.coordinates}
            route={routePlan?.route}
            clickMode={clickMode}
            onMapSelect={(mode, location) => {
              const label = `Map selected ${formatCoordinate(location)}`;
              if (mode === 'pickup') setPickup(placeFromMap(label, location));
              else setDropoff(placeFromMap(label, location));
            }}
          />
        </section>
      </div>

      {/* ── Route Summary ── */}
      <section className='mx-auto max-w-7xl px-5 pb-5'>
        <RouteSummary route={routePlan?.route} />
      </section>

      {/* ── ELD Section ── */}
      <section className='mx-auto max-w-7xl px-5 pb-10'>
        {/* Section heading */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ height: 1, flex: 1, background: '#e5e5e5' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: '#C9A84C',
                borderRadius: 2,
                transform: 'rotate(45deg)',
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.12em',
                color: '#888',
                textTransform: 'uppercase',
              }}
            >
              ELD &amp; Compliance
            </span>
            <div
              style={{
                width: 8,
                height: 8,
                background: '#C9A84C',
                borderRadius: 2,
                transform: 'rotate(45deg)',
              }}
            />
          </div>
          <div style={{ height: 1, flex: 1, background: '#e5e5e5' }} />
        </div>

        <EldSection
          summary={routePlan?.summary}
          eldEvents={routePlan?.eld_events || []}
          dailyLogs={routePlan?.daily_logs || []}
          fuelStops={routePlan?.fuel_stops || []}
          restStops={routePlan?.rest_stops || []}
        />
      </section>
    </main>
  );
}
