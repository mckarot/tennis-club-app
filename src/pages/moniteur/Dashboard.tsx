/**
 * Moniteur Dashboard
 *
 * Main dashboard for moniteur users.
 * Assembles all moniteur dashboard components:
 * - WeeklyCalendar
 * - DefineSlotPanel
 * - UpcomingLessonCard
 * - ParticipantsPanel
 * - ClubEfficiencyCard
 *
 * Features:
 * - Real-time data with useMoniteurDashboard hook
 * - Slot creation and management
 * - Participant management
 * - Club efficiency statistics
 * - Responsive layout
 * - ARIA compliant
 * - Framer Motion animations
 *
 * @module @pages/moniteur/Dashboard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useMoniteurDashboard } from '../../hooks/useMoniteurDashboard';
import { WeeklyCalendar } from '../../components/moniteur/WeeklyCalendar/WeeklyCalendar';
import { DefineSlotPanel } from '../../components/moniteur/DefineSlotPanel/DefineSlotPanel';
import { UpcomingLessonCard } from '../../components/moniteur/UpcomingLessonCard/UpcomingLessonCard';
import { ParticipantsPanel } from '../../components/moniteur/ParticipantsPanel/ParticipantsPanel';
import { ClubEfficiencyCard } from '../../components/moniteur/ClubEfficiencyCard/ClubEfficiencyCard';
import type { CreateSlotInput } from '../../types/moniteur.types';
import type { MoniteurSlot } from '../../types/slot.types';

/**
 * Dashboard Component
 */
export function Dashboard() {
  const {
    // Data
    calendar,
    upcomingLessons,
    stats,
    
    // Loading states
    isLoading,
    isSubmitting,
    
    // Errors
    error,
    
    // Slot operations
    createSlot,
    cancelSlot,
    
    // Panel management
    openDefineSlotPanel,
    closeDefineSlotPanel,
    openParticipantsPanel,
    closeParticipantsPanel,
    
    // Panel states
    isDefineSlotPanelOpen,
    isParticipantsPanelOpen,
    selectedLessonId,
  } = useMoniteurDashboard();

  /**
   * Handle slot click from calendar
   */
  const handleSlotClick = (slot: MoniteurSlot) => {
    console.log('[Dashboard] Slot clicked:', slot);
    // TODO: Open slot details or edit panel
  };

  /**
   * Handle empty slot click from calendar
   */
  const handleEmptySlotClick = (date: string, time: string) => {
    console.log('[Dashboard] Empty slot clicked:', date, time);
    openDefineSlotPanel();
  };

  /**
   * Handle lesson details view
   */
  const handleViewDetails = (lessonId: string) => {
    console.log('[Dashboard] View details:', lessonId);
    openParticipantsPanel(lessonId);
  };

  /**
   * Handle lesson cancellation
   */
  const handleCancelLesson = async (lessonId: string) => {
    if (window.confirm('Are you sure you want to cancel this lesson?')) {
      const success = await cancelSlot(lessonId);
      if (success) {
        console.log('[Dashboard] Lesson cancelled');
      }
    }
  };

  /**
   * Handle create slot submission
   */
  const handleCreateSlot = async (input: CreateSlotInput) => {
    const slotId = await createSlot(input);
    if (slotId) {
      console.log('[Dashboard] Slot created:', slotId);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Tableau de bord
          </h1>
          <p className="font-body text-sm text-on-surface/60 mt-1">
            Gérez vos créneaux et consultez vos cours
          </p>
        </div>

        <motion.button
          onClick={openDefineSlotPanel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg
                   bg-primary text-white font-semibold
                   hover:opacity-90 transition-opacity duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="material-symbols-outlined">add_circle</span>
          Créer un créneau
        </motion.button>
      </motion.header>

      {/* Error banner */}
      {error && (
        <motion.div
          className="rounded-lg bg-tertiary/10 p-4 border-l-4 border-tertiary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          role="alert"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-tertiary">error</span>
            <div>
              <p className="font-body text-sm font-semibold text-tertiary">
                Error
              </p>
              <p className="font-body text-sm text-tertiary/80">
                {error.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Calendar */}
          <section aria-label="Weekly calendar">
            {isLoading ? (
              <div className="rounded-xl bg-surface-container-low p-6 animate-pulse">
                <div className="h-64 bg-surface-container-highest/30 rounded" />
              </div>
            ) : (
              <WeeklyCalendar
                calendar={calendar!}
                onSlotClick={handleSlotClick}
                onEmptySlotClick={handleEmptySlotClick}
              />
            )}
          </section>

          {/* Club Efficiency */}
          <section aria-label="Club efficiency statistics">
            {isLoading ? (
              <div className="rounded-xl bg-surface-container-low p-6 animate-pulse">
                <div className="h-40 bg-surface-container-highest/30 rounded" />
              </div>
            ) : (
              <ClubEfficiencyCard
                stats={stats!}
                period="This week"
              />
            )}
          </section>
        </div>

        {/* Right column - Upcoming lessons */}
        <div className="space-y-4">
          <motion.h2
            className="font-headline text-lg font-bold text-on-surface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Cours à venir
          </motion.h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl bg-surface-container-low p-6 animate-pulse"
                >
                  <div className="h-48 bg-surface-container-highest/30 rounded" />
                </div>
              ))}
            </div>
          ) : upcomingLessons.length === 0 ? (
            <motion.div
              className="rounded-xl bg-surface-container-low p-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-container-highest/30
                            flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface/40">
                  event_busy
                </span>
              </div>
              <p className="font-body text-base text-on-surface/70 mb-2">
                Aucun cours prévu
              </p>
              <p className="font-body text-sm text-on-surface/50">
                Créez un créneau pour commencer
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {upcomingLessons.slice(0, 3).map((lesson, index) => (
                <UpcomingLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onViewDetails={() => handleViewDetails(lesson.id)}
                  onCancel={() => handleCancelLesson(lesson.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions (mobile-friendly) */}
      <section aria-label="Quick actions" className="pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/moniteur/slots"
            icon="add_circle"
            label="Créer un créneau"
            delay={0.1}
          />
          <QuickActionCard
            href="/moniteur/schedule"
            icon="calendar_view_week"
            label="Mon emploi du temps"
            delay={0.15}
          />
          <QuickActionCard
            href="/moniteur/students"
            icon="groups"
            label="Mes élèves"
            delay={0.2}
          />
          <QuickActionCard
            href="/moniteur/profile"
            icon="person"
            label="Mon profil"
            delay={0.25}
          />
        </div>
      </section>

      {/* Panels */}
      <DefineSlotPanel
        isOpen={isDefineSlotPanelOpen}
        onClose={closeDefineSlotPanel}
        onSubmit={handleCreateSlot}
      />

      <ParticipantsPanel
        isOpen={isParticipantsPanelOpen}
        onClose={closeParticipantsPanel}
        participants={
          selectedLessonId
            ? upcomingLessons.find((l) => l.id === selectedLessonId)?.participants || []
            : []
        }
        lessonId={selectedLessonId}
        onAddParticipant={() => console.log('[Dashboard] Add participant')}
        onRemoveParticipant={(participantId) =>
          console.log('[Dashboard] Remove participant:', participantId)
        }
      />
    </div>
  );
}

/**
 * QuickActionCard Component (internal)
 */
interface QuickActionCardProps {
  href: string;
  icon: string;
  label: string;
  delay: number;
}

function QuickActionCard({ href, icon, label, delay }: QuickActionCardProps) {
  return (
    <motion.a
      href={href}
      className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6
               transition-colors hover:bg-surface-container-high
               focus:outline-none focus:ring-2 focus:ring-primary"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="material-symbols-outlined text-4xl text-primary">{icon}</span>
      <span className="mt-3 font-body text-sm font-medium text-on-surface">{label}</span>
    </motion.a>
  );
}

export default Dashboard;
