const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getCookieDomain(): string | undefined {
  const host = window.location.hostname;
  return host.endsWith('ksponline.co.uk') ? '.ksponline.co.uk' : undefined;
}

function getCookie(name: string): string | null {
  const escaped = name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string): void {
  const domain = getCookieDomain();
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  if (domain) cookie += `; domain=${domain}`;
  if (window.location.protocol === 'https:') cookie += '; Secure';
  document.cookie = cookie;
}

function removeCookie(name: string): void {
  const domain = getCookieDomain();
  let cookie = `${name}=; path=/; max-age=0`;
  if (domain) cookie += `; domain=${domain}`;
  document.cookie = cookie;
}

/**
 * Storage adapter used so the Supabase session lives in a cookie scoped to
 * .ksponline.co.uk instead of localStorage, letting Hub/Finance/Calendar
 * share one session. All KSP apps must use this same storage + storageKey.
 */
export const cookieStorage = {
  getItem: (key: string) => getCookie(key),
  setItem: (key: string, value: string) => setCookie(key, value),
  removeItem: (key: string) => removeCookie(key),
};
