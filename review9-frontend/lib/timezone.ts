import { formatInTimeZone, toDate } from 'date-fns-tz';
import { format } from 'date-fns';

/**
 * Detect the user's IANA timezone.
 */
export const getUserTimezone = (): string => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

/**
 * Convert a UTC ISO string to a formatted date in the user's local timezone.
 */
export const formatUTCtoLocal = (utcDate: string | Date, formatStr: string = 'PPpp'): string => {
    const timezone = getUserTimezone();
    return formatInTimeZone(utcDate, timezone, formatStr);
};

/**
 * Convert a local date value to a UTC ISO string for backend storage.
 */
export const localToUTC = (localDate: Date | string): string => {
    return new Date(localDate).toISOString();
};

/**
 * Format a duration (e.g., for interview length display)
 */
export const formatDuration = (minutes: number): string => {
    if (minutes === 0) return 'Unlimited';
    return `${minutes} mins`;
};

/**
 * Get a display-friendly label for the current timezone.
 */
export const getTimezoneLabel = (): string => {
    const tz = getUserTimezone();
    const offset = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
    }).formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value;

    return `${tz} (${offset})`;
};
