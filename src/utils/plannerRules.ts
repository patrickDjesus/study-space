import { AiWeeklyPlanItem, AiWeeklyPlanRequest, StudyEvent, SubjectId } from '../types/index.ts';
import { formatDateToIso, getWeekDays } from './rules.ts';

export const SCHOOL_DISCIPLINES = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Física',
  'Química',
  'Biologia',
  'Filosofia',
] as const;

export const ENGLISH_SKILLS = [
  'Listening',
  'Reading',
  'Speaking',
  'Writing',
  'Vocabulary',
  'Grammar',
] as const;

export const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayKey = typeof DAY_KEYS[number];

/**
 * Maps day keys to dates in the active week
 */
export function getWeekDatesMap(referenceDate: Date = new Date()): Record<DayKey, string> {
  const weekDays = getWeekDays(referenceDate, 'pt-BR');
  return {
    monday: weekDays[0].dateString,
    tuesday: weekDays[1].dateString,
    wednesday: weekDays[2].dateString,
    thursday: weekDays[3].dateString,
    friday: weekDays[4].dateString,
    saturday: weekDays[5].dateString,
    sunday: weekDays[6].dateString,
  };
}

/**
 * Validates and sanitizes plan items returned by the AI or fallback generator
 */
export function sanitizePlanItems(
  items: unknown[],
  datesMap: Record<DayKey, string>
): AiWeeklyPlanItem[] {
  if (!Array.isArray(items)) return [];

  const validSubjects: SubjectId[] = ['english', 'tech', 'general'];

  return items
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item, index) => {
      const rawDay = String(item.dayKey ?? 'monday').toLowerCase() as DayKey;
      const dayKey: DayKey = DAY_KEYS.includes(rawDay) ? rawDay : 'monday';
      const targetDate = datesMap[dayKey] || formatDateToIso(new Date());

      const rawSubject = String(item.subjectId ?? 'general').toLowerCase() as SubjectId;
      const subjectId: SubjectId = validSubjects.includes(rawSubject) ? rawSubject : 'general';

      const duration = Number(item.durationMinutes) || 45;
      const safeDuration = Math.max(15, Math.min(180, duration));

      const rawStartTime = typeof item.startTime === 'string' ? item.startTime.trim() : '09:00';
      const startTime = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(rawStartTime)
        ? rawStartTime
        : '09:00';

      const topic = String(item.topic || 'Revisão e Prática').trim();
      const discipline = item.discipline ? String(item.discipline).trim() : undefined;
      const objective = String(item.objective || 'Fixação de conceitos principais').trim();

      return {
        id: `plan-item-${index + 1}-${Date.now().toString(36)}`,
        dayKey,
        date: targetDate,
        startTime,
        subjectId,
        discipline,
        topic,
        durationMinutes: safeDuration,
        objective,
      };
    });
}

/**
 * Converts approved AI weekly plan items into persistent StudyEvents
 */
export function convertPlanItemsToEvents(items: AiWeeklyPlanItem[]): StudyEvent[] {
  return items.map((item) => {
    let title = item.topic;
    if (item.subjectId === 'general' && item.discipline) {
      title = `${item.discipline}: ${item.topic}`;
    }

    const xpReward = Math.max(15, Math.round(item.durationMinutes * 0.75));

    return {
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      subjectId: item.subjectId,
      subdiscipline: item.discipline,
      topic: item.topic,
      date: item.date,
      startTime: item.startTime,
      durationMinutes: item.durationMinutes,
      status: 'pending',
      notes: `🎯 Objetivo: ${item.objective}`,
      xpReward,
    };
  });
}

/**
 * High-quality intelligent fallback schedule generator
 * Balances subjects based on user priorities, avoids repeating studied topics,
 * alternates English skills, and respects available hours/day.
 */
export function generateHeuristicPlan(
  req: AiWeeklyPlanRequest,
  datesMap: Record<DayKey, string>
): AiWeeklyPlanItem[] {
  const selectedDays = (req.selectedDays && req.selectedDays.length > 0
    ? req.selectedDays
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  ).map((d) => d.toLowerCase()) as DayKey[];

  const hoursPerDay = Math.max(1, Math.min(6, req.hoursPerDay || 2));
  const studied = new Set((req.studiedTopics || []).map((t) => t.toLowerCase().trim()));

  // Pool of General Knowledge topics across school disciplines
  const schoolTopicBank = [
    { discipline: 'Matemática', topic: 'Funções de 1º e 2º Grau e Vértice da Parábola' },
    { discipline: 'Português', topic: 'Concordância Verbal, Nominal e Regência' },
    { discipline: 'História', topic: 'Revolução Industrial e Formação da Sociedade Moderna' },
    { discipline: 'Física', topic: 'Leis de Newton e Dinâmica de Forças' },
    { discipline: 'Química', topic: 'Tabela Periódica, Ligações Iônicas e Covalentes' },
    { discipline: 'Biologia', topic: 'Citologia: Estrutura Celular e Respiração Celular' },
    { discipline: 'Geografia', topic: 'Geopolítica Global e Dinâmicas Demográficas' },
    { discipline: 'Filosofia', topic: 'Ética e Moral em Aristóteles e Kant' },
    { discipline: 'Matemática', topic: 'Geometria Espacial: Prismas e Cilindros' },
    { discipline: 'Física', topic: 'Trabalho, Energia Cinética e Conservação de Energia' },
    { discipline: 'Química', topic: 'Estequiometria e Soluções Químicas' },
    { discipline: 'Biologia', topic: 'Genética Mendeliana e Leis da Hereditariedade' },
  ];

  // Available school topics not in studied set
  const availableSchoolTopics = schoolTopicBank.filter(
    (t) => !studied.has(t.topic.toLowerCase())
  );
  const generalPool = availableSchoolTopics.length > 0 ? availableSchoolTopics : schoolTopicBank;

  // English skills rotation
  const englishTopics = [
    { skill: 'Listening', topic: 'Listening & Note-taking: Podcasts técnicos em velocidade 1.25x' },
    { skill: 'Vocabulary', topic: 'Phrasal Verbs e Expressões Idiomáticas no ambiente acadêmico' },
    { skill: 'Grammar', topic: 'Conditionals (Zero, First, Second & Third) em frases reais' },
    { skill: 'Reading', topic: 'Reading Comprehension: Artigos científicos e papers em inglês' },
    { skill: 'Speaking', topic: 'Shadowing e pronúncia conectada (Connected Speech)' },
    { skill: 'Writing', topic: 'Writing: Redação de emails formais e abstracts acadêmicos' },
  ];

  // Tech topics incorporating user prompt keywords
  const promptLower = (req.userPrompt || '').toLowerCase();
  const techTopics: string[] = [];

  if (promptLower.includes('rede') || promptLower.includes('redes')) {
    techTopics.push('Redes de Computadores: Modelo OSI, Camadas TCP/IP e Roteamento');
    techTopics.push('Redes: Endereçamento IPv4/IPv6, Sub-redes e Protocolos DNS/DHCP');
  }
  if (promptLower.includes('banco') || promptLower.includes('sql') || promptLower.includes('dados')) {
    techTopics.push('Banco de Dados: Modelagem Relacional, Normalização e Consultas SQL');
  }
  if (promptLower.includes('estrutura') || promptLower.includes('algoritmo')) {
    techTopics.push('Estruturas de Dados: Árvores Binárias, Grafos e Complexidade O(n)');
  }
  if (techTopics.length === 0) {
    techTopics.push(
      'Estruturas de Dados & Complexidade Assintótica Big-O',
      'Arquitetura de Software: Padrões de Projeto e Camadas',
      'Sistemas Operacionais: Gerenciamento de Processos e Memória Virtual',
      'Programação Web Moderna: Arquitetura de APIs RESTful e Assincronia'
    );
  }

  const items: AiWeeklyPlanItem[] = [];
  let generalIdx = 0;
  let englishIdx = 0;
  let techIdx = 0;

  // Default time slots based on day
  const defaultTimes = ['09:00', '10:30', '14:00', '16:00', '19:00', '20:30'];

  selectedDays.forEach((dayKey) => {
    const date = datesMap[dayKey] || formatDateToIso(new Date());

    // Calculate slots for the day (e.g., 2 hours = two 50-60m sessions or one 90m session)
    const sessionsToday = hoursPerDay <= 1 ? 1 : hoursPerDay <= 3 ? 2 : 3;
    const sessionDuration = Math.round((hoursPerDay * 60) / sessionsToday);

    // Subject rotation per day according to priorities
    // High priority gets more occurrences
    const subWeights: { subject: SubjectId; weight: number }[] = [
      { subject: 'tech', weight: req.priorities?.tech || 3 },
      { subject: 'english', weight: req.priorities?.english || 3 },
      { subject: 'general', weight: req.priorities?.general || 3 },
    ];
    subWeights.sort((a, b) => b.weight - a.weight);

    for (let s = 0; s < sessionsToday; s++) {
      const chosenSubject = subWeights[s % subWeights.length].subject;
      const startTime = defaultTimes[s % defaultTimes.length];

      if (chosenSubject === 'english') {
        const eng = englishTopics[englishIdx % englishTopics.length];
        englishIdx++;
        items.push({
          id: `plan-${dayKey}-${s}-${Date.now().toString(36)}`,
          dayKey,
          date,
          startTime,
          subjectId: 'english',
          topic: eng.topic,
          durationMinutes: sessionDuration,
          objective: `Treinar habilidade de ${eng.skill} com foco em fluência e precisão`,
        });
      } else if (chosenSubject === 'tech') {
        const topic = techTopics[techIdx % techTopics.length];
        techIdx++;
        items.push({
          id: `plan-${dayKey}-${s}-${Date.now().toString(36)}`,
          dayKey,
          date,
          startTime,
          subjectId: 'tech',
          topic,
          durationMinutes: sessionDuration,
          objective: 'Resolver exercícios práticos e consolidar teoria para provas e projetos',
        });
      } else {
        const gen = generalPool[generalIdx % generalPool.length];
        generalIdx++;
        items.push({
          id: `plan-${dayKey}-${s}-${Date.now().toString(36)}`,
          dayKey,
          date,
          startTime,
          subjectId: 'general',
          discipline: gen.discipline,
          topic: gen.topic,
          durationMinutes: sessionDuration,
          objective: `Revisão do conteúdo de ${gen.discipline} com resolução de 5 questões`,
        });
      }
    }
  });

  return items;
}
