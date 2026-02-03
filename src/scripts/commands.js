import { encode } from "@msgpack/msgpack";
import { exportSelectedData } from "./extract";
import { selectedArea, unSelectArea } from "./keybindings";
import { CONTAINER, setInfo } from "./values";
import { calSelArea, getCellByPos } from "./util";
import { handleCommand } from "./plugin/plugins";

export function handleKeyCommand(e) {
  const key = e.key.toLowerCase();

  // delete the inner text
  if (key === "delete" || key === "backspace") {
    // console.log(calSelArea());

    rmSelectedData();
  }

  // detect paste
  if (key === "v" && e.ctrlKey) {
    return;
    // const clipboard = navigator.clipboard.
  }

  if (key === "c" && e.ctrlKey) {
    const dataToWrite = exportSelectedData();
    if (!dataToWrite) return;

    navigator.clipboard.writeText(
      encode({
        type: "clipboard",
        data: dataToWrite,
      })
    );
    unSelectArea();

    setInfo("Copied To Clipboard", 1);
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
  const { r1, r2, c1, c2 } = sel;

  CONTAINER.querySelectorAll("[data-row][data-col]").forEach((cell) => {
    cellMap.set(`${cell.dataset.row},${cell.dataset.col}`, cell);
  });

  // later
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = cellMap.get(`${r},${c}`);
      if (!cell) continue;
      cell.textContent = "";
    }
  }

  unSelectArea();
}
