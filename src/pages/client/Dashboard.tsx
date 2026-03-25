/**
 * Client Dashboard
 *
 * Main dashboard for client users.
 *
 * @module @pages/client/Dashboard
 */

import React from 'react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Tableau de bord</h1>

      {/* Welcome Card */}
      <div className="rounded-lg bg-primary-container p-6">
        <h2 className="font-headline text-xl font-bold text-on-primary-container">
          Bienvenue sur votre espace client
        </h2>
        <p className="mt-2 font-body text-base text-on-primary-container">
          Réservez vos courts et consultez vos réservations en toute simplicité.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href="/client/courts"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">sports_tennis</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Réserver un court</span>
        </a>

        <a
          href="/client/slots"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">calendar_month</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Réserver un cours</span>
        </a>

        <a
          href="/client/reservations"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">event</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Mes réservations</span>
        </a>

        <a
          href="/client/profile"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Mon profil</span>
        </a>
      </div>

      {/* Upcoming Reservations */}
      <div className="rounded-lg bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface">Prochaines réservations</h3>
        <div className="mt-4 flex items-center justify-center py-12">
          <p className="font-body text-sm text-on-surface-variant">Aucune réservation à venir</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
