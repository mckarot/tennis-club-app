/**
 * Client Reservations Page
 *
 * Page for viewing and managing user reservations.
 *
 * @module @pages/client/Reservations
 */

import React from 'react';

export function Reservations() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Mes réservations</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">event_busy</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">Aucune réservation</p>
      </div>
    </div>
  );
}

export default Reservations;
