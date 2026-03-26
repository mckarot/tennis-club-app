/**
 * useMoniteurDashboard Hook
 *
 * Main hook for Moniteur Dashboard data management.
 * Handles real-time subscriptions, CRUD operations, and state management.
 *
 * Features:
 * - Real-time slot subscriptions with onSnapshot
 * - Real-time reservation subscriptions
 * - CRUD operations with try/catch
 * - Club efficiency stats calculation
 * - Panel state management
 *
 * @module @hooks/useMoniteurDashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { getDbInstance } from '../config/firebase.config';
import {
  createSlot as createSlotService,
  updateSlot as updateSlotService,
  cancelSlot as cancelSlotService,
  deleteSlot as deleteSlotService,
  subscribeToMoniteurSlots,
  subscribeToMoniteurReservations,
  getClubEfficiencyStats,
} from '../services/slotService';
import type { MoniteurSlot, SlotType } from '../types/slot.types';
import type {
  WeeklyCalendarData,
  WeekDay,
  UpcomingLesson,
  ParticipantInfo,
  ClubEfficiencyStats,
  CreateSlotInput,
  UseMoniteurDashboardReturn,
} from '../types/moniteur.types';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'America/Martinique';
const COLLECTION_NAME = 'slots_moniteurs';

/**
 * Get current user ID (from auth context in real app)
 * For now, using a placeholder
 */
function getCurrentUserId(): string {
  // TODO: Replace with actual auth context
  return 'demo-moniteur-id';
}

/**
 * Format timestamp to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return dayjs(date).tz(TIMEZONE).format('YYYY-MM-DD');
}

/**
 * Format timestamp to HH:MM
 */
function formatTime(date: Date): string {
  return dayjs(date).tz(TIMEZONE).format('HH:mm');
}

/**
 * Get week start (Monday) and end (Sunday) for a given date
 */
function getWeekBounds(date: Date): { start: string; end: string } {
  const weekStart = dayjs(date).tz(TIMEZONE).startOf('week').add(1, 'day'); // Monday
  const weekEnd = weekStart.add(6, 'days');
  return {
    start: weekStart.format('YYYY-MM-DD'),
    end: weekEnd.format('YYYY-MM-DD'),
  };
}

/**
 * Build weekly calendar data from slots
 */
function buildWeeklyCalendar(slots: MoniteurSlot[], referenceDate: Date): WeeklyCalendarData {
  const { start, end } = getWeekBounds(referenceDate);
  const weekStart = dayjs(start).tz(TIMEZONE);
  
  const days: WeekDay[] = [];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const today = formatDate(new Date());

  for (let i = 0; i < 7; i++) {
    const currentDate = weekStart.add(i, 'day');
    const dateStr = currentDate.format('YYYY-MM-DD');
    
    const daySlots = slots.filter(slot => slot.date === dateStr);

    days.push({
      date: dateStr,
      dayName: dayNames[i],
      dayNumber: currentDate.date(),
      isToday: dateStr === today,
      slots: daySlots,
    });
  }

  return {
    weekStart: start,
    weekEnd: end,
    days,
  };
}

/**
 * Map MoniteurSlot to UpcomingLesson
 */
function mapToUpcomingLesson(slot: MoniteurSlot, isNext: boolean): UpcomingLesson {
  return {
    id: slot.id || '',
    startTime: slot.start_time,
    endTime: slot.end_time,
    duration: 60, // Default, could be calculated from times
    type: slot.type,
    title: slot.type === 'PRIVATE' ? 'Private Lesson' : 'Group Lesson',
    description: slot.description || undefined,
    court: slot.court_id ? {
      number: '04', // TODO: Map from court_id
      surface: 'Clay',
    } : undefined,
    participants: [], // TODO: Fetch from reservations
    isNext,
    slot,
  };
}

/**
 * Map reservation to ParticipantInfo
 */
interface ReservationInput {
  user_id: string;
  user_name?: string;
  status: string;
}

function mapToParticipantInfo(reservation: ReservationInput): ParticipantInfo {
  return {
    id: reservation.user_id,
    name: reservation.user_name || 'Unknown',
    avatar: undefined, // TODO: Fetch from user profile
    level: undefined, // TODO: Fetch from user profile
    status: reservation.status === 'confirmed' ? 'confirmed' : 'pending',
  };
}

/**
 * Main hook for Moniteur Dashboard
 */
export function useMoniteurDashboard(): UseMoniteurDashboardReturn {
  // State
  const [calendar, setCalendar] = useState<WeeklyCalendarData | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);
  const [stats, setStats] = useState<ClubEfficiencyStats | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const [isDefineSlotPanelOpen, setIsDefineSlotPanelOpen] = useState(false);
  const [isParticipantsPanelOpen, setIsParticipantsPanelOpen] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>();

  /**
   * Refresh all dashboard data
   */
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const moniteurId = getCurrentUserId();
      const { start, end } = getWeekBounds(new Date());
      
      // Fetch stats
      const statsResult = await getClubEfficiencyStats(moniteurId, start, end);
      if (statsResult.success && statsResult.data) {
        setStats({
          occupancyRate: statsResult.data.occupancyRate,
          totalSlots: statsResult.data.totalSlots,
          bookedSlots: statsResult.data.bookedSlots,
          availableSlots: statsResult.data.availableSlots,
          totalStudents: statsResult.data.totalParticipants,
          growthRate: 0, // TODO: Calculate from previous period
          revenueEstimate: statsResult.data.revenueEstimate,
        });
      }
    } catch (err) {
      console.error('[useMoniteurDashboard] Error refreshing data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Subscribe to slots with onSnapshot
   */
  useEffect(() => {
    const moniteurId = getCurrentUserId();
    
    const unsubscribeSlots = subscribeToMoniteurSlots(
      moniteurId,
      (slots) => {
        // Build calendar
        const calendarData = buildWeeklyCalendar(slots, new Date());
        setCalendar(calendarData);
        
        // Build upcoming lessons (next 7 days)
        const now = dayjs().tz(TIMEZONE);
        const nextWeek = now.add(7, 'day');
        
        const upcomingSlots = slots
          .filter(slot => {
            const slotDate = dayjs(slot.date).tz(TIMEZONE);
            return slotDate.isAfter(now) && slotDate.isBefore(nextWeek);
          })
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.start_time.localeCompare(b.start_time);
          });
        
        const lessons = upcomingSlots.map((slot, index) =>
          mapToUpcomingLesson(slot, index === 0)
        );
        setUpcomingLessons(lessons);
        
        setIsLoading(false);
      },
      (err) => {
        console.error('[useMoniteurDashboard] Slot subscription error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribeSlots();
  }, []);

  /**
   * Subscribe to reservations with onSnapshot
   */
  useEffect(() => {
    const moniteurId = getCurrentUserId();
    
    const unsubscribeReservations = subscribeToMoniteurReservations(
      moniteurId,
      (reservations) => {
        // Update participants in upcoming lessons
        setUpcomingLessons(prev => prev.map(lesson => {
          if (!lesson.slot) return lesson;
          
          const lessonReservations = reservations.filter(
            res => res.moniteur_id === moniteurId &&
                   formatDate(res.start_time.toDate()) === lesson.slot?.date &&
                   formatTime(res.start_time.toDate()) === lesson.startTime
          );
          
          const participants = lessonReservations.map(mapToParticipantInfo);
          
          return {
            ...lesson,
            participants,
          };
        }));
        
        // Update stats with participant count
        if (stats) {
          setStats({
            ...stats,
            totalStudents: reservations.length,
          });
        }
      },
      (err) => {
        console.error('[useMoniteurDashboard] Reservation subscription error:', err);
      }
    );

    return () => unsubscribeReservations();
  }, [stats]);

  /**
   * Create a new slot
   */
  const createSlot = useCallback(async (input: CreateSlotInput): Promise<string | null> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const moniteurId = getCurrentUserId();
      
      const result = await createSlotService({
        ...input,
        moniteur_id: moniteurId,
      });
      
      if (result.success && result.id) {
        return result.id;
      } else {
        throw new Error(result.error || 'Failed to create slot');
      }
    } catch (err) {
      console.error('[useMoniteurDashboard] Create slot error:', err);
      setError(err instanceof Error ? err : new Error('Failed to create slot'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Update an existing slot
   */
  const updateSlot = useCallback(async (
    slotId: string,
    updates: Partial<MoniteurSlot>
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await updateSlotService(slotId, updates);
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error || 'Failed to update slot');
      }
    } catch (err) {
      console.error('[useMoniteurDashboard] Update slot error:', err);
      setError(err instanceof Error ? err : new Error('Failed to update slot'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Cancel a slot
   */
  const cancelSlot = useCallback(async (slotId: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await cancelSlotService(slotId);
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error || 'Failed to cancel slot');
      }
    } catch (err) {
      console.error('[useMoniteurDashboard] Cancel slot error:', err);
      setError(err instanceof Error ? err : new Error('Failed to cancel slot'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Delete a slot
   */
  const deleteSlot = useCallback(async (slotId: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await deleteSlotService(slotId);
      
      if (result.success) {
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete slot');
      }
    } catch (err) {
      console.error('[useMoniteurDashboard] Delete slot error:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete slot'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  /**
   * Open define slot panel
   */
  const openDefineSlotPanel = useCallback(() => {
    setIsDefineSlotPanelOpen(true);
  }, []);

  /**
   * Close define slot panel
   */
  const closeDefineSlotPanel = useCallback(() => {
    setIsDefineSlotPanelOpen(false);
  }, []);

  /**
   * Open participants panel
   */
  const openParticipantsPanel = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId);
    setIsParticipantsPanelOpen(true);
  }, []);

  /**
   * Close participants panel
   */
  const closeParticipantsPanel = useCallback(() => {
    setIsParticipantsPanelOpen(false);
    setSelectedLessonId(undefined);
  }, []);

  return {
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
    updateSlot,
    cancelSlot,
    deleteSlot,
    
    // Panel management
    openDefineSlotPanel,
    closeDefineSlotPanel,
    openParticipantsPanel,
    closeParticipantsPanel,
    
    // Refresh
    refreshData,
    
    // Panel states
    isDefineSlotPanelOpen,
    isParticipantsPanelOpen,
    selectedLessonId,
  };
}

export default useMoniteurDashboard;
