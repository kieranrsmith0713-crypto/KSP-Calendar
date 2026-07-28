import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Todo } from '../types/todo';

/** Read-only: KSP To-do owns this table. Same shared Supabase project, same RLS-scoped user. */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('todos')
      .select('id, title, description, due_date, priority, category, completed, recurrence')
      .not('due_date', 'is', null);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTodos(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { todos, loading, error, refresh };
}
