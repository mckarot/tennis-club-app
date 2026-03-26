/**
 * Moniteur Dashboard Types
 *
 * Type definitions specific to the Moniteur Dashboard components.
 * Includes interfaces for calendar, sessions, participants, and efficiency stats.
 *
 * @module @types/moniteur.types
 */

import type { Timestamp } from 'firebase/firestore';
import type { MoniteurSlot, SlotType } from './slot.types';

// ==========================================
// SESSION BLOCK TYPES
// ==========================================

/**
 * Session block variant for visual styling
 * Based on PNG audit: PRO=#006b3f, GROUP=#9d431b
 */
export type SessionBlockVariant = 'pro' | 'group' | 'empty' | 'maintenance';

/**
 * Session block display data
 */
export interface SessionBlockData {
  id: string;
  variant: SessionBlockVariant;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  participantCount: number;
  maxParticipants?: number;
  slot?: MoniteurSlot;
}

// ==========================================
// WEEKLY CALENDAR TYPES
// ==========================================

/**
 * Day column data for weekly calendar
 */
export interface WeekDay {
  date: string; // YYYY-MM-DD
  dayName: string; // MON, TUE, etc.
  dayNumber: number; // 1-31
  isToday: boolean;
  slots: MoniteurSlot[];
}

/**
 * Weekly calendar display data
 */
export interface WeeklyCalendarData {
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  days: WeekDay[];
}

/**
 * Weekly calendar props
 */
export interface WeeklyCalendarProps {
  calendar: WeeklyCalendarData;
  onSlotClick?: (slot: MoniteurSlot) => void;
  onEmptySlotClick?: (date: string, time: string) => void;
}

// ==========================================
// UPCOMING LESSON TYPES
// ==========================================

/**
 * Participant info for avatar stack
 */
export interface ParticipantInfo {
  id: string;
  name: string;
  avatar?: string;
  level?: string;
  status: 'confirmed' | 'pending';
}

/**
 * Upcoming lesson display data
 */
export interface UpcomingLesson {
  id: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  duration: number; // minutes
  type: SlotType;
  title: string;
  description?: string;
  court?: {
    number: string;
    surface: string;
  };
  participants: ParticipantInfo[];
  isNext: boolean;
  slot?: MoniteurSlot;
}

/**
 * Upcoming lesson card props
 */
export interface UpcomingLessonCardProps {
  lesson: UpcomingLesson;
  onViewDetails?: (lesson: UpcomingLesson) => void;
  onCancel?: (lesson: UpcomingLesson) => void;
}

// ==========================================
// AVATAR STACK TYPES
// ==========================================

/**
 * Avatar stack props
 */
export interface AvatarStackProps {
  participants: ParticipantInfo[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  overlap?: number; // pixels
}

// ==========================================
// PARTICIPANTS PANEL TYPES
// ==========================================

/**
 * Panel view state
 */
export type PanelView = 'list' | 'add' | 'edit';

/**
 * Participants panel props
 */
export interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ParticipantInfo[];
  lessonId?: string;
  onAddParticipant?: () => void;
  onRemoveParticipant?: (participantId: string) => void;
}

// ==========================================
// DEFINE SLOT PANEL TYPES
// ==========================================

/**
 * Create slot input form data
 */
export interface CreateSlotInput {
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: SlotType;
  courtId?: string;
  maxParticipants?: number;
  description?: string;
}

/**
 * Define slot panel props
 */
export interface DefineSlotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSlotInput) => Promise<void>;
  initialDate?: string;
}

// ==========================================
// SESSION TYPE TOGGLE TYPES
// ==========================================

/**
 * Session type toggle props
 */
export interface SessionTypeToggleProps {
  value: SlotType;
  onChange: (type: SlotType) => void;
  disabled?: boolean;
}

// ==========================================
// CLUB EFFICIENCY TYPES
// ==========================================

/**
 * Club efficiency statistics
 */
export interface ClubEfficiencyStats {
  occupancyRate: number; // 0-100
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  totalStudents: number;
  growthRate?: number; // percentage change
  revenueEstimate?: number;
}

/**
 * Club efficiency card props
 */
export interface ClubEfficiencyCardProps {
  stats: ClubEfficiencyStats;
  period?: string;
}

// ==========================================
// DASHBOARD HOOK TYPES
// ==========================================

/**
 * Moniteur dashboard state
 */
export interface MoniteurDashboardState {
  // Data
  calendar: WeeklyCalendarData | null;
  upcomingLessons: UpcomingLesson[];
  stats: ClubEfficiencyStats | null;
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  
  // Errors
  error: Error | null;
}

/**
 * Moniteur dashboard actions
 */
export interface MoniteurDashboardActions {
  // Slot operations
  createSlot: (input: CreateSlotInput) => Promise<string | null>;
  updateSlot: (slotId: string, updates: Partial<MoniteurSlot>) => Promise<boolean>;
  cancelSlot: (slotId: string) => Promise<boolean>;
  deleteSlot: (slotId: string) => Promise<boolean>;
  
  // Panel management
  openDefineSlotPanel: () => void;
  closeDefineSlotPanel: () => void;
  openParticipantsPanel: (lessonId: string) => void;
  closeParticipantsPanel: () => void;
  
  // Refresh
  refreshData: () => Promise<void>;
}

/**
 * Moniteur dashboard hook return type
 */
export interface UseMoniteurDashboardReturn extends MoniteurDashboardState, MoniteurDashboardActions {
  // Panel states
  isDefineSlotPanelOpen: boolean;
  isParticipantsPanelOpen: boolean;
  selectedLessonId?: string;
}

// ==========================================
// HELPER TYPES
// ==========================================

/**
 * Time slot for scheduling
 */
export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
}

/**
 * Court information
 */
export interface CourtInfo {
  id: string;
  number: string;
  name: string;
  surface: 'Quick' | 'Terre';
  status: 'active' | 'maintenance' | 'closed';
}
