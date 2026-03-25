/**
 * Not Found Page (404)
 *
 * Displayed when requested page doesn't exist.
 *
 * @module @pages/NotFoundPage
 */

import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant">search_off</span>

      <h1 className="mt-6 font-headline text-6xl font-bold text-on-surface">404</h1>

      <h2 className="mt-2 font-headline text-xl font-bold text-on-surface">Page non trouvée</h2>

      <p className="mt-4 max-w-md font-body text-base text-on-surface-variant">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/"
          className="rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Retour à l'accueil
        </Link>
        <Link
          to="/courts"
          className="rounded-lg bg-surface-container-high px-6 py-3 font-body text-sm font-medium text-on-surface hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Voir les courts
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
