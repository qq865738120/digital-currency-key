const { ipcRenderer, remote } = require("electron");

document.querySelector("#minus-btn").onclick = () => {
  ipcRenderer.send("minus");
};

document.querySelector("#close-btn").onclick = () => {
  ipcRenderer.send("close");
};

document.querySelector("#radio-encode").onclick = () => {
  ipcRenderer.send("radio-encode");
  document.querySelector("#img-box").setAttribute("style", "display: none");
  document.querySelector("#file-label").innerHTML = "待加密文件";
  document.querySelector("#selected-file-display").innerHTML = '';
};

document.querySelector("#radio-decode").onclick = () => {
  ipcRenderer.send("radio-decode");
  document.querySelector("#img-box").setAttribute("style", "display: block");
  document.querySelector("#file-label").innerHTML = "已加密文件";
  document.querySelector("#selected-file-display").innerHTML = '';
};

document.querySelector("#selected-file-btn").onclick = () => {
  ipcRenderer.send("select-file");
};

ipcRenderer.on("select-file-result", (event, files) => {
  document.querySelector("#selected-file-display").innerHTML = files;
});

document.querySelector("#selected-img-btn").onclick = () => {
  ipcRenderer.send("select-img-file");
};

ipcRenderer.on("select-img-file-result", (event, files) => {
  document.querySelector("#selected-img-display").innerHTML = files;
});

document.querySelector("#start-action").onclick = () => {
  ipcRenderer.send("start-action");
};

document.querySelector("#reset-action").onclick = () => {
  ipcRenderer.send("reset-action");
  document.querySelector("#selected-file-display").innerHTML = "";
  document.querySelector("#selected-img-display").innerHTML = "";
};
