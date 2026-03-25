/**
 * Landing Page
 *
 * Home page for Tennis Club du François.
 *
 * @module @pages/LandingPage
 */

import React from 'react';

export function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="font-headline text-4xl font-bold text-on-surface">Tennis Club du François</h1>
        <p className="mt-4 font-body text-lg text-on-surface-variant">
          Réservez vos courts et cours de tennis en toute simplicité
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/courts"
            className="rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Voir les courts
          </a>
          <a
            href="/register"
            className="rounded-lg bg-surface-container-high px-6 py-3 font-body text-sm font-medium text-on-surface hover:bg-surface-container-highest focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            S'inscrire
          </a>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-surface-container p-6">
          <span className="material-symbols-outlined text-4xl text-primary">sports_tennis</span>
          <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Courts de Qualité</h2>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            6 courts dont 4 en Quick et 2 en terre battue
          </p>
        </div>
        <div className="rounded-lg bg-surface-container p-6">
          <span className="material-symbols-outlined text-4xl text-primary">group</span>
          <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Cours Collectifs</h2>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            Rejoignez nos groupes de tous niveaux
          </p>
        </div>
        <div className="rounded-lg bg-surface-container p-6">
          <span className="material-symbols-outlined text-4xl text-primary">person</span>
          <h2 className="mt-4 font-headline text-xl font-bold text-on-surface">Cours Particuliers</h2>
          <p className="mt-2 font-body text-sm text-on-surface-variant">
            Progressez avec nos moniteurs diplômés
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
