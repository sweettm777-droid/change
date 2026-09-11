import React, { useState, useEffect } from 'react';
import { Student } from './types';
import { INITIAL_STUDENTS } from './data/defaultData';
import { Navbar } from './components/Navbar';
import { SeatingTab } from './components/seating/SeatingTab';
import { CleaningTab } from './components/cleaning/CleaningTab';
import { StudentManagerModal } from './components/StudentManagerModal';
import { HelpModal } from './components/HelpModal';
import { soundEffects } from './utils/audio';

export default function App() {
  // Global students roster
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('app_students');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_STUDENTS;
  });

  // Active tab: seating vs cleaning
  const [activeTab, setActiveTab] = useState<'seating' | 'cleaning'>('seating');

  // Sound mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getMuted());

  // Modals
  const [isStudentManagerOpen, setIsStudentManagerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Sync students to localStorage
  useEffect(() => {
    localStorage.setItem('app_students', JSON.stringify(students));
  }, [students]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
  };

  const handleSaveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenStudentManager={() => setIsStudentManagerOpen(true)}
        totalStudents={students.length}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'seating' ? (
          <SeatingTab students={students} />
        ) : (
          <CleaningTab students={students} />
        )}
      </main>

      {/* Global Modals */}
      <StudentManagerModal
        isOpen={isStudentManagerOpen}
        onClose={() => setIsStudentManagerOpen(false)}
        students={students}
        onSaveStudents={handleSaveStudents}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
