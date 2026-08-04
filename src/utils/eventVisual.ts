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
    className: 'event-swatch',
    style: {
      backgroundColor: `${color}26`,
      borderColor: color,
      textDecoration: event.source === 'todo' && event.completed ? 'line-through' : undefined,
    },
  };
}

/** A task's calendar entry shows just its name — no time prefix (its "time" is a due time, not a slot). */
export function shouldShowTimePrefix(event: DisplayEvent): boolean {
  return event.source !== 'todo' && !event.all_day;
}
