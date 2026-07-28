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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card max-h-[90vh] w-full max-w-md overflow-y-auto rounded-b-none sm:rounded-b-[var(--radius)]"
      >
        <h2 className="mb-3 text-lg text-[var(--text)]">{format(date, 'EEEE d MMMM yyyy')}</h2>

        <div className="stack" style={{ gap: '0.375rem' }}>
          {events.map((event) => {
            const visual = getEventVisual(event);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick(event)}
                style={visual.style}
                className={`w-full rounded px-2 py-1.5 text-left text-sm ${visual.className}`}
              >
                {shouldShowTimePrefix(event) && (
                  <span className="mr-1 font-semibold">{format(new Date(event.start_time), 'HH:mm')}</span>
                )}
                {event.title}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end gap-2">
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
