/**
 * Admin Dashboard
 *
 * Main dashboard for admin users.
 *
 * @module @pages/admin/Dashboard
 */

import React from 'react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Tableau de bord</h1>

      {/* Welcome Card */}
      <div className="rounded-lg bg-tertiary-container p-6">
        <h2 className="font-headline text-xl font-bold text-on-tertiary-container">
          Bienvenue sur votre espace administrateur
        </h2>
        <p className="mt-2 font-body text-base text-on-tertiary-container">
          Gérez les utilisateurs, courts, réservations et paramètres du club.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-on-surface-variant">Utilisateurs</p>
              <p className="mt-1 font-headline text-3xl font-bold text-on-surface">0</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">people</span>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-on-surface-variant">Courts</p>
              <p className="mt-1 font-headline text-3xl font-bold text-on-surface">6</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">sports_tennis</span>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-on-surface-variant">Réservations</p>
              <p className="mt-1 font-headline text-3xl font-bold text-on-surface">0</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">event</span>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-on-surface-variant">Créneaux</p>
              <p className="mt-1 font-headline text-3xl font-bold text-on-surface">0</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-primary">schedule</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/users"
          className="flex items-center gap-4 rounded-lg bg-surface-container p-4 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-3xl text-primary">people</span>
          <div>
            <p className="font-body text-sm font-medium text-on-surface">Gérer les utilisateurs</p>
            <p className="font-body text-xs text-on-surface-variant">Admins, moniteurs, clients</p>
          </div>
        </a>

        <a
          href="/admin/courts"
          className="flex items-center gap-4 rounded-lg bg-surface-container p-4 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-3xl text-primary">sports_tennis</span>
          <div>
            <p className="font-body text-sm font-medium text-on-surface">Gérer les courts</p>
            <p className="font-body text-xs text-on-surface-variant">Ajouter, modifier, maintenir</p>
          </div>
        </a>

        <a
          href="/admin/reservations"
          className="flex items-center gap-4 rounded-lg bg-surface-container p-4 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-3xl text-primary">event</span>
          <div>
            <p className="font-body text-sm font-medium text-on-surface">Réservations</p>
            <p className="font-body text-xs text-on-surface-variant">Consulter et gérer</p>
          </div>
        </a>

        <a
          href="/admin/slots"
          className="flex items-center gap-4 rounded-lg bg-surface-container p-4 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-3xl text-primary">schedule</span>
          <div>
            <p className="font-body text-sm font-medium text-on-surface">Créneaux moniteurs</p>
            <p className="font-body text-xs text-on-surface-variant">Disponibilités et cours</p>
          </div>
        </a>

        <a
          href="/admin/settings"
          className="flex items-center gap-4 rounded-lg bg-surface-container p-4 transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="material-symbols-outlined text-3xl text-primary">settings</span>
          <div>
            <p className="font-body text-sm font-medium text-on-surface">Paramètres</p>
            <p className="font-body text-xs text-on-surface-variant">Configuration du club</p>
          </div>
        </a>
      </div>
    </div>
  );
}

export default Dashboard;
