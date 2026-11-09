import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { AiWeeklyPlanItem, AiWeeklyPlanRequest, AiWeeklyPlanResponse, SubjectId } from '../../types/index.ts';
import { DAY_KEYS, DayKey, getWeekDatesMap } from '../../utils/plannerRules.ts';
import {
  Sparkles,
  X,
  Wand2,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Trash2,
  BookOpen,
  Languages,
  Code2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface DayOption {
  key: DayKey;
  labelPt: string;
  labelEn: string;
}

const DAYS_LIST: DayOption[] = [
  { key: 'monday', labelPt: 'Segunda', labelEn: 'Mon' },
  { key: 'tuesday', labelPt: 'Terça', labelEn: 'Tue' },
  { key: 'wednesday', labelPt: 'Quarta', labelEn: 'Wed' },
  { key: 'thursday', labelPt: 'Quinta', labelEn: 'Thu' },
  { key: 'friday', labelPt: 'Sexta', labelEn: 'Fri' },
  { key: 'saturday', labelPt: 'Sábado', labelEn: 'Sat' },
  { key: 'sunday', labelPt: 'Domingo', labelEn: 'Sun' },
];

export const AiPlannerModal: React.FC = () => {
  const {
    isAiPlannerOpen,
    closeAiPlanner,
    approvePlanItems,
    notes,
    studiedTopics,
    subjects,
    language,
    t,
  } = useStudy();

  const isPt = language === 'pt-BR';

  // Form states
  const [prompt, setPrompt] = useState(
    'Tenho 2h por dia de segunda a sexta, prova de redes na quinta e quero focar em listening em inglês e matemática.'
  );
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [selectedDays, setSelectedDays] = useState<DayKey[]>([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ]);
  const [priorities, setPriorities] = useState<{ english: number; tech: number; general: number }>({
    english: 4,
    tech: 5,
    general: 3,
  });
  const [refinementPrompt, setRefinementPrompt] = useState('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [isFallbackNotice, setIsFallbackNotice] = useState<boolean>(false);

  // Generated items & item selection for partial approval
  const [planItems, setPlanItems] = useState<AiWeeklyPlanItem[] | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  if (!isAiPlannerOpen) return null;

  const toggleDay = (day: DayKey) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.length > 1
          ? prev.filter((d) => d !== day)
          : prev
        : [...prev, day]
    );
  };

  const handleGenerate = async (isRefinement = false) => {
    setIsGenerating(true);
    setErrorMessage(null);

    const recentNotesSummary = notes.slice(0, 5).map((n) => ({
      subjectId: n.subjectId,
      title: n.title,
      tags: n.tags,
    }));

    const studiedTopicsList = studiedTopics.map((t) => t.topic);

    const payload: AiWeeklyPlanRequest = {
      userPrompt: prompt,
      hoursPerDay: dailyHours,
      selectedDays,
      priorities,
      studiedTopics: studiedTopicsList,
      recentNotesSummary,
      refinementPrompt: isRefinement ? refinementPrompt : undefined,
      language,
    };

    try {
      const res = await fetch('/api/ai/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: AiWeeklyPlanResponse = await res.json();
      if (data.success && data.plan) {
        setPlanItems(data.plan);
        setReasoning(data.reasoning || null);
        setIsFallbackNotice(Boolean(data.isFallback));
        // By default select all generated items
        const allIds = new Set(data.plan.map((item, idx) => item.id || `plan-${idx}`));
        setSelectedItemIds(allIds);
      } else {
        throw new Error(data.message || 'Falha ao processar o plano');
      }
    } catch (err: unknown) {
      console.warn('API error, using local heuristic plan generator:', err);
      // Fallback locally if network or server has hiccup
      const { generateHeuristicPlan } = await import('../../utils/plannerRules.ts');
      const datesMap = getWeekDatesMap();
      const localPlan = generateHeuristicPlan(payload, datesMap);
      setPlanItems(localPlan);
      setIsFallbackNotice(true);
      setReasoning(
        isPt
          ? 'Plano gerado com balanceamento inteligente local: distribuição de horas, rotação de competências de inglês e seleção de disciplinas de conhecimentos gerais.'
          : 'Plan generated via local intelligent scheduler: hour distribution, English skill rotation, and school disciplines.'
      );
      const allIds = new Set(localPlan.map((item, idx) => item.id || `plan-${idx}`));
      setSelectedItemIds(allIds);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApproveAll = () => {
    if (!planItems || planItems.length === 0) return;
    approvePlanItems(planItems);
  };

  const handleApproveSelected = () => {
    if (!planItems) return;
    const selected = planItems.filter((item, idx) =>
      selectedItemIds.has(item.id || `plan-${idx}`)
    );
    if (selected.length === 0) return;
    approvePlanItems(selected);
  };

  const removeItem = (id: string) => {
    setPlanItems((prev) => (prev ? prev.filter((item, idx) => (item.id || `plan-${idx}`) !== id) : null));
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const getSubjectColor = (subjectId: SubjectId) => {
    const s = subjects.find((subj) => subj.id === subjectId);
    return s?.currentColor || (subjectId === 'english' ? '#8B5CF6' : subjectId === 'tech' ? '#3B82F6' : '#F97316');
  };

  const getSubjectIcon = (subjectId: SubjectId) => {
    if (subjectId === 'english') return <Languages size={13} />;
    if (subjectId === 'tech') return <Code2 size={13} />;
    return <BookOpen size={13} />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.aiPlannerTeaser.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800">
                  Gemini Flash 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.aiPlannerTeaser.desc}
              </p>
            </div>
          </div>

          <button
            onClick={closeAiPlanner}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar planejador"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Split or 2-zone scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Top Parameters Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Prompt & Days (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  {isPt ? 'O que você precisa estudar nesta semana?' : 'What do you want to study this week?'}
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t.aiPlannerTeaser.promptPlaceholder}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              {/* Days Checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  {t.aiPlannerTeaser.availableDaysLabel}
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {DAYS_LIST.map((day) => {
                    const isSelected = selectedDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isPt ? day.labelPt : day.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Sliders (5 cols) */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              {/* Daily Hours Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-500" />
                    <span>{t.aiPlannerTeaser.availableHoursLabel}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs">
                    {dailyHours}h / {isPt ? 'dia' : 'day'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Subject Priorities */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.aiPlannerTeaser.prioritiesLabel}
                </span>

                {/* English */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 mb-1">
                    <span>Inglês</span>
                    <span className="font-mono">Nível {priorities.english}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={priorities.english}
                    onChange={(e) =>
                      setPriorities((p) => ({ ...p, english: Number(e.target.value) }))
                    }
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Tech */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <span>Tecnologia (Faculdade)</span>
                    <span className="font-mono">Nível {priorities.tech}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={priorities.tech}
                    onChange={(e) =>
                      setPriorities((p) => ({ ...p, tech: Number(e.target.value) }))
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* General */}
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                    <span>Conhecimentos Gerais</span>
                    <span className="font-mono">Nível {priorities.general}/5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={priorities.general}
                    onChange={(e) =>
                      setPriorities((p) => ({ ...p, general: Number(e.target.value) }))
                    }
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Studied topics badge info */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span>{t.aiPlannerTeaser.studiedNotice}</span>{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                ({studiedTopics.length} {isPt ? 'tópicos no histórico de exclusão de repetição' : 'topics in history to avoid repeating'}).
              </span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {planItems && (
                <span>
                  {planItems.length} {isPt ? 'sessões planejadas' : 'sessions planned'} • {selectedItemIds.size}{' '}
                  {isPt ? 'selecionadas' : 'selected'}
                </span>
              )}
            </div>

            <button
              onClick={() => handleGenerate(false)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isPt ? 'Montando rotina com IA...' : 'Generating schedule with AI...'}</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>{planItems ? t.aiPlannerTeaser.regenerateAction : t.aiPlannerTeaser.generateAction}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Plan Section */}
          {planItems && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in">
              {/* Reasoning banner */}
              {reasoning && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-blue-600" />
                    {isPt ? 'Análise Pedagógica da IA:' : 'AI Pedagogical Strategy:'}
                  </span>
                  {reasoning}
                </div>
              )}

              {/* Refinement input */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t.aiPlannerTeaser.refinementLabel}
                  </label>
                  <input
                    type="text"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder={t.aiPlannerTeaser.refinementPlaceholder}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerate(true)}
                  disabled={isGenerating || !refinementPrompt.trim()}
                  className="sm:self-end flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{isPt ? 'Ajustar' : 'Refine'}</span>
                </button>
              </div>

              {/* Items List (Weekly Schedule Cards) */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {planItems.map((item, idx) => {
                  const itemId = item.id || `plan-${idx}`;
                  const isChecked = selectedItemIds.has(itemId);
                  const color = getSubjectColor(item.subjectId);

                  return (
                    <div
                      key={itemId}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleItemSelection(itemId)}
                          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent hover:border-blue-400'
                          }`}
                          aria-label="Selecionar sessão"
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>

                        <div>
                          {/* Top Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: color }}
                            >
                              {getSubjectIcon(item.subjectId)}
                              <span>
                                {item.subjectId === 'english'
                                  ? 'Inglês'
                                  : item.subjectId === 'tech'
                                  ? 'Tecnologia'
                                  : item.discipline
                                  ? `Gerais: ${item.discipline}`
                                  : 'Conhecimentos Gerais'}
                              </span>
                            </span>

                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                              {item.date} às {item.startTime} • {item.durationMinutes} min
                            </span>
                          </div>

                          {/* Topic & Objective */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {item.topic}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            🎯 {item.objective}
                          </p>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => removeItem(itemId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Remover sessão"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Commit Toolbar */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedItemIds.size === planItems.length
                    ? isPt
                      ? 'Todas as sessões estão prontas para aprovação'
                      : 'All sessions ready for approval'
                    : isPt
                    ? `${selectedItemIds.size} de ${planItems.length} sessões selecionadas`
                    : `${selectedItemIds.size} of ${planItems.length} sessions selected`}
                </span>

                <div className="flex items-center gap-2">
                  {selectedItemIds.size > 0 && selectedItemIds.size < planItems.length && (
                    <button
                      type="button"
                      onClick={handleApproveSelected}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={14} className="text-blue-500" />
                      <span>
                        {t.aiPlannerTeaser.applySelectedAction} ({selectedItemIds.size})
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApproveAll}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Check size={16} />
                    <span>{t.aiPlannerTeaser.applyPlanAction}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
