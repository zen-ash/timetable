/*
 * Time helpers and conflict detection for the timetable builder.
 *
 * The builder represents time as minutes since the start of the week.
 * Each day has a numeric index (0=Monday, 6=Sunday) and times are
 * stored as "HH:MM" strings. Use these helpers to convert to and
 * from minutes, and to detect overlapping intervals in O(n log n).
 */

// Export constants for days and scheduling boundaries
export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Schedule boundaries in minutes (08:00 to 22:00)
export const DAY_START = 8 * 60;
export const DAY_END   = 22 * 60;

// Time step (15 minutes)
export const SLOT = 15;

/**
 * Convert "HH:MM" string to minutes past midnight.
 * @param {string} hm
 * @returns {number}
 */
export function hmToMin(hm) {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert a day index and "HH:MM" to absolute minutes from the start of the week.
 * @param {number} day 0=Monday ... 6=Sunday
 * @param {string} hm time string
 * @returns {number}
 */
export function absoluteStart(day, hm) {
  return day * 24 * 60 + hmToMin(hm);
}

/**
 * Detect overlapping class intervals.
 * Returns an array of pairs of class IDs that overlap.
 *
 * Approach: convert each class to an interval [s,e) in absolute minutes,
 * sort by start, then sweep; if current start < previous end, report.
 * @param {Array} classes array of class entries with id, day, start, end
 * @returns {Array<[string,string]>}
 */
export function findConflicts(classes) {
  const intervals = classes.map(c => ({
    id: c.id,
    s: absoluteStart(c.day, c.start),
    e: absoluteStart(c.day, c.end)
  }));
  intervals.sort((a, b) => a.s - b.s);
  const conflicts = [];
  let prev = null;
  for (const cur of intervals) {
    if (prev && cur.s < prev.e) {
      conflicts.push([prev.id, cur.id]);
    }
    // keep the interval with later end for subsequent comparisons
    if (!prev || cur.e > prev.e) prev = cur;
  }
  return conflicts;
}