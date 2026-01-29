import { decode } from "@msgpack/msgpack";
import { clearDb } from "../scripts/db";

import { exportAndDownloadFile, loadFile, setPrintMode } from "../scripts/util";
import { generateGrid } from "./Grid";

import "./styles/toolbar.css";
import { setHasDataFlag } from "../scripts/values";
const lf_btn = document.getElementById("lf");
const sf_btn = document.getElementById("sf");
const prf_btn = document.getElementById("prf");
const clr_btn = document.getElementById("clr");
const wipe = document.getElementById("wp-mem");

const fileUp = document.getElementById("file");

fileUp.addEventListener("change", async () => {
  const files = fileUp.files; // FileList

  if (!files.length) return;

  const file = files[0];

  const buffer = await file.arrayBuffer();

  await loadFile(new Uint8Array(buffer));
});

lf_btn.addEventListener("click", () => {
  fileUp.click();
});

wipe.addEventListener("click", async () => {
  setHasDataFlag(false);
  await clearDb();
});

clr_btn.addEventListener("click", () => {
  generateGrid();
});

prf_btn.addEventListener("click", () => {
  setPrintMode(true);
});
sf_btn.addEventListener("click", async () => {
  await exportAndDownloadFile();
});
