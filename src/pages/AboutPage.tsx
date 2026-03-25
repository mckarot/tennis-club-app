/**
 * About Page
 *
 * Information about Tennis Club du François.
 *
 * @module @pages/AboutPage
 */

import React from 'react';

export function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold text-on-surface">À propos</h1>

      <div className="prose max-w-none">
        <p className="font-body text-base text-on-surface-variant">
          Le Tennis Club du François est un club convivial situé au cœur de la Martinique.
          Depuis plus de 20 ans, nous accueillons les passionnés de tennis de tous niveaux.
        </p>

        <h2 className="font-headline text-2xl font-bold text-on-surface">Nos Installations</h2>
        <ul className="list-inside list-disc space-y-2 font-body text-base text-on-surface-variant">
          <li>4 courts en Quick (surface dure)</li>
          <li>2 courts en terre battue</li>
          <li>Vestiaires avec douches</li>
          <li>Club house avec terrasse</li>
          <li>Parking gratuit</li>
        </ul>

        <h2 className="font-headline text-2xl font-bold text-on-surface">Horaires d'Ouverture</h2>
        <p className="font-body text-base text-on-surface-variant">
          Lundi - Dimanche: 7h00 - 22h00
        </p>

        <h2 className="font-headline text-2xl font-bold text-on-surface">Contact</h2>
        <address className="not-italic">
          <p className="font-body text-base text-on-surface-variant">
            Tennis Club du François
            <br />
            Route du Golf
            <br />
            97240 Le François, Martinique
            <br />
            Tél: +596 596 00 00 00
            <br />
            Email: contact@tennis-francois.mq
          </p>
        </address>
      </div>
    </div>
  );
}

export default AboutPage;
