import { describe, expect, it } from 'vitest';
import { normalizeCalendarEvent } from './googleCalendar';

describe('normalizeCalendarEvent', () => {
  it('preserves metadata needed to classify calendar blocks before analytics', () => {
    const normalized = normalizeCalendarEvent({
      attendees: [{ email: 'teammate@example.com' }],
      creator: { self: true },
      end: { dateTime: '2026-06-15T18:30:00Z' },
      eventType: 'default',
      focusTimeProperties: null,
      htmlLink: 'https://calendar.google.com/event',
      id: 'work-1',
      location: 'Remote',
      organizer: { self: true },
      outOfOfficeProperties: null,
      recurrence: ['RRULE:FREQ=DAILY'],
      recurringEventId: 'work-master',
      start: { dateTime: '2026-06-14T18:00:00Z' },
      summary: 'Work',
      transparency: 'opaque',
      workingLocationProperties: null,
    });

    expect(normalized).toMatchObject({
      attendeeCount: 1,
      creatorSelf: true,
      eventType: 'default',
      organizerSelf: true,
      recurrence: ['RRULE:FREQ=DAILY'],
      recurringEventId: 'work-master',
      transparency: 'opaque',
    });
  });
});
