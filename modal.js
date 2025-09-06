/*
 * Modal dialog controller for adding/editing class entries.
 *
 * This module exports an init function that wires up the modal DOM
 * elements and exposes an `open` function to populate and show the
 * form. Call `initModal` once at startup with callbacks for save
 * and cancel; then call `openModal(data)` whenever you need the
 * dialog. On save, the provided callback receives the class data
 * merged with any existing id.
 */

let modalEl;
let formEl;
let cancelBtn;
let onSaveCb;
let onCancelCb;
let editingId = null;

/**
 * Initialize modal event handlers.
 *
 * @param {Function} onSave called with class object on save
 * @param {Function} onCancel called when cancelled
 */
export function initModal(onSave, onCancel) {
  modalEl = document.getElementById('modal');
  formEl  = document.getElementById('classForm');
  cancelBtn = document.getElementById('cancelBtn');
  onSaveCb = onSave;
  onCancelCb = onCancel;

  // Submit handler
  formEl.addEventListener('submit', ev => {
    ev.preventDefault();
    const data = {
      id: editingId || generateId(),
      title: document.getElementById('titleInput').value.trim(),
      day: Number(document.getElementById('dayInput').value),
      start: document.getElementById('startInput').value,
      end: document.getElementById('endInput').value,
      location: document.getElementById('locationInput').value.trim(),
      color: document.getElementById('colorInput').value
    };
    close();
    if (onSaveCb) onSaveCb(data);
  });

  // Cancel handler
  cancelBtn.addEventListener('click', () => {
    close();
    if (onCancelCb) onCancelCb();
  });

  // Escape key closes modal
  document.addEventListener('keydown', ev => {
    if (!modalEl.classList.contains('hidden') && ev.key === 'Escape') {
      close();
      if (onCancelCb) onCancelCb();
    }
  });
}

/**
 * Show modal pre-filled with existing class or blank for new.
 * @param {Object|null} cls existing class or null
 */
export function openModal(cls) {
  editingId = cls ? cls.id : null;
  // Populate form fields
  document.getElementById('titleInput').value = cls ? cls.title : '';
  document.getElementById('dayInput').value   = cls ? String(cls.day) : '0';
  document.getElementById('startInput').value = cls ? cls.start : '08:00';
  document.getElementById('endInput').value   = cls ? cls.end : '09:00';
  document.getElementById('locationInput').value = cls ? cls.location : '';
  document.getElementById('colorInput').value = cls ? cls.color : '#6aa9ff';
  modalEl.classList.remove('hidden');
  // Focus first input for accessibility
  document.getElementById('titleInput').focus();
}

/**
 * Hide modal
 */
function close() {
  modalEl.classList.add('hidden');
}

/**
 * Generate a simple ID for new classes.
 */
function generateId() {
  return 'cls_' + Math.random().toString(36).slice(2, 10);
}