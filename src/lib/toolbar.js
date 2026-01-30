import { decode } from "@msgpack/msgpack";
import { clearDb } from "../scripts/db";

import { exportAndDownloadFile, loadFile, setPrintMode } from "../scripts/util";
import { generateGrid } from "./Grid";

import "./styles/toolbar.css";
import { setHasDataFlag } from "../scripts/values";
import { openFile } from "../scripts/api";

const lf_btn = document.getElementById("lf");
const sf_btn = document.getElementById("sf");
const prf_btn = document.getElementById("prf");
const clr_btn = document.getElementById("clr");
const wipe = document.getElementById("wp-mem");
// const fileUp = document.getElementById("file");

// fileUp.addEventListener("change", async () => {
//   const files = fileUp.files; // FileList

//   if (!files.length) return;

//   const file = files[0];

//   const buffer = await file.arrayBuffer();

//   // console.log(file)

//   await loadFile(new Uint8Array(buffer), file.name);
// });

lf_btn.addEventListener("click", async () => {
  try {
    const result = await openFile();

    if (!result) {
      console.log("Open cancelled");
      return;
    }

    await loadFile(result.data, result.name);
  } catch (error) {
    console.error("Open failed:", error);
  }
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
