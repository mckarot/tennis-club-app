/**
 * Seed Script for Firebase Emulators
 *
 * This script populates the Firestore emulator with sample data for testing.
 * Run this script after starting the Firebase emulators.
 *
 * Usage:
 *   npm run seed
 *
 * Or directly:
 *   npx tsx src/scripts/seedEmulators.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Firebase configuration for emulator
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'tennis-francois-dev.firebaseapp.com',
  projectId: 'tennis-francois-dev',
  storageBucket: 'tennis-francois-dev.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// SEED DATA
// ==========================================

const courts = [
  {
    id: 'court_001',
    number: 1,
    name: 'Court Central',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
    description: 'Court principal avec éclairage pour les matchs de nuit',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'court_002',
    number: 2,
    name: 'Court Nord',
    type: 'Terre',
    surface: 'Clay',
    status: 'active',
    is_active: true,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    description: 'Court en terre battue ombragé',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'court_003',
    number: 3,
    name: 'Court Sud',
    type: 'Quick',
    surface: 'Synthetic',
    status: 'active',
    is_active: true,
    image: 'https://images.unsplash.com/photo-1622163642998-1ea14b097887?w=400',
    description: 'Court synthétique rapide',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'court_004',
    number: 4,
    name: 'Court Est',
    type: 'Terre',
    surface: 'Clay',
    status: 'maintenance',
    is_active: false,
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
    description: 'Court en terre battue - En maintenance',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'court_005',
    number: 5,
    name: 'Court Ouest',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
    description: 'Court rapide avec vue sur la piscine',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'court_006',
    number: 6,
    name: 'Court Couvert',
    type: 'Quick',
    surface: 'Hard',
    status: 'active',
    is_active: true,
    image: 'https://images.unsplash.com/photo-1622163642998-1ea14b097887?w=400',
    description: 'Court couvert chauffé pour jouer en hiver',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

const users = [
  {
    uid: 'admin_001',
    email: 'admin@tennis-club.fr',
    name: 'Admin Tennis',
    role: 'admin',
    status: 'online',
    phone: '+596 696 123 456',
    avatar: 'https://ui-avatars.com/api/?name=Admin+Tennis&background=006b3f&color=fff',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  },
  {
    uid: 'moniteur_001',
    email: 'marie.martin@tennis-club.fr',
    name: 'Marie Martin',
    role: 'moniteur',
    status: 'online',
    phone: '+596 696 234 567',
    avatar: 'https://ui-avatars.com/api/?name=Marie+Martin&background=9d431b&color=fff',
    specialties: ['Tennis adulte', 'Préparation physique'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  },
  {
    uid: 'moniteur_002',
    email: 'pierre.dubois@tennis-club.fr',
    name: 'Pierre Dubois',
    role: 'moniteur',
    status: 'away',
    phone: '+596 696 345 678',
    avatar: 'https://ui-avatars.com/api/?name=Pierre+Dubois&background=9d431b&color=fff',
    specialties: ['École de tennis', 'Compétition'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  },
  {
    uid: 'client_001',
    email: 'jean.dupont@email.fr',
    name: 'Jean Dupont',
    role: 'client',
    status: 'online',
    phone: '+596 696 456 789',
    avatar: 'https://ui-avatars.com/api/?name=Jean+Dupont&background=E8F8F0&color=006b3f',
    membership: 'Gold',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  },
  {
    uid: 'client_002',
    email: 'sophie.bernard@email.fr',
    name: 'Sophie Bernard',
    role: 'client',
    status: 'online',
    phone: '+596 696 567 890',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=E8F8F0&color=006b3f',
    membership: 'Silver',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastLoginAt: Timestamp.now(),
  },
];

// ==========================================
// SEED FUNCTIONS
// ==========================================

async function seedCourts() {
  console.log('🎾 Seeding courts...');
  const batch = writeBatch(db);
  
  courts.forEach((court) => {
    const courtRef = doc(db, 'courts', court.id);
    batch.set(courtRef, court);
  });
  
  await batch.commit();
  console.log(`✅ ${courts.length} courts seeded`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Create users in Auth emulator
  for (const userData of users) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        'Password123!' // Default password for all test users
      );
      
      await updateProfile(userCredential.user, {
        displayName: userData.name,
      });
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', userData.uid), userData);
    } catch (error) {
      console.log(`⚠️ User ${userData.email} already exists, skipping...`);
      // Still add to Firestore if auth fails
      await setDoc(doc(db, 'users', userData.uid), userData).catch(() => {});
    }
  }
  
  console.log(`✅ ${users.length} users seeded`);
}

async function seedReservations() {
  console.log('📅 Seeding reservations...');
  
  const today = new Date();
  const reservations = [];
  
  // Create some sample reservations for today and next few days
  for (let day = 0; day < 5; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    
    // Morning slots (8:00 - 12:00)
    for (let hour = 8; hour < 12; hour++) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);
      
      reservations.push({
        court_id: `court_00${(day % 6) + 1}`,
        user_id: `client_00${(day % 2) + 1}`,
        moniteur_id: day % 2 === 0 ? 'moniteur_001' : 'moniteur_002',
        start_time: Timestamp.fromDate(startTime),
        end_time: Timestamp.fromDate(endTime),
        type: day % 3 === 0 ? 'cours_collectif' : 'cours_private',
        status: 'confirmed',
        title: day % 3 === 0 ? 'Cours Collectif - Groupe A' : 'Cours Private',
        description: 'Session d\'entraînement',
        participants: day % 3 === 0 ? 6 : 2,
        is_paid: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });
    }
  }
  
  const batch = writeBatch(db);
  
  reservations.forEach((reservation, index) => {
    const reservationRef = doc(db, 'reservations', `res_${index}`);
    batch.set(reservationRef, reservation);
  });
  
  await batch.commit();
  console.log(`✅ ${reservations.length} reservations seeded`);
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function seedEmulators() {
  console.log('🌱 Starting Firebase Emulator Seed...\n');
  
  try {
    await seedCourts();
    await seedUsers();
    await seedReservations();
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin: admin@tennis-club.fr / Password123!');
    console.log('   Moniteur: marie.martin@tennis-club.fr / Password123!');
    console.log('   Client: jean.dupont@email.fr / Password123!');
    console.log('\n🎯 Next steps:');
    console.log('   1. Refresh your browser (localhost:5173)');
    console.log('   2. Login with test credentials');
    console.log('   3. Explore the Emulator UI at http://localhost:4000');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed script
seedEmulators();
