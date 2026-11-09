import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevel,
  calculateDailyProgress,
  formatDuration,
  formatMinutesToClockHours,
  formatDateToIso,
  getWeekDays,
  getMonthCalendarGrid,
  getEventsForDay,
} from './rules.ts';
import { StudyEvent } from '../types/index.ts';

test('calculateLevel properly calculates levels and progress', () => {
  const lvl1 = calculateLevel(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.currentLevelXp, 0);
  assert.equal(lvl1.progressPercent, 0);

  const lvl1Mid = calculateLevel(50);
  assert.equal(lvl1Mid.level, 1);
  assert.equal(lvl1Mid.currentLevelXp, 50);
  assert.equal(lvl1Mid.progressPercent, 50);

  const lvl2 = calculateLevel(100);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentLevelXp, 0);

  const lvlHigher = calculateLevel(350);
  assert.ok(lvlHigher.level >= 3);
  assert.ok(lvlHigher.progressPercent >= 0 && lvlHigher.progressPercent <= 100);
});

test('calculateDailyProgress correctly calculates percentage and caps at 100%', () => {
  assert.equal(calculateDailyProgress(0, 80), 0);
  assert.equal(calculateDailyProgress(40, 80), 50);
  assert.equal(calculateDailyProgress(80, 80), 100);
  assert.equal(calculateDailyProgress(120, 80), 100);
  assert.equal(calculateDailyProgress(50, 0), 0);
});

test('formatDuration formats minutes accurately', () => {
  assert.equal(formatDuration(45, 'pt-BR'), '45 min');
  assert.equal(formatDuration(60, 'pt-BR'), '1h');
  assert.equal(formatDuration(90, 'pt-BR'), '1h 30min');
  assert.equal(formatDuration(90, 'en-US'), '1h 30m');
});

test('formatMinutesToClockHours outputs HH:MMh format', () => {
  assert.equal(formatMinutesToClockHours(0), '00:00h');
  assert.equal(formatMinutesToClockHours(105), '01:45h');
  assert.equal(formatMinutesToClockHours(300), '05:00h');
});

test('formatDateToIso formats dates to YYYY-MM-DD', () => {
  const d = new Date(2026, 10, 9); // Month 10 is Nov (0-indexed)
  assert.equal(formatDateToIso(d), '2026-11-09');
});

test('getWeekDays returns 7 consecutive days starting on Monday', () => {
  const reference = new Date(2026, 10, 9); // Nov 9, 2026 is Monday
  const week = getWeekDays(reference, 'pt-BR');
  assert.equal(week.length, 7);
  assert.equal(week[0].dayName, 'Segunda');
  assert.equal(week[6].dayName, 'Domingo');
  assert.equal(week[0].dateString, '2026-11-09');
});

test('getMonthCalendarGrid returns full grid of cells matching 7-column calendar', () => {
  const cells = getMonthCalendarGrid(2026, 10); // Nov 2026
  assert.ok(cells.length >= 28);
  assert.equal(cells.length % 7, 0);
  const currentMonthDays = cells.filter((c) => c.isCurrentMonth);
  assert.equal(currentMonthDays.length, 30); // November has 30 days
});

test('getEventsForDay sorts events chronologically', () => {
  const mockEvents: StudyEvent[] = [
    {
      id: '1',
      title: 'Tópico B',
      subjectId: 'tech',
      topic: 'React Hooks',
      date: '2026-11-09',
      startTime: '14:00',
      durationMinutes: 45,
      status: 'pending',
      xpReward: 25,
    },
    {
      id: '2',
      title: 'Tópico A',
      subjectId: 'english',
      topic: 'Phrasal Verbs',
      date: '2026-11-09',
      startTime: '09:00',
      durationMinutes: 30,
      status: 'completed',
      xpReward: 20,
    },
    {
      id: '3',
      title: 'Outro dia',
      subjectId: 'general',
      topic: 'Termodinâmica',
      date: '2026-11-10',
      startTime: '10:00',
      durationMinutes: 60,
      status: 'pending',
      xpReward: 30,
    },
  ];

  const todayEvents = getEventsForDay(mockEvents, '2026-11-09');
  assert.equal(todayEvents.length, 2);
  assert.equal(todayEvents[0].id, '2'); // 09:00 before 14:00
  assert.equal(todayEvents[1].id, '1');
});
