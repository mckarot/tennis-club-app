# 04. Backend Services

## Firebase Service Layer for Tennis Club du François

This document defines the complete service layer for interacting with Firebase Firestore.

---

## 1. Service Architecture

```
src/services/
├── reservationService.ts    # Court bookings management
├── userService.ts           # User profiles and authentication
├── courtService.ts          # Court inventory management
├── slotService.ts           # Instructor availability slots
└── index.ts                 # Service exports
```

### Design Principles
1. **Single Responsibility**: Each service handles one collection
2. **Type Safety**: Full TypeScript typing for all operations
3. **Error Handling**: Consistent error handling with typed results
4. **Real-time**: Use `onSnapshot` for live data updates
5. **Transactions**: Use transactions for conflict-sensitive operations

---

## 2. Reservation Service

### `src/services/reservationService.ts`

```typescript
import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
  runTransaction,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { Reservation, ReservationType, ReservationStatus } from '../types/reservation.types';
import { toLocalTime, startOfDay, endOfDay } from '../utils/timezone';

const COLLECTION_NAME = 'reservations';

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to reservations for a specific court on a given date
 */
export const subscribeToCourtReservations = (
  courtId: string,
  date: Date,
  callback: (reservations: Reservation[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('court_id', '==', courtId),
    where('start_time', '>=', Timestamp.fromDate(startOfDay(date))),
    where('start_time', '<=', Timestamp.fromDate(endOfDay(date))),
    where('status', '==', 'confirmed')
  );

  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reservation));
    
    // Sort by start time
    reservations.sort((a, b) => 
      a.start_time.toMillis() - b.start_time.toMillis()
    );
    
    callback(reservations);
  });
};

/**
 * Subscribe to user's reservations
 */
export const subscribeToUserReservations = (
  userId: string,
  callback: (reservations: Reservation[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('user_id', '==', userId),
    where('start_time', '>=', Timestamp.fromDate(new Date())),
    orderBy('start_time', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reservation));
    callback(reservations);
  });
};

/**
 * Subscribe to today's reservations (for admin dashboard)
 */
export const subscribeToTodaysReservations = (
  callback: (reservations: Reservation[]) => void
) => {
  const today = new Date();
  const q = query(
    collection(db, COLLECTION_NAME),
    where('start_time', '>=', Timestamp.fromDate(startOfDay(today))),
    where('start_time', '<=', Timestamp.fromDate(endOfDay(today))),
    orderBy('start_time', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reservation));
    callback(reservations);
  });
};

/**
 * Subscribe to instructor's lessons
 */
export const subscribeToMoniteurLessons = (
  moniteurId: string,
  callback: (reservations: Reservation[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('moniteur_id', '==', moniteurId),
    where('type', 'in', ['cours_collectif', 'cours_private']),
    orderBy('start_time', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const reservations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Reservation));
    callback(reservations);
  });
};

// ==========================================
// QUERY FUNCTIONS
// ==========================================

/**
 * Get reservations for a court on a date range
 */
export const getCourtReservations = async (
  courtId: string,
  startDate: Date,
  endDate: Date
): Promise<Reservation[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('court_id', '==', courtId),
    where('start_time', '>=', Timestamp.fromDate(startOfDay(startDate))),
    where('start_time', '<=', Timestamp.fromDate(endOfDay(endDate)))
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Reservation));
};

/**
 * Get user's reservation history
 */
export const getUserReservations = async (
  userId: string,
  includePast = false
): Promise<Reservation[]> => {
  const constraints: QueryConstraint[] = [
    where('user_id', '==', userId)
  ];

  if (!includePast) {
    constraints.push(where('start_time', '>=', Timestamp.fromDate(new Date())));
  }

  constraints.push(orderBy('start_time', includePast ? 'desc' : 'asc'));

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Reservation));
};

/**
 * Get all reservations for analytics (admin only)
 */
export const getAllReservations = async (
  startDate?: Date,
  endDate?: Date
): Promise<Reservation[]> => {
  const constraints: QueryConstraint[] = [];

  if (startDate) {
    constraints.push(where('start_time', '>=', Timestamp.fromDate(startDate)));
  }
  if (endDate) {
    constraints.push(where('start_time', '<=', Timestamp.fromDate(endDate)));
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Reservation));
};

// ==========================================
// AVAILABILITY CHECKS
// ==========================================

/**
 * Check if a court is available at a specific time
 */
export const checkCourtAvailability = async (
  courtId: string,
  startTime: Date,
  endTime: Date
): Promise<{ available: boolean; conflict?: Reservation }> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('court_id', '==', courtId),
    where('status', '==', 'confirmed'),
    where('start_time', '<', Timestamp.fromDate(endTime)),
    where('end_time', '>', Timestamp.fromDate(startTime))
  );

  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    return {
      available: false,
      conflict: {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as Reservation
    };
  }

  return { available: true };
};

/**
 * Get available time slots for a court on a given date
 */
export const getAvailableSlots = async (
  courtId: string,
  date: Date,
  slotDuration: number = 60 // minutes
): Promise<{ start: Date; end: Date; available: boolean }[]> => {
  const reservations = await getCourtReservations(courtId, date, date);
  const openingHour = 6; // 06:00
  const closingHour = 22; // 22:00
  
  const slots = [];
  const currentDate = dayjs(date).tz('America/Martinique').startOf('day');
  
  for (let hour = openingHour; hour < closingHour; hour++) {
    const slotStart = currentDate.add(hour, 'hour').toDate();
    const slotEnd = currentDate.add(hour + 1, 'hour').toDate();
    
    const isAvailable = !reservations.some(res => {
      const resStart = res.start_time.toDate();
      const resEnd = res.end_time.toDate();
      return slotStart < resEnd && slotEnd > resStart;
    });
    
    slots.push({
      start: slotStart,
      end: slotEnd,
      available: isAvailable
    });
  }
  
  return slots;
};

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Create a new reservation (with transaction for conflict prevention)
 */
export const createReservation = async (
  reservationData: Omit<Reservation, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string; reservationId?: string }> => {
  try {
    const result = await runTransaction(db, async (transaction) => {
      // Check availability
      const availability = await checkCourtAvailability(
        reservationData.court_id,
        reservationData.start_time.toDate(),
        reservationData.end_time.toDate()
      );

      if (!availability.available) {
        throw new Error('This court is already reserved for the selected time slot.');
      }

      // Create new reservation
      const newResRef = doc(collection(db, COLLECTION_NAME));
      const newReservation: Omit<Reservation, 'id'> = {
        ...reservationData,
        created_at: Timestamp.now()
      };

      transaction.set(newResRef, newReservation);
      return newResRef.id;
    });

    return { success: true, reservationId: result };
  } catch (error) {
    console.error('Error creating reservation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Update an existing reservation
 */
export const updateReservation = async (
  reservationId: string,
  updates: Partial<Reservation>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const resRef = doc(db, COLLECTION_NAME, reservationId);
    
    // Validate update data
    if (updates.start_time || updates.end_time) {
      const resDoc = await getDoc(resRef);
      if (!resDoc.exists()) {
        return { success: false, error: 'Reservation not found' };
      }
      
      const currentData = resDoc.data() as Reservation;
      const newStart = updates.start_time || currentData.start_time;
      const newEnd = updates.end_time || currentData.end_time;
      
      // Check for conflicts if time changed
      if (
        updates.start_time?.toDate() !== currentData.start_time.toDate() ||
        updates.end_time?.toDate() !== currentData.end_time.toDate()
      ) {
        const availability = await checkCourtAvailability(
          currentData.court_id,
          newStart.toDate(),
          newEnd.toDate()
        );
        
        if (!availability.available) {
          return { success: false, error: 'Time slot conflict detected' };
        }
      }
    }
    
    await updateDoc(resRef, {
      ...updates,
      updated_at: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating reservation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Cancel a reservation
 */
export const cancelReservation = async (
  reservationId: string
): Promise<{ success: boolean; error?: string }> => {
  return updateReservation(reservationId, { status: 'cancelled' });
};

/**
 * Delete a reservation
 */
export const deleteReservation = async (
  reservationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, reservationId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Create maintenance booking (admin only)
 */
export const createMaintenanceBooking = async (
  courtId: string,
  startTime: Date,
  endTime: Date,
  description: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> => {
  return createReservation({
    court_id: courtId,
    user_id: adminId,
    start_time: Timestamp.fromDate(startTime),
    end_time: Timestamp.fromDate(endTime),
    type: 'maintenance',
    status: 'confirmed',
    title: 'Court Maintenance',
    description
  });
};

// ==========================================
// ANALYTICS FUNCTIONS
// ==========================================

/**
 * Get court utilization statistics
 */
export const getCourtUtilizationStats = async (
  courtId: string,
  startDate: Date,
  endDate: Date
): Promise<{ totalHours: number; bookedHours: number; utilizationRate: number }> => {
  const reservations = await getCourtReservations(courtId, startDate, endDate);
  
  const totalHours = dayjs(endDate).diff(dayjs(startDate), 'hour');
  const bookedHours = reservations.reduce((acc, res) => {
    const duration = res.end_time.toMillis() - res.start_time.toMillis();
    return acc + (duration / (1000 * 60 * 60)); // Convert to hours
  }, 0);
  
  return {
    totalHours,
    bookedHours,
    utilizationRate: totalHours > 0 ? (bookedHours / totalHours) * 100 : 0
  };
};

/**
 * Get peak hours analysis
 */
export const getPeakHoursAnalysis = async (
  date: Date
): Promise<{ hour: number; count: number }[]> => {
  const reservations = await getAllReservations(
    startOfDay(date),
    endOfDay(date)
  );
  
  const hourCounts = new Map<number, number>();
  
  reservations.forEach(res => {
    const hour = toLocalTime(res.start_time.toDate()).hour();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  
  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
};
```

---

## 3. User Service

### `src/services/userService.ts`

```typescript
import { db, auth } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { User, UserRole, UserStatus } from '../types/user.types';

const COLLECTION_NAME = 'users';

// ==========================================
// AUTHENTICATION
// ==========================================

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: UserRole = 'client'
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update auth profile
    await updateProfile(user, { displayName: name });

    // Create user document
    const userData: Omit<User, 'uid'> = {
      name,
      email,
      role,
      status: 'online',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    };

    await setDoc(doc(db, COLLECTION_NAME, user.uid), userData);

    return { 
      success: true, 
      user: { uid: user.uid, ...userData } as User 
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed' 
    };
  }
};

/**
 * Sign in user
 */
export const signInUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login
    await updateDoc(doc(db, COLLECTION_NAME, user.uid), {
      lastLoginAt: Timestamp.now(),
      status: 'online'
    });

    // Get user data
    const userDoc = await getDoc(doc(db, COLLECTION_NAME, user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found' };
    }

    return { 
      success: true, 
      user: { uid: user.uid, ...userDoc.data() } as User 
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sign in failed' 
    };
  }
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const userDoc = await getDoc(doc(db, COLLECTION_NAME, firebaseUser.uid));
    
    if (userDoc.exists()) {
      callback({ uid: firebaseUser.uid, ...userDoc.data() } as User);
    } else {
      callback(null);
    }
  });
};

// ==========================================
// USER PROFILE
// ==========================================

/**
 * Get user profile by UID
 */
export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, COLLECTION_NAME, uid));
  return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } as User : null;
};

/**
 * Get user profile by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const q = query(collection(db, COLLECTION_NAME), where('email', '==', email));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { uid: doc.id, ...doc.data() } as User;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  updates: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, uid), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update failed' 
    };
  }
};

/**
 * Update user status
 */
export const updateUserStatus = async (
  uid: string,
  status: UserStatus
): Promise<{ success: boolean; error?: string }> => {
  return updateUserProfile(uid, { status });
};

/**
 * Delete user account (admin only)
 */
export const deleteUserAccount = async (uid: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, uid));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

// ==========================================
// USER QUERIES
// ==========================================

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('role', '==', role));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
};

/**
 * Get all moniteurs
 */
export const getAllMoniteurs = async (): Promise<User[]> => {
  return getUsersByRole('moniteur');
};

/**
 * Subscribe to all users (for admin directory)
 */
export const subscribeToAllUsers = (
  callback: (users: User[]) => void
) => {
  return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    callback(users);
  });
};

/**
 * Search users by name
 */
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const allUsers = await getAllUsers();
  const term = searchTerm.toLowerCase();
  
  return allUsers.filter(user => 
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term)
  );
};
```

---

## 4. Court Service

### `src/services/courtService.ts`

```typescript
import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { Court, CourtType, CourtStatus } from '../types/court.types';

const COLLECTION_NAME = 'courts';

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to all courts
 */
export const subscribeToAllCourts = (
  callback: (courts: Court[]) => void
) => {
  return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
    const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
    // Sort by court number
    courts.sort((a, b) => a.number - b.number);
    callback(courts);
  });
};

/**
 * Subscribe to active courts only
 */
export const subscribeToActiveCourts = (
  callback: (courts: Court[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('is_active', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
    courts.sort((a, b) => a.number - b.number);
    callback(courts);
  });
};

// ==========================================
// QUERY FUNCTIONS
// ==========================================

/**
 * Get all courts
 */
export const getAllCourts = async (): Promise<Court[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
  courts.sort((a, b) => a.number - b.number);
  return courts;
};

/**
 * Get active courts only
 */
export const getActiveCourts = async (): Promise<Court[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('is_active', '==', true)
  );
  const snapshot = await getDocs(q);
  const courts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
  courts.sort((a, b) => a.number - b.number);
  return courts;
};

/**
 * Get court by ID
 */
export const getCourtById = async (courtId: string): Promise<Court | null> => {
  const courtDoc = await getDoc(doc(db, COLLECTION_NAME, courtId));
  return courtDoc.exists() ? { id: courtDoc.id, ...courtDoc.data() } as Court : null;
};

/**
 * Get courts by type
 */
export const getCourtsByType = async (type: CourtType): Promise<Court[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('type', '==', type));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
};

/**
 * Get courts by status
 */
export const getCourtsByStatus = async (status: CourtStatus): Promise<Court[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('status', '==', status));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Court));
};

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Create a new court (admin only)
 */
export const createCourt = async (
  courtData: Omit<Court, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; courtId?: string; error?: string }> => {
  try {
    const courtRef = doc(collection(db, COLLECTION_NAME));
    const newCourt: Omit<Court, 'id'> = {
      ...courtData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(courtRef, newCourt);
    return { success: true, courtId: courtRef.id };
  } catch (error) {
    console.error('Error creating court:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Create failed' 
    };
  }
};

/**
 * Update court (admin only)
 */
export const updateCourt = async (
  courtId: string,
  updates: Partial<Court>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, courtId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating court:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update failed' 
    };
  }
};

/**
 * Update court status
 */
export const updateCourtStatus = async (
  courtId: string,
  status: CourtStatus
): Promise<{ success: boolean; error?: string }> => {
  return updateCourt(courtId, { status, is_active: status === 'active' });
};

/**
 * Toggle court active status
 */
export const toggleCourtActive = async (
  courtId: string
): Promise<{ success: boolean; error?: string; newStatus?: boolean }> => {
  try {
    const courtDoc = await getDoc(doc(db, COLLECTION_NAME, courtId));
    
    if (!courtDoc.exists()) {
      return { success: false, error: 'Court not found' };
    }

    const currentData = courtDoc.data() as Court;
    const newActiveStatus = !currentData.is_active;

    await updateDoc(doc(db, COLLECTION_NAME, courtId), {
      is_active: newActiveStatus,
      status: newActiveStatus ? 'active' : 'maintenance',
      updatedAt: Timestamp.now()
    });

    return { success: true, newStatus: newActiveStatus };
  } catch (error) {
    console.error('Error toggling court status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Toggle failed' 
    };
  }
};

/**
 * Delete court (admin only)
 */
export const deleteCourt = async (courtId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, courtId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting court:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Initialize default courts (seed data)
 */
export const initializeDefaultCourts = async (): Promise<{ success: boolean; error?: string }> => {
  const defaultCourts = [
    { number: 1, name: 'Grand Court East', type: 'Quick', surface: 'Hard', status: 'active', is_active: true },
    { number: 2, name: 'Center Stage', type: 'Quick', surface: 'Hard', status: 'active', is_active: true },
    { number: 3, name: 'Shadow View', type: 'Quick', surface: 'Hard', status: 'active', is_active: true },
    { number: 4, name: 'Training Zone', type: 'Quick', surface: 'Hard', status: 'active', is_active: true },
    { number: 5, name: 'Clay Court North', type: 'Terre', surface: 'Clay', status: 'active', is_active: true },
    { number: 6, name: 'West End', type: 'Terre', surface: 'Clay', status: 'active', is_active: true }
  ];

  try {
    for (const court of defaultCourts) {
      const courtId = `court_${court.number.toString().padStart(2, '0')}`;
      const courtRef = doc(db, COLLECTION_NAME, courtId);
      const courtDoc = await getDoc(courtRef);

      if (!courtDoc.exists()) {
        await setDoc(courtRef, {
          ...court,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error initializing courts:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Initialization failed' 
    };
  }
};
```

---

## 5. Slot Service (Moniteur Availability)

### `src/services/slotService.ts`

```typescript
import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  increment
} from 'firebase/firestore';
import dayjs from 'dayjs';
import { MoniteurSlot, SlotType, SlotStatus } from '../types/slot.types';

const COLLECTION_NAME = 'slots_moniteurs';

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

/**
 * Subscribe to moniteur's slots for a date range
 */
export const subscribeToMoniteurSlots = (
  moniteurId: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  callback: (slots: MoniteurSlot[]) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('moniteur_id', '==', moniteurId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoniteurSlot));
    callback(slots);
  });
};

/**
 * Subscribe to available slots for a date
 */
export const subscribeToAvailableSlots = (
  date: string,
  type?: SlotType,
  callback: (slots: MoniteurSlot[]) => void
) => {
  const constraints: any[] = [
    where('date', '==', date),
    where('status', '==', 'available')
  ];

  if (type) {
    constraints.push(where('type', '==', type));
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const slots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoniteurSlot));
    callback(slots);
  });
};

// ==========================================
// QUERY FUNCTIONS
// ==========================================

/**
 * Get moniteur's slots for a date range
 */
export const getMoniteurSlots = async (
  moniteurId: string,
  startDate: string,
  endDate: string
): Promise<MoniteurSlot[]> => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('moniteur_id', '==', moniteurId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoniteurSlot));
};

/**
 * Get available slots for a date
 */
export const getAvailableSlots = async (
  date: string,
  type?: SlotType
): Promise<MoniteurSlot[]> => {
  const constraints: any[] = [
    where('date', '==', date),
    where('status', '==', 'available')
  ];

  if (type) {
    constraints.push(where('type', '==', type));
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoniteurSlot));
};

/**
 * Get slot by ID
 */
export const getSlotById = async (slotId: string): Promise<MoniteurSlot | null> => {
  const slotDoc = await getDoc(doc(db, COLLECTION_NAME, slotId));
  return slotDoc.exists() ? { id: slotDoc.id, ...slotDoc.data() } as MoniteurSlot : null;
};

// ==========================================
// CRUD OPERATIONS
// ==========================================

/**
 * Create a new availability slot
 */
export const createSlot = async (
  slotData: Omit<MoniteurSlot, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; slotId?: string; error?: string }> => {
  try {
    const slotRef = doc(collection(db, COLLECTION_NAME));
    const newSlot: Omit<MoniteurSlot, 'id'> = {
      ...slotData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    await setDoc(slotRef, newSlot);
    return { success: true, slotId: slotRef.id };
  } catch (error) {
    console.error('Error creating slot:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Create failed' 
    };
  }
};

/**
 * Update a slot
 */
export const updateSlot = async (
  slotId: string,
  updates: Partial<MoniteurSlot>
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, slotId), {
      ...updates,
      updated_at: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating slot:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update failed' 
    };
  }
};

/**
 * Book a slot (increment participant count)
 */
export const bookSlot = async (
  slotId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const slotDoc = await getDoc(doc(db, COLLECTION_NAME, slotId));
    
    if (!slotDoc.exists()) {
      return { success: false, error: 'Slot not found' };
    }

    const slotData = slotDoc.data() as MoniteurSlot;
    
    if (slotData.status !== 'available') {
      return { success: false, error: 'Slot not available' };
    }

    if (slotData.max_participants && slotData.current_participants && 
        slotData.current_participants >= slotData.max_participants) {
      return { success: false, error: 'Slot is full' };
    }

    await updateDoc(doc(db, COLLECTION_NAME, slotId), {
      current_participants: increment(1),
      status: (slotData.current_participants || 0) + 1 >= (slotData.max_participants || Infinity)
        ? 'booked'
        : 'available',
      updated_at: Timestamp.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error booking slot:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Booking failed' 
    };
  }
};

/**
 * Cancel a slot booking
 */
export const cancelSlotBooking = async (
  slotId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const slotDoc = await getDoc(doc(db, COLLECTION_NAME, slotId));
    
    if (!slotDoc.exists()) {
      return { success: false, error: 'Slot not found' };
    }

    const slotData = slotDoc.data() as MoniteurSlot;
    
    if (slotData.current_participants && slotData.current_participants > 0) {
      await updateDoc(doc(db, COLLECTION_NAME, slotId), {
        current_participants: increment(-1),
        status: 'available',
        updated_at: Timestamp.now()
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling slot booking:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Cancel failed' 
    };
  }
};

/**
 * Delete a slot
 */
export const deleteSlot = async (slotId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, slotId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting slot:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Delete failed' 
    };
  }
};

/**
 * Cancel all slots for a date
 */
export const cancelSlotsForDate = async (
  moniteurId: string,
  date: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const slots = await getMoniteurSlots(moniteurId, date, date);
    
    const updatePromises = slots.map(slot =>
      updateDoc(doc(db, COLLECTION_NAME, slot.id), {
        status: 'cancelled',
        updated_at: Timestamp.now()
      })
    );

    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error('Error cancelling slots:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Cancel failed' 
    };
  }
};

// ==========================================
// UTILITIES
// ==========================================

/**
 * Get weekly slots (Monday to Sunday)
 */
export const getWeeklySlots = async (
  moniteurId: string,
  weekStart: Date
): Promise<MoniteurSlot[]> => {
  const start = dayjs(weekStart).startOf('week').format('YYYY-MM-DD');
  const end = dayjs(weekStart).endOf('week').format('YYYY-MM-DD');
  
  return getMoniteurSlots(moniteurId, start, end);
};

/**
 * Check if moniteur is available at a specific time
 */
export const isMoniteurAvailable = async (
  moniteurId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  const slots = await getMoniteurSlots(moniteurId, date, date);
  
  return slots.some(slot => 
    slot.status === 'available' &&
    slot.start_time <= startTime &&
    slot.end_time >= endTime
  );
};
```

---

## 6. Service Index

### `src/services/index.ts`

```typescript
// Export all services
export * from './reservationService';
export * from './userService';
export * from './courtService';
export * from './slotService';

// Export types
export type { User, UserRole, UserStatus } from '../types/user.types';
export type { Court, CourtType, CourtStatus } from '../types/court.types';
export type { Reservation, ReservationType, ReservationStatus } from '../types/reservation.types';
export type { MoniteurSlot, SlotType, SlotStatus } from '../types/slot.types';
```

---

## 7. Usage Examples

### Creating a Reservation

```typescript
import { createReservation, checkCourtAvailability } from '@/services/reservationService';
import { Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

const handleBooking = async () => {
  const startTime = dayjs('2024-01-20T10:00:00').tz('America/Martinique');
  const endTime = startTime.add(1, 'hour');
  
  // Check availability first
  const availability = await checkCourtAvailability('court_01', startTime.toDate(), endTime.toDate());
  
  if (!availability.available) {
    alert('Court is not available');
    return;
  }
  
  // Create reservation
  const result = await createReservation({
    court_id: 'court_01',
    user_id: 'user_123',
    start_time: Timestamp.fromDate(startTime.toDate()),
    end_time: Timestamp.fromDate(endTime.toDate()),
    type: 'location_libre',
    status: 'confirmed',
    title: 'John Doe',
    participants: 2
  });
  
  if (result.success) {
    console.log('Reservation created:', result.reservationId);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Real-time Court Updates

```typescript
import { useEffect, useState } from 'react';
import { subscribeToAllCourts } from '@/services/courtService';

const CourtGrid = () => {
  const [courts, setCourts] = useState([]);
  
  useEffect(() => {
    const unsubscribe = subscribeToAllCourts((updatedCourts) => {
      setCourts(updatedCourts);
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <div>
      {courts.map(court => (
        <CourtCard key={court.id} court={court} />
      ))}
    </div>
  );
};
```

---

## 8. Next Steps

After implementing services:
1. ✅ Test all service functions with Firebase Emulator
2. ✅ Verify real-time subscriptions work correctly
3. 📖 Proceed to [05_COMPONENTS.md](./05_COMPONENTS.md)
