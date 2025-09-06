/*
 * Persistence helpers for timetable classes.
 *
 * Data is stored in localStorage under a fixed key. Import/export
 * helpers allow saving and restoring schedules as JSON.
 */

const KEY = 'ttb.classes.v1';

/**
 * Save the array of class entries to localStorage.
 * @param {Array} classes
 */
export function save(classes) {
  try {
    localStorage.setItem(KEY, JSON.stringify(classes));
  } catch (err) {
    console.error('Failed to save schedule', err);
  }
}

/**
 * Load class entries from localStorage.
 * @returns {Array}
 */
export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load schedule', err);
    return [];
  }
}

/**
 * Create a downloadable JSON blob of the given classes.
 * @param {Array} classes
 * @returns {Blob}
 */
export function exportBlob(classes) {
  const json = JSON.stringify(classes, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Read class entries from an imported file input (FileReader).
 * Returns a Promise resolving to the parsed array.
 * @param {File} file
 * @returns {Promise<Array>}
 */
export function importFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const classes = JSON.parse(reader.result);
        if (Array.isArray(classes)) {
          resolve(classes);
        } else {
          reject(new Error('Imported file is not an array'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = err => reject(err);
    reader.readAsText(file);
  });
}