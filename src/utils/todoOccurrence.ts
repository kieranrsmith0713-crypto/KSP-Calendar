import { format } from 'date-fns';
import type { Todo, TodoEvent } from '../types/todo';

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Whether a todo has an occurrence on `target`'s calendar day. Ported from KSP To-do's own
 * `occursOnDate` (src/lib/recurrence.ts) so a task shows on the same days here as it would
 * there — a non-recurring task matches only its exact due_date; a recurring one also matches
 * projected future occurrences (every 7 days for weekly, same day-of-month for monthly,
 * clamped for shorter months). Dates before due_date never match — due_date is the *current*
 * occurrence, not a series start, since completing a recurring task advances it in place.
 */
function occursOnDate(todo: Pick<Todo, 'recurrence' | 'due_date'>, target: Date): boolean {
  if (!todo.due_date) return false;
  const due = new Date(todo.due_date);
  const dueDay = startOfDay(due);
  const targetDay = startOfDay(target);

  if (!todo.recurrence) return dueDay.getTime() === targetDay.getTime();

  const daysBetween = Math.round((targetDay.getTime() - dueDay.getTime()) / MS_PER_DAY);
  if (daysBetween < 0) return false;

  if (todo.recurrence === 'daily') return true;
  if (todo.recurrence === 'weekly') return daysBetween % 7 === 0;

  const daysInTargetMonth = new Date(targetDay.getFullYear(), targetDay.getMonth() + 1, 0).getDate();
  const expectedDay = Math.min(due.getDate(), daysInTargetMonth);
  return targetDay.getDate() === expectedDay;
}

/** Projects every todo with a due date onto its occurrence day(s) within [rangeStart, rangeEnd]. */
export function expandTodosForRange(todos: Todo[], rangeStart: Date, rangeEnd: Date): TodoEvent[] {
  const occurrences: TodoEvent[] = [];
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  for (const todo of todos) {
    if (!todo.due_date) continue;
    const due = new Date(todo.due_date);

    for (let day = start; day.getTime() <= end.getTime(); day = new Date(day.getTime() + MS_PER_DAY)) {
      if (!occursOnDate(todo, day)) continue;

      const occurrenceTime = new Date(day);
      occurrenceTime.setHours(due.getHours(), due.getMinutes(), due.getSeconds(), 0);

      occurrences.push({
        // `day` is local midnight — format it in local time, not toISOString's UTC (which
        // would shift the date-string back a day in UTC+ zones like the UK's BST).
        id: `todo:${todo.id}:${format(day, 'yyyy-MM-dd')}`,
        source: 'todo',
        todoId: todo.id,
        title: todo.title,
        description: todo.description,
        start_time: occurrenceTime.toISOString(),
        end_time: occurrenceTime.toISOString(),
        all_day: false,
        priority: todo.priority,
        category: todo.category,
        completed: todo.completed,
        recurrence: todo.recurrence,
      });
    }
  }

  return occurrences;
}
