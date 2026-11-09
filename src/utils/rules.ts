import { Language, StudyEvent } from '../types/index.ts';

/**
 * Calculates level and progress towards the next level from total XP.
 * Formula: Each level requires `baseXP * (1.35 ^ (level - 1))`
 */
export function calculateLevel(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let xpThreshold = 0;
  let nextThreshold = 100;

  while (safeXp >= nextThreshold && level < 99) {
    level++;
    xpThreshold = nextThreshold;
    nextThreshold = Math.round(xpThreshold + 100 * Math.pow(1.3, level - 1));
  }

  const currentLevelXp = safeXp - xpThreshold;
  const xpNeededForThisLevel = nextThreshold - xpThreshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentLevelXp / xpNeededForThisLevel) * 100))
  );

  return {
    level,
    currentLevelXp,
    nextLevelXp: xpNeededForThisLevel,
    progressPercent,
  };
}

/**
 * Calculates the daily progress percentage capped between 0 and 100.
 */
export function calculateDailyProgress(completedXp: number, targetXp: number): number {
  if (targetXp <= 0) return 0;
  const ratio = (completedXp / targetXp) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}

/**
 * Formats duration in minutes into a human-friendly string.
 */
export function formatDuration(minutes: number, lang: Language = 'pt-BR'): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (hours > 0 && remainingMins > 0) {
    return lang === 'pt-BR'
      ? `${hours}h ${remainingMins}min`
      : `${hours}h ${remainingMins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return lang === 'pt-BR' ? `${remainingMins} min` : `${remainingMins} min`;
}

/**
 * Formats minutes into HH:MMh notation (e.g., 105 mins -> "01:45h")
 */
export function formatMinutesToClockHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const paddedHours = String(hours).padStart(2, '0');
  const paddedMins = String(mins).padStart(2, '0');
  return `${paddedHours}:${paddedMins}h`;
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a localized Date object
 */
export function parseIsoDate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the 7 days of the week (Monday through Sunday) containing the given reference date.
 */
export interface WeekDayInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayName: string;
  dayShort: string;
  dayNumber: number;
  isToday: boolean;
}

export function getWeekDays(referenceDate: Date, lang: Language = 'pt-BR'): WeekDayInfo[] {
  const current = new Date(referenceDate);
  const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday
  // In pt-BR/ISO week, Monday is first day. Distance to Monday:
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const todayIso = formatDateToIso(new Date());
  const ptDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const ptShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const enDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const enShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateString = formatDateToIso(d);
    days.push({
      date: d,
      dateString,
      dayName: lang === 'pt-BR' ? ptDays[i] : enDays[i],
      dayShort: lang === 'pt-BR' ? ptShort[i] : enShort[i],
      dayNumber: d.getDate(),
      isToday: dateString === todayIso,
    });
  }

  return days;
}

/**
 * Generates calendar grid cells for a given year and month (including leading and trailing days)
 */
export interface CalendarCell {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthCalendarGrid(year: number, monthIndex: number): CalendarCell[] {
  const todayIso = formatDateToIso(new Date());
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  // Day of week for 1st day (0 = Sunday, 1 = Monday...)
  const startDayOfWeek = firstDayOfMonth.getDay();
  // We start calendar with Sunday (0) or Monday (1). Standard calendar starts with Sunday.
  const leadingDaysCount = startDayOfWeek;

  const cells: CalendarCell[] = [];

  // Previous month trailing days
  for (let i = leadingDaysCount - 1; i >= 0; i--) {
    const d = new Date(year, monthIndex, -i);
    const dateString = formatDateToIso(d);
    cells.push({
      date: d,
      dateString,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateString === todayIso,
    });
  }

  // Current month days
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, monthIndex, day);
    const dateString = formatDateToIso(d);
    cells.push({
      date: d,
      dateString,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateString === todayIso,
    });
  }

  // Next month leading days to complete full weeks (multiples of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, monthIndex + 1, i);
    const dateString = formatDateToIso(d);
    cells.push({
      date: d,
      dateString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateString === todayIso,
    });
  }

  return cells;
}

/**
 * Filters and sorts study events by day and start time.
 */
export function getEventsForDay(events: StudyEvent[], dateString: string): StudyEvent[] {
  return events
    .filter((event) => event.date === dateString)
    .sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime) return -1;
      if (b.startTime) return 1;
      return a.title.localeCompare(b.title);
    });
}
