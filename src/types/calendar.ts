export type CalendarView = 'month' | 'week' | 'day';

export type RecurrenceRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  category: string | null;
  recurrence_rule: string | null;
  created_at: string;
}

export interface CalendarEventInput {
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location: string | null;
  category: string | null;
  recurrence_rule: string | null;
}
