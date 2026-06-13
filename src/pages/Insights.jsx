import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import MaterialIcon from '../components/MaterialIcon';
import useAuth from '../hooks/useAuth';
import { analyzeBurnoutRisk } from '../services/burnoutInsights';
import { fetchCalendarEventsForRange, getGoogleCalendarConnection } from '../services/googleCalendar';

const SCORE_STYLES = {
  High: {
    badge: 'bg-error-container text-on-error-container',
    bar: 'bg-error',
    card: 'border-error/40 bg-error-container/40',
    icon: 'warning',
  },
  Low: {
    badge: 'bg-workload-low text-on-surface',
    bar: 'bg-secondary',
    card: 'border-secondary/30 bg-workload-low/70',
    icon: 'check_circle',
  },
  Medium: {
    badge: 'bg-workload-mod text-on-surface',
    bar: 'bg-primary-container',
    card: 'border-primary-container bg-workload-mod/70',
    icon: 'error',
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
});

const SCORE_COMPONENTS = [
  { key: 'meetingCountRisk', label: 'Meeting volume', max: 25, type: 'risk' },
  { key: 'meetingHoursRisk', label: 'Meeting hours', max: 25, type: 'risk' },
  { key: 'dailyDensityRisk', label: 'Daily density', max: 15, type: 'risk' },
  { key: 'boundaryRisk', label: 'Boundary meetings', max: 15, type: 'risk' },
  { key: 'consecutiveRisk', label: 'Long meeting blocks', max: 15, type: 'risk' },
  { key: 'focusRecoveryCredit', label: 'Focus recovery credit', max: 10, type: 'credit' },
];

function getAnalysisFetchRange(referenceDate) {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return { end, start };
}

function formatDateRange(window) {
  return `${DATE_FORMATTER.format(window.start)} - ${DATE_FORMATTER.format(window.end)}`;
}

function formatHours(value) {
  return `${value.toFixed(1)}h`;
}

function getMetricCards(metrics) {
  return [
    {
      icon: 'event',
      label: 'Total meetings',
      value: metrics.totalMeetings,
    },
    {
      icon: 'schedule',
      label: 'Meeting hours',
      value: formatHours(metrics.totalMeetingHours),
    },
    {
      icon: 'calendar_view_week',
      label: 'Avg meetings/day',
      value: metrics.averageMeetingsPerDay.toFixed(1),
    },
    {
      icon: 'wb_twilight',
      label: 'Before 8 AM',
      value: metrics.meetingsBefore8AM,
    },
    {
      icon: 'nights_stay',
      label: 'After 6 PM',
      value: metrics.meetingsAfter6PM,
    },
    {
      icon: 'weekend',
      label: 'Weekend meetings',
      value: metrics.weekendMeetings,
    },
    {
      icon: 'link',
      label: 'Longest block',
      value: formatHours(metrics.longestConsecutiveMeetingBlock),
    },
    {
      icon: 'battery_charging_full',
      label: 'Focus blocks',
      value: metrics.focusBlocksLongerThan2Hours,
    },
  ];
}

function StatePanel({ action, children, icon, title }) {
  return (
    <div className="bg-surface-container-lowest border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center">
      <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
        <MaterialIcon name={icon} filled />
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-on-surface-variant mt-1">{children}</p>
      </div>
      {action}
    </div>
  );
}

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const referenceDate = useMemo(() => new Date(), []);
  const [connection, setConnection] = useState(() => getGoogleCalendarConnection(userId));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analysis = useMemo(() => analyzeBurnoutRisk(events, referenceDate), [events, referenceDate]);
  const scoreStyle = SCORE_STYLES[analysis.riskLevel];
  const metricCards = useMemo(() => getMetricCards(analysis.metrics), [analysis.metrics]);
  const rangeLabel = formatDateRange(analysis.window);

  const loadInsights = useCallback(async () => {
    const nextConnection = getGoogleCalendarConnection(userId);
    setConnection(nextConnection);

    if (!userId || !nextConnection.connected) {
      setEvents([]);
      setError('');
      setLoading(false);
      return;
    }

    const { end, start } = getAnalysisFetchRange(referenceDate);

    setLoading(true);
    setError('');

    try {
      const calendarEvents = await fetchCalendarEventsForRange(userId, {
        timeMax: end.toISOString(),
        timeMin: start.toISOString(),
      });
      setEvents(calendarEvents);
      setConnection(getGoogleCalendarConnection(userId));
    } catch (err) {
      setEvents([]);
      setError(err.message ?? 'Unable to load Google Calendar events.');
      setConnection(getGoogleCalendarConnection(userId));
    } finally {
      setLoading(false);
    }
  }, [referenceDate, userId]);

  useEffect(() => {
    let active = true;

    async function load() {
      const nextConnection = getGoogleCalendarConnection(userId);
      if (active) {
        setConnection(nextConnection);
      }

      if (!userId || !nextConnection.connected) {
        if (active) {
          setEvents([]);
          setError('');
          setLoading(false);
        }
        return;
      }

      const { end, start } = getAnalysisFetchRange(referenceDate);

      if (active) {
        setLoading(true);
        setError('');
      }

      try {
        const calendarEvents = await fetchCalendarEventsForRange(userId, {
          timeMax: end.toISOString(),
          timeMin: start.toISOString(),
        });

        if (active) {
          setEvents(calendarEvents);
          setConnection(getGoogleCalendarConnection(userId));
        }
      } catch (err) {
        if (active) {
          setEvents([]);
          setError(err.message ?? 'Unable to load Google Calendar events.');
          setConnection(getGoogleCalendarConnection(userId));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [referenceDate, userId]);

  const connectAction = (
    <button
      type="button"
      onClick={() => navigate('/profile')}
      className="squish-click bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-xs font-bold uppercase w-max"
    >
      Open profile
    </button>
  );

  const retryAction = (
    <button
      type="button"
      onClick={loadInsights}
      disabled={loading}
      className="squish-click bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-xs font-bold uppercase w-max disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Retry
    </button>
  );

  return (
    <AppLayout
      active="explore"
      wrapperClassName="bg-background text-on-background min-h-screen flex flex-col pb-24 md:pb-0"
      mainClassName="flex-grow w-full max-w-[1040px] mx-auto px-container-margin pt-24 py-md flex flex-col gap-lg md:pl-28"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">Calendar burnout analysis</p>
          <h1 className="text-3xl md:text-4xl font-bold">Insights & Patterns</h1>
          <p className="text-on-surface-variant">A transparent read on meeting load from {rangeLabel}.</p>
        </div>
        {connection.connected && (
          <button
            type="button"
            onClick={loadInsights}
            disabled={loading}
            className="squish-click border border-outline-variant bg-surface-container-lowest px-4 py-2 rounded-full text-xs font-bold uppercase w-max disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>

      {loading && (
        <StatePanel icon="sync" title="Loading calendar insights">
          Checking your Google Calendar meetings for the current 14-day window.
        </StatePanel>
      )}

      {!loading && !connection.connected && (
        <StatePanel
          action={connectAction}
          icon={connection.expired ? 'event_busy' : 'calendar_today'}
          title={connection.expired ? 'Google Calendar connection expired' : 'Connect Google Calendar'}
        >
          {connection.expired
            ? 'Reconnect Google Calendar from your profile to refresh your burnout insights.'
            : 'Connect Google Calendar from your profile to generate meeting-based insights.'}
        </StatePanel>
      )}

      {!loading && error && connection.connected && (
        <StatePanel action={retryAction} icon="error" title="Unable to load insights">
          {error}
        </StatePanel>
      )}

      {!loading && !error && connection.connected && analysis.metrics.totalMeetings === 0 && (
        <StatePanel action={retryAction} icon="free_cancellation" title="No timed calendar events found">
          Your connected calendar has no timed meetings in this analysis window. All-day events are ignored for burnout scoring.
        </StatePanel>
      )}

      {!loading && !error && connection.connected && analysis.metrics.totalMeetings > 0 && (
        <>
          <section className={`border rounded-xl p-6 shadow-sm ${scoreStyle.card}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shrink-0">
                  <MaterialIcon name={scoreStyle.icon} filled />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Burnout score</p>
                  <div className="flex items-end gap-3 mt-2">
                    <span className="text-5xl font-bold leading-none">{analysis.burnoutScore}</span>
                    <span className="text-lg font-bold text-on-surface-variant mb-1">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="md:w-[320px]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${scoreStyle.badge}`}>
                    {analysis.riskLevel} risk
                  </span>
                  <span className="text-xs text-on-surface-variant">{rangeLabel}</span>
                </div>
                <div className="h-3 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className={`h-full rounded-full ${scoreStyle.bar}`}
                    style={{ width: `${analysis.burnoutScore}%` }}
                  />
                </div>
                <p className="text-sm text-on-surface-variant mt-3">
                  Score combines meeting volume, density, boundaries, long blocks, and focus recovery.
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metricCards.map((metric) => (
              <div key={metric.label} className="bg-surface-container-lowest border rounded-xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                  <MaterialIcon name={metric.icon} />
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-on-surface-variant mt-1">{metric.label}</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                  <MaterialIcon name="priority_high" filled />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Contributing factors</h2>
                  <p className="text-sm text-on-surface-variant">What moved the score most.</p>
                </div>
              </div>

              {analysis.contributingFactors.length === 0 ? (
                <p className="text-sm text-on-surface-variant bg-surface-container-low rounded-xl p-4">
                  No meaningful risk factors were detected in this window.
                </p>
              ) : (
                <div className="space-y-3">
                  {analysis.contributingFactors.map((factor) => (
                    <div key={factor.label} className="flex items-start justify-between gap-4 border-b border-outline-variant pb-3 last:border-b-0 last:pb-0">
                      <div>
                        <p className="font-bold">{factor.label}</p>
                        <p className="text-sm text-on-surface-variant mt-1">{factor.detail}</p>
                      </div>
                      <span className={`text-sm font-bold ${factor.points < 0 ? 'text-secondary' : 'text-error'}`}>
                        {factor.points < 0 ? '' : '+'}
                        {factor.points.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface-container-lowest border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <MaterialIcon name="monitoring" filled />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Scoring breakdown</h2>
                  <p className="text-sm text-on-surface-variant">Risk points before the final 0-100 clamp.</p>
                </div>
              </div>

              <div className="space-y-4">
                {SCORE_COMPONENTS.map((component) => {
                  const points = analysis.components[component.key];
                  const width = component.max > 0 ? Math.min(100, (points / component.max) * 100) : 0;

                  return (
                    <div key={component.key}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-bold">{component.label}</span>
                        <span className="text-sm text-on-surface-variant">
                          {component.type === 'credit' ? '-' : '+'}
                          {points.toFixed(1)} / {component.max}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className={`h-full rounded-full ${component.type === 'credit' ? 'bg-secondary' : 'bg-primary-container'}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </AppLayout>
  );
}
