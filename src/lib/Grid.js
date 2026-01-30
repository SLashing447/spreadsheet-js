// This file will generate the required grids
import { handleCommand } from "../scripts/commands";
import { cellsToFillScreen } from "../scripts/util";
import { CONTAINER } from "../scripts/values";
import "./styles/Grid.css";
// import "./keybindings";

let GRID_ROWS = 0;
let GRID_COLS = 0;

let GRID_DATA = null;

export function ensureGridSize(row, col) {
  while (GRID_ROWS <= row) addRow();
  while (GRID_COLS <= col) addColumn();

  console.log("Size changed new sizes are : ", GRID_COLS, GRID_ROWS);
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
  const dataRows = data?.[data.length - 1][0] ?? 0;
  const dataCols = data?.[0][1]?.length ?? 0;

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

  // for(let r=0;r<)
  // console.log(dataRows);
  if (data) {
    let k = 0;
    for (let i = 0; i < dataRows + 1; i++) {
      let actual_row = data[k][0];
      let data_row = data[k][1];

      if (actual_row == i) {
        // console.log(k, data_row);

        addRow(data_row);
        k++;
      } else {
        addRow();
      }
    }

    // to compensate full screen add the extra ones
    for (let g = 0; g < rows - dataRows; g++) addRow();
  } else {
    for (let r = 0; r < rows; r++) addRow();
  }

  // GRID_DATA = null;

  // addColumn();
}

// function addColumn() {
//   const colIndex = GRID_COLS; // 👈 THIS is the key

//   for (let r = 0; r < GRID_ROWS; r++) {
//     const cell = document.createElement("div");
//     cell.className = "cell";
//     cell.dataset.row = r;
//     cell.dataset.col = colIndex;

//     cell.spellcheck = false;
//     cell.dir = "auto";
//     cell.role = "textbox";
//     cell.contentEditable = true;
//     cell.tabIndex = 0;

//     cell.style.gridRow = r + 2;
//     cell.style.gridColumn = colIndex + 2;

//     if (GRID_DATA?.[r]?.[colIndex] != null) {
//       cell.textContent = GRID_DATA[r][colIndex];
//     }

//     CONTAINER.appendChild(cell);
//   }

//   GRID_COLS++; // 👈 CRITICAL
// }

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
    cell.contentEditable = true;
    cell.tabIndex = 0;

    cell.style.gridRow = r + 2;
    cell.style.gridColumn = colIndex + 2;

    if (GRID_DATA?.[r]?.[colIndex] != null) {
      cell.textContent = GRID_DATA[r][colIndex];
    }

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

    cell.contentEditable = true;
    cell.tabIndex = 0;

    cell.style.gridRow = rowIndex + 2;
    cell.style.gridColumn = c + 2;

    // 👇 populate here
    // console.log(GRID_DATA?.[rowIndex][0], rowIndex);
    try {
      if (row_data !== undefined) cell.innerHTML = row_data[c] || "";
      // if (GRID_DATA?.[rowIndex][0] === rowIndex) {
      //   // if (GRID_DATA?.[rowIndex]?.[c] != null) {
      //   console.log("val=", GRID_DATA[last_skipped_row][1]);
      //   cell.innerHTML = GRID_DATA[last_skipped_row][1][c];
      //   // last_skipped_row++;
      // } else {
      //   cell.innerHTML = "";
      //   current_data_row = GRID_DATA?.[rowIndex][0];
      // }
    } catch (_) {
      throw new Error("Error reading data : ", GRID_DATA[rowIndex]);
    }

    CONTAINER.appendChild(cell);
  }
}

CONTAINER.addEventListener("input", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

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

  handleCommand(cell);
});

// window.addEventListener("resize", () => {
//   // console.log("helo");
//   const [rows, cols] = cellsToFillScreen();
//   console.log(rows, cols);
//   ensureGridSize(rows, cols);
// });1
