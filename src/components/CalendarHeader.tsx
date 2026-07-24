import { format } from 'date-fns';
import type { CalendarView } from '../types/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onAddEvent: () => void;
}

const VIEW_LABELS: Record<CalendarView, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
};

function headingLabel(currentDate: Date, view: CalendarView): string {
  return view === 'day' ? format(currentDate, 'EEEE d MMMM yyyy') : format(currentDate, 'MMMM yyyy');
}

export function CalendarHeader({ currentDate, view, onViewChange, onToday, onPrev, onNext, onAddEvent }: CalendarHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <button
          onClick={onToday}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ›
          </button>
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{headingLabel(currentDate, view)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-slate-300 dark:border-slate-700">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((key) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={`px-3 py-1.5 text-sm font-medium first:rounded-l-md last:rounded-r-md ${
                view === key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {VIEW_LABELS[key]}
            </button>
          ))}
        </div>
        <button
          onClick={onAddEvent}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          + Add event
        </button>
      </div>
    </header>
  );
}
