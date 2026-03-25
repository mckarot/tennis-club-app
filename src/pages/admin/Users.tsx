/**
 * Admin Users Page
 *
 * Page for managing users.
 *
 * @module @pages/admin/Users
 */

import React from 'react';

export function Users() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Gestion des utilisateurs</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">people</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page de gestion des utilisateurs en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Users;
