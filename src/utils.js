const fs = require('fs');

function listFiles(path) {
  let files;
  console.log(`List files [${path}]`);
  try {
    files = fs.readdirSync(path);
    console.log(`[${files.length}] file(s) loaded.`);
    for (file of files) {
      console.log(`- ${file}`);
    }
  } catch (err) {
    console.error(`${err.message}`);
  }
  return files;
}

function deleteFile(file) {
  let res;
  console.log(`Delete file [${file}]`);
  try {
    res = fs.unlinkSync(file); 
  } catch (err) {
    console.error(`${err.message}`);
  }
  return res; 
}

function saveFile(path, data) {
  let res;
  console.log(`Save file [${path}]`);
  try {
    res = fs.writeFileSync(path, data); 
  } catch (err) {
    console.error(`${err.message}`);
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