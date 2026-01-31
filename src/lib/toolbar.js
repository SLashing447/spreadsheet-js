import {
  applyThemeByName,
  createNewUserTheme,
  removeUserTheme,
} from "../scripts/theme_utils";
import {
  exportAndDownloadFile,
  getCellByPos,
  loadFile,
  setPrintMode,
} from "../scripts/util";

import "./styles/toolbar.css";
import { selected_cell, setHasDataFlag } from "../scripts/values";
import { openFile } from "../scripts/api";
import { applyPluginByName, createNewUserPlugin } from "../scripts/plugins";

const PANNELS = [
  document.getElementById("home-pn"), //0
  document.getElementById("th-pn"), // 1
  document.getElementById("pl-pn"), //2
];

// const home_pn = ; //0?

let pannel = 0;

// tittle bar options
document
  .getElementById("ttlbar-options")
  .addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.id;

    switch (id) {
      // openfile
      case "0": {
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
      }

      //save file
      case "1":
        await exportAndDownloadFile();
        break;
      case "2":
        setPrintMode(true);
        break;
      case "3":
        changePannel(1);
        break;

      case "4":
        changePannel(2);
        break;

      default:
        console.log("heelow");
        break;
    }
  });

// decor thing
document.getElementById("home-btns").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.id;

  if (!selected_cell) return;

  const cell = getCellByPos(selected_cell[0], selected_cell[1]);

  if (!cell) return;

  toggleWrap(cell, id);
});

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

function changePannel(to = 0) {
  if (pannel === to) return;

  PANNELS[pannel].classList.add("hidden");
  PANNELS[to].classList.remove("hidden");

  pannel = to;
}

// theme buttons
document.getElementById("th-pn").addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.className === "bpn") {
    changePannel(0);
    return;
  }

  const id = btn.id;

  if (id === "upcss") {
    const css = await openFile(1);

    if (css) {
      const root = css.data;

      // console.log(root);
      createNewUserTheme(root, css.name.split(".")[0]);
      return;
    }
  }

  // console.log(id);
  await applyThemeByName(id);
});

// plugin buttons
document.getElementById("pl-pn").addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.className === "bpn") {
    changePannel(0);
    return;
  }

  const id = btn.id;

  if (id === "uppl") {
    const js = await openFile(2);

    if (js) {
      const root = js.data;

      createNewUserPlugin(root, js.name.split(".")[0]);
      return;
    }
  }

  await applyPluginByName(id);
});

// to remove the themes
document.getElementById("th-btns").addEventListener("mousedown", async (e) => {
  if (e.button !== 1) return;

  const btn = e.target.closest("button");
  if (!btn) return;

  // if (btn.id.split("-")[0].toLowerCase() !== "usertheme") return;

  await removeUserTheme(btn.id);
});
