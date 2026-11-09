import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { NavTab } from '../../types/index.ts';
import { Home, Calendar, FileText, Layers, Dumbbell, Target } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useStudy();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.nav.home, icon: <Home size={19} /> },
    { id: 'calendar', label: t.nav.calendar, icon: <Calendar size={19} /> },
    { id: 'notes', label: t.nav.notes, icon: <FileText size={19} /> },
    { id: 'flashcards', label: t.nav.flashcards, icon: <Layers size={19} /> },
    { id: 'training', label: t.nav.training, icon: <Dumbbell size={19} /> },
    { id: 'goals', label: t.nav.goals, icon: <Target size={19} /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg"
      aria-label="Navegação mobile"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
