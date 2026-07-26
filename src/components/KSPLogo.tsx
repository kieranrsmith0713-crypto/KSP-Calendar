interface KSPLogoProps {
  variant?: 'compact' | 'full';
  /** The word next to/under the KSP mark — "Calendar" here, "Financial"/"Hub" in sibling apps. */
  tagline?: string;
  className?: string;
}

export function KSPLogo({ variant = 'compact', tagline = 'Calendar', className }: KSPLogoProps) {
  const rootClass = ['ksp-logo', `ksp-logo-${variant}`, className].filter(Boolean).join(' ');

  if (variant === 'full') {
    return (
      <div className={rootClass}>
        <span className="ksp-logo-mark">KSP</span>
        <span className="ksp-logo-divider" aria-hidden="true">
          <span className="ksp-logo-dot" />
          <span className="ksp-logo-line" />
          <span className="ksp-logo-dot ksp-logo-dot-mid" />
          <span className="ksp-logo-line" />
          <span className="ksp-logo-dot" />
        </span>
        <span className="ksp-logo-sub">{tagline.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <span className={rootClass}>
      <span className="ksp-logo-mark">KSP</span>
      <span className="ksp-logo-tagline">{tagline}</span>
    </span>
  );
}
