import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { calculateDailyProgress } from '../../utils/rules.ts';
import { Sparkles, Zap } from 'lucide-react';

export const DailyXpRing: React.FC = () => {
  const { user, t } = useStudy();

  const progressPercent = calculateDailyProgress(user.dailyXpCurrent, user.dailyXpGoal);

  // Motivational message based on percentage
  let motivationalMessage = t.home.dailyXp.motivationalLow;
  if (progressPercent >= 100) {
    motivationalMessage = t.home.dailyXp.motivationalHigh;
  } else if (progressPercent >= 50) {
    motivationalMessage = t.home.dailyXp.motivationalMid;
  }

  // Large SVG Ring calculations
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between h-full text-center">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          <span>{t.home.dailyXp.title}</span>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900">
          Meta: {user.dailyXpGoal} XP
        </span>
      </div>

      {/* Circular Progress Ring */}
      <div className="relative my-2">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Animated Gradient Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#xpGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {progressPercent}%
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            {user.dailyXpCurrent} / {user.dailyXpGoal} XP
          </span>
        </div>
      </div>

      {/* Motivational message */}
      <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed px-2">
        {motivationalMessage}
      </p>
    </div>
  );
};
