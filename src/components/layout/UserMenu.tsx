import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { LogOut, CheckCircle2, User, Globe, Moon, Sun, Sparkles } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, loginWithGoogle, logout, language, setLanguage, theme, toggleTheme, t } = useStudy();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors focus:outline-none"
        aria-label="Menu do usuário"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
        )}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User Header */}
          <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Google Synced Badge */}
            <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
              <CheckCircle2 size={12} />
              <span>{t.header.googleAccount}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                {t.home.level}
              </span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {user.level}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total XP
              </span>
              <span className="text-sm font-black text-amber-500">
                {user.totalXp} XP
              </span>
            </div>
          </div>

          {/* Settings & Switches */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                setLanguage(language === 'pt-BR' ? 'en-US' : 'pt-BR');
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Globe size={15} className="text-blue-500" />
                <span>{language === 'pt-BR' ? 'Mudar para Inglês' : 'Switch to Portuguese'}</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                {language === 'pt-BR' ? 'EN' : 'PT'}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                {theme === 'light' ? (
                  <Moon size={15} className="text-indigo-500" />
                ) : (
                  <Sun size={15} className="text-amber-500" />
                )}
                <span>{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
              </span>
            </button>
          </div>

          {/* Logout / Switch user */}
          <div className="pt-2 px-2 border-t border-slate-100 dark:border-slate-800">
            {user.email.includes('convidado') ? (
              <button
                onClick={() => {
                  loginWithGoogle();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors"
              >
                <Sparkles size={14} />
                <span>{t.header.signInGoogle}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut size={14} />
                <span>{t.header.logout}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
