import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { ExternalCalendar, ExternalCalendarInput } from '../types/externalCalendar';

export function useExternalCalendars() {
  const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('external_calendars')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setCalendars(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCalendar = useCallback(
    async (input: ExternalCalendarInput) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('external_calendars')
        .insert({ ...input, user_id: userData.user.id });
      if (insertError) throw insertError;
      await refresh();
    },
    [refresh],
  );

  const updateCalendar = useCallback(
    async (id: string, input: Partial<ExternalCalendarInput>) => {
      const { error: updateError } = await supabase.from('external_calendars').update(input).eq('id', id);
      if (updateError) throw updateError;
      await refresh();
    },
    [refresh],
  );

  const deleteCalendar = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from('external_calendars').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await refresh();
    },
    [refresh],
  );

  return { calendars, loading, error, addCalendar, updateCalendar, deleteCalendar, refresh };
}
