/**
 * SeedDataButton Component
 *
 * Button to seed Firebase emulators with sample data.
 * Used for development and testing.
 *
 * IMPORTANT: This component ensures Firestore user profiles are ALWAYS created/updated
 * even if the Firebase Auth user already exists. This fixes the "User profile not found"
 * synchronization issue between Auth and Firestore.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDbInstance, getAuthInstance } from '../../config/firebase.config';
import { doc, setDoc, Timestamp, writeBatch } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setIsSeeding(true);
    setMessage('Seeding in progress...');

    try {
      const db = getDbInstance();
      const auth = getAuthInstance();

      // ==========================================
      // 1. CREATE COURTS
      // ==========================================
      const batch = writeBatch(db);

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
          description: 'Main court with night lighting',
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
          description: 'Shaded clay court',
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
          description: 'Fast synthetic court',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
        {
          id: 'court_004',
          number: 4,
          name: 'Court Est',
          type: 'Terre',
          surface: 'Clay',
          status: 'active',
          is_active: true,
          image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
          description: 'Clay court with panoramic view',
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
          description: 'Fast court with pool view',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        },
      ];

      courts.forEach((court) => {
        const courtRef = doc(db, 'courts', court.id);
        batch.set(courtRef, court);
      });

      await batch.commit();
      console.log('[SeedData] ✅ Courts seeded');

      // ==========================================
      // 2. CREATE/UPDATE USERS (Auth + Firestore sync)
      // ==========================================
      // KEY FIX: Even if Auth user exists, we ALWAYS create/update Firestore document
      // using the Firebase Auth UID as the Firestore document ID
      // ==========================================
      const users = [
        {
          id: 'admin_001',
          email: 'admin@tennis-club.com',
          password: 'Admin123!',
          role: 'admin' as const,
          firstName: 'Jean',
          lastName: 'Dupont',
          phone: '+596696123456',
          status: 'active' as const,
        },
        {
          id: 'client_001',
          email: 'client@tennis-club.com',
          password: 'Client123!',
          role: 'client' as const,
          firstName: 'Marie',
          lastName: 'Martin',
          phone: '+596696234567',
          status: 'active' as const,
        },
        {
          id: 'moniteur_001',
          email: 'moniteur@tennis-club.com',
          password: 'Moniteur123!',
          role: 'moniteur' as const,
          firstName: 'Pierre',
          lastName: 'Bernard',
          phone: '+596696345678',
          status: 'active' as const,
        },
      ];

      console.log('[SeedData] 🔄 Starting user seeding with Auth/Firestore sync...');

      for (const userData of users) {
        try {
          let userCredential: UserCredential;
          let firebaseUserId: string;
          let isNewUser = false;

          // Step 1: Try to sign in to get the existing user's UID
          try {
            userCredential = await signInWithEmailAndPassword(
              auth,
              userData.email,
              userData.password
            );
            firebaseUserId = userCredential.user.uid;
            console.log(`[SeedData] 🔑 Auth user exists: ${userData.email} (UID: ${firebaseUserId})`);
          } catch (signInError: any) {
            // Step 2: If sign in fails, user doesn't exist - create it
            if (signInError?.code === 'auth/user-not-found' || signInError?.code === 'auth/wrong-password') {
              console.log(`[SeedData] ➕ Creating new Auth user: ${userData.email}`);
              userCredential = await createUserWithEmailAndPassword(
                auth,
                userData.email,
                userData.password
              );
              firebaseUserId = userCredential.user.uid;
              isNewUser = true;

              // Update display profile for new users
              await updateProfile(userCredential.user, {
                displayName: `${userData.firstName} ${userData.lastName}`,
              });

              console.log(`[SeedData] ✅ Auth user created: ${userData.email} (UID: ${firebaseUserId})`);
            } else {
              throw signInError;
            }
          }

          // Step 3: ALWAYS create/update Firestore document with the Firebase Auth UID
          // This is the KEY FIX - we NEVER skip Firestore creation even if Auth user exists
          const userRef = doc(db, 'users', firebaseUserId);
          
          console.log(`[SeedData] 📝 Creating/updating Firestore document for ${userData.email}...`);
          
          await setDoc(
            userRef,
            {
              id: firebaseUserId,
              email: userData.email,
              role: userData.role,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              status: userData.status,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            },
            { merge: true } // merge: true updates existing doc or creates new one
          );

          console.log(
            `[SeedData] ✅ Firestore ${isNewUser ? 'created' : 'updated'} for ${userData.email} ` +
            `(UID: ${firebaseUserId}, Role: ${userData.role})`
          );

          // Step 4: Sign out after processing each user
          await signOut(auth);
          console.log(`[SeedData] 🚪 Signed out ${userData.email}\n`);

        } catch (err: any) {
          if (err?.code === 'auth/email-already-in-use') {
            console.log(`[SeedData] ⚠️  User ${userData.email} already exists in Auth, but Firestore should still be created`);
          } else {
            console.error(`[SeedData] ❌ Error processing user ${userData.email}:`, err?.message);
            console.error('[SeedData] Error details:', err);
          }
        }
      }

      setSeedStatus('success');
      setMessage('✅ Data seeded successfully!');
      console.log('[SeedData] ✅ User seeding completed');
      console.log('[SeedData] ✅ Success');

      // ==========================================
      // 2. CREATE RESERVATIONS
      // ==========================================
      console.log('\n[SeedData] 📅 Starting reservation seeding...');

      const reservationsBatch = writeBatch(db);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create sample reservations for today and tomorrow
      const sampleReservations = [
        {
          court_id: 'court_001',
          court_name: 'Court Central',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)),
          status: 'confirmed',
          type: 'booking',
          created_at: Timestamp.now(),
        },
        {
          court_id: 'court_002',
          court_name: 'Court Nord',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 30)),
          status: 'confirmed',
          type: 'booking',
          created_at: Timestamp.now(),
        },
        {
          court_id: 'court_003',
          court_name: 'Court Sud',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0)),
          status: 'pending',
          type: 'booking',
          created_at: Timestamp.now(),
        },
        {
          court_id: 'court_001',
          court_name: 'Court Central',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 30)),
          status: 'confirmed',
          type: 'booking',
          created_at: Timestamp.now(),
        },
        {
          court_id: 'court_004',
          court_name: 'Court Est',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0)),
          status: 'confirmed',
          type: 'booking',
          created_at: Timestamp.now(),
        },
        {
          court_id: 'court_005',
          court_name: 'Court Ouest',
          user_id: 'client_001',
          user_name: 'Marie Martin',
          user_email: 'client@tennis-club.com',
          date: Timestamp.fromDate(today),
          start_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0)),
          end_time: Timestamp.fromDate(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0)),
          status: 'confirmed',
          type: 'booking',
          created_at: Timestamp.now(),
        },
      ];

      sampleReservations.forEach((reservation, index) => {
        const reservationRef = doc(db, 'reservations', `reservation_${index}`);
        reservationsBatch.set(reservationRef, reservation);
        console.log(`[SeedData] 📝 Created reservation ${index + 1}/${sampleReservations.length}: ${reservation.court_name} ${reservation.start_time}-${reservation.end_time}`);
      });

      await reservationsBatch.commit();
      console.log('[SeedData] ✅ Reservations seeding completed');
    } catch (err: any) {
      console.error('[SeedData] ❌ Error:', err);
      setSeedStatus('error');
      setMessage(`❌ Error: ${err?.message || 'Failed to seed data'}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => {
        setSeedStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={seedData}
        disabled={isSeeding}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-body text-sm font-semibold shadow-md transition-all
          ${
            seedStatus === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : seedStatus === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary text-white hover:bg-primary-container'
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: isSeeding ? 1 : 1.02 }}
        whileTap={{ scale: isSeeding ? 1 : 0.98 }}
      >
        <span className="material-symbols-outlined text-lg">
          {isSeeding ? 'hourglass_empty' : seedStatus === 'success' ? 'check_circle' : 'database_upload'}
        </span>
        {isSeeding ? 'Seeding...' : seedStatus === 'success' ? 'Seeded!' : 'Seed Data'}
      </motion.button>

      {message && (
        <p className={`text-xs ${seedStatus === 'error' ? 'text-red-600' : 'text-on-surface'}`}>
          {message}
        </p>
      )}

      {/* Login Credentials */}
      <div className="mt-4 rounded-lg bg-surface-container-low p-4 text-xs">
        <p className="font-bold text-on-surface">Login Credentials:</p>
        <div className="mt-2 space-y-1 text-on-surface-variant">
          <p><strong>Admin:</strong> admin@tennis-club.com / Admin123!</p>
          <p><strong>Client:</strong> client@tennis-club.com / Client123!</p>
          <p><strong>Moniteur:</strong> moniteur@tennis-club.com / Moniteur123!</p>
        </div>
      </div>
    </div>
  );
}

export default SeedDataButton;
