/**
 * Password Strength Meter Component
 *
 * Visual indicator of password strength with:
 * - Animated strength bar
 * - Color-coded feedback (red/yellow/green)
 * - Requirements checklist with checkmarks
 * - Smooth transitions
 *
 * Design System:
 * - Strength bar: bg-error (weak), bg-tertiary (medium), bg-primary (strong)
 * - Checkmarks: text-primary for met, text-on-surface-variant for unmet
 * - Typography: font-body for all text
 *
 * @module @components/ui/PasswordStrengthMeter
 */

import type { PasswordStrengthResult, PasswordRequirements } from '../../../firebase/types';

// ==========================================
// COMPONENT PROPS
// ==========================================

export interface PasswordStrengthMeterProps {
  strength: PasswordStrengthResult;
  meetsRequirements: PasswordRequirements;
  className?: string;
}

// ==========================================
// STRENGTH BAR SEGMENTS
// ==========================================

/**
 * Get number of filled segments based on score
 */
function getFilledSegments(score: number): number {
  return Math.max(1, score); // Always show at least 1 segment if password exists
}

/**
 * Get color class for strength level
 */
function getStrengthColorClass(score: number): string {
  if (score <= 1) return 'bg-error';
  if (score === 2) return 'bg-tertiary';
  return 'bg-primary';
}

// ==========================================
// REQUIREMENT ITEM
// ==========================================

interface RequirementItemProps {
  met: boolean;
  label: string;
}

function RequirementItem({ met, label }: RequirementItemProps) {
  return (
    <li className="flex items-center gap-2 font-body text-xs text-on-surface-variant">
      <span
        className={`material-symbols-outlined text-sm transition-colors duration-200 ${
          met ? 'text-primary' : 'text-on-surface-variant'
        }`}
        aria-hidden="true"
      >
        {met ? 'check_circle' : 'radio_button_unchecked'}
      </span>
      <span className={met ? 'text-on-surface' : ''}>{label}</span>
    </li>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PasswordStrengthMeter({
  strength,
  meetsRequirements,
  className = '',
}: PasswordStrengthMeterProps) {
  const filledSegments = getFilledSegments(strength.score);
  const colorClass = getStrengthColorClass(strength.score);

  return (
    <div className={`space-y-3 ${className}`} role="region" aria-label="Password strength">
      {/* Strength Bar */}
      <div aria-hidden="true">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                segment <= filledSegments ? colorClass : 'bg-surface-container-highest'
              }`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between">
          <span className="font-body text-xs text-on-surface-variant">{strength.label}</span>
        </div>
      </div>

      {/* Requirements Checklist */}
      <ul className="space-y-1" role="list" aria-label="Password requirements">
        <RequirementItem met={meetsRequirements.length} label="At least 8 characters" />
        <RequirementItem met={meetsRequirements.uppercase} label="One uppercase letter" />
        <RequirementItem met={meetsRequirements.lowercase} label="One lowercase letter" />
        <RequirementItem met={meetsRequirements.number} label="One number" />
        <RequirementItem met={meetsRequirements.specialChar} label="One special character" />
      </ul>
    </div>
  );
}

export default PasswordStrengthMeter;
