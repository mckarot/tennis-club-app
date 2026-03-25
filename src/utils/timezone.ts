import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Default timezone for the application
 * Tennis Club du François uses Martinique timezone (AST, UTC-4)
 */
export const TIMEZONE = 'America/Martinique';

/**
 * Convert a date to local Martinique time
 */
export const toLocalTime = (date: Date | string) => {
  return dayjs(date).tz(TIMEZONE);
};

/**
 * Convert a dayjs instance to ISO string
 */
export const toISO = (date: dayjs.Dayjs) => {
  return date.toISOString();
};

/**
 * Get the start of day in Martinique timezone
 */
export const startOfDay = (date: Date) => {
  return dayjs(date).tz(TIMEZONE).startOf('day').toISOString();
};

/**
 * Get the end of day in Martinique timezone
 */
export const endOfDay = (date: Date) => {
  return dayjs(date).tz(TIMEZONE).endOf('day').toISOString();
};

/**
 * Format time for display (HH:mm)
 */
export const formatTime = (date: Date | string) => {
  return toLocalTime(date).format('HH:mm');
};

/**
 * Format date for display (dddd, MMMM D, YYYY)
 */
export const formatDate = (date: Date | string) => {
  return toLocalTime(date).format('dddd, MMMM D, YYYY');
};

/**
 * Format date with time (dddd, MMMM D, YYYY HH:mm)
 */
export const formatDateTime = (date: Date | string) => {
  return toLocalTime(date).format('dddd, MMMM D, YYYY HH:mm');
};

/**
 * Get current time in Martinique timezone
 */
export const now = () => {
  return dayjs().tz(TIMEZONE);
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string) => {
  return toLocalTime(date).isSame(dayjs(), 'day');
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date | string) => {
  return toLocalTime(date).isBefore(dayjs());
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date | string) => {
  return toLocalTime(date).isAfter(dayjs());
};

/**
 * Get timezone display string
 */
export const getTimezoneDisplay = () => {
  return `${TIMEZONE} (AST, UTC-4)`;
};
