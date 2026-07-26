import ICAL from 'ical.js';
import { addMonths, subMonths } from 'date-fns';
import { supabase } from './supabaseClient';
import type { ImportedEvent } from '../types/externalCalendar';

const EXPANSION_MONTHS_PAST = 3;
const EXPANSION_MONTHS_FUTURE = 12;
const MAX_OCCURRENCES_PER_EVENT = 300;

interface CalendarRef {
  id: string;
  name: string;
  color: string;
}

async function extractErrorMessage(error: { message?: string; context?: unknown }): Promise<string> {
  const context = error.context;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // fall through to generic message below
    }
  }
  return error.message ?? 'Failed to fetch calendar feed.';
}

export async function fetchIcsText(url: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text?: string }>('fetch-ics', {
    body: { url },
  });

  if (error) throw new Error(await extractErrorMessage(error));
  if (!data?.text) throw new Error('Empty response from calendar feed.');
  return data.text;
}

export function parseIcsToEvents(icsText: string, calendar: CalendarRef): ImportedEvent[] {
  const jcalData = ICAL.parse(icsText);
  const component = new ICAL.Component(jcalData);
  const vevents = component.getAllSubcomponents('vevent');

  const rangeStart = ICAL.Time.fromJSDate(subMonths(new Date(), EXPANSION_MONTHS_PAST));
  const rangeEnd = ICAL.Time.fromJSDate(addMonths(new Date(), EXPANSION_MONTHS_FUTURE));

  const events: ImportedEvent[] = [];

  const pushOccurrence = (icalEvent: ICAL.Event, uid: string, startTime: ICAL.Time, endTime: ICAL.Time) => {
    const start = startTime.toJSDate();
    const end = endTime.toJSDate();
    events.push({
      id: `ext:${calendar.id}:${uid}:${start.toISOString()}`,
      source: 'external',
      calendarId: calendar.id,
      calendarName: calendar.name,
      calendarColor: calendar.color,
      title: icalEvent.summary || '(No title)',
      description: icalEvent.description || null,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      all_day: startTime.isDate,
      location: icalEvent.location || null,
    });
  };

  for (const vevent of vevents) {
    let icalEvent: ICAL.Event;
    try {
      icalEvent = new ICAL.Event(vevent);
    } catch {
      continue;
    }

    const uid = icalEvent.uid || crypto.randomUUID();

    if (icalEvent.isRecurring()) {
      const iterator = icalEvent.iterator();
      let count = 0;
      let next: ICAL.Time | null;
      while (count < MAX_OCCURRENCES_PER_EVENT && (next = iterator.next())) {
        count += 1;
        if (next.compare(rangeEnd) > 0) break;
        if (next.compare(rangeStart) < 0) continue;

        const occurrenceEnd = next.clone();
        occurrenceEnd.addDuration(icalEvent.duration);
        pushOccurrence(icalEvent, uid, next, occurrenceEnd);
      }
    } else {
      const start = icalEvent.startDate;
      const end = icalEvent.endDate;
      if (end.compare(rangeStart) >= 0 && start.compare(rangeEnd) <= 0) {
        pushOccurrence(icalEvent, uid, start, end);
      }
    }
  }

  return events;
}
