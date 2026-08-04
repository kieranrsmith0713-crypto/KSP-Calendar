import { useState } from 'react';
import type { FormEvent } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent, CalendarEventInput, DisplayEvent, RecurrenceRule } from '../types/calendar';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import { getBaseEventId } from '../utils/recurrence';

interface EventModalProps {
  event: DisplayEvent | null;
  initialDate: Date | null;
  draft?: CalendarEventInput | null;
  onClose: () => void;
  onSave: (id: string | null, input: CalendarEventInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function toDateTimeLocal(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function toDateOnly(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function EventModal({ event, initialDate, draft, onClose, onSave, onDelete }: EventModalProps) {
  if (event && event.source === 'external') {
    return <ImportedEventDetails event={event} onClose={onClose} />;
  }

  if (event && event.source === 'todo') {
    return <TodoDetails event={event} onClose={onClose} />;
  }

  return (
    <InternalEventForm
      event={event}
      initialDate={initialDate}
      draft={draft}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}

function ImportedEventDetails({ event, onClose }: { event: Extract<DisplayEvent, { source: 'external' }>; onClose: () => void }) {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card modal-panel">
        <div className="modal-source-row">
          <span className="event-color-dot" style={{ backgroundColor: event.calendarColor }} />
          <span className="modal-eyebrow">{event.calendarName}</span>
        </div>
        <h2 className="modal-title">{event.title}</h2>
        <p className="modal-line">
          {event.all_day
            ? format(start, 'EEEE d MMMM yyyy')
            : `${format(start, 'EEEE d MMMM yyyy, HH:mm')} – ${format(end, 'HH:mm')}`}
        </p>
        {event.location && <p className="modal-line">📍 {event.location}</p>}
        {event.description && <p className="modal-description muted">{event.description}</p>}
        <p className="hint muted">Imported — edit this in {event.calendarName} instead.</p>
        <div className="modal-actions">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const TODO_APP_URL = 'https://todo.ksponline.co.uk';
const PRIORITY_LABELS: Record<Extract<DisplayEvent, { source: 'todo' }>['priority'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function TodoDetails({ event, onClose }: { event: Extract<DisplayEvent, { source: 'todo' }>; onClose: () => void }) {
  const due = new Date(event.start_time);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card modal-panel">
        <span className="modal-eyebrow">
          {event.completed ? 'Completed task' : 'Task'} · KSP To-do
        </span>
        <h2
          className="modal-title"
          style={{ marginTop: '0.25rem', textDecoration: event.completed ? 'line-through' : 'none' }}
        >
          {event.title}
        </h2>
        <p className="modal-line">Due {format(due, 'EEEE d MMMM yyyy, HH:mm')}</p>
        <p className="modal-line">Priority: {PRIORITY_LABELS[event.priority]}</p>
        {event.category && <p className="modal-line">🏷️ {event.category}</p>}
        {event.recurrence && <p className="modal-line muted">Repeats {event.recurrence}</p>}
        {event.description && <p className="modal-description muted">{event.description}</p>}
        <p className="hint muted">Manage this task in KSP To-do.</p>
        <div className="modal-actions">
          <a href={TODO_APP_URL} target="_blank" rel="noreferrer" className="btn">
            Open To-do
          </a>
          <button onClick={onClose} className="btn primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface InternalEventFormProps {
  event: (CalendarEvent & { source?: 'internal' }) | null;
  initialDate: Date | null;
  draft?: CalendarEventInput | null;
  onClose: () => void;
  onSave: (id: string | null, input: CalendarEventInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function InternalEventForm({ event, initialDate, draft, onClose, onSave, onDelete }: InternalEventFormProps) {
  const isEditing = Boolean(event);
  const hasExplicitTime = Boolean(event || draft);
  const startBasis = event ? new Date(event.start_time) : new Date(draft?.start_time ?? initialDate ?? new Date());
  const endBasis = event ? new Date(event.end_time) : new Date(draft?.end_time ?? initialDate ?? new Date());
  const initialAllDay = event?.all_day ?? draft?.all_day ?? false;

  const [title, setTitle] = useState(event?.title ?? draft?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? draft?.description ?? '');
  const [allDay, setAllDay] = useState(initialAllDay);
  const [startInput, setStartInput] = useState(() => {
    if (initialAllDay) return toDateOnly(startBasis);
    return hasExplicitTime ? toDateTimeLocal(startBasis) : `${toDateOnly(startBasis)}T09:00`;
  });
  const [endInput, setEndInput] = useState(() => {
    if (initialAllDay) return toDateOnly(endBasis);
    return hasExplicitTime ? toDateTimeLocal(endBasis) : `${toDateOnly(endBasis)}T10:00`;
  });
  const [location, setLocation] = useState(event?.location ?? draft?.location ?? '');
  const [category, setCategory] = useState(event?.category ?? draft?.category ?? '');
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    (event?.recurrence_rule as RecurrenceRule) ?? (draft?.recurrence_rule as RecurrenceRule) ?? 'none',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resets the time-of-day to a sensible default on a genuine user toggle of all-day.
  // Lives in the handler (not an effect keyed on `allDay`) so it never fires on mount —
  // an effect would also double-fire under StrictMode's dev remount simulation, clobbering
  // a real event's time or a quick-add draft's parsed time either way.
  const handleAllDayToggle = (checked: boolean) => {
    setAllDay(checked);
    setStartInput((prev) => (checked ? prev.slice(0, 10) : `${prev.slice(0, 10)}T09:00`));
    setEndInput((prev) => (checked ? prev.slice(0, 10) : `${prev.slice(0, 10)}T10:00`));
  };

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
    <div className="modal-backdrop" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="card modal-panel">
        <h2 className="modal-title">{isEditing ? 'Edit event' : 'New event'}</h2>

        {!isEditing && draft && <p className="hint muted" style={{ marginBottom: '0.5rem' }}>Parsed from quick add — check the details below.</p>}

        {event?.recurrence_rule && (
          <p className="hint muted" style={{ marginBottom: '0.5rem' }}>This is a recurring event — changes apply to the whole series.</p>
        )}

        {error && <p className="alert error" style={{ marginBottom: '0.5rem' }}>{error}</p>}

        <div className="stack" style={{ gap: '0.75rem' }}>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </label>

          <label className="row align-center text-sm">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => handleAllDayToggle(e.target.checked)}
              style={{ width: 'auto' }}
            />
            All-day
          </label>

          <div className="row">
            <label className="field" style={{ flex: 1 }}>
              <span>Start</span>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                required
              />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>End</span>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="field">
            <span>Location</span>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>

          <div className="row">
            <label className="field" style={{ flex: 1 }}>
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">None</option>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Repeats</span>
              <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as RecurrenceRule)}>
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </label>
          </div>
        </div>

        <div className="modal-actions-split">
          <div>
            {isEditing && (
              <button type="button" onClick={handleDelete} disabled={saving} className="btn danger small">
                Delete
              </button>
            )}
          </div>
          <div className="row">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
