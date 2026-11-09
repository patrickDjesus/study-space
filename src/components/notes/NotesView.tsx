import React, { useState } from 'react';
import { NotesSidebar } from './NotesSidebar.tsx';
import { NoteEditor } from './NoteEditor.tsx';
import { NoteAnalysisModal } from './NoteAnalysisModal.tsx';

export const NotesView: React.FC = () => {
  const [mobilePane, setMobilePane] = useState<'list' | 'editor'>('list');

  return (
    <div className="h-[calc(100vh-140px)] min-h-[580px] flex flex-col">
      {/* Desktop Split View & Mobile View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden">
        {/* Left Column: Sidebar / Notes List (4 cols on lg, or shown when mobilePane === 'list') */}
        <div
          className={`lg:col-span-4 h-full overflow-hidden ${
            mobilePane === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          <NotesSidebar onSelectNote={() => setMobilePane('editor')} />
        </div>

        {/* Right Column: Note Editor (8 cols on lg, or shown when mobilePane === 'editor') */}
        <div
          className={`lg:col-span-8 h-full overflow-hidden ${
            mobilePane === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <NoteEditor onBackToList={() => setMobilePane('list')} />
        </div>
      </div>

      {/* AI Analysis Modal */}
      <NoteAnalysisModal />
    </div>
  );
};
