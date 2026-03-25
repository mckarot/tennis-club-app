/**
 * Moniteur Schedule Page
 *
 * Page for viewing moniteur's schedule.
 *
 * @module @pages/moniteur/Schedule
 */

import React from 'react';

export function Schedule() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Mon emploi du temps</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">calendar_today</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">
          Page d'emploi du temps en cours de développement
        </p>
      </div>
    </div>
  );
}

export default Schedule;
