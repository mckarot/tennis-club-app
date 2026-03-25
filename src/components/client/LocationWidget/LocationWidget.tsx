/**
 * LocationWidget Component
 * 
 * Map + address widget with contact information
 * Displays club location, phone, email, and directions button
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { LocationWidgetProps } from '../../../types/client-dashboard.types';

export function LocationWidget({
  location,
  onGetDirections,
}: LocationWidgetProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const widgetVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.aside
      initial="hidden"
      animate="visible"
      variants={widgetVariants}
      className="bg-surface-container-lowest rounded-xl p-6 shadow-sm"
      role="complementary"
      aria-label="Informations de localisation"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">
          location_on
        </span>
        <h2 className="font-headline text-headline-sm font-semibold text-on-surface">
          Nous trouver
        </h2>
      </div>

      {/* Map Preview */}
      <div
        className="w-full h-40 rounded-lg bg-surface-container-low mb-4 overflow-hidden relative"
        role="img"
        aria-label="Carte de localisation du club"
      >
        {/* Static map placeholder - in production, use Google Maps Embed or similar */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: apiKey
              ? `url('https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location.address + ', ' + location.city)}&zoom=14&size=400x200&key=${apiKey}')`
              : undefined,
          }}
          aria-hidden="true"
        />
        
        {/* Fallback gradient if map fails to load */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-secondary-fixed/20" />
        
        {/* Map Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-fixed/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">
              location_on
            </span>
          </div>
        </div>
      </div>

      {/* Address */}
      <address className="not-italic mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant mt-0.5">
            home
          </span>
          <p className="font-body text-body-md text-on-surface">
            {location.address}
            <br />
            {location.postalCode} {location.city}
          </p>
        </div>
      </address>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            phone
          </span>
          <a
            href={`tel:${location.phone}`}
            className="font-body text-body-sm text-primary hover:text-primary-container transition-colors"
            aria-label={`Appeler le ${location.phone}`}
          >
            {location.phone}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">
            mail
          </span>
          <a
            href={`mailto:${location.email}`}
            className="font-body text-body-sm text-primary hover:text-primary-container transition-colors"
            aria-label={`Envoyer un email à ${location.email}`}
          >
            {location.email}
          </a>
        </div>
      </div>

      {/* Directions Button */}
      <button
        onClick={onGetDirections}
        type="button"
        aria-label="Obtenir les directions"
        className="
          w-full inline-flex items-center justify-center gap-2
          bg-primary-container hover:bg-primary
          text-on-primary-container hover:text-on-primary
          font-headline text-body-sm font-semibold
          px-4 py-3 rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-fixed
        "
      >
        <span className="material-symbols-outlined">directions</span>
        Obtenir les directions
      </button>
    </motion.aside>
  );
}
