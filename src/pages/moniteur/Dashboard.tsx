/**
 * Moniteur Dashboard
 *
 * Main dashboard for moniteur users.
 *
 * @module @pages/moniteur/Dashboard
 */

import React from 'react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Tableau de bord</h1>

      {/* Welcome Card */}
      <div className="rounded-lg bg-secondary-container p-6">
        <h2 className="font-headline text-xl font-bold text-on-secondary-container">
          Bienvenue sur votre espace moniteur
        </h2>
        <p className="mt-2 font-body text-base text-on-secondary-container">
          Gérez vos créneaux et consultez vos cours.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href="/moniteur/slots"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">add_circle</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Créer un créneau</span>
        </a>

        <a
          href="/moniteur/schedule"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">calendar_view_week</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Mon emploi du temps</span>
        </a>

        <a
          href="/moniteur/students"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">groups</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Mes élèves</span>
        </a>

        <a
          href="/moniteur/profile"
          className="flex flex-col items-center justify-center rounded-lg bg-surface-container p-6 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
          <span className="mt-3 font-body text-sm font-medium text-on-surface">Mon profil</span>
        </a>
      </div>

      {/* Upcoming Lessons */}
      <div className="rounded-lg bg-surface-container p-6">
        <h3 className="font-headline text-lg font-bold text-on-surface">Cours à venir</h3>
        <div className="mt-4 flex items-center justify-center py-12">
          <p className="font-body text-sm text-on-surface-variant">Aucun cours prévu</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
