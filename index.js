const fs = require('fs');
const Client = require('ssh2-sftp-client');
const xlsx = require('node-xlsx');

const configIn = {
  host: '192.168.0.5',
  username: 'renan',
  password: '123'
};
const configOut = {
  host: '192.168.0.5',
  username: 'renan',
  password: '123'
};
const pathIn = '/home/renan/teste/xls';
const pathOut = '/home/renan/teste/csv';
const fileType = '*.xls';
const xlsPath = './xls';
const csvPath = './csv';
let sftpIn = new Client();
let sftpOut = new Client();

async function downloadAll() {
  console.log(`Downloading files from ${configIn.host}${pathIn}`);
  await sftpIn.connect(configIn);
  let listings = await sftpIn.list(pathIn, fileType);
  for (let item of listings) {
    if (item.type === '-') {
      let remoteFile = pathIn + '/' + item.name;
      let localFile = xlsPath + '/' + item.name;
      console.log(`--> Remote: ${remoteFile}`);
      console.log(`----> Local: ${localFile}`);
      console.log('');
      await sftpIn.fastGet(remoteFile, localFile);
    }
  }
  await sftpIn.end();
}

async function sendAll() {
  console.log(`Sending files to ${configOut.host}${pathOut}`);
  await sftpOut.connect(configOut);
  let files = listFiles(csvPath);
  for(let file of files) {
    let localFile = csvPath + '/' + file;
    let remoteFile = pathOut + '/' + file;
    console.log(`--> Local: ${localFile}`);
    console.log(`----> Remote: ${remoteFile}`);
    console.log('');
    await sftpOut.fastPut(localFile, remoteFile);
  }
  await sftpOut.end();
}

async function convert(xlsPath, csvPath) {
  let files = listFiles(xlsPath);
  for (let file of files) {
    let xlsFile = xlsPath + '/' + file;
    var obj = xlsx.parse(xlsFile); // parses a file
    var filename = file.replace('.xlsx', '').replace('.xls', '');
    var rows = [];
    var writeStr = "";
    // looping through all sheets
    for (var i = 0; i < obj.length; i++) {
      var sheet = obj[i];
      // loop through all rows in the sheet
      for (var j = 0; j < sheet['data'].length; j++) {
        // add the row to the rows array
        rows.push(sheet['data'][j]);
      }
    }
    // creates the csv string to write it to a file
    for (var i = 0; i < rows.length; i++) {
      writeStr += rows[i].join(",") + "\n";
    }
    // writes to a file, but you will presumably send the csv as a      
    // response instead
    let csvFile = csvPath + '/' + filename + '.csv';
    console.log(`--> [${file}]`);
    console.log(`----> [${csvFile}]`);
    console.log('');
    fs.writeFile(csvFile, writeStr, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  }
}

async function deleteFile(file) {
  await fs.unlink(file, (err) => {
    if (err) {
      return console.log(`${err}`);
    }
    console.log(`${file} deleted!`);
  });
}

function deleteFiles(path) {
  let files = listFiles(path);
  files.forEach(file => {
    deleteFile(path + '/' + file);
  });
}

function listFiles(path) {
  return fs.readdirSync(path);
}

async function main() {
  console.log('---------- DOWNLOAD ----------');
  await downloadAll();
  console.log('');
  console.log('---------- CONVERT ----------');
  await convert(xlsPath, csvPath);
  console.log('');
  console.log('---------- SEND ----------');
  ///await send(listFiles(csvPath));
  await sendAll();
}

main();