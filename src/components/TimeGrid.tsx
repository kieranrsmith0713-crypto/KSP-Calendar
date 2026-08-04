import { format, isSameDay } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { getEventVisual, shouldShowTimePrefix } from '../utils/eventVisual';

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
    <div className="time-grid">
      <div className="time-grid-row bordered" style={{ gridTemplateColumns: columns }}>
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="time-grid-daycell-header">
            <div className="time-grid-weekday">{format(day, 'EEE')}</div>
            <div className="time-grid-daynum">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {allDayEvents.length > 0 && (
        <div className="time-grid-row bordered" style={{ gridTemplateColumns: columns }}>
          <div className="time-grid-allday-label">All day</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="time-grid-allday-col">
              {allDayEvents
                .filter((event) => isSameDay(new Date(event.start_time), day))
                .map((event) => {
                  const visual = getEventVisual(event);
                  return (
                    <span
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      style={visual.style}
                      className={`event-pill ${visual.className}`}
                    >
                      {event.title}
                    </span>
                  );
                })}
            </div>
          ))}
        </div>
      )}

      <div className="time-grid-body">
        <div className="time-grid-row" style={{ gridTemplateColumns: columns }}>
          <div>
            {HOURS.map((hour) => (
              <div key={hour} style={{ height: HOUR_HEIGHT }} className="time-grid-hour-label">
                {hour === 0 ? '' : format(new Date(2000, 0, 1, hour), 'ha')}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toISOString()} className="time-grid-daycol">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="time-grid-hour-slot"
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
                      className={`time-event ${visual.className}`}
                    >
                      {shouldShowTimePrefix(event) ? `${format(start, 'HH:mm')} ` : ''}
                      {event.title}
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
