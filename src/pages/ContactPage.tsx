/**
 * Contact Page
 *
 * Contact form and information.
 *
 * @module @pages/ContactPage
 */

import React from 'react';

export function ContactPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold text-on-surface">Contact</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-lg bg-surface-container p-6">
          <h2 className="font-headline text-xl font-bold text-on-surface">Envoyez-nous un message</h2>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="name" className="block font-body text-sm font-medium text-on-surface">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 w-full rounded-lg border border-outline bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-body text-sm font-medium text-on-surface">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 w-full rounded-lg border border-outline bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block font-body text-sm font-medium text-on-surface">
                Sujet
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="mt-1 w-full rounded-lg border border-outline bg-surface px-4 py-2 font-body text-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="reservation">Réservation</option>
                <option value="cours">Cours de tennis</option>
                <option value="abonnement">Adhésion</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block font-body text-sm font-medium text-on-surface">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="mt-1 w-full rounded-lg border border-outline bg-surface px-4 py-2 font-body text-base text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Votre message..."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-6 py-3 font-body text-sm font-medium text-on-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Envoyer
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className="rounded-lg bg-surface-container p-6">
            <h2 className="font-headline text-xl font-bold text-on-surface">Coordonnées</h2>

            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">location_on</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Adresse</p>
                  <p className="font-body text-sm text-on-surface-variant">
                    Route du Golf, 97240 Le François, Martinique
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">phone</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Téléphone</p>
                  <p className="font-body text-sm text-on-surface-variant">+596 596 00 00 00</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">email</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Email</p>
                  <p className="font-body text-sm text-on-surface-variant">contact@tennis-francois.mq</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Horaires</p>
                  <p className="font-body text-sm text-on-surface-variant">Lun - Dim: 7h00 - 22h00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="aspect-video overflow-hidden rounded-lg bg-surface-container">
            <div className="flex h-full items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">map</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
