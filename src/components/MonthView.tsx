import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { expandEventsForRange } from '../utils/recurrence';
import { getEventVisual, shouldShowTimePrefix } from '../utils/eventVisual';

interface MonthViewProps {
  currentDate: Date;
  events: DisplayEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: DisplayEvent) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE_EVENTS = 3;

export function MonthView({ currentDate, events, onDayClick, onEventClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const expandedEvents = expandEventsForRange(events, gridStart, gridEnd);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-[var(--border)] text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = expandedEvents
            .filter((event) => isSameDay(new Date(event.start_time), day))
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
          const inMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => e.key === 'Enter' && onDayClick(day)}
              className={`flex min-h-[90px] flex-col items-stretch border-b border-r border-[var(--border)] p-1 text-left last:border-r-0 ${
                inMonth ? 'bg-[var(--surface)]' : 'bg-[var(--bg)] text-[var(--muted)]'
              }`}
            >
              <span
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  isToday(day) ? 'bg-[var(--primary)] text-white' : ''
                }`}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => {
                  const visual = getEventVisual(event);
                  return (
                    <span
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      style={visual.style}
                      className={`truncate rounded px-1 py-0.5 text-[11px] ${visual.className}`}
                    >
                      {shouldShowTimePrefix(event) ? `${format(new Date(event.start_time), 'HH:mm')} ` : ''}
                      {event.title}
                    </span>
                  );
                })}
                {dayEvents.length > MAX_VISIBLE_EVENTS && (
                  <span className="text-[11px] text-[var(--muted)]">
                    +{dayEvents.length - MAX_VISIBLE_EVENTS} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
