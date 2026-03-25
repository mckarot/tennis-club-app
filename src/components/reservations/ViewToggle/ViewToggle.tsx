import type { ViewMode } from './ViewToggle.types';
import { viewLabels } from './ViewToggle.types';

export interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ viewMode, onChange, className = '' }: ViewToggleProps) {
  return (
    <div
      className={`inline-flex bg-surface-container-highest rounded-lg p-1 ${className}`}
      role="group"
      aria-label="View mode toggle"
    >
      {(['today', 'weekly'] as ViewMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-pressed={viewMode === mode}
          className={`
            px-4 py-2 rounded-md font-body text-body-sm transition-colors duration-200
            ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'text-on-surface hover:bg-surface-container-highest/70'
            }
          `}
        >
          {viewLabels[mode]}
        </button>
      ))}
    </div>
  );
}
