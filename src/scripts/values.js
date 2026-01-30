import { formatEpoch } from "./util";

const ANY_INFO = document.getElementById("info");

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
let infoVersion = 0;
let messageStack = [];

export const setInfo = (msg, timeout = 0) => {
  if (!ANY_INFO) return;

  // skip exact duplicates (top of stack)
  const last = messageStack.at(-1);
  if (last && last.msg === msg) return;

  const version = ++infoVersion;

  const entry = {
    msg,
    version,
    prev: ANY_INFO.innerText,
  };

  messageStack.push(entry);
  ANY_INFO.innerText = msg;

  if (timeout > 0) {
    setTimeout(() => {
      // only act if still relevant
      if (version !== infoVersion) return;

      messageStack.pop();
      const restore = messageStack.at(-1);

      ANY_INFO.innerText = restore ? restore.msg : entry.prev;
    }, timeout);
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

CONTAINER.addEventListener("mousedown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  // const row = ;??

  selected_cell = [+cell.dataset.row, +cell.dataset.col];
});
