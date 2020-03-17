const sftp = require('./src/sftp');
const xlsCsv = require('./src/xls-csv');
const utils = require('./src/utils');

const config = require('./config.json');

async function execAll() {
  console.log('Start -> [all]');
  console.time('all');
  let files = await sftp.listFiles();
  if (files.length > 0){
    console.log('DOWNLOAD');
    await sftp.downloadAll();
    console.log('CONVERT');
    xlsCsv.convertAll();
    console.log('UPLOAD');
    await sftp.uploadAll();
    console.log('DELETE');
    utils.deleteAll(`${config.xlsfolder}`);
    utils.deleteAll(`${config.csvfolder}`);
  } else {
    console.error('Files not found.');
  }
  console.timeEnd('all');
  console.log('End -> [all]');
}

async function execOne() {
  console.log('Start -> [one]');
  console.time('one');
  let files = await sftp.listFiles();
  if (files.length > 0) {
    for (let file of files) {
      console.log('DOWNLOAD');
      await sftp.downloadFile(file);
      console.log('CONVERT');
      let csv = xlsCsv.convertFile(file.name);
      csv = (await csv).replace(config.csvfolder + '/', '');
      console.log('UPLOAD');
      await sftp.uploadFile(csv);
      console.log('DELETE');
      utils.deleteFile(`${config.xlsfolder}/${file.name}`);
      utils.deleteFile(`${config.csvfolder}/${csv}`);
    }
  } else {
    console.error('Files not found.');
  }
  console.timeEnd('one');
  console.log('End -> [one]');
}

async function execFolder() {
  console.log('Start -> [folder]');
  console.time('folder');
  let files = await sftp.listFiles();
  if (files.length > 0){
    console.log('DOWNLOAD');
    await sftp.downloadFolder();
    console.log('CONVERT');
    xlsCsv.convertAll();
    console.log('UPLOAD');
    await sftp.uploadFolder();
    console.log('DELETE');
    utils.deleteAll(`${config.xlsfolder}`);
    utils.deleteAll(`${config.csvfolder}`);
  } else {
    console.error('Files not found');
  }
  console.timeEnd('folder');
  console.log('End -> [folder]');
} 

function execute(options = 'all') {
  if (options === 'one') {
    execOne();
  } else if (options === 'all') {
    execAll();
  } else if (options === 'folder') {
    execFolder();
  }
}

module.exports = {execute};