export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoRecurrence = 'daily' | 'weekly' | 'monthly';

/** Read-only projection of a row from KSP To-do's `public.todos` table (same shared Supabase project). */
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TodoPriority;
  category: string | null;
  completed: boolean;
  recurrence: TodoRecurrence | null;
}

/** A single due-date occurrence of a todo, projected onto the calendar — read-only, not a `calendar_events` row. */
export interface TodoEvent {
  id: string;
  source: 'todo';
  todoId: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  priority: TodoPriority;
  category: string | null;
  completed: boolean;
  recurrence: TodoRecurrence | null;
}
