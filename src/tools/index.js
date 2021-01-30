const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * 加密函数
 * @param inputFilePath  需要加密文件路径
 * @param outputFilePath  保存加密数据的文件路径
 * @param key   秘钥
 * @returns {Query|*}  密文
 */
function encode(inputFilePath, outputFilePath, key) {
  const folderPath = path.resolve(outputFilePath, "..");
  try {
    const stats = fs.statSync(folderPath);
    console.log(stats.isDirectory());
  } catch (error) {
    console.log(error);
    fs.mkdirSync(folderPath);
  }

  var secret = key || "asdhjwheru*asd123&123";
  var cipher = crypto.createCipher("aes-256-cbc", secret);
  var input = fs.createReadStream(inputFilePath);
  var output = fs.createWriteStream(outputFilePath);

  input.pipe(cipher).pipe(output);

  output.on("finish", function () {
    console.log("Encrypted file written to disk!");
  });
}
module.exports.encode = encode;

/**
 * 解密函数
 * @param inputFilePath  需要解密的文件路径
 * @param outputFilePath  保存解密数据的文件路径
 * @param key   秘钥
 * @returns {Query|*}
 */
function decode(inputFilePath, outputFilePath, key) {
  var secret = key || "asdhjwheru*asd123&123";
  var decipher = crypto.createDecipher("aes-256-cbc", secret);
  var input = fs.createReadStream(inputFilePath);
  var output = fs.createWriteStream(outputFilePath);

  input.pipe(decipher).pipe(output);

  output.on("finish", function () {
    console.log("Encrypted file written to disk!");
  });
}
module.exports.decode = decode;

const jimp = require("jimp");
const qrcodeReader = require("qrcode-reader");

/**
 * 解码二维码图片
 *
 * @param {*} filePath  文件路径
 * @param {*} callback  结果回掉
 */
function decodeQrcode(filePath, callback) {
  try {
    // const fileBuffer = fs.readFileSync(filePath);
    // const fileBuffer = sharp(filePath).png().toBuffer()
    jimp.read(filePath, (error, image) => {
      if (error) {
        throw new Error(error);
      }
      let decodeQR = new qrcodeReader();
      decodeQR.callback = function (errorWhenDecodeQR, result) {
        if (errorWhenDecodeQR) {
          throw new Error(errorWhenDecodeQR);
        }
        if (!result) {
          console.log("gone with wind");
        } else {
          callback(result.result);
        }
      };
      decodeQR.decode(image.bitmap);
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports.decodeQrcode = decodeQrcode;
