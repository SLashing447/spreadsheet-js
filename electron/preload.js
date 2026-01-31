const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: (type) => ipcRenderer.invoke("open-file", type),
  // openCSS: () => ipcRenderer.invoke("open-css"),

  saveFile: (data, name) => ipcRenderer.invoke("save-file", data, name),

  // Window controls
  minWn: () => ipcRenderer.send("window-minimize"),
  maxWn: () => ipcRenderer.send("window-maximize"),
  clWn: () => ipcRenderer.send("window-close"),

  // readTheme: (name) => ipcRenderer.invoke("read-user-file", "theme", name),

  readUserData: (name, type) =>
    ipcRenderer.invoke("read-user-file", type, name),

  writeUserData: (name, data, type) =>
    ipcRenderer.invoke("write-user-file", type, name, data),

  // writeScript: (name, js) =>
  //   ipcRenderer.invoke("write-user-file", "script", name, js),
});
