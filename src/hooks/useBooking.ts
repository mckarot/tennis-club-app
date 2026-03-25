/**
 * useBooking Hook
 *
 * Booking flow state machine hook for managing the 3-step wizard:
 * 1. Select date
 * 2. Select court
 * 3. Select time slot
 *
 * @module @hooks/useBooking
 */

import { useState, useCallback, useMemo } from 'react';
import type { ReservationType } from '../types/reservation.types';
import type { Court } from '../types/court.types';

export type BookingStep = 'date' | 'court' | 'time';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  courtId?: string;
}

export interface BookingState {
  currentStep: BookingStep;
  selectedDate: Date | null;
  selectedCourt: Court | null;
  selectedTimeSlot: TimeSlot | null;
  reservationType: ReservationType;
  participants: number;
  notes: string;
}

export interface UseBookingReturn {
  state: BookingState;
  currentStep: BookingStep;
  totalSteps: number;
  isDateSelected: boolean;
  isCourtSelected: boolean;
  isTimeSelected: boolean;
  canProceed: boolean;
  canGoBack: boolean;
  selectDate: (date: Date) => void;
  selectCourt: (court: Court) => void;
  selectTimeSlot: (slot: TimeSlot) => void;
  setReservationType: (type: ReservationType) => void;
  setParticipants: (count: number) => void;
  setNotes: (notes: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: BookingStep) => void;
  reset: () => void;
  getBookingData: () => CreateBookingData | null;
}

export interface CreateBookingData {
  court_id: string;
  start_time: Date;
  end_time: Date;
  type: ReservationType;
  participants: number;
  notes: string;
  date: Date;
  court: Court;
  timeSlot: TimeSlot;
}

const DEFAULT_RESERVATION_TYPE: ReservationType = 'location_libre';
const DEFAULT_PARTICIPANTS = 1;

/**
 * Booking flow state machine hook
 */
export function useBooking(): UseBookingReturn {
  const [state, setState] = useState<BookingState>({
    currentStep: 'date',
    selectedDate: null,
    selectedCourt: null,
    selectedTimeSlot: null,
    reservationType: DEFAULT_RESERVATION_TYPE,
    participants: DEFAULT_PARTICIPANTS,
    notes: '',
  });

  const totalSteps = 3;

  const isDateSelected = useMemo(() => state.selectedDate !== null, [state.selectedDate]);
  const isCourtSelected = useMemo(
    () => state.selectedDate !== null && state.selectedCourt !== null,
    [state.selectedDate, state.selectedCourt]
  );
  const isTimeSelected = useMemo(
    () => state.selectedDate !== null && state.selectedCourt !== null && state.selectedTimeSlot !== null,
    [state.selectedDate, state.selectedCourt, state.selectedTimeSlot]
  );

  const canProceed = useMemo(() => {
    switch (state.currentStep) {
      case 'date':
        return isDateSelected;
      case 'court':
        return isCourtSelected;
      case 'time':
        return isTimeSelected;
      default:
        return false;
    }
  }, [state.currentStep, isDateSelected, isCourtSelected, isTimeSelected]);

  const canGoBack = useMemo(() => state.currentStep !== 'date', [state.currentStep]);

  const selectDate = useCallback((date: Date) => {
    setState((prev) => ({
      ...prev,
      selectedDate: date,
      selectedCourt: null,
      selectedTimeSlot: null,
    }));
  }, []);

  const selectCourt = useCallback((court: Court) => {
    setState((prev) => ({
      ...prev,
      selectedCourt: court,
      selectedTimeSlot: null,
    }));
  }, []);

  const selectTimeSlot = useCallback((slot: TimeSlot) => {
    setState((prev) => ({
      ...prev,
      selectedTimeSlot: slot,
    }));
  }, []);

  const setReservationType = useCallback((type: ReservationType) => {
    setState((prev) => ({
      ...prev,
      reservationType: type,
    }));
  }, []);

  const setParticipants = useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      participants: Math.max(1, count),
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      notes,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      switch (prev.currentStep) {
        case 'date':
          if (!isDateSelected) return prev;
          return { ...prev, currentStep: 'court' };
        case 'court':
          if (!isCourtSelected) return prev;
          return { ...prev, currentStep: 'time' };
        case 'time':
          return prev;
        default:
          return prev;
      }
    });
  }, [isDateSelected, isCourtSelected]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      switch (prev.currentStep) {
        case 'time':
          return { ...prev, currentStep: 'court' };
        case 'court':
          return { ...prev, currentStep: 'date' };
        case 'date':
          return prev;
        default:
          return prev;
      }
    });
  }, []);

  const goToStep = useCallback((step: BookingStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      currentStep: 'date',
      selectedDate: null,
      selectedCourt: null,
      selectedTimeSlot: null,
      reservationType: DEFAULT_RESERVATION_TYPE,
      participants: DEFAULT_PARTICIPANTS,
      notes: '',
    });
  }, []);

  const getBookingData = useCallback((): CreateBookingData | null => {
    if (!state.selectedDate || !state.selectedCourt || !state.selectedTimeSlot) {
      return null;
    }

    return {
      court_id: state.selectedCourt.id,
      start_time: state.selectedTimeSlot.start,
      end_time: state.selectedTimeSlot.end,
      type: state.reservationType,
      participants: state.participants,
      notes: state.notes,
      date: state.selectedDate,
      court: state.selectedCourt,
      timeSlot: state.selectedTimeSlot,
    };
  }, [state.selectedDate, state.selectedCourt, state.selectedTimeSlot, state.reservationType, state.participants, state.notes]);

  return {
    state,
    currentStep: state.currentStep,
    totalSteps,
    isDateSelected,
    isCourtSelected,
    isTimeSelected,
    canProceed,
    canGoBack,
    selectDate,
    selectCourt,
    selectTimeSlot,
    setReservationType,
    setParticipants,
    setNotes,
    nextStep,
    prevStep,
    goToStep,
    reset,
    getBookingData,
  };
}

export default useBooking;
