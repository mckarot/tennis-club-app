/**
 * Client Dashboard type definitions
 * 
 * Types specific to the Client Dashboard phase 7.2
 */

import type { Timestamp } from 'firebase/firestore';
import type { CourtType } from '../../types/court.types';
import type { ReservationStatus } from '../../types/reservation.types';

// ==========================================
// DASHBOARD STATS TYPES
// ==========================================

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  activeBookings: number;
  maintenanceCount: number;
  availableSlots: number;
}

/**
 * Stat card configuration
 */
export interface StatCardData {
  id: string;
  label: string;
  value: number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

// ==========================================
// COURT GRID TYPES
// ==========================================

/**
 * Court grid cell state (4 states per PNG audit)
 */
export type CourtCellState = 'available' | 'confirmed' | 'maintenance' | 'pending';

/**
 * Court grid cell data
 */
export interface CourtGridCell {
  id: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  courtType: CourtType;
  date: Date;
  hour: number;
  state: CourtCellState;
  reservationId?: string;
}

/**
 * Court grid configuration
 */
export interface CourtGridConfig {
  totalCourts: number;
  totalRows: number;
  startHour: number;
  endHour: number;
}

/**
 * Court grid cell props
 */
export interface CourtGridCellProps {
  cell: CourtGridCell;
  onClick?: (cell: CourtGridCell) => void;
}

// ==========================================
// RESERVATION CARD TYPES
// ==========================================

/**
 * Upcoming reservation data
 */
export interface UpcomingReservation {
  id: string;
  courtId: string;
  courtNumber: number;
  courtType: CourtType;
  userId: string;
  userName: string;
  startTime: Timestamp;
  endTime: Timestamp;
  status: ReservationStatus;
  type: 'location_libre' | 'cours_collectif' | 'cours_private';
}

/**
 * Reservation card props
 */
export interface ReservationCardProps {
  reservation: UpcomingReservation;
  onClick?: (reservation: UpcomingReservation) => void;
}

// ==========================================
// DASHBOARD HERO TYPES
// ==========================================

/**
 * Dashboard hero props
 */
export interface DashboardHeroProps {
  userName: string;
  onBookNowClick?: () => void;
  onViewScheduleClick?: () => void;
}

// ==========================================
// MAINTENANCE NOTE TYPES
// ==========================================

/**
 * Maintenance note data
 */
export interface MaintenanceNote {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

/**
 * Club maintenance note widget props
 */
export interface ClubMaintenanceNoteProps {
  note: MaintenanceNote;
  onDismiss?: () => void;
}

// ==========================================
// LOCATION WIDGET TYPES
// ==========================================

/**
 * Location widget data
 */
export interface LocationData {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  mapUrl: string;
}

/**
 * Location widget props
 */
export interface LocationWidgetProps {
  location: LocationData;
  onGetDirections?: () => void;
}

// ==========================================
// HOOK TYPES
// ==========================================

/**
 * Client dashboard hook return type
 */
export interface UseClientDashboardReturn {
  // Stats
  stats: DashboardStats;
  statsLoading: boolean;
  
  // Court grid
  courtGrid: CourtGridCell[][];
  gridLoading: boolean;
  
  // Upcoming reservations
  upcomingReservations: UpcomingReservation[];
  reservationsLoading: boolean;
  
  // Maintenance note
  maintenanceNote: MaintenanceNote | null;
  
  // Location
  location: LocationData;
  
  // User
  userName: string;
  
  // Actions
  handleBookNow: () => void;
  handleViewSchedule: () => void;
  handleCellClick: (cell: CourtGridCell) => void;
  handleReservationClick: (reservation: UpcomingReservation) => void;
  
  // Errors
  error: Error | null;
}

// ==========================================
// HELPER TYPES
// ==========================================

/**
 * Court cell state style configuration
 */
export interface CourtCellStyleConfig {
  base: string;
  state: Record<CourtCellState, string>;
  courtType: Record<CourtType, string>;
}
