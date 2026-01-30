import { getGridSize } from "../lib/Grid";
import { selectedArea } from "./keybindings";
import { CONTAINER } from "./values";
export function sanitize() {
  const cells = document.querySelectorAll(".cell");

  // 1️⃣ Group cells by row
  const rowMap = new Map();

  cells.forEach((cell) => {
    const row = +cell.dataset.row;
    const col = +cell.dataset.col;
    const html = cell.innerHTML.trim();

    if (!rowMap.has(row)) {
      rowMap.set(row, new Map());
    }
    rowMap.get(row).set(col, html);
  });

  // 2️⃣ Convert to output format, filtering empty rows
  const data = [];

  // Sort rows numerically
  const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);

  sortedRows.forEach((rowId) => {
    const colMap = rowMap.get(rowId);

    // Filter out empty columns and find max used column
    const nonEmptyCols = Array.from(colMap.entries()).filter(
      ([col, val]) => val !== ""
    );

    if (nonEmptyCols.length === 0) {
      return; // Skip completely empty rows
    }

    // Get max column index from non-empty cells only
    const maxCol = Math.max(...nonEmptyCols.map(([col, val]) => col));

    // Build dense array (fill missing columns with "")
    const dataArr = [];
    for (let col = 0; col <= maxCol; col++) {
      dataArr[col] = colMap.get(col) || "";
    }

    data.push([rowId, dataArr]);
  });

  console.log(data);

  return data;
}

/**
 * Returns msgpack ecnoding of selected string[][]
 */
export function exportSelectedData() {
  const cellMap = new Map();
  const { row1, row2, col1, col2 } = selectedArea;

  CONTAINER.querySelectorAll("[data-row][data-col]").forEach((cell) => {
    cellMap.set(`${cell.dataset.row},${cell.dataset.col}`, cell);
  });

  const data = [];

  for (let r = row1; r <= row2; r++) {
    const row = [];
    for (let c = col1; c <= col2; c++) {
      const cell = cellMap.get(`${r},${c}`);
      row.push(cell ? cell.textContent : "");
    }
    data.push(row);
  }

  return data;
}
