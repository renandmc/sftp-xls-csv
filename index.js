const sftp = require('./src/sftp');
const xlsCsv = require('./src/xls-csv');
const utils = require('./src/utils');
const logger = require('./src/log');

const config = require('./config.json');

async function execute(options = 'all') {
  if (options === 'one') {
    logger.info('Execution One by one');
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
        utils.deleteFile(`./xls/${file.name}`);
        utils.deleteFile(`./csv/${csv}`);
      }
    } else {
      logger.error('Files not found');
    }
  } else if (options === 'all') {
    console.log('Execution all at once');
    console.log('DOWNLOAD');
    await sftp.downloadAll();
    console.log('CONVERT');
    xlsCsv.convertAll();
    console.log('UPLOAD');
    await sftp.uploadAll();
    console.log('DELETE');
    utils.deleteAll('./xls');
    utils.deleteAll('./csv');
  }
}

execute(config.exec);