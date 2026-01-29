import { formatEpoch } from "./util";

const ANY_INFO = document.getElementById("info");

const FILANAME = document.getElementById("filename");
const LS_SAVED = document.getElementById("ls-time");

export const CONTAINER = document.getElementById("grid-container");
export const setInfo = (msg) => {
  if (ANY_INFO) {
    ANY_INFO.innerText = "";
    ANY_INFO.innerText = msg;
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
