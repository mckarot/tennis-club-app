/**
 * Services Module
 *
 * Central export point for all service layer modules.
 *
 * @module @services
 */

// User Service
export * from './userService';

// Court Service
export * as courtService from './courtService';
export {
  subscribeToAllCourts,
  subscribeToActiveCourts,
  getAllCourts,
  getActiveCourts,
  getCourtsByFilter,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  deactivateCourt,
} from './courtService';

// Reservation Service
export * as reservationService from './reservationService';
export {
  subscribeToUserReservations,
  subscribeToCourtReservations,
  subscribeToReservationsByDateRange,
  getUserReservations,
  getCourtReservations,
  getReservationsByFilter,
  getReservationById,
  checkCourtAvailability,
  createReservation,
  updateReservation,
  cancelReservation,
  deleteReservation,
} from './reservationService';

// Slot Service
export * as slotService from './slotService';
export {
  subscribeToMoniteurSlots,
  subscribeToAvailableSlots,
  subscribeToAvailableSlotsByDateRange,
  getMoniteurSlots,
  getAvailableSlots,
  getSlotsByDateRange,
  getSlotById,
  createSlot,
  updateSlot,
  bookSlot,
  cancelSlotBooking,
  markSlotAsBooked,
  cancelSlot,
  deleteSlot,
} from './slotService';
