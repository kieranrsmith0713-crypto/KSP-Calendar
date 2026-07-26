export const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Health'] as const;

// Drawn from the KSP suite's extended palette so category chips read as part of the same system.
const CATEGORY_COLORS: Record<string, string> = {
  Personal: '#8b7cf0',
  Work: '#60a5fa',
  Health: '#4ade80',
};

const FALLBACK_COLOR = '#8b93a5';

export function getCategoryColor(category: string | null | undefined): string {
  if (!category) return FALLBACK_COLOR;
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}
