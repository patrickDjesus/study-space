import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import {
  getMonthCalendarGrid,
  getWeekDays,
  getEventsForDay,
  formatDateToIso,
  formatDuration,
} from '../../utils/rules.ts';
import { CalendarViewType, StudyEvent } from '../../types/index.ts';
import { SubjectIcon } from '../common/SubjectIcon.tsx';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Printer,
  Trash2,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  LayoutGrid,
  Columns3,
  AlertTriangle,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    events,
    subjects,
    openNewEventModal,
    openDayDrawer,
    openAiPlanner,
    toggleEventCompletion,
    clearWeekEvents,
    openEditEventModal,
    language,
    t,
  } = useStudy();

  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Month navigation
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Month Grid
  const monthCells = getMonthCalendarGrid(currentYear, currentMonthIndex);

  // Week Grid (Monday to Sunday)
  const weekDays = getWeekDays(currentDate, language);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const monthLabel = currentDate.toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const getSubjectColor = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.currentColor || '#3B82F6';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearWeek = () => {
    const start = weekDays[0].dateString;
    const end = weekDays[6].dateString;
    clearWeekEvents(start, end);
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
              {t.calendar.title}
            </h2>
            {/* View Switcher Tabs (Mês / Cronograma da Semana) */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
              <button
                onClick={() => setViewType('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewType === 'month'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{t.calendar.monthView}</span>
              </button>

              <button
                onClick={() => setViewType('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewType === 'week'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns3 size={14} />
                <span>{t.calendar.weekView}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.calendar.subtitle}
          </p>
        </div>

        {/* Action Buttons as requested */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Highlighted AI Planning Button */}
          <button
            onClick={openAiPlanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles size={14} />
            <span>{t.calendar.planWithAi}</span>
          </button>

          {/* Nova sessão (Blue filled) */}
          <button
            onClick={() => openNewEventModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={15} />
            <span>{t.calendar.newSession}</span>
          </button>

          {/* Imprimir (Outline) */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            <Printer size={14} />
            <span>{t.calendar.print}</span>
          </button>

          {/* Limpar semana (Red outline) */}
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs transition-colors"
          >
            <Trash2 size={14} />
            <span>{t.calendar.clearWeek}</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar (Month or Week) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={viewType === 'month' ? prevMonth : prevWeek}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={viewType === 'month' ? t.calendar.prevMonth : t.calendar.prevWeek}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={viewType === 'month' ? nextMonth : nextWeek}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={viewType === 'month' ? t.calendar.nextMonth : t.calendar.nextWeek}
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 ml-2">
            {viewType === 'month'
              ? monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
              : `${weekDays[0].dayNumber} - ${weekDays[6].dayNumber} de ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`}
          </span>
        </div>

        <button
          onClick={goToToday}
          className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {t.calendar.todayButton}
        </button>
      </div>

      {/* VIEW A: MÊS (Visão Principal) */}
      {viewType === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold uppercase tracking-wider text-slate-400 py-3 bg-slate-50/50 dark:bg-slate-800/50">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {monthCells.map((cell, idx) => {
              const dayEvents = getEventsForDay(events, cell.dateString);
              return (
                <div
                  key={idx}
                  onClick={() => openDayDrawer(cell.dateString)}
                  className={`min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-blue-50/30 dark:hover:bg-blue-950/20 ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-900/40 opacity-40'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Colored Blocks per subject as specified */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => {
                      const color = getSubjectColor(evt.subjectId);
                      return (
                        <div
                          key={evt.id}
                          className="px-1.5 py-0.5 rounded-lg text-[10px] font-medium truncate flex items-center gap-1 border"
                          style={{
                            backgroundColor: `${color}18`,
                            color: color,
                            borderColor: `${color}30`,
                          }}
                          title={`${evt.title} (${evt.topic})`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <span className="text-[10px] font-bold text-slate-400 px-1 block">
                        +{dayEvents.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW B: CRONOGRAMA DA SEMANA (Colunas de Segunda a Domingo) */}
      {viewType === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-[900px] grid grid-cols-7 gap-3">
            {weekDays.map((col) => {
              const dayEvents = getEventsForDay(events, col.dateString);
              return (
                <div
                  key={col.dateString}
                  className={`flex flex-col rounded-2xl p-2.5 bg-slate-50/60 dark:bg-slate-800/40 border transition-all ${
                    col.isToday
                      ? 'border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/10'
                      : 'border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-700/60 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                      {col.dayShort}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-base font-extrabold ${
                        col.isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {col.dayNumber}
                    </span>
                  </div>

                  {/* Study Cards in this column */}
                  <div className="flex-1 space-y-2.5 min-h-[220px]">
                    {dayEvents.map((evt) => {
                      const color = getSubjectColor(evt.subjectId);
                      const isCompleted = evt.status === 'completed';

                      return (
                        <div
                          key={evt.id}
                          className={`p-3 rounded-2xl border transition-all shadow-xs group ${
                            isCompleted
                              ? 'bg-slate-100/70 dark:bg-slate-800/80 opacity-70 border-slate-200 dark:border-slate-700'
                              : 'bg-white dark:bg-slate-850 hover:shadow-md'
                          }`}
                          style={{
                            borderColor: isCompleted ? undefined : `${color}40`,
                          }}
                        >
                          {/* Time badge highlighted */}
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-tight"
                              style={{
                                backgroundColor: `${color}20`,
                                color: color,
                              }}
                            >
                              {evt.startTime || 'Flexível'}
                            </span>

                            <button
                              onClick={() => toggleEventCompletion(evt.id)}
                              className="text-slate-400 hover:text-emerald-600 focus:outline-none"
                              aria-label="Concluir sessão"
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={15} className="text-emerald-500" />
                              ) : (
                                <Circle size={15} />
                              )}
                            </button>
                          </div>

                          {/* Topic title below */}
                          <p
                            onClick={() => openEditEventModal(evt)}
                            className={`text-xs font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 line-clamp-2 ${
                              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {evt.topic}
                          </p>

                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            <span>{formatDuration(evt.durationMinutes, language)}</span>
                            <span className="font-semibold text-amber-500">+{evt.xpReward} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dashed Add Button as specified */}
                  <button
                    onClick={() => openNewEventModal(col.dateString)}
                    className="mt-3 w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus size={13} />
                    <span>{t.calendar.addStudy}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear Week Confirmation Dialog */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.calendar.confirmClearTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.calendar.confirmClearDesc}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                {t.calendar.cancel}
              </button>
              <button
                onClick={handleClearWeek}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {t.calendar.confirmClearAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
