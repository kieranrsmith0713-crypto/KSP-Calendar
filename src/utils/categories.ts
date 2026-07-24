export const DEFAULT_CATEGORIES = ['Personal', 'Work', 'Health'] as const;

interface CategoryColor {
  bg: string;
  border: string;
  text: string;
}

const CATEGORY_COLORS: Record<string, CategoryColor> = {
  Personal: { bg: 'bg-violet-100 dark:bg-violet-950', border: 'border-violet-400', text: 'text-violet-800 dark:text-violet-200' },
  Work: { bg: 'bg-blue-100 dark:bg-blue-950', border: 'border-blue-400', text: 'text-blue-800 dark:text-blue-200' },
  Health: { bg: 'bg-emerald-100 dark:bg-emerald-950', border: 'border-emerald-400', text: 'text-emerald-800 dark:text-emerald-200' },
};

const FALLBACK_COLOR: CategoryColor = {
  bg: 'bg-slate-100 dark:bg-slate-800',
  border: 'border-slate-400',
  text: 'text-slate-800 dark:text-slate-200',
};

export function getCategoryColor(category: string | null | undefined): CategoryColor {
  if (!category) return FALLBACK_COLOR;
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR;
}
