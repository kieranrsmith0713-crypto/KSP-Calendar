import { format } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { getEventVisual, shouldShowTimePrefix } from '../utils/eventVisual';

interface DayAgendaModalProps {
  date: Date;
  events: DisplayEvent[];
  onClose: () => void;
  onEventClick: (event: DisplayEvent) => void;
  onAddEvent: (date: Date) => void;
}

export function DayAgendaModal({ date, events, onClose, onEventClick, onAddEvent }: DayAgendaModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card modal-panel">
        <h2 className="modal-title">{format(date, 'EEEE d MMMM yyyy')}</h2>

        <div className="stack" style={{ gap: '0.375rem' }}>
          {events.map((event) => {
            const visual = getEventVisual(event);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick(event)}
                style={visual.style}
                className={`agenda-event-btn ${visual.className}`}
              >
                {shouldShowTimePrefix(event) && (
                  <span className="agenda-event-time">{format(new Date(event.start_time), 'HH:mm')}</span>
                )}
                {event.title}
              </button>
            );
          })}
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn">
            Close
          </button>
          <button type="button" onClick={() => onAddEvent(date)} className="btn primary">
            Add event
          </button>
        </div>
      </div>
    </div>
  );
}
