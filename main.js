const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const { encode, decode, decodeQrcode } = require("./src/tools/index");
const path = require("path");
const random = require("string-random");
const qr = require("qrcode");
const unhandled = require("electron-unhandled");

function createWindow() {
  unhandled({
    showDialog: true,
  });

  const global = {
    action: "encode",
    file: "",
    keyImg: "",
  };

  const win = new BrowserWindow({
    width: 300,
    height: 550,
    darkTheme: true,
    resizable: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  win.loadFile("index.html");

  ipcMain.on("minus", () => {
    win.minimize();
  });

  ipcMain.on("close", () => {
    win.close();
  });

  ipcMain.on("radio-encode", (event) => {
    global.action = "encode";
    global.file = "";
  });

  ipcMain.on("radio-decode", (event) => {
    global.action = "decode";
    global.file = "";
  });

  ipcMain.on("select-file", async (event) => {
    let filters = [];
    if (global.action === "encode") {
      filters.push({ name: "All Files", extensions: ["*"] });
    } else if (global.action === "decode") {
      filters.push({ name: "Custom File Type", extensions: ["encode"] });
    }
    console.log("filters", filters, global);
    const result = await dialog.showOpenDialog({
      title: "请选择需要加密的文件",
      filters,
      properties: ["openFile"],
    });

    if (result.filePaths.length > 0) {
      event.sender.send("select-file-result", result.filePaths);
      global.file = result.filePaths[0];
    }
  });

  ipcMain.on("select-img-file", async (event) => {
    const result = await dialog.showOpenDialog({
      title: "请选择二维码密钥",
      filters: [{ name: "Images", extensions: ["png"] }],
      properties: ["openFile"],
    });

    if (result.filePaths.length > 0) {
      event.sender.send("select-img-file-result", result.filePaths);
      global.keyImg = result.filePaths[0];
    }
  });

  ipcMain.on("start-action", async () => {
    console.log(global);

    if (!global.file) {
      dialog.showMessageBox(win, {
        type: "error",
        title: "提示",
        message: `请选择需要${
          global.action === "encode" ? "加" : "解"
        }密的文件！`,
      });
      return;
    }

    const folderPath = path.resolve(global.file, "..");
    const fileName = path.basename(global.file);

    if (global.action === "encode") {
      const key = random(64, { letters: "ABCDEF" });
      encode(
        global.file,
        path.resolve(folderPath, "encode", fileName + ".encode"),
        key
      );
      await qr.toFile(
        path.resolve(folderPath, "encode", fileName + ".key.png"),
        key
      );
      dialog.showMessageBox(win, {
        type: "info",
        title: "提示",
        message: "加密成功！加密文件在encode目录下。",
        detail: `${fileName + ".encode"}是加密后的文件，${
          fileName + ".key.png"
        }是二维码密钥（请妥善保管）。`,
      });
      shell.showItemInFolder(path.resolve(folderPath, "encode"));
    } else if (global.action === "decode") {
      if (!global.keyImg) {
        dialog.showMessageBox(win, {
          type: "error",
          title: "提示",
          message: "请选择二维码密钥！",
        });
        return;
      }
      decodeQrcode(global.keyImg, (key) => {
        const fileNameArr = fileName.split(".");
        fileNameArr.pop();
        decode(
          global.file,
          path.resolve(folderPath, fileNameArr.join(".")),
          key
        );
        dialog.showMessageBox(win, {
          type: "info",
          title: "提示",
          message: "解密成功！",
        });
        shell.showItemInFolder(folderPath);
      });
    }
  });

  ipcMain.on("reset-action", async () => {
    global.file = "";
    global.keyImg = "";
  });
}

app.whenReady().then(createWindow);

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
