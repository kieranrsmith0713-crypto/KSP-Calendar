import { format } from 'date-fns';
import type { CalendarView } from '../types/calendar';
import { KSPLogo } from './KSPLogo';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onAddEvent: () => void;
  onManageCalendars: () => void;
}

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
};

function headingLabel(currentDate: Date, view: CalendarView): string {
  return view === 'day' ? format(currentDate, 'EEEE d MMMM yyyy') : format(currentDate, 'MMMM yyyy');
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onToday,
  onPrev,
  onNext,
  onAddEvent,
  onManageCalendars,
}: CalendarHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <KSPLogo className="hidden sm:inline-flex" />
        <button onClick={onToday} className="btn small">
          Today
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            ›
          </button>
        </div>
        <h1 className="text-lg font-extrabold text-[var(--text)]">{headingLabel(currentDate, view)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="row">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((key) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={`pill ${view === key ? 'active' : ''}`}
            >
              {VIEW_LABELS[key]}
            </button>
          ))}
        </div>
        <button onClick={onManageCalendars} className="btn small">
          Calendars
        </button>
        <button onClick={onAddEvent} className="btn primary small">
          + Add event
        </button>
      </div>
    </header>
  );
}
