/*
 * Entry point for the timetable builder. Orchestrates grid rendering,
 * modal interactions, persistence, and accessibility announcements.
 */

import { initGrid, renderClasses } from './grid.js';
import { findConflicts } from './conflict.js';
import { save, load, exportBlob, importFile } from './storage.js';
import { initModal, openModal } from './modal.js';

const gridEl   = document.getElementById('grid');
const addBtn   = document.getElementById('addBtn');
const importBtn= document.getElementById('importBtn');
const exportBtn= document.getElementById('exportBtn');
const printBtn = document.getElementById('printBtn');
const themeBtn = document.getElementById('themeBtn');
const importInput = document.getElementById('importInput');

let classes = load() || [];

// Initialize grid and modal
initGrid(gridEl);
initModal(handleModalSave, () => {});

// Render initial state
render();

// Button actions
addBtn.addEventListener('click', () => openModal(null));

importBtn.addEventListener('click', () => importInput.click());

importInput.addEventListener('change', async (ev) => {
  const file = ev.target.files[0];
  if (file) {
    try {
      const imported = await importFile(file);
      if (Array.isArray(imported)) {
        classes = imported;
        save(classes);
        render();
      }
    } catch (err) {
      alert('Failed to import file: ' + err.message);
    }
    importInput.value = '';
  }
});

exportBtn.addEventListener('click', () => {
  const blob = exportBlob(classes);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'timetable.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
});

printBtn.addEventListener('click', () => {
  window.print();
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

/**
 * Renders the timetable grid and highlights conflicts.
 */
function render() {
  renderClasses(gridEl, classes, {
    onEdit: (cls) => openModal({ ...cls }),
    onUpdate: (updated) => {
      const idx = classes.findIndex(c => c.id === updated.id);
      if (idx >= 0) classes[idx] = { ...updated };
      save(classes);
      render();
    }
  });
  updateConflicts();
}

/**
 * Handler for modal save; add new or update existing class.
 * @param {Object} data class data
 */
function handleModalSave(data) {
  const idx = classes.findIndex(c => c.id === data.id);
  if (idx >= 0) {
    classes[idx] = { ...data };
  } else {
    classes.push({ ...data });
  }
  save(classes);
  render();
}

/**
 * Highlight overlapping classes and announce via live region.
 */
function updateConflicts() {
  const conflicts = findConflicts(classes);
  // Remove all conflict classes
  document.querySelectorAll('.class-block').forEach(el => el.classList.remove('conflict'));
  conflicts.forEach(([a, b]) => {
    const elA = document.querySelector(`.class-block[data-id="${a}"]`);
    const elB = document.querySelector(`.class-block[data-id="${b}"]`);
    if (elA) elA.classList.add('conflict');
    if (elB) elB.classList.add('conflict');
  });
  const announcer = document.getElementById('announcer');
  if (conflicts.length > 0) {
    announcer.textContent = `Warning: ${conflicts.length} conflict(s) detected`;
  } else {
    announcer.textContent = '';
  }
}