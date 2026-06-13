import { describe, expect, it } from 'vitest';
import { analyzeBurnoutRisk } from './burnoutInsights';

const REFERENCE_DATE = new Date(2026, 5, 13, 12);

function event(id, start, end, options = {}) {
  return {
    id,
    end,
    isAllDay: false,
    start,
    summary: id,
    ...options,
  };
}

function localDateTime(day, hour, minute = 0) {
  return new Date(2026, 5, day, hour, minute).toISOString();
}

function repeatedEvents({ count, day, endHour, idPrefix, startHour }) {
  return Array.from({ length: count }, (_, index) =>
    event(`${idPrefix}-${index}`, localDateTime(day, startHour), localDateTime(day, endHour)),
  );
}

describe('analyzeBurnoutRisk', () => {
  it('returns low-risk empty metrics for an empty event list', () => {
    const analysis = analyzeBurnoutRisk([], REFERENCE_DATE);

    expect(analysis.burnoutScore).toBe(0);
    expect(analysis.riskLevel).toBe('Low');
    expect(analysis.metrics).toEqual({
      averageMeetingsPerDay: 0,
      focusBlocksLongerThan2Hours: 0,
      longestConsecutiveMeetingBlock: 0,
      meetingsAfter6PM: 0,
      meetingsBefore8AM: 0,
      totalMeetingHours: 0,
      totalMeetings: 0,
      weekendMeetings: 0,
    });
    expect(analysis.contributingFactors).toEqual([]);
  });

  it('counts timed meetings and meeting hours while ignoring invalid, all-day, and out-of-window events', () => {
    const analysis = analyzeBurnoutRisk(
      [
        event('one-hour', localDateTime(10, 9), localDateTime(10, 10)),
        event('ninety-minutes', localDateTime(11, 13), localDateTime(11, 14, 30)),
        event('all-day', '2026-06-12', '2026-06-13', { isAllDay: true }),
        event('outside-window', localDateTime(1, 9), localDateTime(1, 10)),
        event('invalid', localDateTime(12, 10), localDateTime(12, 9)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.metrics.totalMeetings).toBe(2);
    expect(analysis.metrics.totalMeetingHours).toBe(2.5);
    expect(analysis.metrics.averageMeetingsPerDay).toBeCloseTo(2 / 14);
  });

  it('detects early, late, and weekend meetings', () => {
    const analysis = analyzeBurnoutRisk(
      [
        event('early', localDateTime(9, 7), localDateTime(9, 8)),
        event('late', localDateTime(10, 17), localDateTime(10, 18)),
        event('weekend', localDateTime(13, 10), localDateTime(13, 11)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.metrics.meetingsBefore8AM).toBe(1);
    expect(analysis.metrics.meetingsAfter6PM).toBe(1);
    expect(analysis.metrics.weekendMeetings).toBe(1);
  });

  it('merges overlapping and back-to-back meetings for the longest consecutive block', () => {
    const analysis = analyzeBurnoutRisk(
      [
        event('first', localDateTime(10, 9), localDateTime(10, 10)),
        event('second', localDateTime(10, 10), localDateTime(10, 11)),
        event('overlap', localDateTime(10, 10, 30), localDateTime(10, 12)),
        event('separate', localDateTime(10, 14), localDateTime(10, 15)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.metrics.longestConsecutiveMeetingBlock).toBe(3);
  });

  it('counts focus blocks longer than two hours and excludes exactly two-hour gaps', () => {
    const analysis = analyzeBurnoutRisk(
      [
        event('morning', localDateTime(10, 8), localDateTime(10, 10)),
        event('midday', localDateTime(10, 12), localDateTime(10, 13)),
        event('afternoon', localDateTime(10, 15, 30), localDateTime(10, 16)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.metrics.focusBlocksLongerThan2Hours).toBe(1);
  });

  it('calculates score components and the rounded burnout score', () => {
    const analysis = analyzeBurnoutRisk(
      [
        ...repeatedEvents({ count: 21, day: 10, endHour: 10, idPrefix: 'volume', startHour: 9 }),
        event('early', localDateTime(9, 7), localDateTime(9, 8)),
        event('late', localDateTime(9, 18), localDateTime(9, 19)),
        event('weekend', localDateTime(13, 10), localDateTime(13, 11)),
        event('block-one', localDateTime(11, 9), localDateTime(11, 10)),
        event('block-two', localDateTime(11, 10), localDateTime(11, 11)),
        event('block-three', localDateTime(11, 11), localDateTime(11, 12)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.metrics.totalMeetings).toBe(27);
    expect(analysis.metrics.totalMeetingHours).toBe(27);
    expect(analysis.metrics.longestConsecutiveMeetingBlock).toBe(3);
    expect(analysis.metrics.focusBlocksLongerThan2Hours).toBe(4);
    expect(analysis.components).toEqual({
      boundaryRisk: 10,
      consecutiveRisk: 7.5,
      dailyDensityRisk: 0,
      focusRecoveryCredit: 8,
      meetingCountRisk: 8.75,
      meetingHoursRisk: 3.34,
    });
    expect(analysis.burnoutScore).toBe(22);
    expect(analysis.riskLevel).toBe('Low');
  });

  it('classifies risk levels at low, medium, and high thresholds', () => {
    const low = analyzeBurnoutRisk([], REFERENCE_DATE);
    const medium = analyzeBurnoutRisk(
      repeatedEvents({ count: 50, day: 10, endHour: 10, idPrefix: 'medium', startHour: 9 }),
      REFERENCE_DATE,
    );
    const high = analyzeBurnoutRisk(
      repeatedEvents({ count: 50, day: 13, endHour: 19, idPrefix: 'high', startHour: 7 }),
      REFERENCE_DATE,
    );

    expect(low.riskLevel).toBe('Low');
    expect(low.burnoutScore).toBeLessThan(35);
    expect(medium.riskLevel).toBe('Medium');
    expect(medium.burnoutScore).toBeGreaterThanOrEqual(35);
    expect(medium.burnoutScore).toBeLessThan(70);
    expect(high.riskLevel).toBe('High');
    expect(high.burnoutScore).toBeGreaterThanOrEqual(70);
  });

  it('generates contributing factors with positive risk points and negative recovery credit', () => {
    const analysis = analyzeBurnoutRisk(
      [
        ...repeatedEvents({ count: 50, day: 13, endHour: 19, idPrefix: 'risk', startHour: 7 }),
        event('focus-day', localDateTime(10, 9), localDateTime(10, 10)),
      ],
      REFERENCE_DATE,
    );

    expect(analysis.contributingFactors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Meeting volume', points: 25 }),
        expect.objectContaining({ label: 'Meeting hours', points: 25 }),
        expect.objectContaining({ label: 'Daily density' }),
        expect.objectContaining({ detail: '50 before 8 AM, 50 after 6 PM, 50 on weekends', label: 'Boundary meetings', points: 15 }),
        expect.objectContaining({ label: 'Long meeting blocks', points: 15 }),
        expect.objectContaining({ label: 'Focus recovery', points: -2 }),
      ]),
    );
  });
});
