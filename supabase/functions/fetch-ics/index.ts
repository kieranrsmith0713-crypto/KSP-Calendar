// Proxies an external .ics calendar feed URL server-side.
//
// Needed because most providers (Google, Outlook, Apple) don't send
// Access-Control-Allow-Origin headers on their ICS feeds, so the browser
// can't fetch them directly. Requires a valid KSP session (not a public
// endpoint) since it fetches arbitrary user-supplied URLs.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const MAX_BYTES = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization.' }, 401);
  }

  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Not authenticated.' }, 401);
  }

  let url: unknown;
  try {
    ({ url } = await req.json());
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  if (typeof url !== 'string' || !/^https:\/\//i.test(url)) {
    return jsonResponse({ error: 'A valid https:// calendar URL is required.' }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/calendar, text/plain, */*' },
    });
  } catch {
    return jsonResponse({ error: 'Could not reach that calendar URL.' }, 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) {
    return jsonResponse({ error: `Calendar feed returned ${upstream.status}.` }, 502);
  }

  const text = await upstream.text();

  if (text.length > MAX_BYTES) {
    return jsonResponse({ error: 'Calendar feed is too large.' }, 413);
  }
  if (!text.includes('BEGIN:VCALENDAR')) {
    return jsonResponse({ error: 'That URL did not return a valid calendar (.ics) feed.' }, 422);
  }

  return jsonResponse({ text }, 200);
});
