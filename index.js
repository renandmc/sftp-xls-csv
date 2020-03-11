const sftp = require('./src/sftp');
const xlsCsv = require('./src/xls-csv');
const utils = require('./src/utils');
const config = require('./config.json');

async function execute(options = 'all') {
  if (options === 'one') {
    let files = await sftp.listFiles();
    /*
    for (let file of files) {
      console.log(`Download ${file.name}`);
      await sftp.downloadFile(file);
      console.log(`Convert ${file.name}`);
      let csv = xlsCsv.convertFile(file.name);
      csv = (await csv).replace(config.csv_path + '/', '');
      console.log(`Upload ${csv}`);
      await sftp.uploadFile(csv);
      utils.deleteFile(`./xls/${file.name}`);
      utils.deleteFile(`./csv/${csv}`);
    }
    */
  } else if (options === 'all') {
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