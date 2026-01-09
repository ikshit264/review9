import timezoneData from './timezone-data.json';

/**
 * Curated list of world timezones from a professional source.
 * Groups multiple cities into friendly, readable names.
 */

export interface TimezoneInfo {
  value: string; // The primary IANA timezone ID from the curated list
  label: string; // The friendly display text (e.g., "(UTC-05:00) Eastern Time")
  offset: string; // The numeric-style offset for sorting
}

export const getAllTimezones = (): TimezoneInfo[] => {
  // Map the curated JSON data to our TimezoneInfo format
  const curatedTimezones: TimezoneInfo[] = timezoneData.map((tz) => {
    // We pick the first IANA ID in the 'utc' array as our primary value
    // This ensures Intl.DateTimeFormat works correctly
    const ianaValue = tz.value;

    return {
      value: ianaValue,
      label: tz.value, // e.g., "Eastern Standard Time" instead of "(UTC-05:00) Eastern Time..."
      offset: tz.offset.toString()
    };
  });

  // Ensure UTC is always at the top
  const hasUtc = curatedTimezones.some(tz => tz.value === 'UTC');
  let finalTimezones = curatedTimezones;

  if (!hasUtc) {
    finalTimezones.unshift({
      value: 'UTC',
      label: 'UTC',
      offset: '0'
    });
  }

  // Sort by offset primarily
  return finalTimezones.sort((a, b) => {
    if (a.value === 'UTC') return -1;
    if (b.value === 'UTC') return 1;

    // Sort numerically by offset if possible, otherwise alphabetically by label
    const offsetA = parseFloat(a.offset);
    const offsetB = parseFloat(b.offset);

    if (offsetA !== offsetB) {
      return offsetA - offsetB;
    }

    return a.label.localeCompare(b.label);
  });
};

/**
 * Detects the user's timezone using browser APIs and matches it against our curated JSON.
 * No external API calls required.
 */
export const detectUserTimezone = (): { timezone: string; label: string } => {
  try {
    // 1. Get browser timezone
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 2. Find exact match in our JSON 'utc' arrays
    const match = timezoneData.find(tz => tz.utc.includes(browserTz));

    if (match) {
      return {
        timezone: match.value, // Primary IANA ID
        label: match.value
      };
    }

    // 3. Fallback: Try to find any timezone with the same offset
    const now = new Date();
    const browserOffset = -now.getTimezoneOffset(); // minutes

    const offsetMatch = timezoneData.find(tz => tz.offset === browserOffset / 60);

    if (offsetMatch) {
      return {
        timezone: offsetMatch.value,
        label: offsetMatch.value
      };
    }

    // 4. Hard fallback to UTC
    return {
      timezone: 'UTC',
      label: 'UTC'
    };
  } catch (e) {
    return {
      timezone: 'UTC',
      label: 'UTC'
    };
  }
};

/**
 * Maps a descriptive timezone name (like "India Standard Time") 
 * back to its primary IANA ID (like "Asia/Kolkata").
 * Returns the descriptive name itself if no match is found (for UTC).
 */
export const getIanaFromDescriptive = (descriptiveName: string | undefined): string => {
  if (!descriptiveName || descriptiveName === 'UTC') return 'UTC';

  const match = timezoneData.find(tz => tz.value === descriptiveName);
  return match?.utc[0] || descriptiveName;
};
