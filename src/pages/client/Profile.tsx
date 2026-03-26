/**
 * Client Profile Page
 *
 * Page for viewing and editing user profile.
 * Integrates all profile components with useClientProfile hook.
 *
 * Features:
 * - Profile information management
 * - Password change functionality
 * - Notification preferences
 * - Real-time profile updates via Firestore listener
 * - Loading and error states
 * - Framer Motion animations
 *
 * @module @pages/client/Profile
 */

import { motion } from 'framer-motion';
import { ProfileSection } from '../../components/client/ClientProfile/ProfileSection';
import { ProfileForm } from '../../components/client/ClientProfile/ProfileForm';
import { NotificationPreferences } from '../../components/client/ClientProfile/NotificationPreferences';
import { PasswordChangeForm } from './components/PasswordChangeForm';
import { useClientProfile } from '../../hooks/useClientProfile';

// ==========================================
// PAGE COMPONENT
// ==========================================

export function Profile() {
  const {
    profile,
    notifications,
    isSaving,
    isChangingPassword,
    error,
    updateProfile,
    changePassword,
    clearError,
  } = useClientProfile();

  /**
   * Handle profile save
   */
  const handleSaveProfile = async (data: {
    name: string;
    phone?: string;
    avatar?: string;
  }) => {
    const result = await updateProfile({
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
    });

    return result;
  };

  /**
   * Handle notification preferences save
   */
  const handleSaveNotifications = async (data: {
    emailNotifications: boolean;
    smsNotifications: boolean;
  }) => {
    const result = await updateProfile({
      emailNotifications: data.emailNotifications,
      smsNotifications: data.smsNotifications,
    });

    return result;
  };

  /**
   * Handle password change
   */
  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    return result;
  };

  return (
    <div className="space-y-6" role="main" aria-label="Profile page">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-headline text-2xl font-bold text-on-surface">Mon profil</h1>
        <p className="mt-1 font-body text-sm text-on-surface/60">
          Gérez vos informations personnelles et vos préférences
        </p>
      </motion.div>

      {/* Global Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-error-container p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-sm font-medium text-error">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="ml-auto text-error hover:text-error/80"
              aria-label="Fermer l'erreur"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Profile Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <ProfileSection title="Informations Personnelles">
          <ProfileForm
            profile={profile}
            onSave={handleSaveProfile}
            loading={isSaving}
          />
        </ProfileSection>

        {/* Security */}
        <ProfileSection title="Sécurité">
          <PasswordChangeForm
            onChangePassword={handleChangePassword}
            loading={isChangingPassword}
          />
        </ProfileSection>

        {/* Notifications */}
        <ProfileSection title="Notifications">
          <NotificationPreferences
            preferences={notifications}
            onSave={handleSaveNotifications}
            loading={isSaving}
          />
        </ProfileSection>
      </div>
    </div>
  );
}

export default Profile;
