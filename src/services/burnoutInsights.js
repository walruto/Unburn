const WORKDAY_START_HOUR = 8;
const WORKDAY_END_HOUR = 18;
const FOCUS_BLOCK_THRESHOLD_HOURS = 2;
const LONG_AVAILABILITY_BLOCK_HOURS = 12;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getValidDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDurationHours(start, end) {
  return (end.getTime() - start.getTime()) / (60 * 60 * 1000);
}

function isRecurringEvent(event) {
  return Boolean(event.recurringEventId || event.recurrence?.length);
}

function isGoogleNonMeetingBlock(event) {
  return (
    event.eventType === 'workingLocation' ||
    event.eventType === 'outOfOffice' ||
    event.eventType === 'focusTime' ||
    Boolean(event.workingLocationProperties || event.outOfOfficeProperties || event.focusTimeProperties)
  );
}

function isLikelyAvailabilityBlock(event, durationHours) {
  const attendeeCount = event.attendeeCount ?? 0;

  return (
    durationHours > LONG_AVAILABILITY_BLOCK_HOURS &&
    attendeeCount === 0 &&
    event.creatorSelf === true &&
    event.organizerSelf === true &&
    isRecurringEvent(event)
  );
}

function getDayBounds(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), WORKDAY_START_HOUR, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), WORKDAY_END_HOUR, 0, 0, 0);
  return { end, start };
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getAnalysisWindow(referenceDate) {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(referenceDate);
  end.setDate(end.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  return { end, start };
}

function normalizeEvent(event) {
  const start = getValidDate(event.start);
  const end = getValidDate(event.end);

  if (!start || !end || end <= start || event.isAllDay) {
    return null;
  }

  const durationHours = getDurationHours(start, end);

  if (isGoogleNonMeetingBlock(event) || isLikelyAvailabilityBlock(event, durationHours)) {
    return null;
  }

  return {
    end,
    id: event.id,
    htmlLink: event.htmlLink,
    location: event.location,
    start,
    summary: event.summary || 'Untitled event',
  };
}

function mergeMeetingBlocks(events) {
  if (events.length === 0) return [];

  const sorted = [...events].sort((first, second) => first.start.getTime() - second.start.getTime());
  const merged = [{ start: new Date(sorted[0].start), end: new Date(sorted[0].end) }];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const last = merged[merged.length - 1];

    if (current.start.getTime() <= last.end.getTime()) {
      if (current.end.getTime() > last.end.getTime()) {
        last.end = new Date(current.end);
      }
      continue;
    }

    merged.push({ start: new Date(current.start), end: new Date(current.end) });
  }

  return merged;
}

function buildDailyFocusBlocks(meetings) {
  const blocks = [];
  const meetingsByDay = new Map();

  meetings.forEach((meeting) => {
    const key = getLocalDateKey(meeting.start);
    const dayMeetings = meetingsByDay.get(key) ?? [];
    dayMeetings.push(meeting);
    meetingsByDay.set(key, dayMeetings);
  });

  meetingsByDay.forEach((dayMeetings) => {
    const sorted = [...dayMeetings].sort((first, second) => first.start.getTime() - second.start.getTime());
    if (sorted.length === 0) return;

    const dayStart = getDayBounds(sorted[0].start).start;
    const dayEnd = getDayBounds(sorted[0].start).end;
    let cursor = dayStart;

    sorted.forEach((meeting) => {
      const gapStart = Math.max(cursor.getTime(), dayStart.getTime());
      const gapEnd = Math.min(meeting.start.getTime(), dayEnd.getTime());

      if (gapEnd > gapStart) {
        const durationHours = (gapEnd - gapStart) / (60 * 60 * 1000);
        if (durationHours > FOCUS_BLOCK_THRESHOLD_HOURS) {
          blocks.push({ durationHours, start: new Date(gapStart), end: new Date(gapEnd) });
        }
      }

      if (meeting.end.getTime() > cursor.getTime()) {
        cursor = new Date(meeting.end);
      }
    });

    const tailStart = Math.max(cursor.getTime(), dayStart.getTime());
    const tailEnd = dayEnd.getTime();

    if (tailEnd > tailStart) {
      const durationHours = (tailEnd - tailStart) / (60 * 60 * 1000);
      if (durationHours > FOCUS_BLOCK_THRESHOLD_HOURS) {
        blocks.push({ durationHours, start: new Date(tailStart), end: new Date(tailEnd) });
      }
    }
  });

  return blocks;
}

function getRiskLevel(score) {
  if (score >= 70) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

function buildContributingFactors({ components, metrics }) {
  const factors = [];

  if (components.meetingCountRisk > 0) {
    factors.push({
      label: 'Meeting volume',
      points: components.meetingCountRisk,
      detail: `${metrics.totalMeetings} meetings across 14 days`,
    });
  }

  if (components.meetingHoursRisk > 0) {
    factors.push({
      label: 'Meeting hours',
      points: components.meetingHoursRisk,
      detail: `${metrics.totalMeetingHours.toFixed(1)} total hours`,
    });
  }

  if (components.dailyDensityRisk > 0) {
    factors.push({
      label: 'Daily density',
      points: components.dailyDensityRisk,
      detail: `${metrics.averageMeetingsPerDay.toFixed(1)} meetings per day`,
    });
  }

  if (components.boundaryRisk > 0) {
    const parts = [];
    if (metrics.meetingsBefore8AM > 0) parts.push(`${metrics.meetingsBefore8AM} before 8 AM`);
    if (metrics.meetingsAfter6PM > 0) parts.push(`${metrics.meetingsAfter6PM} after 6 PM`);
    if (metrics.weekendMeetings > 0) parts.push(`${metrics.weekendMeetings} on weekends`);

    factors.push({
      label: 'Boundary meetings',
      points: components.boundaryRisk,
      detail: parts.join(', '),
    });
  }

  if (components.consecutiveRisk > 0) {
    factors.push({
      label: 'Long meeting blocks',
      points: components.consecutiveRisk,
      detail: `${metrics.longestConsecutiveMeetingBlock.toFixed(1)} hour continuous block`,
    });
  }

  if (components.focusRecoveryCredit > 0) {
    factors.push({
      label: 'Focus recovery',
      points: -components.focusRecoveryCredit,
      detail: `${metrics.focusBlocksLongerThan2Hours} focus blocks longer than 2 hours`,
    });
  }

  return factors;
}

export function analyzeBurnoutRisk(events, referenceDate = new Date()) {
  const window = getAnalysisWindow(referenceDate);
  const normalizedEvents = events.map(normalizeEvent).filter(Boolean);
  const relevantEvents = normalizedEvents.filter((event) => event.end > window.start && event.start < window.end);

  const meetings = relevantEvents.map((event) => ({
    ...event,
    start: new Date(Math.max(event.start.getTime(), window.start.getTime())),
    end: new Date(Math.min(event.end.getTime(), window.end.getTime())),
  }));

  const totalMeetings = meetings.length;
  const totalMeetingHours = meetings.reduce((sum, meeting) => sum + (meeting.end.getTime() - meeting.start.getTime()) / (60 * 60 * 1000), 0);
  const averageMeetingsPerDay = totalMeetings / 14;
  const meetingsBefore8AM = meetings.filter((meeting) => meeting.start.getHours() < WORKDAY_START_HOUR).length;
  const meetingsAfter6PM = meetings.filter((meeting) => meeting.end.getHours() >= WORKDAY_END_HOUR).length;
  const weekendMeetings = meetings.filter((meeting) => isWeekend(meeting.start)).length;
  const mergedMeetingBlocks = mergeMeetingBlocks(meetings);
  const longestConsecutiveMeetingBlock = mergedMeetingBlocks.reduce((max, meeting) => {
    const durationHours = (meeting.end.getTime() - meeting.start.getTime()) / (60 * 60 * 1000);
    return Math.max(max, durationHours);
  }, 0);
  const focusBlocks = buildDailyFocusBlocks(meetings);
  const focusBlocksLongerThan2Hours = focusBlocks.length;

  const components = {
    boundaryRisk: clamp(meetingsBefore8AM * 3 + meetingsAfter6PM * 3 + weekendMeetings * 4, 0, 15),
    consecutiveRisk: clamp((longestConsecutiveMeetingBlock - 2) * 7.5, 0, 15),
    dailyDensityRisk: clamp((averageMeetingsPerDay - 3) * 5, 0, 15),
    focusRecoveryCredit: clamp(focusBlocksLongerThan2Hours * 2, 0, 10),
    meetingCountRisk: clamp((totalMeetings - 20) * 1.25, 0, 25),
    meetingHoursRisk: clamp((totalMeetingHours - 25) * 1.67, 0, 25),
  };

  const burnoutScore = clamp(
    Math.round(
      components.meetingCountRisk +
        components.meetingHoursRisk +
        components.dailyDensityRisk +
        components.boundaryRisk +
        components.consecutiveRisk -
        components.focusRecoveryCredit,
    ),
    0,
    100,
  );

  return {
    burnoutScore,
    components,
    contributingFactors: buildContributingFactors({
      components,
      metrics: {
        averageMeetingsPerDay,
        focusBlocksLongerThan2Hours,
        longestConsecutiveMeetingBlock,
        meetingsAfter6PM,
        meetingsBefore8AM,
        totalMeetingHours,
        totalMeetings,
        weekendMeetings,
      },
    }),
    metrics: {
      averageMeetingsPerDay,
      focusBlocksLongerThan2Hours,
      longestConsecutiveMeetingBlock,
      meetingsAfter6PM,
      meetingsBefore8AM,
      totalMeetingHours,
      totalMeetings,
      weekendMeetings,
    },
    riskLevel: getRiskLevel(burnoutScore),
    window,
  };
}
