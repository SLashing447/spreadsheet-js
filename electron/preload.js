const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveFile: (data, name) => ipcRenderer.invoke("save-file", data, name),
});
