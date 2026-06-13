import { useEffect, useMemo, useState } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';
import { USER_AVATAR } from '../constants/images';
import useAuth from '../hooks/useAuth';
import { fetchCalendarEventsForRange, getGoogleCalendarConnection } from '../services/googleCalendar';

const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

const SELECTED_DAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  weekday: 'short',
});

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getEventDate(value) {
  if (!value) return null;
  return value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
}

function getMonthRange(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return { end, start };
}

function isSameDay(first, second) {
  return Boolean(first && second && getDateKey(first) === getDateKey(second));
}

function getEventDateKeys(event) {
  const start = getEventDate(event.start);
  const end = getEventDate(event.end);

  if (!start) return [];

  if (!event.isAllDay || !end) {
    return [getDateKey(start)];
  }

  const keys = [];
  const cursor = new Date(start);
  const exclusiveEnd = new Date(end);

  while (cursor < exclusiveEnd) {
    keys.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys.length > 0 ? keys : [getDateKey(start)];
}

function groupEventsByDate(events) {
  return events.reduce((groupedEvents, event) => {
    getEventDateKeys(event).forEach((dateKey) => {
      const dayEvents = groupedEvents.get(dateKey) ?? [];
      groupedEvents.set(dateKey, [...dayEvents, event]);
    });

    return groupedEvents;
  }, new Map());
}

function formatEventTime(event) {
  const start = getEventDate(event.start);
  const end = getEventDate(event.end);

  if (!start) return 'Time TBD';

  if (event.isAllDay) {
    return 'All day';
  }

  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  const startTime = timeFormatter.format(start);
  const endTime = end ? ` - ${timeFormatter.format(end)}` : '';

  return `${startTime}${endTime}`;
}

function sortEventsByStart(first, second) {
  const firstStart = getEventDate(first.start)?.getTime() ?? 0;
  const secondStart = getEventDate(second.start)?.getTime() ?? 0;

  return firstStart - secondStart;
}

export default function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthRange(today).start);
  const [connection, setConnection] = useState(() => getGoogleCalendarConnection(user?.id));
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState('');

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const selectedDateEvents = useMemo(() => {
    return [...(eventsByDate.get(getDateKey(selectedDate)) ?? [])].sort(sortEventsByStart);
  }, [eventsByDate, selectedDate]);

  const monthLabel = MONTH_FORMATTER.format(visibleMonth);
  const selectedDateLabel = SELECTED_DAY_FORMATTER.format(selectedDate);

  const loadVisibleMonthEvents = async () => {
    if (!connection.connected || !user?.id) {
      setEvents([]);
      setEventsError('');
      return;
    }

    const { end, start } = getMonthRange(visibleMonth);

    setEventsLoading(true);
    setEventsError('');

    try {
      const monthEvents = await fetchCalendarEventsForRange(user.id, {
        timeMax: end.toISOString(),
        timeMin: start.toISOString(),
      });
      setEvents(monthEvents);
      setConnection(getGoogleCalendarConnection(user.id));
    } catch (err) {
      setEvents([]);
      setEventsError(err.message ?? 'Unable to load calendar events.');
      setConnection(getGoogleCalendarConnection(user.id));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      if (!connection.connected || !user?.id) {
        setEvents([]);
        setEventsError('');
        return;
      }

      const { end, start } = getMonthRange(visibleMonth);

      setEventsLoading(true);
      setEventsError('');

      try {
        const monthEvents = await fetchCalendarEventsForRange(user.id, {
          timeMax: end.toISOString(),
          timeMin: start.toISOString(),
        });
        if (active) {
          setEvents(monthEvents);
          setConnection(getGoogleCalendarConnection(user.id));
        }
      } catch (err) {
        if (active) {
          setEvents([]);
          setEventsError(err.message ?? 'Unable to load calendar events.');
          setConnection(getGoogleCalendarConnection(user.id));
        }
      } finally {
        if (active) {
          setEventsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, [connection.connected, user?.id, visibleMonth]);

  const handleMonthChange = ({ activeStartDate }) => {
    if (!activeStartDate) return;
    setVisibleMonth(getMonthRange(activeStartDate).start);
  };

  const handlePreviousMonth = () => {
    const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    setSelectedDate(previousMonth);
    setVisibleMonth(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    setSelectedDate(nextMonth);
    setVisibleMonth(nextMonth);
  };

  const handleToday = () => {
    const nextToday = new Date();
    setSelectedDate(nextToday);
    setVisibleMonth(getMonthRange(nextToday).start);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setVisibleMonth(getMonthRange(date).start);
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    const classNames = [];

    if (isSameDay(date, selectedDate)) {
      classNames.push('unburn-calendar__day--selected');
    }

    if (eventsByDate.has(getDateKey(date))) {
      classNames.push('unburn-calendar__day--has-events');
    }

    return classNames.join(' ');
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayEvents = eventsByDate.get(getDateKey(date)) ?? [];
    if (dayEvents.length === 0) return null;

    return (
      <span className="unburn-calendar__event-indicators" aria-label={`${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'}`}>
        <span />
        {dayEvents.length > 1 && <span />}
        {dayEvents.length > 2 && <span className="unburn-calendar__event-count">{dayEvents.length}</span>}
      </span>
    );
  };

  return (
    <div className="min-h-screen font-body-md overflow-x-hidden pb-32 bg-background">
      <header className="px-container-margin py-md flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur z-40">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="squish-click w-12 h-12 flex items-center justify-center rounded-full bg-surface-container"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-bold">{monthLabel}</h1>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-12 h-12 rounded-full overflow-hidden border-2"
          aria-label="Open profile"
        >
          <img src={USER_AVATAR} className="w-full h-full object-cover" alt="" />
        </button>
      </header>

      <main className="max-w-[1040px] mx-auto px-container-margin mt-sm flex flex-col xl:flex-row gap-lg">
        <section className="flex-1">
          <div className="bg-surface-container-lowest border rounded-3xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-5">
              <button
                type="button"
                onClick={handlePreviousMonth}
                className="squish-click w-11 h-11 rounded-full bg-surface-container flex items-center justify-center"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="text-center">
                <h2 className="font-bold text-lg">{monthLabel}</h2>
                <button type="button" onClick={handleToday} className="squish-click text-xs text-primary font-bold mt-1">
                  Today
                </button>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="squish-click w-11 h-11 rounded-full bg-surface-container flex items-center justify-center"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div className="unburn-calendar">
              <ReactCalendar
                activeStartDate={visibleMonth}
                calendarType="gregory"
                formatShortWeekday={(_, date) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                maxDetail="month"
                minDetail="month"
                navigationLabel={null}
                next2Label={null}
                nextLabel={null}
                onActiveStartDateChange={handleMonthChange}
                onClickDay={handleDateSelect}
                prev2Label={null}
                prevLabel={null}
                showNavigation={false}
                showFixedNumberOfWeeks
                tileClassName={getTileClassName}
                tileContent={getTileContent}
                value={selectedDate}
              />
            </div>
          </div>
        </section>

        <section className="w-full xl:w-[400px] space-y-6">
          <div className="bg-surface-container-lowest border rounded-3xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{selectedDateLabel}</h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  {connection.connected
                    ? `${selectedDateEvents.length} event${selectedDateEvents.length === 1 ? '' : 's'}`
                    : connection.expired
                      ? 'Google Calendar connection expired'
                      : 'Google Calendar disconnected'}
                </p>
              </div>
              <button
                type="button"
                onClick={connection.connected ? loadVisibleMonthEvents : () => navigate('/profile')}
                disabled={eventsLoading}
                className="squish-click text-xs uppercase bg-primary-container rounded-full px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {connection.connected ? 'Refresh' : 'Connect'}
              </button>
            </div>

            {eventsLoading && (
              <div className="mt-5 bg-surface-container-low p-4 rounded-xl text-sm">Loading calendar events...</div>
            )}

            {eventsError && (
              <div className="mt-5 bg-error-container text-error p-4 rounded-xl text-sm" role="alert">
                {eventsError}
              </div>
            )}

            {!eventsLoading && !eventsError && !connection.connected && (
              <div className="mt-5 bg-surface-container-low p-4 rounded-xl text-sm">
                Connect Google Calendar from your profile to see events by day.
              </div>
            )}

            {!eventsLoading && !eventsError && connection.connected && selectedDateEvents.length === 0 && (
              <div className="mt-5 bg-surface-container-low p-4 rounded-xl text-sm">No events on this date.</div>
            )}

            {!eventsLoading && !eventsError && selectedDateEvents.length > 0 && (
              <div className="mt-5 space-y-3">
                {selectedDateEvents.map((event) => (
                  <a
                    key={event.id}
                    href={event.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-4 bg-surface-container border rounded-2xl shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm">{event.summary}</p>
                        <p className="text-xs opacity-70 mt-1">{formatEventTime(event)}</p>
                        {event.location && <p className="text-xs opacity-70 mt-1">{event.location}</p>}
                      </div>
                      <span className="material-symbols-outlined text-primary text-[20px]">open_in_new</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
