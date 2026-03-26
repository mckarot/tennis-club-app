/**
 * AvatarPicker Component
 *
 * Avatar selection and upload component.
 * Displays current avatar or initials, with file upload functionality.
 *
 * Features:
 * - Display current avatar or initials fallback
 * - File upload with validation (image, < 5MB)
 * - Image preview before upload
 * - Framer Motion hover animations
 * - ARIA labels for accessibility
 *
 * @module @components/client/ClientProfile/AvatarPicker
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AvatarPickerProps {
  /** Current avatar URL */
  avatarUrl?: string;
  /** User name for initials fallback */
  userName: string;
  /** Callback when avatar is selected */
  onAvatarSelect: (file: File) => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Allowed file types
 */
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Image must be less than 5MB',
    };
  }

  return { valid: true };
}

// ==========================================
// COMPONENT
// ==========================================

export function AvatarPicker({
  avatarUrl,
  userName,
  onAvatarSelect,
  loading = false,
  disabled = false,
}: AvatarPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      // Validate file
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setError(null);

      // Notify parent
      onAvatarSelect(file);
    },
    [onAvatarSelect]
  );

  /**
   * Handle button click to trigger file input
   */
  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Clean up preview URL on unmount
   */
  const handleClearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // Display URL (preview or avatarUrl)
  const displayUrl = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4" role="group" aria-label="Avatar">
      {/* Avatar Display */}
      <motion.div
        className="relative h-24 w-24 overflow-hidden rounded-full bg-primary-fixed/20"
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        transition={{ duration: 0.2 }}
        role="img"
        aria-label={`Profile picture of ${userName}`}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={`${userName}'s profile picture`}
            className="h-full w-full object-cover"
            onLoad={handleClearPreview}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-headline text-2xl font-bold text-primary">
              {getInitials(userName)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        {!disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 hover:opacity-100">
            <span className="material-symbols-outlined text-white">photo_camera</span>
          </div>
        )}
      </motion.div>

      {/* Upload Button */}
      {!disabled && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload profile picture"
            disabled={loading}
          />

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-surface-container-highest px-4 py-2 font-body text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest/70 disabled:opacity-50"
            aria-label="Change profile picture"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">photo_camera</span>
                <span>Changer la photo</span>
              </>
            )}
          </button>
        </>
      )}

      {/* Error Message */}
      {error && (
        <p className="font-body text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AvatarPicker;
