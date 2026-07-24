import { addDays, addMonths, addYears, isBefore, isEqual } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';

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

/** Expands a single (possibly recurring) event into its occurrences within [rangeStart, rangeEnd]. */
export function expandRecurringEvent(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const rule = event.recurrence_rule;
  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const duration = end.getTime() - start.getTime();

  if (!rule || rule === 'none') {
    return start <= rangeEnd && end >= rangeStart ? [event] : [];
  }

  const occurrences: CalendarEvent[] = [];
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

export function expandEventsForRange(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  return events.flatMap((event) => expandRecurringEvent(event, rangeStart, rangeEnd));
}

/** Occurrence ids are `${realId}::${occurrenceStartIso}` — strip that suffix to edit/delete the whole series. */
export function getBaseEventId(id: string): string {
  return id.split(OCCURRENCE_ID_SEPARATOR)[0];
}
