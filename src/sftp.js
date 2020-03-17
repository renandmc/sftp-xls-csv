const fs = require('fs');
const Client = require('ssh2-sftp-client');
const utils = require('./utils');

const config = require('../config.json');

const xlsPath = config.xlsfolder;
const csvPath = config.csvfolder;
const fileType = config.type;
const sftp = new Client();

function getConfig(inOut = 'in') {
  if (inOut === 'in') {
    return config.in;
  } else {
    return config.out;
  }
}

async function openConnection(inOut = 'in') {
  try{
    console.log(`Connect SFTP [${getConfig(inOut).host.host}]`);
    await sftp.connect(getConfig(inOut).host);
    return true;
  } catch (err) {
    console.error(`${err.message}`);
    return false;
  }
}

async function closeConnection(inOut = 'in') {
  try {
    console.log(`Close SFTP [${getConfig(inOut).host.host}]`);
    await sftp.end();
    return true;
  } catch (err) {
    console.error(`${err.message}`);
    return false;
  }
}

async function listFiles(inOut = 'in') {
  let res = [], options;
  options = `^.*\.(${fileType.toLowerCase()}|${fileType.toUpperCase()})$`;
  if (await openConnection(inOut)) {
    try {
      console.log(`List files SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      res = await sftp.list(getConfig(inOut).path, options);
      if (res.length === 0) {
        console.error(`Files not found [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      } else {
        console.log(`[${res.length}] file(s) loaded.`);
        for (item of res) {
          console.log(`- ${item.name}`);
        }
      }
    } catch (err) {
      console.error(`${err.message}`);
    }
    await closeConnection();
  }
  return res;
}

async function downloadFile(file, inOut = 'in') {
  if (file.type === '-') {
    if (await openConnection(inOut)){
      let remoteFile = getConfig(inOut).path + '/' + file.name;
      let localFile = xlsPath + '/' + file.name;
      console.log(`Remote [${remoteFile}] --> Local [${localFile}]`);
      try {
        console.log(`Download SFTP [${getConfig(inOut).host.host}${remoteFile}]`);
        await sftp.fastGet(remoteFile, localFile);
      } catch (err) {
        console.error(`${err.message}`);
      }
      await closeConnection(inOut); 
    } else {
      console.error(`Param 'file' wrong, must be a file`);
    }
  }  
}

async function uploadFile(file, inOut = 'out') {
  if (await openConnection(inOut)) {
    let localFile = csvPath + '/' + file;
    let remoteFile = getConfig(inOut).path + '/' + file;
    console.log(`Local [${localFile}] --> Remote [${remoteFile}]`);
    try {
      console.log(`Upload SFTP [${getConfig(inOut).host.host}${remoteFile}]`);
      await sftp.fastPut(localFile, remoteFile);
    } catch (err) {
      console.error(`${err.message}`);
    }
    await closeConnection(inOut);
  }
}

async function downloadAll(inOut = 'in') {
  let files = await listFiles(inOut);
  if (files.length > 0) {
    for (let file of files) {
      await downloadFile(file, inOut);
    }
    return true;
  } else {
    console.error('Files not found. Nothing to download.');
    return false;
  }
}

async function uploadAll(inOut = 'out') {
  let files = utils.listFiles(csvPath);
  if (files.length > 0) {
    for (let file of files) {
      await uploadFile(file, inOut);
    }
    return true;
  } else {
    console.error('Files not found. Nothing to upload.');
    return false;
  }
}

async function downloadFolder(inOut = 'in') {
  if (await openConnection(inOut)) {
    try {
      console.log(`[${getConfig(inOut).path}] --> [${xlsPath}]`);
      console.log(`Download folder SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      await sftp.downloadDir(getConfig(inOut).path, xlsPath);
      await closeConnection(inOut);
    } catch(err) {
      console.error(`${err.message}`);
    }
  }
}

async function uploadFolder(inOut = 'out') {
  if (await openConnection(inOut)) {
    try {
      console.log(`[${csvPath}] --> [${getConfig(inOut).path}]`);
      console.log(`Upload folder SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      await sftp.uploadDir(csvPath, getConfig(inOut).path);
      await closeConnection(inOut);
    } catch (err) {
      console.error(`${err.message}`);
    }
  }
}

module.exports = {listFiles, downloadFile, uploadFile, downloadAll, uploadAll, downloadFolder, uploadFolder};