// import { CONTAINER } from "./Grid";

import { decode } from "@msgpack/msgpack";
import { handleKeyCommand } from "./commands";
import {
  calSelArea,
  getCellByPos,
  isPrintMode,
  populateGrid,
  save_grid,
  setPrintMode,
} from "./util";
import {
  CONTAINER,
  isInteractiveMode,
  selected_cell,
  setIneractiveMode,
  setInfo,
  setSelectedCell,
} from "./values";
import { ensureGridSize, getGridSize } from "../lib/Grid";
import {
  handleCommand,
  // setLiveSelectingArea,
  // triggerKeyWatcher,
} from "./plugin/plugins";
import {
  triggerKeyDownForPlugin,
  triggerSelectionChangeForPlugin,
} from "./plugin/plugin_api";
// const CONTAINER = document.getElementById("grid-container");

// wofhweofh weofweiohf iowehf owe
let isDragging = false;
let startCell = null;
let lastHoverCell = null;

const rng_info = document.getElementById("sel-rng");
rng_info.addEventListener("mousedown", (e) => e.preventDefault());

export let selectedArea = null;
function clearSelectionVisuals() {
  document
    .querySelectorAll(".cell.sel")
    .forEach((c) => c.classList.remove("sel"));
}
export function unSelectArea() {
  if (!selectedArea) return;
  selectedArea = null;
  rng_info.innerText = `${selected_cell[0] + 1}-${selected_cell[1] + 1} 0-0`;
  clearSelectionVisuals();
}

function selectRange(a, b) {
  const r1 = +a.dataset.row;
  const c1 = +a.dataset.col;
  const r2 = +b.dataset.row;
  const c2 = +b.dataset.col;

  const rowMin = Math.min(r1, r2);
  const rowMax = Math.max(r1, r2);
  const colMin = Math.min(c1, c2);
  const colMax = Math.max(c1, c2);

  const ar = {
    r1: rowMin,
    c1: colMin,
    r2: rowMax,
    c2: colMax,
  };

  rng_info.innerText = `${rowMin + 1}-${colMin + 1}  ${rowMax + 1}-${
    colMax + 1
  }  ${calSelArea(ar)}`;

  // setLiveSelectingArea(ar);
  triggerSelectionChangeForPlugin(ar);

  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      getCellByPos(r, c)?.classList.add("sel");
    }
  }
}

CONTAINER.addEventListener("mousedown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = +cell.dataset.row;
  const col = +cell.dataset.col;

  requestAnimationFrame(() => {
    rng_info.textContent = `${row + 1}-${col + 1} 0-0`;
  });

  isDragging = true;
  startCell = cell;
  lastHoverCell = cell;
  setSelectedCell([row, col]);

  unSelectArea();
  cell.classList.add("sel");
});

CONTAINER.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const cell = e.target.closest(".cell");
  if (!cell || cell === lastHoverCell) return;

  lastHoverCell = cell;
  clearSelectionVisuals();
  selectRange(startCell, cell);
});

CONTAINER.addEventListener("contextmenu", (e) => e.preventDefault());
CONTAINER.addEventListener("mouseup", () => {
  if (!isDragging || !startCell || !lastHoverCell) return;

  const r1 = +startCell.dataset.row;
  const c1 = +startCell.dataset.col;
  const r2 = +lastHoverCell.dataset.row;
  const c2 = +lastHoverCell.dataset.col;

  selectedArea = {
    r1: Math.min(r1, r2),
    c1: Math.min(c1, c2),
    r2: Math.max(r1, r2),
    c2: Math.max(c1, c2),
  };

  isDragging = false;
  startCell = null;
  lastHoverCell = null;
});

// generic listner
window.addEventListener("keydown", (e) => {
  // triggerKeyWatcher(e);
  const key = e.key.toLowerCase();

  if (key === "escape") {
    // chec if interacitver
    if (isInteractiveMode) {
      setIneractiveMode(false);
    }

    if (isPrintMode) {
      setPrintMode(false);
    }

    unSelectArea();
  }

  // if (key === "r" && e.ctrlKey) {
  //   e.preventDefault();
  // }

  //   ! SAVE

  if (key === "s" && e.ctrlKey) {
    e.preventDefault();
    save_grid();

    return;
  }

  //   ! print
  if (key === "p" && e.ctrlKey) {
    e.preventDefault();
    if (!isPrintMode) setPrintMode(true);
    else window.print();
    return;
  }
});

CONTAINER.addEventListener("keydown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = +cell.dataset.row;
  const col = +cell.dataset.col;
  const key = e.key.toLowerCase();

  handleKeyCommand(e);

  triggerKeyDownForPlugin(e);

  // 2. Your normal app logic...
  if (e.defaultPrevented) return; // If a plugin blocked it, stop.

  if (key === "enter") {
    const text = cell.textContent;

    if (text && text.startsWith("/")) {
      e.preventDefault();
      handleCommand(text);
      return;
    }
  }

  //directly go to next row at 0
  if (key === "tab" && e.ctrlKey) {
    e.preventDefault();
    setSelectedCell([row + 1, 0]);
    getCellByPos(row + 1, 0)?.focus();
    return;
  }

  if (key === "tab") {
    e.preventDefault();
    if (getGridSize()[1] === col + 1) {
      setSelectedCell([row + 1, 0]);
      getCellByPos(row + 1, 0)?.focus();
      return;
    }

    setSelectedCell([row, col + 1]);
    getCellByPos(row, col + 1)?.focus();

    // console.log(selected_cell);
  }

  // go to row below
  if (key === "enter" && e.ctrlKey) {
    e.preventDefault();

    getCellByPos(row + 1, col)?.focus();
    setSelectedCell([row + 1, col]);

    return;
  }

  if (
    (key === "arrowup" ||
      key === "arrowdown" ||
      key === "arrowleft" ||
      key === "arrowright") &&
    e.ctrlKey
  ) {
    e.preventDefault();

    let r = row;
    let c = col;

    if (key === "arrowup") r--;
    if (key === "arrowdown") r++;
    if (key === "arrowleft") c--;
    if (key === "arrowright") c++;

    getCellByPos(r, c)?.focus();
    setSelectedCell([r, c]);

    return;
  }
});

window.addEventListener("paste", async (e) => {
  // Get clipboard data from event (sync, before it pastes)
  const text = e.clipboardData?.getData("text/plain");
  // console.log(text);
  if (!text) return;

  try {
    // Quick check: is it byte CSV?
    if (!/^\d+(,\d+)*$/.test(text)) {
      return; // Let default paste happen
    }

    // Looks like binary - prevent showing it

    // Show loading immediately
    // setInfo("Decoding...", 0);

    // Parse bytes
    const bytes = Uint8Array.from(
      text.split(",").map((n) => {
        const v = Number(n);
        if (v < 0 || v > 255 || Number.isNaN(v)) {
          return;
        }
        return v;
      })
    );

    e.preventDefault();
    const data = decode(bytes);

    // Check if it's our clipboard data
    if (data.type !== "clipboard") {
      return;
    }
    console.log(data.data);

    // Add delay before populating (user sees "Decoding...")
    // await new Promise((resolve) => setTimeout(resolve, 150));

    populateGrid(data.data);
    save_grid();
    setInfo("Pasted ✓", 1);
  } catch (e) {
    console.log(e);
    // Not our format or decode failed - allow default paste
    // (but we already prevented, so clear and do nothing)
    setInfo("fail", 1);
  }
});

// auto save
