import { useState } from 'react';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import type { CalendarEvent, CalendarEventInput, CalendarView } from '../types/calendar';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { CalendarHeader } from '../components/CalendarHeader';
import { MonthView } from '../components/MonthView';
import { WeekView } from '../components/WeekView';
import { DayView } from '../components/DayView';
import { EventModal } from '../components/EventModal';

interface ModalState {
  event: CalendarEvent | null;
  date: Date | null;
}

export function CalendarPage() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [modalState, setModalState] = useState<ModalState | null>(null);

  const goToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (view === 'month') setCurrentDate((d) => subMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  };
  const goNext = () => {
    if (view === 'month') setCurrentDate((d) => addMonths(d, 1));
    else if (view === 'week') setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  };

  const openNewEvent = (date: Date) => setModalState({ event: null, date });
  const openEditEvent = (event: CalendarEvent) => setModalState({ event, date: null });
  const closeModal = () => setModalState(null);

  const handleSave = async (id: string | null, input: CalendarEventInput) => {
    if (id) await updateEvent(id, input);
    else await createEvent(input);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        onAddEvent={() => openNewEvent(currentDate)}
      />

      {error && <p className="bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-950">{error}</p>}

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-slate-400">Loading events…</div>
        ) : view === 'month' ? (
          <MonthView currentDate={currentDate} events={events} onDayClick={openNewEvent} onEventClick={openEditEvent} />
        ) : view === 'week' ? (
          <WeekView currentDate={currentDate} events={events} onSlotClick={openNewEvent} onEventClick={openEditEvent} />
        ) : (
          <DayView currentDate={currentDate} events={events} onSlotClick={openNewEvent} onEventClick={openEditEvent} />
        )}
      </div>

      {modalState && (
        <EventModal
          event={modalState.event}
          initialDate={modalState.date}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
