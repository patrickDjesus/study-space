import React, { useState, useEffect } from 'react';
import { useStudy, GENERAL_DISCIPLINES } from '../../context/StudyContext.tsx';
import { SubjectId, EventStatus, StudyEvent } from '../../types/index.ts';
import { formatDateToIso } from '../../utils/rules.ts';
import { X, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

export const EventModal: React.FC = () => {
  const {
    isEventModalOpen,
    editingEvent,
    selectedDayForNewEvent,
    closeEventModal,
    addStudyEvent,
    updateStudyEvent,
    subjects,
    t,
  } = useStudy();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId>('tech');
  const [subdiscipline, setSubdiscipline] = useState('Matemática');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [status, setStatus] = useState<EventStatus>('pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setSubjectId(editingEvent.subjectId);
      setSubdiscipline(editingEvent.subdiscipline || 'Matemática');
      setTopic(editingEvent.topic);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime || '');
      setDurationMinutes(editingEvent.durationMinutes);
      setStatus(editingEvent.status);
      setNotes(editingEvent.notes || '');
    } else {
      setTitle('');
      setSubjectId('tech');
      setSubdiscipline('Matemática');
      setTopic('');
      setDate(selectedDayForNewEvent || formatDateToIso(new Date()));
      setStartTime('09:00');
      setDurationMinutes(45);
      setStatus('pending');
      setNotes('');
    }
    setError('');
  }, [editingEvent, selectedDayForNewEvent, isEventModalOpen]);

  if (!isEventModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor, informe o título da sessão.');
      return;
    }
    if (!topic.trim()) {
      setError('Por favor, informe o tópico que será estudado.');
      return;
    }
    if (!date) {
      setError('Selecione uma data válida.');
      return;
    }

    const xpReward = durationMinutes >= 60 ? 30 : durationMinutes >= 45 ? 25 : 20;

    if (editingEvent) {
      updateStudyEvent(editingEvent.id, {
        title: title.trim(),
        subjectId,
        subdiscipline: subjectId === 'general' ? subdiscipline : undefined,
        topic: topic.trim(),
        date,
        startTime: startTime || undefined,
        durationMinutes,
        status,
        notes: notes.trim() || undefined,
        xpReward,
      });
    } else {
      addStudyEvent({
        title: title.trim(),
        subjectId,
        subdiscipline: subjectId === 'general' ? subdiscipline : undefined,
        topic: topic.trim(),
        date,
        startTime: startTime || undefined,
        durationMinutes,
        status,
        notes: notes.trim() || undefined,
        xpReward,
      });
    }

    closeEventModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingEvent ? t.eventModal.editTitle : t.eventModal.createTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Planeje sua sessão com objetivo e duração definidos.
            </p>
          </div>
          <button
            onClick={closeEventModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              {t.eventModal.fieldTitle} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.eventModal.fieldTitlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              {t.eventModal.fieldSubject}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {subjects.map((s) => {
                const isSelected = subjectId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSubjectId(s.id)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: s.currentColor }}
                    />
                    <span className="truncate w-full text-center">{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subdiscipline (Only if Conhecimentos Gerais) */}
          {subjectId === 'general' && (
            <div className="p-3 rounded-2xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/50">
              <label className="block text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 mb-1.5">
                {t.eventModal.fieldSubdiscipline}
              </label>
              <select
                value={subdiscipline}
                onChange={(e) => setSubdiscipline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              >
                {GENERAL_DISCIPLINES.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Topic */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              {t.eventModal.fieldTopic} *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.eventModal.fieldTopicPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date, Time & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.eventModal.fieldDate} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.eventModal.fieldStartTime}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                {t.eventModal.fieldDuration}
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 min (+15 XP)</option>
                <option value={30}>30 min (+20 XP)</option>
                <option value={45}>45 min (+25 XP)</option>
                <option value={60}>1h (+30 XP)</option>
                <option value={90}>1h 30min (+35 XP)</option>
                <option value={120}>2h (+40 XP)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              {t.eventModal.fieldNotes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.eventModal.fieldNotesPlaceholder}
              className="w-full px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Initial Status */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t.eventModal.fieldStatus}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  status === 'pending'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.eventModal.statusPending}
              </button>
              <button
                type="button"
                onClick={() => setStatus('completed')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.eventModal.statusCompleted}
              </button>
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeEventModal}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t.calendar.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              {editingEvent ? t.eventModal.btnSubmitEdit : t.eventModal.btnSubmitCreate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
