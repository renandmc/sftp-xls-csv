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
    logger.info(`Connecting to [${getConfig(inOut).host.host}]`);
    await sftp.connect(getConfig(inOut).host);
    logger.info(`Connected to ${getConfig(inOut).host.host}`);
  } catch (err) {
    logger.error(`${err.message}`);
  }
}

async function closeConnection(inOut = 'in') {
  try {
    logger.info(`Closing connection [${getConfig(inOut).host.host}]`);
    await sftp.end();
    logger.info(`Closed connection [${getConfig(inOut).host.host}]`);
  } catch (err) {
    logger.error(`${err.message}`);
  }
}

async function listFiles(inOut = 'in') {
  let res, options;
  options = `^.*\.(${fileType.toLowerCase()}|${fileType.toUpperCase()})`;
  await openConnection(inOut);
  try {
    logger.info(`Listing files in [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
    res = await sftp.list(getConfig(inOut).path, options);
    logger.info(`[${res.length}] files loaded from [${getConfig(inOut).host.host}${getConfig(inOut).path}]`);
    for (item of res) {
      logger.info(`${item.name}`);
    }
  } catch (err) {
    logger.error(`${err.message}`);
    res = [];
  }
  await closeConnection();
  return res;
}

async function downloadFile(file, inOut = 'in') {
  if (file.type === '-') {
    await openConnection(inOut);
    let remoteFile = getConfig(inOut).path + '/' + file.name;
    let localFile = xlsPath + '/' + file.name;
    logger.info(`Remote: [${remoteFile}] -> Local: [${localFile}]`);
    try {
      logger.info(`Downloading [${getConfig(inOut).host.host}${remoteFile}]`);
      await sftp.fastGet(remoteFile, localFile);
      logger.info(`Downloaded [${getConfig(inOut).host.host}${remoteFile}]`);
    } catch (err) {
      logger.error(`${err.message}`);
    }
    await closeConnection(inOut); 
  } else {
    logger.error(`Param 'file' wrong, must be a file`);
  }
}

async function uploadFile(file, inOut = 'out') {
  await openConnection(inOut);
  let localFile = csvPath + '/' + file;
  let remoteFile = getConfig(inOut).path + '/' + file;
  logger.info(`Local: [${localFile}] -> Remote: [${remoteFile}]`);
  try {
    logger.info(`Uploading [${getConfig(inOut).host.host}${remoteFile}]`);
    await sftp.fastPut(localFile, remoteFile);
    logger.info(`Uploaded [${getConfig(inOut).host.host}${remoteFile}]`);
  } catch (err) {
    logger.error(`${err.message}`);
  }
  await closeConnection(inOut);
}

async function downloadAll(inOut = 'in') {
  let files = await listFiles(inOut);
  for (let file of files) {
    await downloadFile(file, inOut);
  }
}

async function uploadAll(inOut = 'out') {
  let files = utils.listFiles(csvPath);
  for (let file of files) {
    await uploadFile(file, inOut);
  }
}

async function main() {
  await downloadAll();
  await uploadAll();
}

module.exports = {listFiles, downloadFile, uploadFile, downloadAll, uploadAll};