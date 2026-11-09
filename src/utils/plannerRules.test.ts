import assert from 'node:assert/strict';
import test from 'node:test';
import {
  convertPlanItemsToEvents,
  generateHeuristicPlan,
  getWeekDatesMap,
  sanitizePlanItems,
} from './plannerRules.ts';

test('getWeekDatesMap returns valid dates for all 7 days', () => {
  const dates = getWeekDatesMap(new Date('2025-05-12T10:00:00Z'));
  assert.ok(dates.monday);
  assert.ok(dates.tuesday);
  assert.ok(dates.wednesday);
  assert.ok(dates.thursday);
  assert.ok(dates.friday);
  assert.ok(dates.saturday);
  assert.ok(dates.sunday);
  assert.match(dates.monday, /^\d{4}-\d{2}-\d{2}$/);
});

test('sanitizePlanItems sanitizes and bounds durations and times', () => {
  const dates = getWeekDatesMap();
  const raw = [
    {
      dayKey: 'friday',
      startTime: '14:30',
      subjectId: 'tech',
      topic: 'Estruturas de Dados',
      durationMinutes: 60,
      objective: 'Implementar fila e pilha',
    },
    {
      dayKey: 'invalid-day',
      startTime: '99:99',
      subjectId: 'unknown',
      topic: '',
      durationMinutes: 9999,
      objective: '',
    },
  ];

  const sanitized = sanitizePlanItems(raw, dates);
  assert.equal(sanitized.length, 2);
  assert.equal(sanitized[0].dayKey, 'friday');
  assert.equal(sanitized[0].subjectId, 'tech');
  assert.equal(sanitized[0].durationMinutes, 60);

  // Fallbacks for invalid inputs:
  assert.equal(sanitized[1].dayKey, 'monday');
  assert.equal(sanitized[1].startTime, '09:00');
  assert.equal(sanitized[1].subjectId, 'general');
  assert.equal(sanitized[1].durationMinutes, 180); // clamped to max 180
});

test('generateHeuristicPlan generates balanced sessions respecting days and hours', () => {
  const dates = getWeekDatesMap();
  const plan = generateHeuristicPlan(
    {
      userPrompt: 'prova de redes na quinta e listening em inglês',
      hoursPerDay: 2,
      selectedDays: ['monday', 'tuesday', 'thursday'],
      priorities: { tech: 5, english: 4, general: 2 },
      studiedTopics: ['Funções de 1º e 2º Grau e Vértice da Parábola'],
    },
    dates
  );

  assert.ok(plan.length >= 3);
  // Ensure network topic was caught from prompt
  const hasTech = plan.some((item) => item.subjectId === 'tech');
  const hasEnglish = plan.some((item) => item.subjectId === 'english');
  assert.equal(hasTech, true);
  assert.equal(hasEnglish, true);

  // Ensure studied topic was excluded from general knowledge
  const repeated = plan.some(
    (item) => item.topic === 'Funções de 1º e 2º Grau e Vértice da Parábola'
  );
  assert.equal(repeated, false);
});

test('convertPlanItemsToEvents produces complete StudyEvents with XP and pending status', () => {
  const dates = getWeekDatesMap();
  const items = [
    {
      dayKey: 'monday' as const,
      date: dates.monday,
      startTime: '10:00',
      subjectId: 'general' as const,
      discipline: 'Física',
      topic: 'Leis de Newton',
      durationMinutes: 60,
      objective: 'Exercícios 1 a 10',
    },
  ];

  const events = convertPlanItemsToEvents(items);
  assert.equal(events.length, 1);
  assert.equal(events[0].title, 'Física: Leis de Newton');
  assert.equal(events[0].subjectId, 'general');
  assert.equal(events[0].status, 'pending');
  assert.equal(events[0].xpReward, 45); // 60 * 0.75
});
