import React, { useState, useRef, useEffect } from 'react';
import { useStudy, GENERAL_DISCIPLINES } from '../../context/StudyContext.tsx';
import { calculateReadingTime, formatNoteDate } from '../../utils/noteRules.ts';
import { SubjectId } from '../../types/index.ts';
import { SubjectIcon } from '../common/SubjectIcon.tsx';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Sparkles,
  Trash2,
  Tag,
  Clock,
  CheckCircle2,
  Eye,
  Edit3,
  X,
  Plus,
  AlertTriangle,
} from 'lucide-react';

interface NoteEditorProps {
  onBackToList?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ onBackToList }) => {
  const {
    notes,
    activeNoteId,
    updateNote,
    deleteNote,
    openNoteAnalysis,
    subjects,
    language,
    t,
  } = useStudy();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!activeNote) {
    return (
      <div className="flex-1 h-full min-h-[450px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <Edit3 size={36} className="text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {t.notes.selectNotePrompt}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Selecione uma anotação na barra lateral ou crie um novo documento de estudo.
        </p>
      </div>
    );
  }

  const { wordCount, minutes } = calculateReadingTime(activeNote.content);
  const currentSubject = subjects.find((s) => s.id === activeNote.subjectId);
  const subjectColor = currentSubject?.currentColor || '#3B82F6';

  // Quick insertion helpers for markdown formatting
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeNote.content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`;

    const newContent =
      activeNote.content.substring(0, start) +
      replacement +
      activeNote.content.substring(end);

    updateNote(activeNote.id, { content: newContent });

    // Re-focus and reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 5)
      );
    }, 10);
  };

  const handleAddTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !activeNote.tags.includes(clean)) {
      updateNote(activeNote.id, { tags: [...activeNote.tags, clean] });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateNote(activeNote.id, {
      tags: activeNote.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleDelete = () => {
    deleteNote(activeNote.id);
    setIsDeleteConfirmOpen(false);
    if (onBackToList) onBackToList();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top action header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Subject & Subdiscipline Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              ← Voltar
            </button>
          )}

          {/* Subject Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: subjectColor }}
            />
            <select
              value={activeNote.subjectId}
              onChange={(e) =>
                updateNote(activeNote.id, { subjectId: e.target.value as SubjectId })
              }
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subdiscipline dropdown if Conhecimentos Gerais */}
          {activeNote.subjectId === 'general' && (
            <select
              value={activeNote.subdiscipline || 'Matemática'}
              onChange={(e) =>
                updateNote(activeNote.id, { subdiscipline: e.target.value })
              }
              className="px-2.5 py-1.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 text-xs font-bold text-orange-700 dark:text-orange-300 focus:outline-none cursor-pointer"
            >
              {GENERAL_DISCIPLINES.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          )}

          {/* Saved badge */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            <span>{t.notes.saved}</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Word count & Reading time */}
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {wordCount} {t.notes.words} • {minutes} {t.notes.readingTime}
          </span>

          {/* View / Edit Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo de Edição"
            >
              <Edit3 size={13} />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo de Leitura / Visualização"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Visualizar</span>
            </button>
          </div>

          {/* Highlighted Button "Analisar com IA" */}
          <button
            onClick={() => openNoteAnalysis(activeNote)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
            title={t.notes.analyzeTooltip}
          >
            <Sparkles size={13} />
            <span>{t.notes.analyzeWithAi}</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title={t.notes.deleteNote}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Title input */}
      <div className="px-6 pt-5 pb-2">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
          placeholder="Título da anotação..."
          className="w-full text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-transparent border-none focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
          <Clock size={12} />
          <span>Última atualização: {formatNoteDate(activeNote.updatedAt, language)}</span>
        </div>
      </div>

      {/* Formatting Toolbar (shown in edit mode) */}
      {viewMode === 'edit' && (
        <div className="px-6 py-2 border-y border-slate-100 dark:border-slate-800 flex items-center gap-1 flex-wrap bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.bold}
          >
            <Bold size={14} />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.italic}
          >
            <Italic size={14} />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('# ')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.heading1}
          >
            <Heading1 size={14} />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('## ')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.heading2}
          >
            <Heading2 size={14} />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('- ')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.bulletList}
          >
            <List size={14} />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('1. ')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.numberedList}
          >
            <ListOrdered size={14} />
          </button>

          <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.quote}
          >
            <Quote size={14} />
          </button>

          <button
            type="button"
            onClick={() => insertFormatting('```\n', '\n```')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={t.notes.codeBlock}
          >
            <Code size={14} />
          </button>
        </div>
      )}

      {/* Editor Content Body */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {viewMode === 'edit' ? (
          <textarea
            ref={textareaRef}
            value={activeNote.content}
            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
            placeholder={t.notes.contentPlaceholder}
            className="w-full h-full min-h-[300px] bg-transparent text-sm leading-relaxed text-slate-800 dark:text-slate-100 border-none focus:outline-none resize-none font-mono"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none text-sm space-y-3">
            {activeNote.content.split('\n\n').map((block, idx) => {
              if (block.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-xl font-extrabold text-slate-900 dark:text-white border-b pb-1">
                    {block.replace(/^# /, '')}
                  </h1>
                );
              }
              if (block.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {block.replace(/^## /, '')}
                  </h2>
                );
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="pl-3 border-l-4 border-blue-500 italic text-slate-600 dark:text-slate-300 my-2">
                    {block.replace(/^> /, '')}
                  </blockquote>
                );
              }
              if (block.startsWith('```')) {
                return (
                  <pre key={idx} className="p-3 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                    {block.replace(/```/g, '').trim()}
                  </pre>
                );
              }
              return (
                <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {block}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags & Metadata Bar at Bottom */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Tag size={12} />
            Tags:
          </span>

          {activeNote.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="text-slate-400 hover:text-red-500 focus:outline-none"
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setIsAddingTag(false);
                }}
                placeholder={t.notes.addTagPlaceholder}
                className="px-2 py-0.5 text-xs rounded-lg border border-blue-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleAddTag}
                className="text-xs font-bold text-blue-600 hover:underline px-1"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTag(true)}
              className="px-2 py-0.5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Plus size={11} />
              <span>{t.notes.addTagPrompt}</span>
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.notes.deleteConfirmTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {t.notes.deleteConfirmDesc}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                {t.calendar.cancel}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {t.notes.deleteConfirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
