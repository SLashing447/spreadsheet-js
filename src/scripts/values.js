import { clearIntModeListerners } from "./plugin/plugin_api";
import { formatEpoch } from "./util";

const INFO = [
  document.getElementById("info1"),
  document.getElementById("info2"),
];

// pluggin is using the keyboard/mouse events
export let isInteractiveMode = false;

export function setIneractiveMode(m) {
  if (m) isInteractiveMode = m;
  else isInteractiveMode = !isInteractiveMode;

  if (m === false) {
    // clear listners
    clearIntModeListerners();
  }
}

const extras_info = document.getElementById("extras");

const FILANAME = document.getElementById("filename");
const LS_SAVED = document.getElementById("ls-time");

const FILE_INFO = document.getElementById("file-info");

export const setFileInfo = (data) => {
  if (FILE_INFO) {
    FILE_INFO.innerText = "";
    FILE_INFO.innerText = data;
  }
};

export const CONTAINER = document.getElementById("grid-container");

export const setExtrasInfo = (msg, type = 0) => {
  let data = extras_info.textContent.split("|");
  data[type] = msg;
  extras_info.textContent = data.join(" | ");
};

// to put toast
export const setInfo = (msg, type = 0, setType = "s") => {
  if (setType === "s") {
    INFO[type].textContent = msg;
  } else if (setType === "p") {
    INFO[type].textContent = ANY_INFO[type].textContent + msg;
  }
};

export const setFileName = (name) => {
  if (FILANAME) {
    FILANAME.innerText = "";
    FILANAME.innerText = name;
  }
};
export const getFileName = () => {
  if (FILANAME) {
    return FILANAME.innerText;
  }
};

export const setLsTime = (time) => {
  if (LS_SAVED) {
    LS_SAVED.innerText = "";
    LS_SAVED.innerText = time ? formatEpoch(time) : formatEpoch(Date.now());
  }
};
export const setHasDataFlag = (f) => {
  localStorage.setItem("data", f);
};
export const getHasDataFlag = () => {
  return localStorage.getItem("data");
};

export let selected_cell = [];

export function setSelectedCell(cell) {
  selected_cell = cell;
}
