const sftp = require('./src/sftp');
const xlsCsv = require('./src/xls-csv');
const utils = require('./src/utils');
const logger = require('./src/log');

const config = require('./config.json');

async function execAll() {
  logger.info('Start -> [all]');
  console.time('all');
  logger.info('DOWNLOAD');
  await sftp.downloadAll();
  logger.info('CONVERT');
  xlsCsv.convertAll();
  logger.info('UPLOAD');
  await sftp.uploadAll();
  logger.info('DELETE');
  utils.deleteAll(`${config.xlsfolder}`);
  utils.deleteAll(`${config.csvfolder}`);
  console.timeEnd('all');
  logger.info('End -> [all]');
}

async function execOne() {
  logger.info('Start -> [one]');
  console.time('one');
  let files = await sftp.listFiles();
  if (files.length > 0) {
    for (let file of files) {
      logger.info('DOWNLOAD');
      await sftp.downloadFile(file);
      logger.info('CONVERT');
      let csv = xlsCsv.convertFile(file.name);
      csv = (await csv).replace(config.csvfolder + '/', '');
      logger.info('UPLOAD');
      await sftp.uploadFile(csv);
      logger.info('DELETE');
      utils.deleteFile(`${config.xlsfolder}/${file.name}`);
      utils.deleteFile(`${config.csvfolder}/${csv}`);
    }
  } else {
    logger.error('Files not found');
  }
  console.timeEnd('one');
  logger.info('End -> [one]');
}

async function execFolder() {
  logger.info('Start -> [folder]');
  console.time('folder');
  logger.info('DOWNLOAD');
  await sftp.downloadFolder();
  logger.info('CONVERT');
  xlsCsv.convertAll();
  logger.info('UPLOAD');
  await sftp.uploadFolder();
  logger.info('DELETE');
  utils.deleteAll(`${config.xlsfolder}`);
  utils.deleteAll(`${config.csvfolder}`);
  console.timeEnd('folder');
  logger.info('End -> [folder]');
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