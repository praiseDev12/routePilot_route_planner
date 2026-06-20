import { useMemo } from 'react';
import {
  BadgeCheck,
  Bed,
  Clock3,
  Fuel,
  PauseCircle,
  TimerReset,
} from 'lucide-react';
import type {
  DailyLog,
  EldEvent,
  FuelStop,
  HosSummary,
  RestStop,
} from '../types/route';

// ─── ELD Graph ────────────────────────────────────────────────────────────────

const STATUS_ROWS: { key: string; label: string }[] = [
  { key: 'OFF_DUTY', label: 'Off Duty' },
  { key: 'SLEEPER_BERTH', label: 'Sleeper' },
  { key: 'DRIVING', label: 'Driving' },
  { key: 'ON_DUTY_NOT_DRIVING', label: 'On Duty' },
];

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  OFF_DUTY: { bg: '#e5e5e5', border: '#bbb' },
  SLEEPER_BERTH: { bg: '#dbeafe', border: '#93c5fd' },
  DRIVING: { bg: '#C9A84C', border: '#a8872e' },
  ON_DUTY_NOT_DRIVING: { bg: '#111', border: '#444' },
};

const HOUR_TICKS = Array.from({ length: 25 }, (_, i) => i);

function toMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function pct(minutes: number): string {
  return `${((minutes / 1440) * 100).toFixed(4)}%`;
}

function clipToDay(events: EldEvent[], dateStr: string): EldEvent[] {
  const dayStart = new Date(`${dateStr}T00:00:00`).getTime();
  const dayEnd = new Date(`${dateStr}T23:59:59`).getTime();
  return events.flatMap((ev) => {
    const s = new Date(ev.start_time).getTime();
    const e = new Date(ev.end_time).getTime();
    if (s > dayEnd || e < dayStart) return [];
    return [
      {
        ...ev,
        start_time: new Date(Math.max(s, dayStart)).toISOString(),
        end_time: new Date(Math.min(e, dayEnd)).toISOString(),
      },
    ];
  });
}

function DayGraph({ log, events }: { log: DailyLog; events: EldEvent[] }) {
  const dayEvents = useMemo(
    () => clipToDay(events, log.date),
    [events, log.date],
  );

  return (
    <div>
      {/* Day header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>
            {log.day}
          </span>
          <span style={{ fontSize: 11, color: '#888' }}>{log.date}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 11,
            color: '#888',
          }}
        >
          {[
            { label: 'D', value: log.totals.DRIVING, color: '#C9A84C' },
            {
              label: 'ON',
              value: log.totals.ON_DUTY_NOT_DRIVING,
              color: '#111',
            },
            { label: 'SB', value: log.totals.SLEEPER_BERTH, color: '#3b82f6' },
            { label: 'OFF', value: log.totals.OFF_DUTY, color: '#aaa' },
          ].map(({ label, value, color }) => (
            <span key={label}>
              <span style={{ color, fontWeight: 700 }}>{label}</span>{' '}
              <strong style={{ color: '#111' }}>
                {(value ?? 0).toFixed(1)} h
              </strong>
            </span>
          ))}
        </div>
      </div>

      {/* Top hour labels */}
      <div style={{ display: 'flex', paddingLeft: '4.5rem' }}>
        {HOUR_TICKS.map((h) => (
          <div
            key={h}
            style={{
              flexShrink: 0,
              width: `${100 / 24}%`,
              textAlign: 'center',
              fontSize: 9,
              color: '#aaa',
              lineHeight: 1,
            }}
          >
            {h === 0
              ? 'M'
              : h === 12
                ? 'N'
                : h === 24
                  ? 'M'
                  : h % 6 === 0
                    ? h
                    : ''}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div style={{ marginTop: 2 }}>
        {STATUS_ROWS.map(({ key, label }) => {
          const colors = STATUS_COLORS[key];
          const rowEvents = dayEvents.filter((ev) => ev.status === key);
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                height: 28,
                marginBottom: 1,
              }}
            >
              {/* Label */}
              <div
                style={{
                  width: '4.5rem',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#999',
                  }}
                >
                  {label}
                </span>
              </div>
              {/* Track */}
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  background: '#f7f7f5',
                  border: '1px solid #e5e5e5',
                }}
              >
                {/* Hour grid lines */}
                {HOUR_TICKS.slice(1).map((h) => (
                  <div
                    key={h}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: pct(h * 60),
                      borderLeft: `1px solid ${h % 6 === 0 ? '#ccc' : '#ebebeb'}`,
                    }}
                  />
                ))}
                {/* Status blocks */}
                {rowEvents.map((ev, i) => {
                  const startMin = toMinutes(ev.start_time);
                  const endMin = toMinutes(ev.end_time);
                  const width = endMin - startMin;
                  if (width <= 0) return null;
                  return (
                    <div
                      key={i}
                      title={ev.note ?? label}
                      style={{
                        position: 'absolute',
                        top: 2,
                        bottom: 2,
                        left: pct(startMin),
                        width: pct(width),
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 3,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom hour labels */}
      <div
        style={{
          display: 'flex',
          paddingLeft: '4.5rem',
          marginTop: 2,
          borderTop: '1px solid #e5e5e5',
          paddingTop: 2,
        }}
      >
        {HOUR_TICKS.map((h) => (
          <div
            key={h}
            style={{
              flexShrink: 0,
              width: `${100 / 24}%`,
              textAlign: 'center',
              fontSize: 9,
              color: '#aaa',
              lineHeight: 1,
            }}
          >
            {h === 0
              ? 'M'
              : h === 12
                ? 'N'
                : h === 24
                  ? 'M'
                  : h % 6 === 0
                    ? h
                    : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function hours(value?: number) {
  return typeof value === 'number'
    ? `${value.toFixed(value % 1 === 0 ? 0 : 2)} h`
    : '--';
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e5e5',
        borderRadius: 10,
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#C9A84C',
        marginBottom: 2,
      }}
    >
      {children}
    </p>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        background: '#f7f7f5',
        border: '1px dashed #ddd',
        borderRadius: 8,
        padding: '14px 16px',
        fontSize: 13,
        color: '#999',
      }}
    >
      {message}
    </div>
  );
}

// ─── HOS Card ─────────────────────────────────────────────────────────────────

function HosCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 8,
          background: '#111',
          color: '#C9A84C',
          marginBottom: 12,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#999',
        }}
      >
        {label}
      </p>
      <p style={{ marginTop: 4, fontSize: 22, fontWeight: 800, color: '#111' }}>
        {value}
      </p>
    </Card>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: '8px 0',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#999',
  borderBottom: '1px solid #e5e5e5',
};

const tdStyle: React.CSSProperties = {
  padding: '9px 0',
  fontSize: 13,
  color: '#555',
  borderBottom: '1px solid #f0f0f0',
};

const tdBoldStyle: React.CSSProperties = {
  ...tdStyle,
  fontWeight: 700,
  color: '#111',
};

// ─── Main export ──────────────────────────────────────────────────────────────

export function EldSection({
  summary,
  eldEvents,
  dailyLogs,
  fuelStops,
  restStops,
}: {
  summary?: HosSummary;
  eldEvents: EldEvent[];
  dailyLogs: DailyLog[];
  fuelStops: FuelStop[];
  restStops: RestStop[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HOS Summary */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div>
            <SectionLabel>HOS Summary</SectionLabel>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>
              ELD compliance overview
            </h2>
          </div>
          {summary && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#888',
                background: '#f0f0f0',
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              {summary.assumptions.cycle_rule}
            </span>
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          }}
        >
          <HosCard
            icon={<TimerReset size={17} />}
            label='Cycle used'
            value={hours(summary?.current_cycle_used)}
          />
          <HosCard
            icon={<BadgeCheck size={17} />}
            label='Remaining'
            value={hours(summary?.remaining_cycle_hours)}
          />
          <HosCard
            icon={<Clock3 size={17} />}
            label='Driving'
            value={hours(summary?.total_driving_hours)}
          />
          <HosCard
            icon={<PauseCircle size={17} />}
            label='On duty'
            value={hours(summary?.total_on_duty_hours)}
          />
          <HosCard
            icon={<Bed size={17} />}
            label='Off duty'
            value={hours(summary?.total_off_duty_hours)}
          />
        </div>
      </section>

      {/* ELD Graph */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <SectionLabel>Log Graph</SectionLabel>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>
              Daily log graph
            </h3>
          </div>
          {/* Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
            }}
          >
            {STATUS_ROWS.map(({ key, label }) => {
              const c = STATUS_COLORS[key];
              return (
                <div
                  key={key}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 10,
                      borderRadius: 2,
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
        {dailyLogs.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {dailyLogs.map((log) => (
              <DayGraph
                key={`${log.day}-${log.date}`}
                log={log}
                events={eldEvents}
              />
            ))}
          </div>
        ) : (
          <EmptyState message='Generate a route to view the daily log graph.' />
        )}
      </Card>

      {/* Fuel & Rest stops */}
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {/* Fuel stops */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Fuel size={16} style={{ color: '#C9A84C' }} />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>
              Fuel stops
            </h3>
          </div>
          {fuelStops.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  minWidth: 440,
                  textAlign: 'left',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Mile</th>
                    <th style={thStyle}>Start time</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelStops.map((stop) => (
                    <tr key={`${stop.mile_marker}-${stop.start_time}`}>
                      <td style={tdBoldStyle}>{stop.mile_marker}</td>
                      <td style={tdStyle}>{formatDateTime(stop.start_time)}</td>
                      <td style={tdStyle}>{hours(stop.duration_hours)}</td>
                      <td style={tdStyle}>{stop.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message='No fuel stop required before the 1,000 mile interval.' />
          )}
        </Card>

        {/* Rest stops */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <PauseCircle size={16} style={{ color: '#C9A84C' }} />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>
              Rest stops
            </h3>
          </div>
          {restStops.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  minWidth: 440,
                  textAlign: 'left',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Start time</th>
                    <th style={thStyle}>Duration</th>
                    <th style={thStyle}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {restStops.map((stop) => (
                    <tr key={`${stop.type}-${stop.start_time}`}>
                      <td
                        style={{ ...tdBoldStyle, textTransform: 'capitalize' }}
                      >
                        {stop.type.replace('_', ' ')}
                      </td>
                      <td style={tdStyle}>{formatDateTime(stop.start_time)}</td>
                      <td style={tdStyle}>{hours(stop.duration_hours)}</td>
                      <td style={tdStyle}>{stop.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message='No rest stop required for the generated route.' />
          )}
        </Card>
      </div>

      {/* ELD Events */}
      <Card>
        <SectionLabel>Events</SectionLabel>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#111',
            marginBottom: 12,
          }}
        >
          ELD events
        </h3>
        {eldEvents.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: 680,
                textAlign: 'left',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Start time</th>
                  <th style={thStyle}>End time</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {eldEvents.map((event) => (
                  <tr key={`${event.status}-${event.start_time}-${event.note}`}>
                    <td style={tdBoldStyle}>
                      {event.status.split('_').join(' ')}
                    </td>
                    <td style={tdStyle}>{formatDateTime(event.start_time)}</td>
                    <td style={tdStyle}>{formatDateTime(event.end_time)}</td>
                    <td style={tdStyle}>{hours(event.duration_hours)}</td>
                    <td style={tdStyle}>{event.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message='Generate a route to create ELD events.' />
        )}
      </Card>

      {/* Daily Logs */}
      <Card>
        <SectionLabel>Logs</SectionLabel>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#111',
            marginBottom: 12,
          }}
        >
          Daily logs
        </h3>
        {dailyLogs.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: 640,
                textAlign: 'left',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={thStyle}>Day</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Driving</th>
                  <th style={thStyle}>Off duty</th>
                  <th style={thStyle}>On duty</th>
                  <th style={thStyle}>Sleeper berth</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.map((log) => (
                  <tr key={`${log.day}-${log.date}`}>
                    <td style={tdBoldStyle}>{log.day}</td>
                    <td style={tdStyle}>{log.date}</td>
                    <td
                      style={{ ...tdStyle, color: '#C9A84C', fontWeight: 700 }}
                    >
                      {hours(log.totals.DRIVING)}
                    </td>
                    <td style={tdStyle}>{hours(log.totals.OFF_DUTY)}</td>
                    <td style={tdStyle}>
                      {hours(log.totals.ON_DUTY_NOT_DRIVING)}
                    </td>
                    <td style={tdStyle}>{hours(log.totals.SLEEPER_BERTH)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message='Generate a route to create daily log summaries.' />
        )}
      </Card>
    </div>
  );
}
