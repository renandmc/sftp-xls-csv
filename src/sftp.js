const Client = require('ssh2-sftp-client');
const utils = require('./utils');
const config = require('../config.json');

const configIn = config.host_in;
const pathIn = config.path_in;
const configOut = config.host_out;
const pathOut = config.path_out;
const xlsPath = config.xls_path;
const csvPath = config.csv_path;
const fileType = config.file_type;

const sftpIn = new Client();
const sftpOut = new Client(); 

async function listFiles(path = pathIn, options = fileType, type = 'in') {
  let res;
  if (type === 'out') {
    await sftpIn.connect(configIn);
    res = await sftpIn.list(path, options);
    await sftpIn.end();
  } else {
    await sftpOut.connect(configOut);
    res = await sftpOut.list(path, options);
    await sftpOut.end();
  }
  return res;
}

async function downloadFile(file) {
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