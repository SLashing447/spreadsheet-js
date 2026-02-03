// src/command_registry.js
import * as StdCommands from "../../../resources/plugins/std";

// Initialize with Standard Commands
const registry = {
  ...StdCommands, // { sum: fn, clear: fn, help: fn }
};

export function registerCommand(name, fn) {
  registry[name] = fn;
}

export function getCommand(name) {
//   console.log(registry);
  return registry[name];
}

export function getAllCommands() {
  return Object.keys(registry);
}
