import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { getEventsForDay, formatDuration, parseIsoDate } from '../../utils/rules.ts';
import { SubjectBadge } from '../common/SubjectBadge.tsx';
import {
  X,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
} from 'lucide-react';

export const DayDetailDrawer: React.FC = () => {
  const {
    selectedDayDrawer,
    closeDayDrawer,
    events,
    toggleEventCompletion,
    deleteStudyEvent,
    openEditEventModal,
    openNewEventModal,
    language,
    t,
  } = useStudy();

  if (!selectedDayDrawer) return null;

  const dayEvents = getEventsForDay(events, selectedDayDrawer);
  const parsedDate = parseIsoDate(selectedDayDrawer);

  const formattedDateTitle = parsedDate.toLocaleDateString(
    language === 'pt-BR' ? 'pt-BR' : 'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                    {formattedDateTitle}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {dayEvents.length} {dayEvents.length === 1 ? 'sessão planejada' : 'sessões planejadas'}
                  </span>
                </div>
              </div>

              <button
                onClick={closeDayDrawer}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={t.calendar.close}
              >
                <X size={18} />
              </button>
            </div>

            {/* Event List */}
            <div className="mt-5 space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {dayEvents.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60">
                  <BookOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t.calendar.noEventsDay}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Adicione um bloco de estudos ou use o planejador inteligente.
                  </p>
                </div>
              ) : (
                dayEvents.map((evt) => {
                  const isCompleted = evt.status === 'completed';
                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-3xl border transition-all ${
                        isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                          : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-700/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <SubjectBadge
                          subjectId={evt.subjectId}
                          subdiscipline={evt.subdiscipline}
                          size="sm"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditEventModal(evt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={t.calendar.edit}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => deleteStudyEvent(evt.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title={t.calendar.delete}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4
                        className={`mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        <span className="font-semibold text-slate-500">Tópico:</span> {evt.topic}
                      </p>

                      {evt.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
                          {evt.notes}
                        </p>
                      )}

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Clock size={13} />
                          <span>{evt.startTime || '--:--'}</span>
                          <span>•</span>
                          <span>{formatDuration(evt.durationMinutes, language)}</span>
                        </div>

                        {/* Complete Toggle Button */}
                        <button
                          onClick={() => toggleEventCompletion(evt.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>{t.calendar.complete}</span>
                            </>
                          ) : (
                            <>
                              <Circle size={13} />
                              <span>{t.calendar.complete}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                openNewEventModal(selectedDayDrawer);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
            >
              <Plus size={16} />
              <span>{t.calendar.addStudyDay}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
