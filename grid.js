/*
 * Grid rendering and interactive logic for timetable builder.
 *
 * The grid is built using CSS grid to create 7 equally-sized columns
 * (one per day). Each column contains a header and a content area
 * where class blocks are absolutely positioned according to their
 * start/end times. Dragging and resizing are implemented via
 * pointer events with snapping to 15 minute increments.
 */

import { DAYS, DAY_START, DAY_END, SLOT, hmToMin } from './conflict.js';

/**
 * Initialize the grid structure inside the given container.
 * Creates the day columns and headers; content areas are empty.
 * @param {HTMLElement} container
 */
export function initGrid(container) {
  container.innerHTML = '';
  DAYS.forEach((name) => {
    const col = document.createElement('div');
    col.className = 'day-column';
    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = name;
    const content = document.createElement('div');
    content.className = 'day-content';
    col.appendChild(header);
    col.appendChild(content);
    container.appendChild(col);
  });
}

/**
 * Render the list of classes into the grid and set up interactivity.
 *
 * @param {HTMLElement} container grid element
 * @param {Array} classes list of class objects
 * @param {Object} callbacks object with:
 *   onEdit(cls): called when a block is clicked for editing
 *   onUpdate(cls): called when block is moved or resized
 */
export function renderClasses(container, classes, callbacks) {
  const contents = Array.from(container.querySelectorAll('.day-content'));
  // Clear previous blocks
  contents.forEach(el => el.innerHTML = '');
  // Precompute measurement: px per minute for each content area
  const pxPerMinuteArr = contents.map(content => {
    const h = content.clientHeight;
    const minutes = DAY_END - DAY_START;
    return h / minutes;
  });
  // Map id to class for quick update
  const classMap = new Map(classes.map(c => [c.id, c]));
  // For conflict detection, we can mark separately; not used here

  classes.forEach(cls => {
    const day = cls.day;
    if (day < 0 || day >= contents.length) return;
    const content = contents[day];
    const pxPerMinute = pxPerMinuteArr[day];
    const startMin = hmToMin(cls.start);
    const endMin   = hmToMin(cls.end);
    const top = (startMin - DAY_START) * pxPerMinute;
    const height = (endMin - startMin) * pxPerMinute;
    const block = document.createElement('div');
    block.className = 'class-block';
    block.style.top = `${top}px`;
    block.style.height = `${height}px`;
    block.style.backgroundColor = cls.color || '#6aa9ff';
    block.dataset.id = cls.id;
    block.innerHTML = `<div class="title">${cls.title}</div><div class="loc">${cls.location || ''}</div>`;
    // Resize handle
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    block.appendChild(handle);
    content.appendChild(block);

    // Click to edit
    block.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      if (callbacks.onEdit) callbacks.onEdit(cls);
    });

    // Dragging
    block.addEventListener('pointerdown', (ev) => {
      // Determine if resizing (handle) or moving (block)
      const target = ev.target;
      const isResize = target.classList.contains('resize-handle');
      ev.preventDefault();
      // Capture pointer to avoid leaving container
      block.setPointerCapture(ev.pointerId);
      const startY = ev.clientY;
      const startX = ev.clientX;
      const origDayIdx = cls.day;
      const origStart = hmToMin(cls.start);
      const origEnd   = hmToMin(cls.end);
      const origPxPerMinute = pxPerMinute;
      const containerRect = container.getBoundingClientRect();
      const dayWidth = containerRect.width / contents.length;
      const onMove = (e) => {
        const dy = e.clientY - startY;
        const dx = e.clientX - startX;
        // Determine new day based on horizontal movement
        let newDay = origDayIdx;
        if (Math.abs(dx) > dayWidth * 0.3) {
          // If moved beyond 30% of a column width, adjust day
          const shift = Math.round(dx / dayWidth);
          newDay = Math.min(Math.max(0, origDayIdx + shift), contents.length - 1);
        }
        const newPxPerMinute = pxPerMinuteArr[newDay];
        if (!isResize) {
          // Move block: adjust start and end equally
          let minutesOffset = dy / origPxPerMinute;
          // Snap to slot
          minutesOffset = Math.round(minutesOffset / SLOT) * SLOT;
          let newStartMin = origStart + minutesOffset;
          let durationMin = origEnd - origStart;
          // Clamp within day boundaries
          if (newStartMin < DAY_START) newStartMin = DAY_START;
          if (newStartMin + durationMin > DAY_END) newStartMin = DAY_END - durationMin;
          const newStartHM = minToHM(newStartMin);
          const newEndHM   = minToHM(newStartMin + durationMin);
          // Apply to element visually
          const topPx = (newStartMin - DAY_START) * newPxPerMinute;
          block.style.top = `${topPx}px`;
          block.style.height = `${durationMin * newPxPerMinute}px`;
          // If day changed, move element to new column
          if (newDay !== cls.day) {
            contents[newDay].appendChild(block);
          }
          // Save to temp variables for pointerup
          cls.__tempStart = newStartHM;
          cls.__tempEnd   = newEndHM;
          cls.__tempDay   = newDay;
        } else {
          // Resize: adjust end only
          let minutesOffset = dy / origPxPerMinute;
          minutesOffset = Math.round(minutesOffset / SLOT) * SLOT;
          let newEndMin = origEnd + minutesOffset;
          // Minimum duration one slot
          if (newEndMin - origStart < SLOT) newEndMin = origStart + SLOT;
          if (newEndMin > DAY_END) newEndMin = DAY_END;
          const newEndHM = minToHM(newEndMin);
          // Update height
          const newHeightPx = (newEndMin - origStart) * newPxPerMinute;
          block.style.height = `${newHeightPx}px`;
          block.classList.add('dragging');
          cls.__tempStart = cls.start;
          cls.__tempEnd   = newEndHM;
          cls.__tempDay   = cls.day;
        }
        block.classList.add('dragging');
      };
      const onUp = () => {
        block.releasePointerCapture(ev.pointerId);
        block.classList.remove('dragging');
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        // Apply saved temp values
        if (cls.__tempStart) {
          cls.start = cls.__tempStart;
          cls.end   = cls.__tempEnd;
          cls.day   = cls.__tempDay;
          delete cls.__tempStart;
          delete cls.__tempEnd;
          delete cls.__tempDay;
          if (callbacks.onUpdate) callbacks.onUpdate(cls);
        }
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  });
}

/**
 * Convert minutes past midnight to "HH:MM" string (24h).
 * @param {number} m
 * @returns {string}
 */
function minToHM(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const hhStr = h.toString().padStart(2, '0');
  const mmStr = mm.toString().padStart(2, '0');
  return `${hhStr}:${mmStr}`;
}