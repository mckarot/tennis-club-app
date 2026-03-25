export interface LocationCardProps {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

export function LocationCard({
  address,
  city,
  latitude = 14.6166,
  longitude = -60.9667,
  className = '',
}: LocationCardProps) {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div className={`bg-surface-container-lowest rounded-2xl overflow-hidden ${className}`}>
      <div className="p-6 border-b border-surface-container-highest">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
          <div>
            <h3 className="font-headline text-headline-md font-semibold mb-1">
              Nous trouver
            </h3>
            <p className="font-body text-body text-on-surface/80">
              {address}
            </p>
            <p className="font-body text-body text-on-surface/60">
              {city}
            </p>
          </div>
        </div>
      </div>

      {/* Embedded map */}
      <iframe
        src={mapUrl}
        title="Club location map"
        className="w-full h-64 border-0"
        loading="lazy"
        aria-label="Map showing club location"
      />
    </div>
  );
}
