import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Subject,
  SubjectId,
  StudyEvent,
  UserProfile,
  StudyMode,
  NavTab,
  Language,
  Theme,
  FocusTimerState,
  Note,
  StudiedTopic,
  AiWeeklyPlanItem,
} from '../types/index.ts';
import { formatDateToIso, calculateLevel } from '../utils/rules.ts';
import { convertPlanItemsToEvents } from '../utils/plannerRules.ts';
import { translations } from '../utils/i18n.ts';

// School disciplines for Conhecimentos Gerais with distinct accent colors
export const GENERAL_DISCIPLINES = [
  { name: 'Matemática', color: '#10B981' }, // Green
  { name: 'Português', color: '#EC4899' }, // Pink
  { name: 'História', color: '#EAB308' }, // Amber
  { name: 'Geografia', color: '#14B8A6' }, // Teal
  { name: 'Física', color: '#6366F1' }, // Indigo
  { name: 'Química', color: '#F43F5E' }, // Rose
  { name: 'Biologia', color: '#22C55E' }, // Emerald
  { name: 'Filosofia/Sociologia', color: '#A855F7' }, // Purple
];

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'english',
    name: 'Inglês',
    defaultColor: '#8B5CF6', // Purple
    currentColor: '#8B5CF6',
    description: 'Grammar, vocabulary, listening, reading & conversational skills',
    icon: 'languages',
  },
  {
    id: 'tech',
    name: 'Tecnologia',
    defaultColor: '#3B82F6', // Blue
    currentColor: '#3B82F6',
    description: 'Disciplinas da faculdade: algoritmos, redes, arquitetura e dev',
    icon: 'code-2',
  },
  {
    id: 'general',
    name: 'Conhecimentos Gerais',
    defaultColor: '#F97316', // Orange
    currentColor: '#F97316',
    description: 'Ensino Fundamental e Médio: matemática, ciências, história e mais',
    icon: 'book-open',
  },
];

// Generates seed events around the current day
function createInitialEvents(): StudyEvent[] {
  const today = new Date();
  const getRelativeDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return formatDateToIso(d);
  };

  return [
    {
      id: 'evt-1',
      title: 'Listening & Pronunciation',
      subjectId: 'english',
      topic: 'Podcast: Tech Innovations & Connected Speech',
      date: getRelativeDate(0), // Today
      startTime: '09:00',
      durationMinutes: 45,
      status: 'completed',
      notes: 'Focus on contracted forms and connected speech in natural dialogues.',
      xpReward: 25,
    },
    {
      id: 'evt-2',
      title: 'Estruturas de Dados Avançadas',
      subjectId: 'tech',
      topic: 'Árvores Binárias de Busca e Balanceamento AVL',
      date: getRelativeDate(0), // Today
      startTime: '14:30',
      durationMinutes: 60,
      status: 'pending',
      notes: 'Implementar rotações simples à esquerda e à direita em TypeScript/C.',
      xpReward: 30,
    },
    {
      id: 'evt-3',
      title: 'Física Clássica',
      subjectId: 'general',
      subdiscipline: 'Física',
      topic: 'Leis de Newton e Conservação da Energia Mecânica',
      date: getRelativeDate(0), // Today
      startTime: '19:00',
      durationMinutes: 45,
      status: 'pending',
      notes: 'Resolver 5 exercícios de vestibulares anteriores sobre plano inclinado.',
      xpReward: 25,
    },
    {
      id: 'evt-4',
      title: 'Redes de Computadores',
      subjectId: 'tech',
      topic: 'Camada de Transporte: TCP vs UDP & Handshake',
      date: getRelativeDate(1), // Tomorrow
      startTime: '10:00',
      durationMinutes: 60,
      status: 'pending',
      notes: 'Preparação para prova de redes na quinta-feira.',
      xpReward: 30,
    },
    {
      id: 'evt-5',
      title: 'Grammar Focus',
      subjectId: 'english',
      topic: 'Conditionals (Zero, First, Second & Mixed)',
      date: getRelativeDate(2),
      startTime: '15:00',
      durationMinutes: 45,
      status: 'pending',
      notes: 'Criar 10 sentenças usando Second Conditional para hipóteses reais.',
      xpReward: 25,
    },
    {
      id: 'evt-6',
      title: 'Química Orgânica',
      subjectId: 'general',
      subdiscipline: 'Química',
      topic: 'Funções Oxigenadas: Álcoois, Aldeídos e Cetonas',
      date: getRelativeDate(3),
      startTime: '16:30',
      durationMinutes: 50,
      status: 'pending',
      notes: 'Revisão das regras IUPAC de nomenclatura e polaridade molecular.',
      xpReward: 25,
    },
    {
      id: 'evt-7',
      title: 'Sistemas Operacionais',
      subjectId: 'tech',
      topic: 'Escalonamento de Processos (Round Robin e Prioridades)',
      date: getRelativeDate(-2), // 2 days ago
      startTime: '11:00',
      durationMinutes: 60,
      status: 'completed',
      notes: 'Diagrama de Gantt e cálculo de tempo de espera médio.',
      xpReward: 30,
    },
    {
      id: 'evt-8',
      title: 'História do Brasil',
      subjectId: 'general',
      subdiscipline: 'História',
      topic: 'Era Vargas e a Consolidação das Leis do Trabalho',
      date: getRelativeDate(-1), // Yesterday
      startTime: '17:00',
      durationMinutes: 40,
      status: 'completed',
      notes: 'Resumo sobre o Estado Novo e a política de industrialização.',
      xpReward: 20,
    },
  ];
}

function createInitialNotes(): Note[] {
  return [
    {
      id: 'note-1',
      title: 'Arquitetura de Redes: TCP/IP e Handshake de 3 Vias',
      content: `# TCP/IP & Transporte Confiável

O protocolo **TCP (Transmission Control Protocol)** é orientado à conexão e garante a entrega ordenada e confiável dos pacotes de dados.

## As 3 Etapas do Handshake:
1. **SYN**: O cliente envia um pacote com flag SYN ativa e número de sequência inicial *seq = x*.
2. **SYN-ACK**: O servidor responde com as flags SYN e ACK, confirmando o número *ack = x + 1* e propondo seu próprio número de sequência *seq = y*.
3. **ACK**: O cliente confirma o recebimento com ACK para *ack = y + 1*. A conexão está formalmente estabelecida!

## Comparação Direta:
- **TCP**: Conexão segura, controle de fluxo, retransmissão de perda (ex: HTTP, HTTPS, SSH, FTP).
- **UDP**: Sem garantia de entrega, baixa latência, ideal para streaming e jogos em tempo real (ex: DNS, VoIP).

> Dica: Prova na próxima quinta! Rever cálculo de RTT e janela deslizante.`,
      subjectId: 'tech',
      tags: ['Redes', 'Protocolos', 'Faculdade'],
      createdAt: '2026-11-07T10:30:00Z',
      updatedAt: '2026-11-08T16:45:00Z',
      summary: 'Revisão das três etapas do handshake TCP (SYN, SYN-ACK, ACK) e contraste de robustez versus latência com o protocolo UDP.',
      keyConcepts: ['Handshake de 3 vias', 'Garantia de entrega', 'Controle de fluxo', 'TCP vs UDP'],
    },
    {
      id: 'note-2',
      title: 'Connected Speech & Linking Sounds in Spoken English',
      content: `# Mastering Natural Connected Speech

In natural spoken English, words are not pronounced in isolation with pauses between them. Native speakers blend words together continuously.

## 1. Consonant to Vowel Linking
When a word ends with a consonant sound and the next begins with a vowel:
- *"Hold on"* -> pronounced as **/həʊl.dɒn/**
- *"Turn off"* -> pronounced as **/tɜː.nɒf/**
- *"Check it out"* -> **/tʃek.ɪ.taʊt/**

## 2. Intrusive Sounds
When two vowel sounds meet, an intrusive glide sound is inserted naturally:
- **/w/** sound: *"Go out"* -> *"Go-[w]-out"*, *"Do it"* -> *"Do-[w]-it"*
- **/j/** sound: *"I agree"* -> *"I-[j]-agree"*

## Key Tip for Listening:
Don't listen for individual words with silent spaces; listen for the rhythmic stress and intonation waves.`,
      subjectId: 'english',
      tags: ['Listening', 'Pronunciation', 'Speaking'],
      createdAt: '2026-11-06T14:15:00Z',
      updatedAt: '2026-11-07T11:20:00Z',
      summary: 'Guia prático de Connected Speech em inglês: ligação entre consoantes e vogais e sons intrusivos /w/ e /j/.',
      keyConcepts: ['Connected Speech', 'Linking Sounds', 'Intrusive /w/ & /j/', 'Listening Comprehension'],
    },
    {
      id: 'note-3',
      title: 'Conservação da Energia Mecânica e Teorema do Trabalho',
      content: `# Energia Mecânica nos Sistemas Físicos

A energia mecânica total ($E_m$) de um sistema isolado sob forças conservativas permanece invariante com o tempo:

$$E_m = E_c + E_p$$

## Fórmulas Fundamentais:
- **Energia Cinética**: $E_c = (m \\cdot v^2) / 2$
- **Energia Potencial Gravitacional**: $E_{pg} = m \\cdot g \\cdot h$
- **Energia Potencial Elástica**: $E_{pe} = (k \\cdot x^2) / 2$

## Teorema da Energia Cinética (TEC):
O trabalho da força resultante ($W_R$) exercido sobre um corpo equivale à variação de sua energia cinética:
$$W_R = \\Delta E_c = E_{c,final} - E_{c,inicial}$$

> **Atenção:** Em presença de forças dissipativas (atrito, resistência do ar), parte da energia se converte em calor e som, de modo que $E_{m,final} < E_{m,inicial}$.`,
      subjectId: 'general',
      subdiscipline: 'Física',
      tags: ['Física', 'Mecânica', 'Vestibular'],
      createdAt: '2026-11-05T09:00:00Z',
      updatedAt: '2026-11-06T17:00:00Z',
      summary: 'Princípio da conservação da energia mecânica, expressões de energia cinética e potencial, e aplicação do TEC.',
      keyConcepts: ['Energia Mecânica', 'Energia Cinética', 'Energia Potencial Gravitacional', 'Forças Dissipativas'],
    },
  ];
}

function createInitialStudiedTopics(): StudiedTopic[] {
  return [
    {
      id: 'st-1',
      subjectId: 'general',
      subdiscipline: 'História',
      topic: 'Era Vargas e a Consolidação das Leis do Trabalho',
      studiedAt: '2026-11-08',
    },
    {
      id: 'st-2',
      subjectId: 'tech',
      topic: 'Escalonamento de Processos (Round Robin e Prioridades)',
      studiedAt: '2026-11-07',
    },
    {
      id: 'st-3',
      subjectId: 'english',
      topic: 'Listening & Pronunciation: Tech Innovations',
      studiedAt: '2026-11-09',
    },
  ];
}

const DEFAULT_USER: UserProfile = {
  id: 'user-default-1',
  name: 'Patrick Mendes',
  email: 'patrickjesusmen@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  lastAccess: 'Hoje às 09:15',
  streakDays: 5,
  totalXp: 385,
  level: 3,
  studyMode: 'regular',
  dailyXpGoal: 80,
  dailyXpCurrent: 45,
  todayCompletedSessions: 2,
  todayTargetSessions: 4,
  flashcardsReviewedToday: 14,
  flashcardsTargetToday: 80,
  focusMinutesToday: 105, // 01:45h
  focusTargetMinutes: 300, // 5h
};

interface StudyContextType {
  user: UserProfile;
  subjects: Subject[];
  events: StudyEvent[];
  notes: Note[];
  activeNoteId: string | null;
  selectedFolder: SubjectId | 'all';
  selectedTag: string | null;
  notesSearchQuery: string;
  activeTab: NavTab;
  language: Language;
  theme: Theme;
  t: (typeof translations)['pt-BR'];
  focusTimer: FocusTimerState;
  // Modals & Panels
  isEventModalOpen: boolean;
  editingEvent: StudyEvent | null;
  selectedDayForNewEvent: string | null;
  selectedDayDrawer: string | null;
  isAiPlannerOpen: boolean;
  analyzingNote: Note | null;
  isNoteAnalysisOpen: boolean;
  // Actions
  setActiveTab: (tab: NavTab) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  setStudyMode: (mode: StudyMode) => void;
  updateSubjectColor: (subjectId: SubjectId, color: string) => void;
  addStudyEvent: (event: Omit<StudyEvent, 'id'>) => StudyEvent;
  updateStudyEvent: (id: string, updates: Partial<StudyEvent>) => void;
  deleteStudyEvent: (id: string) => void;
  toggleEventCompletion: (id: string) => void;
  clearWeekEvents: (startDate: string, endDate: string) => void;
  // Studied topics & AI planner actions
  studiedTopics: StudiedTopic[];
  addStudiedTopic: (subjectId: SubjectId, topic: string, subdiscipline?: string) => void;
  approvePlanItems: (items: AiWeeklyPlanItem[]) => void;
  // Note actions
  setActiveNoteId: (id: string | null) => void;
  setSelectedFolder: (folder: SubjectId | 'all') => void;
  setSelectedTag: (tag: string | null) => void;
  setNotesSearchQuery: (q: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  openNoteAnalysis: (note: Note) => void;
  closeNoteAnalysis: () => void;
  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: FocusTimerState['mode']) => void;
  // Modal handlers
  openNewEventModal: (initialDate?: string) => void;
  openEditEventModal: (event: StudyEvent) => void;
  closeEventModal: () => void;
  openDayDrawer: (dateString: string) => void;
  closeDayDrawer: () => void;
  openAiPlanner: () => void;
  closeAiPlanner: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('studyflow_theme') as Theme) || 'light';
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('studyflow_lang') as Language) || 'pt-BR';
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // User profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studyflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_USER;
  });

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('studyflow_subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SUBJECTS;
  });

  // Events
  const [events, setEvents] = useState<StudyEvent[]>(() => {
    const saved = localStorage.getItem('studyflow_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return createInitialEvents();
  });

  // Notes state
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('studyflow_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return createInitialNotes();
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    return 'note-1';
  });

  const [selectedFolder, setSelectedFolder] = useState<SubjectId | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [analyzingNote, setAnalyzingNote] = useState<Note | null>(null);
  const [isNoteAnalysisOpen, setIsNoteAnalysisOpen] = useState(false);

  // Focus Timer
  const [focusTimer, setFocusTimer] = useState<FocusTimerState>({
    mode: 'pomodoro',
    durationSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    isRunning: false,
    sessionsCompleted: 2,
  });

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StudyEvent | null>(null);
  const [selectedDayForNewEvent, setSelectedDayForNewEvent] = useState<string | null>(null);
  const [selectedDayDrawer, setSelectedDayDrawer] = useState<string | null>(null);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);

  // Sync theme class to document
  useEffect(() => {
    localStorage.setItem('studyflow_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist language
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('studyflow_lang', lang);
  }, []);

  // Persist user
  useEffect(() => {
    localStorage.setItem('studyflow_user', JSON.stringify(user));
  }, [user]);

  // Persist subjects
  useEffect(() => {
    localStorage.setItem('studyflow_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Persist events
  useEffect(() => {
    localStorage.setItem('studyflow_events', JSON.stringify(events));
  }, [events]);

  // Persist notes
  useEffect(() => {
    localStorage.setItem('studyflow_notes', JSON.stringify(notes));
  }, [notes]);

  // Studied topics state
  const [studiedTopics, setStudiedTopics] = useState<StudiedTopic[]>(() => {
    const saved = localStorage.getItem('studyflow_studied_topics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return createInitialStudiedTopics();
  });

  // Persist studied topics
  useEffect(() => {
    localStorage.setItem('studyflow_studied_topics', JSON.stringify(studiedTopics));
  }, [studiedTopics]);

  // Focus Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusTimer.isRunning) {
      interval = setInterval(() => {
        setFocusTimer((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Timer finished!
            const newMinutes = prev.durationSeconds / 60;
            setUser((u) => ({
              ...u,
              totalXp: u.totalXp + 20,
              dailyXpCurrent: u.dailyXpCurrent + 20,
              focusMinutesToday: u.focusMinutesToday + newMinutes,
            }));
            return {
              ...prev,
              isRunning: false,
              remainingSeconds: prev.durationSeconds,
              sessionsCompleted: prev.sessionsCompleted + 1,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimer.isRunning, focusTimer.durationSeconds]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setStudyMode = useCallback((mode: StudyMode) => {
    setUser((prev) => ({
      ...prev,
      studyMode: mode,
      dailyXpGoal: mode === 'light' ? 50 : mode === 'regular' ? 80 : 120,
    }));
  }, []);

  const updateSubjectColor = useCallback((subjectId: SubjectId, color: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, currentColor: color } : s))
    );
  }, []);

  const addStudyEvent = useCallback(
    (eventData: Omit<StudyEvent, 'id'>) => {
      const newEvent: StudyEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    []
  );

  const updateStudyEvent = useCallback((id: string, updates: Partial<StudyEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteStudyEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const toggleEventCompletion = useCallback(
    (id: string) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id === id) {
            const willBeCompleted = event.status !== 'completed';
            const xpDiff = willBeCompleted ? event.xpReward : -event.xpReward;
            
            setUser((currUser) => {
              const newTotal = Math.max(0, currUser.totalXp + xpDiff);
              const newDaily = Math.max(0, currUser.dailyXpCurrent + xpDiff);
              const { level } = calculateLevel(newTotal);
              const newCompletedCount = willBeCompleted
                ? currUser.todayCompletedSessions + 1
                : Math.max(0, currUser.todayCompletedSessions - 1);

              return {
                ...currUser,
                totalXp: newTotal,
                level,
                dailyXpCurrent: newDaily,
                todayCompletedSessions: newCompletedCount,
              };
            });

            return {
              ...event,
              status: willBeCompleted ? 'completed' : 'pending',
            };
          }
          return event;
        })
      );
    },
    []
  );

  const clearWeekEvents = useCallback((startDate: string, endDate: string) => {
    setEvents((prev) =>
      prev.filter((e) => e.date < startDate || e.date > endDate)
    );
  }, []);

  const addStudiedTopic = useCallback(
    (subjectId: SubjectId, topic: string, subdiscipline?: string) => {
      const newEntry: StudiedTopic = {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        subjectId,
        subdiscipline,
        topic,
        studiedAt: formatDateToIso(new Date()),
      };
      setStudiedTopics((prev) => {
        // avoid duplicating exact topic in memory if already exists
        if (prev.some((t) => t.topic.toLowerCase() === topic.toLowerCase())) {
          return prev;
        }
        return [newEntry, ...prev];
      });
    },
    []
  );

  const approvePlanItems = useCallback(
    (items: AiWeeklyPlanItem[]) => {
      if (!items || items.length === 0) return;
      const newEvents = convertPlanItemsToEvents(items);
      setEvents((prev) => [...prev, ...newEvents]);

      // Automatically register topics to studied topics bank
      items.forEach((item) => {
        addStudiedTopic(item.subjectId, item.topic, item.discipline);
      });

      setIsAiPlannerOpen(false);
      setActiveTab('calendar');
    },
    [addStudiedTopic]
  );

  // Timer controls
  const startTimer = useCallback(() => {
    setFocusTimer((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setFocusTimer((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setFocusTimer((prev) => ({
      ...prev,
      isRunning: false,
      remainingSeconds: prev.durationSeconds,
    }));
  }, []);

  const setTimerMode = useCallback((mode: FocusTimerState['mode']) => {
    const mins = mode === 'pomodoro' ? 25 : mode === 'short_break' ? 5 : 15;
    setFocusTimer({
      mode,
      durationSeconds: mins * 60,
      remainingSeconds: mins * 60,
      isRunning: false,
      sessionsCompleted: 0,
    });
  }, []);

  // Modal actions
  const openNewEventModal = useCallback((initialDate?: string) => {
    setEditingEvent(null);
    setSelectedDayForNewEvent(initialDate || formatDateToIso(new Date()));
    setIsEventModalOpen(true);
  }, []);

  const openEditEventModal = useCallback((event: StudyEvent) => {
    setEditingEvent(event);
    setSelectedDayForNewEvent(null);
    setIsEventModalOpen(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
    setSelectedDayForNewEvent(null);
  }, []);

  const openDayDrawer = useCallback((dateString: string) => {
    setSelectedDayDrawer(dateString);
  }, []);

  const closeDayDrawer = useCallback(() => {
    setSelectedDayDrawer(null);
  }, []);

  const openAiPlanner = useCallback(() => {
    setIsAiPlannerOpen(true);
  }, []);

  const closeAiPlanner = useCallback(() => {
    setIsAiPlannerOpen(false);
  }, []);

  // Notes handlers
  const addNote = useCallback(
    (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      return newNote;
    },
    []
  );

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: now } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      setActiveNoteId((curr) => {
        if (curr === id) {
          return remaining[0]?.id || null;
        }
        return curr;
      });
      return remaining;
    });
  }, []);

  const openNoteAnalysis = useCallback((note: Note) => {
    setAnalyzingNote(note);
    setIsNoteAnalysisOpen(true);
  }, []);

  const closeNoteAnalysis = useCallback(() => {
    setAnalyzingNote(null);
    setIsNoteAnalysisOpen(false);
  }, []);

  const loginWithGoogle = useCallback(() => {
    setUser({
      ...DEFAULT_USER,
      lastAccess: 'Agora',
    });
  }, []);

  const logout = useCallback(() => {
    setUser((prev) => ({
      ...prev,
      name: 'Estudante Convidado',
      email: 'convidado@studyflow.local',
      avatarUrl: '',
    }));
  }, []);

  const t = translations[language];

  return (
    <StudyContext.Provider
      value={{
        user,
        subjects,
        events,
        notes,
        activeNoteId,
        selectedFolder,
        selectedTag,
        notesSearchQuery,
        activeTab,
        language,
        theme,
        t,
        focusTimer,
        isEventModalOpen,
        editingEvent,
        selectedDayForNewEvent,
        selectedDayDrawer,
        isAiPlannerOpen,
        analyzingNote,
        isNoteAnalysisOpen,
        setActiveTab,
        setLanguage,
        toggleTheme,
        setStudyMode,
        updateSubjectColor,
        addStudyEvent,
        updateStudyEvent,
        deleteStudyEvent,
        toggleEventCompletion,
        clearWeekEvents,
        studiedTopics,
        addStudiedTopic,
        approvePlanItems,
        setActiveNoteId,
        setSelectedFolder,
        setSelectedTag,
        setNotesSearchQuery,
        addNote,
        updateNote,
        deleteNote,
        openNoteAnalysis,
        closeNoteAnalysis,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimerMode,
        openNewEventModal,
        openEditEventModal,
        closeEventModal,
        openDayDrawer,
        closeDayDrawer,
        openAiPlanner,
        closeAiPlanner,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
