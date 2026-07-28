import type { CSSProperties } from 'react';
import type { DisplayEvent } from '../types/calendar';
import type { TodoPriority } from '../types/todo';
import { getCategoryColor } from './categories';

const TODO_PRIORITY_COLORS: Record<TodoPriority, string> = {
  high: '#f87171',
  medium: '#f0b93d',
  low: '#8b93a5',
};

export function getEventVisual(event: DisplayEvent): { className: string; style: CSSProperties } {
  const color =
    event.source === 'external'
      ? event.calendarColor
      : event.source === 'todo'
        ? TODO_PRIORITY_COLORS[event.priority]
        : getCategoryColor(event.category);
  return {
    className: 'border-l-2 text-[var(--text)]',
    style: { backgroundColor: `${color}26`, borderColor: color },
  };
}

/** A small prefix marking a to-do task apart from a real event, since color alone is subtle. */
export function getEventIcon(event: DisplayEvent): string {
  if (event.source !== 'todo') return '';
  return event.completed ? '✓ ' : '☐ ';
}
