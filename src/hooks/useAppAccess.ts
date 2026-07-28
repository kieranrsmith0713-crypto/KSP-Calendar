import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Access is granted per-app from KSP Hub's admin panel (user_app_access
 * table, shared Supabase project, RLS-scoped to "own rows"). undefined
 * while checking; a definite boolean once resolved. No row for
 * (userId, appId) means access hasn't been granted.
 */
export function useAppAccess(userId: string | undefined, appId: string): boolean | undefined {
  const [hasAccess, setHasAccess] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!userId) {
      setHasAccess(undefined);
      return;
    }
    let active = true;
    supabase
      .from('user_app_access')
      .select('app_id')
      .eq('user_id', userId)
      .eq('app_id', appId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        setHasAccess(!error && !!data);
      });
    return () => {
      active = false;
    };
  }, [userId, appId]);

  return hasAccess;
}
