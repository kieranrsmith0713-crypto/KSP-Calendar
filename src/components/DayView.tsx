import { endOfDay, startOfDay } from 'date-fns';
import type { CalendarEvent } from '../types/calendar';
import { expandEventsForRange } from '../utils/recurrence';
import { TimeGrid } from './TimeGrid';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onSlotClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function DayView({ currentDate, events, onSlotClick, onEventClick }: DayViewProps) {
  const dayStart = startOfDay(currentDate);
  const dayEnd = endOfDay(currentDate);
  const expandedEvents = expandEventsForRange(events, dayStart, dayEnd);

  return <TimeGrid days={[dayStart]} events={expandedEvents} onSlotClick={onSlotClick} onEventClick={onEventClick} />;
}
