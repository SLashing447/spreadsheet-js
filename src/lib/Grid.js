// This file will generate the required grids
// import { handleCommand } from "../scripts/commands";
import { cellsToFillScreen, save_grid, setCellContent } from "../scripts/util";
import { CONTAINER } from "../scripts/values";
import "./styles/Grid.css";
// import "./keybindings";

let GRID_ROWS = 0;
let GRID_COLS = 0;

export function ensureGridSize(row, col) {
  while (GRID_ROWS <= row) addRow();
  while (GRID_COLS <= col) addColumn();

  // console.log("Size changed new sizes are : ", GRID_COLS, GRID_ROWS);
}

export function getGridSize() {
  return [GRID_ROWS, GRID_COLS];
  // while (GRID_ROWS <= row) addRow();
  // while (GRID_COLS <= col) addColumn();
}

export function generateGrid(data) {
  if (!CONTAINER) throw new Error("Container not found");

  // console.log(data);

  // GRID_DATA = data ?? null;

  const [screenRows, screenCols] = cellsToFillScreen();
  let dataCols = 0;
  let dataRows = 0;

  if (data && data.length > 0) {
    // Get max column count across all rows
    dataCols = Math.max(...data.map((row) => row[1]?.length || 0));

    // Get max row index
    dataRows = Math.max(...data.map((row) => row[0])) + 1; // +1 because row_id is 0-indexed
  }

  // console.log(data);
  // console.log(dataRows, dataCols);

  const rows = Math.max(screenRows, dataRows);
  const cols = Math.max(screenCols, dataCols);

  CONTAINER.innerHTML = "";
  CONTAINER.style.display = "grid";
  CONTAINER.style.gridTemplateColumns = `repeat(${cols + 1}, max-content)`;
  CONTAINER.style.gridTemplateRows = `repeat(${rows + 1}, max-content)`;

  GRID_ROWS = 0;
  GRID_COLS = 0;

  const corner = document.createElement("div");
  corner.className = "corner";
  corner.style.gridRow = 1;
  corner.style.gridColumn = 1;
  CONTAINER.appendChild(corner);

  for (let c = 0; c < cols; c++) {
    GRID_COLS++;
    const colIndex = GRID_COLS - 1;

    const head = document.createElement("div");
    head.className = "col-head";
    head.textContent = colIndex + 1;
    head.style.gridRow = 1;
    head.style.gridColumn = colIndex + 2;
    CONTAINER.appendChild(head);
  }

  GRID_COLS = cols;

  // ========== POPULATE GRID ==========
  if (data && data.length > 0) {
    // Create a map for quick lookup: row_id -> row_data
    const dataMap = new Map();
    data.forEach(([row_id, row_data]) => {
      dataMap.set(row_id, row_data);
    });

    // Fill all rows
    for (let i = 0; i < rows; i++) {
      const row_data = dataMap.get(i); // Get data for this row (or undefined)
      addRow(row_data);
    }
  } else {
    // No data - just fill with empty rows
    for (let r = 0; r < rows; r++) {
      addRow();
    }
  }
}

function addColumn() {
  const colIndex = GRID_COLS;

  /* ---------- column header ---------- */
  const head = document.createElement("div");
  head.className = "col-head";
  head.textContent = colIndex + 1;
  head.style.gridRow = 1;
  head.style.gridColumn = colIndex + 2;
  CONTAINER.appendChild(head);

  /* ---------- column cells ---------- */
  for (let r = 0; r < GRID_ROWS; r++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = r;
    cell.dataset.col = colIndex;

    cell.spellcheck = false;
    cell.dir = "auto";
    cell.role = "textbox";
    cell.contentEditable = "plaintext-only";
    cell.tabIndex = 0;

    cell.style.gridRow = r + 2;
    cell.style.gridColumn = colIndex + 2;

    CONTAINER.appendChild(cell);
  }

  GRID_COLS++; // 👈 increment ONCE, at the end
}
// let current_data_row = 0;
function addRow(row_data) {
  GRID_ROWS++;
  const rowIndex = GRID_ROWS - 1;

  const head = document.createElement("div");
  head.className = "row-head";
  head.textContent = rowIndex + 1;
  head.style.gridRow = rowIndex + 2;
  head.style.gridColumn = 1;
  CONTAINER.appendChild(head);

  for (let c = 0; c < GRID_COLS; c++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = rowIndex;
    cell.dataset.col = c;
    cell.spellcheck = false;
    cell.dir = "auto";
    cell.role = "textbox";

    cell.contentEditable = "plaintext-only";
    cell.tabIndex = 0;

    cell.style.gridRow = rowIndex + 2;
    cell.style.gridColumn = c + 2;

    // 👇 populate here
    // console.log(GRID_DATA?.[rowIndex][0], rowIndex);
    try {
      if (row_data && row_data[c] !== undefined) {
        setCellContent(cell, row_data[c]);
        // cell.innerHTML = row_data[c]; // Use textContent, not innerHTML for safety
      }
    } catch (_) {
      throw new Error("Error reading data : ", GRID_DATA[rowIndex]);
    }

    CONTAINER.appendChild(cell);
  }
}

let saveTimeout;

function triggerAutoSave() {
  // Clear the previous timer (reset the clock)
  clearTimeout(saveTimeout);

  // Update UI to show "Unsaved changes..."

  // Set a new timer for 1 or 2 seconds
  saveTimeout = setTimeout(() => {
    save_grid();
  }, 1000); // 1000ms delay
}

CONTAINER.addEventListener("input", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  triggerAutoSave();

  const row = +cell.dataset.row;

  if (GRID_ROWS - row <= 3) {
    for (let i = 0; i < 3; i++) addRow();
    CONTAINER.style.gridTemplateRows = `repeat(${GRID_ROWS + 1}, max-content)`;

    requestAnimationFrame(() => {
      CONTAINER.scrollTo({
        top: CONTAINER.scrollHeight,
        behavior: "smooth",
      });
    });
  }
});
