const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveFile: (data, name) => ipcRenderer.invoke("save-file", data, name),

  // Window controls
  minWn: () => ipcRenderer.send("window-minimize"),
  maxWn: () => ipcRenderer.send("window-maximize"),
  clWn: () => ipcRenderer.send("window-close"),
});
