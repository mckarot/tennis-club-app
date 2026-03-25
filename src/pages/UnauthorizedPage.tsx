/**
 * Unauthorized Page
 *
 * Displayed when user doesn't have permission to access a resource.
 *
 * @module @pages/UnauthorizedPage
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-6xl text-warning">lock</span>

      <h1 className="mt-6 font-headline text-2xl font-bold text-on-surface">Accès non autorisé</h1>

      <p className="mt-4 max-w-md font-body text-base text-on-surface-variant">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        Veuillez vous connecter avec un compte disposant des droits appropriés.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Retour à l'accueil
        </Link>
        <Link
          to="/login"
          className="rounded-lg bg-surface-container-high px-6 py-3 font-body text-sm font-medium text-on-surface hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
