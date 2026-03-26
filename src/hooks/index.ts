export { useCourtGrid } from './useCourtGrid';
export type { UseCourtGridOptions, UseCourtGridReturn } from './useCourtGrid';

export { useDateFilter } from './useDateFilter';
export type { UseDateFilterReturn } from './useDateFilter';

export { useViewToggle } from './useViewToggle';
export type { UseViewToggleReturn } from './useViewToggle';

export { useReservations } from './useReservations';
export type { CreateReservationInput, UseReservationsReturn } from './useReservations';

// Real-time Reservation hooks (Phase 6)
export { useRealtimeReservations } from './useRealtimeReservations';
export type { UseRealtimeReservationsOptions, UseRealtimeReservationsReturn } from './useRealtimeReservations';

// Booking flow hook (Phase 6)
export { useBooking } from './useBooking';
export type { BookingStep, BookingState, UseBookingReturn, TimeSlot, CreateBookingData } from './useBooking';

// Auth hooks
export { useAuth } from './useAuth';
export type { UseAuthReturn } from './useAuth';

export { usePasswordValidation } from './usePasswordValidation';
export type { UsePasswordValidationReturn } from './usePasswordValidation';

export { useForgotPassword } from './useForgotPassword';
export type { UseForgotPasswordReturn } from './useForgotPassword';

export { useAuthForm } from './useAuthForm';
export type { UseAuthFormReturn, UseAuthFormOptions, FormValues } from './useAuthForm';

// Landing page hook (Phase 7.1)
export { useLandingData } from './useLandingData';
export type { UseLandingDataReturn } from './useLandingData';

// Moniteur dashboard hook (Phase 7.3)
export { useMoniteurDashboard } from './useMoniteurDashboard';
export type { UseMoniteurDashboardReturn } from './useMoniteurDashboard';

// Admin dashboard hooks (Phase 8.1)
export { useAdminDashboard } from './useAdminDashboard';
export type {
  DashboardStats,
  UseAdminDashboardReturn,
} from './useAdminDashboard';

export { useCourtUtilization } from './useCourtUtilization';
export type {
  CourtUtilizationSlot,
  UseCourtUtilizationReturn,
} from './useCourtUtilization';

export { useUserDirectory } from './useUserDirectory';
export type {
  UserDirectoryEntry,
  UserFilters,
  PaginationState,
  UseUserDirectoryReturn,
} from './useUserDirectory';

export { useCourtDeployment } from './useCourtDeployment';
export type {
  CourtDeployment,
  UseCourtDeploymentReturn,
} from './useCourtDeployment';
