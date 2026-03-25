/**
 * Moniteur Students Page
 *
 * Page for viewing moniteur's students.
 *
 * @module @pages/moniteur/Students
 */

import React from 'react';

export function Students() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold text-on-surface">Mes élèves</h1>

      <div className="rounded-lg bg-surface-container p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">groups</span>
        <p className="mt-4 font-body text-base text-on-surface-variant">Aucun élève</p>
      </div>
    </div>
  );
}

export default Students;
