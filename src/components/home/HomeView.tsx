import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { calculateLevel } from '../../utils/rules.ts';
import { StudyMode } from '../../types/index.ts';
import { DailyXpRing } from './DailyXpRing.tsx';
import { TodayTasksCard } from './TodayTasksCard.tsx';
import { TodayGoalsCard } from './TodayGoalsCard.tsx';
import {
  Flame,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Compass,
  Sparkles,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Target,
  LogOut,
  HelpCircle,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { user, setStudyMode, setActiveTab, openNewEventModal, openAiPlanner, logout, t } = useStudy();
  const [homeSubTab, setHomeSubTab] = useState<'today' | 'week' | 'journey' | 'achievements'>('today');

  const { level, currentLevelXp, nextLevelXp, progressPercent } = calculateLevel(user.totalXp);

  const studyModes: { id: StudyMode; label: string; desc: string }[] = [
    { id: 'light', label: t.studyModes.light, desc: '1h-2h/dia • 50 XP' },
    { id: 'regular', label: t.studyModes.regular, desc: '2h-4h/dia • 80 XP' },
    { id: 'intense', label: t.studyModes.intense, desc: '4h+/dia • 120 XP' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Large Top Hero Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Greeting & Access */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t.home.greeting}, {user.name.split(' ')[0]}! 👋
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={13} className="text-blue-500" />
                {t.home.lastAccess}: {user.lastAccess}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900">
                <Flame size={13} className="fill-amber-500 text-amber-500" />
                <span>{user.streakDays} {t.home.studiedDays}</span>
              </span>
            </div>
          </div>

          {/* Level & XP Bar */}
          <div className="flex-1 max-w-md bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                  {t.home.level} {level}
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Cadência Ativa
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {currentLevelXp} / {nextLevelXp} XP
              </span>
            </div>

            {/* XP Level Bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 font-medium">
              <span>Nível atual</span>
              <span>Faltam {nextLevelXp - currentLevelXp} XP para Nível {level + 1}</span>
            </div>
          </div>

          {/* Study Mode Selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.home.studyModeLabel}
            </span>
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              {studyModes.map((mode) => {
                const isSelected = user.studyMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setStudyMode(mode.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={mode.desc}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Home Layout: Left/Main Content + Compact Dark Shortcuts Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Section (9 or 10 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Sub-tabs: Hoje, Semana, Jornada, Conquistas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setHomeSubTab('today')}
                className={`relative pb-2 px-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  homeSubTab === 'today'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.home.tabs.today}
                {homeSubTab === 'today' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setHomeSubTab('week')}
                className={`relative pb-2 px-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  homeSubTab === 'week'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.home.tabs.week}
                {homeSubTab === 'week' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setHomeSubTab('journey')}
                className={`relative pb-2 px-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  homeSubTab === 'journey'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.home.tabs.journey}
                {homeSubTab === 'journey' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setHomeSubTab('achievements')}
                className={`relative pb-2 px-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  homeSubTab === 'achievements'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t.home.tabs.achievements}
                {homeSubTab === 'achievements' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            </div>

            {/* Quick action button */}
            <button
              onClick={() => openNewEventModal()}
              className="self-end sm:self-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>+ Novo Estudo</span>
            </button>
          </div>

          {/* Sub-tab: HOJE (3 Cards side by side) */}
          {homeSubTab === 'today' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card a: XP Diário */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col min-h-[320px]">
                <DailyXpRing />
              </div>

              {/* Card b: Tarefas do Dia */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col min-h-[320px]">
                <TodayTasksCard />
              </div>

              {/* Card c: Metas */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col min-h-[320px]">
                <TodayGoalsCard />
              </div>
            </div>
          )}

          {/* Sub-tab: SEMANA */}
          {homeSubTab === 'week' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.home.weekTab.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visão rápida de carga horária e ritmo semanal.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
                >
                  Abrir Cronograma Completo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Sessões Agendadas
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    8 sessões
                  </span>
                  <span className="text-[11px] text-slate-500">Distribuídas entre Seg e Dom</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                    Carga Horária Estimada
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    7h 15min
                  </span>
                  <span className="text-[11px] text-slate-500">Média de 1h20 por dia ativo</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Projeção de XP
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    +215 XP
                  </span>
                  <span className="text-[11px] text-slate-500">Garante o Nível {level + 1}</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: JORNADA */}
          {homeSubTab === 'journey' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.home.journeyTab.title}
              </h3>
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Inglês</p>
                      <p className="text-[11px] text-slate-500">{t.home.journeyTab.englishStatus}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-600">68% concluído</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Tecnologia (Faculdade)</p>
                      <p className="text-[11px] text-slate-500">{t.home.journeyTab.techStatus}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600">82% concluído</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Conhecimentos Gerais (Escolares)</p>
                      <p className="text-[11px] text-slate-500">{t.home.journeyTab.generalStatus}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600">54% concluído</span>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: CONQUISTAS */}
          {homeSubTab === 'achievements' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.home.achievementsTab.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-white">
                    <Flame size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.home.achievementsTab.streak7Title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.home.achievementsTab.streak7Desc}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.home.achievementsTab.masterXpTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.home.achievementsTab.masterXpDesc}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-600 text-white">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.home.achievementsTab.pomodoroTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.home.achievementsTab.pomodoroDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Two Light-Blue Action Cards: "Continuar de onde parei" e "Ir ao mapa de progresso" */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action Card 1: Continuar de onde parei */}
            <div className="p-5 rounded-3xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 flex items-center justify-between group hover:border-blue-300 transition-all">
              <div className="space-y-1 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  {t.home.quickActions.continueTitle}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t.home.quickActions.continueSubtitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Último estudo registrado há 2 dias
                </p>
              </div>

              {/* Blue Circular Action Button */}
              <button
                onClick={() => setActiveTab('calendar')}
                className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0"
                aria-label={t.home.quickActions.continueAction}
                title={t.home.quickActions.continueAction}
              >
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Action Card 2: Ir ao mapa de progresso */}
            <div className="p-5 rounded-3xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60 flex items-center justify-between group hover:border-indigo-300 transition-all">
              <div className="space-y-1 pr-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  {t.home.quickActions.progressMapTitle}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t.home.quickActions.progressMapSubtitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  71 tópicos dominados no total
                </p>
              </div>

              {/* Blue/Indigo Circular Action Button */}
              <button
                onClick={() => setHomeSubTab('journey')}
                className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0"
                aria-label={t.home.quickActions.progressMapAction}
                title={t.home.quickActions.progressMapAction}
              >
                <Compass size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right / Compact Dark Shortcuts Bar (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles size={14} className="text-blue-400" />
              <span>{t.home.sidebar.quickShortcuts}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('goals')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left transition-colors text-xs font-semibold text-slate-200 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 size={15} className="text-blue-400" />
                  <span>{t.home.sidebar.results}</span>
                </span>
                <ChevronRight size={14} className="text-slate-500" />
              </button>

              <button
                onClick={() => setActiveTab('goals')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left transition-colors text-xs font-semibold text-slate-200 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Target size={15} className="text-emerald-400" />
                  <span>{t.home.sidebar.goals}</span>
                </span>
                <ChevronRight size={14} className="text-slate-500" />
              </button>

              <button
                onClick={openAiPlanner}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-900 hover:to-indigo-900 border border-blue-500/30 text-left transition-colors text-xs font-semibold text-blue-200 hover:text-white"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-blue-300" />
                  <span>Planejar com IA</span>
                </span>
                <ChevronRight size={14} className="text-blue-400" />
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-red-950/40 text-left transition-colors text-xs font-semibold text-slate-400 hover:text-red-300"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut size={15} className="text-slate-500" />
                  <span>{t.home.sidebar.logout}</span>
                </span>
              </button>
            </div>

            {/* Daily Tip Widget */}
            <div className="mt-5 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                💡 Dica de Foco
              </span>
              <p className="leading-relaxed text-slate-400">
                Sessões de 25 a 45 minutos seguidas de pausas ativas aumentam a retenção de longo prazo em até 40%.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
