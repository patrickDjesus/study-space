import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { formatMinutesToClockHours } from '../../utils/rules.ts';
import { Target, CheckCircle, Layers, Timer } from 'lucide-react';

export const TodayGoalsCard: React.FC = () => {
  const { user, t } = useStudy();

  const sessionsPercent = Math.min(
    100,
    Math.round((user.todayCompletedSessions / Math.max(1, user.todayTargetSessions)) * 100)
  );

  const flashcardsPercent = Math.min(
    100,
    Math.round((user.flashcardsReviewedToday / Math.max(1, user.flashcardsTargetToday)) * 100)
  );

  const focusPercent = Math.min(
    100,
    Math.round((user.focusMinutesToday / Math.max(1, user.focusTargetMinutes)) * 100)
  );

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Target size={14} className="text-emerald-500" />
          <span>{t.home.goalsCard.title}</span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Meta diária
        </span>
      </div>

      <div className="space-y-4 my-auto">
        {/* Metric 1: Sessões concluídas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <CheckCircle size={13} />
              </span>
              <span>{t.home.goalsCard.sessionsMetric}</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user.todayCompletedSessions} / {user.todayTargetSessions}
            </span>
          </div>
          {/* Slender Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${sessionsPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Questões ou Flashcards */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Layers size={13} />
              </span>
              <span>{t.home.goalsCard.flashcardsMetric}</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user.flashcardsReviewedToday} / {user.flashcardsTargetToday}
            </span>
          </div>
          {/* Slender Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${flashcardsPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Sessões de Foco */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Timer size={13} />
              </span>
              <span>{t.home.goalsCard.focusTimeMetric}</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatMinutesToClockHours(user.focusMinutesToday)} / {formatMinutesToClockHours(user.focusTargetMinutes)}
            </span>
          </div>
          {/* Slender Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${focusPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        Ritmo atual consistente com o modo de estudo selecionado.
      </div>
    </div>
  );
};
