import { Clock3, MapPinned, Navigation, Route } from 'lucide-react';
import type { RouteData } from '../types/route';

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-panel'>
      <div className='mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-primary'>
        {icon}
      </div>
      <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
        {label}
      </p>
      <p className='mt-1 text-2xl font-bold text-ink'>{value}</p>
    </div>
  );
}

export function RouteSummary({ route }: { route?: RouteData }) {
  return (
    <div className='grid gap-4 md:grid-cols-4'>
      <SummaryCard
        icon={<Route size={19} className='text-black' />}
        label='Distance'
        value={route ? `${route.distance_km} km` : '--'}
      />
      <SummaryCard
        icon={<Navigation size={19} className='text-black' />}
        label='Distance'
        value={route ? `${route.distance_miles} mi` : '--'}
      />
      <SummaryCard
        icon={<Clock3 size={19} className='text-black' />}
        label='Drive time'
        value={route ? `${route.duration_minutes} min` : '--'}
      />
      <SummaryCard
        icon={<MapPinned size={19} className='text-black' />}
        label='Waypoints'
        value={route ? String(route.waypoints.length) : '--'}
      />
    </div>
  );
}
