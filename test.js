const SFTP = require('ssh2-sftp');
const fs = require('fs');

const configIn = {
  'host': '192.168.0.103',
  'username': 'natan',
  'password': 'natan',
  'privateKey': fs.readFileSync('/.ssh/id_rsa')
};
var clientIn = new SFTP(configIn);
clientIn.connect(() => {
  let options = {
    source: '*.xls',
    localPath: './files',
    remotePath: ''
  }
});

const configOut = {
  'host': 'localhost',
  'port': 2222,
  'user': 'renan',
  'password': '123',
  'privateKey': fs.readFileSync('/.ssh/id_rsa')
};
var clientOut = new SFTP(configOut);
clientOut.connect(() => {

});