/**
 * Courts Page
 *
 * Public page displaying available courts.
 *
 * @module @pages/CourtsPage
 */

import React from 'react';

export function CourtsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold text-on-surface">Nos Courts</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <div key={num} className="overflow-hidden rounded-lg bg-surface-container shadow-md">
            <div className="aspect-video bg-surface-container-high" />
            <div className="p-4">
              <h2 className="font-headline text-lg font-bold text-on-surface">Court {num}</h2>
              <p className="mt-1 font-body text-sm text-on-surface-variant">
                {num <= 4 ? 'Quick - Surface dure' : 'Terre battue'}
              </p>
              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-primary-container px-3 py-1 font-body text-xs font-medium text-on-primary-container">
                  {num <= 4 ? 'Quick' : 'Terre'}
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 font-body text-xs font-medium text-on-secondary-container">
                  Actif
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourtsPage;
