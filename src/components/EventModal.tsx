import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarEventInput, RecurrenceRule } from '../types/calendar';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { getBaseEventId } from '../utils/recurrence';

interface EventModalProps {
  event: CalendarEvent | null;
  initialDate: Date | null;
  onClose: () => void;
  onSave: (id: string | null, input: CalendarEventInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const inputClasses =
  'rounded-md border border-slate-300 px-2 py-1.5 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function toDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function EventModal({ event, initialDate, onClose, onSave, onDelete }: EventModalProps) {
  const isEditing = Boolean(event);
  const startBasis = event ? new Date(event.start_time) : (initialDate ?? new Date());
  const endBasis = event ? new Date(event.end_time) : (initialDate ?? new Date());

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [startInput, setStartInput] = useState(
    event?.all_day ? toDateOnly(startBasis) : toDateTimeLocal(startBasis),
  );
  const [endInput, setEndInput] = useState(event?.all_day ? toDateOnly(endBasis) : toDateTimeLocal(endBasis));
  const [location, setLocation] = useState(event?.location ?? '');
  const [category, setCategory] = useState(event?.category ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>((event?.recurrence_rule as RecurrenceRule) ?? 'none');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartInput((prev) => (allDay ? prev.slice(0, 10) : `${prev.slice(0, 10)}T09:00`));
    setEndInput((prev) => (allDay ? prev.slice(0, 10) : `${prev.slice(0, 10)}T10:00`));
    // Only re-run when the all-day toggle itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDay]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    const start = allDay ? new Date(`${startInput}T00:00:00`) : new Date(startInput);
    const end = allDay ? new Date(`${endInput}T23:59:59`) : new Date(endInput);

    if (end < start) {
      setError('End must be after start.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(event ? getBaseEventId(event.id) : null, {
        title: title.trim(),
        description: description.trim() || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        all_day: allDay,
        location: location.trim() || null,
        category: category || null,
        recurrence_rule: recurrence === 'none' ? null : recurrence,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setSaving(true);
    try {
      await onDelete(getBaseEventId(event.id));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-xl bg-white p-4 shadow-xl sm:rounded-xl dark:bg-slate-900"
      >
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Edit event' : 'New event'}
        </h2>

        {event?.recurrence_rule && (
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            This is a recurring event — changes apply to the whole series.
          </p>
        )}

        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClasses} />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={inputClasses}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            All-day
          </label>

          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
              Start
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                required
                className={inputClasses}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
              End
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                required
                className={inputClasses}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
            Location
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClasses} />
          </label>

          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                <option value="">None</option>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
              Repeats
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}
                className={inputClasses}
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
