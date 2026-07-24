import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { CalendarEvent, CalendarEventInput } from '../types/calendar';

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_time', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEvents(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvent = useCallback(
    async (input: CalendarEventInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('calendar_events')
        .insert({ ...input, user_id: userData.user.id });
      if (insertError) throw insertError;
      await refresh();
    },
    [refresh],
  );

  const updateEvent = useCallback(
    async (id: string, input: CalendarEventInput) => {
      const { error: updateError } = await supabase.from('calendar_events').update(input).eq('id', id);
      if (updateError) throw updateError;
      await refresh();
    },
    [refresh],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('calendar_events').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await refresh();
    },
    [refresh],
  );

  return { events, loading, error, createEvent, updateEvent, deleteEvent, refresh };
}
