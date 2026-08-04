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
    <header className="calendar-header">
      <div className="calendar-header-left">
        <KSPLogo className="calendar-logo-desktop" />
        <button onClick={onToday} className="btn small">
          Today
        </button>
        <div className="calendar-nav-arrows">
          <button onClick={onPrev} aria-label="Previous" className="nav-arrow-btn">
            ‹
          </button>
          <button onClick={onNext} aria-label="Next" className="nav-arrow-btn">
            ›
          </button>
        </div>
        <h1 className="calendar-heading">{headingLabel(currentDate, view)}</h1>
      </div>

      <div className="calendar-header-right">
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
