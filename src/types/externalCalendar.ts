export interface ExternalCalendar {
  id: string;
  user_id: string;
  name: string;
  url: string;
  color: string;
  enabled: boolean;
  created_at: string;
}

export interface ExternalCalendarInput {
  name: string;
  url: string;
  color: string;
  enabled: boolean;
}

/** A single occurrence pulled from an imported .ics feed — read-only, not a `calendar_events` row. */
export interface ImportedEvent {
  id: string;
  source: 'external';
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
}
