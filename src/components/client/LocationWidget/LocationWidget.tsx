/**
 * LocationWidget Component
 *
 * Displays club location information:
 * - Full address
 * - Phone + email
 * - "Get Directions" button (Google Maps link)
 * Compact format for mobile.
 *
 * @module @components/client/LocationWidget
 */

import type { LocationData } from '../../../types/client-dashboard.types';

interface LocationWidgetProps {
  location: LocationData;
  onGetDirections?: () => void;
}

export function LocationWidget({ location }: LocationWidgetProps) {
  const handleGetDirections = () => {
    window.open(location.mapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      className="rounded-xl bg-surface-container-low p-6"
      aria-label="Informations de localisation"
      role="complementary"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Address & Contact */}
        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              aria-hidden="true"
            >
              location_on
            </span>
            <div>
              <p className="font-headline text-headline-sm font-semibold text-on-surface">
                Adresse
              </p>
              <address className="mt-1 font-body text-body-sm not-italic text-on-surface/80">
                {location.address}
                <br />
                {location.postalCode} {location.city}
              </address>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              aria-hidden="true"
            >
              phone
            </span>
            <div>
              <p className="font-headline text-headline-sm font-semibold text-on-surface">
                Téléphone
              </p>
              <a
                href={`tel:${location.phone}`}
                className="font-body text-body-sm text-on-surface/80 transition-colors hover:text-primary focus:outline-none focus:underline"
              >
                {location.phone}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              aria-hidden="true"
            >
              mail
            </span>
            <div>
              <p className="font-headline text-headline-sm font-semibold text-on-surface">
                Email
              </p>
              <a
                href={`mailto:${location.email}`}
                className="font-body text-body-sm text-on-surface/80 transition-colors hover:text-primary focus:outline-none focus:underline"
              >
                {location.email}
              </a>
            </div>
          </div>
        </div>

        {/* Get Directions Button */}
        <div className="flex items-center sm:self-center">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-3 font-body text-body-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={handleGetDirections}
            aria-label="Obtenir l'itinéraire vers le club"
          >
            <span
              className="material-symbols-outlined text-lg"
              aria-hidden="true"
            >
              directions
            </span>
            Itinéraire
          </button>
        </div>
      </div>
    </section>
  );
}

export default LocationWidget;
