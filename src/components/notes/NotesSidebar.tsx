import React from 'react';
import { useStudy } from '../../context/StudyContext.tsx';
import { filterNotes, getUniqueTags, formatNoteDate } from '../../utils/noteRules.ts';
import { SubjectId } from '../../types/index.ts';
import { SubjectIcon } from '../common/SubjectIcon.tsx';
import {
  Search,
  Plus,
  Folder,
  Tag,
  X,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface NotesSidebarProps {
  onSelectNote?: () => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({ onSelectNote }) => {
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    selectedFolder,
    setSelectedFolder,
    selectedTag,
    setSelectedTag,
    notesSearchQuery,
    setNotesSearchQuery,
    addNote,
    subjects,
    language,
    t,
  } = useStudy();

  const filteredNotes = filterNotes(notes, notesSearchQuery, selectedFolder, selectedTag);
  const allTags = getUniqueTags(notes);

  const handleCreateNote = () => {
    const targetSubject = selectedFolder !== 'all' ? selectedFolder : 'tech';
    const newNote = addNote({
      title: 'Nova Anotação',
      content: '# Introdução\n\nComece a registrar suas ideias e anotações aqui...',
      subjectId: targetSubject,
      tags: selectedTag ? [selectedTag] : ['Estudo'],
    });
    if (onSelectNote) onSelectNote();
  };

  const getSubjectColor = (subjectId: string) => {
    const s = subjects.find((sub) => sub.id === subjectId);
    return s?.currentColor || '#3B82F6';
  };

  const getFolderCount = (subjectId: SubjectId | 'all') => {
    if (subjectId === 'all') return notes.length;
    return notes.filter((n) => n.subjectId === subjectId).length;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top action & Search */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.notes.title}
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'anotação' : 'anotações'}
              </span>
            </div>
          </div>

          <button
            onClick={handleCreateNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus size={14} />
            <span>{t.notes.newNote}</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={notesSearchQuery}
            onChange={(e) => setNotesSearchQuery(e.target.value)}
            placeholder={t.notes.searchPlaceholder}
            className="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {notesSearchQuery && (
            <button
              onClick={() => setNotesSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Subject Folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedFolder === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Folder size={12} />
            <span>{t.notes.allFolders}</span>
            <span className="text-[10px] opacity-75">({getFolderCount('all')})</span>
          </button>

          {subjects.map((sub) => {
            const isSelected = selectedFolder === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedFolder(sub.id)}
                className={`px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? 'border-transparent text-white font-bold'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                style={{
                  backgroundColor: isSelected ? sub.currentColor : undefined,
                }}
              >
                <SubjectIcon subjectId={sub.id} size={12} />
                <span>{sub.name}</span>
                <span className="text-[10px] opacity-75">({getFolderCount(sub.id)})</span>
              </button>
            );
          })}
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
              <Tag size={10} />
              Tags:
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <span>{selectedTag}</span>
                <X size={10} />
              </button>
            )}
            {allTags.map((tag) => {
              if (tag === selectedTag) return null;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[10px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap transition-colors"
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold">{t.notes.noNotesFound}</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
              {t.notes.noNotesDesc}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isActive = activeNoteId === note.id;
            const color = getSubjectColor(note.subjectId);
            const cleanPreview = note.content.replace(/[#*`_>\[\]]/g, '').slice(0, 100);

            return (
              <div
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  if (onSelectNote) onSelectNote();
                }}
                className={`p-3 rounded-2xl cursor-pointer transition-all border text-left ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                    : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${color}18`,
                      color: color,
                    }}
                  >
                    <SubjectIcon
                      subjectId={note.subjectId}
                      subdiscipline={note.subdiscipline}
                      size={10}
                    />
                    <span>
                      {note.subdiscipline
                        ? `${note.subdiscipline}`
                        : subjects.find((s) => s.id === note.subjectId)?.name}
                    </span>
                  </span>

                  <span className="text-[10px] text-slate-400 font-medium">
                    {formatNoteDate(note.updatedAt, language)}
                  </span>
                </div>

                <h4
                  className={`text-xs font-bold leading-snug line-clamp-1 ${
                    isActive
                      ? 'text-blue-900 dark:text-blue-200'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {note.title || 'Sem título'}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {cleanPreview || 'Nenhum conteúdo adicional...'}
                </p>

                {note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-medium text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[9px] text-slate-400">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
