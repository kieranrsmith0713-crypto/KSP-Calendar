import type { ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { useAppAccess } from '../hooks/useAppAccess';
import { KSPLogo } from './KSPLogo';

const HUB_LOGIN_URL = 'https://hub.ksponline.co.uk/login';
const HUB_DASHBOARD_URL = 'https://hub.ksponline.co.uk/dashboard';

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
  const hasAccess = useAppAccess(session?.user.id, 'calendar');

  if (loading) {
    return <SplashScreen message="Loading…" />;
  }

  if (!session) {
    const redirect = encodeURIComponent(window.location.hostname);
    window.location.href = `${HUB_LOGIN_URL}?redirect=${redirect}`;
    return <SplashScreen message="Redirecting to sign in…" />;
  }

  if (hasAccess === undefined) {
    return <SplashScreen message="Checking access…" />;
  }

  if (!hasAccess) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center">
        <KSPLogo variant="full" />
        <p className="muted text-sm">
          You don't have access to Calendar. Ask your admin to grant it from the Hub, or{' '}
          <a href={HUB_DASHBOARD_URL} className="underline">
            go back to the Hub
          </a>
          .
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
