import { readUserData, writeUserData } from "../api";
import { getDbItem, setDbItem } from "../db";
import { selectedArea } from "../keybindings";
import { getCellByPos } from "../util";
import { selected_cell, setExtrasInfo, setInfo } from "../values";
import { getCommand } from "./cmdRegis";
import { setCellTextByPos } from "./plugin_api";

// Extension registry (loaded plugins in memory)
// const loadedExtensions = {};
const pl_btns = document.getElementById("pl-btns");

async function pushIntoUserPlugins(name) {}

async function unloadUserPlugin(name) {}

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
export async function createNewUserPlugin(js_code, name) {}

// Load std.js content at startup
async function loadStdLib() {
  const btn = document.createElement("button");
  btn.classList.add("sel");
  btn.textContent = "std";
  pl_btns.append(btn);
}

// ========== APPLY (LOAD) PLUGIN ==========
export async function applyPluginByName(name, dontload) {}

// ========== REMOVE PLUGIN (TODO) ==========
export async function removeUserPlugin(name) {}

// ========== LIST ALL PLUGINS ==========
export async function listAllPlugins() {}

// ========== LOAD ALL ON STARTUP ==========
export async function loadAllPluginsOnStartup() {
  await loadStdLib();
}

// ========== COMMAND HANDLER ==========
// src/main.js
// import { getCommand } from "./command_registry.js";

export async function handleCommand(text) {
  // 1. Parse Input
  // const cleanText = text.startsWith("/") ? text.slice(1) : text;
  // const [cmdName, ...args] = cleanText.split(" ");

  let cmdName, args;

  // Pattern: /command(arg1, arg2)
  const functionMatch = text.match(/^\/(\w+)\((.*)\)$/);

  if (functionMatch) {
    // 1. Handle "/add(1,2,3)" syntax
    cmdName = functionMatch[1];
    const rawArgs = functionMatch[2];

    // Split by comma, trim whitespace, remove empty slots (handles trailing commas)
    args = rawArgs
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  } else {
    // 2. Fallback to space-separated "/add 1 2 3" (Legacy support)
    const cleanText = text.startsWith("/") ? text.slice(1) : text;
    const parts = cleanText.split(" ");
    cmdName = parts[0];
    args = parts.slice(1);
  }

  // 2. Lookup Command
  const commandFn = getCommand(cmdName);

  if (commandFn) {
    try {
      // 3. Execute
      await commandFn(args);

      // return result;
    } catch (err) {
      console.error(`[${cmdName}] Error:`, err);
      return `Error: ${err.message}`;
    }
  } else {
    return `Unknown command: /${cmdName}`;
  }
}
