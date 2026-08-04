import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ExternalCalendar, ExternalCalendarInput } from '../types/externalCalendar';

interface ManageCalendarsModalProps {
  calendars: ExternalCalendar[];
  errors: Record<string, string>;
  onAdd: (input: ExternalCalendarInput) => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const DEFAULT_COLOR = '#60a5fa';

export function ManageCalendarsModal({ calendars, errors, onAdd, onToggle, onDelete, onClose }: ManageCalendarsModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      setFormError('Name and calendar URL are required.');
      return;
    }
    if (!/^https:\/\//i.test(url.trim())) {
      setFormError('The calendar URL must start with https://');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onAdd({ name: name.trim(), url: url.trim(), color, enabled: true });
      setName('');
      setUrl('');
      setColor(DEFAULT_COLOR);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add calendar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="card modal-panel">
        <div className="modal-header-row">
          <h2 className="modal-title no-margin">Imported calendars</h2>
          <button onClick={onClose} className="btn link small">
            Close
          </button>
        </div>

        <ul className="stack" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
          {calendars.map((cal) => (
            <li key={cal.id} className="calendar-list-item">
              <span className="calendar-swatch" style={{ backgroundColor: cal.color }} />
              <div className="calendar-list-item-main">
                <p className="calendar-list-item-name">{cal.name}</p>
                {errors[cal.id] && <p className="calendar-list-item-error">{errors[cal.id]}</p>}
              </div>
              <label className="calendar-toggle-label text-xs muted">
                <input
                  type="checkbox"
                  checked={cal.enabled}
                  onChange={(e) => onToggle(cal.id, e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Shown
              </label>
              <button onClick={() => onDelete(cal.id)} className="btn link small" style={{ color: 'var(--negative)' }}>
                Remove
              </button>
            </li>
          ))}
          {calendars.length === 0 && <li className="text-sm muted">No imported calendars yet.</li>}
        </ul>

        <form onSubmit={handleAdd} className="stack add-calendar-form" style={{ gap: '0.5rem' }}>
          <p className="add-calendar-heading">Add a calendar</p>
          <p className="hint muted" style={{ margin: 0 }}>
            Paste an iCal (.ics) feed URL — in Google Calendar this is under Settings → your calendar → "Secret
            address in iCal format". Outlook and Apple Calendar offer similar ICS links.
          </p>
          {formError && <p className="alert error">{formError}</p>}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Calendar name (e.g. Work – Google)" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
          />
          <div className="row align-center">
            <label className="text-xs muted">Color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <button type="submit" disabled={saving} className="btn primary ml-auto">
              {saving ? 'Adding…' : 'Add calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
