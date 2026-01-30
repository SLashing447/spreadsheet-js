const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs").promises;
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL("http://localhost:5173");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// File API handlers
ipcMain.handle("open-file", async () => {
  try {
    const result = await dialog.showOpenDialog({
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
      data: Array.from(buffer), // Send as array for IPC
    };
  } catch (error) {
    return {
      canceled: false,
      error: error.message,
    };
  }
});

ipcMain.handle("save-file", async (event, arrayBuffer, defaultName) => {
  try {
    const result = await dialog.showSaveDialog({
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
    return {
      canceled: false,
      error: error.message,
    };
  }
});
