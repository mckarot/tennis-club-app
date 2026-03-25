import { MaintenanceNoteCard } from '../../layout/MaintenanceNoteCard/MaintenanceNoteCard';
import { LocationCard } from '../../layout/LocationCard/LocationCard';

export interface ClubInsightsProps {
  maintenance?: {
    title: string;
    message: string;
    startDate: string;
    endDate: string;
  };
  location?: {
    address: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  className?: string;
}

export function ClubInsights({
  maintenance,
  location,
  className = '',
}: ClubInsightsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {maintenance && (
        <MaintenanceNoteCard
          title={maintenance.title}
          message={maintenance.message}
          startDate={maintenance.startDate}
          endDate={maintenance.endDate}
        />
      )}

      {location && (
        <LocationCard
          address={location.address}
          city={location.city}
          latitude={location.latitude}
          longitude={location.longitude}
        />
      )}
    </div>
  );
}
