/**
 * Firebase Configuration - Singleton Pattern
 *
 * This module provides a singleton instance of Firebase services to prevent
 * multiple initializations and emulator connection issues.
 *
 * Key features:
 * - Singleton pattern for app, db, and auth instances
 * - Automatic emulator connection in development mode
 * - Guard flag to prevent double emulator connection
 * - TypeScript strict mode (no any)
 *
 * @module @config/firebase.config
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from 'firebase/auth';

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

/**
 * Firebase configuration object
 * Uses environment variables with fallback values for development
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tennis-francois-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tennis-francois-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tennis-francois-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// ==========================================
// SINGLETON INSTANCES
// ==========================================

/**
 * Singleton instance of Firebase App
 */
let appInstance: FirebaseApp | null = null;

/**
 * Singleton instance of Firestore
 */
let dbInstance: Firestore | null = null;

/**
 * Singleton instance of Auth
 */
let authInstance: Auth | null = null;

/**
 * Guard flag to prevent double emulator connection
 * Initialized to false, set to true AFTER emulators are connected
 */
let emulatorsConnected = false;

// ==========================================
// ACCESSOR FUNCTIONS
// ==========================================

/**
 * Get or create Firebase App singleton instance
 */
export function getAppInstance(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

/**
 * Get or create Firestore singleton instance
 *
 * Automatically connects to Firestore emulator in development mode
 * when VITE_USE_EMULATOR environment variable is set to 'true'
 */
export function getDbInstance(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getAppInstance());

    // Connect to Firestore emulator in development mode
    // Check flag BEFORE connecting to prevent double connection
    if (import.meta.env.DEV && !emulatorsConnected && import.meta.env.VITE_USE_EMULATOR === 'true') {
      connectFirestoreEmulator(dbInstance, 'localhost', 8080);
      console.log('[Firebase] ✅ Firestore connecté aux émulateurs (localhost:8080)');
    }
  }
  return dbInstance;
}

/**
 * Get or create Auth singleton instance
 *
 * Automatically connects to Auth emulator in development mode
 * when VITE_USE_EMULATOR environment variable is set to 'true'
 */
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getAppInstance());

    // Connect to Auth emulator in development mode
    // Check flag BEFORE connecting to prevent double connection
    if (import.meta.env.DEV && !emulatorsConnected && import.meta.env.VITE_USE_EMULATOR === 'true') {
      connectAuthEmulator(authInstance, 'http://localhost:9099');
      console.log('[Firebase] ✅ Auth connecté aux émulateurs (localhost:9099)');
    }
  }
  return authInstance;
}

// ==========================================
// INITIALIZATION ON MODULE LOAD
// ==========================================

/**
 * Initialize all Firebase services on module load
 * Sets emulatorsConnected flag AFTER initialization is complete
 */
const app = getAppInstance();
const db = getDbInstance();
const auth = getAuthInstance();

// Set emulators connected flag AFTER all instances are initialized
// This ensures the flag is only set after emulators have been connected
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
  emulatorsConnected = true;
  console.log('[Firebase] ✅ Émulateurs connectés');
}

// ==========================================
// EXPORTED INSTANCES
// ==========================================

/**
 * Default Firebase App instance
 */
export { app as app };

/**
 * Default Firestore instance
 * Use for all Firestore operations
 *
 * @example
 * import { db } from '@config/firebase.config';
 * const q = query(collection(db, 'users'), where('role', '==', 'admin'));
 */
export { db as db };

/**
 * Default Auth instance
 * Use for all Authentication operations
 *
 * @example
 * import { auth } from '@config/firebase.config';
 * const user = auth.currentUser;
 */
export { auth as auth };

// ==========================================
// RE-EXPORT FIREBASE TYPES
// ==========================================

export {
  Timestamp,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  onSnapshot,
  collectionGroup,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type DocumentReference,
  type CollectionReference,
  type DocumentData,
  type Timestamp as FirestoreTimestamp,
} from 'firebase/firestore';

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  type AuthError,
} from 'firebase/auth';

export type { Firestore, Auth, FirebaseApp };
