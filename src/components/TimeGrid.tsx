import { format, isSameDay } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { getEventVisual } from '../utils/eventVisual';

interface TimeGridProps {
  days: Date[];
  events: DisplayEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (event: DisplayEvent) => void;
}

const HOUR_HEIGHT = 48;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function minutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function TimeGrid({ days, events, onSlotClick, onEventClick }: TimeGridProps) {
  const allDayEvents = events.filter((event) => event.all_day);
  const timedEvents = events.filter((event) => !event.all_day);
  const columns = `56px repeat(${days.length}, 1fr)`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grid border-b border-[var(--border)]" style={{ gridTemplateColumns: columns }}>
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="border-l border-[var(--border)] py-2 text-center">
            <div className="text-xs uppercase text-[var(--muted)]">{format(day, 'EEE')}</div>
            <div className="text-sm font-bold text-[var(--text)]">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="grid border-b border-[var(--border)]" style={{ gridTemplateColumns: columns }}>
          <div className="py-1 pr-1 text-right text-[10px] text-[var(--muted)]">All day</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="flex flex-col gap-0.5 border-l border-[var(--border)] p-1">
              {allDayEvents
                .filter((event) => isSameDay(new Date(event.start_time), day))
                .map((event) => {
                  const visual = getEventVisual(event);
                  return (
                    <span
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      style={visual.style}
                      className={`truncate rounded px-1 py-0.5 text-[11px] ${visual.className}`}
                    >
                      {event.title}
                    </span>
                  );
                })}
            </div>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: columns }}>
          <div>
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-[var(--border)] pr-1 text-right text-[10px] text-[var(--muted)]"
              >
                {hour === 0 ? '' : format(new Date(2000, 0, 1, hour), 'ha')}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="relative border-l border-[var(--border)]">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-[var(--border)]"
                  onClick={() => onSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))}
                />
              ))}
              {timedEvents
                .filter((event) => isSameDay(new Date(event.start_time), day))
                .map((event) => {
                  const start = new Date(event.start_time);
                  const end = new Date(event.end_time);
                  const top = (minutesFromMidnight(start) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((end.getTime() - start.getTime()) / 3_600_000) * HOUR_HEIGHT, 18);
                  const visual = getEventVisual(event);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={{ top, height, ...visual.style }}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded px-1 text-[11px] ${visual.className}`}
                    >
                      {format(start, 'HH:mm')} {event.title}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
