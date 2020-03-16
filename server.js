const fs = require('fs');
const express = require('express');
const config = require('./config.json');
const index = require('./index');

const app = express();

if (!fs.existsSync(config.xlsfolder)) {
  fs.mkdirSync(config.xlsfolder);
}
if (!fs.existsSync(config.csvfolder)) {
  fs.mkdirSync(config.csvfolder);
}

app.get('/', (req, res) => {
  res.send('/all to exec all\n/one to exec one\n/folder to exec folder');
});

app.get('/all', (req, res) => {
  index.execute('all');
  res.send('Executing [all]...');  
});

app.get('/one', (req, res) => {
  index.execute('one');
  res.send('Executing [one]...');
});

app.get('/folder', (req, res) => {
  index.execute('folder');
  res.send('Executing [folder]...');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('APP listening on port ' + port));