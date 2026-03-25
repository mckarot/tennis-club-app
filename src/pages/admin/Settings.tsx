/**
 * Admin Settings Page
 *
 * Page for club settings configuration.
 *
 * @module @pages/admin/Settings
 */

import React from 'react';

export function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Paramètres</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">settings</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de paramètres en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Settings;
