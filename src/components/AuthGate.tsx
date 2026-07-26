import type { ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { KSPLogo } from './KSPLogo';

const HUB_LOGIN_URL = 'https://hub.ksponline.co.uk/login';

function SplashScreen({ message }: { message: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)]">
      <KSPLogo variant="full" />
      <p className="muted text-sm">{message}</p>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return <SplashScreen message="Loading…" />;
  }

  if (!session) {
    const redirect = encodeURIComponent(window.location.hostname);
    window.location.href = `${HUB_LOGIN_URL}?redirect=${redirect}`;
    return <SplashScreen message="Redirecting to sign in…" />;
  }

  return <>{children}</>;
}
