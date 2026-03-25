/**
 * Client Bookings Page
 *
 * Page for browsing and booking courts.
 *
 * @module @pages/client/Bookings
 */

import React from 'react';

export function Bookings() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Réserver un court</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">construction</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de réservation en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Bookings;
