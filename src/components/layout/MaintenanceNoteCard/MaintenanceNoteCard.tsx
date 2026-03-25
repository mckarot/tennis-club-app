import type { ReactNode } from 'react';

export interface MaintenanceNoteCardProps {
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  icon?: string;
  children?: ReactNode;
  className?: string;
}

export function MaintenanceNoteCard({
  title,
  message,
  startDate,
  endDate,
  icon = 'build',
  children,
  className = '',
}: MaintenanceNoteCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-6 overflow-hidden ${className}`}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary-container" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">
              {icon}
            </span>
          </div>
          <div>
            <h3 className="font-headline text-headline-md font-semibold text-white mb-1">
              {title}
            </h3>
            <p className="font-body text-body text-white/90">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-white/80">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span className="font-body text-body-sm">{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">event</span>
            <span className="font-body text-body-sm">{endDate}</span>
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
