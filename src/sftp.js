const fs = require('fs');
const Client = require('ssh2-sftp-client');
const utils = require('./utils');
const logger = require('./log');

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
    logger.info(`Connect SFTP [${getConfig(inOut).host.host}]`);
    await sftp.connect(getConfig(inOut).host);
    return true;
  } catch (err) {
    logger.error(`${err.message}`);
    return false;
  }
}

async function closeConnection(inOut = 'in') {
  try {
    logger.info(`Close SFTP [${getConfig(inOut).host.host}]`);
    await sftp.end();
    return true;
  } catch (err) {
    logger.error(`${err.message}`);
    return false;
  }
}

async function listFiles(inOut = 'in') {
  let res = [], options;
  options = `^.*\.(${fileType.toLowerCase()}|${fileType.toUpperCase()})$`;
  console.log(options);
  if (await openConnection(inOut)) {
    try {
      logger.info(`List files SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      res = await sftp.list(getConfig(inOut).path, options);
      if (res.length === 0) {
        logger.error(`Files not found [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      } else {
        logger.info(`[${res.length}] file(s) loaded [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
        for (item of res) {
          logger.info(`${item.name}`);
        }
      }
    } catch (err) {
      logger.error(`${err.message}`);
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
      logger.info(`Remote [${remoteFile}] --> Local [${localFile}]`);
      try {
        logger.info(`Download SFTP [${getConfig(inOut).host.host}${remoteFile}]`);
        await sftp.fastGet(remoteFile, localFile);
      } catch (err) {
        logger.error(`${err.message}`);
      }
      await closeConnection(inOut); 
    } else {
      logger.error(`Param 'file' wrong, must be a file`);
    }
  }  
}

async function uploadFile(file, inOut = 'out') {
  if (await openConnection(inOut)) {
    let localFile = csvPath + '/' + file;
    let remoteFile = getConfig(inOut).path + '/' + file;
    logger.info(`Local [${localFile}] --> Remote [${remoteFile}]`);
    try {
      logger.info(`Upload SFTP [${getConfig(inOut).host.host}${remoteFile}]`);
      await sftp.fastPut(localFile, remoteFile);
    } catch (err) {
      logger.error(`${err.message}`);
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
    logger.error('Files not found');
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
    logger.error('Files not found');
    return false;
  }
}

async function downloadFolder(inOut = 'in') {
  if (await openConnection(inOut)) {
    try {
      logger.info(`[${getConfig(inOut).path}] --> [${xlsPath}]`);
      logger.info(`Download folder SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      await sftp.downloadDir(getConfig(inOut).path, xlsPath);
      await closeConnection(inOut);
    } catch(err) {
      logger.error(`${err.message}`);
    }
  }
}

async function uploadFolder(inOut = 'out') {
  if (await openConnection(inOut)) {
    try {
      logger.info(`[${csvPath}] --> [${getConfig(inOut).path}]`);
      logger.info(`Upload folder SFTP [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
      await sftp.uploadDir(csvPath, getConfig(inOut).path);
      await closeConnection(inOut);
    } catch (err) {
      logger.error(`${err.message}`);
    }
  }
}

module.exports = {listFiles, downloadFile, uploadFile, downloadAll, uploadAll, downloadFolder, uploadFolder};