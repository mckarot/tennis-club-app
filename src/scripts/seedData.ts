/**
 * Database Seed Script for Firebase Emulator
 *
 * This script populates the Firestore emulator with test data for development.
 * It creates:
 * - 6 tennis courts (4 Quick/Hard, 2 Terre/Clay)
 * - 6 users (1 admin, 2 moniteurs, 3 clients)
 * - 10 reservations (client bookings, lessons, maintenance)
 * - 8 moniteur slots (private + group sessions)
 *
 * Features:
 * - Uses writeBatch for atomic, performant operations
 * - Checks if data already exists before seeding
 * - Comprehensive error handling with try/catch
 * - Returns ServiceResult for type-safe error handling
 * - Timezone: America/Martinique (AST, UTC-4)
 *
 * Usage:
 * ```typescript
 * import { seedDatabase } from '@scripts/seedData';
 * await seedDatabase();
 * ```
 *
 * @module @scripts/seedData
 */

import {
  collection,
  doc,
  writeBatch,
  Timestamp,
  getDocs,
  type Firestore,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  type Auth,
} from 'firebase/auth';
import { db, auth } from '@config/firebase.config';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Service result pattern for type-safe error handling
 */
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * User role enumeration
 */
type UserRole = 'admin' | 'moniteur' | 'client';

/**
 * User status enumeration
 */
type UserStatus = 'online' | 'away' | 'inactive';

/**
 * Court type enumeration (surface category)
 */
type CourtType = 'Quick' | 'Terre';

/**
 * Surface type enumeration (detailed description)
 */
type SurfaceType = 'Hard' | 'Clay' | 'Grass' | 'Synthetic';

/**
 * Court status enumeration
 */
type CourtStatus = 'active' | 'maintenance' | 'closed';

/**
 * Reservation type enumeration
 */
type ReservationType =
  | 'location_libre'
  | 'cours_collectif'
  | 'cours_private'
  | 'individual'
  | 'doubles'
  | 'training'
  | 'tournament'
  | 'maintenance';

/**
 * Reservation status enumeration
 */
type ReservationStatus = 'confirmed' | 'pending' | 'pending_payment' | 'cancelled' | 'completed';

/**
 * Slot type enumeration
 */
type SlotType = 'PRIVATE' | 'GROUP';

/**
 * Slot status enumeration
 */
type SlotStatus = 'available' | 'booked' | 'cancelled';

/**
 * User data interface for seeding
 */
interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: UserStatus;
  password: string;
}

/**
 * Court data interface for seeding
 */
interface CourtData {
  id: string;
  number: number;
  name: string;
  type: CourtType;
  surface: SurfaceType;
  status: CourtStatus;
  is_active: boolean;
  description: string;
}

/**
 * Reservation data interface for seeding
 */
interface ReservationData {
  court_id: string;
  user_id: string;
  moniteur_id?: string;
  start_time: Timestamp;
  end_time: Timestamp;
  type: ReservationType;
  status: ReservationStatus;
  title: string;
  description?: string;
  participants?: number;
  is_paid: boolean;
}

/**
 * Moniteur slot data interface for seeding
 */
interface MoniteurSlotData {
  moniteur_id: string;
  date: string; // YYYY-MM-DD format
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  type: SlotType;
  court_id?: string;
  status: SlotStatus;
  max_participants?: number;
  current_participants: number;
  description: string;
}

// ==========================================
// SEED DATA
// ==========================================

/**
 * Test Users - 6 users (1 admin, 2 moniteurs, 3 clients)
 * Passwords are for emulator authentication only
 */
const testUsers: UserData[] = [
  {
    uid: 'admin_001',
    name: 'Admin Martinique',
    email: 'admin@tennis.mq',
    role: 'admin',
    phone: '+596 696 12 34 56',
    status: 'online',
    password: 'Admin123!',
  },
  {
    uid: 'moniteur_001',
    name: 'Jean Philippe',
    email: 'jean.philippe@tennis.mq',
    role: 'moniteur',
    phone: '+596 696 23 45 67',
    status: 'online',
    password: 'Moniteur123!',
  },
  {
    uid: 'moniteur_002',
    name: 'Marie-Claire Fontaine',
    email: 'marie.claire@tennis.mq',
    role: 'moniteur',
    phone: '+596 696 34 56 78',
    status: 'away',
    password: 'Moniteur123!',
  },
  {
    uid: 'client_001',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.mq',
    role: 'client',
    phone: '+596 696 45 67 89',
    status: 'online',
    password: 'Client123!',
  },
  {
    uid: 'client_002',
    name: 'Sophie Martin',
    email: 'sophie.martin@email.mq',
    role: 'client',
    phone: '+596 696 56 78 90',
    status: 'online',
    password: 'Client123!',
  },
  {
    uid: 'client_003',
    name: 'Pierre Lagrange',
    email: 'pierre.lagrange@email.mq',
    role: 'client',
    phone: '+596 696 67 89 01',
    status: 'inactive',
    password: 'Client123!',
  },
];

/**
 * Tennis Courts - 6 courts (4 Quick/Hard, 2 Terre/Clay)
 * Represents the actual court configuration at Tennis Club du François
 */
const testCourts: CourtData[] = [
  {
    id: 'court_01',
    number: 1,
    name: 'Grand Court East',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    description: 'Premium hard court with professional lighting',
  },
  {
    id: 'court_02',
    number: 2,
    name: 'Center Stage',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    description: 'Main court for tournaments and events',
  },
  {
    id: 'court_03',
    number: 3,
    name: 'Shadow View',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    description: 'Shaded court perfect for afternoon play',
  },
  {
    id: 'court_04',
    number: 4,
    name: 'Training Zone',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    description: 'Dedicated training court with practice wall',
  },
  {
    id: 'court_05',
    number: 5,
    name: 'Clay Court North',
    type: 'Terre',
    surface: 'Clay',
    status: 'active',
    is_active: true,
    description: 'Traditional red clay court',
  },
  {
    id: 'court_06',
    number: 6,
    name: 'West End',
    type: 'Terre',
    surface: 'Clay',
    status: 'active',
    is_active: true,
    description: 'Clay court with sunset views',
  },
];

/**
 * Generate sample reservations for testing
 * Includes client bookings, group lessons, private lessons, and maintenance
 */
function generateReservations(): ReservationData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return [
    // Client booking - Court 1, 10:00 AM
    {
      court_id: 'court_01',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 10 * 60 * 60 * 1000)), // 10:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 11 * 60 * 60 * 1000)), // 11:00 AM
      type: 'location_libre',
      status: 'confirmed',
      title: 'Jean Dupont',
      participants: 2,
      is_paid: true,
    },
    // Group lesson - Court 2, 2:00 PM with Jean Philippe
    {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 14 * 60 * 60 * 1000)), // 2:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 15 * 30 * 60 * 1000)), // 3:30 PM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Intermediate',
      description: 'Forehand and backhand drills',
      participants: 6,
      is_paid: false,
    },
    // Private lesson - Court 5, 4:00 PM with Marie-Claire
    {
      court_id: 'court_05',
      user_id: 'client_001',
      moniteur_id: 'moniteur_002',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 16 * 60 * 60 * 1000)), // 4:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 17 * 60 * 60 * 1000)), // 5:00 PM
      type: 'cours_private',
      status: 'pending_payment',
      title: 'Private Lesson',
      participants: 1,
      is_paid: false,
    },
    // Doubles match - Court 3, tomorrow 10:00 AM
    {
      court_id: 'court_03',
      user_id: 'client_003',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 34 * 60 * 60 * 1000)), // Tomorrow 10:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 35 * 60 * 60 * 1000)), // Tomorrow 11:00 AM
      type: 'doubles',
      status: 'confirmed',
      title: 'Pierre Lagrange & Partner',
      participants: 4,
      is_paid: true,
    },
    // Maintenance - Court 4, 6:00 AM to 12:00 PM
    {
      court_id: 'court_04',
      user_id: 'admin_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 6 * 60 * 60 * 1000)), // 6:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 12 * 60 * 60 * 1000)), // 12:00 PM
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court Resurfacing',
      description: 'Scheduled maintenance - Court closed',
      is_paid: false,
    },
    // Training session - Court 1, tomorrow 2:00 PM
    {
      court_id: 'court_01',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 38 * 60 * 60 * 1000)), // Tomorrow 2:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 39 * 60 * 60 * 1000)), // Tomorrow 3:00 PM
      type: 'training',
      status: 'confirmed',
      title: 'Sophie Martin - Practice',
      participants: 1,
      is_paid: true,
    },
    // Tournament match - Court 2, day after tomorrow 9:00 AM
    {
      court_id: 'court_02',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 57 * 60 * 60 * 1000)), // Day after tomorrow 9:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 58 * 30 * 60 * 1000)), // Day after tomorrow 10:30 AM
      type: 'tournament',
      status: 'pending',
      title: 'Tournament - Round 1',
      description: 'Club championship match',
      participants: 2,
      is_paid: false,
    },
    // Group lesson - Court 6, tomorrow 4:00 PM with Marie-Claire
    {
      court_id: 'court_06',
      user_id: 'client_003',
      moniteur_id: 'moniteur_002',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 40 * 60 * 60 * 1000)), // Tomorrow 4:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 41 * 30 * 60 * 1000)), // Tomorrow 5:30 PM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Clay Court Fundamentals',
      description: 'Learning to slide and move on clay',
      participants: 4,
      is_paid: false,
    },
    // Individual practice - Court 3, today 6:00 PM
    {
      court_id: 'court_03',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 18 * 60 * 60 * 1000)), // 6:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 19 * 60 * 60 * 1000)), // 7:00 PM
      type: 'individual',
      status: 'confirmed',
      title: 'Sophie Martin',
      participants: 1,
      is_paid: true,
    },
    // Pending reservation - Court 5, day after tomorrow 3:00 PM
    {
      court_id: 'court_05',
      user_id: 'client_003',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 63 * 60 * 60 * 1000)), // Day after tomorrow 3:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 64 * 60 * 60 * 1000)), // Day after tomorrow 4:00 PM
      type: 'location_libre',
      status: 'pending',
      title: 'Pierre Lagrange',
      participants: 2,
      is_paid: false,
    },
  ];
}

/**
 * Generate sample moniteur slots for testing
 * Includes private and group sessions for both moniteurs
 */
function generateMoniteurSlots(): MoniteurSlotData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return [
    // Jean Philippe's slots - Today
    {
      moniteur_id: 'moniteur_001',
      date: formatDate(today),
      start_time: '09:00',
      end_time: '10:30',
      type: 'PRIVATE',
      court_id: 'court_01',
      status: 'booked',
      current_participants: 1,
      description: 'Private coaching session',
    },
    {
      moniteur_id: 'moniteur_001',
      date: formatDate(today),
      start_time: '14:00',
      end_time: '15:30',
      type: 'GROUP',
      court_id: 'court_05',
      status: 'available',
      max_participants: 6,
      current_participants: 2,
      description: 'Intermediate forehand techniques',
    },
    {
      moniteur_id: 'moniteur_001',
      date: formatDate(today),
      start_time: '16:00',
      end_time: '17:30',
      type: 'GROUP',
      court_id: 'court_02',
      status: 'available',
      max_participants: 8,
      current_participants: 4,
      description: 'Advanced doubles strategy',
    },
    // Marie-Claire's slots - Today
    {
      moniteur_id: 'moniteur_002',
      date: formatDate(today),
      start_time: '10:00',
      end_time: '11:30',
      type: 'PRIVATE',
      court_id: 'court_03',
      status: 'available',
      current_participants: 0,
      description: 'Private lessons for all levels',
    },
    {
      moniteur_id: 'moniteur_002',
      date: formatDate(today),
      start_time: '15:00',
      end_time: '16:30',
      type: 'GROUP',
      court_id: 'court_06',
      status: 'available',
      max_participants: 6,
      current_participants: 3,
      description: 'Clay court fundamentals',
    },
    // Tomorrow's slots
    {
      moniteur_id: 'moniteur_001',
      date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      start_time: '08:00',
      end_time: '09:30',
      type: 'GROUP',
      court_id: 'court_01',
      status: 'available',
      max_participants: 6,
      current_participants: 0,
      description: 'Early morning group session',
    },
    {
      moniteur_id: 'moniteur_002',
      date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      start_time: '14:00',
      end_time: '15:30',
      type: 'PRIVATE',
      court_id: 'court_05',
      status: 'available',
      current_participants: 0,
      description: 'Afternoon private coaching',
    },
    // Day after tomorrow
    {
      moniteur_id: 'moniteur_001',
      date: formatDate(new Date(today.getTime() + 48 * 60 * 60 * 1000)),
      start_time: '10:00',
      end_time: '11:30',
      type: 'GROUP',
      court_id: 'court_02',
      status: 'available',
      max_participants: 6,
      current_participants: 0,
      description: 'Weekend group lesson',
    },
  ];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if a collection is empty
 *
 * @param db - Firestore instance
 * @param collectionName - Name of the collection to check
 * @returns Promise resolving to true if collection is empty
 */
async function isCollectionEmpty(
  db: Firestore,
  collectionName: string
): Promise<boolean> {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.empty;
}

/**
 * Console log with timestamp for seed operations
 *
 * @param message - Message to log
 */
function logSeed(message: string): void {
  const timestamp = new Date().toLocaleTimeString('fr-FR', { timeZone: 'America/Martinique' });
  console.log(`[${timestamp}] ${message}`);
}

// ==========================================
// SEED FUNCTIONS
// ==========================================

/**
 * Seed users to Firestore and create Auth accounts
 *
 * Uses writeBatch for atomic operations.
 * Auth account creation only works in emulator mode.
 *
 * @param db - Firestore instance
 * @param auth - Auth instance
 * @returns ServiceResult indicating success or failure
 */
async function seedUsers(
  db: Firestore,
  auth: Auth
): Promise<ServiceResult<{ count: number }>> {
  logSeed('\n📋 Seeding users...');

  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const user of testUsers) {
      // Create Auth account (only works in emulator)
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.password);
        logSeed(`  ✅ Auth created: ${user.email}`);
      } catch (authError) {
        // User might already exist in emulator
        logSeed(`  ⚠️  Auth exists: ${user.email}`);
      }

      // Create Firestore user document
      const userRef = doc(db, 'users', user.uid);
      batch.set(userRef, {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        status: user.status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: null,
      });
      logSeed(`  ✅ Firestore user: ${user.name} (${user.role})`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} users\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding users';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Seed courts to Firestore
 *
 * Uses writeBatch for atomic operations.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedCourts(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('🎾 Seeding courts...');

  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const court of testCourts) {
      const courtRef = doc(db, 'courts', court.id);
      batch.set(courtRef, {
        id: court.id,
        number: court.number,
        name: court.name,
        type: court.type,
        surface: court.surface,
        status: court.status,
        is_active: court.is_active,
        description: court.description,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      logSeed(`  ✅ Court: ${court.name} (${court.type} - ${court.surface})`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} courts\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding courts';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Seed reservations to Firestore
 *
 * Uses writeBatch for atomic operations.
 * Generates dynamic reservation data based on current date.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedReservations(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('📅 Seeding reservations...');

  try {
    const reservations = generateReservations();
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const reservation of reservations) {
      const reservationRef = doc(collection(db, 'reservations'));
      batch.set(reservationRef, {
        court_id: reservation.court_id,
        user_id: reservation.user_id,
        moniteur_id: reservation.moniteur_id,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        type: reservation.type,
        status: reservation.status,
        title: reservation.title,
        description: reservation.description,
        participants: reservation.participants,
        is_paid: reservation.is_paid,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      const dateStr = reservation.start_time.toDate().toLocaleDateString('fr-FR', {
        timeZone: 'America/Martinique',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      logSeed(`  ✅ Reservation: ${reservation.title} on ${dateStr}`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} reservations\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding reservations';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Seed moniteur slots to Firestore
 *
 * Uses writeBatch for atomic operations.
 * Generates dynamic slot data based on current date.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedMoniteurSlots(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('👨‍🏫 Seeding moniteur slots...');

  try {
    const slots = generateMoniteurSlots();
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const slot of slots) {
      const slotRef = doc(collection(db, 'slots_moniteurs'));
      batch.set(slotRef, {
        moniteur_id: slot.moniteur_id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        type: slot.type,
        court_id: slot.court_id,
        status: slot.status,
        max_participants: slot.max_participants,
        current_participants: slot.current_participants,
        description: slot.description,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
      logSeed(`  ✅ Slot: ${slot.type} with ${slot.moniteur_id} on ${slot.date} at ${slot.start_time}`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} moniteur slots\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding moniteur slots';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

/**
 * Main seed function - runs all seed operations
 *
 * This function:
 * 1. Checks if data already exists (prevents duplicate seeding)
 * 2. Seeds users with Auth accounts
 * 3. Seeds courts
 * 4. Seeds reservations
 * 5. Seeds moniteur slots
 *
 * All operations use writeBatch for atomic, performant writes.
 * Errors are caught and reported via ServiceResult pattern.
 *
 * @param options - Optional configuration
 * @param options.force - If true, seed even if data exists (default: false)
 * @returns ServiceResult with seed summary
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await seedDatabase();
 * if (result.success) {
 *   console.log('Seeding completed!');
 * }
 *
 * // Force re-seed
 * const result = await seedDatabase({ force: true });
 * ```
 */
export async function seedDatabase(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  users: number;
  courts: number;
  reservations: number;
  moniteurSlots: number;
}>> {
  const { force = false } = options;

  logSeed('🌱 Starting database seeding...\n');
  logSeed('='.repeat(60));

  try {
    // Check if data already exists
    if (!force) {
      const usersEmpty = await isCollectionEmpty(db, 'users');
      const courtsEmpty = await isCollectionEmpty(db, 'courts');

      if (!usersEmpty && !courtsEmpty) {
        logSeed('⚠️  Database already contains data.');
        logSeed('💡 Use seedDatabase({ force: true }) to re-seed.\n');
        return {
          success: false,
          error: 'Database already contains data. Use force: true to re-seed.',
        };
      }
    }

    // Seed all collections
    const usersResult = await seedUsers(db, auth);
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    const courtsResult = await seedCourts(db);
    if (!courtsResult.success) {
      return { success: false, error: courtsResult.error };
    }

    const reservationsResult = await seedReservations(db);
    if (!reservationsResult.success) {
      return { success: false, error: reservationsResult.error };
    }

    const slotsResult = await seedMoniteurSlots(db);
    if (!slotsResult.success) {
      return { success: false, error: slotsResult.error };
    }

    // Compile summary
    const summary = {
      users: usersResult.data?.count || 0,
      courts: courtsResult.data?.count || 0,
      reservations: reservationsResult.data?.count || 0,
      moniteurSlots: slotsResult.data?.count || 0,
    };

    logSeed('='.repeat(60));
    logSeed('✅ Database seeding completed successfully!\n');
    logSeed('📊 Summary:');
    logSeed(`   - Users: ${summary.users} (${testUsers.filter(u => u.role === 'admin').length} admin, ${testUsers.filter(u => u.role === 'moniteur').length} moniteurs, ${testUsers.filter(u => u.role === 'client').length} clients)`);
    logSeed(`   - Courts: ${summary.courts} (${testCourts.filter(c => c.type === 'Quick').length} Quick, ${testCourts.filter(c => c.type === 'Terre').length} Terre)`);
    logSeed(`   - Reservations: ${summary.reservations}`);
    logSeed(`   - Moniteur Slots: ${summary.moniteurSlots}`);
    logSeed('\n🎉 You can now test the application with sample data!');
    logSeed('🔍 View data at: http://localhost:4000/firestore\n');

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during seeding';
    logSeed('❌ Error seeding database:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// AUTO-EXECUTE IN BROWSER CONSOLE
// ==========================================

/**
 * Auto-execute message when running in browser console
 * Provides helpful instructions for manual seeding
 */
if (typeof window !== 'undefined') {
  console.log('🌱 Seed script loaded.');
  console.log('💡 Run seedDatabase() to populate the emulator.');
  console.log('💡 Run seedDatabase({ force: true }) to re-seed existing data.');
}
