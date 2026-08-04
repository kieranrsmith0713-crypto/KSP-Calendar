import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { expandEventsForRange } from '../utils/recurrence';
import { getEventVisual, shouldShowTimePrefix } from '../utils/eventVisual';

interface MonthViewProps {
  currentDate: Date;
  events: DisplayEvent[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: DisplayEvent) => void;
  onShowMore: (date: Date, dayEvents: DisplayEvent[]) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE_EVENTS = 3;

export function MonthView({ currentDate, events, onDayClick, onEventClick, onShowMore }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const expandedEvents = expandEventsForRange(events, gridStart, gridEnd);

  return (
    <div className="month-view">
      <div className="month-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="month-weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="month-grid">
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
              className={`month-cell ${inMonth ? '' : 'out-of-month'}`}
            >
              <span className={`month-cell-daynum ${isToday(day) ? 'is-today' : ''}`}>
                {format(day, 'd')}
              </span>
              <div className="month-cell-events">
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
                      className={`event-pill ${visual.className}`}
                    >
                      {shouldShowTimePrefix(event) ? `${format(new Date(event.start_time), 'HH:mm')} ` : ''}
                      {event.title}
                    </span>
                  );
                })}
                {dayEvents.length > MAX_VISIBLE_EVENTS && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowMore(day, dayEvents);
                    }}
                    className="month-show-more"
                  >
                    +{dayEvents.length - MAX_VISIBLE_EVENTS} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
