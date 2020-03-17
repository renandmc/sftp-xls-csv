const xlsx = require('node-xlsx');
const utils = require('./utils');

const config = require('../config.json');

const xlsPath = config.xlsfolder;
const csvPath = config.csvfolder;

async function convertFile(file) {
  let xlsFile = xlsPath + '/' + file;
  let obj = xlsx.parse(xlsFile);
  let rows = [], writeStr = "";
  for (let i = 0; i < obj.length; i++) {
    let sheet = obj[i];
    for (var j = 0; j < sheet['data'].length; j++) {
      rows.push(sheet['data'][j]);
    }
  }
  for (let i = 0; i < rows.length; i++) {
    writeStr += rows[i].join(",") + "\n";
  }
  let filename = file.replace(".xlsx", "").replace(".xls", "");
  let date = () => {
    let date = new Date();
    let year = date.getFullYear();
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let day = `${date.getDate()}`.padStart(2, '0');
    let hour = `${date.getHours()}`.padStart(2, '0');
    let min = `${date.getMinutes()}`.padStart(2, '0');
    let sec = `${date.getSeconds()}`.padStart(2, '0');
    return `${year}-${month}-${day}-${hour}-${min}-${sec}`;
  }
  let csvFile = `${csvPath}/${filename}-${date()}.csv`;
  console.log(`XLS [${xlsFile}] --> CSV [${csvFile}]`);
  try{
    utils.saveFile(csvFile, writeStr);
  } catch (err) {
    console.error(`${err.message}`);
  }
  return csvFile;
}

function convertAll() {
  let files = utils.listFiles(xlsPath);
  for (let file of files) {
    convertFile(file);
  }
}

module.exports = {convertFile, convertAll};