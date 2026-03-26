/**
 * SeedDataButton Component
 * 
 * Button to seed Firebase emulators with sample data.
 * Used for development and testing.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDbInstance, getAuthInstance } from '../../config/firebase.config';
import { collection, doc, Timestamp, writeBatch } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';

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
      // 2. CREATE USERS (with try/catch for each)
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

      for (const userData of users) {
        try {
          // Try to sign in first to check if user exists
          try {
            await signInWithEmailAndPassword(auth, userData.email, userData.password);
            console.log(`[SeedData] User ${userData.email} already exists`);
            await signOut(auth);
            continue;
          } catch (signInError) {
            // User doesn't exist, create it
          }

          // Create user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
          );

          await updateProfile(userCredential.user, {
            displayName: `${userData.firstName} ${userData.lastName}`,
          });

          // Create user document in Firestore
          const userRef = doc(db, 'users', userData.id);
          await userRef.set({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            status: userData.status,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });

          console.log(`[SeedData] ✅ User ${userData.email} created`);

          // Sign out after creating each user
          await signOut(auth);
        } catch (err: any) {
          console.log(`[SeedData] User ${userData.email} might already exist:`, err?.message);
        }
      }

      setSeedStatus('success');
      setMessage('✅ Data seeded successfully!');
      console.log('[SeedData] ✅ Success');
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
