/**
 * Admin Courts Page
 *
 * Page for managing courts.
 *
 * @module @pages/admin/Courts
 */

import React from 'react';

export function Courts() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Gestion des courts</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">sports_tennis</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de gestion des courts en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Courts;
