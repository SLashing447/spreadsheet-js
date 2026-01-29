// import { CONTAINER } from "./Grid";

import { handleKeyCommand } from "./commands";
import { calSelArea, isPrintMode, save_grid, setPrintMode } from "./util";
import { CONTAINER } from "./values";
// const CONTAINER = document.getElementById("grid-container");

// wofhweofh weofweiohf iowehf owe
let isDragging = false;
let startCell = null;
let lastHoverCell = null;

const rng_info = document.getElementById("sel-rng");
rng_info.addEventListener("mousedown", (e) => e.preventDefault());

export let selectedArea = null;

export function clearSelectedArea() {
  rng_info.innerText = `0-0 0-0`;
  selectedArea = null;

  document
    .querySelectorAll(".cell.sel")
    .forEach((c) => c.classList.remove("sel"));
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

  clearSelectedArea();
  cell.classList.add("sel");
});

CONTAINER.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const cell = e.target.closest(".cell");
  if (!cell || cell === lastHoverCell) return;

  lastHoverCell = cell;
  clearSelectedArea();
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

window.addEventListener("resize", () => {});

document.addEventListener("keydown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = +cell.dataset.row;
  const col = +cell.dataset.col;
  const key = e.key.toLocaleLowerCase();

  handleKeyCommand(key);

  if (key === "escape") {
    clearSel();
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
