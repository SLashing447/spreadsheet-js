import { encode } from "@msgpack/msgpack";
import { exportSelectedData } from "./extract";
import { selectedArea, unSelectArea } from "./keybindings";
import { CONTAINER, setInfo } from "./values";
import { calSelArea } from "./util";

export function handleCommand(text) {
  //   console.log(text, selectedArea);
}

export function handleKeyCommand(e) {
  const key = e.key.toLowerCase();
  // delete the inner text
  if (key === "d" || key === "delete" || key === "backspace") {
    // console.log(calSelArea());

    rmSelectedData();
  }

  // detect paste
  if (key === "v" && e.ctrlKey) {
    return;
    // const clipboard = navigator.clipboard.
  }

  if (key === "c" && e.ctrlKey) {
    navigator.clipboard.writeText(
      encode({
        type: "clipboard",
        data: exportSelectedData(),
      })
    );
    unSelectArea();

    setInfo("Copied To Clipboard", 5000);
  }

  if (key === "x" && e.ctrlKey) {
    navigator.clipboard.writeText(
      encode({
        type: "clipboard",
        data: exportSelectedData(),
      })
    );
    unSelectArea();

    rmSelectedData();
  }
  //
}

export function rmSelectedData(ar) {
  const sel = ar ?? selectedArea;
  const area = calSelArea(sel);
  if (area === 0 || area === 1) return;

  const cellMap = new Map();
  const { row1, row2, col1, col2 } = sel;

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
