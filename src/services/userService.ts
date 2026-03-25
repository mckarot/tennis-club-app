import { auth, db } from '@config/firebase.config';
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User, UserRole } from '../../types/user.types';

const COLLECTION_NAME = 'users';

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
      lastLoginAt: Timestamp.now(),
    };

    await setDoc(doc(db, COLLECTION_NAME, user.uid), userData);

    return {
      success: true,
      user: { uid: user.uid, ...userData } as User,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
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
      status: 'online',
    });

    // Get user data
    const userDoc = await getDoc(doc(db, COLLECTION_NAME, user.uid));

    if (!userDoc.exists()) {
      return { success: false, error: 'User profile not found' };
    }

    return {
      success: true,
      user: { uid: user.uid, ...userDoc.data() } as User,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sign in failed',
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
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

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
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  const q = query(collection(db, COLLECTION_NAME), where('role', '==', role));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));
};
