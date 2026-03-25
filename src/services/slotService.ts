/**
 * Slot Service
 *
 * Service layer for moniteur slot operations including CRUD, real-time subscriptions,
 * and booking management.
 *
 * All operations use try/catch for error handling and the Firebase singleton pattern.
 *
 * @module @services/slotService
 */

import { getDbInstance } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  runTransaction,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import type { MoniteurSlot, SlotStatus, SlotType, SlotFilters, SlotInput } from '../types/slot.types';
import type { ServiceResult, CreateResult, SlotServiceResult } from '../types/service.types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Valid SlotType values
 */
const VALID_SLOT_TYPES: SlotType[] = ['PRIVATE', 'GROUP'];

/**
 * Valid SlotStatus values
 */
const VALID_SLOT_STATUSES: SlotStatus[] = ['available', 'booked', 'cancelled'];

const COLLECTION_NAME = 'slots_moniteurs';
const TIMEZONE = 'America/Martinique';
const db = getDbInstance();

/**
 * Map Firestore document data to MoniteurSlot type safely with runtime validation
 */
function mapToMoniteurSlot(docId: string, data: Record<string, unknown>): MoniteurSlot {
  // Validate required fields with runtime type checking
  if (typeof data.moniteur_id !== 'string') {
    throw new Error(`Invalid slot moniteur_id: expected string, got ${typeof data.moniteur_id}`);
  }

  if (typeof data.date !== 'string') {
    throw new Error(`Invalid slot date: expected string, got ${typeof data.date}`);
  }

  if (typeof data.start_time !== 'string') {
    throw new Error(`Invalid slot start_time: expected string, got ${typeof data.start_time}`);
  }

  if (typeof data.end_time !== 'string') {
    throw new Error(`Invalid slot end_time: expected string, got ${typeof data.end_time}`);
  }

  if (typeof data.type !== 'string' || !VALID_SLOT_TYPES.includes(data.type as SlotType)) {
    throw new Error(`Invalid slot type: expected ${VALID_SLOT_TYPES.join(' | ')}, got ${data.type}`);
  }

  if (typeof data.status !== 'string' || !VALID_SLOT_STATUSES.includes(data.status as SlotStatus)) {
    throw new Error(`Invalid slot status: expected ${VALID_SLOT_STATUSES.join(' | ')}, got ${data.status}`);
  }

  if (!(data.created_at instanceof Timestamp)) {
    throw new Error(`Invalid slot created_at: expected Timestamp, got ${typeof data.created_at}`);
  }

  // Optional fields validation
  if (data.court_id !== undefined && typeof data.court_id !== 'string') {
    throw new Error(`Invalid slot court_id: expected string or undefined, got ${typeof data.court_id}`);
  }

  if (data.max_participants !== undefined && typeof data.max_participants !== 'number') {
    throw new Error(`Invalid slot max_participants: expected number or undefined, got ${typeof data.max_participants}`);
  }

  if (data.current_participants !== undefined && typeof data.current_participants !== 'number') {
    throw new Error(`Invalid slot current_participants: expected number or undefined, got ${typeof data.current_participants}`);
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new Error(`Invalid slot description: expected string or undefined, got ${typeof data.description}`);
  }

  if (data.updated_at !== undefined && !(data.updated_at instanceof Timestamp)) {
    throw new Error(`Invalid slot updated_at: expected Timestamp or undefined, got ${typeof data.updated_at}`);
  }

  // All validations passed - safe to cast
  return {
    id: docId,
    moniteur_id: data.moniteur_id,
    date: data.date,
    start_time: data.start_time,
    end_time: data.end_time,
    type: data.type as SlotType,
    court_id: data.court_id as string | undefined,
    status: data.status as SlotStatus,
    max_participants: data.max_participants as number | undefined,
    current_participants: data.current_participants as number | undefined,
    description: data.description as string | undefined,
    created_at: data.created_at,
    updated_at: data.updated_at as Timestamp | undefined,
  };
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to moniteur's slots with real-time updates
 */
export function subscribeToMoniteurSlots(
  moniteurId: string,
  callback: (slots: MoniteurSlot[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('moniteur_id', '==', moniteurId),
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slots: MoniteurSlot[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
        });
        callback(slots);
      },
      (error) => {
        console.error('[subscribeToMoniteurSlots] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch moniteur slots'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToMoniteurSlots] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to available slots with real-time updates
 */
export function subscribeToAvailableSlots(
  callback: (slots: MoniteurSlot[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', 'available'),
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slots: MoniteurSlot[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
        });
        callback(slots);
      },
      (error) => {
        console.error('[subscribeToAvailableSlots] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch available slots'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToAvailableSlots] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to available slots for a specific date range
 */
export function subscribeToAvailableSlotsByDateRange(
  startDate: string,
  endDate: string,
  type: SlotType | undefined,
  callback: (slots: MoniteurSlot[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'available'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc'),
    ];

    if (type) {
      constraints.splice(1, 0, where('type', '==', type));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const slots: MoniteurSlot[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
        });
        callback(slots);
      },
      (error) => {
        console.error('[subscribeToAvailableSlotsByDateRange] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch available slots'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToAvailableSlotsByDateRange] Setup error:', error);
    throw error;
  }
}

// ==========================================
// GET OPERATIONS
// ==========================================

/**
 * Get moniteur slots
 */
export async function getMoniteurSlots(
  moniteurId: string,
  filters?: SlotFilters
): Promise<MoniteurSlot[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('moniteur_id', '==', moniteurId),
    ];

    if (filters?.date) {
      constraints.push(where('date', '==', filters.date));
    }

    if (filters?.startDate && filters?.endDate) {
      constraints.push(
        where('date', '>=', filters.startDate),
        where('date', '<=', filters.endDate)
      );
    }

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc')
    );

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getMoniteurSlots] Error:', error);
    throw error;
  }
}

/**
 * Get available slots
 */
export async function getAvailableSlots(filters?: SlotFilters): Promise<MoniteurSlot[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'available'),
    ];

    if (filters?.moniteurId) {
      constraints.push(where('moniteur_id', '==', filters.moniteurId));
    }

    if (filters?.date) {
      constraints.push(where('date', '==', filters.date));
    }

    if (filters?.startDate && filters?.endDate) {
      constraints.push(
        where('date', '>=', filters.startDate),
        where('date', '<=', filters.endDate)
      );
    }

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }

    constraints.push(
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc')
    );

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getAvailableSlots] Error:', error);
    throw error;
  }
}

/**
 * Get slots by date range
 */
export async function getSlotsByDateRange(
  startDate: string,
  endDate: string,
  moniteurId?: string
): Promise<MoniteurSlot[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc'),
      orderBy('start_time', 'asc'),
    ];

    if (moniteurId) {
      constraints.unshift(where('moniteur_id', '==', moniteurId));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToMoniteurSlot(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getSlotsByDateRange] Error:', error);
    throw error;
  }
}

/**
 * Get a single slot by ID
 */
export async function getSlotById(slotId: string): Promise<MoniteurSlot | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return mapToMoniteurSlot(docSnap.id, data as Record<string, unknown>);
  } catch (error) {
    console.error('[getSlotById] Error:', error);
    throw error;
  }
}

// ==========================================
// CREATE OPERATION
// ==========================================

/**
 * Create a new moniteur slot
 */
export async function createSlot(input: SlotInput & { moniteur_id: string }): Promise<CreateResult> {
  try {
    const slotData: Omit<MoniteurSlot, 'id'> = {
      moniteur_id: input.moniteur_id,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      type: input.type,
      court_id: input.court_id || null,
      status: 'available' as SlotStatus,
      max_participants: input.max_participants || (input.type === 'GROUP' ? 6 : 1),
      current_participants: 0,
      description: input.description || null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), slotData);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('[createSlot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create slot',
    };
  }
}

// ==========================================
// UPDATE OPERATION
// ==========================================

/**
 * Update an existing slot
 */
export async function updateSlot(
  slotId: string,
  updates: Partial<Omit<MoniteurSlot, 'id' | 'created_at'>>
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);

    await updateDoc(docRef, {
      ...updates,
      updated_at: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[updateSlot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update slot',
    };
  }
}

// ==========================================
// BOOKING OPERATIONS
// ==========================================

/**
 * Book a slot (increment participant count)
 * Uses transaction to prevent overbooking
 */
export async function bookSlot(slotId: string, userId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);

    await runTransaction(db, async (transaction) => {
      const slotDoc = await getDoc(docRef);

      if (!slotDoc.exists()) {
        throw new Error('Slot not found');
      }

      const slot = slotDoc.data() as MoniteurSlot;

      if (slot.status !== 'available') {
        throw new Error('Slot is not available');
      }

      const maxParticipants = slot.max_participants || 1;
      const currentParticipants = slot.current_participants || 0;

      if (currentParticipants >= maxParticipants) {
        throw new Error('Slot is full');
      }

      transaction.update(docRef, {
        current_participants: currentParticipants + 1,
        updated_at: Timestamp.now(),
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[bookSlot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to book slot',
    };
  }
}

/**
 * Cancel a slot booking (decrement participant count)
 */
export async function cancelSlotBooking(slotId: string, userId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);

    await runTransaction(db, async (transaction) => {
      const slotDoc = await getDoc(docRef);

      if (!slotDoc.exists()) {
        throw new Error('Slot not found');
      }

      const slot = slotDoc.data() as MoniteurSlot;

      const currentParticipants = slot.current_participants || 0;

      if (currentParticipants <= 0) {
        throw new Error('No participants to remove');
      }

      transaction.update(docRef, {
        current_participants: Math.max(0, currentParticipants - 1),
        updated_at: Timestamp.now(),
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[cancelSlotBooking] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel slot booking',
    };
  }
}

/**
 * Mark a slot as fully booked
 */
export async function markSlotAsBooked(slotId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);

    await updateDoc(docRef, {
      status: 'booked' as SlotStatus,
      updated_at: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[markSlotAsBooked] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark slot as booked',
    };
  }
}

/**
 * Cancel a slot (set status to cancelled)
 */
export async function cancelSlot(slotId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);

    await updateDoc(docRef, {
      status: 'cancelled' as SlotStatus,
      updated_at: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[cancelSlot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel slot',
    };
  }
}

// ==========================================
// DELETE OPERATION
// ==========================================

/**
 * Delete a slot
 */
export async function deleteSlot(slotId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, slotId);
    await deleteDoc(docRef);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deleteSlot] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete slot',
    };
  }
}
