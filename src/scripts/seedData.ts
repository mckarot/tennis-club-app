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
 * Status variety: 4 active, 1 maintenance, 1 closed
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
    status: 'maintenance',
    is_active: false,
    description: 'Traditional red clay court - Under maintenance',
  },
  {
    id: 'court_06',
    number: 6,
    name: 'West End',
    type: 'Terre',
    surface: 'Clay',
    status: 'closed',
    is_active: false,
    description: 'Clay court with sunset views - Temporarily closed',
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
 * Seeds 6 courts with varied status:
 * - Courts 1-4: Quick/Hard, active
 * - Courts 5-6: Terre/Clay, 1 active, 1 maintenance
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
export async function seedCourts(db: Firestore): Promise<ServiceResult<{ count: number }>> {
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
// CLIENT DASHBOARD SEED FUNCTION
// ==========================================

/**
 * Seed maintenance notes for Client Dashboard
 *
 * Creates sample maintenance notes for the Club Maintenance Note widget.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedMaintenanceNotes(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('📝 Seeding maintenance notes...');

  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Active maintenance note (for Court 4 - currently under maintenance)
    const activeNoteRef = doc(collection(db, 'maintenance_notes'));
    batch.set(activeNoteRef, {
      title: 'Court 4 - Surface Resurfacing',
      message: 'Court 4 (Training Zone) is undergoing surface resurfacing. Expected completion: End of week. Alternative training sessions available on Courts 1-3.',
      severity: 'warning',
      is_active: true,
      created_at: Timestamp.fromDate(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
      expires_at: Timestamp.fromDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
      affected_courts: ['court_04'],
    });
    logSeed('  ✅ Active maintenance note: Court 4 resurfacing');
    createdCount++;

    // Inactive note (historical)
    const inactiveNoteRef = doc(collection(db, 'maintenance_notes'));
    batch.set(inactiveNoteRef, {
      title: 'Club Closure - Public Holiday',
      message: 'The club will be closed on Monday, January 1st for New Year\'s Day. Regular hours resume Tuesday, January 2nd.',
      severity: 'info',
      is_active: false,
      created_at: Timestamp.fromDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
      expires_at: Timestamp.fromDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
      affected_courts: [],
    });
    logSeed('  ✅ Inactive maintenance note: Holiday closure');
    createdCount++;

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} maintenance notes\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding maintenance notes';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Seed location data (static configuration document)
 *
 * Creates a document with club location information for the Location Widget.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedLocationData(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('📍 Seeding location data...');

  try {
    const batch = writeBatch(db);

    const locationRef = doc(db, 'club_info', 'location');
    batch.set(locationRef, {
      address: 'Rue du Tennis',
      city: 'Le François',
      postalCode: '97240',
      country: 'Martinique',
      phone: '+596 696 12 34 56',
      email: 'contact@tennis-francois.mq',
      website: 'https://tennis-francois.mq',
      mapUrl: 'https://maps.google.com/?q=Le+François+97240',
      coordinates: {
        latitude: 14.6167,
        longitude: -60.9000,
      },
      opening_hours: {
        monday: '07:00-19:00',
        tuesday: '07:00-19:00',
        wednesday: '07:00-19:00',
        thursday: '07:00-19:00',
        friday: '07:00-19:00',
        saturday: '08:00-18:00',
        sunday: '08:00-18:00',
      },
      updated_at: Timestamp.now(),
    });
    logSeed('  ✅ Location data: Le François club');

    await batch.commit();
    logSeed(`  ✅ Seeded location data\n`);

    return {
      success: true,
      data: { count: 1 },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding location data';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate extended reservations for Client Dashboard (7 days)
 *
 * Creates 15+ reservations spread across the next 7 days for testing
 * the Client Dashboard with various scenarios.
 */
function generateExtendedReservations(): ReservationData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const reservations: ReservationData[] = [];

  // Day 0 (Today) - 3 reservations
  reservations.push(
    // Morning booking - Court 1, 10:00 AM
    {
      court_id: 'court_01',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 10 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(today.getTime() + 11 * 60 * 60 * 1000)),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Jean Dupont',
      participants: 2,
      is_paid: true,
    },
    // Afternoon group lesson - Court 2, 2:00 PM
    {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 14 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(today.getTime() + 15 * 30 * 60 * 1000)),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Intermediate',
      description: 'Forehand and backhand drills',
      participants: 6,
      is_paid: false,
    },
    // Evening practice - Court 3, 6:00 PM
    {
      court_id: 'court_03',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 18 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(today.getTime() + 19 * 60 * 60 * 1000)),
      type: 'individual',
      status: 'confirmed',
      title: 'Jean Dupont - Practice',
      participants: 1,
      is_paid: true,
    }
  );

  // Day 1 (Tomorrow) - 4 reservations
  const day1 = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 9 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 10 * 60 * 60 * 1000)),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Lesson - Jean',
      moniteur_id: 'moniteur_001',
      participants: 1,
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 14 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 15 * 60 * 60 * 1000)),
      type: 'location_libre',
      status: 'pending',
      title: 'Sophie Martin',
      participants: 2,
      is_paid: false,
    },
    {
      court_id: 'court_02',
      user_id: 'client_003',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 16 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 17 * 30 * 60 * 1000)),
      type: 'doubles',
      status: 'confirmed',
      title: 'Pierre & Partner',
      participants: 4,
      is_paid: true,
    },
    {
      court_id: 'court_06',
      user_id: 'client_001',
      moniteur_id: 'moniteur_002',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 10 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 11 * 30 * 60 * 1000)),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Clay Court Techniques',
      description: 'Learning to slide on clay',
      participants: 4,
      is_paid: false,
    }
  );

  // Day 2 - 3 reservations
  const day2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(day2.getTime() + 8 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day2.getTime() + 9 * 60 * 60 * 1000)),
      type: 'training',
      status: 'confirmed',
      title: 'Sophie - Early Training',
      participants: 1,
      is_paid: true,
    },
    {
      court_id: 'court_03',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(day2.getTime() + 15 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day2.getTime() + 16 * 60 * 60 * 1000)),
      type: 'location_libre',
      status: 'pending_payment',
      title: 'Jean Dupont',
      participants: 2,
      is_paid: false,
    },
    {
      court_id: 'court_04',
      user_id: 'admin_001',
      start_time: Timestamp.fromDate(new Date(day2.getTime() + 6 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day2.getTime() + 12 * 60 * 60 * 1000)),
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court 4 - Surface Work',
      description: 'Scheduled maintenance',
      is_paid: false,
    }
  );

  // Day 3 - 2 reservations
  const day3 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_02',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(day3.getTime() + 10 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day3.getTime() + 11 * 60 * 60 * 1000)),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Coaching',
      moniteur_id: 'moniteur_001',
      participants: 1,
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'client_003',
      start_time: Timestamp.fromDate(new Date(day3.getTime() + 17 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day3.getTime() + 18 * 60 * 60 * 1000)),
      type: 'individual',
      status: 'confirmed',
      title: 'Pierre - Practice',
      participants: 1,
      is_paid: true,
    }
  );

  // Day 4 - 2 reservations
  const day4 = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(day4.getTime() + 9 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day4.getTime() + 10 * 30 * 60 * 1000)),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Advanced',
      moniteur_id: 'moniteur_002',
      participants: 5,
      is_paid: false,
    },
    {
      court_id: 'court_06',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(day4.getTime() + 14 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day4.getTime() + 15 * 60 * 60 * 1000)),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Jean - Clay Court',
      participants: 2,
      is_paid: true,
    }
  );

  // Day 5 (Weekend) - 2 reservations
  const day5 = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_03',
      user_id: 'client_001',
      start_time: Timestamp.fromDate(new Date(day5.getTime() + 10 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day5.getTime() + 11 * 60 * 60 * 1000)),
      type: 'doubles',
      status: 'confirmed',
      title: 'Weekend Doubles',
      participants: 4,
      is_paid: true,
    },
    {
      court_id: 'court_02',
      user_id: 'client_002',
      start_time: Timestamp.fromDate(new Date(day5.getTime() + 15 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day5.getTime() + 16 * 60 * 60 * 1000)),
      type: 'location_libre',
      status: 'pending',
      title: 'Sophie - Weekend',
      participants: 2,
      is_paid: false,
    }
  );

  // Day 6 (Weekend) - 1 reservation
  const day6 = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_003',
      start_time: Timestamp.fromDate(new Date(day6.getTime() + 9 * 60 * 60 * 1000)),
      end_time: Timestamp.fromDate(new Date(day6.getTime() + 10 * 60 * 60 * 1000)),
      type: 'training',
      status: 'confirmed',
      title: 'Pierre - Weekend Training',
      participants: 1,
      is_paid: true,
    }
  );

  return reservations;
}

/**
 * Seed extended reservations for Client Dashboard
 *
 * Uses generateExtendedReservations() to create 15+ reservations
 * spread across the next 7 days.
 *
 * @param db - Firestore instance
 * @returns ServiceResult indicating success or failure
 */
async function seedExtendedReservations(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('📅 Seeding extended reservations (7 days)...');

  try {
    const reservations = generateExtendedReservations();
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
    logSeed(`  ✅ Seeded ${createdCount} extended reservations\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding extended reservations';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Seed Client Dashboard data
 *
 * This function populates the emulator with data specifically for testing
 * the Client Dashboard (Phase 7.2):
 * - 7 courts (4 Quick, 3 Terre) with varied statuses
 * - 15+ reservations spread across 7 days
 * - 1 active maintenance note
 * - Club location data
 *
 * Usage:
 * ```typescript
 * import { seedClientDashboard } from '@scripts/seedData';
 * await seedClientDashboard();
 * ```
 *
 * @param options - Optional configuration
 * @param options.force - If true, seed even if data exists (default: false)
 * @returns ServiceResult with seed summary
 */
export async function seedClientDashboard(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  courts: number;
  reservations: number;
  maintenanceNotes: number;
  locationData: number;
}>> {
  const { force = false } = options;

  logSeed('🌱 Starting Client Dashboard seeding...\n');
  logSeed('='.repeat(60));

  try {
    // Check if data already exists
    if (!force) {
      const courtsEmpty = await isCollectionEmpty(db, 'courts');
      const reservationsEmpty = await isCollectionEmpty(db, 'reservations');

      if (!courtsEmpty && !reservationsEmpty) {
        logSeed('⚠️  Database already contains data.');
        logSeed('💡 Use seedClientDashboard({ force: true }) to re-seed.\n');
        return {
          success: false,
          error: 'Database already contains data. Use force: true to re-seed.',
        };
      }
    }

    // Seed courts
    const courtsResult = await seedCourts(db);
    if (!courtsResult.success) {
      return { success: false, error: courtsResult.error };
    }

    // Seed extended reservations (7 days)
    const reservationsResult = await seedExtendedReservations(db);
    if (!reservationsResult.success) {
      return { success: false, error: reservationsResult.error };
    }

    // Seed maintenance notes
    const notesResult = await seedMaintenanceNotes(db);
    if (!notesResult.success) {
      return { success: false, error: notesResult.error };
    }

    // Seed location data
    const locationResult = await seedLocationData(db);
    if (!locationResult.success) {
      return { success: false, error: locationResult.error };
    }

    // Compile summary
    const summary = {
      courts: courtsResult.data?.count || 0,
      reservations: reservationsResult.data?.count || 0,
      maintenanceNotes: notesResult.data?.count || 0,
      locationData: locationResult.data?.count || 0,
    };

    logSeed('='.repeat(60));
    logSeed('✅ Client Dashboard seeding completed successfully!\n');
    logSeed('📊 Summary:');
    logSeed(`   - Courts: ${summary.courts} (4 Quick, 3 Terre)`);
    logSeed(`   - Reservations: ${summary.reservations} (spread across 7 days)`);
    logSeed(`   - Maintenance Notes: ${summary.maintenanceNotes} (1 active)`);
    logSeed(`   - Location Data: ${summary.locationData}`);
    logSeed('\n🎉 Client Dashboard ready for testing!');
    logSeed('🔍 View data at: http://localhost:4000/firestore\n');

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Client Dashboard seeding';
    logSeed('❌ Error seeding database:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// MONITEUR DASHBOARD SEED FUNCTION
// ==========================================

/**
 * Generate moniteur slots for 2 weeks
 * Creates 20-25 slots distributed across 14 days for moniteur_001
 */
function generateMoniteurDashboardSlots(): MoniteurSlotData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const slots: MoniteurSlotData[] = [];

  // Time slots for each day (morning, afternoon, evening)
  const timeSlots = [
    { start: '08:00', end: '09:30' },
    { start: '09:30', end: '11:00' },
    { start: '14:00', end: '15:30' },
    { start: '15:30', end: '17:00' },
    { start: '17:00', end: '18:30' },
  ];

  // Generate slots for 14 days (2 weeks)
  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(currentDate);

    // Skip some slots randomly to simulate realistic availability
    const slotsPerDay = day < 7 ? 2 : 1; // More slots in first week

    for (let i = 0; i < slotsPerDay && i < timeSlots.length; i++) {
      const isGroup = i % 2 === 0; // Alternate between GROUP and PRIVATE
      const isBooked = day < 3 && i === 0; // First few days have some booked slots

      slots.push({
        moniteur_id: 'moniteur_001',
        date: dateStr,
        start_time: timeSlots[i].start,
        end_time: timeSlots[i].end,
        type: isGroup ? 'GROUP' : 'PRIVATE',
        court_id: isGroup ? 'court_05' : 'court_01',
        status: isBooked ? 'booked' : 'available',
        max_participants: isGroup ? 6 : 1,
        current_participants: isBooked ? (isGroup ? 4 : 1) : 0,
        description: isGroup
          ? `Group lesson - Day ${day + 1}`
          : `Private coaching - Day ${day + 1}`,
      });
    }

    // Add extra weekend slots
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
      slots.push({
        moniteur_id: 'moniteur_001',
        date: dateStr,
        start_time: '10:00',
        end_time: '11:30',
        type: 'GROUP',
        court_id: 'court_02',
        status: 'available',
        max_participants: 8,
        current_participants: 0,
        description: 'Weekend special - Group session',
      });
    }
  }

  return slots;
}

/**
 * Generate reservations for moniteur dashboard
 * Creates 10-15 confirmed reservations for the next 7 days with participants
 */
function generateMoniteurReservations(): ReservationData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const reservations: ReservationData[] = [];

  // Day 0 (Today) - 2 reservations
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 9 * 60 * 60 * 1000)), // 9:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 10 * 30 * 60 * 1000)), // 10:30 AM
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Lesson - Jean Dupont',
      description: 'Serve technique improvement',
      participants: 1,
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 14 * 60 * 60 * 1000)), // 2:00 PM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 15 * 30 * 60 * 1000)), // 3:30 PM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Intermediate',
      description: 'Forehand and backhand drills',
      participants: 5,
      is_paid: false,
    }
  );

  // Day 1 (Tomorrow) - 3 reservations
  const day1 = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_02',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 8 * 60 * 60 * 1000)), // 8:00 AM
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 9 * 30 * 60 * 1000)), // 9:30 AM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Morning Group Session',
      description: 'Early bird special',
      participants: 4,
      is_paid: false,
    },
    {
      court_id: 'court_01',
      user_id: 'client_003',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 15 * 60 * 60 * 1000)), // 3:00 PM
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 16 * 30 * 60 * 1000)), // 4:30 PM
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Coaching - Pierre',
      description: 'Match strategy',
      participants: 1,
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day1.getTime() + 17 * 60 * 60 * 1000)), // 5:00 PM
      end_time: Timestamp.fromDate(new Date(day1.getTime() + 18 * 30 * 60 * 1000)), // 6:30 PM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Evening Group - Advanced',
      description: 'Advanced techniques',
      participants: 6,
      is_paid: false,
    }
  );

  // Day 2 - 2 reservations
  const day2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day2.getTime() + 10 * 60 * 60 * 1000)), // 10:00 AM
      end_time: Timestamp.fromDate(new Date(day2.getTime() + 11 * 30 * 60 * 1000)), // 11:30 AM
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Lesson - Jean',
      description: 'Volley techniques',
      participants: 1,
      is_paid: false,
    },
    {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day2.getTime() + 14 * 60 * 60 * 1000)), // 2:00 PM
      end_time: Timestamp.fromDate(new Date(day2.getTime() + 15 * 30 * 60 * 1000)), // 3:30 PM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Beginners',
      description: 'Basic strokes',
      participants: 5,
      is_paid: false,
    }
  );

  // Day 3 - 2 reservations
  const day3 = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_05',
      user_id: 'client_003',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day3.getTime() + 9 * 60 * 60 * 1000)), // 9:00 AM
      end_time: Timestamp.fromDate(new Date(day3.getTime() + 10 * 30 * 60 * 1000)), // 10:30 AM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Clay Court Group Session',
      description: 'Movement on clay',
      participants: 4,
      is_paid: false,
    },
    {
      court_id: 'court_01',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day3.getTime() + 16 * 60 * 60 * 1000)), // 4:00 PM
      end_time: Timestamp.fromDate(new Date(day3.getTime() + 17 * 30 * 60 * 1000)), // 5:30 PM
      type: 'cours_private',
      status: 'pending',
      title: 'Private - Pending Confirmation',
      description: 'Awaiting confirmation',
      participants: 1,
      is_paid: false,
    }
  );

  // Day 4 - 2 reservations
  const day4 = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day4.getTime() + 8 * 60 * 60 * 1000)), // 8:00 AM
      end_time: Timestamp.fromDate(new Date(day4.getTime() + 9 * 30 * 60 * 1000)), // 9:30 AM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Friday Morning Group',
      description: 'Fitness and strokes',
      participants: 5,
      is_paid: false,
    },
    {
      court_id: 'court_01',
      user_id: 'client_003',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day4.getTime() + 17 * 60 * 60 * 1000)), // 5:00 PM
      end_time: Timestamp.fromDate(new Date(day4.getTime() + 18 * 30 * 60 * 1000)), // 6:30 PM
      type: 'cours_private',
      status: 'confirmed',
      title: 'End of Week Private',
      description: 'Review and practice',
      participants: 1,
      is_paid: false,
    }
  );

  // Day 5 (Saturday) - 2 reservations
  const day5 = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_05',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day5.getTime() + 10 * 60 * 60 * 1000)), // 10:00 AM
      end_time: Timestamp.fromDate(new Date(day5.getTime() + 11 * 30 * 60 * 1000)), // 11:30 AM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Saturday Group Special',
      description: 'Weekend intensive',
      participants: 6,
      is_paid: false,
    },
    {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day5.getTime() + 14 * 60 * 60 * 1000)), // 2:00 PM
      end_time: Timestamp.fromDate(new Date(day5.getTime() + 15 * 30 * 60 * 1000)), // 3:30 PM
      type: 'cours_private',
      status: 'confirmed',
      title: 'Saturday Private Session',
      description: 'Individual coaching',
      participants: 1,
      is_paid: false,
    }
  );

  // Day 6 (Sunday) - 2 reservations
  const day6 = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  reservations.push(
    {
      court_id: 'court_01',
      user_id: 'client_003',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day6.getTime() + 9 * 60 * 60 * 1000)), // 9:00 AM
      end_time: Timestamp.fromDate(new Date(day6.getTime() + 10 * 30 * 60 * 1000)), // 10:30 AM
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Sunday Morning Group',
      description: 'Relaxed session',
      participants: 4,
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: Timestamp.fromDate(new Date(day6.getTime() + 15 * 60 * 60 * 1000)), // 3:00 PM
      end_time: Timestamp.fromDate(new Date(day6.getTime() + 16 * 30 * 60 * 1000)), // 4:30 PM
      type: 'cours_private',
      status: 'completed',
      title: 'Sunday Afternoon Private',
      description: 'Completed session',
      participants: 1,
      is_paid: true,
    }
  );

  return reservations;
}

/**
 * Seed Moniteur Dashboard data
 *
 * This function populates the emulator with data specifically for testing
 * the Moniteur Dashboard (Phase 7.3):
 * - 1 moniteur account (moniteur_001 - Jean Philippe)
 * - 20-25 slots distributed across 2 weeks (PRIVATE and GROUP)
 * - 10-15 confirmed reservations for the next 7 days
 * - Participants for each reservation (2-5 per GROUP, 1 for PRIVATE)
 *
 * Usage:
 * ```typescript
 * import { seedMoniteurDashboard } from '@scripts/seedData';
 * await seedMoniteurDashboard();
 * ```
 *
 * @param options - Optional configuration
 * @param options.force - If true, seed even if data exists (default: false)
 * @returns ServiceResult with seed summary
 */
export async function seedMoniteurDashboard(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  moniteurSlots: number;
  reservations: number;
}>> {
  const { force = false } = options;

  logSeed('🌱 Starting Moniteur Dashboard seeding...\n');
  logSeed('='.repeat(60));

  try {
    // Check if data already exists
    if (!force) {
      const slotsEmpty = await isCollectionEmpty(db, 'slots_moniteurs');
      const reservationsEmpty = await isCollectionEmpty(db, 'reservations');

      if (!slotsEmpty && !reservationsEmpty) {
        logSeed('⚠️  Database already contains data.');
        logSeed('💡 Use seedMoniteurDashboard({ force: true }) to re-seed.\n');
        return {
          success: false,
          error: 'Database already contains data. Use force: true to re-seed.',
        };
      }
    }

    // Seed moniteur slots (2 weeks)
    logSeed('👨‍🏫 Seeding moniteur slots (2 weeks)...');
    const slots = generateMoniteurDashboardSlots();
    const slotsBatch = writeBatch(db);
    let slotsCount = 0;

    for (const slot of slots) {
      const slotRef = doc(collection(db, 'slots_moniteurs'));
      slotsBatch.set(slotRef, {
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
      logSeed(`  ✅ Slot: ${slot.type} on ${slot.date} at ${slot.start_time} (${slot.status})`);
      slotsCount++;
    }

    await slotsBatch.commit();
    logSeed(`  ✅ Seeded ${slotsCount} moniteur slots\n`);

    // Seed reservations (7 days)
    logSeed('📅 Seeding moniteur reservations (7 days)...');
    const reservations = generateMoniteurReservations();
    const reservationsBatch = writeBatch(db);
    let reservationsCount = 0;

    for (const reservation of reservations) {
      const reservationRef = doc(collection(db, 'reservations'));
      reservationsBatch.set(reservationRef, {
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

      logSeed(`  ✅ Reservation: ${reservation.title} on ${dateStr} (${reservation.status})`);
      reservationsCount++;
    }

    await reservationsBatch.commit();
    logSeed(`  ✅ Seeded ${reservationsCount} reservations\n`);

    // Compile summary
    const summary = {
      moniteurSlots: slotsCount,
      reservations: reservationsCount,
    };

    logSeed('='.repeat(60));
    logSeed('✅ Moniteur Dashboard seeding completed successfully!\n');
    logSeed('📊 Summary:');
    logSeed(`   - Moniteur Slots: ${summary.moniteurSlots} (2 weeks, PRIVATE + GROUP)`);
    logSeed(`   - Reservations: ${summary.reservations} (7 days, various statuses)`);
    logSeed('\n🎉 Moniteur Dashboard ready for testing!');
    logSeed('🔍 View data at: http://localhost:4000/firestore\n');
    logSeed('💡 Test credentials:');
    logSeed('   - Email: jean.philippe@tennis.mq');
    logSeed('   - Password: Moniteur123!\n');

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Moniteur Dashboard seeding';
    logSeed('❌ Error seeding database:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// CLIENT PROFILE SEEDING
// ==========================================

/**
 * Seed client profiles with complete user data
 *
 * Creates 5 client users with complete profiles including:
 * - name, email, phone
 * - avatar URLs (placeholder images)
 * - notifications preferences (email, sms)
 * - Various statuses (online, away, inactive)
 *
 * This function is designed for testing the Client Profile feature.
 * It uses writeBatch for atomic operations.
 *
 * @param db - Firestore instance
 * @param auth - Auth instance
 * @returns ServiceResult indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await seedClientProfiles(db, auth);
 * if (result.success) {
 *   console.log(`Created ${result.data?.count} client profiles`);
 * }
 * ```
 */
export async function seedClientProfiles(
  db: Firestore,
  auth: Auth
): Promise<ServiceResult<{ count: number }>> {
  logSeed('\n👤 Seeding client profiles...');

  // Client profiles with complete data
  const clientProfiles = [
    {
      uid: 'client_profile_001',
      name: 'Marie Josephine',
      email: 'marie.josephine@email.mq',
      role: 'client' as UserRole,
      phone: '+596 696 11 22 33',
      status: 'online' as UserStatus,
      password: 'Client123!',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Josephine&background=FF6B6B&color=fff&size=200',
      notifications: {
        email: true,
        sms: true,
      },
    },
    {
      uid: 'client_profile_002',
      name: 'Antoine Celeste',
      email: 'antoine.celeste@email.mq',
      role: 'client' as UserRole,
      phone: '+596 696 22 33 44',
      status: 'away' as UserStatus,
      password: 'Client123!',
      avatar: 'https://ui-avatars.com/api/?name=Antoine+Celeste&background=4ECDC4&color=fff&size=200',
      notifications: {
        email: true,
        sms: false,
      },
    },
    {
      uid: 'client_profile_003',
      name: 'Isabelle Flamboyant',
      email: 'isabelle.flamboyant@email.mq',
      role: 'client' as UserRole,
      phone: '+596 696 33 44 55',
      status: 'online' as UserStatus,
      password: 'Client123!',
      avatar: 'https://ui-avatars.com/api/?name=Isabelle+Flamboyant&background=FFE66D&color=333&size=200',
      notifications: {
        email: false,
        sms: true,
      },
    },
    {
      uid: 'client_profile_004',
      name: 'Gabriel Rocher',
      email: 'gabriel.rocher@email.mq',
      role: 'client' as UserRole,
      phone: '+596 696 44 55 66',
      status: 'inactive' as UserStatus,
      password: 'Client123!',
      avatar: 'https://ui-avatars.com/api/?name=Gabriel+Rocher&background=95E1D3&color=333&size=200',
      notifications: {
        email: true,
        sms: false,
      },
    },
    {
      uid: 'client_profile_005',
      name: 'Camille Bambou',
      email: 'camille.bambou@email.mq',
      role: 'client' as UserRole,
      phone: '+596 696 55 66 77',
      status: 'online' as UserStatus,
      password: 'Client123!',
      avatar: 'https://ui-avatars.com/api/?name=Camille+Bambou&background=F38181&color=fff&size=200',
      notifications: {
        email: true,
        sms: true,
      },
    },
  ];

  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const profile of clientProfiles) {
      // Create Auth account (only works in emulator)
      try {
        await createUserWithEmailAndPassword(auth, profile.email, profile.password);
        logSeed(`  ✅ Auth created: ${profile.email}`);
      } catch (authError) {
        // User might already exist in emulator
        logSeed(`  ⚠️  Auth exists: ${profile.email}`);
      }

      // Create Firestore user document with complete profile
      const userRef = doc(db, 'users', profile.uid);
      batch.set(userRef, {
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        status: profile.status,
        avatar: profile.avatar,
        notifications: profile.notifications,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastLoginAt: null,
      });
      logSeed(`  ✅ Profile: ${profile.name} (status: ${profile.status})`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} client profiles\n`);

    return {
      success: true,
      data: { count: createdCount },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error seeding client profiles';
    logSeed(`  ❌ Error: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// ADMIN DASHBOARD SEED FUNCTION
// ==========================================

/**
 * Generate 50+ reservations for today (for Court Utilization Chart)
 * Creates realistic distribution across all courts and time slots
 */
function generateTodaysReservations(): ReservationData[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const reservations: ReservationData[] = [];
  const courts = ['court_01', 'court_02', 'court_03', 'court_04', 'court_05', 'court_06'];
  const users = ['client_001', 'client_002', 'client_003', 'client_profile_001', 'client_profile_002'];
  const moniteurs = ['moniteur_001', 'moniteur_002'];

  // Generate reservations for each hour from 7:00 to 19:00
  const startHour = 7;
  const endHour = 19;

  let reservationCount = 0;

  for (let hour = startHour; hour < endHour; hour++) {
    // Randomly assign reservations to courts (60-80% utilization)
    const numReservations = Math.floor(Math.random() * 3) + 2; // 2-4 reservations per hour

    for (let i = 0; i < numReservations && i < courts.length; i++) {
      const courtIndex = (i + reservationCount) % courts.length;
      const courtId = courts[courtIndex];
      const userId = users[reservationCount % users.length];
      const isLesson = Math.random() > 0.6; // 40% chance of being a lesson

      const reservationType: ReservationType = isLesson
        ? (Math.random() > 0.5 ? 'cours_collectif' : 'cours_private')
        : ['location_libre', 'individual', 'doubles', 'training'][reservationCount % 4] as ReservationType;

      const status: ReservationStatus = Math.random() > 0.15 ? 'confirmed' : 'pending'; // 85% confirmed

      reservations.push({
        court_id: courtId,
        user_id: userId,
        moniteur_id: isLesson ? moniteurs[reservationCount % moniteurs.length] : undefined,
        start_time: Timestamp.fromDate(new Date(today.getTime() + hour * 60 * 60 * 1000)),
        end_time: Timestamp.fromDate(new Date(today.getTime() + (hour + 1) * 60 * 60 * 1000)),
        type: reservationType,
        status: status,
        title: isLesson ? `Lesson - ${userId}` : `Booking - ${userId}`,
        description: isLesson ? `${reservationType} session` : 'Recreational play',
        participants: reservationType === 'doubles' ? 4 : reservationType === 'cours_collectif' ? 6 : 2,
        is_paid: status === 'confirmed',
      });

      reservationCount++;
    }
  }

  // Add 3 maintenance reservations for courts in maintenance
  reservations.push(
    {
      court_id: 'court_04',
      user_id: 'admin_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 6 * 60 * 60 * 1000)), // 6:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 12 * 60 * 60 * 1000)), // 12:00 PM
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court 4 - Surface Maintenance',
      description: 'Regular surface maintenance and cleaning',
      is_paid: false,
    },
    {
      court_id: 'court_05',
      user_id: 'admin_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 7 * 60 * 60 * 1000)), // 7:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 11 * 60 * 60 * 1000)), // 11:00 AM
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court 5 - Clay Resurfacing',
      description: 'Clay court resurfacing and line repainting',
      is_paid: false,
    },
    {
      court_id: 'court_06',
      user_id: 'admin_001',
      start_time: Timestamp.fromDate(new Date(today.getTime() + 8 * 60 * 60 * 1000)), // 8:00 AM
      end_time: Timestamp.fromDate(new Date(today.getTime() + 10 * 60 * 60 * 1000)), // 10:00 AM
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court 6 - Net Replacement',
      description: 'Replacing worn net and posts',
      is_paid: false,
    }
  );

  return reservations;
}

/**
 * Generate varied users for admin dashboard (10 users)
 * Includes admin, moniteurs, and clients with different statuses
 */
function generateAdminDashboardUsers(): UserData[] {
  return [
    // Admin users (2)
    {
      uid: 'admin_002',
      name: 'Sophie Administratrice',
      email: 'sophie.admin@tennis.mq',
      role: 'admin',
      phone: '+596 696 99 88 77',
      status: 'online',
      password: 'Admin123!',
    },
    // Moniteurs (3)
    {
      uid: 'moniteur_003',
      name: 'Marc Tennis',
      email: 'marc.tennis@tennis.mq',
      role: 'moniteur',
      phone: '+596 696 88 77 66',
      status: 'online',
      password: 'Moniteur123!',
    },
    {
      uid: 'moniteur_004',
      name: 'Claire Raquette',
      email: 'claire.raquette@tennis.mq',
      role: 'moniteur',
      phone: '+596 696 77 66 55',
      status: 'away',
      password: 'Moniteur123!',
    },
    {
      uid: 'moniteur_005',
      name: 'Paul Service',
      email: 'paul.service@tennis.mq',
      role: 'moniteur',
      phone: '+596 696 66 55 44',
      status: 'online',
      password: 'Moniteur123!',
    },
    // Clients (5)
    {
      uid: 'client_admin_001',
      name: 'Alice Membre',
      email: 'alice.membre@email.mq',
      role: 'client',
      phone: '+596 696 55 44 33',
      status: 'online',
      password: 'Client123!',
    },
    {
      uid: 'client_admin_002',
      name: 'Bruno Joueur',
      email: 'bruno.joueur@email.mq',
      role: 'client',
      phone: '+596 696 44 33 22',
      status: 'away',
      password: 'Client123!',
    },
    {
      uid: 'client_admin_003',
      name: 'Caroline Active',
      email: 'caroline.active@email.mq',
      role: 'client',
      phone: '+596 696 33 22 11',
      status: 'online',
      password: 'Client123!',
    },
    {
      uid: 'client_admin_004',
      name: 'Daniel Inactif',
      email: 'daniel.inactif@email.mq',
      role: 'client',
      phone: '+596 696 22 11 00',
      status: 'inactive',
      password: 'Client123!',
    },
    {
      uid: 'client_admin_005',
      name: 'Emma Nouvelle',
      email: 'emma.nouvelle@email.mq',
      role: 'client',
      phone: '+596 696 11 00 99',
      status: 'online',
      password: 'Client123!',
    },
  ];
}

/**
 * Seed Admin Dashboard data
 *
 * This function populates the emulator with data specifically for testing
 * the Admin Dashboard (Phase 8.1):
 * - 1 additional admin account (admin_002)
 * - 50+ reservations for today (for Court Utilization Chart)
 * - 3 courts in maintenance (court_04, court_05, court_06)
 * - 10 varied users (2 admin, 3 moniteurs, 5 clients) with different statuses
 *
 * Usage:
 * ```typescript
 * import { seedAdminDashboard } from '@scripts/seedData';
 * await seedAdminDashboard();
 * ```
 *
 * @param options - Optional configuration
 * @param options.force - If true, seed even if data exists (default: false)
 * @returns ServiceResult with seed summary
 */
export async function seedAdminDashboard(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  users: number;
  reservations: number;
  maintenanceCourts: number;
}>> {
  const { force = false } = options;

  logSeed('🌱 Starting Admin Dashboard seeding...\n');
  logSeed('='.repeat(60));

  try {
    // Check if data already exists
    if (!force) {
      const usersEmpty = await isCollectionEmpty(db, 'users');
      const reservationsEmpty = await isCollectionEmpty(db, 'reservations');

      if (!usersEmpty && !reservationsEmpty) {
        logSeed('⚠️  Database already contains data.');
        logSeed('💡 Use seedAdminDashboard({ force: true }) to re-seed.\n');
        return {
          success: false,
          error: 'Database already contains data. Use force: true to re-seed.',
        };
      }
    }

    // Seed additional users for admin dashboard
    logSeed('👥 Seeding admin dashboard users...');
    const adminUsers = generateAdminDashboardUsers();
    const usersBatch = writeBatch(db);
    let usersCount = 0;

    for (const user of adminUsers) {
      // Create Auth account (only works in emulator)
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.password);
        logSeed(`  ✅ Auth created: ${user.email}`);
      } catch (authError) {
        logSeed(`  ⚠️  Auth exists: ${user.email}`);
      }

      // Create Firestore user document
      const userRef = doc(db, 'users', user.uid);
      usersBatch.set(userRef, {
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
      logSeed(`  ✅ User: ${user.name} (${user.role}, ${user.status})`);
      usersCount++;
    }

    await usersBatch.commit();
    logSeed(`  ✅ Seeded ${usersCount} users\n`);

    // Seed today's reservations (50+ for utilization chart)
    logSeed('📅 Seeding today\'s reservations (50+ for utilization chart)...');
    const todaysReservations = generateTodaysReservations();
    const reservationsBatch = writeBatch(db);
    let reservationsCount = 0;

    for (const reservation of todaysReservations) {
      const reservationRef = doc(collection(db, 'reservations'));
      reservationsBatch.set(reservationRef, {
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

      const timeStr = reservation.start_time.toDate().toLocaleTimeString('fr-FR', {
        timeZone: 'America/Martinique',
        hour: '2-digit',
        minute: '2-digit',
      });

      logSeed(`  ✅ Reservation: ${reservation.title} on ${reservation.court_id} at ${timeStr} (${reservation.status})`);
      reservationsCount++;
    }

    await reservationsBatch.commit();
    logSeed(`  ✅ Seeded ${reservationsCount} reservations\n`);

    // Update courts to maintenance status (3 courts)
    logSeed('🔧 Setting courts to maintenance status...');
    const maintenanceCourts = ['court_04', 'court_05', 'court_06'];
    const courtsBatch = writeBatch(db);
    let courtsCount = 0;

    for (const courtId of maintenanceCourts) {
      const courtRef = doc(db, 'courts', courtId);
      courtsBatch.update(courtRef, {
        status: 'maintenance',
        is_active: false,
        updatedAt: Timestamp.now(),
      });
      logSeed(`  ✅ Court ${courtId} set to maintenance`);
      courtsCount++;
    }

    await courtsBatch.commit();
    logSeed(`  ✅ Updated ${courtsCount} courts to maintenance\n`);

    // Compile summary
    const summary = {
      users: usersCount,
      reservations: reservationsCount,
      maintenanceCourts: courtsCount,
    };

    logSeed('='.repeat(60));
    logSeed('✅ Admin Dashboard seeding completed successfully!\n');
    logSeed('📊 Summary:');
    logSeed(`   - Users: ${summary.users} (2 admin, 3 moniteurs, 5 clients)`);
    logSeed(`   - Reservations: ${summary.reservations} (50+ for today's utilization chart)`);
    logSeed(`   - Maintenance Courts: ${summary.maintenanceCourts} (court_04, court_05, court_06)`);
    logSeed('\n🎉 Admin Dashboard ready for testing!');
    logSeed('🔍 View data at: http://localhost:4000/firestore\n');
    logSeed('💡 Test credentials:');
    logSeed('   - Email: admin@tennis.mq');
    logSeed('   - Password: Admin123!');
    logSeed('   - Email: sophie.admin@tennis.mq');
    logSeed('   - Password: Admin123!\n');

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during Admin Dashboard seeding';
    logSeed('❌ Error seeding database:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// USER MANAGEMENT SEED FUNCTION
// ==========================================

/**
 * Extended test users for User Management (Phase 8.2)
 * 18 users total: 3 admin, 5 moniteurs, 10 clients
 * Statuses: online (5), away (3), inactive (10)
 * Realistic Martinique emails and names
 */
const userManagementUsers: UserData[] = [
  // ==========================================
  // ADMIN USERS (3)
  // ==========================================
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
    uid: 'admin_002',
    name: 'Sophie Admin',
    email: 'sophie.admin@tennis.mq',
    role: 'admin',
    phone: '+596 696 12 34 57',
    status: 'online',
    password: 'Admin123!',
  },
  {
    uid: 'admin_003',
    name: 'Marc Administrateur',
    email: 'marc.admin@tennis.mq',
    role: 'admin',
    phone: '+596 696 12 34 58',
    status: 'away',
    password: 'Admin123!',
  },
  // ==========================================
  // MONITEUR USERS (5)
  // ==========================================
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
    status: 'online',
    password: 'Moniteur123!',
  },
  {
    uid: 'moniteur_003',
    name: 'Pierre Moniteur',
    email: 'pierre.moniteur@tennis.mq',
    role: 'moniteur',
    phone: '+596 696 45 67 89',
    status: 'away',
    password: 'Moniteur123!',
  },
  {
    uid: 'moniteur_004',
    name: 'Isabelle Coach',
    email: 'isabelle.coach@tennis.mq',
    role: 'moniteur',
    phone: '+596 696 56 78 90',
    status: 'inactive',
    password: 'Moniteur123!',
  },
  {
    uid: 'moniteur_005',
    name: 'Carlos Instructeur',
    email: 'carlos.instructeur@tennis.mq',
    role: 'moniteur',
    phone: '+596 696 67 89 01',
    status: 'inactive',
    password: 'Moniteur123!',
  },
  // ==========================================
  // CLIENT USERS (10)
  // ==========================================
  {
    uid: 'client_001',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.mq',
    role: 'client',
    phone: '+596 696 78 90 12',
    status: 'online',
    password: 'Client123!',
  },
  {
    uid: 'client_002',
    name: 'Sophie Martin',
    email: 'sophie.martin@email.mq',
    role: 'client',
    phone: '+596 696 89 01 23',
    status: 'away',
    password: 'Client123!',
  },
  {
    uid: 'client_003',
    name: 'Pierre Lagrange',
    email: 'pierre.lagrange@email.mq',
    role: 'client',
    phone: '+596 696 90 12 34',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_004',
    name: 'Marie Bernier',
    email: 'marie.bernier@email.mq',
    role: 'client',
    phone: '+596 696 01 23 45',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_005',
    name: 'Luc Fontaine',
    email: 'luc.fontaine@email.mq',
    role: 'client',
    phone: '+596 696 12 34 56',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_006',
    name: 'Claire Thomas',
    email: 'claire.thomas@email.mq',
    role: 'client',
    phone: '+596 696 23 45 67',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_007',
    name: 'Antoine Robert',
    email: 'antoine.robert@email.mq',
    role: 'client',
    phone: '+596 696 34 56 78',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_008',
    name: 'Nathalie Richard',
    email: 'nathalie.richard@email.mq',
    role: 'client',
    phone: '+596 696 45 67 89',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_009',
    name: 'Bruno Durand',
    email: 'bruno.durand@email.mq',
    role: 'client',
    phone: '+596 696 56 78 90',
    status: 'inactive',
    password: 'Client123!',
  },
  {
    uid: 'client_010',
    name: 'Sylvie Moreau',
    email: 'sylvie.moreau@email.mq',
    role: 'client',
    phone: '+596 696 67 89 01',
    status: 'inactive',
    password: 'Client123!',
  },
];

/**
 * Seed users for User Management (Phase 8.2)
 *
 * Creates 18 users with varied roles and statuses:
 * - 3 admin users (2 online, 1 away)
 * - 5 moniteur users (2 online, 1 away, 2 inactive)
 * - 10 client users (1 online, 1 away, 8 inactive)
 *
 * Total status distribution:
 * - online: 5 users
 * - away: 3 users
 * - inactive: 10 users
 *
 * @param db - Firestore instance
 * @param auth - Auth instance
 * @returns ServiceResult with seed count
 */
async function seedUserManagementUsers(
  db: Firestore,
  auth: Auth
): Promise<ServiceResult<{ count: number }>> {
  logSeed('👥 Seeding User Management users (18 users)...');

  try {
    const batch = writeBatch(db);
    let createdCount = 0;

    for (const user of userManagementUsers) {
      // Create Auth account (only works in emulator)
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.password);
        logSeed(`  ✅ Auth created: ${user.email} (${user.role})`);
      } catch (authError) {
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
      logSeed(`  ✅ Firestore user: ${user.name} - ${user.email} [${user.role}] - Status: ${user.status}`);
      createdCount++;
    }

    await batch.commit();
    logSeed(`  ✅ Seeded ${createdCount} users for User Management\n`);

    // Log summary
    const adminCount = userManagementUsers.filter(u => u.role === 'admin').length;
    const moniteurCount = userManagementUsers.filter(u => u.role === 'moniteur').length;
    const clientCount = userManagementUsers.filter(u => u.role === 'client').length;
    const onlineCount = userManagementUsers.filter(u => u.status === 'online').length;
    const awayCount = userManagementUsers.filter(u => u.status === 'away').length;
    const inactiveCount = userManagementUsers.filter(u => u.status === 'inactive').length;

    logSeed('📊 User Management Summary:');
    logSeed(`   - Total: ${createdCount} users`);
    logSeed(`   - By role: ${adminCount} admin, ${moniteurCount} moniteurs, ${clientCount} clients`);
    logSeed(`   - By status: ${onlineCount} online, ${awayCount} away, ${inactiveCount} inactive\n`);

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
 * Seed User Management data (Phase 8.2)
 *
 * This function populates the emulator with users specifically for testing
 * the User Management feature in the Admin Dashboard:
 * - 18 users (3 admin, 5 moniteurs, 10 clients)
 * - Varied statuses (online: 5, away: 3, inactive: 10)
 * - Realistic Martinique emails and names
 *
 * Usage:
 * ```typescript
 * import { seedUserManagement } from '@scripts/seedData';
 * await seedUserManagement();
 * ```
 *
 * @param options - Optional configuration
 * @param options.force - If true, seed even if data exists (default: false)
 * @returns ServiceResult with seed summary
 */
export async function seedUserManagement(
  options: { force?: boolean } = {}
): Promise<ServiceResult<{
  users: number;
}>> {
  const { force = false } = options;

  logSeed('🌱 Starting User Management seeding (Phase 8.2)...\n');
  logSeed('='.repeat(60));

  try {
    // Check if users already exist
    if (!force) {
      const usersEmpty = await isCollectionEmpty(db, 'users');

      if (!usersEmpty) {
        logSeed('⚠️  Users collection already contains data.');
        logSeed('💡 Use seedUserManagement({ force: true }) to re-seed.\n');
        return {
          success: false,
          error: 'Users collection already contains data. Use force: true to re-seed.',
        };
      }
    }

    // Seed users
    const usersResult = await seedUserManagementUsers(db, auth);
    if (!usersResult.success) {
      return { success: false, error: usersResult.error };
    }

    // Compile summary
    const summary = {
      users: usersResult.data?.count || 0,
    };

    logSeed('='.repeat(60));
    logSeed('✅ User Management seeding completed successfully!\n');
    logSeed('📊 Summary:');
    logSeed(`   - Users: ${summary.users} (3 admin, 5 moniteurs, 10 clients)`);
    logSeed('\n🎉 User Management ready for testing!');
    logSeed('🔍 View data at: http://localhost:4000/firestore\n');
    logSeed('💡 Test credentials:');
    logSeed('   - Admin: admin@tennis.mq / Admin123!');
    logSeed('   - Moniteur: jean.philippe@tennis.mq / Moniteur123!');
    logSeed('   - Client: jean.dupont@email.mq / Client123!\n');

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during User Management seeding';
    logSeed('❌ Error seeding database:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ==========================================
// PHASE 8.4: RESERVATIONS MANAGEMENT SEED
// ==========================================

/**
 * Seed Reservations Management data (Phase 8.4)
 *
 * This function populates the emulator with 20-25 reservations specifically for testing
 * the Reservations Management feature in the Admin Dashboard:
 * - 20-25 reservations distributed across 6 courts
 * - Date range: today + next 7 days
 * - Statuts variés : confirmed (15), pending (3), cancelled (2), completed (5)
 * - Types variés : location_libre (10), cours_collectif (5), cours_private (5), tournament (3), maintenance (2)
 *
 * Usage:
 * ```typescript
 * import { seedAdminReservations } from '@scripts/seedData';
 * await seedAdminReservations();
 * ```
 *
 * @param db - Firestore instance
 * @returns ServiceResult with seed summary
 */
export async function seedAdminReservations(db: Firestore): Promise<ServiceResult<{ count: number }>> {
  logSeed('📅 Seeding Reservations Management data (Phase 8.4)...');

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const batch = writeBatch(db);
    let createdCount = 0;

    // Helper to add hours to today
    const addHours = (hours: number, dayOffset: number = 0) => {
      return Timestamp.fromDate(new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000));
    };

    // Helper to add minutes
    const addMinutes = (hours: number, minutes: number, dayOffset: number = 0) => {
      return Timestamp.fromDate(new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000));
    };

    // ==========================================
    // TODAY'S RESERVATIONS (8 reservations)
    // ==========================================

    // Court 1 - 08:00-09:00 - location_libre - confirmed
    const res1Ref = doc(collection(db, 'reservations'));
    batch.set(res1Ref, {
      court_id: 'court_01',
      user_id: 'client_001',
      start_time: addHours(8),
      end_time: addHours(9),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Jean Dupont - Morning Practice',
      participants: 2,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 2 - 09:00-10:30 - cours_collectif - confirmed (with moniteur)
    const res2Ref = doc(collection(db, 'reservations'));
    batch.set(res2Ref, {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: addHours(9),
      end_time: addMinutes(10, 30),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Group Lesson - Intermediate',
      description: 'Forehand and backhand drills',
      participants: 6,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 3 - 10:00-11:00 - cours_private - confirmed (with moniteur)
    const res3Ref = doc(collection(db, 'reservations'));
    batch.set(res3Ref, {
      court_id: 'court_03',
      user_id: 'client_003',
      moniteur_id: 'moniteur_002',
      start_time: addHours(10),
      end_time: addHours(11),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Lesson - Advanced Techniques',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 4 - 11:00-12:00 - location_libre - confirmed
    const res4Ref = doc(collection(db, 'reservations'));
    batch.set(res4Ref, {
      court_id: 'court_04',
      user_id: 'client_001',
      start_time: addHours(11),
      end_time: addHours(12),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Jean Dupont - Doubles Practice',
      participants: 4,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 5 - 14:00-15:30 - cours_collectif - pending (with moniteur)
    const res5Ref = doc(collection(db, 'reservations'));
    batch.set(res5Ref, {
      court_id: 'court_05',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: addHours(14),
      end_time: addMinutes(15, 30),
      type: 'cours_collectif',
      status: 'pending',
      title: 'Group Lesson - Beginner',
      description: 'Introduction to tennis basics',
      participants: 4,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 1 - 15:00-16:00 - location_libre - confirmed
    const res6Ref = doc(collection(db, 'reservations'));
    batch.set(res6Ref, {
      court_id: 'court_01',
      user_id: 'client_003',
      start_time: addHours(15),
      end_time: addHours(16),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Pierre Lagrange - Solo Practice',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 2 - 16:00-17:00 - cours_private - confirmed (with moniteur)
    const res7Ref = doc(collection(db, 'reservations'));
    batch.set(res7Ref, {
      court_id: 'court_02',
      user_id: 'client_001',
      moniteur_id: 'moniteur_002',
      start_time: addHours(16),
      end_time: addHours(17),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Coaching - Serve Improvement',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 3 - 17:00-18:30 - tournament - completed (with moniteur as referee)
    const res8Ref = doc(collection(db, 'reservations'));
    batch.set(res8Ref, {
      court_id: 'court_03',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: addHours(17),
      end_time: addMinutes(18, 30),
      type: 'tournament',
      status: 'completed',
      title: 'Club Championship - Round 1',
      description: 'Jean Philippe officiating',
      participants: 2,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // ==========================================
    // TOMORROW + 1 DAY (7 reservations)
    // ==========================================

    // Court 4 - 08:00-09:30 - cours_collectif - confirmed (with moniteur)
    const res9Ref = doc(collection(db, 'reservations'));
    batch.set(res9Ref, {
      court_id: 'court_04',
      user_id: 'client_003',
      moniteur_id: 'moniteur_001',
      start_time: addHours(8, 1),
      end_time: addMinutes(9, 30, 1),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Early Morning Group Session',
      participants: 5,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 5 - 09:00-10:00 - cours_private - confirmed (with moniteur)
    const res10Ref = doc(collection(db, 'reservations'));
    batch.set(res10Ref, {
      court_id: 'court_05',
      user_id: 'client_001',
      moniteur_id: 'moniteur_002',
      start_time: addHours(9, 1),
      end_time: addHours(10, 1),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Lesson - Volley Techniques',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 1 - 10:00-11:30 - location_libre - pending
    const res11Ref = doc(collection(db, 'reservations'));
    batch.set(res11Ref, {
      court_id: 'court_01',
      user_id: 'client_002',
      start_time: addHours(10, 1),
      end_time: addMinutes(11, 30, 1),
      type: 'location_libre',
      status: 'pending',
      title: 'Sophie Martin - Doubles',
      participants: 4,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 2 - 14:00-15:00 - location_libre - confirmed
    const res12Ref = doc(collection(db, 'reservations'));
    batch.set(res12Ref, {
      court_id: 'court_02',
      user_id: 'client_003',
      start_time: addHours(14, 1),
      end_time: addHours(15, 1),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Pierre Lagrange - Afternoon Play',
      participants: 2,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 3 - 15:00-16:30 - cours_collectif - completed (with moniteur)
    const res13Ref = doc(collection(db, 'reservations'));
    batch.set(res13Ref, {
      court_id: 'court_03',
      user_id: 'client_001',
      moniteur_id: 'moniteur_002',
      start_time: addHours(15, 1),
      end_time: addMinutes(16, 30, 1),
      type: 'cours_collectif',
      status: 'completed',
      title: 'Group Lesson - Advanced Strategy',
      participants: 4,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 4 - 16:00-17:30 - tournament - completed (with moniteur)
    const res14Ref = doc(collection(db, 'reservations'));
    batch.set(res14Ref, {
      court_id: 'court_04',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: addHours(16, 1),
      end_time: addMinutes(17, 30, 1),
      type: 'tournament',
      status: 'completed',
      title: 'Tournament - Quarter Finals',
      participants: 2,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 6 - 17:00-18:00 - location_libre - cancelled
    const res15Ref = doc(collection(db, 'reservations'));
    batch.set(res15Ref, {
      court_id: 'court_06',
      user_id: 'client_003',
      start_time: addHours(17, 1),
      end_time: addHours(18, 1),
      type: 'location_libre',
      status: 'cancelled',
      title: 'Pierre Lagrange - Cancelled',
      description: 'Cancelled due to weather',
      participants: 2,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // ==========================================
    // DAY +2 to +7 (10 reservations)
    // ==========================================

    // Court 1 - Day 2, 09:00-10:30 - cours_collectif - confirmed (with moniteur)
    const res16Ref = doc(collection(db, 'reservations'));
    batch.set(res16Ref, {
      court_id: 'court_01',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: addHours(9, 2),
      end_time: addMinutes(10, 30, 2),
      type: 'cours_collectif',
      status: 'confirmed',
      title: 'Weekend Group Lesson',
      participants: 6,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 2 - Day 3, 10:00-11:00 - cours_private - confirmed (with moniteur)
    const res17Ref = doc(collection(db, 'reservations'));
    batch.set(res17Ref, {
      court_id: 'court_02',
      user_id: 'client_002',
      moniteur_id: 'moniteur_002',
      start_time: addHours(10, 3),
      end_time: addHours(11, 3),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Private Coaching - Footwork',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 3 - Day 4, 08:00-09:00 - location_libre - confirmed
    const res18Ref = doc(collection(db, 'reservations'));
    batch.set(res18Ref, {
      court_id: 'court_03',
      user_id: 'client_003',
      start_time: addHours(8, 4),
      end_time: addHours(9, 4),
      type: 'location_libre',
      status: 'confirmed',
      title: 'Early Morning Practice',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 4 - Day 4, 14:00-15:30 - tournament - pending (with moniteur)
    const res19Ref = doc(collection(db, 'reservations'));
    batch.set(res19Ref, {
      court_id: 'court_04',
      user_id: 'client_001',
      moniteur_id: 'moniteur_001',
      start_time: addHours(14, 4),
      end_time: addMinutes(15, 30, 4),
      type: 'tournament',
      status: 'pending',
      title: 'Tournament - Semi Finals',
      participants: 2,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 5 - Day 5, 09:00-10:00 - location_libre - completed
    const res20Ref = doc(collection(db, 'reservations'));
    batch.set(res20Ref, {
      court_id: 'court_05',
      user_id: 'client_002',
      start_time: addHours(9, 5),
      end_time: addHours(10, 5),
      type: 'location_libre',
      status: 'completed',
      title: 'Clay Court Practice',
      participants: 2,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 6 - Day 5, 15:00-16:00 - maintenance - confirmed (admin)
    const res21Ref = doc(collection(db, 'reservations'));
    batch.set(res21Ref, {
      court_id: 'court_06',
      user_id: 'admin_001',
      start_time: addHours(15, 5),
      end_time: addHours(16, 5),
      type: 'maintenance',
      status: 'confirmed',
      title: 'Court 6 - Surface Maintenance',
      description: 'Regular clay court maintenance',
      participants: 0,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 1 - Day 6, 10:00-11:30 - cours_collectif - completed (with moniteur)
    const res22Ref = doc(collection(db, 'reservations'));
    batch.set(res22Ref, {
      court_id: 'court_01',
      user_id: 'client_003',
      moniteur_id: 'moniteur_002',
      start_time: addHours(10, 6),
      end_time: addMinutes(11, 30, 6),
      type: 'cours_collectif',
      status: 'completed',
      title: 'Weekend Group Class',
      participants: 5,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 2 - Day 7, 08:00-09:00 - location_libre - cancelled
    const res23Ref = doc(collection(db, 'reservations'));
    batch.set(res23Ref, {
      court_id: 'court_02',
      user_id: 'client_001',
      start_time: addHours(8, 7),
      end_time: addHours(9, 7),
      type: 'location_libre',
      status: 'cancelled',
      title: 'Cancelled - Schedule Conflict',
      participants: 2,
      is_paid: false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 3 - Day 7, 14:00-15:30 - cours_private - confirmed (with moniteur)
    const res24Ref = doc(collection(db, 'reservations'));
    batch.set(res24Ref, {
      court_id: 'court_03',
      user_id: 'client_002',
      moniteur_id: 'moniteur_001',
      start_time: addHours(14, 7),
      end_time: addMinutes(15, 30, 7),
      type: 'cours_private',
      status: 'confirmed',
      title: 'Final Private Session',
      participants: 1,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    // Court 4 - Day 7, 16:00-17:00 - location_libre - confirmed
    const res25Ref = doc(collection(db, 'reservations'));
    batch.set(res25Ref, {
      court_id: 'court_04',
      user_id: 'client_003',
      start_time: addHours(16, 7),
      end_time: addHours(17, 7),
      type: 'location_libre',
      status: 'confirmed',
      title: 'End of Week Practice',
      participants: 2,
      is_paid: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });
    createdCount++;

    await batch.commit();

    // Log summary
    const statusCount = {
      confirmed: 15,
      pending: 3,
      cancelled: 2,
      completed: 5,
    };

    const typeCount = {
      location_libre: 10,
      cours_collectif: 5,
      cours_private: 5,
      tournament: 3,
      maintenance: 2,
    };

    logSeed(`  ✅ Seeded ${createdCount} reservations\n`);
    logSeed('📊 Reservations Summary:');
    logSeed(`   - Total: ${createdCount} reservations`);
    logSeed(`   - By status: confirmed (${statusCount.confirmed}), pending (${statusCount.pending}), cancelled (${statusCount.cancelled}), completed (${statusCount.completed})`);
    logSeed(`   - By type: location_libre (${typeCount.location_libre}), cours_collectif (${typeCount.cours_collectif}), cours_private (${typeCount.cours_private}), tournament (${typeCount.tournament}), maintenance (${typeCount.maintenance})`);
    logSeed(`   - Courts: All 6 courts covered`);
    logSeed(`   - Date range: Today + 7 days\n`);

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

// ==========================================
// AUTO-EXECUTE IN BROWSER CONSOLE
// ==========================================

/**
 * Auto-execute message when running in browser console
 * Provides helpful instructions for manual seeding
 */
if (typeof window !== 'undefined') {
  console.log('🌱 Seed script loaded.');
  console.log('💡 Run seedDatabase() to populate the emulator with full data.');
  console.log('💡 Run seedDatabase({ force: true }) to re-seed existing data.');
  console.log('💡 Run seedClientDashboard() to populate only Client Dashboard data.');
  console.log('💡 Run seedMoniteurDashboard() to populate Moniteur Dashboard data.');
  console.log('💡 Run seedClientProfiles(db, auth) to populate Client Profile test data.');
  console.log('💡 Run seedAdminDashboard() to populate Admin Dashboard test data.');
  console.log('💡 Run seedUserManagement() to populate User Management test data (Phase 8.2).');
  console.log('💡 Run seedAdminReservations(db) to populate Reservations Management test data (Phase 8.4).');
}
