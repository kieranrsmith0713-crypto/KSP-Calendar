import { useState } from 'react';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import type { CalendarEventInput, CalendarView, DisplayEvent } from '../types/calendar';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useExternalCalendars } from '../hooks/useExternalCalendars';
import { useImportedEvents } from '../hooks/useImportedEvents';
import { CalendarHeader } from '../components/CalendarHeader';
import { MonthView } from '../components/MonthView';
import { WeekView } from '../components/WeekView';
import { DayView } from '../components/DayView';
import { EventModal } from '../components/EventModal';
import { ManageCalendarsModal } from '../components/ManageCalendarsModal';

interface ModalState {
  event: DisplayEvent | null;
  date: Date | null;
}

export function CalendarPage() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const {
    calendars: externalCalendars,
    error: externalCalendarsError,
    addCalendar,
    updateCalendar,
    deleteCalendar,
  } = useExternalCalendars();
  const { events: importedEvents, errors: importErrors } = useImportedEvents(externalCalendars);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [manageCalendarsOpen, setManageCalendarsOpen] = useState(false);

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
  const openEditEvent = (event: DisplayEvent) => setModalState({ event, date: null });
  const closeModal = () => setModalState(null);

  const handleSave = async (id: string | null, input: CalendarEventInput) => {
    if (id) await updateEvent(id, input);
    else await createEvent(input);
  };

  const displayEvents: DisplayEvent[] = [
    ...events.map((event) => ({ ...event, source: 'internal' as const })),
    ...importedEvents,
  ];

  const importErrorMessages = Object.values(importErrors);

  return (
    <div className="flex h-screen flex-col bg-[var(--bg)]">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        onAddEvent={() => openNewEvent(currentDate)}
        onManageCalendars={() => setManageCalendarsOpen(true)}
      />

      {error && (
        <p className="alert error m-2 text-center" role="alert">
          {error}
        </p>
      )}
      {externalCalendarsError && (
        <p className="alert error m-2 text-center" role="alert">
          {externalCalendarsError}
        </p>
      )}
      {importErrorMessages.length > 0 && (
        <p className="alert warning m-2 text-center">
          Couldn't load {importErrorMessages.length === 1 ? 'a calendar' : 'some calendars'}: {importErrorMessages.join(' · ')}
        </p>
      )}

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center muted">Loading events…</div>
        ) : view === 'month' ? (
          <MonthView currentDate={currentDate} events={displayEvents} onDayClick={openNewEvent} onEventClick={openEditEvent} />
        ) : view === 'week' ? (
          <WeekView currentDate={currentDate} events={displayEvents} onSlotClick={openNewEvent} onEventClick={openEditEvent} />
        ) : (
          <DayView currentDate={currentDate} events={displayEvents} onSlotClick={openNewEvent} onEventClick={openEditEvent} />
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

      {manageCalendarsOpen && (
        <ManageCalendarsModal
          calendars={externalCalendars}
          errors={importErrors}
          onAdd={addCalendar}
          onToggle={(id, enabled) => updateCalendar(id, { enabled })}
          onDelete={deleteCalendar}
          onClose={() => setManageCalendarsOpen(false)}
        />
      )}
    </div>
  );
}
