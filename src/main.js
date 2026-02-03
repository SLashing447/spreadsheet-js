import { generateGrid } from "./lib/Grid";
import "./lib/toolbar";
import "./scripts/keybindings";
import { getDbItem } from "./scripts/db";
import { decode } from "@msgpack/msgpack";
import {
  setFileName,
  setInfo,
  setLsTime,
  getHasDataFlag,
} from "./scripts/values";
import { loadTheme } from "./scripts/theme";
import { loadAllPluginsOnStartup } from "./scripts/plugin/plugins";
// import { loadAllPluginsOnStartup } from "./scripts/plugins";
// import { loadTheme } from "./scripts/util";

// Wrap your initialization
document.addEventListener("DOMContentLoaded", async () => {
  await init();

  requestAnimationFrame(() => {
    document.body.classList.add("loaded");
  });
});

async function init() {
  // load theme

  await loadTheme();
  await loadAllPluginsOnStartup();

  if (getHasDataFlag() === "true") {
    const _data = await getDbItem("data");
    const ls = await getDbItem("ls");
    const fName = await getDbItem("name");
    console.log(fName, ls);

    setFileName(fName);
    setLsTime(ls);

    // setInfo("Welcome!!");

    const data = decode(_data);

    // const row = data.length;
    // const col = data[0].length;

    // console.log(row, col);
    generateGrid(data);
  } else {
    setLsTime();

    generateGrid(null);
  }
}
