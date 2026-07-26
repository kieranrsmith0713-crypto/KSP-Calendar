import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.');
}

// Must match Hub's cookie setup exactly (createBrowserClient's own cookie
// name/chunking, no custom storageKey override) or this app can't read the
// session Hub writes. A previous version used a hand-rolled cookie adapter
// on top of plain @supabase/supabase-js with a hardcoded storageKey that
// didn't match Hub's actual cookie name, and couldn't parse Hub's chunked
// cookie format either - this app would never see a session, and would
// bounce to Hub, which would bounce right back: an infinite redirect loop
// (see the same bug and fix in the KSP-Todo-Reminder repo).
function getCookieDomain(): string | undefined {
  const host = window.location.hostname;
  return host.endsWith('ksponline.co.uk') ? '.ksponline.co.uk' : undefined;
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: {
    domain: getCookieDomain(),
    path: '/',
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  },
});
