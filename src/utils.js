const fs = require('fs');

function listFiles(path) {
  return fs.readdirSync(path);
}

function deleteFile(file) {
  return fs.unlinkSync(file);
}

function saveFile(path, data) {
  return fs.writeFileSync(path, data);
}

module.exports = {listFiles, deleteFile, saveFile};