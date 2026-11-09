export type SubjectId = 'english' | 'tech' | 'general';

export interface Subject {
  id: SubjectId;
  name: string;
  defaultColor: string;
  currentColor: string;
  description: string;
  icon: string;
}

export type StudyMode = 'light' | 'regular' | 'intense';

export type EventStatus = 'pending' | 'completed';

export interface StudyEvent {
  id: string;
  title: string;
  subjectId: SubjectId;
  subdiscipline?: string; // For general knowledge: 'Matemática', 'História', etc.
  topic: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  durationMinutes: number;
  status: EventStatus;
  notes?: string;
  xpReward: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  lastAccess: string;
  streakDays: number;
  totalXp: number;
  level: number;
  studyMode: StudyMode;
  dailyXpGoal: number;
  dailyXpCurrent: number;
  todayCompletedSessions: number;
  todayTargetSessions: number;
  flashcardsReviewedToday: number;
  flashcardsTargetToday: number;
  focusMinutesToday: number;
  focusTargetMinutes: number;
}

export interface FocusTimerState {
  mode: 'pomodoro' | 'short_break' | 'long_break';
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  sessionsCompleted: number;
}

export type NavTab = 'home' | 'calendar' | 'notes' | 'flashcards' | 'training' | 'goals';

export type CalendarViewType = 'month' | 'week';

export type Language = 'pt-BR' | 'en-US';

export type Theme = 'light' | 'dark';

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: SubjectId;
  subdiscipline?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  summary?: string;
  keyConcepts?: string[];
}

export interface StudiedTopic {
  id: string;
  subjectId: SubjectId;
  subdiscipline?: string;
  topic: string;
  studiedAt: string; // ISO date YYYY-MM-DD
}

export interface AiWeeklyPlanItem {
  id?: string;
  dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  subjectId: SubjectId;
  discipline?: string;
  topic: string;
  durationMinutes: number;
  objective: string;
}

export interface AiWeeklyPlanRequest {
  userPrompt: string;
  hoursPerDay: number;
  selectedDays: string[];
  priorities: {
    english: number;
    tech: number;
    general: number;
  };
  studiedTopics?: string[];
  recentNotesSummary?: Array<{ subjectId: SubjectId; title: string; tags: string[] }>;
  refinementPrompt?: string;
  weekStartDate?: string; // YYYY-MM-DD of Monday
  language?: Language;
}

export interface AiWeeklyPlanResponse {
  success: boolean;
  plan: AiWeeklyPlanItem[];
  reasoning?: string;
  isFallback?: boolean;
  message?: string;
}

export interface AiNoteAnalysisResponse {
  success: boolean;
  summary: string;
  keyConcepts: string[];
  studyGaps: string[];
  suggestedFlashcards: Array<{
    front: string;
    back: string;
    subjectId: SubjectId;
  }>;
  quiz: Array<{
    id: string;
    question: string;
    type: 'multiple_choice' | 'open';
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  isFallback?: boolean;
}

