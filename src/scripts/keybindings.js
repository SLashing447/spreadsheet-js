// import { CONTAINER } from "./Grid";

import { decode } from "@msgpack/msgpack";
import { handleKeyCommand } from "./commands";
import {
  calSelArea,
  isPrintMode,
  populateGrid,
  save_grid,
  setPrintMode,
} from "./util";
import { CONTAINER, selected_cell, setInfo } from "./values";
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

  rng_info.innerText = `${rowMin + 1}-${colMin + 1}  ${rowMax + 1}-${
    colMax + 1
  }  ${calSelArea({
    row1: rowMin,
    col1: colMin,
    row2: rowMax,
    col2: colMax,
  })}`;

  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      document
        .querySelector(`[data-row="${r}"][data-col="${c}"]`)
        ?.classList.add("sel");
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
    row1: Math.min(r1, r2),
    col1: Math.min(c1, c2),
    row2: Math.max(r1, r2),
    col2: Math.max(c1, c2),
  };

  isDragging = false;
  startCell = null;
  lastHoverCell = null;
});

document.addEventListener("keydown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = +cell.dataset.row;
  const col = +cell.dataset.col;
  const key = e.key.toLowerCase();

  handleKeyCommand(e);

  if (key === "escape") {
    unSelectArea();
  }

  if (key === "enter" && e.ctrlKey) {
    // e.preventDefault();

    document
      .querySelector(`[data-col="${col}"][data-row="${row + 1}"]`)
      ?.focus();
    return;
  }

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

  if (
    key === "arrowup" ||
    key === "arrowdown" ||
    key === "arrowleft" ||
    key === "arrowright"
  ) {
    e.preventDefault();

    let r = row;
    let c = col;

    if (key === "arrowup") r--;
    if (key === "arrowdown") r++;
    if (key === "arrowleft") c--;
    if (key === "arrowright") c++;

    document.querySelector(`[data-row="${r}"][data-col="${c}"]`)?.focus();

    return;
  }
});

window.addEventListener("paste", async (e) => {
  // Get clipboard data from event (sync, before it pastes)
  const text = e.clipboardData?.getData("text/plain");

  if (!text) return;

  try {
    // Quick check: is it byte CSV?
    if (!/^\d+(,\d+)*$/.test(text)) {
      return; // Let default paste happen
    }

    // Looks like binary - prevent showing it
    e.preventDefault();

    // Show loading immediately
    // setInfo("Decoding...", 0);

    // Parse bytes
    const bytes = Uint8Array.from(
      text.split(",").map((n) => {
        const v = Number(n);
        if (v < 0 || v > 255 || Number.isNaN(v)) {
          throw new Error("Invalid byte");
        }
        return v;
      })
    );

    const data = decode(bytes);

    // Check if it's our clipboard data
    if (data.type !== "clipboard") {
      throw new Error("Not clipboard data");
    }

    // Add delay before populating (user sees "Decoding...")
    await new Promise((resolve) => setTimeout(resolve, 150));

    populateGrid(data.data);
    setInfo("Pasted ✓", 2000);
  } catch {
    // Not our format or decode failed - allow default paste
    // (but we already prevented, so clear and do nothing)
    setInfo("fail", 0);
  }
});
