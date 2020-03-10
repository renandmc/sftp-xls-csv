const fs = require('fs');

function listFiles(path) {
  return fs.readdirSync(path);
}

function deleteFile(file) {
  console.log(`Delete ${file}`);
  console.log('');
  return fs.unlinkSync(file);
}

function saveFile(path, data) {
  return fs.writeFileSync(path, data);
}

function deleteAll(path) {
  for (file of listFiles(path)) {
    return deleteFile(file);
  }
}

module.exports = {listFiles, deleteFile, saveFile, deleteAll};