import { readUserData, writeUserData } from "./api";
import { getDbItem, setDbItem } from "./db";
import { getCellByPos } from "./util";
import { selected_cell } from "./values";

// Extension registry (loaded plugins in memory)
const loadedExtensions = {};

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

async function removeFromUserPlugins(name) {
  const up = (await getDbItem("userplugins")) || [];
  const filtered = up.filter((n) => n !== name);
  await setDbItem("userplugins", filtered);
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

  // Save to file
  await writeUserData(js_code, name, "plugins");

  // Track in IndexedDB
  await pushIntoUserPlugins(name);

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
export async function applyPluginByName(name) {
  try {
    // Skip if already loaded
    if (loadedExtensions[name]) {
      console.log(`Plugin ${name} already loaded`);
      return { success: true, cached: true };
    }

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
  await removeFromUserPlugins(name);
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

  const pl_btns = document.getElementById("pl-btns");

  const plugins = (await getDbItem("userplugins")) || [];
  plugins.push("std"); // have std on board always
  console.log(`Loading ${plugins.length} plugins...`);
  if (plugins.length === 0) {
    pl_btns.textContent = "No Plugins Available";
  }

  for (const name of plugins) {
    await applyPluginByName(name);
    const btn = document.createElement("button");
    btn.id = name;
    btn.textContent = name;
    pl_btns.appendChild(btn);
  }

  console.log(`✓ Loaded ${plugins.length} plugins`);
}

// ========== SPREADSHEET API ==========
let live_area = null;

function getCellTextByPos(row, col) {
  return getCellByPos(row, col)?.textContent;
}

function setCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos.row : selected_cell[0],
    pos ? pos.col : selected_cell[1]
  );
  if (cell && text) {
    cell.innerHTML = "";
    cell.textContent = text;
  }
}

function pushCellTextByPos(text, pos) {
  const cell = getCellByPos(
    pos ? pos.row : selected_cell[0],
    pos ? pos.col : selected_cell[1]
  );
  if (cell && text) {
    cell.textContent += text;
  }
}

export function setLiveSelectingArea(area) {
  live_area = area;
}

// ========== COMMAND HANDLER ==========
export async function handleCommand(text) {
  const cleanText = text.startsWith("/") ? text.slice(1) : text;

  // Combine all loaded extensions
  const extensionCode = Object.values(loadedExtensions).join("\n\n");

  const safeApi = new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === "constructor" || prop === "__proto__") {
          return undefined;
        }

        if (prop === "selectedArea") return live_area;
        if (prop === "command") return text;
        if (prop === "getCellTextByPos") return getCellTextByPos;
        if (prop === "setCellTextByPos") return setCellTextByPos;
        if (prop === "pushCellTextByPos") return pushCellTextByPos;

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
      const {getCellTextByPos, setCellTextByPos, pushCellTextByPos} = api;
      
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
