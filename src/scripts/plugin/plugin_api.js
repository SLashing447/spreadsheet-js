// plugin_api.js

import { getCellByPos } from "../util";
import { selected_cell, setIneractiveMode, setInfo } from "../values";

// --- Internal Event Bus ---
const eventBus = {
  selectionChange: [],
  keyDown: [], // Changed from cellChange to keyDown
};

// --- API Functions ---

export function getCellTextByPos(row, col) {
  return getCellByPos(row, col)?.textContent;
}

export function setCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos[0] : selected_cell[0],
    pos ? pos[1] : selected_cell[1]
  );
  if (cell && text) {
    cell.innerHTML = "";
    cell.textContent = text;
  }
}

export function pushCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos[0] : selected_cell[0],
    pos ? pos[1] : selected_cell[1]
  );
  if (cell && text) {
    cell.textContent += text;
  }
}

// --- Event Registration ---

/**
 * Registers a callback for events.
 * @param {string} eventName - 'selectionChange' | 'keyDown'
 * @param {Function} callback - Function to call
 * @returns {Function} Unsubscribe function
 */
export function listen(eventName, callback) {
  if (!eventBus[eventName]) {
    console.warn(`Unknown event: ${eventName}`);
    return () => {};
  }

  setInfo("Interactive Mode!! Press Escape to Exit", 1);
  setIneractiveMode(true);

  eventBus[eventName].push(callback);
}

export function clearIntModeListerners() {
  setInfo("Interactive Mode disabled", 1);
  eventBus["selectionChange"] = [];
  eventBus["keyDown"] = [];

  // eventBus = {
  //   selectionChange: [],
  //   keyDown: [],
  // };
}

// --- Internal Triggers (Called by Main App) ---

export function triggerSelectionChangeForPlugin(selectedCells) {
  eventBus.selectionChange.forEach((cb) => cb(selectedCells));
}

/**
 * Call this from your main window 'keydown' listener
 * @param {KeyboardEvent} e - The raw DOM event
 */
export function triggerKeyDownForPlugin(e) {
  // Create a safe event object (read-only) for plugins
  // to prevent them from mutating the raw event directly if needed
  const safeEvent = {
    key: e.key,
    code: e.code,
    ctrlKey: e.ctrlKey,
    shiftKey: e.shiftKey,
    altKey: e.altKey,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  };

  eventBus.keyDown.forEach((cb) => cb(safeEvent));
}
