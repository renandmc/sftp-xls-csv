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
  let res = [], options, connection;
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
  }
  await closeConnection();
  return res;
}

async function downloadFile(file, inOut = 'in') {
  await openConnection(inOut);

  await sftpIn.connect(configIn);
  if (file.type === '-') {
    let remoteFile = pathIn + '/' + file.name;
    let localFile = xlsPath + '/' + file.name;
    console.log(`--> Remote: ${remoteFile}`);
    console.log(`----> Local: ${localFile}`);
    console.log('');
    await sftpIn.fastGet(remoteFile, localFile);
  }
  await sftpIn.end();
}

async function uploadFile(file) {
  await sftpOut.connect(configOut);
  let localFile = csvPath + '/' + file;
  let remoteFile = pathOut + '/' + file;
  console.log(`--> Local: ${localFile}`);
  console.log(`----> Remote: ${remoteFile}`);
  console.log('');
  await sftpOut.fastPut(localFile, remoteFile);
  await sftpOut.end();
}

async function downloadAll() {
  let files = await listFiles(pathIn, fileType, 'in');
  for (let file of files) {
    await downloadFile(file);
  }
}

async function uploadAll() {
  let files = utils.listFiles(csvPath);
  for (let file of files) {
    await uploadFile(file);
  }
}

async function main() {
  await downloadAll();
  await uploadAll();
}

module.exports = {listFiles, downloadFile, uploadFile, downloadAll, uploadAll};