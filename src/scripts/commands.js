import { clearSelectedArea, selectedArea } from "./keybindings";
import { CONTAINER } from "./values";

export function handleCommand(text) {
  //   console.log(text, selectedArea);
}

export function handleKeyCommand(key) {
  // delete the inner text
  if (key === "d" || key === "delete" || key === "backspace") {
    const cellMap = new Map();
    const { row1, row2, col1, col2 } = selectedArea;

    CONTAINER.querySelectorAll("[data-row][data-col]").forEach((cell) => {
      cellMap.set(`${cell.dataset.row},${cell.dataset.col}`, cell);
    });

    // later
    for (let r = row1; r <= row2; r++) {
      for (let c = col1; c <= col2; c++) {
        const cell = cellMap.get(`${r},${c}`);
        if (!cell) continue;
        cell.innerHTML = "";
      }
    }
  }

  clearSelectedArea();
}
