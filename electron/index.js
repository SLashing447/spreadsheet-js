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

app.whenReady().then(async () => {
  const userDir = app.getPath("userData");

  const THEMES_DIR = path.join(userDir, "themes");
  const PLUGINS_DIR = path.join(userDir, "plugins");

  await fs.mkdir(THEMES_DIR, { recursive: true });
  await fs.mkdir(PLUGINS_DIR, { recursive: true });

  // Window controls - after window is created
  ipcMain.on("window-minimize", () => {
    if (mainWindow) mainWindow.minimize();
  });

  createWindow();

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
  ipcMain.handle("open-file", async (type = 0) => {
    try {
      // type 1 css , type 2 js , type 0 bin

      let name = "All Files";
      let ext = "*";
      if (type === 1) {
        name = "CSS Files";
        ext = "css";
      } else if (type === 2) {
        name = "JavaScript";
        ext = "js";
      } else if (type > 2) {
        return;
      }

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name, extensions: ext }],
      });

      if (result.canceled || !result.filePaths.length) {
        return { canceled: true };
      }

      const filePath = result.filePaths[0];
      const content = await fs.readFile(
        filePath,
        type === 0 ? undefined : "utf-8"
      );

      return {
        canceled: false,
        name: path.basename(filePath),
        path: filePath,
        data: type === 0 ? Array.from(content) : content,
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

  // read files
  ipcMain.handle("read-user-file", async (_, type, filename) => {
    try {
      const baseDir =
        type === "themes"
          ? THEMES_DIR
          : type === "plugins"
          ? PLUGINS_DIR
          : null;

      if (!baseDir) {
        return { error: "Invalid file type" };
      }

      if (type === "themes") {
        if (!filename.toLowerCase().endsWith(".css")) {
          filename += ".css";
        }
      } else if (type === "plugins") {
        if (!filename.toLowerCase().endsWith(".js")) {
          filename += ".js";
        }
      }
      // filename safety
      if (filename.includes("..") || filename.includes("/")) {
        return { error: "Invalid filename" };
      }

      const filePath = path.join(baseDir, filename);

      // extra safety
      if (!filePath.startsWith(baseDir)) {
        return { error: "Invalid path" };
      }

      const data = await fs.readFile(filePath, "utf8");

      return {
        success: true,
        name: filename,
        data,
        path: filePath,
      };
    } catch (err) {
      console.error("[read-user-file]", err);
      return { error: err.message };
    }
  });

  // dump files
  ipcMain.handle("write-user-file", async (_, type, filename, content) => {
    try {
      const baseDir =
        type === "themes"
          ? THEMES_DIR
          : type === "plugins"
          ? SCRIPTS_DIR
          : null;

      if (!baseDir) {
        return { error: "Invalid file type" };
      }

      if (type === "themes") {
        if (!filename.toLowerCase().endsWith(".css")) {
          filename += ".css";
        }
      } else if (type === "plugins") {
        if (!filename.toLowerCase().endsWith(".js")) {
          filename += ".js";
        }
      }

      if (filename.includes("..") || filename.includes("/")) {
        return { error: "Invalid filename" };
      }

      const filePath = path.join(baseDir, filename);

      await fs.mkdir(baseDir, { recursive: true });
      await fs.writeFile(filePath, content, "utf8");

      return {
        success: true,
        path: filePath,
      };
    } catch (err) {
      console.error("[write-user-file]", err);
      return { error: err.message };
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
