import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { formatDateToIso, formatDuration, getEventsForDay } from '../../utils/rules.ts';
import { SubjectIcon } from '../common/SubjectIcon.tsx';
import { CheckCircle2, Circle, Clock, Plus, CheckSquare } from 'lucide-react';

export const TodayTasksCard: React.FC = () => {
  const { events, subjects, toggleEventCompletion, openNewEventModal, t, language } = useStudy();

  const todayIso = formatDateToIso(new Date());
  const todayTasks = getEventsForDay(events, todayIso);

  const getSubjectInfo = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <CheckSquare size={14} className="text-blue-500" />
          <span>{t.home.todayTasks.title}</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold ml-1">
            {todayTasks.filter((task) => task.status === 'completed').length}/{todayTasks.length}
          </span>
        </div>

        <button
          onClick={() => openNewEventModal(todayIso)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          title="Adicionar tarefa para hoje"
        >
          <Plus size={14} />
          <span>Adicionar</span>
        </button>
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[220px]">
            {t.home.todayTasks.empty}
          </p>
          <button
            onClick={() => openNewEventModal(todayIso)}
            className="mt-3 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
          >
            + Adicionar Estudo
          </button>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[280px] pr-1">
          {todayTasks.map((task) => {
            const subject = getSubjectInfo(task.subjectId);
            const color = subject?.currentColor || '#3B82F6';
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`group flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                {/* Custom Accessible Checkbox */}
                <button
                  onClick={() => toggleEventCompletion(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none flex-shrink-0"
                  aria-label={isCompleted ? t.home.todayTasks.markAsPending : t.home.todayTasks.markAsDone}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={19} className="text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle size={19} className="text-slate-300 dark:text-slate-600 hover:text-blue-500" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {/* Subject color icon and small tag */}
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <SubjectIcon
                        subjectId={task.subjectId}
                        subdiscipline={task.subdiscipline}
                        size={12}
                      />
                    </span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{ color }}
                    >
                      {task.subdiscipline
                        ? `${subject?.name || ''} • ${task.subdiscipline}`
                        : subject?.name}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-semibold text-slate-800 dark:text-slate-100 truncate ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {task.topic}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {task.startTime ? `${task.startTime} • ` : ''}
                      {formatDuration(task.durationMinutes, language)}
                    </span>
                    <span>•</span>
                    <span className="text-amber-500 font-semibold">+{task.xpReward} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
