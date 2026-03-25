/**
 * Court Service
 *
 * Service layer for court operations including CRUD, real-time subscriptions,
 * and availability queries.
 *
 * All operations use try/catch for error handling and the Firebase singleton pattern.
 *
 * @module @services/courtService
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
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import type { Court, CourtInput, CourtStatus, CourtType, SurfaceType } from '../types/court.types';
import type { ServiceResult, CreateResult, CourtFilters } from '../types/service.types';

const COLLECTION_NAME = 'courts';
const db = getDbInstance();

/**
 * Valid CourtType values
 */
const VALID_COURT_TYPES: CourtType[] = ['Quick', 'Terre'];

/**
 * Valid SurfaceType values
 */
const VALID_SURFACE_TYPES: SurfaceType[] = ['Hard', 'Clay', 'Grass', 'Synthetic'];

/**
 * Valid CourtStatus values
 */
const VALID_COURT_STATUSES: CourtStatus[] = ['active', 'maintenance', 'closed'];

/**
 * Map Firestore document data to Court type safely with runtime validation
 */
function mapToCourt(docId: string, data: Record<string, unknown>): Court {
  // Validate required fields with runtime type checking
  if (typeof data.number !== 'number') {
    throw new Error(`Invalid court number: expected number, got ${typeof data.number}`);
  }

  if (typeof data.name !== 'string') {
    throw new Error(`Invalid court name: expected string, got ${typeof data.name}`);
  }

  if (typeof data.type !== 'string' || !VALID_COURT_TYPES.includes(data.type as CourtType)) {
    throw new Error(`Invalid court type: expected ${VALID_COURT_TYPES.join(' | ')}, got ${data.type}`);
  }

  if (typeof data.surface !== 'string' || !VALID_SURFACE_TYPES.includes(data.surface as SurfaceType)) {
    throw new Error(`Invalid court surface: expected ${VALID_SURFACE_TYPES.join(' | ')}, got ${data.surface}`);
  }

  if (typeof data.status !== 'string' || !VALID_COURT_STATUSES.includes(data.status as CourtStatus)) {
    throw new Error(`Invalid court status: expected ${VALID_COURT_STATUSES.join(' | ')}, got ${data.status}`);
  }

  if (typeof data.is_active !== 'boolean') {
    throw new Error(`Invalid court is_active: expected boolean, got ${typeof data.is_active}`);
  }

  if (!(data.createdAt instanceof Timestamp)) {
    throw new Error(`Invalid court createdAt: expected Timestamp, got ${typeof data.createdAt}`);
  }

  if (!(data.updatedAt instanceof Timestamp)) {
    throw new Error(`Invalid court updatedAt: expected Timestamp, got ${typeof data.updatedAt}`);
  }

  // Optional fields validation
  if (data.image !== undefined && typeof data.image !== 'string') {
    throw new Error(`Invalid court image: expected string or undefined, got ${typeof data.image}`);
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    throw new Error(`Invalid court description: expected string or undefined, got ${typeof data.description}`);
  }

  // All validations passed - safe to cast
  return {
    id: docId,
    number: data.number,
    name: data.name,
    type: data.type as CourtType,
    surface: data.surface as SurfaceType,
    status: data.status as CourtStatus,
    is_active: data.is_active,
    image: data.image as string | undefined,
    description: data.description as string | undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to all courts with real-time updates
 */
export function subscribeToAllCourts(
  callback: (courts: Court[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('number', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const courts: Court[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToCourt(doc.id, data as Record<string, unknown>);
        });
        callback(courts);
      },
      (error) => {
        console.error('[subscribeToAllCourts] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch courts'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToAllCourts] Setup error:', error);
    throw error;
  }
}

/**
 * Subscribe to active courts only with real-time updates
 */
export function subscribeToActiveCourts(
  callback: (courts: Court[]) => void,
  errorCallback?: (error: Error) => void
): Unsubscribe {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('is_active', '==', true),
      orderBy('number', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const courts: Court[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return mapToCourt(doc.id, data as Record<string, unknown>);
        });
        callback(courts);
      },
      (error) => {
        console.error('[subscribeToActiveCourts] Error:', error);
        if (errorCallback) {
          errorCallback(error instanceof Error ? error : new Error('Failed to fetch active courts'));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[subscribeToActiveCourts] Setup error:', error);
    throw error;
  }
}

// ==========================================
// GET OPERATIONS
// ==========================================

/**
 * Get all courts from Firestore
 */
export async function getAllCourts(): Promise<Court[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('number', 'asc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToCourt(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getAllCourts] Error:', error);
    throw error;
  }
}

/**
 * Get active courts only
 */
export async function getActiveCourts(): Promise<Court[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('is_active', '==', true),
      orderBy('number', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToCourt(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getActiveCourts] Error:', error);
    throw error;
  }
}

/**
 * Get courts filtered by criteria
 */
export async function getCourtsByFilter(filters: CourtFilters): Promise<Court[]> {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.isActive !== undefined) {
      constraints.push(where('is_active', '==', filters.isActive));
    }

    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }

    constraints.push(orderBy('number', 'asc'));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return mapToCourt(doc.id, data as Record<string, unknown>);
    });
  } catch (error) {
    console.error('[getCourtsByFilter] Error:', error);
    throw error;
  }
}

/**
 * Get a single court by ID
 */
export async function getCourtById(courtId: string): Promise<Court | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, courtId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return mapToCourt(docSnap.id, data as Record<string, unknown>);
  } catch (error) {
    console.error('[getCourtById] Error:', error);
    throw error;
  }
}

// ==========================================
// CREATE OPERATION
// ==========================================

/**
 * Create a new court
 */
export async function createCourt(input: CourtInput): Promise<CreateResult> {
  try {
    const courtData = {
      ...input,
      is_active: true,
      status: 'active' as CourtStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), courtData);

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.error('[createCourt] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create court',
    };
  }
}

// ==========================================
// UPDATE OPERATION
// ==========================================

/**
 * Update an existing court
 */
export async function updateCourt(
  courtId: string,
  updates: Partial<Omit<Court, 'id' | 'createdAt'>>
): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, courtId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[updateCourt] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update court',
    };
  }
}

// ==========================================
// DELETE OPERATION
// ==========================================

/**
 * Delete a court
 */
export async function deleteCourt(courtId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, courtId);
    await deleteDoc(docRef);

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deleteCourt] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete court',
    };
  }
}

/**
 * Soft delete a court (set is_active to false)
 */
export async function deactivateCourt(courtId: string): Promise<ServiceResult<void>> {
  try {
    const docRef = doc(db, COLLECTION_NAME, courtId);

    await updateDoc(docRef, {
      is_active: false,
      status: 'closed' as CourtStatus,
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[deactivateCourt] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate court',
    };
  }
}
