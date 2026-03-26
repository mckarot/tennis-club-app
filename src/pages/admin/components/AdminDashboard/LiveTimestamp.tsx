/**
 * LiveTimestamp Component
 *
 * Displays live updates timestamp in America/Martinique timezone.
 * Updates every minute to show current time.
 *
 * Features:
 * - America/Martinique timezone display
 * - Format: "LIVE UPDATES: AMERICA/MARTINIQUE • HH:MM AM/PM"
 * - Clock icon in secondary color (#9d431b)
 * - Updates every minute
 * - ARIA live region for accessibility
 *
 * @module @components/admin/LiveTimestamp
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Format time in America/Martinique timezone
 */
function formatMartiniqueTime(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Martinique',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (err) {
    // Fallback if timezone not supported
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

/**
 * LiveTimestamp component props
 */
export interface LiveTimestampProps {
  /** Custom label (default: "LIVE UPDATES") */
  label?: string;
  /** Show timezone (default: true) */
  showTimezone?: boolean;
  /** Show seconds (default: false) */
  showSeconds?: boolean;
}

/**
 * LiveTimestamp component
 */
export function LiveTimestamp({
  label = 'LIVE UPDATES',
  showTimezone = true,
  showSeconds = false,
}: LiveTimestampProps): JSX.Element {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update immediately
    setCurrentTime(new Date());

    // Update every second for smooth display
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const timeString = formatMartiniqueTime(currentTime);
  const timezoneString = showTimezone ? 'America/Martinique' : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2"
      role="status"
      aria-live="polite"
      aria-label="Live updates timestamp"
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 58,
        }}
        className="material-symbols-outlined text-xl text-secondary"
        aria-hidden="true"
      >
        schedule
      </motion.span>

      <span className="font-body text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>

      {showTimezone && (
        <>
          <span className="text-on-surface-variant" aria-hidden="true">
            •
          </span>
          <span className="font-body text-xs font-medium text-on-surface-variant">
            {timezoneString}
          </span>
        </>
      )}

      <span className="font-body text-sm font-bold text-secondary">
        {timeString}
        {showSeconds && (
          <span className="text-xs font-normal text-on-surface-variant">
            :{currentTime.getSeconds().toString().padStart(2, '0')}
          </span>
        )}
      </span>
    </motion.div>
  );
}

export default LiveTimestamp;
