import { decode, encode } from "@msgpack/msgpack";
import { getDbItem, setDbItem } from "./db";
import { sanitize } from "./extract";
import { renderPrintTable } from "../lib/Print";
import { generateGrid } from "../lib/Grid";
import { setFileName, setHasDataFlag, setInfo, setLsTime } from "./values";

export function cellsToFillScreen(cellWidth = 80, cellHeight = 30) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const col = Math.ceil(screenWidth / cellWidth);
  const row = Math.ceil(screenHeight / cellHeight);

  return [row - 10, col - 1];
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
  const data = sanitize(false);
  if (data) {
    const fileName = document.getElementById("filename").innerText;
    const name = fileName ? fileName : "untitled";
    const now = Date.now();
    const lsShow = document.getElementById("ls-time");
    lsShow.innerText = formatEpoch(now);

    await setDbItem("name", name);

    await setDbItem("data", encode(data));
    await setDbItem("ls", now);
    setHasDataFlag(true);

    setInfo("Saved 💾");
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
  isPrintMode = on;
  if (on) {
    document
      .querySelectorAll(".no-print")
      .forEach((d) => (d.style.display = "none"));
    document.body.style.backgroundColor = "var(--pr-bg)";
    document.getElementById("print-container").style.display = "flex";
    requestAnimationFrame(() => {
      renderPrintTable(sanitize(false), "print-container");
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
}

//  export to file

export async function exportAndDownloadFile() {
  // save grid first
  await save_grid();

  const headers = await getDbItem("headers");
  const name = await getDbItem("name");
  const _data = await getDbItem("data");
  const time = await getDbItem("ls");

  const data = {
    name,
    time,
    headers: headers,
    data: _data,
  };

  // 1. Serialize to bytes
  const bytes = encode(data);

  // 2. Create Blob from bytes
  const blob = new Blob([bytes], { type: "application/octet-stream" });

  // 3. Create download URL
  const url = URL.createObjectURL(blob);

  // 4. Trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();

  // 5. Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 100);
}

export async function loadFile(buf) {
  try {
    const { name, time, headers, data } = decode(buf);
    if (!name || !time || !headers || !data) {
      setInfo("Cannot Load file corrupted :(");
      throw new Error("Error While loading file");
    }

    headers.forEach((el, i) => {
      document.getElementById(`pch${i + 1}`).innerText = el;
    });

    // recompute grid
    generateGrid(decode(data));
    setLsTime(time);
    setFileName(name);

    setInfo("File View Mode (Unsaved)");
  } catch (e) {
    setInfo("Error In loading file :(");
    throw new Error("Error While loading file");
  }
}
export function calSelArea(ar) {
  const arr = ar ?? selectedArea;
  return (arr.row2 - arr.row1 + 1) * (1 + arr.col2 - arr.col1);
}
