import { addDays, endOfWeek, startOfWeek } from 'date-fns';
import type { DisplayEvent } from '../types/calendar';
import { expandEventsForRange } from '../utils/recurrence';
import { TimeGrid } from './TimeGrid';

interface WeekViewProps {
  currentDate: Date;
  events: DisplayEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (event: DisplayEvent) => void;
}

export function WeekView({ currentDate, events, onSlotClick, onEventClick }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const expandedEvents = expandEventsForRange(events, weekStart, weekEnd);

  return <TimeGrid days={days} events={expandedEvents} onSlotClick={onSlotClick} onEventClick={onEventClick} />;
}
