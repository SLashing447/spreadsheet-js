// This file will generate the required grids
import { handleCommand } from "../scripts/commands";
import { cellsToFillContainer, cellsToFillScreen } from "../scripts/util";
import { CONTAINER } from "../scripts/values";
import "./styles/Grid.css";
// import "./keybindings";

let GRID_ROWS = 0;
let GRID_COLS = 0;

let GRID_DATA = null;

export function generateGrid(data) {
  if (!CONTAINER) throw new Error("Container not found");

  GRID_DATA = data ?? null;

  const [screenRows, screenCols] = cellsToFillScreen();
  const dataRows = data?.length ?? 0;
  const dataCols = data?.[0]?.length ?? 0;

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
  for (let r = 0; r < rows; r++) addRow();

  GRID_DATA = null;

  // addColumn();
}

function addColumn() {
  for (let r = 0; r < GRID_ROWS; r++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.row = r;
    cell.dataset.col = colIndex;
    cell.spellcheck = false;
    cell.dir = "auto";
    cell.role = "textbox";

    cell.contentEditable = true;
    cell.tabIndex = 0;

    cell.style.gridRow = r + 2;
    cell.style.gridColumn = colIndex + 2;

    // 👇 populate here
    if (GRID_DATA?.[r]?.[colIndex] != null) {
      cell.textContent = GRID_DATA[r][colIndex];
    }

    CONTAINER.appendChild(cell);
  }
}
function addRow() {
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

    // TODO : HOW TO EXPAND COLUMNS  ???????

    cell.contentEditable = true;
    cell.tabIndex = 0;

    cell.style.gridRow = rowIndex + 2;
    cell.style.gridColumn = c + 2;

    // 👇 populate here
    if (GRID_DATA?.[rowIndex]?.[c] != null) {
      cell.innerHTML = GRID_DATA[rowIndex][c];
    }

    CONTAINER.appendChild(cell);
  }
}

CONTAINER.addEventListener("input", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const row = +cell.dataset.row;
  const col = +cell.dataset.col;

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

  handleCommand(cell);
});
