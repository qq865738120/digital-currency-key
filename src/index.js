const fs = require("fs");
const qr = require("qr-image");
const inquirer = require("inquirer");
const { dialog } = require('electron')
console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))


inquirer
  .prompt([
    {
      type: "list",
      name: "action",
      message: (message) => {
        return '你是想加密还是解密？'
      },
      suffix: '（试试键盘⬆、⬇键）',
      choices: [
        {
          name: "加密",
          value: 'encode'
        },
        {
          name: "解密",
          value: 'decode'
        },
      ],
    },
  ])
  .then((answers) => {
    console.log(JSON.stringify(answers, null, "  "));
  });
