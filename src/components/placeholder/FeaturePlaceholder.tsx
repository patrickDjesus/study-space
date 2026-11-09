import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { NavTab } from '../../types/index.ts';
import { ArrowLeft, Sparkles, BookOpen, Layers, Dumbbell, Target } from 'lucide-react';

interface FeaturePlaceholderProps {
  tab: NavTab;
}

export const FeaturePlaceholder: React.FC<FeaturePlaceholderProps> = ({ tab }) => {
  const { setActiveTab, t } = useStudy();

  const details: Record<string, { title: string; step: string; desc: string; icon: React.ReactNode }> = {
    notes: {
      title: t.nav.notes,
      step: 'Etapa 2',
      desc: 'Organização em pastas por matéria (Inglês, Tecnologia, Conhecimentos Gerais), tags, editor rico e análise inteligente por IA.',
      icon: <BookOpen size={36} className="text-blue-500" />,
    },
    flashcards: {
      title: t.nav.flashcards,
      step: 'Etapa 4',
      desc: 'Baralhos por matéria com repetição espaçada (SM-2), modo de estudo interativo e geração automática a partir das anotações.',
      icon: <Layers size={36} className="text-purple-500" />,
    },
    training: {
      title: t.nav.training,
      step: 'Etapa 4',
      desc: 'Treinos gerados por IA com questões de múltipla escolha e abertas, gabarito explicado e pontuação de XP.',
      icon: <Dumbbell size={36} className="text-emerald-500" />,
    },
    goals: {
      title: t.nav.goals,
      step: 'Etapa 5',
      desc: 'Metas semanais detalhadas, gráficos de horas por matéria, acertos, sequência de dias e painel de gamificação completo.',
      icon: <Target size={36} className="text-amber-500" />,
    },
  };

  const current = details[tab] || {
    title: 'Recurso em Construção',
    step: 'Próxima Etapa',
    desc: 'Este recurso será implementado na sequência conforme o roteiro.',
    icon: <Sparkles size={36} className="text-blue-500" />,
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
        {current.icon}
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          {current.step} do Roteiro
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {current.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {current.desc}
        </p>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Voltar para a Home</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className="px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
        >
          Explorar Calendário
        </button>
      </div>
    </div>
  );
};
