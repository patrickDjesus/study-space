/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { MobileNav } from './components/layout/MobileNav.tsx';
import { HomeView } from './components/home/HomeView.tsx';
import { CalendarView } from './components/calendar/CalendarView.tsx';
import { EventModal } from './components/calendar/EventModal.tsx';
import { DayDetailDrawer } from './components/calendar/DayDetailDrawer.tsx';
import { AiPlannerModal } from './components/calendar/AiPlannerModal.tsx';
import { NotesView } from './components/notes/NotesView.tsx';
import { FeaturePlaceholder } from './components/placeholder/FeaturePlaceholder.tsx';

const MainApp: React.FC = () => {
  const { activeTab } = useStudy();

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Fixed Header */}
      <Header />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab !== 'home' && activeTab !== 'calendar' && activeTab !== 'notes' && (
          <FeaturePlaceholder tab={activeTab} />
        )}
      </main>

      {/* Slide-over Drawer for single-day studies */}
      <DayDetailDrawer />

      {/* Add / Edit Study Event Dialog */}
      <EventModal />

      {/* Weekly AI Planner Modal */}
      <AiPlannerModal />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainApp />
    </StudyProvider>
  );
}
