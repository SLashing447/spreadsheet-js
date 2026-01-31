import { readUserData, writeUserData } from "./api";
import { getDbItem, setDbItem } from "./db";
import { selectedArea } from "./keybindings";
import { getCellByPos } from "./util";
import { selected_cell, setInfo } from "./values";

// Extension registry (loaded plugins in memory)
const loadedExtensions = {};
const pl_btns = document.getElementById("pl-btns");

async function pushIntoUserPlugins(name) {
  const up = await getDbItem("userplugins");
  if (!up || up === null) {
    await setDbItem("userplugins", [name]);
  } else {
    // Avoid duplicates
    if (!up.includes(name)) {
      up.push(name);
      await setDbItem("userplugins", up);
    }
  }
}

async function unloadUserPlugin(name) {
  document.getElementById(name).classList.remove("sel");
  delete loadedExtensions[name];
  let ls = localStorage.getItem("skip-plugin");
  if (ls) {
    // ext already unloaded
    if (
      ls
        .split(",")
        .map((s) => s.trim())
        .includes(name)
    )
      return;
    ls += `,${name}`;
    localStorage.setItem("skip-plugin", ls);
  } else {
    localStorage.setItem("skip-plugin", name);
  }
}

// ========== VALIDATION ==========
function validateExtension(code) {
  try {
    new Function(code);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// ========== CREATE NEW PLUGIN ==========
export async function createNewUserPlugin(js_code, name) {
  const validation = validateExtension(js_code);
  if (!validation.valid) {
    throw new Error(`Invalid JS syntax in ${name}.js: ${validation.error}`);
  }

  const btn = document.createElement("button");
  btn.id = name;
  btn.textContent = name;
  btn.classList.add("sel");
  pl_btns.appendChild(btn);

  // Save to file
  await writeUserData(js_code, name, "plugins");

  // Track in IndexedDB
  await pushIntoUserPlugins(name);

  // Store in memory
  loadedExtensions[name] = js_code;

  console.log(`✓ Created plugin: ${name}`);
  return { success: true };
}

// Load std.js content at startup
async function loadStdLib() {
  try {
    // Fetch std.js from your project
    const response = await fetch("./src/plugins/std.js");
    return await response.text();
    // console.log("✓ Standard library loaded");
  } catch (error) {
    console.error("Failed to load std.js:", error);
  }
}

// ========== APPLY (LOAD) PLUGIN ==========
export async function applyPluginByName(name, dontload) {
  try {
    // unload if already loaded
    if (loadedExtensions[name]) {
      unloadUserPlugin(name);
      return { success: true, cached: true };
    }

    // check if its still unloaded and in locals
    if (!dontload) {
      const skiped = localStorage.getItem("skip-plugin");
      if (skiped) {
        localStorage.setItem(
          "skip-plugin",
          skiped
            .split(",")
            .map((s) => s.trim())
            .filter((x) => x && x !== name)
            .join(",")
        );
      }
    }

    const prevbtn = document.getElementById(name);
    if (prevbtn) {
      if (!dontload) prevbtn.classList.add("sel");
    } else {
      const btn = document.createElement("button");
      btn.id = name;
      if (!dontload) btn.classList.add("sel");
      btn.textContent = name;
      pl_btns.appendChild(btn);
    }

    if (dontload === true) return;
    // Read from file
    let js;
    if (name === "std") {
      js = await loadStdLib();
    } else {
      const result = await readUserData(name, "plugins");
      js = result.data;
      const validation = validateExtension(js);
      if (!validation.valid) {
        throw new Error(`Invalid JS syntax in ${name}.js: ${validation.error}`);
      }
    }

    // Store in memory
    loadedExtensions[name] = js;

    console.log(`✓ Applied plugin: ${name}`);
    // return { success: true, cached: false };
  } catch (error) {
    console.error(`Failed to apply plugin ${name}:`, error);
    // return { success: false, error: error.message };
  }
}

// ========== REMOVE PLUGIN (TODO) ==========
export async function removeUserPlugin(name) {
  // TODO: Implement file deletion via your API
  delete loadedExtensions[name];
  await unloadUserPlugin(name);
  console.log(`✓ Removed plugin: ${name}`);
}

// ========== LIST ALL PLUGINS ==========
export async function listAllPlugins() {
  const plugins = (await getDbItem("userplugins")) || [];
  return plugins.map((name) => ({
    name,
    loaded: !!loadedExtensions[name],
  }));
}

// ========== LOAD ALL ON STARTUP ==========
export async function loadAllPluginsOnStartup() {
  // load std

  const plugins = (await getDbItem("userplugins")) || [];
  plugins.push("std"); // have std on board always
  console.log(`Available :  ${plugins.length} plugins...`);
  if (plugins.length === 0) {
    pl_btns.textContent = "No Plugins Available";
  }

  const exclude_pl = localStorage
    .getItem("skip-plugin")
    ?.split(",")
    .map((s) => s.trim());

  let loaded_plug = 0;
  for (const name of plugins) {
    // exlcude plugins
    const load = exclude_pl?.includes(name);
    if (load) loaded_plug++;

    await applyPluginByName(name, load);
  }

  console.log(`✓ Loaded ${loaded_plug} plugins`);
}

// ========== SPREADSHEET API ==========

function getCellTextByPos(row, col) {
  return getCellByPos(row, col)?.textContent;
}

function setCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos[0] : selected_cell[0],
    pos ? pos[1] : selected_cell[1]
  );
  if (cell && text) {
    cell.innerHTML = "";
    cell.textContent = text;
  }
}

function pushCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos[0] : selected_cell[0],
    pos ? pos[1] : selected_cell[1]
  );
  if (cell && text) {
    cell.textContent += text;
  }
}
// ========== Interactive Mode ==========

// Support multiple simultaneous watchers
const watchers = {
  area: null,
  key: null,
};

export function setLiveSelectingArea(area) {
  // Trigger area watchers
  if (watchers.area) {
    try {
      watchers.area(area);
    } catch (error) {
      console.error("Area watcher error:", error);
    }
  }
}

// For keyboard events (add to your keybindings)
export function triggerKeyWatcher(event) {
  if (event.key === "Escape") {
    stopWatching();
  }
  if (watchers.key && event.key !== "Escape") {
    try {
      watchers.key(event);
    } catch (error) {
      console.error("Key watcher error:", error);
    }
  }
}

// Stop all or specific watcher
export function stopWatching(type = null) {
  if (type) {
    watchers[type] = null;
    console.log(`✓ Stopped watching ${type}`);
  } else {
    setInfo("Interactive Mode Disabled", 2);
    Object.keys(watchers).forEach((key) => (watchers[key] = null));
    console.log("✓ Stopped all watchers");
  }
}
// ========== COMMAND HANDLER ==========
export async function handleCommand(text) {
  const cleanText = text.startsWith("/") ? text.slice(1) : text;

  // Combine all loaded extensions
  const extensionCode = Object.values(loadedExtensions).join("\n\n");

  if (!extensionCode) return;

  const safeApi = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === "constructor" || prop === "__proto__") {
          return undefined;
        }

        if (prop === "cell") return selected_cell;
        if (prop === "area") return selectedArea;
        if (prop === "command") return text;
        if (prop === "getCellTextByPos") return getCellTextByPos;
        if (prop === "setCellTextByPos") return setCellTextByPos;
        if (prop === "pushCellTextByPos") return pushCellTextByPos;

        // NEW: Register interactive listener
        if (prop === "watch")
          return () => {
            setInfo("Interactive Mode Enabled", 2);
            return {
              area: (callback) => {
                watchers.area = callback;
                console.log("✓ Watching area (Escape to stop)");
                // if (live_area) callback(live_area);
              },

              //   cell: (row, col, callback) => {
              //     const key = `${row},${col}`;
              //     watchers.cell.set(key, callback);
              //     console.log(`✓ Watching cell (${row}, ${col})`);
              //     // Trigger immediately with current value
              //     const value = getCellTextByPos(row, col);
              //     if (value !== null) callback(value);
              //   },

              key: (callback) => {
                watchers.key = callback;
                console.log("✓ Watching keyboard");
              },
            };
          };

        if (prop === "stop") return (type) => stopWatching(type);

        return undefined;
      },
      set() {
        return false;
      },
    }
  );

  try {
    const userFunc = new Function(
      "api",
      `
      'use strict';
      const {getCellTextByPos, setCellTextByPos, pushCellTextByPos, watch,stop} = api;
      
      // Block dangerous globals
      const window = undefined;
      const document = undefined;
      const globalThis = undefined;
      const self = undefined;
      
      // Block network APIs
      const fetch = undefined;
      const XMLHttpRequest = undefined;
      const WebSocket = undefined;
      const EventSource = undefined;
      
      // Block storage APIs
      const localStorage = undefined;
      const sessionStorage = undefined;
      const indexedDB = undefined;
      
      // Block navigation/location
      const location = undefined;
      const history = undefined;
        


      // INJECT  EXTENSIONS HERE
      ${extensionCode}
      
      // USER COMMAND
      ${cleanText}
      `
    );

    userFunc(safeApi);
  } catch (error) {
    console.error("Script execution error:", error);
  }
}
