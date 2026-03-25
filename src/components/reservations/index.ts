/**
 * Reservation components barrel export
 *
 * Phase 6: Reservation System Components
 * - Booking Flow: BookingForm, BookingConfirmationModal, TimeSlotGrid, CourtSelector
 * - Reservation Management: MyReservationsList, ReservationActions, ReservationFilters, StatsCards
 * - Real-time Features: RealtimeGrid
 */

// Booking Flow Components
export { BookingForm } from './BookingForm/BookingForm';
export type { BookingFormProps, BookingFormData } from './BookingForm/BookingForm';

export { BookingConfirmationModal } from './BookingConfirmationModal/BookingConfirmationModal';
export type { BookingConfirmationModalProps } from './BookingConfirmationModal/BookingConfirmationModal';

export { TimeSlotGrid } from './TimeSlotGrid/TimeSlotGrid';
export type { TimeSlotGridProps, GridCell } from './TimeSlotGrid/TimeSlotGrid';

export { CourtSelector } from './CourtSelector/CourtSelector';
export type { CourtSelectorProps, SurfaceFilter } from './CourtSelector/CourtSelector';

// Reservation Management Components
export { MyReservationsList } from './MyReservationsList/MyReservationsList';
export type { MyReservationsListProps } from './MyReservationsList/MyReservationsList';

export { ReservationActions } from './ReservationActions/ReservationActions';
export type { ReservationActionsProps } from './ReservationActions/ReservationActions';

export { ReservationFilters } from './ReservationFilters/ReservationFilters';
export type { ReservationFiltersProps, FilterState } from './ReservationFilters/ReservationFilters';

export { StatsCards } from './StatsCards/StatsCards';
export type { StatsCardsProps, StatsType } from './StatsCards/StatsCards';

// Real-time Features
export { RealtimeGrid } from './RealtimeGrid/RealtimeGrid';
export type { RealtimeGridProps } from './RealtimeGrid/RealtimeGrid';

// Legacy exports from Phase 5
export { ReservationCard } from './ReservationCard/ReservationCard';
export type { ReservationCardProps } from './ReservationCard/ReservationCard';
export type { ReservationStatusConfig, ReservationTypeConfig } from './ReservationCard/ReservationCard.types';
export { reservationStatusConfig, reservationTypeConfig } from './ReservationCard/ReservationCard.types';

export { UpcomingPanel } from './UpcomingPanel/UpcomingPanel';
export type { UpcomingPanelProps } from './UpcomingPanel/UpcomingPanel.types';
export type { PanelState, EmptyStateConfig } from './UpcomingPanel/UpcomingPanel.types';
export { emptyStateConfig } from './UpcomingPanel/UpcomingPanel.types';

export { DateFilter } from './DateFilter/DateFilter';
export type { DateFilterProps } from './DateFilter/DateFilter';

export { ViewToggle } from './ViewToggle/ViewToggle';
export type { ViewToggleProps } from './ViewToggle/ViewToggle';
export type { ViewMode } from './ViewToggle/ViewToggle.types';
