const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs").promises;
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // Window controls - after window is created
  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on("window-maximize", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("window-close", () => {
    if (mainWindow) mainWindow.close();
  });

  // File handlers
  ipcMain.handle("open-file", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "All Files", extensions: ["*"] }],
      });

      if (result.canceled || !result.filePaths.length) {
        return { canceled: true };
      }

      const filePath = result.filePaths[0];
      const buffer = await fs.readFile(filePath);

      return {
        canceled: false,
        name: path.basename(filePath),
        path: filePath,
        data: Array.from(buffer),
      };
    } catch (error) {
      return { canceled: false, error: error.message };
    }
  });

  ipcMain.handle("open-css", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "CSS", extensions: ["css"] }],
      });

      if (result.canceled || !result.filePaths.length) {
        return { canceled: true };
      }

      const filePath = result.filePaths[0];
      const cssText = await fs.readFile(filePath, "utf8");
      return {
        canceled: false,
        name: path.basename(filePath),
        path: filePath,
        css: cssText,
      };
    } catch (error) {
      return { canceled: false, error: error.message };
    }
  });

  ipcMain.handle("save-file", async (event, arrayBuffer, defaultName) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName || "untitled",
        filters: [{ name: "All Files", extensions: ["*"] }],
      });

      if (result.canceled) {
        return { canceled: true };
      }

      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(result.filePath, buffer);

      return {
        canceled: false,
        name: path.basename(result.filePath),
        path: result.filePath,
      };
    } catch (error) {
      return { canceled: false, error: error.message };
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
