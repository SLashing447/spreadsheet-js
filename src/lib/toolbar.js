import { clearDb } from "../scripts/db";
import {
  applyThemeByName,
  createNewUserTheme,
  removeUserTheme,
} from "../scripts/theme_utils";
import {
  exportAndDownloadFile,
  getElementeByPos,
  loadFile,
  setPrintMode,
} from "../scripts/util";
import { generateGrid } from "./Grid";

import "./styles/toolbar.css";
import { selected_cell, setHasDataFlag } from "../scripts/values";
import { openCSS, openFile } from "../scripts/api";

const home_pn = document.getElementById("home-pn"); //0
const th_pn = document.getElementById("th-pn"); // 1
let pannel = 0;

document.getElementById("lf").addEventListener("click", async () => {
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

document.getElementById("wp-mem").addEventListener("click", async () => {
  setHasDataFlag(false);
  await clearDb();
});

document.getElementById("clr").addEventListener("click", () => {
  generateGrid();
});

document.getElementById("prf").addEventListener("click", () => {
  setPrintMode(true);
});
document.getElementById("sf").addEventListener("click", async () => {
  await exportAndDownloadFile();
});

// decor thing
document.querySelectorAll(".decor").forEach((el) =>
  el.addEventListener("click", (e) => {
    // console.log(e.id);\
    if (!selected_cell) return;

    const cell = getElementeByPos(selected_cell[0], selected_cell[1]);

    if (!cell) return;

    toggleWrap(cell, el.id);
  })
);

function toggleWrap(el, tag = "b") {
  const first = el.firstElementChild;

  // 🔓 unwrap
  if (
    first &&
    first.tagName.toLowerCase() === tag &&
    first.nextSibling === null // ensure it's the ONLY wrapper
  ) {
    while (first.firstChild) {
      el.insertBefore(first.firstChild, first);
    }
    first.remove();
    return;
  }

  // 🔒 wrap
  const wrapper = document.createElement(tag);
  while (el.firstChild) {
    wrapper.appendChild(el.firstChild);
  }
  el.appendChild(wrapper);
}

// document.getElementById("th").addEventListener("click", (e) => {});
document.getElementById("th").addEventListener("click", () => {
  if (pannel === 0) {
    pannel = 1;
    home_pn.classList.add("hidden");
    th_pn.classList.remove("hidden");
  }
});

document.getElementById("bth").addEventListener("click", () => {
  if (pannel === 1) {
    pannel = 0;

    home_pn.classList.remove("hidden");
    th_pn.classList.add("hidden");
  }
});

document.getElementById("upcss").addEventListener("click", async () => {
  const css = await openCSS();

  if (css) {
    const root = css.css;

    // console.log(root);
    createNewUserTheme(root, css.name.split(".")[0]);
  }
  // if (pannel === 1) {
  //   pannel = 0;
  //   home_pn.classList.remove("hidden");
  //   th_pn.classList.add("hidden");
  // }
});

document.getElementById("th-btns").addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.id;

  // console.log(id);
  await applyThemeByName(id);
});

document.getElementById("th-btns").addEventListener("mousedown", async (e) => {
  if (e.button !== 1) return;

  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.id;
  if (id.split("-")[0].toLowerCase() !== "usertheme") return;

  await removeUserTheme(id);
});
