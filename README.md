# sftp-xls-csv

Projeto em node que realiza download de arquivos XLS via SFTP, converte para CSV e faz o upload via SFTP.

## Instruções instalação

```js
npm install
```

## Instruções execução

Modo console, definir modo execução no arquivo **config.json**:
```js
node index.js
```
Modo browser: 
```js
node server.js
```
acessar (http://localhost:3000)

## Configurações

As configurações encontram-se no arquivo **config.json**.

## Dependências

[ssh2-sftp-client](https://github.com/theophilusx/ssh2-sftp-client)

[xlsx](https://github.com/mgcrea/node-xlsx)

[winston](https://github.com/winstonjs/winston)