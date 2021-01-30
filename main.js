const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const { encode, decode, decodeQrcode } = require("./src/tools/index");
const path = require("path");
const random = require("string-random");
const qr = require("qrcode");
const unhandled = require("electron-unhandled");

function createWindow() {
  unhandled({
    showDialog: true
  });
  const glob = {
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
    glob.action = "encode";
  });

  ipcMain.on("radio-decode", (event) => {
    glob.action = "decode";
  });

  ipcMain.on("select-file", async (event) => {
    const result = await dialog.showOpenDialog({
      title: "请选择需要加密的文件",
      filters: [{ name: "All Files", extensions: ["*"] }],
      properties: ["openFile"],
    });

    if (result.filePaths.length > 0) {
      event.sender.send("select-file-result", result.filePaths);
      glob.file = result.filePaths[0];
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
      glob.keyImg = result.filePaths[0];
    }
  });

  ipcMain.on("start-action", async () => {
    console.log(glob);

    if (!glob.file) {
      dialog.showMessageBox(win, {
        type: "error",
        title: "提示",
        message: "请选择需要加密的文件！",
      });
      return;
    }

    const folderPath = path.resolve(glob.file, "..");
    const fileName = path.basename(glob.file);

    if (glob.action === "encode") {
      const key = random(64, { letters: "ABCDEF" });
      encode(
        glob.file,
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
    } else if (glob.action === "decode") {
      if (!glob.keyImg) {
        dialog.showMessageBox(win, {
          type: "error",
          title: "提示",
          message: "请选择二维码密钥！",
        });
        return;
      }
      decodeQrcode(glob.keyImg, (key) => {
        decode(glob.file, path.resolve(folderPath, fileName + ".decode"), key);
        dialog.showMessageBox(win, {
          type: "info",
          title: "提示",
          message: "解密成功！",
        });
        shell.showItemInFolder(folderPath);
      });
    }
  });

  ipcMain.on('reset-action', async () => {
    glob.file = ''
    glob.keyImg = ''
  })
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
