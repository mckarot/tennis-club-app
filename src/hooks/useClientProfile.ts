/**
 * Client Profile Hook
 *
 * Provides profile management functionality for client users.
 * Handles profile updates, password changes, and notification preferences.
 *
 * Features:
 * - Profile data loading and updates
 * - Password change with re-authentication
 * - Notification preferences management
 * - Avatar upload handling
 * - Error handling with try/catch
 *
 * @module @hooks/useClientProfile
 */

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getDbInstance, getAuthInstance } from '../config/firebase.config';
import { useAuth } from './useAuth';
import type {
  ClientProfile,
  ClientProfileInput,
  PasswordChangeInput,
  ProfileSaveResult,
  PasswordChangeResult,
  NotificationPreferences,
  FirebaseAuthErrorCode,
} from '../firebase/types';

// ==========================================
// HOOK RETURN TYPE
// ==========================================

export interface UseClientProfileReturn {
  // State
  profile: ClientProfile | null;
  notifications: NotificationPreferences;
  isSaving: boolean;
  isChangingPassword: boolean;
  error: string | null;
  errorCode: FirebaseAuthErrorCode | null;

  // Actions
  updateProfile: (input: ClientProfileInput) => Promise<ProfileSaveResult>;
  changePassword: (input: PasswordChangeInput) => Promise<PasswordChangeResult>;
  clearError: () => void;
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Default notification preferences
 */
const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: false,
};

// ==========================================
// HOOK IMPLEMENTATION
// ==========================================

export function useClientProfile(): UseClientProfileReturn {
  const { user } = useAuth();
  const auth = getAuthInstance();
  const db = getDbInstance();

  // State
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<FirebaseAuthErrorCode | null>(null);

  /**
   * Load profile data from Firestore
   */
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const loadedProfile: ClientProfile = {
          id: userDoc.id,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone,
          avatar: data.avatar,
          status: data.status || 'online',
          notifications: {
            emailNotifications: data.emailNotifications ?? true,
            smsNotifications: data.smsNotifications ?? false,
          },
          createdAt: data.createdAt || Timestamp.now(),
          updatedAt: data.updatedAt || Timestamp.now(),
        };

        setProfile(loadedProfile);
        setNotifications(loadedProfile.notifications);
      } else {
        console.error('[useClientProfile] User document not found');
        setError('Profile not found');
      }
    } catch (err) {
      console.error('[useClientProfile] Error loading profile:', err);
      setError('Failed to load profile');
    }
  }, [user?.id, db]);

  /**
   * Update user profile in Firestore
   */
  const updateProfile = useCallback(
    async (input: ClientProfileInput): Promise<ProfileSaveResult> => {
      if (!user?.id) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      setIsSaving(true);
      setError(null);
      setErrorCode(null);

      try {
        const userDocRef = doc(db, 'users', user.id);

        // Build update data
        const updateData: Record<string, unknown> = {
          updatedAt: Timestamp.now(),
        };

        if (input.name !== undefined) {
          updateData.name = input.name;
        }

        if (input.phone !== undefined) {
          updateData.phone = input.phone;
        }

        if (input.avatar !== undefined) {
          updateData.avatar = input.avatar;
        }

        if (input.emailNotifications !== undefined) {
          updateData.emailNotifications = input.emailNotifications;
        }

        if (input.smsNotifications !== undefined) {
          updateData.smsNotifications = input.smsNotifications;
        }

        // Update Firestore
        await updateDoc(userDocRef, updateData);

        // Update local state
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            name: input.name ?? prev.name,
            phone: input.phone ?? prev.phone,
            avatar: input.avatar ?? prev.avatar,
            updatedAt: Timestamp.now(),
            notifications: {
              emailNotifications: input.emailNotifications ?? prev.notifications.emailNotifications,
              smsNotifications: input.smsNotifications ?? prev.notifications.smsNotifications,
            },
          };
        });

        setNotifications((prev) => ({
          emailNotifications: input.emailNotifications ?? prev.emailNotifications,
          smsNotifications: input.smsNotifications ?? prev.smsNotifications,
        }));

        setIsSaving(false);

        return {
          success: true,
        };
      } catch (err) {
        console.error('[useClientProfile] Error updating profile:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        setIsSaving(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [user?.id, db]
  );

  /**
   * Change user password with re-authentication
   */
  const changePassword = useCallback(
    async (input: PasswordChangeInput): Promise<PasswordChangeResult> => {
      if (!user?.id) {
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      // Validate passwords match
      if (input.newPassword !== input.confirmPassword) {
        return {
          success: false,
          error: 'New passwords do not match',
        };
      }

      // Validate password strength
      if (input.newPassword.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters',
        };
      }

      setIsChangingPassword(true);
      setError(null);
      setErrorCode(null);

      try {
        // Get current Firebase user
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
          throw new Error('Unable to get current user credentials');
        }

        // Re-authenticate user
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          input.currentPassword
        );

        await reauthenticateWithCredential(currentUser, credential);

        // Update password
        await updatePassword(currentUser, input.newPassword);

        setIsChangingPassword(false);

        return {
          success: true,
        };
      } catch (err) {
        console.error('[useClientProfile] Error changing password:', err);

        // Classify Firebase error
        const firebaseError = err as { code?: string; message?: string };
        const code = (firebaseError?.code as FirebaseAuthErrorCode | undefined) ?? undefined;
        const message = firebaseError?.message || 'Failed to change password';

        setError(message);
        if (code) {
          setErrorCode(code);
        }
        setIsChangingPassword(false);

        return {
          success: false,
          error: message,
          errorCode: code,
        };
      }
    },
    [auth]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorCode(null);
  }, []);

  /**
   * Set up real-time profile listener
   */
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let unsubscribe: Unsubscribe | null = null;

    const setupProfileListener = async () => {
      try {
        const userDocRef = doc(db, 'users', user.id);

        unsubscribe = onSnapshot(
          userDocRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              const loadedProfile: ClientProfile = {
                id: docSnapshot.id,
                name: data.name || '',
                email: data.email || '',
                phone: data.phone,
                avatar: data.avatar,
                status: data.status || 'online',
                notifications: {
                  emailNotifications: data.emailNotifications ?? true,
                  smsNotifications: data.smsNotifications ?? false,
                },
                createdAt: data.createdAt || Timestamp.now(),
                updatedAt: data.updatedAt || Timestamp.now(),
              };

              setProfile(loadedProfile);
              setNotifications(loadedProfile.notifications);
            }
          },
          (err) => {
            console.error('[useClientProfile] Snapshot error:', err);
            setError('Failed to load profile');
          }
        );
      } catch (err) {
        console.error('[useClientProfile] Error setting up listener:', err);
      }
    };

    setupProfileListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, db]);

  return {
    // State
    profile,
    notifications,
    isSaving,
    isChangingPassword,
    error,
    errorCode,

    // Actions
    updateProfile,
    changePassword,
    clearError,
  };
}

export default useClientProfile;
