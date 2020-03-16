const fs = require('fs');
const logger = require('./log');

function listFiles(path) {
  let files;
  logger.info(`List files [${path}]`);
  try {
    files = fs.readdirSync(path);
  } catch (err) {
    logger.error(`${err.message}`);
  }
  return files;
}

function deleteFile(file) {
  let res;
  logger.info(`Delete file [${file}]`);
  try {
    res = fs.unlinkSync(file); 
  } catch (err) {
    logger.error(`${err.message}`);
  }
  return res; 
}

function saveFile(path, data) {
  let res;
  logger.info(`Save file [${path}]`);
  try {
    res = fs.writeFileSync(path, data); 
  } catch (err) {
    logger.error(`${err.message}`);
  }
  return res; 
}

function deleteAll(path) {
  let res = [];
  for (file of listFiles(path)) {
    file = path + '/' + file;
    res.push(deleteFile(file));
  }
  return res;
}

module.exports = {listFiles, deleteFile, saveFile, deleteAll};