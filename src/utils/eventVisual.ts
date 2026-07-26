import type { CSSProperties } from 'react';
import type { DisplayEvent } from '../types/calendar';
import { getCategoryColor } from './categories';

export function getEventVisual(event: DisplayEvent): { className: string; style: CSSProperties } {
  const color = event.source === 'external' ? event.calendarColor : getCategoryColor(event.category);
  return {
    className: 'border-l-2 text-[var(--text)]',
    style: { backgroundColor: `${color}26`, borderColor: color },
  };
}
