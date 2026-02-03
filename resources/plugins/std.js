import { ensureGridSize } from "../../src/lib/Grid";
import {
  getCellTextByPos,
  listen,
  setCellTextByPos,
} from "../../src/scripts/plugin/plugin_api";
import { selected_cell } from "../../src/scripts/values";

/**
 * Sums numbers in a range of cells.
 * Usage: /sum(0, 0, 5, 5)  -> Sums from A0 to E5
 *
 * @param {Array} area - [row1, col1, row2, col2]
 */
export const sum = (area) => {
  let local_selected_cell = selected_cell;

  const getAreaDyn = (a) => {
    if (a) {
      const total = getSumByArea(a.r1, a.c1, a.r2, a.c2);
      console.log(total);
      setCellTextByPos(total, local_selected_cell);
    }
  };
  // 1. Validate input area
  if (!Array.isArray(area) || area.length !== 4) {
    // interative selection mode enabled
    setCellTextByPos("Start Selecting", local_selected_cell);
    listen("selectionChange", getAreaDyn);
  } else {
    const [r1, c1, r2, c2] = area.map((n) => Number(n) - 1);

    const total = getSumByArea(r1, c1, r2, c2);
    setCellTextByPos(total, local_selected_cell);
  }
};

const getSumByArea = (r1, c1, r2, c2) => {
  // Handle reverse selection (e.g. user dragged bottom-right to top-left)
  const startRow = Math.min(r1, r2);
  const endRow = Math.max(r1, r2);
  const startCol = Math.min(c1, c2);
  const endCol = Math.max(c1, c2);

  let total = 0;

  // 2. Iterate through the grid
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      // 3. Fetch raw text from cell
      const text = getCellTextByPos(r, c);

      if (text) {
        // 4. Split by actual line breaks (no <br> drama)
        // Handles \n, \r\n, and filters empty lines
        const lines = text.split(/\r?\n/);

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          // 5. Convert to number (Error -> 0)
          const val = Number(cleanLine);

          if (!isNaN(val)) {
            total += val;
          }
          // else: treat as 0 (skip)
        }
      }
    }
  }

  return total;
};

export const fill = (args) => {
  const template = args[0];
  const r1 = +args[1] - 1;
  const c1 = +args[2] - 1;
  const r2 = +args[3] - 1;
  const c2 = +args[4] - 1;

  console.log(template);
  

  for (let i = r1; i <= r2; i++) {
    for (let j = c1; j <= c2; j++) {
      const value = template.replace(/\{([^}]+)\}/g, (_, expr) => {
        try {
          // i, j are 1-based for user
          return Function("i", "j", `return ${expr}`)(i + 1, j + 1);
        } catch {
          return `{${expr}}`; // fail gracefully
        }
      });

      ensureGridSize(i, j);
      setCellTextByPos(value, [i, j]);
    }
  }
};
