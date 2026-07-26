import { useEffect, useState } from 'react';
import { fetchIcsText, parseIcsToEvents } from '../lib/icsParser';
import type { ExternalCalendar, ImportedEvent } from '../types/externalCalendar';

/** Fetches + parses every enabled external calendar's feed and merges the results. */
export function useImportedEvents(calendars: ExternalCalendar[]) {
  const [events, setEvents] = useState<ImportedEvent[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const enabledCalendars = calendars.filter((calendar) => calendar.enabled);
  const refreshKey = enabledCalendars.map((calendar) => `${calendar.id}:${calendar.url}:${calendar.color}`).join('|');

  useEffect(() => {
    let cancelled = false;

    if (enabledCalendars.length === 0) {
      setEvents([]);
      setErrors({});
      return;
    }

    setLoading(true);
    Promise.all(
      enabledCalendars.map(async (calendar) => {
        try {
          const text = await fetchIcsText(calendar.url);
          return { calendar, events: parseIcsToEvents(text, calendar), error: null as string | null };
        } catch (err) {
          return {
            calendar,
            events: [] as ImportedEvent[],
            error: err instanceof Error ? err.message : 'Failed to load calendar.',
          };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setEvents(results.flatMap((result) => result.events));
      setErrors(
        Object.fromEntries(
          results.filter((result): result is typeof result & { error: string } => Boolean(result.error))
            .map((result) => [result.calendar.id, result.error]),
        ),
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // Only re-fetch when the set of enabled feeds actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return { events, errors, loading };
}
