import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { Play, Pause, RotateCcw, Clock, ChevronDown } from 'lucide-react';

export const FocusTimerPill: React.FC = () => {
  const { focusTimer, startTimer, pauseTimer, resetTimer, setTimerMode, t } = useStudy();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const totalSecs = focusTimer.durationSeconds;
  const remSecs = focusTimer.remainingSeconds;
  const progressRatio = totalSecs > 0 ? (totalSecs - remSecs) / totalSecs : 0;

  const minutes = Math.floor(remSecs / 60);
  const seconds = remSecs % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG circular ring properties
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 text-white shadow-sm border border-slate-800 transition-all select-none">
        {/* Circular Progress Ring */}
        <div
          className="relative flex items-center justify-center w-5 h-5 cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          title="Configurações do cronômetro de foco"
        >
          <svg className="w-5 h-5 -rotate-90">
            <circle
              cx="10"
              cy="10"
              r={radius}
              stroke="currentColor"
              strokeWidth="2.5"
              fill="transparent"
              className="text-slate-700"
            />
            <circle
              cx="10"
              cy="10"
              r={radius}
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
          </svg>
        </div>

        {/* Digital Time & Mode */}
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex items-center gap-1 font-mono text-xs font-semibold tracking-wide hover:text-blue-400 focus:outline-none transition-colors"
          aria-label={`Tempo de foco restante: ${formattedTime}`}
        >
          <span>{formattedTime}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Start / Pause Button */}
        <button
          onClick={focusTimer.isRunning ? pauseTimer : startTimer}
          className="p-1 rounded-full hover:bg-slate-800 text-blue-400 hover:text-blue-300 focus:outline-none transition-colors"
          aria-label={focusTimer.isRunning ? t.timer.pause : t.timer.start}
          title={focusTimer.isRunning ? t.timer.pause : t.timer.start}
        >
          {focusTimer.isRunning ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        {/* Reset Button (visible when paused or modified) */}
        {remSecs !== totalSecs && (
          <button
            onClick={resetTimer}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white focus:outline-none transition-colors"
            aria-label={t.timer.reset}
            title={t.timer.reset}
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t.timer.pomodoro}
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                {focusTimer.sessionsCompleted} {t.timer.sessionsDone}
              </span>
            </div>
          </div>

          <div className="p-1.5 space-y-1">
            <button
              onClick={() => {
                setTimerMode('pomodoro');
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                focusTimer.mode === 'pomodoro'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock size={14} />
                {t.timer.pomodoro}
              </span>
              <span className="font-mono text-[11px] opacity-75">25 min</span>
            </button>

            <button
              onClick={() => {
                setTimerMode('short_break');
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                focusTimer.mode === 'short_break'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{t.timer.shortBreak}</span>
              <span className="font-mono text-[11px] opacity-75">5 min</span>
            </button>

            <button
              onClick={() => {
                setTimerMode('long_break');
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                focusTimer.mode === 'long_break'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>{t.timer.longBreak}</span>
              <span className="font-mono text-[11px] opacity-75">15 min</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
