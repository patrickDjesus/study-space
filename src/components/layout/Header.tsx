import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { NavTab } from '../../types/index.ts';
import { FocusTimerPill } from './FocusTimerPill.tsx';
import { UserMenu } from './UserMenu.tsx';
import {
  Home,
  Calendar,
  FileText,
  Layers,
  Dumbbell,
  Target,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, theme, toggleTheme, t } = useStudy();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.nav.home, icon: <Home size={18} /> },
    { id: 'calendar', label: t.nav.calendar, icon: <Calendar size={18} /> },
    { id: 'notes', label: t.nav.notes, icon: <FileText size={18} /> },
    { id: 'flashcards', label: t.nav.flashcards, icon: <Layers size={18} /> },
    { id: 'training', label: t.nav.training, icon: <Dumbbell size={18} /> },
    { id: 'goals', label: t.nav.goals, icon: <Target size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
            aria-label="StudyFlow Home"
          >
            {/* Custom Modern Original Logo Icon */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                <path
                  d="M12 3c-4.5 0-8 3-8 7.5 0 3 2 5.5 5 6.5v2.5l3.5-2c3.5 0 7.5-2 7.5-7C20 6 16.5 3 12 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40"
                />
                <path
                  d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 0-2.5 2.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M9 10h6" strokeLinecap="round" />
                <path d="M9 14h4" strokeLinecap="round" />
              </svg>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping opacity-75" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                  StudyFlow
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 hidden sm:block -mt-0.5">
                {t.appTagline}
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Navegação Principal">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>

                  {/* Active Indicator Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Focus Timer Pill */}
          <FocusTimerPill />

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            title={t.header.switchTheme}
            aria-label={t.header.switchTheme}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
          </button>

          {/* User Profile Avatar & Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
