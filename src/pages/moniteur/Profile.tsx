/**
 * Moniteur Profile Page
 *
 * Page for viewing and editing moniteur profile.
 *
 * @module @pages/moniteur/Profile
 */

import React from 'react';

export function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Mon profil</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de profil en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Profile;
