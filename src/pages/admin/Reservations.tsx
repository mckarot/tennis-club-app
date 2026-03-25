/**
 * Admin Reservations Page
 *
 * Page for managing all reservations.
 *
 * @module @pages/admin/Reservations
 */

import React from 'react';

export function Reservations() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Gestion des réservations</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">event</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de gestion des réservations en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Reservations;
