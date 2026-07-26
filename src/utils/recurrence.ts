import { addDays, addMonths, addYears, isBefore, isEqual } from 'date-fns';
import type { CalendarEvent, DisplayEvent } from '../types/calendar';

const MAX_OCCURRENCES = 500;
const OCCURRENCE_ID_SEPARATOR = '::';

function step(rule: string, date: Date): Date {
  switch (rule) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addDays(date, 7);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
    default:
      return addDays(date, 1);
  }
}

function hasRecurrenceRule(event: DisplayEvent): event is CalendarEvent & { source?: 'internal' } {
  return 'recurrence_rule' in event;
}

/** Expands a single (possibly recurring) event into its occurrences within [rangeStart, rangeEnd]. Imported events are already single, concrete occurrences and pass through unchanged. */
export function expandRecurringEvent(event: DisplayEvent, rangeStart: Date, rangeEnd: Date): DisplayEvent[] {
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  if (!hasRecurrenceRule(event) || !event.recurrence_rule || event.recurrence_rule === 'none') {
    return start <= rangeEnd && end >= rangeStart ? [event] : [];
  }

  const rule = event.recurrence_rule;
  const duration = end.getTime() - start.getTime();
  const occurrences: DisplayEvent[] = [];
  let occurrenceStart = start;
  let count = 0;

  while ((isBefore(occurrenceStart, rangeEnd) || isEqual(occurrenceStart, rangeEnd)) && count < MAX_OCCURRENCES) {
    const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
    if (occurrenceEnd >= rangeStart) {
      occurrences.push({
        ...event,
        id: `${event.id}${OCCURRENCE_ID_SEPARATOR}${occurrenceStart.toISOString()}`,
        start_time: occurrenceStart.toISOString(),
        end_time: occurrenceEnd.toISOString(),
      });
    }
    occurrenceStart = step(rule, occurrenceStart);
    count += 1;
  }

  return occurrences;
}

export function expandEventsForRange(events: DisplayEvent[], rangeStart: Date, rangeEnd: Date): DisplayEvent[] {
  return events.flatMap((event) => expandRecurringEvent(event, rangeStart, rangeEnd));
}

/** Occurrence ids are `${realId}::${occurrenceStartIso}` — strip that suffix to edit/delete the whole series. */
export function getBaseEventId(id: string): string {
  return id.split(OCCURRENCE_ID_SEPARATOR)[0];
}
