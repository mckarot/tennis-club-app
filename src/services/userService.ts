import { auth, db } from '@config/firebase.config';
import {
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
  onSnapshot,
  Timestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User, UserRole, UserUpdateInput, NotificationPreferences, UserInput } from '../../types/user.types';

const COLLECTION_NAME = 'users';

// ==========================================
// TYPE DEFINITIONS FOR ADMIN USER MANAGEMENT
// ==========================================

/**
 * Input for creating a new user (admin only)
 * Includes all required fields for user creation
 */
export interface CreateAdminUserInput {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  status?: UserStatus;
}

/**
 * Input for updating an existing user (admin only)
 * All fields are optional for partial updates
 */
export interface UpdateAdminUserInput {
  uid: string;
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  status?: UserStatus;
  avatar?: string;
  notifications?: NotificationPreferences;
}

/**
 * User filter options for search queries
 */
export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  orderBy?: 'name' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
  limit?: number;
}

/**
 * Service result pattern for type-safe error handling
 */
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

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
 *
 * CLIENT PROFILE: Allows users to update their own profile.
 * Fields that can be updated:
 * - name, phone, avatar, status, notifications
 *
 * CRITICAL: The 'role' field CANNOT be updated through this function.
 * Role changes require admin privileges.
 *
 * @param uid - User ID
 * @param updates - Fields to update (excludes uid, createdAt, role)
 * @returns ServiceResult indicating success or failure
 */
export const updateUserProfile = async (
  uid: string,
  updates: UserUpdateInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Prevent role changes (security measure)
    const { role, ...safeUpdates } = updates as UserUpdateInput & { role?: UserRole };

    await updateDoc(doc(db, COLLECTION_NAME, uid), {
      ...safeUpdates,
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
 * Update notification preferences
 *
 * CLIENT PROFILE: Specialized function for updating notification settings.
 * Users can control email and SMS notifications independently.
 *
 * @param uid - User ID
 * @param notifications - Notification preferences (email, sms)
 * @returns ServiceResult indicating success or failure
 */
export const updateNotificationPreferences = async (
  uid: string,
  notifications: NotificationPreferences
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, uid), {
      notifications,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed',
    };
  }
};

/**
 * Subscribe to user profile changes (real-time)
 *
 * CLIENT PROFILE: Real-time listener for profile updates.
 * Useful for syncing profile data across multiple tabs/devices.
 *
 * IMPORTANT: Always call the returned unsubscribe function to prevent memory leaks.
 *
 * @param uid - User ID
 * @param callback - Function called with updated user data or null if not found
 * @returns Unsubscribe function (must be called to clean up)
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToUserProfile(uid, (user) => {
 *   if (user) {
 *     setProfile(user);
 *   }
 * });
 *
 * // Cleanup on unmount
 * return () => unsubscribe();
 * ```
 */
export const subscribeToUserProfile = (
  uid: string,
  callback: (user: User | null) => void
): (() => void) => {
  const userRef = doc(db, COLLECTION_NAME, uid);

  const unsubscribe = onSnapshot(
    userRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({ uid: docSnapshot.id, ...docSnapshot.data() } as User);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to user profile:', error);
      callback(null);
    }
  );

  return unsubscribe;
};

/**
 * Get all users
 *
 * ADMIN DASHBOARD: Retrieves all users from Firestore.
 * For large collections, use searchUsers() with filters instead.
 *
 * @returns Array of all users
 *
 * @example
 * ```typescript
 * const users = await getAllUsers();
 * console.log(`Total users: ${users.length}`);
 * ```
 */
export const getAllUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));
};

/**
 * Get all users with optional filters and sorting
 *
 * ADMIN DASHBOARD: Enhanced version with filtering, sorting, and pagination.
 * Uses composite indexes for efficient queries.
 *
 * @param filters - Optional filter options (role, status, orderBy, order, limit)
 * @returns Array of users matching filters
 *
 * @example
 * ```typescript
 * // Get all admins sorted by name
 * const admins = await getAllUsersWithFilters({ role: 'admin', orderBy: 'name' });
 *
 * // Get online users sorted by email, limit 10
 * const onlineUsers = await getAllUsersWithFilters({
 *   status: 'online',
 *   orderBy: 'email',
 *   limit: 10
 * });
 *
 * // Get users sorted by creation date (newest first)
 * const recentUsers = await getAllUsersWithFilters({ orderBy: 'createdAt', order: 'desc' });
 * ```
 */
export const getAllUsersWithFilters = async (filters?: UserFilter): Promise<User[]> => {
  const constraints: QueryConstraint[] = [];

  // Apply role filter
  if (filters?.role) {
    constraints.push(where('role', '==', filters.role));
  }

  // Apply status filter
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }

  // Apply ordering (default to name ascending)
  const orderByField = filters?.orderBy || 'name';
  const orderDirection = filters?.order || 'asc';
  constraints.push(orderBy(orderByField, orderDirection));

  // Apply limit if specified
  if (filters?.limit) {
    constraints.push(limit(filters.limit));
  }

  const q = query(collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));
};

/**
 * Get user by UID
 *
 * ADMIN DASHBOARD: Retrieves a single user by their Firebase UID.
 * Returns null if user does not exist.
 *
 * @param uid - Firebase Auth UID of the user
 * @returns User object or null if not found
 *
 * @example
 * ```typescript
 * const user = await getUserById('admin_001');
 * if (user) {
 *   console.log(`Found user: ${user.name} (${user.role})`);
 * }
 * ```
 */
export const getUserById = async (uid: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, COLLECTION_NAME, uid));
  return userDoc.exists() ? { uid: userDoc.id, ...userDoc.data() } as User : null;
};

/**
 * Create a new user (admin only)
 *
 * ADMIN DASHBOARD: Creates a new user with Firebase Auth account and Firestore profile.
 * This function requires admin privileges (enforced by security rules).
 *
 * @param input - User creation data (email, password, name, role, optional phone/status)
 * @returns ServiceResult with created user or error
 *
 * @example
 * ```typescript
 * const result = await createUser({
 *   email: 'new.user@tennis.mq',
 *   password: 'SecurePass123!',
 *   name: 'Nouvel Utilisateur',
 *   role: 'client',
 *   phone: '+596 696 00 00 00',
 *   status: 'online'
 * });
 *
 * if (result.success) {
 *   console.log('User created:', result.data?.user.email);
 * } else {
 *   console.error('Creation failed:', result.error);
 * }
 * ```
 */
export const createUser = async (
  input: CreateAdminUserInput
): Promise<ServiceResult<{ user: User }>> => {
  try {
    // Validate required fields
    if (!input.email || !input.password || !input.name || !input.role) {
      return {
        success: false,
        error: 'Missing required fields: email, password, name, role',
      };
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'moniteur', 'client'];
    if (!validRoles.includes(input.role)) {
      return {
        success: false,
        error: `Invalid role: ${input.role}. Must be one of: ${validRoles.join(', ')}`,
      };
    }

    // Validate status if provided
    if (input.status) {
      const validStatuses: UserStatus[] = ['online', 'away', 'inactive'];
      if (!validStatuses.includes(input.status)) {
        return {
          success: false,
          error: `Invalid status: ${input.status}. Must be one of: ${validStatuses.join(', ')}`,
        };
      }
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(input.email);
    if (existingUser) {
      return {
        success: false,
        error: `Email already exists: ${input.email}`,
      };
    }

    // Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    const user = userCredential.user;

    // Update auth profile
    await updateProfile(user, { displayName: input.name });

    // Create Firestore user document
    const userData: Omit<User, 'uid'> = {
      name: input.name,
      email: input.email,
      role: input.role,
      phone: input.phone,
      status: input.status || 'online',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: null,
    };

    await setDoc(doc(db, COLLECTION_NAME, user.uid), userData);

    return {
      success: true,
      data: { user: { uid: user.uid, ...userData } as User },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error creating user';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Update an existing user (admin only)
 *
 * ADMIN DASHBOARD: Updates user profile with partial data.
 * Admin can modify ANY field including role (unlike user self-update).
 *
 * @param input - Update data (uid required, other fields optional)
 * @returns ServiceResult indicating success or failure
 *
 * @example
 * ```typescript
 * // Promote user to admin
 * const result = await updateUser({
 *   uid: 'client_001',
 *   role: 'admin',
 *   status: 'online'
 * });
 *
 * // Update contact info only
 * const result = await updateUser({
 *   uid: 'moniteur_001',
 *   phone: '+596 696 99 99 99',
 *   name: 'Jean Philippe Updated'
 * });
 * ```
 */
export const updateUser = async (
  input: UpdateAdminUserInput
): Promise<ServiceResult<void>> => {
  try {
    if (!input.uid) {
      return {
        success: false,
        error: 'User UID is required',
      };
    }

    // Check if user exists
    const existingUser = await getUserById(input.uid);
    if (!existingUser) {
      return {
        success: false,
        error: `User not found: ${input.uid}`,
      };
    }

    // Build update object with only provided fields
    const updates: Partial<User> = {
      updatedAt: Timestamp.now(),
    };

    if (input.name !== undefined) updates.name = input.name;
    if (input.email !== undefined) updates.email = input.email;
    if (input.role !== undefined) updates.role = input.role;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.status !== undefined) updates.status = input.status;
    if (input.avatar !== undefined) updates.avatar = input.avatar;
    if (input.notifications !== undefined) updates.notifications = input.notifications;

    // Validate role if being updated
    if (input.role) {
      const validRoles: UserRole[] = ['admin', 'moniteur', 'client'];
      if (!validRoles.includes(input.role)) {
        return {
          success: false,
          error: `Invalid role: ${input.role}. Must be one of: ${validRoles.join(', ')}`,
        };
      }
    }

    // Validate status if being updated
    if (input.status) {
      const validStatuses: UserStatus[] = ['online', 'away', 'inactive'];
      if (!validStatuses.includes(input.status)) {
        return {
          success: false,
          error: `Invalid status: ${input.status}. Must be one of: ${validStatuses.join(', ')}`,
        };
      }
    }

    await updateDoc(doc(db, COLLECTION_NAME, input.uid), updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error updating user';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Delete a user (admin only)
 *
 * ADMIN DASHBOARD: Permanently removes a user from Firestore.
 * Note: This does NOT delete the Firebase Auth account (requires Admin SDK).
 *
 * @param uid - Firebase Auth UID of the user to delete
 * @returns ServiceResult indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await deleteUser('client_001');
 * if (result.success) {
 *   console.log('User deleted successfully');
 * } else {
 *   console.error('Deletion failed:', result.error);
 * }
 * ```
 */
export const deleteUser = async (uid: string): Promise<ServiceResult<void>> => {
  try {
    if (!uid) {
      return {
        success: false,
        error: 'User UID is required',
      };
    }

    // Check if user exists
    const existingUser = await getUserById(uid);
    if (!existingUser) {
      return {
        success: false,
        error: `User not found: ${uid}`,
      };
    }

    await deleteDoc(doc(db, COLLECTION_NAME, uid));

    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error deleting user';
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Search users with query string and filters
 *
 * ADMIN DASHBOARD: Combines text search with role/status filters.
 * Text search is performed client-side on name and email fields.
 *
 * @param queryString - Optional text to search in name/email
 * @param filters - Optional filter options (role, status)
 * @returns Array of users matching search and filters
 *
 * @example
 * ```typescript
 * // Search for "Jean" among all users
 * const results = await searchUsers('Jean');
 *
 * // Search for "martin" among clients only
 * const clients = await searchUsers('martin', { role: 'client' });
 *
 * // Get all inactive users
 * const inactive = await searchUsers('', { status: 'inactive' });
 *
 * // Get all moniteurs sorted by name
 * const moniteurs = await searchUsers('', { role: 'moniteur', orderBy: 'name' });
 * ```
 */
export const searchUsers = async (
  queryString: string = '',
  filters?: UserFilter
): Promise<User[]> => {
  // Build query with filters (uses indexes)
  const users = await getAllUsersWithFilters(filters);

  // If no search query, return filtered results
  if (!queryString.trim()) {
    return users;
  }

  // Client-side text search on name and email
  const searchLower = queryString.toLowerCase();
  return users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
  );
};

/**
 * Subscribe to all users (real-time)
 *
 * ADMIN DASHBOARD: Real-time listener for user directory.
 * Useful for live user list updates in admin dashboard.
 *
 * IMPORTANT: Always call the returned unsubscribe function to prevent memory leaks.
 *
 * @param callback - Function called with array of all users
 * @returns Unsubscribe function (must be called to clean up)
 *
 * @example
 * ```typescript
 * const unsubscribe = subscribeToAllUsers((users) => {
 *   setUserList(users);
 *   console.log(`Total users: ${users.length}`);
 * });
 *
 * // Cleanup on unmount
 * return () => unsubscribe();
 * ```
 */
export const subscribeToAllUsers = (
  callback: (users: User[]) => void
): (() => void) => {
  const usersRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(
    usersRef,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));
      callback(users);
    },
    (error) => {
      console.error('Error subscribing to all users:', error);
      callback([]);
    }
  );

  return unsubscribe;
};
