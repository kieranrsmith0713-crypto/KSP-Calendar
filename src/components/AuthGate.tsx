import type { ReactNode } from 'react';
import { useSession } from '../hooks/useSession';

const HUB_LOGIN_URL = 'https://hub.ksponline.co.uk/login';

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 dark:text-slate-400">
        Loading…
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(window.location.hostname);
    window.location.href = `${HUB_LOGIN_URL}?redirect=${redirect}`;
    return (
      <div className="flex h-screen items-center justify-center text-slate-500 dark:text-slate-400">
        Redirecting to sign in…
      </div>
    );
  }

  return <>{children}</>;
}
