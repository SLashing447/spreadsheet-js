import { decode, encode } from "@msgpack/msgpack";
import { getDbItem, setDbItem } from "./db";
import { sanitize } from "./extract";
import { renderPrintTable } from "../lib/Print";
import { ensureGridSize, generateGrid } from "../lib/Grid";
import {
  CONTAINER,
  selected_cell,
  setFileInfo,
  setFileName,
  setHasDataFlag,
  setInfo,
  setLsTime,
} from "./values";
import { selectedArea } from "./keybindings";
import { saveFile } from "./api";
import { THEMES } from "../../resources/themes/THEMES";

export function cellsToFillScreen(cellWidth = 80, cellHeight = 38) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const col = Math.ceil(screenWidth / cellWidth);
  const row = Math.ceil(screenHeight / cellHeight);

  return [row, col];
}

export function cellsToFillContainer(
  container = document.getElementById("grid-container"),
  cellWidth = 80,
  cellHeight = 38
) {
  if (!container) {
    throw new Error("Container not provided");
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  return {
    cols: Math.floor(width / cellWidth),
    rows: Math.floor(height / cellHeight),
  };
}

export async function save_grid() {
  const data = sanitize();

  // console.log(data);
  if (data && data.length !== 0) {
    const fileName = document.getElementById("filename").innerText;
    const name = fileName ? fileName : "untitled";
    const now = Date.now();
    const lsShow = document.getElementById("ls-time");
    lsShow.innerText = formatEpoch(now);

    await setDbItem("name", name);

    await setDbItem("data", encode(data));
    await setDbItem("ls", now);
    setHasDataFlag(true);

    setInfo("All Changes Saved");
  } else {
    return -1;
  }
}

export function formatEpoch(ms) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

export let isPrintMode = false;
export function setPrintMode(on) {
  if (on) {
    const data = sanitize();
    if (!data || data.length === 0) return;

    // console.log(data);

    document
      .querySelectorAll(".no-print")
      .forEach((d) => (d.style.display = "none"));
    document.body.style.backgroundColor = "var(--pr-bg)";
    document.getElementById("print-container").style.display = "flex";
    requestAnimationFrame(() => {
      renderPrintTable(data, "print-container");
    });
  } else {
    // cleanup
    document.querySelector(".print-table").remove();

    document.body.style.backgroundColor = "var(--bg)";

    document.getElementById("print-container").style.display = "none";
    document
      .querySelectorAll(".no-print")
      .forEach((d) => (d.style.display = "flex"));
  }

  isPrintMode = on;
}

//  export to file

export async function exportAndDownloadFile() {
  // save grid first

  try {
    let st = await save_grid();
    if (st === -1) return;
    const headers = await getDbItem("headers");
    const name = await getDbItem("name");
    const _data = await getDbItem("data");
    const time = await getDbItem("ls");

    const data = {
      type: "file",
      name,
      time,
      headers: headers,
      data: _data,
    };

    // 1. Serialize to bytes
    const bytes = encode(data);

    // 2. Create Blob from bytes
    const blob = new Blob([bytes], { type: "application/octet-stream" });

    const result = await saveFile(blob, name);

    if (result) {
      console.log(`Saved to: ${result.path}`);
    } else {
      console.log("Save cancelled");
    }
  } catch (error) {
    console.error("Save failed:", error);
  }

  // 3. Create download URL
  // const url = URL.createObjectURL(blob);

  // // 4. Trigger download
  // const link = document.createElement("a");
  // link.href = url;
  // link.download = name;
  // link.click();

  // // 5. Cleanup
  // setTimeout(() => {
  //   URL.revokeObjectURL(url);
  //   link.remove();
  // }, 100);
}

export async function loadFile(buf, fileName) {
  try {
    // console.log(decode(buf));/
    // console.log(decode(buf));
    const { name, time, headers, data, type } = decode(buf);
    if (!name || !time || !data) {
      setInfo("Cannot Load file corrupted :(");
      throw new Error("Error While loading file");
    }
    if (type) {
      if (type !== "file") {
        throw new Error("Data is not a file it is  : ", type);
      }
    }

    if (headers) {
      headers.forEach((el, i) => {
        document.getElementById(`pch${i + 1}`).innerText = el;
      });
    }

    setFileInfo(`${Math.round(buf.length / 1024)} KB`);

    // recompute grid
    generateGrid(decode(data));
    setLsTime(time);
    setFileName(name);
    if (fileName !== name) {
      setFileName(fileName);
    } else {
      setFileName(name);
    }

    setInfo("File View Mode (Unsaved)");
  } catch (e) {
    setInfo("Error In loading file :(");
    throw new Error("Error While loading file");
  }
}
export function calSelArea(ar) {
  const arr = ar ?? selectedArea;
  if (!arr) return 0;
  return (arr.r2 - arr.r1 + 1) * (1 + arr.c2 - arr.c1);
}

export function populateGrid(partialdata) {
  // console.log(selectedArea)
  if (!selected_cell) return;
  // console.log(selected_cell)

  const row = selected_cell[0];
  const col = selected_cell[1];

  for (let r = 0; r < partialdata.length; r++) {
    for (let c = 0; c < partialdata[r].length; c++) {
      const tr = row + r;
      const tc = col + c;

      let cell = getCellByPos(tr, tc);

      // 👇 auto-grow
      if (!cell) {
        ensureGridSize(tr, tc);
        cell = getCellByPos(tr, tc);
      }
      cell.textContent = partialdata[r][c] ?? "";
    }
  }
}

export function getCellByPos(row, col) {
  return CONTAINER.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

// sanitize grid
export function setCellContent(cell, value) {
  if (value == null) return;

  const allowed = ["B", "I", "U", "H"];

  const template = document.createElement("template");
  template.innerHTML = value;

  const walker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_ELEMENT
  );

  let node;
  while ((node = walker.nextNode())) {
    if (!allowed.includes(node.tagName)) {
      node.replaceWith(...node.childNodes);
    }
  }

  cell.innerHTML = "";
  cell.appendChild(template.content);
}
