import { format, isSameDay } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';
import { getCategoryColor } from '../utils/categories';

interface TimeGridProps {
  days: Date[];
  events: CalendarEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
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
      <div className="grid border-b border-slate-200 dark:border-slate-800" style={{ gridTemplateColumns: columns }}>
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="border-l border-slate-200 py-2 text-center dark:border-slate-800">
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{format(day, 'EEE')}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="grid border-b border-slate-200 dark:border-slate-800" style={{ gridTemplateColumns: columns }}>
          <div className="py-1 pr-1 text-right text-[10px] text-slate-400">All day</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="flex flex-col gap-0.5 border-l border-slate-200 p-1 dark:border-slate-800">
              {allDayEvents
                .filter((event) => isSameDay(new Date(event.start_time), day))
                .map((event) => {
                  const color = getCategoryColor(event.category);
                  return (
                    <span
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`truncate rounded border-l-2 px-1 py-0.5 text-[11px] ${color.bg} ${color.border} ${color.text}`}
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
                className="border-b border-slate-100 pr-1 text-right text-[10px] text-slate-400 dark:border-slate-800"
              >
                {hour === 0 ? '' : format(new Date(2000, 0, 1, hour), 'ha')}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="relative border-l border-slate-200 dark:border-slate-800">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="border-b border-slate-100 dark:border-slate-800"
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
                  const color = getCategoryColor(event.category);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={{ top, height }}
                      className={`absolute left-0.5 right-0.5 overflow-hidden rounded border-l-2 px-1 text-[11px] ${color.bg} ${color.border} ${color.text}`}
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
